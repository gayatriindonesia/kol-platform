import type { NextAuthConfig } from "next-auth";

// import GitHub from "next-auth/providers/github";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";

import { SignInSchema } from "./schemas";
import { getUserByEmail } from "./data/user";
import { compare } from "bcrypt-ts";

export default {
    providers: [
        Google({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        }),
        // GitHub,
        Credentials({
            async authorize(credentials) {
                const validateField = SignInSchema.safeParse(credentials);

                if (validateField.success) {
                    const { email, password } = validateField.data;

                    const user = await getUserByEmail(email);
                    if (!user || !user.password) return null;

                    const passwordMatch = await compare(
                        password,
                        user.password
                    );
                    if (passwordMatch) return user;
                }

                return null;
            }
        })
    ],
    secret: process.env.NEXTAUTH_SECRET,
} satisfies NextAuthConfig;