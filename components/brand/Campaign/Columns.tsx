"use client"

import { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown, MoreHorizontal, Eye, Edit3, Trash2, Play, Pause, BarChart3, TrendingUp } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Campaign } from "@prisma/client"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import Link from "next/link"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface CampaignWithBrand extends Campaign {
  brands?: {
    id: string
    name: string
    user?: {
      image?: string | null
      name?: string | null
    }
  }
  _count?: {
    influencers?: number
    posts?: number
  }
  metrics?: {
    reach?: number
    engagement?: number
    conversions?: number
  }
}

// Status configuration
const statusConfig = {
  PENDING: {
    label: "Pending",
    color: "bg-amber-50 text-amber-700 border-amber-200",
    icon: "⏳"
  },
  ACTIVE: {
    label: "Active",
    color: "bg-green-50 text-green-700 border-green-200",
    icon: "🚀"
  },
  PAUSED: {
    label: "Paused",
    color: "bg-gray-50 text-gray-700 border-gray-200",
    icon: "⏸️"
  },
  COMPLETED: {
    label: "Completed",
    color: "bg-blue-50 text-blue-700 border-blue-200",
    icon: "✅"
  },
  REJECTED: {
    label: "Rejected",
    color: "bg-red-50 text-red-700 border-red-200",
    icon: "❌"
  },
  DRAFT: {
    label: "Draft",
    color: "bg-purple-50 text-purple-700 border-purple-200",
    icon: "📝"
  }
}

// Campaign type configuration
const typeConfig = {
  BRAND_AWARENESS: {
    label: "Brand Awareness",
    color: "bg-indigo-50 text-indigo-700 border-indigo-200"
  },
  PRODUCT_LAUNCH: {
    label: "Product Launch",
    color: "bg-pink-50 text-pink-700 border-pink-200"
  },
  ENGAGEMENT: {
    label: "Engagement",
    color: "bg-orange-50 text-orange-700 border-orange-200"
  },
  CONVERSION: {
    label: "Conversion",
    color: "bg-emerald-50 text-emerald-700 border-emerald-200"
  },
  RETENTION: {
    label: "Retention",
    color: "bg-violet-50 text-violet-700 border-violet-200"
  }
}

