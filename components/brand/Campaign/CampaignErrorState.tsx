"use client";

import { RefreshCcw, FolderOpen } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function CampaignErrorState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center space-y-4">
      <div className="p-6 bg-red-50 rounded-full">
        <FolderOpen className="w-12 h-12 text-red-500" />
      </div>
      <h2 className="text-xl font-semibold text-gray-800">
        Campaign Belum Ada
      </h2>
      <p className="text-gray-500 max-w-md">
        Silakan buat Brand terlebih dahulu agar dapat menggunakan fitur Campaign. Periksa koneksi Anda atau coba lagi nanti.
      </p>
      <Button
        variant="outline"
        className="flex items-center gap-2"
        onClick={() => window.location.reload()}
      >
        <RefreshCcw className="w-4 h-4" />
        Muat Ulang
      </Button>
    </div>
  );
}
