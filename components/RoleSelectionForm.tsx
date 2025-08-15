"use client";

import { useState, useTransition } from "react";
import { updateUserRole } from "@/lib/user.actions";
import { User } from "next-auth";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Building2, Users, CheckCircle2, Loader2 } from "lucide-react";

interface RoleSelectionFormProps {
    user: User;
}

export default function RoleSelectionForm({ user }: RoleSelectionFormProps) {
    const [selectedRole, setSelectedRole] = useState<"BRAND" | "INFLUENCER" | null>(null);
    const [isPending, startTransition] = useTransition();
    const [error, setError] = useState<string | null>(null);
    const { update } = useSession();
    const router = useRouter();

    // Function to force session reload
    const reloadSession = () => {
        const event = new Event("visibilitychange");
        document.dispatchEvent(event);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!selectedRole) {
            setError("Please select a role");
            return;
        }

        setError(null);
        
        startTransition(async () => {
            try {
                const result = await updateUserRole(user.id!, selectedRole);
                
                if (result.error) {
                    setError(result.error);
                } else {
                    // Update session dengan role baru
                    await update({ role: selectedRole });
                    
                    // Force refresh router cache
                    reloadSession();
                    router.refresh();

                    // Delay untuk memastikan session ter-update
                    setTimeout(() => {
                        // Redirect berdasarkan role yang dipilih
                        let redirectUrl = "/";
                        
                        switch (selectedRole) {
                            case "BRAND":
                                redirectUrl = "/brand";
                                break;
                            case "INFLUENCER":
                                redirectUrl = "/kol";
                                break;
                        }
                        // Force navigation dengan replace
                        window.location.replace(redirectUrl);
                    }, 1000);
                }
            } catch {
                setError("Something went wrong. Please try again.");
            }
        });
    };

    const roleOptions = [
        {
            id: "BRAND",
            title: "Brand",
            description: "Saya mewakili perusahaan atau merek yang ingin berkolaborasi dengan influencer",
            icon: Building2,
            gradient: "from-blue-500 to-purple-600",
            hoverGradient: "from-blue-600 to-purple-700",
            features: ["Access brand dashboard", "Find influencers", "Manage campaigns"]
        },
        {
            id: "INFLUENCER",
            title: "Content Creator",
            description: "Saya membuat konten dan ingin berkolaborasi dengan brands",
            icon: Users,
            gradient: "from-pink-500 to-orange-500",
            hoverGradient: "from-pink-600 to-orange-600",
            features: ["Creator dashboard", "Brand opportunities", "Analytics & insights"]
        }
    ];

    return (
        <div className="w-full max-w-6xl mx-auto">
            {/* Header Section */}
            <div className="text-center mb-12">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl mb-6">
                    <CheckCircle2 className="w-8 h-8 text-white" />
                </div>
                <h1 className="text-3xl font-bold text-gray-900 mb-3">
                    Pilih Peran Anda
                </h1>
                <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                    Pilih bagaimana Anda ingin menggunakan platform kami. Anda dapat mengubahnya nanti di pengaturan Anda.
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
                {/* Role Selection Cards */}
                <div className="grid md:grid-cols-2 gap-6">
                    {roleOptions.map((option) => {
                        const Icon = option.icon;
                        const isSelected = selectedRole === option.id;
                        
                        return (
                            <label
                                key={option.id}
                                className={`
                                    relative block p-8 rounded-2xl border-2 cursor-pointer transition-all duration-300 group
                                    ${isSelected 
                                        ? 'border-blue-500 bg-blue-50 shadow-xl shadow-blue-500/25 scale-105' 
                                        : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-lg hover:scale-102'
                                    }
                                    ${isPending ? 'cursor-not-allowed opacity-75' : ''}
                                `}
                            >
                                <input
                                    type="radio"
                                    name="role"
                                    value={option.id}
                                    checked={isSelected}
                                    onChange={(e) => setSelectedRole(e.target.value as "BRAND" | "INFLUENCER")}
                                    className="sr-only"
                                    disabled={isPending}
                                />
                                
                                {/* Selection Indicator */}
                                <div className={`
                                    absolute top-6 right-6 w-6 h-6 rounded-full border-2 transition-all duration-300
                                    ${isSelected 
                                        ? 'border-blue-500 bg-blue-500' 
                                        : 'border-gray-300 bg-white group-hover:border-gray-400'
                                    }
                                `}>
                                    {isSelected && (
                                        <CheckCircle2 className="w-4 h-4 text-white absolute top-0.5 left-0.5" />
                                    )}
                                </div>

                                {/* Icon with Gradient Background */}
                                <div className={`
                                    inline-flex items-center justify-center w-14 h-14 rounded-xl mb-6 
                                    bg-gradient-to-r ${isSelected ? option.hoverGradient : option.gradient} 
                                    transition-all duration-300 group-hover:scale-110
                                `}>
                                    <Icon className="w-7 h-7 text-white" />
                                </div>

                                {/* Content */}
                                <div className="space-y-4">
                                    <div>
                                        <h3 className="text-xl font-semibold text-gray-900 mb-2">
                                            {option.title}
                                        </h3>
                                        <p className="text-gray-600 leading-relaxed">
                                            {option.description}
                                        </p>
                                    </div>

                                    {/* Features List */}
                                    <div className="space-y-2">
                                        {option.features.map((feature, index) => (
                                            <div key={index} className="flex items-center text-sm text-gray-500">
                                                <div className="w-1.5 h-1.5 bg-gray-400 rounded-full mr-3" />
                                                {feature}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Hover Effect Overlay */}
                                <div className={`
                                    absolute inset-0 rounded-2xl bg-gradient-to-r opacity-0 transition-opacity duration-300
                                    ${option.gradient} group-hover:opacity-5
                                `} />
                            </label>
                        );
                    })}
                </div>

                {/* Error Message */}
                {error && (
                    <div className="flex items-center justify-center p-4 bg-red-50 border border-red-200 rounded-xl">
                        <div className="flex items-center text-red-600">
                            <div className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center mr-3">
                                <div className="w-2 h-2 bg-red-500 rounded-full" />
                            </div>
                            <span className="text-sm font-medium">{error}</span>
                        </div>
                    </div>
                )}

                {/* Submit Button */}
                <div className="flex justify-center pt-4">
                    <button
                        type="submit"
                        disabled={isPending || !selectedRole}
                        className={`
                            relative px-12 py-4 rounded-xl font-semibold text-white transition-all duration-300
                            ${selectedRole 
                                ? 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 shadow-lg hover:shadow-xl hover:scale-105' 
                                : 'bg-gray-300 cursor-not-allowed'
                            }
                            ${isPending ? 'cursor-not-allowed' : ''}
                            disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
                        `}
                    >
                        <div className="flex items-center space-x-3">
                            {isPending ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <CheckCircle2 className="w-5 h-5" />
                            )}
                            <span>
                                {isPending ? "Setting up your account..." : "Continue to Dashboard"}
                            </span>
                        </div>
                        
                        {/* Button Glow Effect */}
                        {selectedRole && !isPending && (
                            <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 opacity-0 hover:opacity-20 transition-opacity duration-300 blur-xl" />
                        )}
                    </button>
                </div>
            </form>

            {/* Bottom Info */}
            <div className="text-center mt-12 pt-8 border-t border-gray-100">
                <p className="text-sm text-gray-500">
                    Need help deciding? You can always change your role later in your account settings.
                </p>
            </div>
        </div>
    );
}