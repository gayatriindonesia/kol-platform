"use client"

import { useTransition } from "react"
import { updateProfile } from "@/lib/user.actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { User } from "lucide-react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"

export default function EditProfileForm({ user }: { user: any }) {
    const [isPending, startTransition] = useTransition()
    const router = useRouter()
    const { update } = useSession()

    const handleSubmit = (formData: FormData) => {
        startTransition(async () => {
            try {
        const result = await updateProfile(formData)
        
        if (result.success) {
          // Update session dengan data terbaru
          await update({
            name: formData.get("name") as string
          })
          
          // Refresh router
          router.refresh()
          
          console.log('Profile updated successfully')
        } else {
          console.error(result.error)
        }
      } catch (error) {
        console.error('Error updating profile:', error)
      }
    })
    }

    return (
        <form action={handleSubmit} className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" name="name" type="text" defaultValue={user.name} key={user.name}required />
            </div>

            <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={user.email} disabled className="bg-muted" />
            </div>

            <Separator />


            <Button type="submit" disabled={isPending} className="w-full">
                <User className="mr-2 h-4 w-4" />
                {isPending ? "Saving..." : "Update Profile"}
            </Button>
        </form>
    )
}
