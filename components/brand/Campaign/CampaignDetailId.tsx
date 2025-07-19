'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Clock, Calendar, CheckCircle, XCircle, AlertCircle, RefreshCw, Info, User, Building, ArrowLeft, Edit, StopCircle, Timer } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface Campaign {
  id: string;
  name?: string;
  status?: string;
  description?: string;
  target?: string;
  budget?: number;
  createdAt?: string | Date;
  updatedAt?: string | Date;
  startDate?: string | Date;
  endDate?: string | Date;
  brands?: {
    user: {
      name: string | null;
      email: string | null;
    };
    id: string;
    name: string;
    createdAt: Date;
    updatedAt: Date;
    userId: string;
  };
}

interface CampaignDetailIdProps {
  campaign: Campaign;
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

const CampaignDetailId: React.FC<CampaignDetailIdProps> = ({ campaign }) => {
  const [refreshing, setRefreshing] = useState(false);
  const [stopping, setStopping] = useState(false);
  const [timeUntilStart, setTimeUntilStart] = useState<TimeLeft | null>(null);
  const [timeUntilEnd, setTimeUntilEnd] = useState<TimeLeft | null>(null);
  const [campaignStatus, setCampaignStatus] = useState<'upcoming' | 'active' | 'ended'>('upcoming');
  const router = useRouter();

  const calculateTimeLeft = (targetDate: string | Date): TimeLeft | null => {
    const now = new Date().getTime();
    const target = new Date(targetDate).getTime();
    const difference = target - now;

    if (difference <= 0) {
      return null;
    }

    return {
      days: Math.floor(difference / (1000 * 60 * 60 * 24)),
      hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
      minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
      seconds: Math.floor((difference % (1000 * 60)) / 1000)
    };
  };

  const updateCountdowns = () => {
    const now = new Date();
    const startDate = campaign.startDate ? new Date(campaign.startDate) : null;
    const endDate = campaign.endDate ? new Date(campaign.endDate) : null;

    if (startDate && endDate) {
      if (now < startDate) {
        // Campaign belum dimulai
        setCampaignStatus('upcoming');
        setTimeUntilStart(calculateTimeLeft(startDate));
        setTimeUntilEnd(null);
      } else if (now >= startDate && now < endDate) {
        // Campaign sedang berjalan
        setCampaignStatus('active');
        setTimeUntilStart(null);
        setTimeUntilEnd(calculateTimeLeft(endDate));
      } else {
        // Campaign sudah berakhir
        setCampaignStatus('ended');
        setTimeUntilStart(null);
        setTimeUntilEnd(null);
      }
    }
  };

  useEffect(() => {
    updateCountdowns();
    const interval = setInterval(updateCountdowns, 1000);
    return () => clearInterval(interval);
  }, [campaign.startDate, campaign.endDate]);

  const formatTimeUnit = (value: number, unit: string) => {
    return (
      <div className="flex flex-col items-center bg-gray-50 rounded-lg p-3 min-w-[70px]">
        <div className="text-2xl font-bold text-gray-900">{value.toString().padStart(2, '0')}</div>
        <div className="text-xs text-gray-600 uppercase">{unit}</div>
      </div>
    );
  };

  const renderCountdown = (timeLeft: TimeLeft | null, title: string, bgColor: string, textColor: string) => {
    if (!timeLeft) return null;

    return (
      <Card className={`border-0 shadow-lg ${bgColor}`}>
        <CardHeader className="pb-3">
          <CardTitle className={`flex items-center gap-2 ${textColor}`}>
            <Timer className="w-5 h-5" />
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center gap-3">
            {formatTimeUnit(timeLeft.days, 'Hari')}
            {formatTimeUnit(timeLeft.hours, 'Jam')}
            {formatTimeUnit(timeLeft.minutes, 'Menit')}
            {formatTimeUnit(timeLeft.seconds, 'Detik')}
          </div>
        </CardContent>
      </Card>
    );
  };

  const getCountdownStatus = () => {
    switch (campaignStatus) {
      case 'upcoming':
        return {
          message: 'Campaign akan dimulai dalam',
          color: 'text-blue-600',
          bgColor: 'bg-blue-50'
        };
      case 'active':
        return {
          message: 'Campaign akan berakhir dalam',
          color: 'text-green-600',
          bgColor: 'bg-green-50'
        };
      case 'ended':
        return {
          message: 'Campaign telah berakhir',
          color: 'text-gray-600',
          bgColor: 'bg-gray-50'
        };
      default:
        return {
          message: '',
          color: 'text-gray-600',
          bgColor: 'bg-gray-50'
        };
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      // Refresh halaman untuk mengambil data terbaru
      router.refresh();
    } catch (err) {
      console.error('Error refreshing campaign:', err);
    } finally {
      setRefreshing(false);
    }
  };

  const handleEdit = () => {
    router.push(`/campaigns/${campaign.id}/edit`);
  };

  const handleStopCampaign = async () => {
    if (window.confirm('Apakah Anda yakin ingin menghentikan campaign ini? Status akan diubah menjadi COMPLETED.')) {
      setStopping(true);
      try {
        const response = await fetch(`/api/campaigns/${campaign.id}/status`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        const result = await response.json();

        if (response.ok) {
          alert('Campaign berhasil dihentikan dan status diubah menjadi COMPLETED');
          router.refresh(); // Refresh untuk mendapatkan data terbaru
        } else {
          throw new Error(result.error || 'Gagal menghentikan campaign');
        }
        
      } catch (error) {
        console.error('Error stopping campaign:', error);
        alert(`Terjadi kesalahan saat menghentikan campaign: ${error instanceof Error ? error.message : 'Unknown error'}`);
      } finally {
        setStopping(false);
      }
    }
  };

  const getStatusIcon = (status?: string) => {
    switch (status?.toUpperCase()) {
      case 'ACTIVE':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'PAUSED':
        return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      case 'COMPLETE':
      case 'COMPLETED':
      case 'ENDED':
        return <XCircle className="w-4 h-4 text-gray-500" />;
      case 'DRAFT':
        return <Clock className="w-4 h-4 text-blue-500" />;
      default:
        return <Info className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status?: string) => {
    switch (status?.toUpperCase()) {
      case 'ACTIVE':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'PAUSED':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'COMPLETE':
      case 'COMPLETED':
      case 'ENDED':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'DRAFT':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-600 border-gray-200';
    }
  };

  const formatDate = (date?: string | Date) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount?: number) => {
    if (!amount) return '-';
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR'
    }).format(amount);
  };

