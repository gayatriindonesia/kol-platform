"use client";

import * as React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { FileText, Clock, CheckCircle, XCircle } from "lucide-react";
import { DataTable } from "@/components/admin/Mou/data-table";
import { ApprovalDialog } from "@/components/admin/Mou/approval-dialog";
import {
  getAllMOUsWithFIlter,
  bulkApproveMOUs,
  bulkRejectMOUs,
  approveMOUWithAdmin,
  submitMOUForApproval
} from "@/lib/mou.actions";
import { toast } from "sonner";
import { createAdminColumns } from "@/components/admin/Mou/columns.tsx";

export type MOUStatus = 'DRAFT' | 'PENDING_BRAND' | 'PENDING_INFLUENCER' | 'PENDING_ADMIN' | 'APPROVED' | 'REJECTED' | 'ACTIVE' | 'CANCELLED' | 'EXPIRED' | 'AMENDED';
export type ApprovalStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'NEEDS_REVISION';

// Updated interface to match actual data structure
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

// Type guard to normalize brands data
const normalizeMOUData = (rawMOU: any): MOU => {
  // Ensure brands is always an array
  const brands = Array.isArray(rawMOU.campaign.brands) 
    ? rawMOU.campaign.brands 
    : [rawMOU.campaign.brands];

  return {
    ...rawMOU,
    campaign: {
      ...rawMOU.campaign,
      brands: brands.map((brand: any) => ({
        userId: brand.userId,
        user: {
          name: brand.user.name || 'Unknown',
          email: brand.user.email || 'No email'
        }
      }))
    }
  };
};

