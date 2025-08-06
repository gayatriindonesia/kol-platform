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

    // Role-based route protection
    if (isLoggedIn && userRole) {
        const pathname = nextUrl.pathname;
        
        // Admin routes - only accessible by ADMIN
        if (pathname.startsWith('/admin')) {
            if (userRole !== 'ADMIN') {
                return Response.redirect(new URL('/unauthorized', nextUrl));
            }
        }
        
        // Brand routes - only accessible by BRAND
        if (pathname.startsWith('/brand')) {
            if (userRole !== 'BRAND') {
                return Response.redirect(new URL('/unauthorized', nextUrl));
            }
        }
        
        // Influencer routes (col/kol) - only accessible by INFLUENCER
        if (pathname.startsWith('/kol') || pathname.startsWith('/kol')) {
            if (userRole !== 'INFLUENCER') {
                return Response.redirect(new URL('/unauthorized', nextUrl));
            }
        }
        
        // Prevent users from accessing other role-specific routes
        const isRoleSpecificRoute = pathname.startsWith('/admin') || 
                                   pathname.startsWith('/brand') || 
                                   pathname.startsWith('/kol');
        
        if (isRoleSpecificRoute) {
            // Additional check: redirect users to their proper dashboard if they somehow reach here
            let properDashboard = '/settings';
            switch (userRole) {
                case 'ADMIN':
                    if (!pathname.startsWith('/admin')) {
                        properDashboard = '/admin';
                        return Response.redirect(new URL(properDashboard, nextUrl));
                    }
                    break;
                case 'BRAND':
                    if (!pathname.startsWith('/brand')) {
                        properDashboard = '/brand';
                        return Response.redirect(new URL(properDashboard, nextUrl));
                    }
                    break;
                case 'INFLUENCER':
                    if (!pathname.startsWith('/kol') && !pathname.startsWith('/kol')) {
                        properDashboard = '/kol';
                        return Response.redirect(new URL(properDashboard, nextUrl));
                    }
                    break;
            }
        }
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