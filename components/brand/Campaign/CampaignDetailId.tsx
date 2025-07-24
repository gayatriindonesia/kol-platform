'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Users, Target, Check, Clipboard } from 'lucide-react';
import Link from 'next/link';
import CampaignCountdown from '@/components/brand/Campaign/CampaignCountdown';
import { updateCampaignStatus } from '@/lib/campaign.actions';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';

interface Campaign {
  id: string;
  name?: string;
  status?: string;
  description?: string;
  target?: string;
  type?: string;
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

const CampaignDetailId: React.FC<CampaignDetailIdProps> = ({ campaign }) => {
  const [currentStatus, setCurrentStatus] = useState(campaign.status);
  const [isUpdating, setIsUpdating] = useState(false);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case 'ACTIVE':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Aktif</Badge>;
      case 'PENDING':
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Menunggu</Badge>;
      case 'COMPLETED':
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Selesai</Badge>;
      case 'REJECTED':
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Ditolak</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">Unknown</Badge>;
    }
  };

  const handleStopCampaign = async () => {
    if (!window.confirm('Apakah Anda yakin ingin menghentikan campaign ini?')) {
      return;
    }

    setIsUpdating(true);
    try {
      // Gunakan fungsi updateCampaignStatus yang sudah ada
      const response = await updateCampaignStatus(campaign.id, 'COMPLETED');

      if (response.success) {
        setCurrentStatus('COMPLETED');
        router.refresh(); // Refresh halaman untuk update data

        // Show success message
        alert('Campaign berhasil dihentikan.');
      } else {
        throw new Error(response.message || 'Failed to stop campaign');
      }
    } catch (error) {
      console.error('Error stopping campaign:', error);
      alert('Gagal menghentikan campaign. Silakan coba lagi.');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleStatusChange = (newStatus: string) => {
    setCurrentStatus(newStatus);
    if (newStatus === 'COMPLETED') {
      router.refresh();
    }
  };

  const handleCopyId = async () => {
    await navigator.clipboard.writeText(campaign.id);
    setCopied(true);
    toast({
      title: 'ID Campaign disalin',
      description: campaign.id,
    });

    setTimeout(() => setCopied(false), 2000);
  };


  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <Link href="/campaigns">
            <Button variant="outline" size="sm" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Kembali ke Daftar Campaign
            </Button>
          </Link>

          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {campaign.name || 'Campaign Detail'}
              </h1>
              <p className="text-gray-600">
                Brand: {campaign.brands?.name || 'Unknown Brand'}
              </p>
            </div>

            <div className="flex items-center space-x-3">
              {getStatusBadge(currentStatus)}
              {currentStatus === 'ACTIVE' && (
                <Button
                  variant="destructive"
                  onClick={handleStopCampaign}
                  disabled={isUpdating}
                >
                  {isUpdating ? 'Menghentikan...' : 'Hentikan Campaign'}
                </Button>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Campaign Info */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Target className="w-5 h-5 text-blue-600" />
                  <span>Informasi Campaign</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center justify-between space-x-2">
                    <div>
                      <label className="text-sm font-medium text-gray-500">ID Campaign</label>
                      <p className="text-gray-900 font-medium">{campaign.id}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={handleCopyId}
                      className="mt-5"
                    >
                      {copied ? (
                        <Check className="w-4 h-4 text-green-600" />
                      ) : (
                        <Clipboard className="w-4 h-4 text-gray-600" />
                      )}
                    </Button>

                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Tipe Campaign</label>
                    <p className="text-gray-900 font-medium">{campaign.type || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Status</label>
                    <div className="mt-1">
                      {getStatusBadge(currentStatus)}
                    </div>
                  </div>
                </div>

                {campaign.description && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Deskripsi</label>
                    <p className="text-gray-900 mt-1">{campaign.description}</p>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Tanggal Mulai</label>
                    <p className="text-gray-900">
                      {campaign.startDate
                        ? new Date(campaign.startDate).toLocaleDateString('id-ID')
                        : 'N/A'
                      }
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Tanggal Berakhir</label>
                    <p className="text-gray-900">
                      {campaign.endDate
                        ? new Date(campaign.endDate).toLocaleDateString('id-ID')
                        : 'N/A'
                      }
                    </p>
                  </div>
                </div>

                {campaign.budget && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Budget</label>
                    <p className="text-gray-900 font-medium">
                      Rp {campaign.budget.toLocaleString('id-ID')}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Countdown Timer - hanya tampil jika campaign aktif dan ada endDate */}
            {campaign.endDate && (
              <CampaignCountdown
                endDate={campaign.endDate}
                status={currentStatus || 'PENDING'}
                campaignId={campaign.id}
                onStatusChange={handleStatusChange}
              />
            )}

            {/* Campaign Stats */}
            <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Users className="w-5 h-5 text-green-600" />
                  <span>Statistik Campaign</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Total Influencer</span>
                  <span className="font-semibold">-</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Response Rate</span>
                  <span className="font-semibold">-</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Total Reach</span>
                  <span className="font-semibold">-</span>
                </div>
              </CardContent>
            </Card>

            {/* Brand Info */}
            <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>Informasi Brand</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-500">Nama Brand</label>
                  <p className="text-gray-900 font-medium">
                    {campaign.brands?.name || 'Unknown Brand'}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Contact Person</label>
                  <p className="text-gray-900">
                    {campaign.brands?.user?.name || 'N/A'}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Email</label>
                  <p className="text-gray-900 text-sm">
                    {campaign.brands?.user?.email || 'N/A'}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CampaignDetailId;