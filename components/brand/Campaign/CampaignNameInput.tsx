"use client";

import { useState } from "react";
import useCampaignAppStore from "@/storeCampaign";
import { Textarea } from "@/components/ui/textarea";
import { Target, AlertCircle, Sparkles } from "lucide-react";
import { MdOutlineCampaign } from "react-icons/md";

const CampaignNameInput = () => {
    const { name, setName, goal, setGoal } = useCampaignAppStore();
    const [errorName, setErrorName] = useState<string | null>(null);
    const [errorGoal, setErrorGoal] = useState<string | null>(null);

    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setName(value);
        if (!value.trim()) {
            setErrorName("Nama campaign tidak boleh kosong");
        } else {
            setErrorName(null);
        }
    };

    const handleGoalChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const value = e.target.value;
        setGoal(value);
        if (!value.trim()) {
            setErrorGoal("Tujuan campaign tidak boleh kosong");
        } else {
            setErrorGoal(null);
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-8 bg-white rounded-2xl shadow-lg border border-gray-100">
            {/* Header Section */}
            <div className="text-center space-y-6 mb-12">
                {/* Icon & Title */}
                <div className="flex items-center justify-center space-x-4">
                    <div className="relative">
                        <div className="p-4 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg">
                            <MdOutlineCampaign className="h-8 w-8 text-white" />
                        </div>
                        <div className="absolute -top-1 -right-1 p-1 bg-gradient-to-r from-pink-500 to-orange-500 rounded-full">
                            <Sparkles className="h-3 w-3 text-white" />
                        </div>
                    </div>
                    <div className="text-left">
                        <h1 className="text-3xl lg:text-4xl font-bold text-gray-900">
                            Setup Campaign
                        </h1>
                        <p className="text-lg text-gray-600 mt-1">
                            Buat campaign yang menarik untuk brand Anda
                        </p>
                    </div>
                </div>
            </div>

            {/* Form Fields */}
            <div className="space-y-8">
                {/* Campaign Name Field */}
                <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                            <MdOutlineCampaign className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                            <label className="block text-lg font-semibold text-gray-900">
                                Nama Campaign
                                <span className="text-red-500 ml-1">*</span>
                            </label>
                            <p className="text-sm text-gray-600 mt-1">
                                Berikan nama yang jelas dan menarik untuk campaign ini
                            </p>
                        </div>
                    </div>

                    <div className="relative">
                        <input
                            type="text"
                            value={name}
                            onChange={handleNameChange}
                            placeholder="contoh: Summer Sale 2024 - Diskon Hingga 70%"
                            className={`
                                w-full px-4 py-4 border-2 rounded-xl text-gray-900 placeholder-gray-400
                                focus:outline-none focus:ring-4 focus:ring-blue-100 transition-all duration-200
                                ${errorName 
                                    ? "border-red-300 bg-red-50 focus:border-red-500" 
                                    : "border-gray-200 bg-gray-50 focus:border-blue-500 focus:bg-white"
                                }
                            `}
                        />
                        {errorName && (
                            <div className="flex items-center space-x-2 mt-3 text-red-600">
                                <AlertCircle className="h-4 w-4" />
                                <p className="text-sm font-medium">{errorName}</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Campaign Goal Field */}
                <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                        <div className="p-2 bg-green-100 rounded-lg">
                            <Target className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                            <label className="block text-lg font-semibold text-gray-900">
                                Tujuan Campaign
                                <span className="text-red-500 ml-1">*</span>
                            </label>
                            <p className="text-sm text-gray-600 mt-1">
                                Jelaskan tujuan dan hasil yang ingin dicapai dari campaign ini
                            </p>
                        </div>
                    </div>

                    <div className="relative">
                        <Textarea
                            value={goal}
                            onChange={handleGoalChange}
                            placeholder="contoh: Meningkatkan brand awareness produk skincare terbaru dengan target 1 juta impressions dan 10,000 engagement. Fokus pada audience wanita usia 20-35 tahun yang tertarik dengan produk kecantikan natural..."
                            rows={6}
                            className={`
                                resize-none border-2 rounded-xl text-gray-900 placeholder-gray-400 p-4
                                focus:outline-none focus:ring-4 focus:ring-blue-100 transition-all duration-200
                                ${errorGoal 
                                    ? "border-red-300 bg-red-50 focus:border-red-500" 
                                    : "border-gray-200 bg-gray-50 focus:border-blue-500 focus:bg-white"
                                }
                            `}
                        />
                        <div className="absolute bottom-3 right-3 text-xs text-gray-400">
                            {goal.length}/500
                        </div>
                        {errorGoal && (
                            <div className="flex items-center space-x-2 mt-3 text-red-600">
                                <AlertCircle className="h-4 w-4" />
                                <p className="text-sm font-medium">{errorGoal}</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Tips Section */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6">
                    <div className="flex items-start space-x-3">
                        <div className="p-2 bg-blue-100 rounded-lg mt-1">
                            <Sparkles className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                            <h4 className="text-lg font-semibold text-gray-900 mb-2">
                                Tips untuk Campaign yang Efektif
                            </h4>
                            <ul className="space-y-2 text-sm text-gray-600">
                                <li className="flex items-center space-x-2">
                                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                                    <span>Gunakan nama yang mudah diingat dan mencerminkan brand</span>
                                </li>
                                <li className="flex items-center space-x-2">
                                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                                    <span>Jelaskan tujuan dengan spesifik dan terukur (KPI)</span>
                                </li>
                                <li className="flex items-center space-x-2">
                                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                                    <span>Sertakan target audience dan ekspektasi hasil</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CampaignNameInput;