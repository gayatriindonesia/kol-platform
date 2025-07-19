import NextAuth from "next-auth";

import { db } from "@/lib/db";
import authConfig from "./auth.config";
import { getUserById } from "./data/user";
import { PrismaAdapter } from "@auth/prisma-adapter";

export const {
  handlers: { GET, POST },
  auth,
  signIn,
  signOut
} = NextAuth({
  pages: {
    signIn: "/signin",
    error: "/error"
  },

  events: {
    async linkAccount({ user }) {
      await db.user.update({
        where: {
          id: user.id
        },
        data: {
          emailVerified: new Date()
        }
      })
    }
  },

  callbacks: {
    // SIGNIN
    async signIn({ user, account }) {
      // console.log({ user, account })

      if (account?.provider !== "credentials") return true;

      if (!user.id) return false; // Ensure user.id is defined
      const existingUser = await getUserById(user.id);

      if (!existingUser?.emailVerified) return false;

      return true;
    },

    // SESSION
    async session({ token, session }) {
      // console.log({ sessionToken: token }) // session response
      if (token.sub && session.user) {
        session.user.id = token.sub;
      }

      if (token.role && session.user) {
        session.user.role = token.role;
      }

      // ✅ Tambahkan field lain yang mungkin berubah
      if (token.name && session.user) {
        session.user.name = token.name;
      }
      if (token.email && session.user) {
        session.user.email = token.email;
      }

      // ✅ Tambahkan auto-create Influencer entry
      if (token.sub && token.role === "INFLUENCER") {
        const influencer = await db.influencer.findUnique({
          where: {
            userId: token.sub
          }
        });

        if (!influencer) {
          await db.influencer.create({
            data: {
              userId: token.sub
            }
          });
        }
      }

      return session;
    },

    // TOKEN
    async jwt({ token, trigger, session }) {
      // console.log({ token }) // token response

      if (trigger === "update" && session) {
        return { ...token, ...session }
      }

      if (!token.sub) {
        return token;
      }

      // Always fetch fresh user data
      const existingUser = await getUserById(token.sub);
      if (!existingUser) {
        return token;
      }

      // Update all user fields in token
      token.role = existingUser.role;
      token.name = existingUser.name;
      token.email = existingUser.email;

      return token;
    }
  },

  adapter: PrismaAdapter(db),
  session: { strategy: "jwt" },
  ...authConfig
})