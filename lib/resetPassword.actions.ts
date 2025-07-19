"use server";

import * as z from "zod";
import { hash } from "bcrypt-ts";
import { NewPasswordSchema, ResetPasswordSchema } from "@/schemas";
import { getUserByEmail } from "@/data/user";
import { generatePasswordResetToken } from "./tokens";
import { sendPasswordResetEmail } from "./mail";
import { getPasswordResetTokenByToken } from "@/data/password-reset-token";
import { db } from "./db";

// Reset Password
export const resetPassword = async (values: z.infer<typeof ResetPasswordSchema>) => {
    const validatedFields = ResetPasswordSchema.safeParse(values);

    if (!validatedFields.success) {
        return {error: "Invalid email" };
    }

    const { email } = validatedFields.data;

    const existingUser = await getUserByEmail(email);

    if (!existingUser) {
        return { error: "Email tidak ditemukan"}
    }

    // Generate token reset password
    const passwordResetToken = await generatePasswordResetToken(email);
    await sendPasswordResetEmail(
        passwordResetToken.email,
        passwordResetToken.token
    )

    return { success: "Link email terkirim"}

}

// new Password
export const newPassword = async (
    values: z.infer<typeof NewPasswordSchema>,
    token?: string | null,
) => {
    if (!token) {
        return { error: "tidak ada token aktif"}
    }

    const validatedFields = NewPasswordSchema.safeParse(values);

    if (!validatedFields.success) {
return { error: "Invalid field" }
    }

    const { password } = validatedFields.data;
    const existingToken = await getPasswordResetTokenByToken(token);

    if (!existingToken) {
        return { error: "Invalid token!"}
    }

    const hasExpired = new Date(existingToken.expires) < new Date();

    if (hasExpired) {
        return { error: "token telah expired" }
    }

    const existingUser = await getUserByEmail(existingToken.email);

    if (!existingUser) {
        return { error: "Email tidak ditemukan" }
    }

    // hashing password
    const hashedPassword = await hash(password, 10);
    await db.user.update({
        where: {
            id: existingUser.id
        },
        data: {
            password: hashedPassword
        }
    });

    await db.passwordResetToken.delete({
        where: {
            id: existingToken.id
        }
    });

    return { success: "Password berhasil reset"}
}