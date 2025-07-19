"use client";

import { useState } from 'react';
import useCampaignAppStore from '@/storeCampaign';

const CampaignNameInput = () => {
  const { name, setName } = useCampaignAppStore();
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setName(value);
    
    // Validasi sederhana
    if (!value.trim()) {
      setError('Nama campaign tidak boleh kosong');
    } else {
      setError(null);
    }
  };

  return (
    <div className="mb-6">
      
      <div className="mb-2 text-gray-600">
        Berikan nama yang jelas untuk campaign ini
      </div>
      
      <div className="mb-4">
        <input
          type="text"
          value={name}
          onChange={handleChange}
          placeholder="Masukkan nama campaign"
          className={`w-full px-4 py-2 border rounded-lg ${
            error ? 'border-red-500' : 'border-gray-300'
          } focus:outline-none focus:ring-2 focus:ring-blue-500`}
        />
        {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
      </div>
    </div>
  );
};

export default CampaignNameInput;