export default function AdminMOUPage() {
  const [mous, setMous] = React.useState<MOU[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [approvalDialog, setApprovalDialog] = React.useState<{
    open: boolean;
    type: 'approve' | 'reject';
    selectedIds: string[];
  }>({
    open: false,
    type: 'approve',
    selectedIds: [],
  });
  const [stats, setStats] = React.useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
  });

  const loadMOUs = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await getAllMOUsWithFIlter({
        limit: 100,
        offset: 0,
      });

      if (result.success && result.data) {
        // Normalize the data to match our interface
        const normalizedMOUs = result.data.mous.map((rawMOU: any) => normalizeMOUData(rawMOU));
        setMous(normalizedMOUs);
        
        // Calculate stats
        const total = normalizedMOUs.length;
        const pending = normalizedMOUs.filter((m: MOU) => 
          m.status.includes('PENDING') || m.adminApprovalStatus === 'PENDING'
        ).length;
        const approved = normalizedMOUs.filter((m: MOU) => m.status === 'APPROVED').length;
        const rejected = normalizedMOUs.filter((m: MOU) => m.status === 'REJECTED').length;
        
        setStats({ total, pending, approved, rejected });
      }
    } catch (error) {
      console.error('Error loading MOUs:', error);
      toast.error('Failed to load MOUs');
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadMOUs();
  }, [loadMOUs]);

  // Handle single MOU approval/rejection - integrates both systems
  const handleSingleApproval = async (mouId: string, status: ApprovalStatus, reason?: string) => {
    try {
      // For approval, try existing submitMOUForApproval first, then fallback to new system
      if (status === 'APPROVED') {
        try {
          const legacyResult = await submitMOUForApproval(mouId);
          if (legacyResult.success) {
            toast.success(legacyResult.message);
            await loadMOUs();
            return;
          }
        } catch (error) {
          console.log('Legacy approval failed, trying new system:', error);
        }
      }

      // Use new approval system (especially for rejections or if legacy fails)
      const result = await approveMOUWithAdmin({
        mouId,
        status,
        rejectionReason: reason
      });

      if (result.success) {
        toast.success(result.message);
        await loadMOUs();
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error('All approval methods failed:', error);
      toast.error(`Failed to ${status.toLowerCase()} MOU`);
    }
  };

  // Legacy bulk approve using existing submitMOUForApproval
  const handleLegacyBulkApprove = async (selectedIds: string[]) => {
    try {
      const results = [];
      
      for (const mouId of selectedIds) {
        try {
          const result = await submitMOUForApproval(mouId);
          results.push({ success: result.success, id: mouId });
        } catch {
          results.push({ success: false, id: mouId });
        }
      }

      const successCount = results.filter(r => r.success).length;
      const failureCount = results.length - successCount;

      if (successCount > 0) {
        toast.success(`Successfully approved ${successCount} MOUs${failureCount > 0 ? `, ${failureCount} failed` : ''}`);
        await loadMOUs();
      } else {
        toast.error('Failed to approve any MOUs');
      }
    } catch (error) {
      console.error('Legacy bulk approve failed:', error);
      toast.error('Failed to bulk approve MOUs');
    }
  };

  const handleBulkApprove = (selectedIds: string[]) => {
    setApprovalDialog({
      open: true,
      type: 'approve',
      selectedIds,
    });
  };

  const handleBulkReject = (selectedIds: string[]) => {
    setApprovalDialog({
      open: true,
      type: 'reject',
      selectedIds,
    });
  };

  const handleApprovalConfirm = async (reason?: string) => {
    const { type, selectedIds } = approvalDialog;
    
    try {
      let result;
      if (type === 'approve') {
        // Try legacy system first for approval
        try {
          await handleLegacyBulkApprove(selectedIds);
          setApprovalDialog({ open: false, type: 'approve', selectedIds: [] });
          return;
        } catch {
          console.log('Legacy bulk approve failed, using new system');
          result = await bulkApproveMOUs(selectedIds);
        }
      } else {
        // Use new system for rejection (requires reason)
        result = await bulkRejectMOUs(selectedIds, reason!);
      }

      if (result && result.success) {
        toast.success(result.message);
        await loadMOUs();
      } else if (result) {
        toast.error(result.message);
      }
    } catch {
      toast.error(`Failed to ${type} MOUs`);
    } finally {
      setApprovalDialog({ open: false, type: 'approve', selectedIds: [] });
    }
  };

  // Create columns with callback functions
  const adminColumns = React.useMemo(() => 
    createAdminColumns(handleSingleApproval, loadMOUs), 
    [handleSingleApproval, loadMOUs]
  );

  const pendingMOUs = mous.filter(m => 
    m.status.includes('PENDING') || m.adminApprovalStatus === 'PENDING'
  );
  const approvedMOUs = mous.filter(m => m.status === 'APPROVED');
  const rejectedMOUs = mous.filter(m => m.status === 'REJECTED');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">MOU Management</h1>
          <p className="text-muted-foreground">
            Manage and review Memorandums of Understanding
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total MOUs</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">
              All time MOUs created
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pending}</div>
            <p className="text-xs text-muted-foreground">
              Awaiting admin approval
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approved</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.approved}</div>
            <p className="text-xs text-muted-foreground">
              Successfully approved
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rejected</CardTitle>
            <XCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.rejected}</div>
            <p className="text-xs text-muted-foreground">
              Rejected MOUs
            </p>
          </CardContent>
        </Card>
      </div>

      {/* MOU Tabs */}
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">
            All MOUs
            <Badge variant="secondary" className="ml-2">
              {mous.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="pending">
            Pending Review
            <Badge variant="secondary" className="ml-2">
              {pendingMOUs.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="approved">
            Approved
            <Badge variant="secondary" className="ml-2">
              {approvedMOUs.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="rejected">
            Rejected
            <Badge variant="secondary" className="ml-2">
              {rejectedMOUs.length}
            </Badge>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>All MOUs</CardTitle>
              <CardDescription>
                Complete list of all Memorandums of Understanding
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DataTable
                columns={adminColumns}
                data={mous}
                userRole="ADMIN"
                onBulkApprove={handleBulkApprove}
                onBulkReject={handleBulkReject}
                onSingleApproval={handleSingleApproval}
                isLoading={isLoading}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pending" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Pending Review</CardTitle>
              <CardDescription>
                MOUs awaiting admin approval or review
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DataTable
                columns={adminColumns}
                data={pendingMOUs}
                userRole="ADMIN"
                onBulkApprove={handleBulkApprove}
                onBulkReject={handleBulkReject}
                onSingleApproval={handleSingleApproval}
                isLoading={isLoading}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="approved" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Approved MOUs</CardTitle>
              <CardDescription>
                Successfully approved Memorandums of Understanding
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DataTable
                columns={adminColumns}
                data={approvedMOUs}
                userRole="ADMIN"
                onSingleApproval={handleSingleApproval}
                isLoading={isLoading}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rejected" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Rejected MOUs</CardTitle>
              <CardDescription>
                Memorandums of Understanding that have been rejected
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DataTable
                columns={adminColumns}
                data={rejectedMOUs}
                userRole="ADMIN"
                onSingleApproval={handleSingleApproval}
                isLoading={isLoading}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <ApprovalDialog
        open={approvalDialog.open}
        onOpenChange={(open) => 
          setApprovalDialog(prev => ({ ...prev, open }))
        }
        type={approvalDialog.type}
        title={
          approvalDialog.type === 'approve' 
            ? `Approve ${approvalDialog.selectedIds.length} MOU(s)`
            : `Reject ${approvalDialog.selectedIds.length} MOU(s)`
        }
        description={
          approvalDialog.type === 'approve'
            ? "Are you sure you want to approve the selected MOUs?"
            : "Please provide a reason for rejecting the selected MOUs."
        }
        onConfirm={handleApprovalConfirm}
      />
    </div>
  );
}