  const formatNumber = (num?: number) => {
    if (!num) return '0';
    return new Intl.NumberFormat('id-ID').format(num);
  };

  const formatPercentage = (num?: number) => {
    if (!num) return '0%';
    return `${num.toFixed(2)}%`;
  };

  const getDurationText = () => {
    if (!campaign.startDate || !campaign.endDate) return '-';
    const start = new Date(campaign.startDate);
    const end = new Date(campaign.endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return `${diffDays} hari`;
  };

  const getRemainingTime = () => {
    if (!campaign.endDate || ['COMPLETE', 'COMPLETED', 'ENDED'].includes(campaign.status?.toUpperCase() || '')) return null;
    const now = new Date();
    const end = new Date(campaign.endDate);
    const diffTime = end.getTime() - now.getTime();
    
    if (diffTime <= 0) return 'Berakhir';
    
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return `${diffDays} hari tersisa`;
  };

  if (!campaign) {
    return (
      <Alert className="m-4">
        <Info className="h-4 w-4" />
        <AlertDescription>
          Campaign tidak ditemukan
        </AlertDescription>
      </Alert>
    );
  }

  const countdownStatus = getCountdownStatus();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Back Button */}
        <div className="mb-6">
          <Link href="/campaigns">
            <Button variant="outline" size="sm" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Kembali ke Daftar Campaign
            </Button>
          </Link>
        </div>

