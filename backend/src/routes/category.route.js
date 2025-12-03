import { Router } from "express";
import { verifyJWT } from "../middleware/authMiddleware.js";
import authorizeRole from "../middleware/authorizeRoles.js";
import {
  addCategory,
  deleteCategory,
  getAllCategories,
  updateCategory,
} from "../controller/category/index.js";
const router = Router();

router.get("/", verifyJWT, getAllCategories);
router.post("/add-category", verifyJWT, authorizeRole("admin"), addCategory);
router.put(
  "/update-category/:id",
  verifyJWT,
  authorizeRole("admin"),
  updateCategory
);
router.delete(
  "/delete-category/:id",
  verifyJWT,
  authorizeRole("admin"),
  deleteCategory
);

export default router;
