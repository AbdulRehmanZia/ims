import prisma from "../../../db/db.js";
import ApiError from "../../../utils/ApiError.js";
import ApiResponse from "../../../utils/ApiResponse.js";

// Helper to get or create the single Cash account
export const getOrCreateCashAccount = async (tx = prisma) => {
  let account = await tx.ledgerAccount.findFirst({
    where: {
      type: "CASH",
      isDeleted: false,
    },
  });

  if (!account) {
    account = await tx.ledgerAccount.create({
      data: {
        type: "CASH",
        name: "Cash",
      },
    });
  }

  return account;
};

// Generic endpoint to create a manual ledger entry
export const createLedgerEntry = async (req, res) => {
  try {
    const { accountId, date, description, debit = 0, credit = 0, refType, refId } = req.body;

    if (!accountId) {
      return ApiError(res, 400, null, "accountId is required");
    }

    if (!description) {
      return ApiError(res, 400, null, "description is required");
    }

    if ((!debit && !credit) || (debit && credit)) {
      return ApiError(res, 400, null, "Either debit or credit must be provided (not both)");
    }

    const account = await prisma.ledgerAccount.findFirst({
      where: {
        id: Number(accountId),
        isDeleted: false,
      },
    });

    if (!account) {
      return ApiError(res, 404, null, "Ledger account not found");
    }

    const entry = await prisma.ledgerEntry.create({
      data: {
        accountId: account.id,
        date: date ? new Date(date) : undefined,
        description,
        debit: debit ? Number(debit) : 0,
        credit: credit ? Number(credit) : 0,
        refType,
        refId: refId ? Number(refId) : null,
      },
    });

    return ApiResponse(res, 201, entry, "Ledger entry created successfully");
  } catch (error) {
    console.error("Error in createLedgerEntry:", error);
    return ApiError(res, 500, null, "Internal Server Error");
  }
};

// Create a new ledger account (Customer or Supplier)
export const createLedgerAccount = async (req, res) => {
  try {
    const { name, type, contactName, contactEmail, contactPhone } = req.body;

    if (!name || !type) {
      return ApiError(res, 400, null, "Name and type are required");
    }

    if (!["CUSTOMER", "SUPPLIER"].includes(type)) {
      return ApiError(res, 400, null, "Type must be either CUSTOMER or SUPPLIER");
    }

    // Check if account with same name and type already exists
    const existingAccount = await prisma.ledgerAccount.findFirst({
      where: {
        name: name.trim(),
        type,
        isDeleted: false,
      },
    });

    if (existingAccount) {
      return ApiError(res, 400, null, `A ${type.toLowerCase()} account with this name already exists`);
    }

    const account = await prisma.ledgerAccount.create({
      data: {
        name: name.trim(),
        type,
        contactName: contactName?.trim() || null,
        contactEmail: contactEmail?.trim() || null,
        contactPhone: contactPhone?.trim() || null,
      },
    });

    return ApiResponse(res, 201, account, `${type} account created successfully`);
  } catch (error) {
    console.error("Error in createLedgerAccount:", error);
    return ApiError(res, 500, null, "Internal Server Error");
  }
};

// Record customer payment (settling credit)
export const recordCustomerPayment = async (req, res) => {
  try {
    const { accountId, amount, description, date } = req.body;

    if (!accountId || !amount) {
      return ApiError(res, 400, null, "Account ID and amount are required");
    }

    const account = await prisma.ledgerAccount.findFirst({
      where: {
        id: Number(accountId),
        type: "CUSTOMER",
        isDeleted: false,
      },
    });

    if (!account) {
      return ApiError(res, 404, null, "Customer account not found");
    }

    const paymentAmount = Number(amount);

    const result = await prisma.$transaction(async (tx) => {
      const cashAccount = await getOrCreateCashAccount(tx);

      // Customer ledger: Credit (reduces what they owe)
      await tx.ledgerEntry.create({
        data: {
          accountId: account.id,
          description: description || `Payment received from ${account.name}`,
          debit: 0,
          credit: paymentAmount,
          refType: "PAYMENT",
          refId: null,
          date: date ? new Date(date) : undefined,
        },
      });

      // Cash ledger: Debit (money received)
      await tx.ledgerEntry.create({
        data: {
          accountId: cashAccount.id,
          description: description || `Payment from ${account.name}`,
          debit: paymentAmount,
          credit: 0,
          refType: "PAYMENT",
          refId: null,
          date: date ? new Date(date) : undefined,
        },
      });

      return { account, amount: paymentAmount };
    });

    return ApiResponse(res, 201, result, "Customer payment recorded successfully");
  } catch (error) {
    console.error("Error in recordCustomerPayment:", error);
    return ApiError(res, 500, null, "Internal Server Error");
  }
};

// Record supplier payment (settling credit)
export const recordSupplierPayment = async (req, res) => {
  try {
    const { accountId, amount, description, date } = req.body;

    if (!accountId || !amount) {
      return ApiError(res, 400, null, "Account ID and amount are required");
    }

    const account = await prisma.ledgerAccount.findFirst({
      where: {
        id: Number(accountId),
        type: "SUPPLIER",
        isDeleted: false,
      },
    });

    if (!account) {
      return ApiError(res, 404, null, "Supplier account not found");
    }

    const paymentAmount = Number(amount);

    const result = await prisma.$transaction(async (tx) => {
      const cashAccount = await getOrCreateCashAccount(tx);

      // Supplier ledger: Debit (reduces what you owe)
      await tx.ledgerEntry.create({
        data: {
          accountId: account.id,
          description: description || `Payment to ${account.name}`,
          debit: paymentAmount,
          credit: 0,
          refType: "PAYMENT",
          refId: null,
          date: date ? new Date(date) : undefined,
        },
      });

      // Cash ledger: Credit (money goes out)
      await tx.ledgerEntry.create({
        data: {
          accountId: cashAccount.id,
          description: description || `Payment to ${account.name}`,
          debit: 0,
          credit: paymentAmount,
          refType: "PAYMENT",
          refId: null,
          date: date ? new Date(date) : undefined,
        },
      });

      return { account, amount: paymentAmount };
    });

    return ApiResponse(res, 201, result, "Supplier payment recorded successfully");
  } catch (error) {
    console.error("Error in recordSupplierPayment:", error);
    return ApiError(res, 500, null, "Internal Server Error");
  }
};


