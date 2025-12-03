import prisma from "../../../db/db.js";
import ApiError from "../../../utils/ApiError.js";
import ApiResponse from "../../../utils/ApiResponse.js";

// Update Category
export const updateCategory = async (req, res) => {
  try {
    const categoryId = Number(req.params.id);
    const userId = req.user.id;
    const { name } = req.body;

    if (!name) return ApiError(res, 400, "Name is required");

    const categoryExist = await prisma.category.findUnique({
      where: { id: categoryId },
    });

    if (!categoryExist || categoryExist.isDeleted) {
      return ApiError(res, 404, null, "Category not found");
    }

    const normalizedName = name.trim().toLowerCase();

    // Check duplicate
    const existingCategory = await prisma.category.findFirst({
      where: {
        name: normalizedName,
        NOT: { id: categoryId },
        isDeleted: false,
      },
    });

    if (existingCategory) {
      return ApiError(res, 400, "This category already exists");
    }

    const updatedCategory = await prisma.category.update({
      where: { id: categoryId },
      data: { name: normalizedName },
    });

    return ApiResponse(
      res,
      200,
      updatedCategory,
      "Category updated successfully"
    );
  } catch (error) {
    console.error("Error in updateCategory:", error);
    return ApiError(res, 500, "Internal Server Error", error);
  }
};
