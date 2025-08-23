"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Eye, CheckCircle, XCircle } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { approveMOU, rejectMOU } from "@/lib/mou.actions";

export type MOUStatus = 'DRAFT' | 'PENDING_BRAND' | 'PENDING_INFLUENCER' | 'PENDING_ADMIN' | 'APPROVED' | 'REJECTED' | 'ACTIVE' | 'CANCELLED' | 'EXPIRED' | 'AMENDED';
export type ApprovalStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'NEEDS_REVISION';

export interface MOU {
  id: string;
  title: string;
  status: MOUStatus;
  campaignId: string;
  brandApprovalStatus: ApprovalStatus;
  influencerApprovalStatus: ApprovalStatus;
  adminApprovalStatus: ApprovalStatus;
  brandApprovedAt: Date | null;
  influencerApprovedAt: Date | null;
  adminApprovedAt: Date | null;
  rejectedAt?: Date;
  rejectionReason?: string;
  createdAt: Date;
  updatedAt: Date;
  campaign: {
    id: string;
    name: string;
    brands: {
      userId: string;
      user: {
        name: string;
        email: string;
      };
    };
    CampaignInvitation: Array<{
      id: string;
      influencerId: string;
      status: string;
      influencer: {
        userId: string;
        user: {
          name: string;
          email: string;
        };
      };
    }>;
  };
}

const getStatusBadgeVariant = (status: string) => {
  switch (status) {
    case 'DRAFT':
      return 'secondary';
    case 'PENDING_BRAND':
    case 'PENDING_INFLUENCER':
    case 'PENDING_ADMIN':
      return 'default';
    case 'APPROVED':
      return 'default';
    case 'REJECTED':
      return 'destructive';
    default:
      return 'secondary';
  }
};

const getApprovalStatusBadge = (status: string) => {
  switch (status) {
    case 'PENDING':
      return <Badge variant="outline">Pending</Badge>;
    case 'APPROVED':
      return <Badge variant="default">Approved</Badge>;
    case 'REJECTED':
      return <Badge variant="destructive">Rejected</Badge>;
    default:
      return <Badge variant="secondary">-</Badge>;
  }
};

export const brandColumns: ColumnDef<MOU>[] = [
  {
    accessorKey: "title",
    header: "MOU Title",
    cell: ({ row }) => (
      <div className="max-w-[200px] truncate font-medium">
        {row.getValue("title")}
      </div>
    ),
  },
  {
    accessorKey: "campaign.name",
    header: "Campaign",
    cell: ({ row }) => (
      <div className="max-w-[150px] truncate">
        {row.original.campaign.name}
      </div>
    ),
  },
  {
    id: "influencers",
    header: "Influencers",
    cell: ({ row }) => (
      <div className="text-sm">
        {row.original.campaign.CampaignInvitation.map((inv) => (
          <div key={inv.id} className="truncate max-w-[120px]">
            {inv.influencer.user.name}
          </div>
        )).slice(0, 2)}
        {row.original.campaign.CampaignInvitation.length > 2 && (
          <div className="text-xs text-muted-foreground">
            +{row.original.campaign.CampaignInvitation.length - 2} more
          </div>
        )}
      </div>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      return (
        <Badge variant={getStatusBadgeVariant(status)}>
          {status.replace(/_/g, " ")}
        </Badge>
      );
    },
  },
  {
    accessorKey: "brandApprovalStatus",
    header: "My Approval",
    cell: ({ row }) => getApprovalStatusBadge(row.original.brandApprovalStatus),
  },
  {
    accessorKey: "createdAt",
    header: "Created",
    cell: ({ row }) => (
      <div className="text-sm text-muted-foreground">
        {format(new Date(row.getValue("createdAt")), "MMM dd, yyyy")}
      </div>
    ),
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      const mou = row.original;
      const canApprove = mou.brandApprovalStatus === 'PENDING';

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem>
              <Eye className="mr-2 h-4 w-4" />
              View Details
            </DropdownMenuItem>
            {canApprove && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-green-600">
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Approve
                </DropdownMenuItem>
                <DropdownMenuItem className="text-red-600">
                  <XCircle className="mr-2 h-4 w-4" />
                  Reject
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

export const influencerColumns: ColumnDef<MOU>[] = [
  {
    accessorKey: "title",
    header: "MOU Title",
    cell: ({ row }) => (
      <div className="max-w-[200px] truncate font-medium">
        {row.getValue("title")}
      </div>
    ),
  },
  {
    accessorKey: "campaign.name",
    header: "Campaign",
    cell: ({ row }) => (
      <div className="max-w-[150px] truncate">
        {row.original.campaign.name}
      </div>
    ),
  },
  {
    id: "brand",
    header: "Brand",
    cell: ({ row }) => (
      <div className="text-sm truncate max-w-[120px]">
        {row.original.campaign.brands.user.name}
      </div>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      return (
        <Badge variant={getStatusBadgeVariant(status)}>
          {status.replace(/_/g, " ")}
        </Badge>
      );
    },
  },
  {
    accessorKey: "influencerApprovalStatus",
    header: "My Approval",
    cell: ({ row }) => getApprovalStatusBadge(row.original.influencerApprovalStatus),
  },
  {
    accessorKey: "createdAt",
    header: "Created",
    cell: ({ row }) => (
      <div className="text-sm text-muted-foreground">
        {format(new Date(row.getValue("createdAt")), "MMM dd, yyyy")}
      </div>
    ),
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      const mou = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem>
              <Eye className="mr-2 h-4 w-4" />
              View Details
            </DropdownMenuItem>
            {mou.influencerApprovalStatus === 'PENDING' && (
              <>
                <DropdownMenuItem
                  className="text-green-600"
                  onClick={async () => {
                    try {
                      const res = await approveMOU(mou.id, "INFLUENCER");
                      if (res.success) {
                        toast.success(res.message);
                      } else {
                        toast.error(res.message);
                      }
                    } catch (err) {
                      toast.error("Failed to approve MOU");
                      console.error(err);
                    }
                  }}
                >
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Approve
                </DropdownMenuItem>

                <DropdownMenuItem
                  className="text-red-600"
                  onClick={async () => {
                    try {
                      const res = await rejectMOU(mou.id, "Reason here", "BRAND");
                      if (res.success) {
                        toast.success(res.message);
                      } else {
                        toast.error(res.message);
                      }
                    } catch (err) {
                      toast.error("Failed to reject MOU");
                      console.error(err);
                    }
                  }}
                >
                  <XCircle className="mr-2 h-4 w-4" />
                  Reject
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];