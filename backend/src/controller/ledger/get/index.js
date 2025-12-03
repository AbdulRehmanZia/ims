import prisma from "../../../db/db.js";
import ApiError from "../../../utils/ApiError.js";
import ApiResponse from "../../../utils/ApiResponse.js";

// Utility: calculate running balance on the fly
const attachRunningBalance = (entries) => {
  let balance = 0;
  return entries.map((e) => {
    balance += e.debit - e.credit;
    return { ...e, balance };
  });
};

// Cash ledger
export const getCashLedger = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const cashAccount = await prisma.ledgerAccount.findFirst({
      where: { type: "CASH", isDeleted: false },
    });

    if (!cashAccount) {
      return ApiResponse(res, 200, { entries: [], openingBalance: 0 }, "No cash ledger yet");
    }

    const whereClause = {
      accountId: cashAccount.id,
    };

    if (startDate && endDate) {
      whereClause.date = {
        gte: new Date(startDate),
        lte: new Date(new Date(endDate).setHours(23, 59, 59, 999)),
      };
    }

    const entries = await prisma.ledgerEntry.findMany({
      where: whereClause,
      orderBy: { date: "asc" },
    });

    const withBalance = attachRunningBalance(entries);

    return ApiResponse(
      res,
      200,
      {
        account: cashAccount,
        entries: withBalance,
      },
      "Cash ledger fetched successfully"
    );
  } catch (error) {
    console.error("Error in getCashLedger:", error);
    return ApiError(res, 500, null, "Internal Server Error");
  }
};

// List customer or supplier accounts with current balance
export const listPartyAccounts = async (req, res) => {
  try {
    const { type } = req.params; // "CUSTOMER" or "SUPPLIER"

    if (!["CUSTOMER", "SUPPLIER"].includes(type)) {
      return ApiError(res, 400, null, "Invalid account type");
    }

    const accounts = await prisma.ledgerAccount.findMany({
      where: {
        type,
        isDeleted: false,
      },
      include: {
        entries: true,
      },
      orderBy: { name: "asc" },
    });

    const result = accounts.map((account) => {
      const balance = account.entries.reduce(
        (sum, e) => sum + e.debit - e.credit,
        0
      );
      const { entries, ...rest } = account;
      return { ...rest, balance };
    });

    return ApiResponse(
      res,
      200,
      result,
      `${type} accounts fetched successfully`
    );
  } catch (error) {
    console.error("Error in listPartyAccounts:", error);
    return ApiError(res, 500, null, "Internal Server Error");
  }
};

// Ledger entries for a specific customer/supplier account
export const getAccountLedger = async (req, res) => {
  try {
    const { accountId } = req.params;

    const account = await prisma.ledgerAccount.findFirst({
      where: {
        id: Number(accountId),
        isDeleted: false,
      },
    });

    if (!account) {
      return ApiError(res, 404, null, "Ledger account not found");
    }

    const entries = await prisma.ledgerEntry.findMany({
      where: {
        accountId: account.id,
      },
      orderBy: { date: "asc" },
    });

    const withBalance = attachRunningBalance(entries);

    return ApiResponse(
      res,
      200,
      { account, entries: withBalance },
      "Ledger fetched successfully"
    );
  } catch (error) {
    console.error("Error in getAccountLedger:", error);
    return ApiError(res, 500, null, "Internal Server Error");
  }
};


