"use client";

import * as React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { FileText, Clock, CheckCircle, XCircle } from "lucide-react";
import { DataTable } from "@/components/kol/Mou/data-table";
import { influencerColumns } from "@/components/kol/Mou/columns.tsx";
import { ApprovalDialog } from "@/components/kol/Mou/approval-dialog";
import {
  getPendingMOUsForUser,
  approveMOU,
  rejectMOU,
} from "@/lib/mou.actions";
import { toast } from "sonner";

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

export default function InfluencerMOUPage() {
  const [mous, setMous] = React.useState<MOU[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [approvalDialog, setApprovalDialog] = React.useState<{
    open: boolean;
    type: 'approve' | 'reject';
    mouId: string;
    mouTitle: string;
  }>({
    open: false,
    type: 'approve',
    mouId: '',
    mouTitle: '',
  });

  const loadMOUs = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await getPendingMOUsForUser();
      console.log("ambil data dari getPendingMouForUSER", result)

      if (result.success && result.data) {
        setMous(result.data);
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

  const handleApprovalConfirm = async (reason?: string) => {
    const { type, mouId } = approvalDialog;
    
    try {
      let result;
      if (type === 'approve') {
        result = await approveMOU(mouId, 'INFLUENCER');
      } else {
        result = await rejectMOU(mouId, reason!, 'INFLUENCER');
      }

      if (result.success) {
        toast.success(result.message);
        await loadMOUs();
      } else {
        toast.error(result.message);
      }
    } catch {
      toast.error(`Failed to ${type} MOU`);
    } finally {
      setApprovalDialog({ open: false, type: 'approve', mouId: '', mouTitle: '' });
    }
  };

  const pendingMOUs = mous.filter(m => m.influencerApprovalStatus === 'PENDING');
  const approvedMOUs = mous.filter(m => m.influencerApprovalStatus === 'APPROVED');
  const rejectedMOUs = mous.filter(m => m.influencerApprovalStatus === 'REJECTED');

  const stats = {
    total: mous.length,
    pending: pendingMOUs.length,
    approved: approvedMOUs.length,
    rejected: rejectedMOUs.length,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My MOUs</h1>
          <p className="text-muted-foreground">
            Manage MOUs for your collaborations
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
              Your collaboration MOUs
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Approval</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pending}</div>
            <p className="text-xs text-muted-foreground">
              Awaiting your approval
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
              Approved by you
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
            Pending Approval
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
                Complete list of your collaboration MOUs
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DataTable
                columns={influencerColumns}
                data={mous}
                userRole="INFLUENCER"
                isLoading={isLoading}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pending" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Pending Approval</CardTitle>
              <CardDescription>
                MOUs awaiting your approval
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DataTable
                columns={influencerColumns}
                data={pendingMOUs}
                userRole="INFLUENCER"
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
                MOUs you have approved
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DataTable
                columns={influencerColumns}
                data={approvedMOUs}
                userRole="INFLUENCER"
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
                MOUs you have rejected
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DataTable
                columns={influencerColumns}
                data={rejectedMOUs}
                userRole="INFLUENCER"
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
            ? `Approve "${approvalDialog.mouTitle}"`
            : `Reject "${approvalDialog.mouTitle}"`
        }
        description={
          approvalDialog.type === 'approve'
            ? "Are you sure you want to approve this MOU?"
            : "Please provide a reason for rejecting this MOU."
        }
        onConfirm={handleApprovalConfirm}
      />
    </div>
  );
}