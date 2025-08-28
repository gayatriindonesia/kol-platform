'use client';
import React, { useState, useTransition } from 'react';
import {
  Calendar,
  Clock,
  DollarSign,
  MessageSquare,
  Building2,
  CheckCircle2,
  XCircle,
  Eye,
  Search,
  Sparkles,
  ArrowRight,
  Users,
  TrendingUp,
  Award
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
  budget?: number;
  startDate: string;
  endDate: string;
  type: string;
  brand?: Brand;
  goal?: string;
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
  goal?: string;
}

type Props = {
  initialInvitations: Invitation[];
  influencerId: string;
};

const InfluencerDashboardInvitations = ({ initialInvitations, influencerId }: Props) => {
  const [invitations, setInvitations] = useState<Invitation[]>(initialInvitations);
  const [activeTab, setActiveTab] = useState<InvitationStatus | 'ALL'>('PENDING');
  const [isPending, startTransition] = useTransition();
  const [searchTerm, setSearchTerm] = useState('');
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
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusConfig = (status: InvitationStatus) => {
    const configs = {
      PENDING: {
        color: 'from-amber-500 to-orange-500',
        bgColor: 'bg-gradient-to-r from-amber-50 to-orange-50',
        textColor: 'text-amber-700',
        borderColor: 'border-amber-200',
        label: 'Menunggu Respon',
        icon: Clock
      },
      ACTIVE: {
        color: 'from-emerald-500 to-green-500',
        bgColor: 'bg-gradient-to-r from-emerald-50 to-green-50',
        textColor: 'text-emerald-700',
        borderColor: 'border-emerald-200',
        label: 'Diterima',
        icon: CheckCircle2
      },
      REJECTED: {
        color: 'from-red-500 to-rose-500',
        bgColor: 'bg-gradient-to-r from-red-50 to-rose-50',
        textColor: 'text-red-700',
        borderColor: 'border-red-200',
        label: 'Ditolak',
        icon: XCircle
      },
      COMPLETED: {
        color: 'from-blue-500 to-indigo-500',
        bgColor: 'bg-gradient-to-r from-blue-50 to-indigo-50',
        textColor: 'text-blue-700',
        borderColor: 'border-blue-200',
        label: 'Selesai',
        icon: Award
      },
      CANCELLED: {
        color: 'from-gray-500 to-slate-500',
        bgColor: 'bg-gradient-to-r from-gray-50 to-slate-50',
        textColor: 'text-gray-700',
        borderColor: 'border-gray-200',
        label: 'Dibatalkan',
        icon: XCircle
      }
    };
    return configs[status];
  };

  const getCampaignTypeIcon = (type: string) => {
    switch (type?.toUpperCase()) {
      case 'BEAUTY': return '💄';
      case 'TECHNOLOGY': return '📱';
      case 'FASHION': return '👗';
      case 'FOOD': return '🍴';
      case 'LIFESTYLE': return '✨';
      default: return '🎯';
    }
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
  const getCampaignGoal = (invitation: Invitation): string => {
    // Coba dari berbagai properti yang mungkin ada
    if (invitation.campaign?.goal) return invitation.campaign.goal;
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

  const filteredInvitations = invitations.filter(invitation => {
    const matchesTab = activeTab === 'ALL' || invitation.status === activeTab;
    const matchesSearch = searchTerm === '' || 
      getCampaignName(invitation).toLowerCase().includes(searchTerm.toLowerCase()) ||
      getBrandName(invitation).toLowerCase().includes(searchTerm.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const stats = {
    total: invitations.length,
    pending: invitations.filter(i => i.status === 'PENDING').length,
    active: invitations.filter(i => i.status === 'ACTIVE').length,
    rejected: invitations.filter(i => i.status === 'REJECTED').length
  };

  const tabs = [
    { key: 'PENDING' as const, label: 'Menunggu', count: stats.pending, icon: Clock },
    { key: 'ACTIVE' as const, label: 'Diterima', count: stats.active, icon: CheckCircle2 },
    { key: 'REJECTED' as const, label: 'Ditolak', count: stats.rejected, icon: XCircle },
    { key: 'ALL' as const, label: 'Semua', count: stats.total, icon: Eye }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header Section */}
      <div className="bg-white/80 backdrop-blur-lg border-b border-white/20">
        <div className="px-6 py-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl">
                  <MessageSquare className="h-6 w-6 text-white" />
                </div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                  Undangan Kolaborasi
                </h1>
              </div>
              <p className="text-gray-600 text-lg">Kelola undangan dari brand dan tingkatkan partnership Anda</p>
            </div>

            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Cari campaign atau brand..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 pr-4 py-3 w-full lg:w-80 bg-white/90 backdrop-blur-sm border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>
          </div>

          {/* Debug Panel - Hapus di production 
          */}
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

          {/* Stats Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
            <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl p-4 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm">Total Undangan</p>
                  <p className="text-2xl font-bold">{stats.total}</p>
                </div>
                <Users className="h-8 w-8 text-blue-200" />
              </div>
            </div>
            <div className="bg-gradient-to-r from-amber-500 to-orange-600 rounded-2xl p-4 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100 text-sm">Menunggu</p>
                  <p className="text-2xl font-bold">{stats.pending}</p>
                </div>
                <Clock className="h-8 w-8 text-orange-200" />
              </div>
            </div>
            <div className="bg-gradient-to-r from-emerald-500 to-green-600 rounded-2xl p-4 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm">Diterima</p>
                  <p className="text-2xl font-bold">{stats.active}</p>
                </div>
                <CheckCircle2 className="h-8 w-8 text-green-200" />
              </div>
            </div>
            <div className="bg-gradient-to-r from-purple-500 to-pink-600 rounded-2xl p-4 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-pink-100 text-sm">Success Rate</p>
                  <p className="text-2xl font-bold">{stats.total > 0 ? Math.round((stats.active / stats.total) * 100) : 0}%</p>
                </div>
                <TrendingUp className="h-8 w-8 text-pink-200" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="px-6 py-8">
        {/* Tabs */}
        <div className="bg-white/90 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 mb-8">
          <div className="p-2">
            <nav className="flex space-x-2">
              {tabs.map(tab => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`flex items-center gap-3 px-6 py-4 rounded-xl font-medium text-sm transition-all duration-200 ${
                      activeTab === tab.key
                        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg transform scale-105'
                        : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {tab.label}
                    {tab.count > 0 && (
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        activeTab === tab.key
                          ? 'bg-white/20 text-white'
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        {tab.count}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Content */}
        {filteredInvitations.length === 0 ? (
          <div className="text-center py-20">
            <div className="bg-gradient-to-r from-gray-100 to-gray-200 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
              <MessageSquare className="h-10 w-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Tidak ada undangan</h3>
            <p className="text-gray-600 max-w-md mx-auto">
              {activeTab === 'PENDING'
                ? 'Belum ada undangan yang menunggu respon Anda.'
                : `Tidak ada undangan dengan status ${tabs.find(t => t.key === activeTab)?.label.toLowerCase()}.`}
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredInvitations.map(invitation => {
              const statusConfig = getStatusConfig(invitation.status);
              const StatusIcon = statusConfig.icon;
              
              return (
                <div
                  key={invitation.id}
                  className="bg-white/90 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 overflow-hidden hover:shadow-2xl hover:scale-[1.02] transition-all duration-300"
                >
                  <div className="p-8">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-6">
                      <div className="flex-1">
                        <div className="flex items-center gap-4 mb-3">
                          <div className="flex items-center gap-3">
                            <span className="text-2xl">{getCampaignTypeIcon(invitation.campaign?.type || '')}</span>
                            <h3 className="text-2xl font-bold text-gray-900">
                              {getCampaignName(invitation)}
                            </h3>
                          </div>
                          <div className={`flex items-center gap-2 px-4 py-2 rounded-full border ${statusConfig.bgColor} ${statusConfig.textColor} ${statusConfig.borderColor}`}>
                            <StatusIcon className="h-4 w-4" />
                            <span className="font-medium text-sm">{statusConfig.label}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 mb-2">
                          <Building2 className="h-5 w-5 text-gray-400" />
                          <span className="text-lg font-medium text-gray-700">
                            {getBrandName(invitation)}
                          </span>
                        </div>

                        <p className="text-gray-500">
                          Diundang pada {formatDate(invitation.invitedAt || invitation.createdAt)}
                        </p>
                      </div>
                    </div>

                    {/* Campaign Details Grid */}
                    {invitation.campaign && (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100">
                          <div className="flex items-center gap-3">
                            <Calendar className="h-5 w-5 text-blue-600" />
                            <div>
                              <p className="text-sm font-medium text-blue-800">Periode Campaign</p>
                              <p className="text-sm text-blue-600">
                                {formatDate(invitation.campaign.startDate)} - {formatDate(invitation.campaign.endDate)}
                              </p>
                            </div>
                          </div>
                        </div>

                        {invitation.campaign.budget && (
                          <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 border border-green-100">
                            <div className="flex items-center gap-3">
                              <DollarSign className="h-5 w-5 text-green-600" />
                              <div>
                                <p className="text-sm font-medium text-green-800">Budget</p>
                                <p className="text-sm text-green-600 font-semibold">
                                  {formatCurrency(invitation.campaign.budget)}
                                </p>
                              </div>
                            </div>
                          </div>
                        )}

                        <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-100">
                          <div className="flex items-center gap-3">
                            <Sparkles className="h-5 w-5 text-purple-600" />
                            <div>
                              <p className="text-sm font-medium text-purple-800">Tipe Campaign</p>
                              <p className="text-sm text-purple-600 capitalize">
                                {invitation.campaign.type?.toLowerCase() || 'General'}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Description */}
                    {invitation.campaign?.goal && (
                      <div className="mb-6">
                        <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                          <Eye className="h-4 w-4" />
                          Deskripsi Campaign
                        </h4>
                        <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                          <p className="text-gray-700 leading-relaxed">{getCampaignGoal(invitation)}</p>
                        </div>
                      </div>
                    )}

                    {/* Messages */}
                    <div className="space-y-4">
                      {invitation.message && (
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                            <MessageSquare className="h-4 w-4" />
                            Pesan dari Brand
                          </h4>
                          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-500 rounded-xl p-4">
                            <p className="text-gray-700 italic">&quot;{invitation.message}&quot;</p>
                          </div>
                        </div>
                      )}

                      {/* Description */}
                    {invitation.campaign?.goal && (
                      <div className="mb-6">
                        <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                          <Eye className="h-4 w-4" />
                          Deskripsi Campaign
                        </h4>
                        <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                          <p className="text-gray-700 leading-relaxed">{invitation.campaign.goal}</p>
                        </div>
                      </div>
                    )}

                      {invitation.responseMessage && (
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-3">Respon Anda</h4>
                          <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-l-4 border-green-500 rounded-xl p-4">
                            <p className="text-gray-700 italic">&quot;{invitation.responseMessage}&quot;</p>
                            {invitation.respondedAt && (
                              <p className="text-xs text-gray-500 mt-2">
                                Direspon pada {formatDate(invitation.respondedAt)}
                              </p>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    {invitation.status === 'PENDING' && (
                      <div className="mt-8 pt-6 border-t border-gray-100">
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
        )}
      </div>
    </div>
  );
};

// Action Buttons Component
interface InvitationActionButtonsProps {
  invitationId: string;
  onApprove: (message?: string) => void;
  onReject: (message?: string) => void;
  isPending: boolean;
}

const InvitationActionButtons = ({ onApprove, onReject, isPending }: InvitationActionButtonsProps) => {
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
      <div className="flex gap-4">
        <button
          onClick={() => setShowResponseModal('accept')}
          disabled={isPending}
          className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:from-green-400 disabled:to-emerald-400 text-white px-6 py-4 rounded-xl font-semibold text-sm transition-all duration-200 transform hover:scale-105 hover:shadow-lg flex items-center justify-center gap-2"
        >
          <CheckCircle2 className="h-4 w-4" />
          {isPending ? 'Memproses...' : 'Terima Undangan'}
          <ArrowRight className="h-4 w-4" />
        </button>
        <button
          onClick={() => setShowResponseModal('reject')}
          disabled={isPending}
          className="flex-1 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 disabled:from-red-400 disabled:to-rose-400 text-white px-6 py-4 rounded-xl font-semibold text-sm transition-all duration-200 transform hover:scale-105 hover:shadow-lg flex items-center justify-center gap-2"
        >
          <XCircle className="h-4 w-4" />
          {isPending ? 'Memproses...' : 'Tolak Undangan'}
        </button>
      </div>

      {/* Response Modal */}
      {showResponseModal && (
  <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
    <div className="bg-white rounded-2xl p-6 sm:p-8 w-full max-w-md sm:max-w-lg shadow-2xl">
      <div className="text-center space-y-4">
        <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto ${
          showResponseModal === 'accept' 
            ? 'bg-gradient-to-r from-green-100 to-emerald-100' 
            : 'bg-gradient-to-r from-red-100 to-rose-100'
        }`}>
          {showResponseModal === 'accept' ? (
            <CheckCircle2 className="h-8 w-8 text-green-600" />
          ) : (
            <XCircle className="h-8 w-8 text-red-600" />
          )}
        </div>

        <h3 className="text-xl sm:text-2xl font-bold text-gray-900">
          {showResponseModal === 'accept' ? 'Terima Undangan' : 'Tolak Undangan'}
        </h3>
        <p className="text-gray-600 text-sm sm:text-base">
          {showResponseModal === 'accept'
            ? 'Tambahkan pesan untuk brand (opsional)'
            : 'Berikan alasan penolakan (opsional)'}
        </p>
      </div>

      <textarea
        value={responseMessage}
        onChange={(e) => setResponseMessage(e.target.value)}
        placeholder={
          showResponseModal === 'accept'
            ? 'Terima kasih atas kesempatannya! Saya sangat tertarik untuk berkolaborasi...'
            : 'Maaf, saat ini schedule saya sudah penuh untuk periode tersebut...'
        }
        className="w-full p-3 sm:p-4 border border-gray-200 rounded-xl resize-none h-28 sm:h-32 mt-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      />

      <div className="flex flex-col sm:flex-row gap-3 mt-6">
        <button
          onClick={() => setShowResponseModal(null)}
          className="flex-1 px-4 py-3 text-gray-600 border border-gray-300 rounded-xl hover:bg-gray-50 font-medium transition-colors"
        >
          Batal
        </button>
        <button
          onClick={() => handleSubmitResponse(showResponseModal)}
          className={`flex-1 px-4 py-3 text-white rounded-xl font-medium transition-all transform hover:scale-105 ${
            showResponseModal === 'accept'
              ? 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700'
              : 'bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700'
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