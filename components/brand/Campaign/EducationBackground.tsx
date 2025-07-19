"use client";

import useCampaignAppStore from "@/storeCampaign";
import { Textarea } from "@/components/ui/textarea";

const EducationBackground = () => {
  const { formData, setEducationBackground } = useCampaignAppStore();
  
  const education = formData.direct?.educationBackground?.educations?.[0] || {
    platform: "",
    service: "",
    followers: "",
  };

  const handleFieldChange = (field: keyof typeof education, value: string) => {
    setEducationBackground({
      educations: [{
        ...education,
        [field]: value
      }]
    });
  };

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold">Detail Informasi Campaign</h3>
      
      <div className="grid gap-6 mb-6 mt-2 md:grid-cols-2 border-gray-300 rounded-lg">
        <div className="flex flex-col gap-2">
          <label>Brief/Deskripsi Campaign</label>
          <Textarea
            value={education.platform}
            onChange={(e) => handleFieldChange('platform', e.target.value)}
            placeholder="Masukkan deskripsi campaign secara lengkap"
            className="min-h-[100px]"
          />
        </div>
        
        <div className="flex flex-col gap-2">
          <label>Aturan Foto/Video</label>
          <Textarea
            value={education.service}
            onChange={(e) => handleFieldChange('service', e.target.value)}
            placeholder="Masukkan aturan konten visual yang harus dipatuhi"
            className="min-h-[100px]"
          />
        </div>
        
        <div className="flex flex-col gap-2">
          <label>Aturan Caption</label>
          <Textarea
            value={education.followers}
            onChange={(e) => handleFieldChange('followers', e.target.value)}
            placeholder="Masukkan aturan penulisan caption yang berlaku"
            className="min-h-[100px]"
          />
        </div>
      </div>
    </div>
  );
};

export default EducationBackground;