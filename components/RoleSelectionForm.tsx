"use client";

import { useState, useTransition } from "react";
import { updateUserRole } from "@/lib/user.actions";
import { User } from "next-auth";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

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

    return (
        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
            <div className="space-y-4">
                <div>
                    <p className="text-sm font-medium text-gray-700 mb-3">
                        I am a:
                    </p>
                    <div className="space-y-3">
                        <label className="flex items-center p-4 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                            <input
                                type="radio"
                                name="role"
                                value="BRAND"
                                checked={selectedRole === "BRAND"}
                                onChange={(e) => setSelectedRole(e.target.value as "BRAND")}
                                className="mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                                disabled={isPending}
                            />
                            <div>
                                <div className="text-sm font-medium text-gray-900">Brand</div>
                                <div className="text-sm text-gray-500">
                                    I represent a company or brand looking for influencers
                                </div>
                            </div>
                        </label>
                        
                        <label className="flex items-center p-4 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                            <input
                                type="radio"
                                name="role"
                                value="INFLUENCER"
                                checked={selectedRole === "INFLUENCER"}
                                onChange={(e) => setSelectedRole(e.target.value as "INFLUENCER")}
                                className="mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                                disabled={isPending}
                            />
                            <div>
                                <div className="text-sm font-medium text-gray-900">Influencer</div>
                                <div className="text-sm text-gray-500">
                                    I create content and want to collaborate with brands
                                </div>
                            </div>
                        </label>
                    </div>
                </div>
                
                {error && (
                    <div className="text-red-600 text-sm text-center">
                        {error}
                    </div>
                )}
            </div>

            <button
                type="submit"
                disabled={isPending || !selectedRole}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {isPending ? "Saving..." : "Continue"}
            </button>
        </form>
    );
}