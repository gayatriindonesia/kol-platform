'use client';

import { Button } from "@/components/ui/button";
import { FaTiktok } from "react-icons/fa";
import { toast } from "sonner";
import { initiateTikTokAuth } from "@/lib/tiktok.actions";

export default function ConnectTikTokButton() {
  const handleConnect = async () => {
    try {
      await initiateTikTokAuth();
    } catch (error) {
      console.error("Failed to connect TikTok:", error);
      toast.error("Failed to connect to TikTok. Please try again.");
    }
  };

  return (
    <Button 
      onClick={handleConnect}
      variant="outline" 
      className="flex items-center gap-2 bg-black text-white hover:bg-gray-800"
    >
      <FaTiktok className="w-4 h-4"/>
      Connect TikTok
    </Button>
  );
}