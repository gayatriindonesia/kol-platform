'use client';
import React, { useState, useTransition } from 'react';
import {
  Calendar,
  Clock,
  DollarSign,
  MessageSquare,
  Building2,
} from 'lucide-react';
import { respondToCampaignInvitation } from '@/lib/campaign.actions';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

type InvitationStatus = 'PENDING' | 'ACTIVE' | 'REJECTED' | 'COMPLETED' | 'CANCELLED';

interface Brand {
  name: string;
  user: { name: string; email: string };
}

interface Campaign {
  id: string;
  name: string;
  description?: string;
  budget?: number;
  startDate: string;
  endDate: string;
  type: string;
  brand?: Brand;
}

interface Invitation {
  id: string;
  campaignId: string;
  influencerId: string;
  brandId: string;
  message?: string;
  responseMessage?: string;
  status: InvitationStatus;
  createdAt?: Date;
  updatedAt?: Date;
  invitedAt?: Date;
  respondedAt?: Date;
  campaign?: Campaign;
  brand?: Brand;
}

type Props = {
  initialInvitations: Invitation[];
  influencerId: string;
};

const InfluencerDashboardInvitations = ({ initialInvitations, influencerId }: Props) => {
  const [invitations, setInvitations] = useState<Invitation[]>(initialInvitations);
  const [activeTab, setActiveTab] = useState<InvitationStatus | 'ALL'>('PENDING');
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  // Debug log untuk memeriksa data
  console.log('Initial invitations:', initialInvitations);
  console.log('Current invitations:', invitations);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (date: string | Date | undefined) => {
    if (!date) return 'Tidak tersedia';
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusBadge = (status: InvitationStatus) => {
    const statusConfig: Record<InvitationStatus, { color: string; label: string }> = {
      PENDING: {
        color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        label: 'Menunggu'
      },
      ACTIVE: {
        color: 'bg-green-100 text-green-800 border-green-200',
        label: 'Diterima'
      },
      REJECTED: {
        color: 'bg-red-100 text-red-800 border-red-200',
        label: 'Ditolak'
      },
      COMPLETED: {
        color: 'bg-gray-100 text-gray-800 border-gray-200',
        label: 'Kedaluwarsa'
      },
      CANCELLED: {
        color: 'bg-gray-100 text-gray-800 border-gray-200',
        label: 'Dibatalkan'
      }
    };

    const config = statusConfig[status];
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${config.color}`}>
        {config.label}
      </span>
    );
  };

  const handleStatusUpdate = async (
    invitationId: string,
    response: 'ACCEPTED' | 'REJECTED',
    responseMessage?: string
  ) => {
    const newStatus: InvitationStatus = response === 'ACCEPTED' ? 'ACTIVE' : 'REJECTED';
    const previousInvitations = [...invitations];

    setInvitations(prev =>
      prev.map(inv =>
        inv.id === invitationId
          ? {
            ...inv,
            status: newStatus,
            responseMessage: responseMessage,
            respondedAt: new Date()
          }
          : inv
      )
    );

    startTransition(async () => {
      try {
        const result = await respondToCampaignInvitation({
          invitationId,
          influencerId,
          response,
          message: responseMessage
        });

        if (result.success) {
          toast.success(result.message || `Undangan berhasil ${response === 'ACCEPTED' ? 'diterima' : 'ditolak'}`);
          router.refresh();
        } else {
          setInvitations(previousInvitations);
          toast.error(result.error || 'Gagal memperbarui status undangan');
        }
      } catch (error) {
        setInvitations(previousInvitations);
        console.error('Error updating invitation:', error);
        toast.error('Terjadi kesalahan saat memperbarui status undangan');
      }
    });
  };

  // Helper function untuk mendapatkan nama campaign
  const getCampaignName = (invitation: Invitation): string => {
    // Coba dari berbagai properti yang mungkin ada
    if (invitation.campaign?.name) return invitation.campaign.name;
    if (invitation.campaignId) return `Campaign ID: ${invitation.campaignId}`;
    return 'Campaign Tidak Diketahui';
  };

  // Helper function untuk mendapatkan nama brand
  const getBrandName = (invitation: Invitation): string => {
    // Coba dari berbagai properti yang mungkin ada
    if (invitation.campaign?.brand?.name) return invitation.campaign.brand.name;
    if (invitation.brand?.name) return invitation.brand.name;
    if (invitation.brandId) return `Brand ID: ${invitation.brandId}`;
    return 'Brand Tidak Diketahui';
  };

  const filteredInvitations = activeTab === 'ALL'
    ? invitations
    : invitations.filter(inv => inv.status === activeTab);

  const tabs = [
    {
      key: 'PENDING' as const,
      label: 'Menunggu',
      count: invitations.filter(inv => inv.status === 'PENDING').length
    },
    {
      key: 'ACTIVE' as const,
      label: 'Diterima',
      count: invitations.filter(inv => inv.status === 'ACTIVE').length
    },
    {
      key: 'REJECTED' as const,
      label: 'Ditolak',
      count: invitations.filter(inv => inv.status === 'REJECTED').length
    },
    {
      key: 'ALL' as const,
      label: 'Semua',
      count: invitations.length
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Undangan Campaign</h1>
          <p className="text-gray-600">Kelola undangan kolaborasi dari berbagai brand</p>
        </div>

        {/* Debug Panel - Hapus di production */}
        {process.env.NODE_ENV === 'development' && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-yellow-800 mb-2">Debug Info:</h3>
            <p className="text-sm text-yellow-700">Total invitations: {invitations.length}</p>
            {invitations.length > 0 && (
              <div className="mt-2 text-xs text-yellow-600">
                <p>Sample invitation data structure:</p>
                <pre className="mt-1 bg-yellow-100 p-2 rounded overflow-auto max-h-40">
                  {JSON.stringify(invitations[0], null, 2)}
                </pre>
              </div>
            )}
          </div>
        )}

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {tabs.map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === tab.key
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                >
                  {tab.label}
                  {tab.count > 0 && (
                    <span
                      className={`ml-2 py-0.5 px-2 rounded-full text-xs ${activeTab === tab.key
                        ? 'bg-blue-100 text-blue-600'
                        : 'bg-gray-100 text-gray-600'
                        }`}
                    >
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-6">
          {isPending && (
            <div className="flex justify-center items-center h-40">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          )}

          {!isPending && filteredInvitations.length === 0 && (
            <div className="text-center py-12">
              <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Tidak ada undangan</h3>
              <p className="text-gray-500">
                {activeTab === 'PENDING'
                  ? 'Anda belum memiliki undangan yang menunggu respon.'
                  : `Tidak ada undangan dengan status ${tabs
                    .find(t => t.key === activeTab)
                    ?.label.toLowerCase()}.`}
              </p>
            </div>
          )}

          {/* Invitation Cards */}
          {filteredInvitations.map(invitation => {
            const campaignName = getCampaignName(invitation);
            const brandName = getBrandName(invitation);
            
            return (
              <div
                key={invitation.id}
                className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
              >
                <div className="p-6">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <Building2 className="h-5 w-5 text-gray-400" />
                        <h3 className="text-xl font-semibold text-gray-900">
                          {campaignName}
                        </h3>
                        {getStatusBadge(invitation.status)}
                      </div>

                      <p className="text-gray-600 mb-1">
                        dari <span className="font-medium">{brandName}</span>
                      </p>

                      <p className="text-sm text-gray-500">
                        Diundang pada {formatDate(invitation.invitedAt || invitation.createdAt)}
                      </p>
                    </div>
                  </div>

                  {/* Campaign Info */}
                  {invitation.campaign && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Calendar className="h-4 w-4" />
                        <span>
                          {formatDate(invitation.campaign.startDate)} – {formatDate(invitation.campaign.endDate)}
                        </span>
                      </div>

                      {invitation.campaign.budget && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <DollarSign className="h-4 w-4" />
                          <span>{formatCurrency(invitation.campaign.budget)}</span>
                        </div>
                      )}

                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Clock className="h-4 w-4" />
                        <span className="capitalize">{invitation.campaign.type?.toLowerCase() || 'Campaign'}</span>
                      </div>
                    </div>
                  )}

                  {/* Description */}
                  {invitation.campaign?.description && (
                    <div className="mb-4">
                      <h4 className="font-medium text-gray-900 mb-2">Deskripsi Kampanye:</h4>
                      <p className="text-gray-600 text-sm leading-relaxed">{invitation.campaign.description}</p>
                    </div>
                  )}

                  {/* Brand Message */}
                  {invitation.message && (
                    <div className="mb-4">
                      <h4 className="font-medium text-gray-900 mb-2">Pesan dari Brand:</h4>
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                        <p className="text-gray-700 text-sm">&quot;{invitation.message}&quot;</p>
                      </div>
                    </div>
                  )}

                  {/* Response Message */}
                  {invitation.responseMessage && (
                    <div className="mb-4">
                      <h4 className="font-medium text-gray-900 mb-2">Respon Anda:</h4>
                      <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                        <p className="text-gray-700 text-sm">&quot;{invitation.responseMessage}&quot;</p>
                        {invitation.respondedAt && (
                          <p className="text-xs text-gray-500 mt-1">
                            Direspon pada {formatDate(invitation.respondedAt)}
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  {invitation.status === 'PENDING' && (
                    <div className="pt-4 border-t border-gray-200">
                      <InvitationActionButtons
                        invitationId={invitation.id}
                        onApprove={(message) => handleStatusUpdate(invitation.id, 'ACCEPTED', message)}
                        onReject={(message) => handleStatusUpdate(invitation.id, 'REJECTED', message)}
                        isPending={isPending}
                      />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// Komponen terpisah untuk action buttons
interface InvitationActionButtonsProps {
  invitationId: string;
  onApprove: (message?: string) => void;
  onReject: (message?: string) => void;
  isPending: boolean;
}

const InvitationActionButtons = ({
  onApprove,
  onReject,
  isPending
}: InvitationActionButtonsProps) => {
  const [showResponseModal, setShowResponseModal] = useState<'accept' | 'reject' | null>(null);
  const [responseMessage, setResponseMessage] = useState('');

  const handleSubmitResponse = (action: 'accept' | 'reject') => {
    if (action === 'accept') {
      onApprove(responseMessage || undefined);
    } else {
      onReject(responseMessage || undefined);
    }
    setShowResponseModal(null);
    setResponseMessage('');
  };

  return (
    <>
      <div className="flex gap-3">
        <button
          onClick={() => setShowResponseModal('accept')}
          disabled={isPending}
          className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white px-4 py-2 rounded-lg font-medium text-sm transition-colors"
        >
          {isPending ? 'Memproses...' : 'Terima'}
        </button>
        <button
          onClick={() => setShowResponseModal('reject')}
          disabled={isPending}
          className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white px-4 py-2 rounded-lg font-medium text-sm transition-colors"
        >
          {isPending ? 'Memproses...' : 'Tolak'}
        </button>
      </div>

      {/* Response Modal */}
      {showResponseModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">
              {showResponseModal === 'accept' ? 'Terima Undangan' : 'Tolak Undangan'}
            </h3>
            <p className="text-gray-600 mb-4">
              {showResponseModal === 'accept'
                ? 'Tambahkan pesan untuk brand (opsional):'
                : 'Berikan alasan penolakan (opsional):'}
            </p>
            <textarea
              value={responseMessage}
              onChange={(e) => setResponseMessage(e.target.value)}
              placeholder={showResponseModal === 'accept'
                ? 'Terima kasih atas undangannya...'
                : 'Maaf, saat ini saya tidak bisa...'
              }
              className="w-full p-3 border border-gray-300 rounded-lg resize-none h-24"
            />
            <div className="flex gap-3 mt-4">
              <button
                onClick={() => setShowResponseModal(null)}
                className="flex-1 px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Batal
              </button>
              <button
                onClick={() => handleSubmitResponse(showResponseModal)}
                className={`flex-1 px-4 py-2 text-white rounded-lg ${showResponseModal === 'accept'
                    ? 'bg-green-600 hover:bg-green-700'
                    : 'bg-red-600 hover:bg-red-700'
                  }`}
              >
                {showResponseModal === 'accept' ? 'Terima' : 'Tolak'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default InfluencerDashboardInvitations;