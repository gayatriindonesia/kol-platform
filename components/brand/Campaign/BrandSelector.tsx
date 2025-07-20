"use client";

import { useEffect, useState } from "react";
import { getAllBrand, createBrand } from "@/lib/brand.actions";
import useCampaignAppStore from "@/storeCampaign";
import { Brand } from "@/types/brand";

import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Check, PlusCircle } from "lucide-react";
import { cn } from "@/lib/utils";

const BrandSelector = () => {
  const { selectedBrand, setSelectedBrand } = useCampaignAppStore();
  const [brands, setBrands] = useState<Brand[]>([]);
  const [newBrandName, setNewBrandName] = useState("");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const fetchBrands = async () => {
      const result = await getAllBrand();
      if (result.data) {
        setBrands(result.data);
      }
    };
    fetchBrands();
  }, []);

  const handleSelect = (brand: Brand) => {
    setSelectedBrand(brand);
    setOpen(false);
  };

  const handleAddBrand = async () => {
    if (!newBrandName.trim()) return;

    const result = await createBrand(newBrandName.trim());
    if (result.data) {
      setBrands((prev) => [...prev, result.data]);
      setSelectedBrand(result.data);
      setNewBrandName("");
      setOpen(false);
    }
  };

  return (
    <div className="p-4 space-y-2">
      <label className="block text-sm font-medium text-gray-700 mb-1">Pilih Brand</label>

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
          >
            {selectedBrand ? selectedBrand.name : "Pilih Brand"}
          </Button>
        </PopoverTrigger>

        <PopoverContent
          align="start"
          sideOffset={8}
          className="w-full sm:min-w-[--radix-popover-trigger-width] sm:max-w-sm p-0 rounded-xl shadow-lg border bg-white"
        >
          {/* Scrollable brand list */}
          <div className="max-h-60 overflow-y-auto">
            {brands.map((brand) => (
              <div
                key={brand.id}
                onClick={() => handleSelect(brand)}
                className={cn(
                  "px-4 py-2 cursor-pointer hover:bg-gray-100 flex items-center",
                  selectedBrand?.id === brand.id && "bg-blue-100"
                )}
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    selectedBrand?.id === brand.id ? "opacity-100" : "opacity-0"
                  )}
                />
                {brand.name}
              </div>
            ))}
          </div>

          {/* Add new brand form */}
          <div className="border-t px-4 py-3">
            <div className="text-sm font-medium mb-1">Tambah Brand Baru</div>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Nama brand"
                value={newBrandName}
                onChange={(e) => setNewBrandName(e.target.value)}
                className="flex-1 px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <Button
                size="sm"
                onClick={handleAddBrand}
                disabled={!newBrandName.trim()}
              >
                <PlusCircle className="w-4 h-4 mr-1" />
                Tambah
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>

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
