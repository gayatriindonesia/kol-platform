import NextAuth from "next-auth";
import authConfig from "./auth.config";
import { 
    DEFAULT_LOGIN_REDIRECT, 
    apiAuthPrefix, 
    authRoutes, 
    publicRoutes,
} from "./routes";

const { auth } = NextAuth(authConfig)

export default auth( async (req) => {
    const {nextUrl } = req;
    const isLoggedIn = !!req.auth;

    // console.log("Auth config in middleware", authConfig);

    // Mendapatkan peran pengguna dari sesi
    const userRole = req.auth?.user.role || null;

    const isApiAuthRoute = nextUrl.pathname.startsWith(apiAuthPrefix);
    const isPublicRoute = publicRoutes.includes(nextUrl.pathname);
    const isAuthRoute = authRoutes.includes(nextUrl.pathname);

    if (isApiAuthRoute) {
        return;
    }

    if (isAuthRoute) {
        if (isLoggedIn) {
            return Response.redirect(new URL(DEFAULT_LOGIN_REDIRECT, nextUrl))
        }
        return;
    }

    if (!isLoggedIn && !isPublicRoute) {
        const callbackUrl = nextUrl.pathname;
        return Response.redirect(new URL(`/signin?callbackUrl=${encodeURIComponent(callbackUrl)}`, nextUrl));
    }

    return;
})

export const config = {
    matcher: [
        // Skip Next.js internals and all static files, unless found in search params
        '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
        // Always run for API routes
        '/(api|trpc)(.*)',
      ],
}