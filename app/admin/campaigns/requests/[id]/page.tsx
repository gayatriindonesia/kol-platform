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
  FileText,
} from 'lucide-react'

import {
  getCampaignById,
  approveCampaignByAdmin,
  rejectCampaignByAdmin,
} from '@/lib/campaign.actions'
import { toast } from 'sonner'
import { CampaignStatus } from '@/types/campaign'

export default function CampaignDetailPage() {
  const router = useRouter()
  const params = useParams()
  const campaignId = params.id as string

  const [campaign, setCampaign] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<'approve' | 'reject' | null>(null)

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
    setActionLoading('approve')
    try {
      const result = await approveCampaignByAdmin(campaignId)
      if (result.success) {
        toast.success(result.message)
        setCampaign((prev: any) => prev ? { ...prev, status: 'ACTIVE' } : null)
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
        return 'bg-yellow-100 text-yellow-800 border-yellow-300'
      case 'ACTIVE':
        return 'bg-green-100 text-green-800 border-green-300'
      case 'REJECTED':
        return 'bg-red-100 text-red-800 border-red-300'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300'
    }
  }

  const getStatusIcon = (status: CampaignStatus) => {
    switch (status) {
      case 'PENDING':
        return <Clock className="w-5 h-5" />
      case 'ACTIVE':
        return <CheckCircle className="w-5 h-5" />
      case 'REJECTED':
        return <XCircle className="w-5 h-5" />
      default:
        return <Clock className="w-5 h-5" />
    }
  }

  if (loading) {
    return (
      <div className="h-screen flex justify-center items-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-500">Memuat detail campaign...</p>
        </div>
      </div>
    )
  }

  if (!campaign) {
    return (
      <div className="h-screen flex justify-center items-center">
        <p className="text-gray-500">Campaign tidak ditemukan</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen px-6 py-8 bg-gray-50">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => router.push('/admin/campaigns/requests')}
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-100"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Campaign Detail</h1>
            <p className="text-sm text-gray-600">Review campaign information and take action</p>
          </div>
        </div>

        {/* Campaign Detail Card */}
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
          {/* Header Section */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">{campaign.name || 'Nama Campaign'}</h2>
                <span
                  className={`inline-flex items-center gap-2 px-3 py-1 text-sm border rounded-full ${getStatusStyle(campaign.status)}`}
                >
                  {getStatusIcon(campaign.status)}
                  {campaign.status}
                </span>
              </div>
            </div>
          </div>

          {/* Details Section */}
          <div className="p-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Left Column */}
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <User className="w-5 h-5 text-gray-600" />
                  <div>
                    <p className="text-sm text-gray-600">User</p>
                    <p className="font-medium">{campaign.brands?.user?.name || 'Tidak tersedia'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <User className="w-5 h-5 text-gray-600" />
                  <div>
                    <p className="text-sm text-gray-600">Nama Brand</p>
                    <p className="font-medium">{campaign.brands?.name || 'Tidak tersedia'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <Target className="w-5 h-5 text-gray-600" />
                  <div>
                    <p className="text-sm text-gray-600">Tipe Campaign</p>
                    <p className="font-medium">{campaign.type || 'Tidak tersedia'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <DollarSign className="w-5 h-5 text-gray-600" />
                  <div>
                    <p className="text-sm text-gray-600">Budget</p>
                    <p className="font-medium">
                      {campaign.budget ? formatCurrency(campaign.budget) : 'Tidak tersedia'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <Calendar className="w-5 h-5 text-gray-600" />
                  <div>
                    <p className="text-sm text-gray-600">Tanggal Mulai</p>
                    <p className="font-medium">
                      {campaign.startDate ? formatDate(campaign.startDate) : 'Tidak tersedia'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <Calendar className="w-5 h-5 text-gray-600" />
                  <div>
                    <p className="text-sm text-gray-600">Tanggal Selesai</p>
                    <p className="font-medium">
                      {campaign.endDate ? formatDate(campaign.endDate) : 'Tidak tersedia'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <Users className="w-5 h-5 text-gray-600" />
                  <div>
                    <p className="text-sm text-gray-600">Target Audience</p>
                    <p className="font-medium">{campaign.targetAudience || 'Tidak tersedia'}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Description */}
            {campaign.description && (
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="w-5 h-5 text-gray-600" />
                  <h3 className="font-medium text-gray-900">Deskripsi Campaign</h3>
                </div>
                <p className="text-gray-700 leading-relaxed">{campaign.description}</p>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          {campaign.status === 'PENDING' && (
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 rounded-b-lg">
              <div className="flex gap-4 justify-end">
                <button
                  onClick={handleReject}
                  disabled={actionLoading !== null}
                  className="flex items-center gap-2 px-6 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 disabled:bg-red-400 rounded-lg transition-colors"
                >
                  {actionLoading === 'reject' ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <XCircle className="w-4 h-4" />
                  )}
                  Reject Campaign
                </button>

                <button
                  onClick={handleApprove}
                  disabled={actionLoading !== null}
                  className="flex items-center gap-2 px-6 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 disabled:bg-green-400 rounded-lg transition-colors"
                >
                  {actionLoading === 'approve' ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <CheckCircle className="w-4 h-4" />
                  )}
                  Approve Campaign
                </button>
                </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}