import NextAuth, { type DefaultSession } from "next-auth";

export type ExtendedUser = DefaultSession["user"] & {
  role: "ADMIN" | "BRAND" | "INFLUENCER" | null;
}

declare module "next-auth" {
  interface Session {
    user: ExtendedUser;
  }
}

import { JWT } from "@auth/core/jwt"

declare module "@auth/core/jwt" {
  interface JWT {
    role?: "ADMIN" | "BRAND" | "INFLUENCER" | null;
  }
}