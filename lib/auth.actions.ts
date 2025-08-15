"use server";

import * as z from "zod";
import { hash } from "bcrypt-ts";
import { SignInSchema, SignUpSchema } from "@/schemas";
import { db } from "./db";
import { getUserByEmail } from "@/data/user";
import { signIn } from "@/auth";
import { sendVerificationEmail } from "./mail";
import { DEFAULT_LOGIN_REDIRECT } from "@/routes";
import { AuthError } from "next-auth";
import { generateVerificationToken } from "./tokens";

// LOGIN
export const signin = async (values: z.infer<typeof SignInSchema>) => {
  // console.log(values);

  const validateField = SignInSchema.safeParse(values);

  if (!validateField.success) {
    return { error: "invalid Field" };
  }

  const { email, password } = validateField.data;

  // check account by email
  const existingUser = await getUserByEmail(email);
  if (!existingUser || !existingUser.email || !existingUser.password) {
    return { error: "Akun tidak ada" }
  }

  
  // cek token verify
  if (!existingUser.emailVerified) {
    const verificationToken = await generateVerificationToken(existingUser.email);

    await sendVerificationEmail(
      verificationToken.email,
      verificationToken.token
    )

    return { success: "Email konfirmasi terkirim!"}
  }

  try {
    await signIn("credentials", {
      email,
      password,
      redirectTo: DEFAULT_LOGIN_REDIRECT,
    });
    return { success: "Login berhasil!" };
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.message) {
        case "CredentialsSignin":
          return { error: "server error!" }
        default:
          return { error: "Invalid credentials!" }
      }
    }
    throw error;
  }

  // return { success: "Email terkirim"}
}

// REGISTER
export const signup = async (values: z.infer<typeof SignUpSchema>) => {
  // console.log(values);

  const validateField = SignUpSchema.safeParse(values);

  if (!validateField.success) {
    return { error: "invalid Field" };
  }

  const { name, email, password, role } = validateField.data;
  const hashPassword = await hash(password, 10)

  const existingUser = await getUserByEmail(email);

  if (existingUser) {
    return { error: "Email sudah ada!" }
  }

  await db.user.create({
    data: {
      name,
      email,
      password: hashPassword,
      role
    }
  });

  // verify token email
  const verificationToken = await generateVerificationToken(email)
  await sendVerificationEmail(
    verificationToken.email,
    verificationToken.token
  )

  return { success: "Email konfirmasi terkirim" }
}
