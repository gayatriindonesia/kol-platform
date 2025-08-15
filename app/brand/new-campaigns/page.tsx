"use client";

import { useState, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import useCampaignAppStore from "@/storeCampaign";
import CampaignTypeSelector from "@/components/brand/Campaign/CampaignTypeSelector";
import CampaignNameInput from "@/components/brand/Campaign/CampaignNameInput";
import PersonalInfo from "@/components/brand/Campaign/PersonalInfo";
import EducationBackground from "@/components/brand/Campaign/EducationBackground";
import DirectCampaignSetup from "@/components/brand/Campaign/DirectCampaignSetup";
import SelfServiceSetup from "@/components/brand/Campaign/SelfServiceSetup";
import ReviewSubmit from "@/components/brand/Campaign/ReviewSubmit";
import ProgressBar from "@/components/brand/Campaign/ProgressBar";
import BrandSelector from "@/components/brand/Campaign/BrandSelector";
import React from "react";
import PlatformSelector from "@/components/brand/Campaign/PlatformSelector";
import CampaignDateSelector from "@/components/brand/Campaign/CampaignDateSelector";

const CampaignPage = () => {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [mounted, setMounted] = useState(false);

  const {
    campaignType,
    step,
    nextStep,
    prevStep,
    getTotalSteps,
    sendCampaignInvitations,
    selectedInfluencers,
    selectedBrand,
    submitForm,
    resetForm,
    name,
    formData,
  } = useCampaignAppStore();

  // Fix hydration issues
  useEffect(() => {
    setMounted(true);
  }, []);

  // Custom toast notification with proper TypeScript types
  type ToastType = "info" | "error" | "success";

  interface ToastState {
    show: boolean;
    message: string;
    type: ToastType;
  }

  const [toast, setToast] = useState<ToastState>({
    show: false,
    message: "",
    type: "info"
  });

  const showToast = (message: string, type: ToastType = "info") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "info" }), 3000);
  };

  {/** Title MultiForm
  const getStepTitle = () => {
    // Common step titles for both types
    const commonStepTitles: Record<number, string> = {
      1: "Campaign Brief",
      2: "Pilih Brand",
    };

    // Specific step titles based on campaign type
    const typeSpecificTitles: Record<string, Record<number, string>> = {
      direct: {
        3: "Budget & Kategori",
        4: "Pilih Platform",
        5: "Informasi Persyaratan Campaign",
        6: "Tanggal Campaign",
        7: "Informasi Personal",
        8: "Review & Submit",
      },
      selfService: {
        3: "Tentukan Durasi Campaign",
        4: "Pilih Influencer",
        5: "Review & Submit",
      }
    };

    // Return common title or type-specific title
    return commonStepTitles[step] || (campaignType ? typeSpecificTitles[campaignType]?.[step] : "");
  };
   */}

  const handleNextStep = () => {
    // Validation for step 1 (Campaign Name)
    if (step === 1 && (!name || !name.trim())) {
      showToast("Nama campaign tidak boleh kosong", "error");
      return;
    }

    // Validation for step 2 (Brand Selection)
    if (step === 2 && (!selectedBrand || !selectedBrand.id)) {
      showToast("Silakan pilih brand terlebih dahulu", "error");
      return;
    }

    // Validation for step 3 (DirectCampaignSetup) - only for direct campaign type
    if (step === 3 && campaignType === "direct") {
      if (!formData.direct.categories || formData.direct.categories.length === 0) {
        showToast("Silakan pilih kategori campaign", "error");
        return;
      }

      if (!formData.direct.budget || formData.direct.budget <= 0) {
        showToast("Silakan masukkan budget campaign", "error");
        return;
      }
    }

    // Validation for step 4 (PlatformSelector) - only for direct campaign type
    if (step === 4 && campaignType === "direct") {
      if (!formData.direct.platformSelections || formData.direct.platformSelections.length === 0) {
        showToast("Silakan pilih minimal satu platform", "error");
        return;
      }
    }

    nextStep();
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    startTransition(async () => {
      try {
        const result = await submitForm();
        // Fix: Proper type guard for checking success
        if (!result.success) {
          showToast(result.message || "Gagal mengirim campaign", "error");
          setIsSubmitting(false);
          return;
        }

        console.log('✅ Campaign submitted successfully:', result.data);

        // At this point, TypeScript knows result.success is true and result.data exists
        if (campaignType === "selfService") {

          console.log('📧 About to send invitations...');
          console.log('Selected influencers:', selectedInfluencers);
          console.log('Campaign ID:', result.data.id);

          const campaignId = result.data.id; // Now this is safe
          const invitationResult = await sendCampaignInvitations(campaignId);

          if (!invitationResult.success) {
            alert(invitationResult.message || "Campaign berhasil dibuat, tetapi gagal mengirim undangan.");
            setIsSubmitting(false);
            return;
          }
        }

        // alert("Campaign berhasil dikirim!");
        // Optionally redirect or reset form here
        showToast("Campaign berhasil dikirim!", "success");
        resetForm();

        router.push("/brand/campaigns/success");
      } catch (error) {
        console.error(error);
        showToast("Terjadi kesalahan saat submit campaign", "error");
      } finally {
        setIsSubmitting(false);
      }
    });
  };

  const Toast = () => {
    if (!toast.show) return null;

    const bgColor = toast.type === "error" ? "bg-red-500" :
      toast.type === "success" ? "bg-green-500" : "bg-blue-500";

    return (
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className={`fixed top-5 right-5 ${bgColor} text-white px-6 py-3 rounded-lg shadow-lg z-50 flex items-center`}
      >
        {toast.type === "error" ? (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        ) : toast.type === "success" ? (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zm-1 7a1 1 0 01-1-1v-2a1 1 0 112 0v2a1 1 0 01-1 1z" clipRule="evenodd" />
          </svg>
        )}
        {toast.message}
      </motion.div>
    );
  };

  const renderStepContent = () => {
    // Common components for both types
    const commonSteps: Record<number, React.ReactNode> = {
      1: <CampaignNameInput />,
      2: <BrandSelector />,
    };

    // Specific components based on campaign type
    const typeSpecificSteps: Record<string, Record<number, React.ReactNode>> = {
      direct: {
        3: <DirectCampaignSetup />,
        4: <PlatformSelector />,
        5: <EducationBackground />,
        6: <CampaignDateSelector />,
        7: <PersonalInfo />,
        8: <ReviewSubmit />,
      },
      selfService: {
        3: <CampaignDateSelector />,
        4: <SelfServiceSetup />,
        5: <ReviewSubmit />,
      }
    };

    // Return common step or type-specific step
    return commonSteps[step] || (campaignType ? typeSpecificSteps[campaignType]?.[step] : null);
  };

  // Loading spinner with improved design
  const LoadingSpinner = () => (
    <div className="w-5 h-5 border-2 border-t-transparent border-white rounded-full animate-spin mr-2"></div>
  );

  // If not mounted yet, show nothing to prevent hydration mismatch
  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br to-indigo-50">
      <AnimatePresence>
        {toast.show && <Toast />}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white w-full h-full min-h-screen shadow-xl flex flex-col"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-6 md:p-8 flex-shrink-0">
          <h1 className="text-2xl md:text-3xl font-bold text-center">
            {!campaignType ? "Pilih Jenis Campaign" : "Buat Campaign Baru"}
          </h1>
          {campaignType && (
            <p className="text-blue-100 text-center mt-2">
              {campaignType === "direct" ? "Direct Campaign" : "Self-Service Campaign"}
            </p>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col p-6 md:p-8">
          {!campaignType ? (
            <div className="flex-1 flex items-center justify-center">
              <CampaignTypeSelector />
            </div>
          ) : (
            <div className="flex-1 flex flex-col">
              <ProgressBar />
              
              {/* Step Title */}
              <div className="text-center mt-6 mb-2">
                {/**
                <h2 className="text-xl md:text-2xl font-semibold text-gray-800">
                  {getStepTitle()}
                </h2>
                 */}
                <p className="text-gray-600 text-sm mt-1">
                  Step {step} of {getTotalSteps()}
                </p>
              </div>

              <motion.div
                key={step}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="mt-6 flex-1"
              >
                {renderStepContent()}
              </motion.div>

              <div className="mt-10 flex flex-col sm:flex-row justify-between gap-4 flex-shrink-0">
                <button
                  onClick={prevStep}
                  disabled={step === 1 || isSubmitting}
                  className={`px-6 py-3 rounded-lg transition-all duration-200 text-base font-medium flex items-center justify-center ${step === 1 || isSubmitting
                    ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                    : "bg-gray-200 hover:bg-gray-300 text-gray-700"
                    }`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
                  </svg>
                  Kembali
                </button>

                {step === getTotalSteps() ? (
                  <button
                    onClick={handleSubmit}
                    disabled={isSubmitting || isPending}
                    className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all duration-200 text-base font-medium shadow-md hover:shadow-lg flex items-center justify-center disabled:opacity-70"
                  >
                    {isSubmitting && <LoadingSpinner />}
                    <span>
                      {isSubmitting ? "Submitting..." : "Submit Campaign"}
                    </span>
                    {!isSubmitting && (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </button>
                ) : (
                  <button
                    onClick={handleNextStep}
                    disabled={isSubmitting}
                    className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 text-base font-medium shadow-md hover:shadow-lg flex items-center justify-center disabled:opacity-70"
                  >
                    {isSubmitting && <LoadingSpinner />}
                    <span>
                      {isSubmitting ? "Loading..." : "Lanjut"}
                    </span>
                    {!isSubmitting && (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                    )}
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default CampaignPage;