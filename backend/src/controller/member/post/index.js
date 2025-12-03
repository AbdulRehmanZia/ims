import prisma from "../../../db/db.js";
import ApiError from "../../../utils/ApiError.js";
import ApiResponse from "../../../utils/ApiResponse.js";
import { sendEmail, generateEmailTemplate } from "../../../services/email.service.js";
import { registerMemberValidation } from "../../../utils/validationSchema.js";

// Register Member
export const addStoreMember = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return ApiError(res, 403, "Only Admin Can Add Members");
    }

    const { error } = registerMemberValidation.validate(req.body);
    if (error) return ApiError(res, 400, error.details[0].message);

    const { fullname, email, password } = req.body;

    const existingUser = await prisma.user.findUnique({ where: { email } });

    if (existingUser) {
      if (!existingUser.isDeleted) {
        return ApiError(res, 400, "User With This Email Already Exists");
      } else {
        const restoredUser = await prisma.user.update({
          where: { id: existingUser.id },
          data: {
            fullname,
            password,
            role: "cashier",
            isDeleted: false,
          },
          select: { id: true, fullname: true, email: true, role: true },
        });

        await sendEmail({
          to: email,
          subject: "🎉 Welcome Back to POS!",
          message: generateEmailTemplate({
            message: `
              <p>Hi <strong>${fullname}</strong>,</p>
              <p>Your account has been re-activated successfully.</p>
              <p><strong>Email:</strong> ${email}<br />
              <strong>Password:</strong> ${password}</p>
            `,
          }),
        });

        return ApiResponse(res, 200, restoredUser, "Member Restored & Added Successfully");
      }
    }

    const newMember = await prisma.user.create({
      data: {
        fullname,
        email,
        password,
        role: "cashier",
      },
      select: { id: true, fullname: true, email: true, role: true },
    });

    await sendEmail({
      to: email,
      subject: "🎉 Welcome to POS!",
      message: generateEmailTemplate({
        message: `
          <p>Hi <strong>${fullname}</strong>,</p>
          <p>Your account has been successfully created.</p>
          <p><strong>Email:</strong> ${email}<br />
          <strong>Password:</strong> ${password}</p>
          <p>Please keep this information safe.</p>
        `,
      }),
    });

    return ApiResponse(res, 201, newMember, "Member Added Successfully");
  } catch (error) {
    console.log("Error in addStoreMember:", error);
    return ApiError(res, 500, "Internal Server Error");
  }
};
