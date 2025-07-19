// lib/role-utils.js

export type UserRole = "ADMIN" | "BRAND" | "INFLUENCER";

export function getDashboardUrl(role: UserRole | null): string {
  if (!role) return "/settings";
  
  switch (role) {
    case "ADMIN":
      return "/admin/dashboard";
    case "BRAND":
      return "/brand/dashboard";
    case "INFLUENCER":
      return "/kol/dashboard";
    default:
      return "/settings"; // Default fallback
  }
}

export function isValidRole(role: string | null): role is UserRole {
  if (!role) return false;
  return ["ADMIN", "BRAND", "INFLUENCER"].includes(role);
}

export function getRoleDisplayName(role: UserRole | null): string {
  if (!role) return "No Role";
  
  switch (role) {
    case "ADMIN":
      return "Administrator";
    case "BRAND":
      return "Brand";
    case "INFLUENCER":
      return "Influencer";
    default:
      return "Unknown";
  }
}