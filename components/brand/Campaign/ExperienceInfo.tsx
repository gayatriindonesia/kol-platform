"use client";

import useCampaignAppStore from "@/storeCampaign";
import { X } from "lucide-react"; // Import ikon close

const ExperienceInfo = () => {
  const { formData, setExperienceInfo } = useCampaignAppStore();
  
  const experienceInfo = formData.direct?.experienceInfo || {
    fresher: false,
    experiences: []
  };

  // Fungsi hapus kontak
  const handleDeleteContact = (index: number) => {
    const newExperiences = experienceInfo.experiences.filter((_, i) => i !== index);
    setExperienceInfo({ experiences: newExperiences });
  };

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold">Tanggal Campaign <span className="text-red-500">*</span></h3>
      
      {/**
      <div className="flex items-center gap-2 mb-4">
        <input
          type="checkbox"
          id="fresher"
          checked={experienceInfo.fresher}
          onChange={(e) => {
            setExperienceInfo({ fresher: e.target.checked });
          }}
          className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
        />
        <label htmlFor="fresher" className="text-sm font-medium text-gray-700">
          Gunakan akun ini?
        </label>
      </div>
       */}

      {!experienceInfo.fresher && (
        <div className="space-y-4">
          {experienceInfo.experiences.map((exp, index) => (
            <div key={index} className="group relative grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Tombol Hapus */}
              <button
                type="button"
                onClick={() => handleDeleteContact(index)}
                className="absolute -right-2 -top-2 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="h-5 w-5 text-red-500 bg-white rounded-full" />
              </button>

              <input
                value={exp.company}
                onChange={(e) => {
                  const newExperiences = [...experienceInfo.experiences];
                  newExperiences[index].company = e.target.value;
                  setExperienceInfo({ experiences: newExperiences });
                }}
                placeholder="Email"
                className="p-2 border rounded focus:ring-blue-500 focus:border-blue-500"
              />
              <input
                value={exp.position}
                onChange={(e) => {
                  const newExperiences = [...experienceInfo.experiences];
                  newExperiences[index].position = e.target.value;
                  setExperienceInfo({ experiences: newExperiences });
                }}
                placeholder="Name"
                className="p-2 border rounded focus:ring-blue-500 focus:border-blue-500"
              />
              <input
                value={exp.duration}
                onChange={(e) => {
                  const newExperiences = [...experienceInfo.experiences];
                  newExperiences[index].duration = e.target.value;
                  setExperienceInfo({ experiences: newExperiences });
                }}
                placeholder="No Handphone (opsional)"
                className="p-2 border rounded focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          ))}
          
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => {
                setExperienceInfo({
                  experiences: [
                    ...experienceInfo.experiences,
                    { company: "", position: "", duration: "" }
                  ]
                });
              }}
              className="text-blue-600 hover:text-blue-800 text-sm"
            >
              + Tambah Kontak Akun
            </button>

            {/* Tombol Hapus Semua */}
            {experienceInfo.experiences.length > 0 && (
              <button
                type="button"
                onClick={() => setExperienceInfo({ experiences: [] })}
                className="text-red-600 hover:text-red-800 text-sm"
              >
                Hapus Semua
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ExperienceInfo;