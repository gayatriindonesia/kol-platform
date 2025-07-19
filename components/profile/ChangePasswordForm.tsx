"use client"

import { useTransition } from "react"
import { toast } from "sonner"
import { changePassword } from "@/lib/user.actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertTriangle, Lock } from "lucide-react"
import { useRouter } from "next/navigation"

export default function ChangePasswordForm() {
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  const handleSubmit = (formData: FormData) => {
    startTransition(async () => {
      const res = await changePassword(formData)
      if (res?.success) {
        toast.success("Password changed successfully")
        router.refresh()
      } else {
        toast.error(res?.error || "Change failed")
      }
    })
  }

  return (
    <form action={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="currentPassword">Current Password</Label>
        <Input id="currentPassword" name="currentPassword" type="password" required />
      </div>

      <div className="space-y-2">
        <Label htmlFor="newPassword">New Password</Label>
        <Input id="newPassword" name="newPassword" type="password" required />
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirmPassword">Confirm New Password</Label>
        <Input id="confirmPassword" name="confirmPassword" type="password" required />
      </div>

      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>Password must be at least 6 characters long</AlertDescription>
      </Alert>

      <Button type="submit" disabled={isPending} className="w-full">
        <Lock className="mr-2 h-4 w-4" />
        {isPending ? "Saving..." : "Change Password"}
      </Button>
    </form>
  )
}
