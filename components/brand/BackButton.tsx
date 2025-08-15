"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

interface BackButtonProps {
  fallbackUrl?: string; // opsional, jika tidak ada history
  label?: string;       // opsional, teks tombol
}

export default function BackButton({ fallbackUrl = "/", label = "Kembali" }: BackButtonProps) {
  const router = useRouter();

  const handleBack = () => {
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push(fallbackUrl);
    }
  };

  return (
    <Button
      variant="outline"
      size="lg"
      className="font-medium"
      onClick={handleBack}
    >
      <ArrowLeft className="w-4 h-4 mr-2" />
      {label}
    </Button>
  );
}
