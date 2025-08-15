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
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
            <div className="relative flex items-center justify-center min-h-screen px-4 py-12 sm:px-6 lg:px-8">
                <div className="w-full max-w-7xl space-y-8">
                    {/* Header dengan lebih banyak breathing room */}
                    <div className="text-center space-y-6">
                        <div className="space-y-3">
                            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 tracking-tight">
                                Lengkapi Profile
                                <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent ml-4">
                                    Anda
                                </span>
                            </h1>
                            <div className="w-32 h-1 bg-gradient-to-r from-blue-500 to-purple-600 mx-auto rounded-full"></div>
                        </div>
                        <p className="text-xl sm:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                            Pilih peran Anda untuk membuka fitur yang dipersonalisasi dan memulai perjalanan Anda
                        </p>
                    </div>
                    
                    {/* Form Container dengan width yang lebih lebar */}
                    <div className="flex justify-center">
                        <div className="w-full max-w-6xl">
                            <RoleSelectionForm user={session.user} />
                        </div>
                    </div>
                </div>
            </div>
            
            {/* Decorative Elements */}
            <div className="absolute top-10 left-10 w-20 h-20 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full opacity-10 blur-xl"></div>
            <div className="absolute bottom-10 right-10 w-32 h-32 bg-gradient-to-r from-pink-400 to-indigo-400 rounded-full opacity-10 blur-xl"></div>
            <div className="absolute top-1/2 left-5 w-16 h-16 bg-gradient-to-r from-purple-400 to-blue-400 rounded-full opacity-10 blur-xl"></div>
        </div>
    );
}