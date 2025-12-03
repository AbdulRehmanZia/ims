import { Router } from "express";
import { verifyJWT } from "../middleware/authMiddleware.js";
import authorizeRole from "../middleware/authorizeRoles.js";
import { addPurchase } from "../controller/purchase/index.js";

const router = Router();

router.post(
  "/add-purchase",
  verifyJWT,
  authorizeRole("admin"),
  addPurchase
);

export default router;

