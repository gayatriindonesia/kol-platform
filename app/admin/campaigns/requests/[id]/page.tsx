import { notFound } from 'next/navigation'
import { getCampaignById } from '@/lib/campaign.actions'
import { CheckCircle, Clock, User, XCircle, Calendar } from 'lucide-react'

import { formatDate } from '@/lib/utils'

interface Props {
  params: {
    id: string
  }
}

const CampaignReviewPage = async ({ params }: Props) => {
  const { id } = params
  const result = await getCampaignById(id)

  if (!result || !result.success || !result.campaign) {
    notFound()
  }

  const campaign = result.campaign

  const getStatusStyle = (status: string) => {
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

  const getStatusIcon = (status: string) => {
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

  return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      <h1 className="text-3xl font-bold text-gray-900 mb-4">Campaign Review</h1>

      <div className="bg-white border rounded-lg p-6 shadow space-y-6">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">{campaign.name}</h2>
            <span
              className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm border ${getStatusStyle(campaign.status)}`}
            >
              {getStatusIcon(campaign.status)}
              {campaign.status}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700">
          <div className="space-y-2">
            <p className="flex items-center gap-2">
              <User className="w-4 h-4" />
              Brand: {campaign.brands.name} ({campaign.brands.user.name})
            </p>
            <p className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Duration: {formatDate(campaign.startDate)} – {formatDate(campaign.endDate)}
            </p>
            <p className="flex items-center gap-2">
              Created at: {formatDate(campaign.createdAt)}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CampaignReviewPage
