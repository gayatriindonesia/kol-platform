"use client";

import * as z from "zod";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { SignUpSchema } from "@/schemas";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { FormError } from "../FormError";
import { FormSuccess } from "../FormSuccess";
import { signup } from "@/lib/auth.actions";
import { useState, useTransition } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";

export function SignUpForm({
    className,
    ...props
}: React.ComponentPropsWithoutRef<"form">) {
    // state password showing
    const [showPassword, setShowPassword] = useState(false);

    const [error, setError] = useState<string | undefined>("");
    const [success, setSuccess] = useState<string | undefined>("");
    const [isPending, startTransaction] = useTransition();

    // Fungsi toggle password visibility
    const togglePasswordVisibility = () => {
        setShowPassword((prev) => !prev);
    };

    const form = useForm<z.infer<typeof SignUpSchema>>({
        resolver: zodResolver(SignUpSchema),
        defaultValues: {
            name: "",
            email: "",
            password: "",
            role: undefined,
        },
    });

    const onSubmit = (values: z.infer<typeof SignUpSchema>) => {
        setError("");
        setSuccess("");

        startTransaction(() => {
            signup(values)
                .then((data) => {
                    setError(data.error);
                    setSuccess(data.success);

                    // Reset form after success
                    if (!data.error) {
                        form.reset(); // Reset form here
                    }
                })
        });
    };

    return (
        <Form {...form}>
            <form
                className={cn("flex flex-col gap-6", className)}
                {...props}
                onSubmit={form.handleSubmit(onSubmit)}
            >
                <div className="flex flex-col items-center gap-2 text-center">
                    <h1 className="text-2xl font-bold">Daftar Akun</h1>
                    <p className="text-balance text-sm text-muted-foreground">
                        Masukan dengan email aktif
                    </p>
                </div>
                <div className="grid gap-6">
                    {/* Role */}
                    <FormField
                        control={form.control}
                        name="role"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Role</FormLabel>
                                <Select
                                    onValueChange={field.onChange}
                                    defaultValue={field.value}
                                    disabled={isPending}
                                >
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Pilih role" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="BRAND">Brand</SelectItem>
                                        <SelectItem value="INFLUENCER">Influencer</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* Name */}
                    <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Fullname</FormLabel>
                                <FormControl>
                                    <Input type="text" placeholder="johndoe" {...field} disabled={isPending} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* Email */}
                    <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Email</FormLabel>
                                <FormControl>
                                    <Input type="email" placeholder="m@example.com" {...field} disabled={isPending} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* Password */}
                    <FormField
                        control={form.control}
                        name="password"
                        render={({ field }) => (
                            <FormItem>
                                <div className="flex items-center justify-between">
                                    <FormLabel>Password</FormLabel>
                                </div>
                                <FormControl>
                                    <div className="relative">
                                        <Input
                                            type={showPassword ? "text" : "password"}
                                            {...field}
                                            placeholder="********"
                                            disabled={isPending}
                                            className="pr-10"
                                        />
                                        <button
                                            type="button"
                                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                                            onClick={togglePasswordVisibility}
                                            tabIndex={-1}
                                        >
                                            {showPassword ? (
                                                <EyeOff size={18} />
                                            ) : (
                                                <Eye size={18} />
                                            )}
                                        </button>
                                    </div>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormError message={error} />
                    <FormSuccess message={success} />

                    {/* Submit */}
                    <Button type="submit" className="w-full" disabled={isPending}>
                        Sign Up
                    </Button>

                        {/** Disablle Google Sign In
                    <div className="relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-border">
                        <span className="relative z-10 bg-background px-2 text-muted-foreground">
                            Or continue with
                        </span>
                    </div>

                    
                    <Button
                        variant="outline"
                        className="w-full"
                        type="button"
                        onClick={() => signIn("github", { callbackUrl: "/" })}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                            <path
                                d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                                fill="currentColor"
                            />
                        </svg>
                        Login with Google
                    </Button>
                     */}
                    
                </div>
                <div className="text-center text-sm">
                    sudah memiliki akun?{" "}
                    <a href="/signin" className="underline underline-offset-4">
                        Sign in
                    </a>
                </div>
            </form>
        </Form>
    );
}
