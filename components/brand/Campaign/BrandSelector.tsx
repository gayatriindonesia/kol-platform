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
import { BriefcaseBusiness, Check, PlusCircle, Search, Sparkles, Building, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

const BrandSelector = () => {
  const { selectedBrand, setSelectedBrand } = useCampaignAppStore();
  const [brands, setBrands] = useState<Brand[]>([]);
  const [newBrandName, setNewBrandName] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [open, setOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

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
    setSearchTerm("");
  };

  const handleAddBrand = async () => {
    if (!newBrandName.trim()) return;
    
    setIsCreating(true);
    const result = await createBrand(newBrandName.trim());
    
    if (result.data) {
      setBrands((prev) => [...prev, result.data]);
      setSelectedBrand(result.data);
      setNewBrandName("");
      setOpen(false);
    }
    setIsCreating(false);
  };

  const filteredBrands = brands.filter(brand =>
    brand.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-4xl mx-auto p-8 bg-white rounded-2xl shadow-lg border border-gray-100">
      {/* Header Section */}
      <div className="text-center space-y-6 mb-12">
        {/* Icon & Title */}
        <div className="flex items-center justify-center space-x-4">
          <div className="relative">
            <div className="p-4 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl shadow-lg">
              <BriefcaseBusiness className="h-8 w-8 text-white" />
            </div>
            <div className="absolute -top-1 -right-1 p-1 bg-gradient-to-r from-pink-500 to-orange-500 rounded-full">
              <Sparkles className="h-3 w-3 text-white" />
            </div>
          </div>
          <div className="text-left">
            <h1 className="text-3xl lg:text-4xl font-bold text-gray-900">
              Tentukan Brand
            </h1>
            <p className="text-lg text-gray-600 mt-1">
              Pilih brand untuk campaign Anda
            </p>
          </div>
        </div>
      </div>

      {/* Brand Selection */}
      <div className="space-y-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-purple-100 rounded-lg">
            <Building className="h-5 w-5 text-purple-600" />
          </div>
          <div>
            <label className="block text-lg font-semibold text-gray-900">
              Pilih Brand
              <span className="text-red-500 ml-1">*</span>
            </label>
            <p className="text-sm text-gray-600 mt-1">
              Pilih brand yang sudah ada atau buat brand baru
            </p>
          </div>
        </div>

        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className={cn(
                "w-full justify-between h-14 px-4 text-left border-2 rounded-xl transition-all duration-200",
                selectedBrand 
                  ? "border-purple-300 bg-purple-50 text-gray-900 hover:border-purple-400" 
                  : "border-gray-200 bg-gray-50 text-gray-500 hover:border-gray-300 hover:bg-white",
                "focus:outline-none focus:ring-4 focus:ring-purple-100"
              )}
            >
              <div className="flex items-center space-x-3">
                {selectedBrand ? (
                  <>
                    <div className="w-8 h-8 bg-gradient-to-r from-purple-400 to-indigo-400 rounded-lg flex items-center justify-center">
                      <Building className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{selectedBrand.name}</div>
                      <div className="text-xs text-gray-600">Brand terpilih</div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="w-8 h-8 bg-gray-300 rounded-lg flex items-center justify-center">
                      <Building className="w-4 h-4 text-gray-500" />
                    </div>
                    <span className="text-gray-500">Pilih brand untuk campaign</span>
                  </>
                )}
              </div>
              <ChevronDown className={cn(
                "h-4 w-4 shrink-0 transition-transform duration-200",
                open && "transform rotate-180"
              )} />
            </Button>
          </PopoverTrigger>

          <PopoverContent
            align="start"
            sideOffset={8}
            className="w-full sm:min-w-[--radix-popover-trigger-width] sm:max-w-lg p-0 rounded-2xl shadow-xl border-0 bg-white"
          >
            {/* Search Bar */}
            <div className="p-4 border-b border-gray-100">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Cari brand..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Brand List */}
            <div className="max-h-60 overflow-y-auto">
              {filteredBrands.length > 0 ? (
                <div className="p-2 space-y-1">
                  {filteredBrands.map((brand) => (
                    <div
                      key={brand.id}
                      onClick={() => handleSelect(brand)}
                      className={cn(
                        "px-4 py-3 cursor-pointer rounded-xl transition-all duration-200 flex items-center space-x-3 group",
                        selectedBrand?.id === brand.id 
                          ? "bg-purple-100 text-purple-900 border border-purple-200" 
                          : "hover:bg-gray-50 text-gray-700"
                      )}
                    >
                      <div className={cn(
                        "w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200",
                        selectedBrand?.id === brand.id
                          ? "bg-gradient-to-r from-purple-400 to-indigo-400"
                          : "bg-gray-200 group-hover:bg-gray-300"
                      )}>
                        {selectedBrand?.id === brand.id ? (
                          <Check className="w-4 h-4 text-white" />
                        ) : (
                          <Building className="w-4 h-4 text-gray-600" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="font-medium">{brand.name}</div>
                        <div className="text-xs text-gray-500">Brand aktif</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center text-gray-500">
                  <Building className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <div className="text-sm">
                    {searchTerm ? "Brand tidak ditemukan" : "Belum ada brand"}
                  </div>
                </div>
              )}
            </div>

            {/* Add New Brand */}
            <div className="border-t border-gray-100 p-4 bg-gray-50 rounded-b-2xl">
              <div className="flex items-center space-x-2 mb-3">
                <PlusCircle className="w-4 h-4 text-gray-600" />
                <span className="text-sm font-medium text-gray-700">Tambah Brand Baru</span>
              </div>
              <div className="flex space-x-2">
                <input
                  type="text"
                  placeholder="Nama brand baru"
                  value={newBrandName}
                  onChange={(e) => setNewBrandName(e.target.value)}
                  className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
                <Button
                  size="sm"
                  onClick={handleAddBrand}
                  disabled={!newBrandName.trim() || isCreating}
                  className="bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white px-4 py-2 rounded-lg transition-all duration-200"
                >
                  {isCreating ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-1" />
                  ) : (
                    <PlusCircle className="w-4 h-4 mr-1" />
                  )}
                  {isCreating ? "Loading..." : "Tambah"}
                </Button>
              </div>
            </div>
          </PopoverContent>
        </Popover>

        {/* Selected Brand Display */}
        {selectedBrand && (
          <div className="p-6 bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-xl">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-xl flex items-center justify-center">
                <Building className="w-6 h-6 text-white" />
              </div>
              <div>
                <h4 className="text-lg font-semibold text-gray-900">Brand Terpilih</h4>
                <p className="text-purple-700 font-medium text-lg">{selectedBrand.name}</p>
                <p className="text-sm text-gray-600 mt-1">
                  Brand ini akan digunakan untuk campaign Anda
                </p>
              </div>
              <div className="ml-auto">
                <Check className="w-8 h-8 text-purple-500" />
              </div>
            </div>
          </div>
        )}

        {/* Tips Section */}
        <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-xl p-6">
          <div className="flex items-start space-x-3">
            <div className="p-2 bg-purple-100 rounded-lg mt-1">
              <Sparkles className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">
                Tips Memilih Brand
              </h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center space-x-2">
                  <div className="w-1.5 h-1.5 bg-purple-500 rounded-full"></div>
                  <span>Pastikan brand sesuai dengan target audience campaign</span>
                </li>
                <li className="flex items-center space-x-2">
                  <div className="w-1.5 h-1.5 bg-purple-500 rounded-full"></div>
                  <span>Gunakan nama brand yang mudah diingat dan profesional</span>
                </li>
                <li className="flex items-center space-x-2">
                  <div className="w-1.5 h-1.5 bg-purple-500 rounded-full"></div>
                  <span>Brand baru akan tersimpan untuk campaign berikutnya</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BrandSelector;