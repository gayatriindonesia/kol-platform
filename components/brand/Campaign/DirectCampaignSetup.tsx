"use client";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { getAllCategories } from '@/lib/category.actions';
import useCampaignAppStore from '@/storeCampaign';
import { useEffect, useMemo, useState } from 'react';

// Type untuk data kategori hasil transformasi
interface TransformedCategory {
  id: string;
  name: string;
  description?: string;
}

const DirectCampaignSetup = () => {
  const {
    formData,
    setDirectCategories,
    setDirectCampaignData,
  } = useCampaignAppStore();

  const [loading, setLoading] = useState(true);
  const [displayValue, setDisplayValue] = useState("");
  const [allCategories, setAllCategories] = useState<TransformedCategory[]>([]);

  // Formatter IDR
  const formatter = useMemo(() => new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }), []);

  // Sync displayValue saat formData.direct.budget berubah (misal dari reset atau load)
  useEffect(() => {
    setDisplayValue(formatter.format(formData.direct.budget));
  }, [formData.direct.budget, formatter]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Hapus semua kecuali angka
    const numericString = e.target.value.replace(/[^0-9]/g, "");
    const numericValue = parseInt(numericString || "0", 10);

    // Update store
    setDirectCampaignData({ budget: numericValue });

    // Update tampilan dengan format IDR
    setDisplayValue(formatter.format(numericValue));
  };

  // Handle category selection
  const handleCategoryChange = (categoryId: string, isChecked: boolean) => {
    const category = allCategories.find(c => c.id === categoryId);
    if (!category) return;

    let updatedCategories;
    if (isChecked) {
      // Add category jika belum ada
      if (!formData.direct.categories.find(c => c.id === categoryId)) {
        updatedCategories = [...formData.direct.categories, category];
      } else {
        updatedCategories = formData.direct.categories;
      }
    } else {
      // Remove category
      updatedCategories = formData.direct.categories.filter(c => c.id !== categoryId);
    }

    setDirectCampaignData({ categories: updatedCategories });
  };

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const { data, status } = await getAllCategories();
        if (status === 200 && data) {
          // Transformasi data kategori
          const transformedData: TransformedCategory[] = data.map(c => ({
            id: c.id,
            name: c.name,
            ...(c.description && { description: c.description }) // Hanya include jika tidak null
          }));
          
          setAllCategories(transformedData);
          setDirectCategories(transformedData);
        }
      } catch (err) {
        console.error('Gagal memuat kategori:', err);
      } finally {
        setLoading(false);
      }
    };

    loadCategories();
  }, [setDirectCategories]);

  if (loading) return <div>Memuat Category...</div>;

  return (
    <div>
      {/* Input Budget */}
      <div className="mb-4">
        <Label htmlFor="budget">Budget</Label>
        <div className="relative">
          {/* Prefix "IDR" */}
          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
            IDR
          </span>
          <Input
            id="budget"
            type="text"
            value={displayValue}
            onChange={handleChange}
            className="pl-12"
            placeholder="0"
          />
        </div>
      </div>

      {/**
      <div className="mb-4">
        <Label htmlFor="target-audience">Target Audience</Label>
        <Input
          id="target-audience"
          type="text"
          value={formData.direct.targetAudience}
          onChange={(e) =>
            setDirectCampaignData({ targetAudience: e.target.value })
          }
          className="border rounded p-2"
        />
      </div>
      */}

      {/* Pilihan kategori */}
      <div className="mb-4">
        <Label>Pilih Kategori</Label>
        <div className="mt-2 space-y-2">
          {allCategories.map((category) => (
            <div key={category.id} className="flex items-center">
              <input
                type="checkbox"
                id={`category-${category.id}`}
                checked={formData.direct.categories.some(c => c.id === category.id)}
                onChange={(e) => handleCategoryChange(category.id, e.target.checked)}
                className="mr-2"
              />
              <label htmlFor={`category-${category.id}`} className="cursor-pointer">
                {category.name}
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Tampilkan kategori yang dipilih */}
      {formData.direct.categories.length > 0 && (
        <div className="mb-4">
          <Label>Kategori Terpilih:</Label>
          <div className="mt-2">
            {formData.direct.categories.map((category) => (
              <span
                key={category.id}
                className="inline-block bg-blue-100 text-blue-800 px-2 py-1 rounded mr-2 mb-2"
              >
                {category.name}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default DirectCampaignSetup;