export const columns: ColumnDef<CampaignWithBrand>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          checked={table.getIsAllPageRowsSelected()}
          onChange={table.getToggleAllPageRowsSelectedHandler()}
          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
        />
        <span className="text-xs text-gray-500 font-medium">#</span>
      </div>
    ),
    cell: ({ row }) => (
      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          checked={row.getIsSelected()}
          onChange={row.getToggleSelectedHandler()}
          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
        />
        <span className="text-sm text-gray-500 font-mono w-8">
          {String(row.index + 1).padStart(2, '0')}
        </span>
      </div>
    ),
    enableSorting: false,
    enableHiding: false,
    size: 60,
  },
  {
    accessorKey: 'name',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-8 px-2 font-semibold hover:bg-gray-100"
        >
          Campaign Details
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const campaign = row.original
      return (
        <div className="flex items-center space-x-3 py-2">
          <div className="flex-shrink-0">
            <Avatar className="h-10 w-10">
              <AvatarImage src={campaign.brands?.user?.image || undefined} />
              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-xs font-semibold">
                {campaign.name.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </div>
          <div className="min-w-0 flex-1">
            <div className="font-semibold text-gray-900 truncate hover:text-blue-600 transition-colors">
              {campaign.name}
            </div>
            <div className="text-sm text-gray-500">
              {campaign.brands?.name || 'No Brand'}
            </div>
            <div className="flex items-center space-x-2 mt-1">
              <span className="text-xs text-gray-400">ID: {campaign.id.slice(-8)}</span>
              {campaign._count?.influencers && (
                <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded">
                  {campaign._count.influencers} influencers
                </span>
              )}
            </div>
          </div>
        </div>
      )
    },
    minSize: 250,
  },
  {
    accessorKey: "type",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-8 px-2 font-semibold hover:bg-gray-100"
        >
          Campaign Type
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const type = row.getValue("type") as string
      const config = typeConfig[type as keyof typeof typeConfig] || {
        label: type,
        color: "bg-gray-50 text-gray-700 border-gray-200"
      }
      
      return (
        <Badge 
          variant="outline" 
          className={`${config.color} border font-medium px-3 py-1`}
        >
          {config.label}
        </Badge>
      )
    },
    size: 150,
  },
  {
    accessorKey: "status",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-8 px-2 font-semibold hover:bg-gray-100"
        >
          Status
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const status = row.getValue("status") as string
      const config = statusConfig[status as keyof typeof statusConfig] || {
        label: status,
        color: "bg-gray-50 text-gray-700 border-gray-200",
        icon: "•"
      }

      return (
        <div className="flex items-center space-x-2">
          <Badge 
            variant="outline" 
            className={`${config.color} border font-medium px-3 py-1 flex items-center space-x-1`}
          >
            <span className="text-xs">{config.icon}</span>
            <span>{config.label}</span>
          </Badge>
        </div>
      )
    },
    size: 120,
  },
  {
    id: "performance",
    header: "Performance",
    cell: ({ row }) => {
      const campaign = row.original
      const metrics = campaign.metrics || {}
      
      return (
        <div className="space-y-1">
          <div className="flex items-center space-x-2 text-xs">
            <TrendingUp className="h-3 w-3 text-green-500" />
            <span className="text-gray-600">Reach:</span>
            <span className="font-medium">{metrics.reach?.toLocaleString() || '0'}</span>
          </div>
          <div className="flex items-center space-x-2 text-xs">
            <BarChart3 className="h-3 w-3 text-blue-500" />
            <span className="text-gray-600">Engagement:</span>
            <span className="font-medium">{metrics.engagement?.toFixed(1) || '0'}%</span>
          </div>
          <div className="flex items-center space-x-2 text-xs">
            <div className="h-3 w-3 rounded-full bg-purple-500"></div>
            <span className="text-gray-600">Conversions:</span>
            <span className="font-medium">{metrics.conversions || '0'}</span>
          </div>
        </div>
      )
    },
    size: 150,
  },
  {
    accessorKey: "createdAt",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-8 px-2 font-semibold hover:bg-gray-100"
        >
          Created Date
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const date = new Date(row.getValue("createdAt"))
      const now = new Date()
      const diffTime = Math.abs(now.getTime() - date.getTime())
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      
      let timeAgo = ""
      if (diffDays === 0) timeAgo = "Today"
      else if (diffDays === 1) timeAgo = "Yesterday"
      else if (diffDays < 7) timeAgo = `${diffDays} days ago`
      else if (diffDays < 30) timeAgo = `${Math.floor(diffDays/7)} weeks ago`
      else timeAgo = `${Math.floor(diffDays/30)} months ago`

      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="space-y-1 cursor-help">
                <div className="font-medium text-gray-900">
                  {date.toLocaleDateString("id-ID", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric"
                  })}
                </div>
                <div className="text-xs text-gray-500">{timeAgo}</div>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>{date.toLocaleString("id-ID")}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )
    },
    size: 120,
  },
  {
    id: "duration",
    header: "Duration",
    cell: ({ row }) => {
      const campaign = row.original
      const startDate = campaign.startDate ? new Date(campaign.startDate) : null
      const endDate = campaign.endDate ? new Date(campaign.endDate) : null
      
      if (!startDate || !endDate) {
        return <span className="text-xs text-gray-400">Not set</span>
      }
      
      const diffTime = endDate.getTime() - startDate.getTime()
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      
      return (
        <div className="text-sm">
          <div className="font-medium text-gray-900">{diffDays} days</div>
          <div className="text-xs text-gray-500">
            {startDate.toLocaleDateString("id-ID", { month: "short", day: "numeric" })} - {endDate.toLocaleDateString("id-ID", { month: "short", day: "numeric" })}
          </div>
        </div>
      )
    },
    size: 120,
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const campaign = row.original
      const canStart = campaign.status === 'PENDING'
      const canPause = campaign.status === 'ACTIVE'

      return (
        <div className="flex items-center space-x-1">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8 hover:bg-blue-50 hover:text-blue-600"
                  asChild
                >
                  <Link href={`/brand/campaigns/${campaign.id}`}>
                    <Eye className="h-4 w-4" />
                  </Link>
                </Button>
              </TooltipTrigger>
              <TooltipContent>View Details</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 hover:bg-gray-50"
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem asChild>
                <Link 
                  href={`/brand/campaigns/${campaign.id}`}
                  className="flex items-center"
                >
                  <Eye className="h-4 w-4 mr-2" />
                  View Details
                </Link>
              </DropdownMenuItem>
              
              <DropdownMenuItem 
                onClick={() => {
                  const event = new CustomEvent("edit-campaign", { detail: campaign })
                  window.dispatchEvent(event)
                }}
              >
                <Edit3 className="h-4 w-4 mr-2" />
                Edit Campaign
              </DropdownMenuItem>
              
              <DropdownMenuSeparator />
              
              {canStart && (
                <DropdownMenuItem 
                  onClick={() => {
                    const event = new CustomEvent("start-campaign", { detail: campaign })
                    window.dispatchEvent(event)
                  }}
                  className="text-green-600"
                >
                  <Play className="h-4 w-4 mr-2" />
                  Start Campaign
                </DropdownMenuItem>
              )}
              
              {canPause && (
                <DropdownMenuItem 
                  onClick={() => {
                    const event = new CustomEvent("pause-campaign", { detail: campaign })
                    window.dispatchEvent(event)
                  }}
                  className="text-orange-600"
                >
                  <Pause className="h-4 w-4 mr-2" />
                  Pause Campaign
                </DropdownMenuItem>
              )}
              
              <DropdownMenuSeparator />
              
              <DropdownMenuItem 
                onClick={() => {
                  const event = new CustomEvent("delete-campaign", { detail: campaign })
                  window.dispatchEvent(event)
                }}
                className="text-red-600"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Campaign
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )
    },
    enableSorting: false,
    enableHiding: false,
    size: 100,
  },
]