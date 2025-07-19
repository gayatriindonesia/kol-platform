"use client";

import useCampaignAppStore from "@/storeCampaign";
import { useEffect, useState } from "react";
import { getAllBrand } from "@/lib/brand.actions";
import { Brand } from "@/types/brand";

const BrandSelector = () => {
  const { setSelectedBrand, selectedBrand } = useCampaignAppStore();
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBrands = async () => {
      try {
        const result = await getAllBrand();
        
        if (result.error || !result.data) {
          setError(result.error || "Gagal memuat data brand");
          return;
        }

        setBrands(result.data);
      } catch {
        setError("Terjadi kesalahan saat memuat brand");
      } finally {
        setLoading(false);
      }
    };
    
    fetchBrands();
  }, []);

  const handleBrandChange = (brandId: string) => {
    const selected = brands.find(brand => brand.id === brandId);
    setSelectedBrand(selected || null);
  };

  if (loading) return <div className="text-center text-gray-500 py-4">Memuat brand...</div>;
  if (error) return <div className="p-4 text-red-500">{error}</div>;
  if (brands.length === 0) return <div className="p-4 text-gray-500">Belum ada brand yang terdaftar</div>;

  return (
    <div className="space-y-4 p-4">
      
      <select 
        value={selectedBrand?.id || ""}
        onChange={(e) => handleBrandChange(e.target.value)}
        className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
      >
        <option value="">Pilih Brand</option>
        {brands.map((brand) => (
          <option key={brand.id} value={brand.id}>
            {brand.name}
          </option>
        ))}
      </select>
      
      {selectedBrand && (
        <div className="mt-2 p-3 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-800">
            Brand terpilih: <span className="font-semibold">{selectedBrand.name}</span>
          </p>
        </div>
      )}
    </div>
  );
};

export default BrandSelector;