"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { MoreHorizontal, Eye, CheckCircle, XCircle } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { useState } from "react";
import { submitMOUForApproval } from "@/lib/mou.actions";

type ApprovalStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'NEEDS_REVISION';
export type MOUStatus = 'DRAFT' | 'PENDING_BRAND' | 'PENDING_INFLUENCER' | 'PENDING_ADMIN' | 'APPROVED' | 'REJECTED' | 'ACTIVE' | 'CANCELLED' | 'EXPIRED' | 'AMENDED';

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
    // Fixed: brands can be either array or single object, with nullable user fields
    brands: Array<{
      userId: string;
      user: {
        name: string | null;
        email: string | null;
      };
    }> | {
      userId: string;
      user: {
        name: string | null;
        email: string | null;
      };
    };
    CampaignInvitation: Array<{
      id: string;
      influencerId: string;
      status: string;
      influencer: {
        userId: string;
        user: {
          name: string | null;
          email: string | null;
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

// Rejection Dialog Component
function RejectDialog({
  open,
  onOpenChange,
  onConfirm,
  title = "Reject MOU"
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (reason: string) => void;
  title?: string;
}) {
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleConfirm = async () => {
    if (!reason.trim()) return;

    setIsSubmitting(true);
    try {
      await onConfirm(reason);
      setReason("");
      onOpenChange(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setReason("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            Please provide a reason for rejecting this MOU.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2">
          <Label htmlFor="reason">Rejection Reason *</Label>
          <Textarea
            id="reason"
            placeholder="Please provide a reason for rejection..."
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={4}
          />
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleConfirm}
            disabled={isSubmitting || !reason.trim()}
          >
            {isSubmitting ? 'Processing...' : 'Reject'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ✅ action Approve and reject
function ActionsCell({
  mou,
  onRefresh,
  onSingleApproval,
}: {
  mou: any;
  onRefresh?: () => void;
  onSingleApproval?: (id: string, status: "APPROVED" | "REJECTED", reason?: string) => void;
}) {
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const canApprove = mou.adminApprovalStatus === "PENDING";

  const handleApprove = async () => {
    try {
      const res = await submitMOUForApproval(mou.id);
      if (res.success) {
        toast.success(res.message);
        onRefresh?.();
      } else {
        toast.error(res.message);
      }
    } catch {
      try {
        if (onSingleApproval) {
          onSingleApproval(mou.id, "APPROVED");
        }
      } catch (fallbackErr) {
        toast.error("Failed to approve MOU");
        console.error(fallbackErr);
      }
    }
  };

  const handleRejectConfirm = (reason: string) => {
    try {
      if (onSingleApproval) {
        onSingleApproval(mou.id, "REJECTED", reason);
      }
    } catch (err) {
      toast.error("Failed to reject MOU");
      console.error(err);
    }
  };

  return (
    <>
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
              <DropdownMenuItem
                className="text-green-600"
                onClick={handleApprove}
              >
                <CheckCircle className="mr-2 h-4 w-4" />
                Approve MOU
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-red-600"
                onClick={() => setRejectDialogOpen(true)}
              >
                <XCircle className="mr-2 h-4 w-4" />
                Reject
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <RejectDialog
        open={rejectDialogOpen}
        onOpenChange={setRejectDialogOpen}
        onConfirm={handleRejectConfirm}
        title={`Reject MOU: ${mou.title}`}
      />
    </>
  );
}


export const createAdminColumns = (
  onSingleApproval?: (mouId: string, status: ApprovalStatus, reason?: string) => void,
  onRefresh?: () => void
): ColumnDef<MOU>[] => [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
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
      id: "approvals",
      header: "Approvals",
      cell: ({ row }) => (
        <div className="flex flex-col gap-0.5 text-[11px]">
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Brand</span>
            {getApprovalStatusBadge(row.original.brandApprovalStatus)}
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Influencer</span>
            {getApprovalStatusBadge(row.original.influencerApprovalStatus)}
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Admin</span>
            {getApprovalStatusBadge(row.original.adminApprovalStatus)}
          </div>
        </div>
      ),
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
      cell: ({ row }) => (
        <ActionsCell
          mou={row.original}
          onRefresh={onRefresh}
          onSingleApproval={onSingleApproval}
        />
      ),
    }

  ];

// Legacy adminColumns for backward compatibility
export const adminColumns: ColumnDef<MOU>[] = createAdminColumns();

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
        {row.original.campaign.name}
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
      const canApprove = mou.influencerApprovalStatus === 'PENDING';

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