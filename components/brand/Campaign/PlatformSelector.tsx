"use client";

import { useEffect, useState } from "react";
import useCampaignAppStore from "@/storeCampaign";
import { X } from "lucide-react";
import { getAllPlatform } from "@/lib/platform.actions"; // Server action untuk fetch platforms
import { Platform, PlatformSelection } from "@/types/campaign";

const PlatformSelector = () => {
  const { formData, setDirectCampaignData } = useCampaignAppStore();
  const [platforms, setPlatforms] = useState<Platform[]>([]);
  const [loading, setLoading] = useState(true);

  // Get selected platforms from formData or initialize with empty array
  const platformSelections = formData.direct?.platformSelections || [
    {
      platformId: "",
      platformName: "",
      serviceId: "",
      serviceName: "",
      follower: "",
    },
  ];

  // Fetch available platforms and services using server action
  useEffect(() => {
    const fetchPlatforms = async () => {
      try {
        setLoading(true);
        const response = await getAllPlatform();
        
        // Transform the API response to match our Platform interface
        if (response.success && response.data) {
          const transformedData: Platform[] = response.data.map(platform => ({
            id: platform.id,
            name: platform.name,
            services: platform.services.map(service => ({
              id: service.id,
              name: service.name,
              description: service.description || undefined,
              type: service.type
            }))
          }));
          
          setPlatforms(transformedData);
        } else {
          console.error("Failed to fetch platforms:", response.error);
        }
      } catch (error) {
        console.error("Error fetching platforms:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPlatforms();
  }, []);

  // Update the platform selections in the store
  const updatePlatformSelections = (newSelections: PlatformSelection[]) => {
    setDirectCampaignData({ platformSelections: newSelections });
  };

  // Handle platform change
  const handlePlatformChange = (index: number, platformId: string) => {
    const platform = platforms.find((p) => p.id === platformId);
    const newSelections = [...platformSelections];
    
    newSelections[index] = {
      ...newSelections[index],
      platformId,
      platformName: platform?.name || "",
      serviceId: "", // Reset service when platform changes
      serviceName: ""
    };
    
    updatePlatformSelections(newSelections);
  };

  // Handle service change
  const handleServiceChange = (index: number, serviceId: string) => {
    const platform = platforms.find((p) => p.id === platformSelections[index].platformId);
    const service = platform?.services.find((s) => s.id === serviceId);
    
    const newSelections = [...platformSelections];
    newSelections[index] = {
      ...newSelections[index],
      serviceId,
      serviceName: service?.name || ""
    };
    
    updatePlatformSelections(newSelections);
  };

  // Handle followers change
  const handleFollowerChange = (index: number, follower: string) => {
    const newSelections = [...platformSelections];
    newSelections[index] = {
      ...newSelections[index],
      follower
    };
    
    updatePlatformSelections(newSelections);
  };

  // Add a new platform selection
  const addPlatformSelection = () => {
    updatePlatformSelections([
      ...platformSelections,
      {
        platformId: "",
        platformName: "",
        serviceId: "",
        serviceName: "",
        follower: "",
      }
    ]);
  };

  // Remove a platform selection
  const removePlatformSelection = (index: number) => {
    const newSelections = platformSelections.filter((_, i) => i !== index);
    updatePlatformSelections(newSelections);
  };

  // Remove all platform selections
  const removeAllPlatformSelections = () => {
    updatePlatformSelections([]);
  };

  if (loading) {
    return <div className="text-center text-gray-500 py-4">Memuat platform...</div>;
  }

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold">Pilih Platform</h3>
      
      {platformSelections.length === 0 ? (
        <div className="text-gray-500 italic">Belum ada platform yang dipilih</div>
      ) : (
        platformSelections.map((selection, idx) => (
          <div
            key={idx}
            className="group relative grid gap-6 mb-6 mt-2 md:grid-cols-3 border border-gray-300 p-4 rounded-lg"
          >
            {/* Delete button */}
            <button
              type="button"
              onClick={() => removePlatformSelection(idx)}
              className="absolute -right-2 -top-2 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X className="h-5 w-5 text-red-500 bg-white rounded-full" />
            </button>
            
            {/* Platform dropdown */}
            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-700 mb-1">Platform</label>
              <select
                value={selection.platformId}
                onChange={(e) => handlePlatformChange(idx, e.target.value)}
                className="p-2 border rounded focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Pilih Platform</option>
                {platforms.map((platform) => (
                  <option key={platform.id} value={platform.id}>
                    {platform.name}
                  </option>
                ))}
              </select>
            </div>
            
            {/* Service dropdown */}
            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-700 mb-1">Service</label>
              <select
                value={selection.serviceId}
                onChange={(e) => handleServiceChange(idx, e.target.value)}
                disabled={!selection.platformId}
                className="p-2 border rounded focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Pilih Service</option>
                {platforms
                  .find((p) => p.id === selection.platformId)
                  ?.services.map((service) => (
                    <option key={service.id} value={service.id}>
                      {service.name} ({service.type})
                    </option>
                  ))}
              </select>
            </div>
            
            {/* Followers input */}
            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-700 mb-1">Minimal Followers</label>
              <input
                type="number"
                value={selection.follower}
                onChange={(e) => handleFollowerChange(idx, e.target.value)}
                placeholder="Min. Followers"
                className="p-2 border rounded focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        ))
      )}
      
      <div className="flex gap-4">
        <button
          type="button"
          onClick={addPlatformSelection}
          className="text-blue-600 hover:text-blue-800 text-sm"
        >
          + Tambah Platform
        </button>
        
        {/* Remove all button */}
        {platformSelections.length > 0 && (
          <button
            type="button"
            onClick={removeAllPlatformSelections}
            className="text-red-600 hover:text-red-800 text-sm"
          >
            Hapus Semua
          </button>
        )}
      </div>
    </div>
  );
};

export default PlatformSelector;