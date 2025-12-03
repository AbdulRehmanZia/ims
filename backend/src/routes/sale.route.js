import { Router } from "express";

import { verifyJWT } from "../middleware/authMiddleware.js";
import authorizeRole from "../middleware/authorizeRoles.js";
import { addSale, deleteSale, getSales } from "../controller/sale/index.js";
const router = Router();

router.get("/",verifyJWT, getSales);
router.post("/add-sale",verifyJWT, addSale);

router.put(
  "/delete-sale/:id",
  verifyJWT,
  authorizeRole("admin"),
  deleteSale
);

export default router;
