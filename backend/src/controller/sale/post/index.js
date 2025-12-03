import prisma from "../../../db/db.js";
import ApiError from "../../../utils/ApiError.js";
import ApiResponse from "../../../utils/ApiResponse.js";
import { getOrCreateCashAccount } from "../../ledger/index.js";

export const addSale = async (req, res) => {
  try {
    const userId = req.user.id;
    const { paymentType, items, customerName, customerEmail, customerPhone, customerAccountId } = req.body;

    // Basic validation
    if (!paymentType || !Array.isArray(items) || items.length === 0) {
      return ApiError(res, 400, "Invalid Sale Data");
    }

    for (const item of items) {
      if (!item.productId || item.quantity <= 0) {
        return ApiError(res, 400, "Invalid product data in items");
      }
    }

    const productIds = items.map((i) => i.productId);

    const sale = await prisma.$transaction(async (tx) => {
      // Fetch all products in one query
      const products = await tx.product.findMany({
        where: { id: { in: productIds }, isDeleted: false },
        select: { id: true, price: true, stockQuantity: true, name: true },
      });

      if (products.length !== productIds.length) {
        throw new Error("Some products are missing or deleted");
      }

      const productMap = new Map(products.map((p) => [p.id, p]));
      let totalAmount = 0;
      const saleItemData = [];

      for (const item of items) {
        const product = productMap.get(item.productId);
        if (product.stockQuantity < item.quantity) {
          throw new Error(`Insufficient stock for ${product.name}`);
        }

        totalAmount += product.price * item.quantity;

        saleItemData.push({
          productId: item.productId,
          quantity: item.quantity,
          priceAtSale: product.price,
        });
      }

      // 🔹 Bulk stock update in one go using Promise.all (still safe)
      const updates = items.map((item) =>
        tx.product.updateMany({
          where: { id: item.productId, stockQuantity: { gte: item.quantity } },
          data: { stockQuantity: { decrement: item.quantity } },
        })
      );

      const results = await Promise.all(updates);

      // Check if any stock update failed
      results.forEach((r, idx) => {
        if (r.count === 0) {
          const product = productMap.get(items[idx].productId);
          throw new Error(`Stock update failed for ${product.name}`);
        }
      });

      // Handle customer account for credit sales
      let finalCustomerAccountId = customerAccountId ? Number(customerAccountId) : null;
      
      if (paymentType === "CREDIT") {
        if (!finalCustomerAccountId && customerName) {
          // Try to find or create customer account
          let customerAccount = await tx.ledgerAccount.findFirst({
            where: {
              type: "CUSTOMER",
              name: customerName.trim(),
              isDeleted: false,
            },
          });

          if (!customerAccount) {
            // Create customer account on the fly
            customerAccount = await tx.ledgerAccount.create({
              data: {
                name: customerName.trim(),
                type: "CUSTOMER",
                contactName: customerName.trim(),
                contactEmail: customerEmail || null,
                contactPhone: customerPhone || null,
              },
            });
          }
          finalCustomerAccountId = customerAccount.id;
        }

        if (!finalCustomerAccountId) {
          throw new Error("Customer account is required for credit sales");
        }
      }

      // Create the sale and saleItems
      const createdSale = await tx.sale.create({
        data: {
          userId,
          paymentType,
          totalAmount,
          customerName,
          customerEmail,
          customerPhone,
          customerAccountId: finalCustomerAccountId,
          saleItems: { create: saleItemData },
        },
        include: { saleItems: { include: { product: true } } },
      });

      // 🔹 Ledger posting based on payment type
      if (paymentType === "CREDIT" && finalCustomerAccountId) {
        // Credit sale: Customer ledger gets debit (customer owes), Cash gets nothing
        await tx.ledgerEntry.create({
          data: {
            accountId: finalCustomerAccountId,
            description: `Credit Sale #${createdSale.id}`,
            debit: totalAmount,
            credit: 0,
            refType: "SALE",
            refId: createdSale.id,
          },
        });
      } else {
        // Cash/Card sale: Cash ledger gets debit (money received)
        const cashAccount = await getOrCreateCashAccount(tx);
        await tx.ledgerEntry.create({
          data: {
            accountId: cashAccount.id,
            description: `Sale #${createdSale.id} (${paymentType})`,
            debit: totalAmount,
            credit: 0,
            refType: "SALE",
            refId: createdSale.id,
          },
        });
      }

      return createdSale;
    });

    return ApiResponse(res, 201, sale, "Sale Generated Successfully");
  } catch (error) {
    console.error("Sale creation error:", error);

    if (error.message?.includes("Insufficient stock") || error.message?.includes("Stock update failed")) {
      return ApiError(res, 409, error.message);
    }

    if (error.message?.includes("missing or deleted") || error.message?.includes("not found")) {
      return ApiError(res, 400, error.message);
    }

    return ApiError(res, 500, "Internal Server Error", error);
  }
};
