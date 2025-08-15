"use client";

import * as z from "zod";
import { ResetPasswordSchema } from '@/schemas';
import { zodResolver } from '@hookform/resolvers/zod';
import React, { useState, useTransition } from 'react'
import { useForm } from 'react-hook-form';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../ui/form";
import { Input } from "../ui/input";
import { cn } from "@/lib/utils";
import { Button } from "../ui/button";
import { resetPassword } from "@/lib/resetPassword.actions";
import { FormError } from "../FormError";
import { FormSuccess } from "../FormSuccess";

const ResetPasswordForm = ({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"form">) => {
  const [isPending, startTransaction] = useTransition();
  const [error, setError] = useState<string | undefined>("");
  const [success, setSuccess] = useState<string | undefined>("");

  const form = useForm<z.infer<typeof ResetPasswordSchema>>({
    resolver: zodResolver(ResetPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = (values: z.infer<typeof ResetPasswordSchema>) => {
    console.log(values)

    setError("");
    setSuccess("");

    startTransaction(() => {
      resetPassword(values)
        .then((data) => {
          setError(data?.error);
          setSuccess(data?.success);
        })
    });
  };

  return (
    <div className='w-full min-h-[50vh] flex flex-col items-center justify-center gap-4 text-center'>
      <Form {...form}>
        <form
          className={cn("flex flex-col gap-6 w-full max-w-md", className)}
          {...props}
          onSubmit={form.handleSubmit(onSubmit)}
        >
          <div className="flex flex-col items-center gap-2 text-center">
            <h1 className="text-2xl font-bold">Reset Password</h1>
            <p className="text-balance text-sm text-muted-foreground">
              Masukan email untuk reset password
            </p>
          </div>
          <div className="grid gap-6">
            {/* Email */}
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="example@go.id" {...field} disabled={isPending} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormError message={error} />
            <FormSuccess message={success} />

            {/* Submit */}
            <Button type="submit" className="w-full" disabled={isPending}>
              Reset Password Sekarang
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}

export default ResetPasswordForm