'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Clock, CheckCircle } from 'lucide-react';

interface CampaignCountdownProps {
  endDate: string | Date;
  status: string;
  campaignId: string;
  onStatusChange?: (newStatus: string) => void;
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

const CampaignCountdown: React.FC<CampaignCountdownProps> = ({
  endDate,
  status,
  campaignId,
  onStatusChange
}) => {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [currentStatus, setCurrentStatus] = useState(status);
  const [isExpired, setIsExpired] = useState(false);

  const calculateTimeLeft = () => {
    const end = new Date(endDate);
    const now = new Date();
    const difference = end.getTime() - now.getTime();

    if (difference > 0) {
      return {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60)
      };
    }

    return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  };

  // Fungsi untuk check status campaign dari server
  const checkCampaignStatus = async () => {
    try {
      const response = await fetch(`/api/campaigns/${campaignId}/status`);
      if (response.ok) {
        const data = await response.json();
        if (data.status !== currentStatus) {
          setCurrentStatus(data.status);
          onStatusChange?.(data.status);
        }
      }
    } catch (error) {
      console.error('Error checking campaign status:', error);
    }
  };

  useEffect(() => {
    // Jika campaign sudah COMPLETED, jangan jalankan countdown
    if (currentStatus === 'COMPLETED' || currentStatus === 'REJECTED') {
      setIsExpired(true);
      return;
    }

    const timer = setInterval(() => {
      const newTimeLeft = calculateTimeLeft();
      setTimeLeft(newTimeLeft);

      // Check jika waktu sudah habis
      if (newTimeLeft.days === 0 && newTimeLeft.hours === 0 && 
          newTimeLeft.minutes === 0 && newTimeLeft.seconds === 0) {
        setIsExpired(true);
        clearInterval(timer);
      }
    }, 1000);

    // Check status campaign setiap 30 detik
    const statusChecker = setInterval(checkCampaignStatus, 30000);

    return () => {
      clearInterval(timer);
      clearInterval(statusChecker);
    };
  }, [endDate, currentStatus, campaignId]);

  // Update currentStatus jika prop status berubah
  useEffect(() => {
    setCurrentStatus(status);
    if (status === 'COMPLETED' || status === 'REJECTED') {
      setIsExpired(true);
    }
  }, [status]);

  // Jika campaign sudah selesai (manual atau otomatis)
  if (currentStatus === 'COMPLETED') {
    return (
      <Card className="border-green-200 bg-green-50">
        <CardContent className="p-4">
          <div className="flex items-center justify-center space-x-3">
            <CheckCircle className="w-6 h-6 text-green-600" />
            <div className="text-center">
              <h3 className="font-semibold text-green-800">Campaign Selesai</h3>
              <p className="text-sm text-green-600">Campaign telah diselesaikan</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (currentStatus === 'REJECTED') {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardContent className="p-4">
          <div className="flex items-center justify-center space-x-3">
            <div className="w-6 h-6 rounded-full bg-red-600 flex items-center justify-center">
              <span className="text-white text-xs font-bold">✕</span>
            </div>
            <div className="text-center">
              <h3 className="font-semibold text-red-800">Campaign Ditolak</h3>
              <p className="text-sm text-red-600">Campaign telah ditolak</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isExpired && currentStatus === 'ACTIVE') {
    return (
      <Card className="border-orange-200 bg-orange-50">
        <CardContent className="p-4">
          <div className="flex items-center justify-center space-x-3">
            <Clock className="w-6 h-6 text-orange-600" />
            <div className="text-center">
              <h3 className="font-semibold text-orange-800">Waktu Berakhir</h3>
              <p className="text-sm text-orange-600">Campaign telah berakhir</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-blue-200 bg-blue-50">
      <CardContent className="p-6">
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center space-x-2">
            <Clock className="w-5 h-5 text-blue-600" />
            <h3 className="font-semibold text-blue-800">Sisa Waktu Campaign</h3>
          </div>
          
          <div className="grid grid-cols-4 gap-4">
            <div className="text-center">
              <div className="bg-white rounded-lg p-3 shadow-sm border">
                <div className="text-2xl font-bold text-blue-600">{timeLeft.days}</div>
                <div className="text-xs text-gray-500 uppercase tracking-wide">Hari</div>
              </div>
            </div>
            <div className="text-center">
              <div className="bg-white rounded-lg p-3 shadow-sm border">
                <div className="text-2xl font-bold text-blue-600">{timeLeft.hours}</div>
                <div className="text-xs text-gray-500 uppercase tracking-wide">Jam</div>
              </div>
            </div>
            <div className="text-center">
              <div className="bg-white rounded-lg p-3 shadow-sm border">
                <div className="text-2xl font-bold text-blue-600">{timeLeft.minutes}</div>
                <div className="text-xs text-gray-500 uppercase tracking-wide">Menit</div>
              </div>
            </div>
            <div className="text-center">
              <div className="bg-white rounded-lg p-3 shadow-sm border">
                <div className="text-2xl font-bold text-blue-600">{timeLeft.seconds}</div>
                <div className="text-xs text-gray-500 uppercase tracking-wide">Detik</div>
              </div>
            </div>
          </div>
          
          <p className="text-sm text-blue-600">
            Campaign berakhir pada: {new Date(endDate).toLocaleDateString('id-ID', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default CampaignCountdown;