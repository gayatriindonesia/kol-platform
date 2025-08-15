import * as z from "zod";

// AUTH SCHEMA
export const SignInSchema = z.object({
    email: z.string().email(),
    password: z.string().min(1, {
        message: "Wajib masukan password "
    })
});

export const SignUpSchema = z.object({
    name: z.string().min(3, {
        message: "Nama minimal 3 karakter"
    }),
    email: z.string().email(),
    password: z.string().min(8, {
        message: "Password minimal 8 karakter"
    }),
    role: z.enum(["BRAND", "INFLUENCER"], {
    required_error: "Role harus dipilih",
  }),
});

export const ResetPasswordSchema = z.object({
    email: z.string().email()
})

export const NewPasswordSchema = z.object({
    password: z.string().min(8, {
        message: "Password minimal 8 karakter"
    })
})

export const RoleSettingSchema = z.object({
  role: z.enum(["ADMIN", "BRAND", "INFLUENCER"], {
    required_error: "Please select a role",
  }),
});

// MODEL SCHEMA Service
// Schema validasi untuk Service
export const ServiceSchema = z.object({
    name: z.string().min(1, "Nama service harus diisi"),
    description: z.string().optional(),
    type: z.string().min(1, "Tipe service harus diisi"),
    isActive: z.boolean().optional().default(true),
    platformId: z.string().min(1, "Platform harus dipilih"),
  })