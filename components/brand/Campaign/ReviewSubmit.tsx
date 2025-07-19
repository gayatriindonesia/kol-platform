"use client";

import { getBrandById } from "@/lib/brand.actions";
import useCampaignAppStore from "@/storeCampaign";
import { useEffect, useState } from "react";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { BadgeCheck } from "lucide-react";
import { Accordion } from "@radix-ui/react-accordion";
import { AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const ReviewSubmit = () => {
  const {
    name,
    campaignType,
    formData,
    selectedBrand,
    invitationMessage,
    budgetPerInfluencer,
    selectedInfluencers
  } = useCampaignAppStore();

  const [brandName, setBrandName] = useState("-");

  const formatDate = (date?: Date) => {
    if (!date) return "-";
    return format(new Date(date), "d MMMM yyyy", { locale: id });
  };

  const calculateDuration = () => {
    if (!formData.startDate || !formData.endDate) return "-";
    const start = formData.startDate.getTime();
    const end = formData.endDate.getTime();
    const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    return `${days} hari`;
  };

  console.log("selectedInfluencers:", selectedInfluencers);
  console.log("formData.selfService.selectedInfluencers:", formData.selfService?.selectedInfluencers);


  useEffect(() => {
    const fetchBrand = async () => {
      if (selectedBrand?.id) {
        const result = await getBrandById(selectedBrand.id);
        if (result.success && result.brand) {
          setBrandName(result.brand.name);
        }
      }
    };
    fetchBrand();
  }, [selectedBrand?.id]);

  return (
    <div className="bg-white p-6 rounded-lg shadow-md space-y-6">
      <h2 className="text-2xl font-semibold border-b pb-4">Review Campaign</h2>

      {/* Info Umum */}
      <div className="space-y-4">
        <div className="flex flex-col">
          <span className="text-sm text-gray-500">Nama Campaign</span>
          <span className="font-medium">{name || "-"}</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col">
            <span className="text-sm text-gray-500">Jenis Campaign</span>
            <span className="font-medium capitalize">{campaignType || "-"}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-sm text-gray-500">Brand</span>
            <span className="font-medium">{brandName || "-"}</span>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex flex-col">
            <span className="text-sm text-gray-500">Tanggal Mulai</span>
            <span className="font-medium">{formatDate(formData.startDate)}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-sm text-gray-500">Tanggal Selesai</span>
            <span className="font-medium">{formatDate(formData.endDate)}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-sm text-gray-500">Durasi</span>
            <span className="font-medium">{calculateDuration()}</span>
          </div>
        </div>
      </div>

      {/* Jika campaignType === selfService tampilkan daftar influencer */}
      {campaignType === "selfService" && (
        <div className="space-y-6">
          <div className="border rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-4">Influencer Terpilih</h3>
            <div className="space-y-3">
              <Accordion type="multiple" className="w-full">
                {formData.selfService?.selectedInfluencers?.map((influencer, index) => (
                  <AccordionItem
                    key={index}
                    value={`item-${index}`}
                    className="border rounded-lg bg-gray-50 px-4"
                  >
                    <AccordionTrigger className="py-3">
                      <div className="flex items-center gap-2">
                        <BadgeCheck className="h-5 w-5 text-blue-500" />
                        <span className="font-medium">{influencer.influencerName}</span>
                      </div>
                    </AccordionTrigger>

                    <AccordionContent className="pb-4">
                      <div className="flex items-start gap-4">
                        {/* Avatar */}
                        <div className="w-20 h-20 flex-shrink-0 overflow-hidden rounded-full border">
                          <img
                            src={influencer.image || "https://ui-avatars.com/api/?name=User"}
                            alt={influencer.influencerName}
                            className="w-full h-full object-cover"
                          />
                        </div>

                        {/* Detail Info */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                          <div>
                            <span className="text-sm text-gray-500">Username</span>
                            <p className="font-medium">@{influencer.username}</p>
                          </div>
                          <div className="space-y-2">
                            {influencer.platforms.map((p, i) => (
                              <div key={i} className="flex justify-between items-center bg-gray-100 p-2 rounded-md">
                                <div>
                                  <p className="text-sm font-medium">{p.name}</p>
                                  <p className="text-xs text-gray-500">@{p.username}</p>
                                </div>
                                <span className="text-xs text-gray-700">{parseInt(p.followers).toLocaleString()} followers</span>
                              </div>
                            ))}
                          </div>
                          <div>
                            <span className="text-sm text-gray-500">Kategori</span>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {influencer.categories.length > 0 ? (
                                influencer.categories.map((cat: string, i: number) => (
                                  <span
                                    key={i}
                                    className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full"
                                  >
                                    {cat}
                                  </span>
                                ))
                              ) : (
                                <span className="text-sm text-gray-400">Tidak ada kategori</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </div>
          <div className="border rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-4">Detail Undangan</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <span className="text-sm text-gray-500">Pesan Undangan</span>
                <p className="font-medium whitespace-pre-wrap">{invitationMessage || "-"}</p>
              </div>
              <div>
                <span className="text-sm text-gray-500">Total Budget</span>
                <p className="font-medium">
                  {budgetPerInfluencer ? `Rp ${budgetPerInfluencer.toLocaleString()}` : "-"}
                </p>
              </div>
              <div>
                <span className="text-sm text-gray-500">Total Influencer</span>
                <p className="font-medium">
                  {selectedInfluencers?.length || 0}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReviewSubmit;
