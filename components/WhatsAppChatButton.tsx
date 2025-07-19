// components/WhatsAppButton.tsx
"use client";

import { Button } from "@/components/ui/button";
import { MessageCircleIcon } from "lucide-react";

const WhatsAppButton = () => {
  const phoneNumber = "6281234567890"; // Ganti dengan nomor kamu (tanpa +)

  const message = "Halo, saya ingin bertanya mengenai layanan Anda"; // Opsional

  const handleClick = () => {
    const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank");
  };

  return (
    <Button onClick={handleClick} className="bg-green-500 hover:bg-green-600 text-white">
      <MessageCircleIcon className="mr-2 h-4 w-4" />
      Chat via WhatsApp
    </Button>
  );
};

export default WhatsAppButton;