import prisma from "../../../db/db.js";
import ApiError from "../../../utils/ApiError.js";
import ApiResponse from "../../../utils/ApiResponse.js";

// Add Category
export const addCategory = async (req, res) => {
  try {
    let { name } = req.body;

    if (!name) return ApiError(res, 400, null, "Name is required");

    name = name.trim().toLowerCase();

    const existingCategory = await prisma.category.findFirst({
      where: {
        name,
      },
    });

    if (existingCategory) {
      if (!existingCategory.isDeleted) {
        return ApiError(res, 400, null, "This category already exists");
      } else {
        const restoredCategory = await prisma.category.update({
          where: { id: existingCategory.id },
          data: { isDeleted: false },
        });
        return ApiResponse(res, 200, restoredCategory, "Category restored successfully");
      }
    }

    const newCategory = await prisma.category.create({
      data: {
        name,
      },
    });

    return ApiResponse(res, 201, newCategory, "Category created successfully");
  } catch (error) {
    console.error("Error in addCategory:", error);
    return ApiError(res, 500, null, "Internal Server Error");
  }
};
