"use client";
import EducationBackground from "@/components/EducationBackground";
import ExperienceInfo from "@/components/ExperienceInfo";
import PersonalInfo from "@/components/PersonalInfo";
import ProgressBar from "@/components/ProgressBar";
import ReviewSubmit from "@/components/ReviewSubmit";
import useJobAppStore from "@/store";

export default function Home() {
  const { step } = useJobAppStore();

  const renderStep = () => {
    switch (step) {
      case 1:
        return <PersonalInfo />;
      case 2:
        return <ExperienceInfo />;
      case 3:
        return <EducationBackground />;
      case 4:
        return <ReviewSubmit />;
      default:
        return null;
    }
  };

  return (
    <div className="flex justify-center py-10">
      <div className="bg-gray-100 rounded-lg w-full p-10 mx-5">
        <div className="pt-2 mb-5 text-center text-2xl sm:text-3xl font-semibold">
          Job Application
        </div>
        {/* progress bar */}
        <ProgressBar />

        {/* steps */}
        <div>{renderStep()}</div>
      </div>
    </div>
  );
}
