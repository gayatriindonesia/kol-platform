'use client';

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FaTiktok, FaSpinner } from "react-icons/fa";
import { toast } from "sonner";
import { initiateTikTokAuth } from "@/lib/tiktok.actions";

export default function ConnectTikTokButton() {
  const [isLoading, setIsLoading] = useState(false);

  const handleConnect = async () => {
    setIsLoading(true);
    try {
      await initiateTikTokAuth();
    } catch (error) {
      console.error("Failed to connect TikTok:", error);
      toast.error("Failed to connect to TikTok. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button 
      onClick={handleConnect}
      variant="outline" 
      className={`flex items-center justify-center gap-2 px-6 py-3 font-medium transition-all duration-200
                  bg-gradient-to-r from-pink-500 to-purple-600 text-white
                  hover:from-pink-600 hover:to-purple-700 hover:shadow-lg
                  ${isLoading ? 'cursor-not-allowed opacity-70' : ''}`}
      disabled={isLoading}
    >
      {isLoading ? (
        <FaSpinner className="w-4 h-4 animate-spin" />
      ) : (
        <FaTiktok className="w-4 h-4" />
      )}
      {isLoading ? 'Connecting...' : 'Connect TikTok'}
    </Button>
  );
}
