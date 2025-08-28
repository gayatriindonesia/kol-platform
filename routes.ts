export const publicRoutes = [
    "/",
    "/new-verification",
    "/privacy",
    "/terms",
]

export const authRoutes = [
  "/login",
    "/signin",
    "/signup",
    "/error",
    "/reset-password",
    "/new-password"
]

export const apiAuthPrefix = "/api/auth";

export const DEFAULT_LOGIN_REDIRECT = "/settings"

export const roleBasedRoutes = {
  ADMIN: ["/admin"],
  BRAND: ["/brand"],
  INFLUENCER: ["/kol"]
};

export const allowedWithoutRole = [
  "/settings",
  "/profile",
  "/signout"
];