"use client";

import { Button } from "@/components/ui/button";
import useCampaignAppStore from "@/storeCampaign";

const CampaignTypeSelector = () => {
  const { setCampaignType } = useCampaignAppStore();

  return (
    <div className="space-y-6 p-6">
      <h2 className="text-xl text-center text-gray-600">
        Pilih jenis campaign yang ingin Anda buat
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="flex flex-col items-center p-6 border rounded-lg hover:border-blue-500">
          <h3 className="text-lg font-semibold mb-2">Direct Campaign</h3>
          <p className="text-gray-600 text-center mb-4">
            Tim kami akan membantu mengelola campaign Anda secara profesional
          </p>
          <Button onClick={() => setCampaignType('direct')}>
            Pilih Direct
          </Button>
        </div>
        
        <div className="flex flex-col items-center p-6 border rounded-lg hover:border-blue-500">
          <h3 className="text-lg font-semibold mb-2">Self-Service</h3>
          <p className="text-gray-600 text-center mb-4">
            Kelola campaign secara mandiri dengan alat yang kami sediakan
          </p>
          <Button onClick={() => setCampaignType('selfService')}>
            Pilih Self-Service
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CampaignTypeSelector;