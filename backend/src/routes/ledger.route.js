import { Router } from "express";
import { verifyJWT } from "../middleware/authMiddleware.js";
import {
  getCashLedger,
  listPartyAccounts,
  getAccountLedger,
  createLedgerEntry,
  createLedgerAccount,
  recordCustomerPayment,
  recordSupplierPayment,
} from "../controller/ledger/index.js";

const router = Router();

// Cash ledger
router.get(
  "/cash",
  verifyJWT,
  getCashLedger
);

// List customer or supplier accounts with balances
router.get(
  "/accounts/:type",
  verifyJWT,
  listPartyAccounts
);

// Ledger for specific account (customer/supplier)
router.get(
  "/accounts/:accountId/entries",
  verifyJWT,
  getAccountLedger
);

// Manual ledger entry (for any account)
router.post(
  "/entries",
  verifyJWT,
  createLedgerEntry
);

// Create new ledger account (Customer or Supplier)
router.post(
  "/accounts",
  verifyJWT,
  createLedgerAccount
);

// Record customer payment (settling credit)
router.post(
  "/payments/customer",
  verifyJWT,
  recordCustomerPayment
);

// Record supplier payment (settling credit)
router.post(
  "/payments/supplier",
  verifyJWT,
  recordSupplierPayment
);

export default router;


