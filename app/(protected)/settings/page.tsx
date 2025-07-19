import { auth } from "@/auth";
import { redirect } from "next/navigation";
import RoleSelectionForm from "@/components/RoleSelectionForm";

export default async function SettingPage() {
    const session = await auth();
   
    // Jika user belum login, redirect ke signin
    if (!session?.user) {
        redirect("/signin");
    }
    
    // Jika user sudah memiliki role, redirect ke dashboard yang sesuai
    if (session.user.role) {
        let dashboardUrl = "/";
        
        switch (session.user.role) {
            case "BRAND":
                dashboardUrl = "/brand";
                break;
            case "INFLUENCER":
                dashboardUrl = "/kol";
                break;
            case "ADMIN":
                dashboardUrl = "/admin";
                break;
            default:
                dashboardUrl = "/";
        }
        
        redirect(dashboardUrl);
    }
    
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="max-w-md w-full space-y-8">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                        Complete Your Profile
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-600">
                        Please select your role to continue
                    </p>
                </div>
                <RoleSelectionForm user={session.user} />
            </div>
        </div>
    );
}