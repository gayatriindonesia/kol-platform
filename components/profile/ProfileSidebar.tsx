"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"

export default function ProfileSidebar({ user }: { user: any }) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col items-center gap-4 pt-6">
        <Avatar className="w-24 h-24">
          <AvatarImage src={user.image || '/images/avataruser.png'} />
          <AvatarFallback>
            {user.name?.[0] || 'U'}
          </AvatarFallback>
        </Avatar>

        <div className="text-center">
          <h2 className="text-xl font-bold">{user.name}</h2>
          <p className="text-sm text-muted-foreground">{user.email}</p>
          <p className="text-xs text-muted-foreground mt-1 px-2 py-1 bg-muted rounded-full">
            {user.role}
          </p>
        </div>

        <Separator className="my-2" />

        <Button variant="destructive" className="w-full">
          Hapus Akun
        </Button>
      </div>
    </div>
  )
}
