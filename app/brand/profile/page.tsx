import { auth } from "@/auth"
import ProfileSidebar from "@/components/profile/ProfileSidebar"
import EditProfileForm from "@/components/profile/EditProfileForm"
import ChangePasswordForm from "@/components/profile/ChangePasswordForm"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"

export const dynamic = "force-dynamic"

export default async function ProfilePage() {
  const session = await auth()
  console.log("sessi user", session)
  if (!session) return <div className="p-8">Unauthorized</div>

  return (
    <div className="min-h-screen p-4 md:p-8 max-w-6xl mx-auto grid gap-8 md:grid-cols-[300px_1fr]">
      <ProfileSidebar user={session.user} />

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Account Information</CardTitle>
            <CardDescription>Detailed information about your account</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p><strong>Email:</strong> {session.user.email}</p>
              <p><strong>Username:</strong> @{session.user.name?.replace(/\s+/g, "").toLowerCase()}</p>
              <p><strong>Role:</strong> {session.user.role}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Edit Profile</CardTitle>
            <CardDescription>Update your profile and password</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="profile">
              <TabsList className="grid grid-cols-2 w-full">
                <TabsTrigger value="profile">Profile Settings</TabsTrigger>
                <TabsTrigger value="password">Change Password</TabsTrigger>
              </TabsList>
              <TabsContent value="profile"><EditProfileForm user={session.user} /></TabsContent>
              <TabsContent value="password"><ChangePasswordForm /></TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