        <div className="space-y-6">
          {/* Header */}
          <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex-1">
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    {campaign.name || 'Unnamed Campaign'}
                  </h1>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span>Diperbarui: {formatDate(campaign.updatedAt)}</span>
                    </div>
                    {campaign.brands && (
                      <div className="flex items-center gap-1">
                        <Building className="w-4 h-4" />
                        <span>Brand: {campaign.brands.name}</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={`${getStatusColor(campaign.status)} border px-3 py-1`}>
                    {getStatusIcon(campaign.status)}
                    <span className="ml-2 capitalize">{campaign.status?.toLowerCase() || 'Unknown'}</span>
                  </Badge>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleRefresh}
                    disabled={refreshing}
                  >
                    <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                    <span className="ml-1">Refresh</span>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Countdown Section */}
          {(timeUntilStart || timeUntilEnd) && (
            <div className="space-y-4">
              {timeUntilStart && renderCountdown(
                timeUntilStart,
                'Campaign Akan Dimulai',
                'bg-blue-50 border-blue-200',
                'text-blue-700'
              )}
              {timeUntilEnd && renderCountdown(
                timeUntilEnd,
                'Campaign Akan Berakhir',
                'bg-orange-50 border-orange-200',
                'text-orange-700'
              )}
            </div>
          )}

          {/* Status Alert */}
          {campaignStatus === 'ended' && (
            <Alert className="border-red-200 bg-red-50">
              <XCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">
                Campaign ini telah berakhir pada {formatDate(campaign.endDate)}
              </AlertDescription>
            </Alert>
          )}

          {/* Campaign Overview */}
          <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info className="w-5 h-5" />
                Informasi Campaign
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-600">Budget</label>
                  <p className="text-lg font-semibold text-gray-900">{formatCurrency(campaign.budget)}</p>
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-600">Tanggal Mulai</label>
                  <p className="text-lg font-semibold text-gray-900">{formatDate(campaign.startDate)}</p>
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-600">Tanggal Berakhir</label>
                  <p className="text-lg font-semibold text-gray-900">{formatDate(campaign.endDate)}</p>
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-600">Durasi</label>
                  <p className="text-lg font-semibold text-gray-900">{getDurationText()}</p>
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-600">Status Campaign</label>
                  <p className={`text-lg font-semibold ${countdownStatus.color}`}>
                    {campaignStatus === 'upcoming' ? 'Akan Dimulai' : 
                     campaignStatus === 'active' ? 'Sedang Berjalan' : 'Telah Berakhir'}
                  </p>
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-600">Dibuat</label>
                  <p className="text-lg font-semibold text-gray-900">{formatDate(campaign.createdAt)}</p>
                </div>
              </div>
              
              {campaign.description && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-600">Deskripsi</label>
                  <p className="text-gray-900 leading-relaxed">{campaign.description}</p>
                </div>
              )}

              {campaign.target && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-600">Target Audience</label>
                  <p className="text-gray-900 leading-relaxed">{campaign.target}</p>
                </div>
              )}

              {campaign.brands && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-600">Brand Information</label>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Building className="w-4 h-4 text-gray-600" />
                      <span className="font-medium text-gray-900">{campaign.brands.name}</span>
                    </div>
                    {campaign.brands.user && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <User className="w-4 h-4" />
                        <span>{campaign.brands.user.name || campaign.brands.user.email}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex flex-wrap gap-3 justify-end">
                {/**
                <Button
                  variant="outline"
                  onClick={handleEdit}
                  className="flex items-center gap-2"
                >
                  <Edit className="w-4 h-4" />
                  Edit Campaign
                </Button>
                 */}
                {/* Hanya tampilkan tombol stop jika campaign sedang aktif atau belum berakhir */}
                {campaignStatus !== 'ended' && campaign.status?.toUpperCase() !== 'COMPLETED' && (
                  <Button
                    variant="destructive"
                    onClick={handleStopCampaign}
                    disabled={stopping}
                    className="flex items-center gap-2"
                  >
                    <StopCircle className={`w-4 h-4 ${stopping ? 'animate-spin' : ''}`} />
                    {stopping ? 'Menghentikan...' : 'Hentikan Campaign'}
                  </Button>
                )}
                {campaignStatus === 'ended' && (
                  <div className="text-sm text-gray-600 py-2">
                    Campaign telah berakhir secara otomatis
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CampaignDetailId;