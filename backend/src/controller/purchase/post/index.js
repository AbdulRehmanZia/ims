import prisma from "../../../db/db.js";
import ApiError from "../../../utils/ApiError.js";
import ApiResponse from "../../../utils/ApiResponse.js";
import { getOrCreateCashAccount } from "../../ledger/index.js";

// Create a purchase from supplier
export const addPurchase = async (req, res) => {
  try {
    const userId = req.user.id;
    const { supplierAccountId, items, description, paymentType } = req.body;

    if (!supplierAccountId || !Array.isArray(items) || items.length === 0) {
      return ApiError(res, 400, "Supplier account and items are required");
    }

    if (!paymentType || !["CASH", "CREDIT"].includes(paymentType)) {
      return ApiError(res, 400, "Payment type must be CASH or CREDIT");
    }

    const supplierAccount = await prisma.ledgerAccount.findFirst({
      where: {
        id: Number(supplierAccountId),
        type: "SUPPLIER",
        isDeleted: false,
      },
    });

    if (!supplierAccount) {
      return ApiError(res, 404, "Supplier account not found");
    }

    const productIds = items.map((i) => i.productId);
    let totalAmount = 0;

    const purchase = await prisma.$transaction(async (tx) => {
      // Fetch products
      const products = await tx.product.findMany({
        where: { id: { in: productIds }, isDeleted: false },
        select: { id: true, name: true, costPrice: true },
      });

      if (products.length !== productIds.length) {
        throw new Error("Some products are missing or deleted");
      }

      const productMap = new Map(products.map((p) => [p.id, p]));

      // Calculate total amount
      for (const item of items) {
        const product = productMap.get(item.productId);
        const itemCost = item.costPrice || product.costPrice;
        totalAmount += itemCost * item.quantity;

        // Update product stock and cost price
        await tx.product.update({
          where: { id: item.productId },
          data: {
            stockQuantity: { increment: item.quantity },
            costPrice: itemCost, // Update cost price
          },
        });
      }

      // Create ledger entries
      if (paymentType === "CREDIT") {
        // Credit purchase: Supplier ledger gets credit (you owe supplier)
        await tx.ledgerEntry.create({
          data: {
            accountId: supplierAccount.id,
            description: description || `Purchase from ${supplierAccount.name}`,
            debit: 0,
            credit: totalAmount,
            refType: "PURCHASE",
            refId: null,
          },
        });
      } else {
        // Cash purchase: Cash ledger gets credit (money goes out), Supplier ledger gets nothing
        const cashAccount = await getOrCreateCashAccount(tx);
        await tx.ledgerEntry.create({
          data: {
            accountId: cashAccount.id,
            description: description || `Purchase from ${supplierAccount.name}`,
            debit: 0,
            credit: totalAmount,
            refType: "PURCHASE",
            refId: null,
          },
        });
      }

      return { totalAmount, supplierAccount };
    });

    return ApiResponse(res, 201, purchase, "Purchase recorded successfully");
  } catch (error) {
    console.error("Purchase creation error:", error);
    return ApiError(res, 500, "Internal Server Error", error);
  }
};

