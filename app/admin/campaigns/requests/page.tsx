'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  User,
  Calendar,
  DollarSign,
  Users,
  RefreshCw,
} from 'lucide-react'

import {
  approveCampaignByAdmin,
  getAllDirectCampaigns,
  rejectCampaignByAdmin,
} from '@/lib/campaign.actions'
import { toast } from 'sonner'
import { Campaign, CampaignStatus } from '@/types/campaign'

export default function RequestCampaign() {
  const router = useRouter()

  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [loadingId, setLoadingId] = useState<string | null>(null)
  const [fetchLoading, setFetchLoading] = useState(true)
  const [filter, setFilter] = useState<CampaignStatus | 'ALL'>('PENDING')

  useEffect(() => {
    fetchCampaigns()
  }, [])

  const fetchCampaigns = async () => {
    setFetchLoading(true)
    try {
      const result = await getAllDirectCampaigns()
      if (result.success) {
        setCampaigns(result.campaigns as Campaign[])
      } else {
        toast.error(result.message)
      }
    } catch {
      toast.error('Failed to fetch campaigns')
    } finally {
      setFetchLoading(false)
    }
  }

  const handleApprove = async (id: string) => {
    setLoadingId(id)
    try {
      const result = await approveCampaignByAdmin(id)
      if (result.success) {
        toast.success(result.message)
        updateStatus(id, 'ACTIVE')
      } else {
        toast.error(result.message)
      }
    } catch {
      toast.error('Failed to approve campaign')
    } finally {
      setLoadingId(null)
    }
  }

  const handleReject = async (id: string) => {
    setLoadingId(id)
    try {
      const result = await rejectCampaignByAdmin(id)
      if (result.success) {
        toast.success(result.message)
        updateStatus(id, 'REJECTED')
      } else {
        toast.error(result.message)
      }
    } catch {
      toast.error('Failed to reject campaign')
    } finally {
      setLoadingId(null)
    }
  }

  const updateStatus = (id: string, newStatus: CampaignStatus) => {
    setCampaigns(prev =>
      prev.map(c => (c.id === id ? { ...c, status: newStatus } : c))
    )
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
        return <Clock className="w-4 h-4" />
      case 'ACTIVE':
        return <CheckCircle className="w-4 h-4" />
      case 'REJECTED':
        return <XCircle className="w-4 h-4" />
      default:
        return <Clock className="w-4 h-4" />
    }
  }

  const filteredCampaigns = campaigns.filter(c =>
    filter === 'ALL' ? true : c.status === filter
  )

  const countByStatus = (status: CampaignStatus | 'ALL') =>
    status === 'ALL'
      ? campaigns.length
      : campaigns.filter(c => c.status === status).length

  if (fetchLoading) {
    return (
      <div className="h-screen flex justify-center items-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-500">Memuat campaign...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen px-6 py-8 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Campaign Approval</h1>
            <p className="text-sm text-gray-600">Review and manage direct campaign requests</p>
          </div>
          <button
            onClick={fetchCampaigns}
            disabled={fetchLoading}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${fetchLoading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        {/* Tabs */}
        <div className="mb-6 border-b">
          <div className="flex gap-6">
            {(['PENDING', 'ACTIVE', 'REJECTED', 'ALL'] as const).map(status => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`pb-2 border-b-2 text-sm font-medium ${
                  filter === status
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {status} ({countByStatus(status)})
              </button>
            ))}
          </div>
        </div>

        {/* Campaign Cards */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredCampaigns.map(campaign => (
            <div
              key={campaign.id}
              className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm hover:shadow-md transition"
            >
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">{campaign.name}</h2>
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-1 mt-2 text-xs border rounded-full ${getStatusStyle(campaign.status)}`}
                  >
                    {getStatusIcon(campaign.status)}
                    {campaign.status}
                  </span>
                </div>
              </div>

              <div className="text-sm text-gray-700 space-y-2 mb-4">
                <p className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  User : {campaign.brands.user.name}
                </p>
                <p className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Nama Brand : {campaign.brands.name}
                </p>
                <p className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Tipe Campaign: {campaign.type}
                </p>
                <p className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4" />
                  {formatCurrency(campaign.budget)}
                </p>
                <p className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  {formatDate(campaign.startDate)} - {formatDate(campaign.endDate)}
                </p>
                <p className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  {campaign.targetAudience || '-'}
                </p>
              </div>

              <div className="flex flex-col gap-2 mt-auto">
                <button
                  onClick={() => router.push(`/admin/campaigns/requests/${campaign.id}`)}
                  className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded hover:bg-gray-200"
                >
                  <Eye className="w-4 h-4" />
                  Review
                </button>
              </div>
            </div>
          ))}
        </div>

        {filteredCampaigns.length === 0 && (
          <div className="text-center py-16">
            <Users className="w-12 h-12 mx-auto text-gray-300 mb-4" />
            <p className="text-lg font-semibold text-gray-700">No campaigns found</p>
            <p className="text-sm text-gray-500">
              {filter === 'PENDING'
                ? 'No pending campaigns to review at the moment.'
                : `No campaigns with status "${filter.toLowerCase()}".`}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
