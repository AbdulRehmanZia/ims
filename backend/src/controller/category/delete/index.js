import prisma from "../../../db/db.js";
import ApiError from "../../../utils/ApiError.js";
import ApiResponse from "../../../utils/ApiResponse.js";

// Delete Category (soft delete)
export const deleteCategory = async (req, res) => {
  try {
    const categoryId = req.params.id;
    const userId = req.user.id;

    const categoryExist = await prisma.category.findUnique({
      where: { id: Number(categoryId) },
    });

    if (!categoryExist || categoryExist.isDeleted) {
      return ApiError(res, 404, null, "Category not found");
    }

    await prisma.$transaction(async (tx) => {
      await tx.product.updateMany({
        where: { categoryId: Number(categoryId) },
        data: { isDeleted: true },
      });

      await tx.category.update({
        where: { id: Number(categoryId) },
        data: { isDeleted: true },
      });
    });

    return ApiResponse(res, 200, null, "Category deleted successfully (soft)");
  } catch (error) {
    console.error("Error in deleteCategory:", error);
    return ApiError(res, 500, error.message || "Internal Server Error");
  }
};
