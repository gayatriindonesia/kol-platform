import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Play, Pause, Square } from "lucide-react"
import { Campaign } from "@prisma/client"

interface CampaignActionButtonProps {
  campaign: Campaign
}

export function CampaignActionButton({ campaign }: CampaignActionButtonProps) {
  const handleStartCampaign = () => {
    const event = new CustomEvent('start-campaign', { 
      detail: campaign 
    })
    window.dispatchEvent(event)
  }

  const handleStopCampaign = () => {
    const event = new CustomEvent('stop-campaign', { 
      detail: campaign 
    })
    window.dispatchEvent(event)
  }

  const getStatusBadge = () => {
    const statusConfig = {
      PENDING: { 
        label: 'Pending', 
        variant: 'secondary' as const,
        className: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100'
      },
      ACTIVE: { 
        label: 'Active', 
        variant: 'default' as const,
        className: 'bg-green-100 text-green-800 hover:bg-green-100'
      },
      CANCELLED: { 
        label: 'Cancelled', 
        variant: 'outline' as const,
        className: 'bg-gray-100 text-gray-800 hover:bg-gray-100'
      },
      COMPLETED: { 
        label: 'Completed', 
        variant: 'outline' as const,
        className: 'bg-blue-100 text-blue-800 hover:bg-blue-100'
      },
      REJECTED: { 
        label: 'Rejected', 
        variant: 'outline' as const,
        className: 'bg-gray-100 text-gray-800 hover:bg-gray-100'
      },
    }

    const config = statusConfig[campaign.status as keyof typeof statusConfig] || statusConfig.PENDING

    return (
      <Badge 
        variant={config.variant}
        className={config.className}
      >
        {config.label}
      </Badge>
    )
  }

  const renderActionButton = () => {
    switch (campaign.status) {
      case 'PENDING':
        return (
          <Button
            size="sm"
            onClick={handleStartCampaign}
            className="h-8 w-8 p-0"
            title="Start Campaign"
          >
            <Play className="h-4 w-4" />
          </Button>
        )
      case 'ACTIVE':
        return (
          <Button
            size="sm"
            variant="outline"
            onClick={handleStopCampaign}
            className="h-8 w-8 p-0"
            title="Pause Campaign"
          >
            <Pause className="h-4 w-4" />
          </Button>
        )
      case 'CANCELLED':
        return (
          <Button
            size="sm"
            onClick={handleStartCampaign}
            className="h-8 w-8 p-0"
            title="Resume Campaign"
          >
            <Play className="h-4 w-4" />
          </Button>
        )
      case 'COMPLETED':
        return (
          <Button
            size="sm"
            variant="outline"
            disabled
            className="h-8 w-8 p-0"
            title="Campaign Completed"
          >
            <Square className="h-4 w-4" />
          </Button>
        )
      default:
        return null
    }
  }

  return (
    <div className="flex items-center gap-2">
      {getStatusBadge()}
      {renderActionButton()}
    </div>
  )
}