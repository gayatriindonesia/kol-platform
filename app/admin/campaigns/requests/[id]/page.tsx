'use client'

import React, { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import {
  CheckCircle,
  XCircle,
  Clock,
  ArrowLeft,
  User,
  Calendar,
  DollarSign,
  Users,
  Target,
  Building2,
  Eye,
  MoreVertical,
  Download,
  Share2,
  Search,
  Star,
  UserCheck,
  X,
} from 'lucide-react'

import {
  getCampaignById,
  approveCampaignByAdmin,
  rejectCampaignByAdmin,
  getAvailableInfluencers,
} from '@/lib/campaign.actions'
import { toast } from 'sonner'
import { CampaignStatus } from '@/types/campaign'
import { MdEmail, MdOutlineSettingsVoice, MdPhone } from 'react-icons/md'
import { IoIosWarning } from "react-icons/io";
import { AiFillTikTok } from "react-icons/ai";
import { FaFacebook, FaInstagram, FaTiktok, FaTwitter, FaYoutube } from 'react-icons/fa'

export default function CampaignDetailPage() {
  const router = useRouter()
  const params = useParams()
  const campaignId = params.id as string

  const [campaign, setCampaign] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<'approve' | 'reject' | null>(null)
  const [showInfluencerModal, setShowInfluencerModal] = useState(false)
  const [availableInfluencers, setAvailableInfluencers] = useState<any[]>([])
  const [selectedInfluencers, setSelectedInfluencers] = useState<string[]>([])
  const [influencersLoading, setInfluencersLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCategory, setFilterCategory] = useState('all')

  useEffect(() => {
    if (campaignId) {
      fetchCampaign()
    }
  }, [campaignId])

  const fetchCampaign = async () => {
    setLoading(true)
    try {
      const result = await getCampaignById(campaignId)
      if (result.success && result.campaign) {
        setCampaign(result.campaign)
      } else {
        toast.error(result.message || 'Campaign tidak ditemukan')
        router.push('/admin/campaigns/requests')
      }
    } catch (error) {
      console.error('Error fetching campaign:', error)
      toast.error('Failed to fetch campaign details')
      router.push('/admin/campaigns/requests')
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async () => {
    if (selectedInfluencers.length === 0) {
      toast.error('Please select at least one influencer')
      return
    }

    setActionLoading('approve')
    try {
      const result = await approveCampaignByAdmin(campaignId, selectedInfluencers)
      if (result.success) {
        toast.success(result.message)
        setCampaign((prev: any) => prev ? { ...prev, status: 'ACTIVE' } : null)
        setShowInfluencerModal(false)
      } else {
        toast.error(result.message)
      }
    } catch (error) {
      console.error('Error approving campaign:', error)
      toast.error('Failed to approve campaign')
    } finally {
      setActionLoading(null)
    }
  }

  const handleOpenInfluencerModal = async () => {
    setShowInfluencerModal(true)
    setInfluencersLoading(true)
    try {
      const result = await getAvailableInfluencers(campaign.type, campaign.targetAudience)
      if (result.success) {
        setAvailableInfluencers(result.influencers ?? [])
      } else {
        toast.error(result.message || 'Failed to fetch influencers')
      }
    } catch (error) {
      console.error('Error fetching influencers:', error)
      toast.error('Failed to fetch available influencers')
    } finally {
      setInfluencersLoading(false)
    }
  }

  const handleReject = async () => {
    setActionLoading('reject')
    try {
      const result = await rejectCampaignByAdmin(campaignId)
      if (result.success) {
        toast.success(result.message)
        setCampaign((prev: any) => prev ? { ...prev, status: 'REJECTED' } : null)
      } else {
        toast.error(result.message)
      }
    } catch (error) {
      console.error('Error rejecting campaign:', error)
      toast.error('Failed to reject campaign')
    } finally {
      setActionLoading(null)
    }
  }

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount)

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })

  const getStatusStyle = (status: CampaignStatus) => {
    switch (status) {
      case 'PENDING':
        return 'bg-amber-50 text-amber-700 border border-amber-200 shadow-sm'
      case 'ACTIVE':
        return 'bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-sm'
      case 'REJECTED':
        return 'bg-rose-50 text-rose-700 border border-rose-200 shadow-sm'
      default:
        return 'bg-slate-50 text-slate-700 border border-slate-200 shadow-sm'
    }
  }

  const getStatusIcon = (status: CampaignStatus) => {
    switch (status) {
      case 'PENDING':
        return <Clock className="w-4 h-4" />
      case 'ACTIVE':
        return <CheckCircle className="w-4 h-4" />
      case 'REJECTED':
        return <XCircle className="w-4 h-4" />
      default:
        return <Clock className="w-4 h-4" />
    }
  }

  const toggleInfluencerSelection = (influencerId: string) => {
    setSelectedInfluencers(prev =>
      prev.includes(influencerId)
        ? prev.filter(id => id !== influencerId)
        : [...prev, influencerId]
    )
  }

  const getSocialIcon = (platform: string) => {
    switch (platform.toLowerCase()) {
      case 'instagram':
        return <FaInstagram className="w-4 h-4" />
      case 'youtube':
        return <FaYoutube className="w-4 h-4" />
      case 'twitter':
        return <FaTwitter className="w-4 h-4" />
      case 'tiktok':
        return <FaTiktok className="w-4 h-4" />
      case 'facebook':
        return <FaFacebook className="w-4 h-4" />
      default:
        return <User className="w-4 h-4" />
    }
  }

  const formatFollowers = (count: number) => {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`
    } else if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`
    }
    return count.toString()
  }

  const filteredInfluencers = availableInfluencers.filter(influencer => {
    const matchesSearch = influencer.name.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesCategory = filterCategory === 'all' ||
      influencer.category?.toLowerCase() === filterCategory.toLowerCase()

    return matchesSearch && matchesCategory
  })

  const InfluencerSelectionModal = () => {
    if (!showInfluencerModal) return null

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
          {/* Modal Header */}
          <div className="p-6 border-b border-slate-200 bg-gradient-to-r from-blue-50 to-indigo-50">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-bold text-slate-900">Pencarian Influencer</h3>
                <p className="text-slate-600 mt-1">Pilih influencer yang sesuai dengan tujuan Campaign</p>
              </div>
              <button
                onClick={() => setShowInfluencerModal(false)}
                className="p-2 text-slate-600 hover:text-slate-900 hover:bg-white rounded-lg transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Search and Filter */}
            <div className="flex gap-4 mt-6">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Cari influencer..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">Semua Kategori</option>
                <option value="lifestyle">Lifestyle</option>
                <option value="tech">Technology</option>
                <option value="fashion">Fashion</option>
                <option value="food">Food</option>
                <option value="travel">Travel</option>
                <option value="fitness">Fitness</option>
              </select>
            </div>

            {/* Selected Count */}
            <div className="flex items-center justify-between mt-4 p-3 bg-white rounded-lg border border-blue-200">
              <span className="text-sm text-slate-600">
                {selectedInfluencers.length} influencer terpilih
              </span>
              {selectedInfluencers.length > 0 && (
                <button
                  onClick={() => setSelectedInfluencers([])}
                  className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                >
                  Hapus Semua
                </button>
              )}
            </div>
          </div>

          {/* Modal Content */}
          <div className="p-6 max-h-96 overflow-y-auto">
            {influencersLoading ? (
              <div className="flex justify-center items-center py-12">
                <div className="flex flex-col items-center gap-4">
                  <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-slate-600">Loading available influencers...</p>
                </div>
              </div>
            ) : filteredInfluencers.length === 0 ? (
              <div className="text-center py-12">
                <Users className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <h4 className="text-lg font-semibold text-slate-900 mb-2">No Influencers Found</h4>
                <p className="text-slate-600">Try adjusting your search or filter criteria.</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-4">
                {filteredInfluencers.map((influencer) => (
                  <div
                    key={influencer.id}
                    className={`p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 hover:shadow-md ${selectedInfluencers.includes(influencer.id)
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-slate-200 hover:border-slate-300'
                      }`}
                    onClick={() => toggleInfluencerSelection(influencer.id)}
                  >
                    <div className="flex items-start gap-4">
                      <div className="relative">
                        <img
                          src={influencer.avatar || '/default-avatar.jpg'}
                          alt={influencer.name}
                          className="w-16 h-16 rounded-full object-cover border-2 border-white shadow-sm"
                        />
                        {selectedInfluencers.includes(influencer.id) && (
                          <div className="absolute -top-1 -right-1 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                            <CheckCircle className="w-4 h-4 text-white" />
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-slate-900 truncate">{influencer.name}</h4>
                        <p className="text-sm text-slate-600 mb-2">{influencer.name}</p>

                        <div className="flex items-center gap-3 text-xs text-slate-500 mb-3">
                          <div className="flex items-center gap-1">
                            {getSocialIcon(influencer.mainPlatform || 'instagram')}
                            <span>{formatFollowers(influencer.followers || 0)} followers</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Star className="w-3 h-3 text-yellow-500" />
                            <span>{influencer.rating || '4.5'}</span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-xs bg-slate-100 text-slate-700 px-2 py-1 rounded-md">
                            {influencer.category || 'Lifestyle'}
                          </span>
                          <span className="text-sm font-medium text-slate-900">
                            {influencer.rate ? formatCurrency(influencer.rate) : 'Rate on request'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Modal Footer */}
          <div className="p-6 bg-slate-50 border-t border-slate-200">
            <div className="flex items-center justify-between">
              <p className="text-sm text-slate-600">
                Terpilih {selectedInfluencers.length} of {filteredInfluencers.length} influencer
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowInfluencerModal(false)}
                  className="px-6 py-3 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  Batal
                </button>
                <button
                  onClick={handleApprove}
                  disabled={selectedInfluencers.length === 0 || actionLoading !== null}
                  className="px-6 py-3 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 rounded-lg transition-colors flex items-center gap-2"
                >
                  {actionLoading === 'approve' ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <UserCheck className="w-4 h-4" />
                  )}
                  Simpan Pemilihan
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-slate-50">
        <div className="flex flex-col items-center gap-6">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-slate-200 rounded-full"></div>
            <div className="absolute top-0 left-0 w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
          <div className="text-center">
            <h3 className="text-lg font-semibold text-slate-900">Memproses Campaign</h3>
            <p className="text-slate-600">Harap tunggu sementara kami mengambil datanya...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!campaign) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-slate-50">
        <div className="text-center">
          <XCircle className="w-16 h-16 text-slate-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-900">Campaign Not Found</h3>
          <p className="text-slate-600">The campaign you&apos;re looking for doesn&apos;t exist.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/admin/campaigns/requests')}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 hover:border-slate-400 transition-all duration-200"
              >
                <ArrowLeft className="w-4 h-4" />
                Kembali
              </button>
              <div className="h-6 w-px bg-slate-300" />
              <div>
                <h1 className="text-2xl font-bold text-slate-900">Peninjauan Campaign</h1>
                <p className="text-sm text-slate-600">Kelola persetujuan dan detail Campaign</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors">
                <Share2 className="w-5 h-5" />
              </button>
              <button className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors">
                <Download className="w-5 h-5" />
              </button>
              <button className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors">
                <MoreVertical className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="px-6 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Campaign Overview */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="p-8">
                <div className="flex items-start justify-between mb-6">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-4">
                      <span className={`inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-lg ${getStatusStyle(campaign.status)}`}>
                        {getStatusIcon(campaign.status)}
                        {campaign.status}
                      </span>
                      <span className="text-sm text-slate-500">#{campaignId.slice(0, 8)}</span>
                    </div>
                    <h2 className="text-3xl font-bold text-slate-900 mb-3">{campaign.name || 'Campaign Name'}</h2>
                    {campaign.goal && (
                      <p className="text-slate-600 text-lg leading-relaxed">{campaign.goal}</p>
                    )}
                  </div>
                </div>

                {/* Key Metrics */}
                <div className="grid sm:grid-cols-2 gap-6">
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-100">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-blue-600 rounded-lg">
                        <DollarSign className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-blue-900">Campaign Budget</p>
                        <p className="text-2xl font-bold text-blue-900">
                          {campaign.directData.budget ? formatCurrency(campaign.directData.budget) : 'Empty'}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-emerald-50 to-green-50 p-6 rounded-xl border border-emerald-100">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-emerald-600 rounded-lg">
                        <Target className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-emerald-900">Campaign Type</p>
                        <p className="text-xl font-bold text-emerald-900">
                          {campaign.type || 'Not specified'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Campaign Date */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200">
              <div className="p-8">
                <h3 className="text-xl font-bold text-slate-900 mb-6">Tanggal Campaign</h3>
                <div className="grid sm:grid-cols-2 gap-6">
                  <div className="space-y-6">
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-slate-100 rounded-lg">
                        <Calendar className="w-5 h-5 text-slate-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-slate-900 mb-1">Start Date</p>
                        <p className="text-slate-600">
                          {campaign.startDate ? formatDate(campaign.startDate) : 'Not specified'}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-slate-100 rounded-lg">
                        <Calendar className="w-5 h-5 text-slate-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-slate-900 mb-1">End Date</p>
                        <p className="text-slate-600">
                          {campaign.endDate ? formatDate(campaign.endDate) : 'Not specified'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/** Detail Campaign */}
              {/* Platform Dan Kategori Section - Refactored */}
              <div className="p-8 border-t border-slate-200">
                <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-3">
                  
                  Platform Dan Kategori
                </h3>

                <div className="grid md:grid-cols-2 gap-8">
                  {/* Categories Section */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 bg-purple-100 rounded-lg">
                        <Building2 className="w-4 h-4 text-purple-600" />
                      </div>
                      <h4 className="text-lg font-semibold text-slate-900">Kategori</h4>
                    </div>

                    {campaign.directData?.categories?.length ? (
                      <div className="space-y-3">
                        <p className="text-sm text-slate-600 mb-3">
                          Kategori yang dipilih untuk campaign ini:
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {campaign.directData.categories.map((cat: { name: string; id: string }) => (
                            <span
                              key={cat.id}
                              className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-50 to-purple-100 text-purple-700 px-4 py-2 rounded-full text-sm font-medium border border-purple-200 shadow-sm"
                            >
                              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                              {cat.name}
                            </span>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-lg border border-slate-200">
                        <XCircle className="w-5 h-5 text-slate-400" />
                        <div>
                          <p className="text-sm font-medium text-slate-700">Tidak ada kategori</p>
                          <p className="text-xs text-slate-500">Kategori belum ditentukan untuk campaign ini</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Platform Section */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <Users className="w-4 h-4 text-blue-600" />
                      </div>
                      <h4 className="text-lg font-semibold text-slate-900">Platform Media Sosial</h4>
                    </div>

                    {campaign.directData?.platformSelections?.length ? (
                      <div className="space-y-3">
                        <p className="text-sm text-slate-600 mb-3">
                          Platform media sosial yang ditargetkan:
                        </p>
                        <div className="space-y-3">
                          {campaign.directData.platformSelections.map((plat: { id: string; platformName: string; follower: string; }) => (
                            <div
                              key={plat.id}
                              className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200"
                            >
                              <div className="flex items-center gap-3">
                                {getSocialIcon(plat.platformName)}
                                <div>
                                  <p className="font-medium text-slate-900">{plat.platformName}</p>
                                  <p className="text-sm text-slate-600">Target Platform</p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="font-semibold text-blue-700">{plat.follower} <span className="text-xs text-blue-600">min.</span></p>
                                <p className="text-xs text-blue-600">Followers</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-lg border border-slate-200">
                        <XCircle className="w-5 h-5 text-slate-400" />
                        <div>
                          <p className="text-sm font-medium text-slate-700">Tidak ada platform</p>
                          <p className="text-xs text-slate-500">Platform belum dipilih untuk campaign ini</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Informasi Campaign Section - Refactored */}
              <div className="p-8 border-t border-slate-200">
                <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-3">
                  Informasi Campaign
                </h3>

                {campaign.directData?.educationBackground?.educations?.length ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 mb-6">
                      <div className="flex-1 h-px bg-slate-200"></div>
                      <span className="px-4 py-2 bg-slate-100 text-slate-600 text-sm font-medium rounded-full">
                        Ketentuan Campaign
                      </span>
                      <div className="flex-1 h-px bg-slate-200"></div>
                    </div>

                    <div className="grid gap-4">
                      {campaign.directData.educationBackground.educations.map((edu: any, index: number) => (
                        <div
                          key={index}
                          className="group p-6 bg-white border border-slate-200 rounded-xl hover:shadow-md hover:border-slate-300 transition-all duration-200"
                        >
                          <div className="flex items-start gap-4">
                            <div className="p-3 bg-gradient-to-br from-emerald-100 to-green-100 rounded-lg group-hover:from-emerald-200 group-hover:to-green-200 transition-colors">
                              <MdOutlineSettingsVoice className="w-5 h-5 text-emerald-600" />
                            </div>

                            <div className="flex-1 space-y-3">
                              <div className="flex items-center justify-between">
                                <h4 className="text-lg font-semibold text-slate-900">Pesan Utama & Tone of Voice</h4>
                              </div>

                              <div className="">
                                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                                  <div>
                                    <p className="text-xs font-medium text-slate-600 uppercase tracking-wide">{edu.platform || 'Tidak ditentukan'}</p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-start gap-4">
                            <div className="p-3 bg-gradient-to-br from-emerald-100 to-green-100 rounded-lg group-hover:from-emerald-200 group-hover:to-green-200 transition-colors">
                              <IoIosWarning className="w-5 h-5 text-emerald-600" />
                            </div>

                            <div className="flex-1 space-y-3">
                              <div className="flex items-center justify-between">
                                <h4 className="text-lg font-semibold text-slate-900">Aturan & Larangan</h4>
                              </div>

                              <div className="">
                                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                                  <div>
                                    <p className="text-xs font-medium text-slate-600 uppercase tracking-wide">{edu.service || 'Tidak ditentukan'}</p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-start gap-4">
                            <div className="p-3 bg-gradient-to-br from-emerald-100 to-green-100 rounded-lg group-hover:from-emerald-200 group-hover:to-green-200 transition-colors">
                              <AiFillTikTok className="w-5 h-5 text-emerald-600" />
                            </div>

                            <div className="flex-1 space-y-3">
                              <div className="flex items-center justify-between">
                                <h4 className="text-lg font-semibold text-slate-900">Kebutuhan Konten</h4>
                              </div>

                              <div className="">
                                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                                  <div>
                                    <p className="text-xs font-medium text-slate-600 uppercase tracking-wide">{edu.followers || 'Tidak ditentukan'}</p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="flex flex-col items-center gap-4">
                      <div className="p-4 bg-slate-100 rounded-full">
                        <XCircle className="w-8 h-8 text-slate-400" />
                      </div>
                      <div>
                        <h4 className="text-lg font-semibold text-slate-900 mb-2">Tidak Ada Layanan Terdefinisi</h4>
                        <p className="text-slate-600 max-w-md">
                          Belum ada detail layanan yang ditentukan untuk campaign ini.
                          Silakan hubungi brand owner untuk informasi lebih lanjut.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Brand Information */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Informasi Brand</h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-lg">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <User className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-slate-600">Brand Owner</p>
                      <p className="font-medium text-slate-900">{campaign.directData.personalInfo.name || 'Not available'}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-lg">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <MdEmail className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-slate-600">Email</p>
                      <p className="font-medium text-slate-900">{campaign.directData.personalInfo.email || 'Not available'}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-lg">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <MdPhone className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-slate-600">No. Handphone</p>
                      <p className="font-medium text-slate-900">{campaign.directData.personalInfo.phone || 'Tidak ada'}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-lg">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <Building2 className="w-5 h-5 text-purple-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-slate-600">Nama Brand</p>
                      <p className="font-medium text-slate-900">{campaign.brands?.name || 'Not available'}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Panel */}
            {campaign.status === 'PENDING' && (
              <div className="bg-white rounded-xl shadow-sm border border-slate-200">
                <div className="p-6">
                  <div className="space-y-3">
                    <button
                      onClick={handleOpenInfluencerModal}
                      disabled={actionLoading !== null}
                      className="w-full flex items-center justify-center gap-3 px-6 py-3 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md"
                    >
                      <UserCheck className="w-4 h-4" />
                      Terima Pengajuan & Lanjutkan
                    </button>

                    <button
                      onClick={handleReject}
                      disabled={actionLoading !== null}
                      className="w-full flex items-center justify-center gap-3 px-6 py-3 text-sm font-medium text-white bg-rose-600 hover:bg-rose-700 disabled:bg-rose-400 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md"
                    >
                      {actionLoading === 'reject' ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <XCircle className="w-4 h-4" />
                      )}
                      Tolak Campaign
                    </button>
                  </div>

                  <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                    <div className="flex gap-3">
                      <Eye className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-amber-800">Panduan Peninjauan</p>
                        <p className="text-xs text-amber-700 mt-1">
                          Harap tinjau semua detail kampanye dengan saksama sebelum mengambil tindakan apa pun. Kampanye yang disetujui akan langsung terlihat oleh influencer.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Status Info */}
            {campaign.status !== 'PENDING' && (
              <div className="bg-white rounded-xl shadow-sm border border-slate-200">
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-slate-900 mb-4">Campaign Status</h3>
                  <div className={`p-4 rounded-lg ${getStatusStyle(campaign.status)}`}>
                    <div className="flex items-center gap-3">
                      {getStatusIcon(campaign.status)}
                      <div>
                        <p className="font-medium">Campaign {campaign.status}</p>
                        <p className="text-sm opacity-75 mt-1">
                          {campaign.status === 'ACTIVE' ? 'Campaign ini sekarang sudah aktif dan dapat dilihat oleh para influencer.' : 'Campaign ini telah ditolak dan tidak terlihat.'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Influencer Selection Modal */}
      <InfluencerSelectionModal />
    </div>
  )
}