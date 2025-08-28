"use client";

import React, { useState, useEffect } from 'react';
import {
  CheckCircle,
  XCircle,
  Clock,
  FileText,
  Users,
  Search,
  Download,
  Upload,
  AlertTriangle,
  Eye,
  Edit,
  Trash2,
  MoreHorizontal,
  RefreshCw,
  UserCheck,
  Building,
  LucideIcon,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { createMOU, CreateMOUInput, getAllMOUs, getCampaignsNeedingMOU, approveMOU } from "@/lib/mou.actions";
import { CampaignType } from '@prisma/client';

// ... (keep all the existing type definitions)
type StatsCardProps = {
  title: string;
  value: string | number;
  icon: LucideIcon;
  color: "blue" | "yellow" | "green" | "red";
};

type QuickActionProps = {
  icon: LucideIcon;
  title: string;
  description: string;
  color: "blue" | "yellow" | "green";
  value?: string | number;
};

interface CampaignRequestCardProps {
  campaign: {
    id: string;
    name: string;
    brands: { user: { name: string } };
    CampaignInvitation: {
      influencer: { user: { name: string; email: string } };
    }[];
  };
  onSelect: (campaign: any) => void;
  isSelected: boolean;
}

interface Campaign {
  id: string;
  name: string;
  type: CampaignType;
  brands: {
    id: string;
    name: string;
    user: {
      name: string | null;
    };
  };
  CampaignInvitation: any[];
}

interface MOUCampaignRequest {
  id: string;
  name: string;
  brands: {
    user: {
      name: string;
      email?: string;
    };
  };
  CampaignInvitation: {
    influencer: {
      user: {
        name: string;
        email: string;
      };
    };
  }[];
}

interface MOU {
  id: string;
  title: string;
  createdAt: Date;
  status: MOUStatus;
  brandApprovalStatus: ApprovalStatus;
  influencerApprovalStatus: ApprovalStatus;
  adminApprovalStatus: ApprovalStatus;
  campaignId: string;
  updatedAt: Date;
  campaign: Campaign;
  deliverables?: string[];
  termsAndConditions?: string;
  paymentTerms?: string;
  timeline?: string;
}

interface MOUForApproval {
  id: string;
  title: string;
  createdAt: Date;
  updatedAt: Date;
  status: MOUStatus;
  campaignId: string;
  adminApprovalStatus: ApprovalStatus;
  brandApprovalStatus: ApprovalStatus;
  influencerApprovalStatus: ApprovalStatus;
  campaign: {
    id: string;
    name: string;
    type: CampaignType;
    brands: {
      id: string;
      name: string;
      user: {
        name: string | null;
      };
    };
    CampaignInvitation: any[];
  };
  approvals: any[];
}

type AllMOUsTabProps = {
  selectedMOUs: string[];
  onBulkSelect: (id: string, checked: boolean) => void;
  showBulkActions: boolean;
  setShowBulkActions: (value: boolean) => void;
};

type MOUTableRowProps = {
  mou: MOU;
  isSelected: boolean;
  onSelect: (checked: boolean) => void;
};

export type MOUStatus = 'DRAFT' | 'PENDING_BRAND' | 'PENDING_INFLUENCER' | 'PENDING_ADMIN' | 'APPROVED' | 'REJECTED' | 'ACTIVE' | 'CANCELLED' | 'EXPIRED' | 'AMENDED';
export type ApprovalStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'NEEDS_REVISION';

interface MOURequestFormData {
  message: string;
  urgentRequest: boolean;
}

interface MOUApprovalRowData {
  id: string;
  title: string;
  createdAt: Date;
  updatedAt: Date;
  status: string;
  campaignId: string;
  adminApprovalStatus: string;
  brandApprovalStatus: string;
  influencerApprovalStatus: string;
  campaign: {
    name: string;
  };
}

interface MOUApprovalRowProps {
  mou: MOUApprovalRowData;
  isSelected: boolean;
  onSelect: (checked: boolean) => void;
  onViewDetails: () => void;
  onApprove: (role: "BRAND" | "INFLUENCER") => Promise<void>; // Made async
}

interface MOURequestModalProps {
  campaign: MOUCampaignRequest;
  onClose: () => void;
}

interface BulkActionsModalProps {
  selectedMOUs: string[];
  onClose: () => void;
}

interface MOUDetailModalProps {
  mou: MOU;
  onClose: () => void;
  userRole?: 'ADMIN' | 'BRAND' | 'INFLUENCER';
}

interface ApprovalBadgeProps {
  status: "APPROVED" | "REJECTED" | "PENDING" | 'NEEDS_REVISION';
  label: string;
}

interface ApprovalModalProps {
  mouId: string;
  approvalType: 'ADMIN' | 'BRAND' | 'INFLUENCER';
  onClose: () => void;
  onSuccess: () => void;
}

interface RejectionModalProps {
  mouId: string;
  rejectionType: 'ADMIN' | 'BRAND' | 'INFLUENCER';
  onClose: () => void;
  onSuccess: () => void;
}

interface MOUForStatsCard {
  id: string;
  title: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  adminApprovalStatus: string;
  brandApprovalStatus: string;
  influencerApprovalStatus: string;
  campaign: {
    id: string;
    name: string;
    type: string;
    brandName: string;
  };
}

// Main Dashboard Component
export default function MOUManagementDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedMOUs, setSelectedMOUs] = useState<string[]>([]);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [mous, setMous] = useState<MOUForStatsCard[]>([]);
  const [refreshTrigger, setRefreshTrigger] = useState(0); // Add refresh trigger

  // Add refresh function
  const refreshData = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  useEffect(() => {
    const fetchData = async () => {
      const res = await getAllMOUs();
      if (res.success) {
        const mapped: MOUForStatsCard[] = res.data.map((m: any) => ({
          id: m.id,
          title: m.title,
          status: m.status,
          createdAt: m.createdAt,
          updatedAt: m.updatedAt,
          adminApprovalStatus: m.adminApprovalStatus,
          brandApprovalStatus: m.brandApprovalStatus,
          influencerApprovalStatus: m.influencerApprovalStatus,
          campaign: {
            id: m.campaign.id,
            name: m.campaign.name,
            type: m.campaign.type,
            brandName: m.campaign.brands?.[0]?.name || "Unknown",
          }
        }));
        setMous(mapped);
      }
    };
    fetchData();
  }, [refreshTrigger]); // Add refreshTrigger as dependency

  const total = mous.length;
  const pending = mous.filter(
    (m) =>
      m.adminApprovalStatus === 'PENDING' ||
      m.brandApprovalStatus === 'PENDING' ||
      m.influencerApprovalStatus === 'PENDING'
  ).length;

  const approved = mous.filter(
    (m) =>
      m.adminApprovalStatus === 'APPROVED' &&
      m.brandApprovalStatus === 'APPROVED' &&
      m.influencerApprovalStatus === 'APPROVED'
  ).length;

  const rejected = mous.filter(
    (m) =>
      m.adminApprovalStatus === 'REJECTED' ||
      m.brandApprovalStatus === 'REJECTED' ||
      m.influencerApprovalStatus === 'REJECTED'
  ).length;

  const tabs = [
    { id: 'overview', label: 'Overview', icon: FileText },
    { id: 'pending-requests', label: 'Pending Requests', icon: Clock },
    { id: 'all-mous', label: 'All MOUs', icon: Users },
    { id: 'create-mou', label: 'Create MOU', icon: Upload },
    { id: 'mou-approve', label: 'MOU Approval', icon: CheckCircle }
  ];

  const handleBulkSelect = (mouId: string, checked: boolean) => {
    if (checked) {
      setSelectedMOUs([...selectedMOUs, mouId]);
    } else {
      setSelectedMOUs(selectedMOUs.filter(id => id !== mouId));
    }
    setShowBulkActions(selectedMOUs.length > 0 || checked);
  };

  return (
    <div className="min-h-screen w-full bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">MOU Management</h1>
              <p className="text-gray-500">Manage campaign memorandums of understanding</p>
            </div>
            {/** Title Pojok Kanan */}
            <div className="flex space-x-4">
              tes
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 px-4 sm:px-6 lg:px-8 py-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <StatsCard title="Total MOUs" value={total} icon={FileText} color="blue" />
          <StatsCard title="Pending Approval" value={pending} icon={Clock} color="yellow" />
          <StatsCard title="Approved" value={approved} icon={CheckCircle} color="green" />
          <StatsCard title="Rejected" value={rejected} icon={XCircle} color="red" />
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm ${activeTab === tab.id
                        ? "border-blue-500 text-blue-600"
                        : "border-transparent text-gray-500 hover:text-gray-700"
                      }`}
                  >
                    <Icon className="w-4 h-4 mr-2" />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-lg shadow-sm">
          {activeTab === "overview" && <OverviewTab />}
          {activeTab === "pending-requests" && <PendingRequestsTab />}
          {activeTab === "all-mous" && (
            <AllMOUsTab
              selectedMOUs={selectedMOUs}
              onBulkSelect={handleBulkSelect}
              showBulkActions={showBulkActions}
              setShowBulkActions={setShowBulkActions}
            />
          )}
          {activeTab === "create-mou" && <CreateMOUTab onSuccess={refreshData} />}
          {activeTab === "mou-approve" && <MOUApprovalTab onRefresh={refreshData} />}
        </div>
      </div>

      {/* Bulk Actions Modal */}
      {showBulkActions && (
        <BulkActionsModal
          selectedMOUs={selectedMOUs}
          onClose={() => {
            setShowBulkActions(false);
            setSelectedMOUs([]);
          }}
        />
      )}
    </div>
  );
}

// Stats Card Component (unchanged)
function StatsCard({ title, value, icon: Icon, color }: StatsCardProps) {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-700',
    yellow: 'bg-yellow-50 text-yellow-700',
    green: 'bg-green-50 text-green-700',
    red: 'bg-red-50 text-red-700'
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <div className="flex items-center">
        <div className={`p-2 rounded-lg ${colorClasses[color]}`}>
          <Icon className="w-6 h-6" />
        </div>
        <div className="ml-4">
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
      </div>
    </div>
  );
}

// Overview Tab (unchanged)
function OverviewTab() {
  return (
    <div className="p-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Activity */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
          <div className="space-y-4">
            {[
              { action: 'MOU Approved', user: 'Sarah Johnson', time: '2 hours ago', type: 'approval' },
              { action: 'MOU Created', user: 'Admin', time: '4 hours ago', type: 'creation' },
              { action: 'MOU Rejected', user: 'Nike Inc.', time: '1 day ago', type: 'rejection' }
            ].map((activity, index) => (
              <div key={index} className="flex items-center p-3 bg-gray-50 rounded-lg">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${activity.type === 'approval' ? 'bg-green-100' :
                  activity.type === 'creation' ? 'bg-blue-100' : 'bg-red-100'
                  }`}>
                  {activity.type === 'approval' ? <CheckCircle className="w-4 h-4 text-green-600" /> :
                    activity.type === 'creation' ? <FileText className="w-4 h-4 text-blue-600" /> :
                      <XCircle className="w-4 h-4 text-red-600" />}
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                  <p className="text-xs text-gray-500">{activity.user} • {activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <QuickActionButton
              icon={Upload}
              title="Buat MOU Baru"
              description="Create MOU for approved campaigns"
              color="blue"
            />
            <QuickActionButton
              icon={Clock}
              title="Review Pending"
              description="8 MOUs waiting for approval"
              color="yellow"
            />
            <QuickActionButton
              icon={Download}
              title="Export Reports"
              description="Download MOU activity reports"
              color="green"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// Quick Action Button Component (unchanged)
function QuickActionButton({ icon: Icon, title, description, color }: QuickActionProps) {
  const colorClasses = {
    blue: 'text-blue-600 bg-blue-50 hover:bg-blue-100',
    yellow: 'text-yellow-600 bg-yellow-50 hover:bg-yellow-100',
    green: 'text-green-600 bg-green-50 hover:bg-green-100'
  };

  return (
    <button className={`w-full p-4 rounded-lg border-2 border-dashed border-gray-200 hover:border-gray-300 transition-colors ${colorClasses[color]}`}>
      <div className="flex items-center">
        <Icon className="w-5 h-5 mr-3" />
        <div className="text-left">
          <p className="font-medium">{title}</p>
          <p className="text-xs opacity-75">{description}</p>
        </div>
      </div>
    </button>
  );
}

// Pending Requests Tab (unchanged)
function PendingRequestsTab() {
  const [selectedRequest, setSelectedRequest] = useState<MOUCampaignRequest | null>(null)
  const [campaigns, setCampaigns] = useState<MOUCampaignRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function load() {
      setLoading(true);
      const res = await getCampaignsNeedingMOU();
      console.log("pending Campaign Need Data", res.data)
      if (res.success) {
        setCampaigns(res.data as MOUCampaignRequest[]);
      } else {
        console.error(res.message);
        setCampaigns([]);
      }
      setLoading(false);
    }
    load();
  }, []);

  const filteredCampaigns = campaigns.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Campaigns Needing MOU</h3>
        <div className="flex space-x-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Search campaigns..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center p-6">
          <Loader2 className="animate-spin w-6 h-6 text-gray-500" />
        </div>
      ) : (
        <div className="space-y-4">
          {filteredCampaigns.length === 0 ? (
            <p className="text-gray-500">Tidak ditemukan kampanye yang memerlukan MOU.</p>
          ) : (
            filteredCampaigns.map((campaign) => (
              <CampaignRequestCard
                key={campaign.id}
                campaign={campaign}
                onSelect={setSelectedRequest}
                isSelected={selectedRequest?.id === campaign.id}
              />
            ))
          )}
        </div>
      )}

      {selectedRequest && (
        <MOURequestModal
          campaign={selectedRequest}
          onClose={() => setSelectedRequest(null)}
        />
      )}
    </div>
  );
}

// Campaign Request Card (unchanged)
function CampaignRequestCard({ campaign, onSelect, isSelected }: CampaignRequestCardProps) {
  return (
    <div className={`border rounded-lg p-4 transition-all cursor-pointer ${isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
      }`}>
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-2">
            <h4 className="font-semibold text-gray-900">{campaign.name}</h4>
            <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">
              MOU Required
            </span>
          </div>
          <div className="flex items-center space-x-4 text-sm text-gray-500 mb-3">
            <div className="flex items-center">
              <Building className="w-4 h-4 mr-1" />
              {campaign.brands.user.name}
            </div>
            <div className="flex items-center">
              <Users className="w-4 h-4 mr-1" />
              {campaign.CampaignInvitation.length} Influencer(s)
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {campaign.CampaignInvitation.map((inv, index) => (
              <span key={index} className="px-2 py-1 text-xs bg-gray-100 rounded">
                {inv.influencer.user.name}
              </span>
            ))}
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => onSelect(campaign)}
            className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            Create MOU
          </button>
          <button className="p-2 text-gray-400 hover:text-gray-600">
            <MoreHorizontal className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

// All MOUs Tab (unchanged)
function AllMOUsTab({ selectedMOUs, onBulkSelect, setShowBulkActions }: AllMOUsTabProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [mous, setMous] = useState<any[]>([]);

  useEffect(() => {
    async function load() {
      setLoading(true)
      const res = await getAllMOUs();
      console.log("data all MOU", res.data)
      if (res.success) {
        setMous(res.data);
      } else {
        console.error(res.message);
        setMous([]);
      }
      setLoading(false)
    }
    load();
  }, []);

  const filteredMOUs = mous.filter((mou) => {
    const matchesSearch =
      searchTerm === "" ||
      mou.campaign?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || mou.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="p-6">
      {/* Filters */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex space-x-4">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Search MOUs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-64"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All Status</option>
            <option value="DRAFT">Draft</option>
            <option value="PENDING">Pending</option>
            <option value="APPROVED">Approved</option>
            <option value="REJECTED">Rejected</option>
          </select>
        </div>

        {selectedMOUs.length > 0 && (
          <div className="flex items-center space-x-3">
            <span className="text-sm text-gray-500">
              {selectedMOUs.length} selected
            </span>
            <button
              onClick={() => setShowBulkActions(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Bulk Actions
            </button>
          </div>
        )}
      </div>

      {/* MOUs Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <input
                  type="checkbox"
                  onChange={(e) => {
                    if (e.target.checked) {
                      filteredMOUs.forEach(mou => onBulkSelect(mou.id, true));
                    } else {
                      filteredMOUs.forEach(mou => onBulkSelect(mou.id, false));
                    }
                  }}
                  className="rounded border-gray-300"
                />
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                MOU Details
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Campaign
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Approvals
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              [...Array(5)].map((_, i) => (
                <tr key={i} className="animate-pulse">
                  <td className="px-6 py-4">
                    <div className="h-4 w-4 bg-gray-200 rounded" />
                  </td>
                  <td className="px-6 py-4">
                    <div className="h-4 w-32 bg-gray-200 rounded" />
                  </td>
                  <td className="px-6 py-4">
                    <div className="h-4 w-24 bg-gray-200 rounded" />
                  </td>
                  <td className="px-6 py-4">
                    <div className="h-4 w-16 bg-gray-200 rounded" />
                  </td>
                  <td className="px-6 py-4">
                    <div className="h-4 w-20 bg-gray-200 rounded" />
                  </td>
                  <td className="px-6 py-4">
                    <div className="h-4 w-12 bg-gray-200 rounded" />
                  </td>
                </tr>
              ))
            ) : filteredMOUs.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-6 py-10 text-center text-gray-500"
                >
                  Belum ada MOU yang tersedia
                </td>
              </tr>
            ) : (
              filteredMOUs.map((mou) => (
                <MOUTableRow
                  key={mou.id}
                  mou={mou}
                  isSelected={selectedMOUs.includes(mou.id)}
                  onSelect={(checked) => onBulkSelect(mou.id, checked)}
                />
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// MOU Table Row (unchanged)
function MOUTableRow({ mou, isSelected, onSelect }: MOUTableRowProps) {
  const getStatusBadge = (status: MOUStatus) => {
    const badges = {
      DRAFT: 'bg-gray-100 text-gray-800',
      PENDING: 'bg-yellow-100 text-yellow-800',
      APPROVED: 'bg-green-100 text-green-800',
      REJECTED: 'bg-red-100 text-red-800',
      PENDING_BRAND: 'bg-gray-100 text-gray-800',
      PENDING_INFLUENCER: 'bg-gray-100 text-gray-800',
      PENDING_ADMIN: 'bg-gray-100 text-gray-800',
      CANCELLED: 'bg-red-100 text-red-800',
      EXPIRED: 'bg-red-100 text-red-800',
      AMENDED: 'bg-yellow-100 text-yellow-800',
      ACTIVE: 'bg-green-100 text-green-800',
    };
    return badges[status] || badges.DRAFT;
  };

  const getApprovalIcon = (status: ApprovalStatus) => {
    switch (status) {
      case 'APPROVED': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'REJECTED': return <XCircle className="w-4 h-4 text-red-600" />;
      case 'NEEDS_REVISION': return <AlertTriangle className="w-4 h-4 text-orange-600" />;
      default: return <Clock className="w-4 h-4 text-yellow-600" />;
    }
  };

  return (
    <tr className={isSelected ? 'bg-blue-50' : 'hover:bg-gray-50'}>
      <td className="px-6 py-4 whitespace-nowrap">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={(e) => onSelect(e.target.checked)}
          className="rounded border-gray-300"
        />
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div>
          <div className="text-sm font-medium text-gray-900">{mou.title}</div>
          <div className="text-sm text-gray-500">
            Created {new Date(mou.createdAt).toLocaleDateString()}
          </div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div>
          <div className="text-sm font-medium text-gray-900">{mou.campaign.name}</div>
          <div className="text-sm text-gray-500">{mou.campaign.brands.user.name}</div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(mou.status)}`}>
          {mou.status}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex space-x-1">
          <div className="flex items-center" title="Brand Approval">
            {getApprovalIcon(mou.brandApprovalStatus)}
          </div>
          <div className="flex items-center" title="Influencer Approval">
            {getApprovalIcon(mou.influencerApprovalStatus)}
          </div>
          <div className="flex items-center" title="Admin Approval">
            {getApprovalIcon(mou.adminApprovalStatus)}
          </div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
        <div className="flex space-x-2">
          <button className="text-blue-600 hover:text-blue-900">
            <Eye className="w-4 h-4" />
          </button>
          <button className="text-gray-600 hover:text-gray-900">
            <Edit className="w-4 h-4" />
          </button>
          <button className="text-red-600 hover:text-red-900">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </td>
    </tr>
  );
}

// Create MOU Tab with onSuccess prop
function CreateMOUTab({ onSuccess }: { onSuccess?: () => void }) {
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingCampaigns, setIsLoadingCampaigns] = useState(true);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [formData, setFormData] = useState<CreateMOUInput>({
    campaignId: '',
    title: '',
    description: '',
    campaignObjective: '',
    campaignScope: '',
    deliverableDetails: '',
    effectiveDate: new Date(),
    expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    totalBudget: 0,
    paymentTerms: '',
    paymentSchedule: '',
    termsAndConditions: '',
    cancellationClause: '',
    confidentialityClause: '',
    intellectualProperty: ''
  });

  const [deliverables, setDeliverables] = useState<string[]>(['']);

  useEffect(() => {
    const loadCampaigns = async () => {
      try {
        setIsLoadingCampaigns(true)
        const res = await getCampaignsNeedingMOU();
        console.log("data need mou", res.data)
        if (res.success) {
          setCampaigns(res.data as Campaign[]);
        } else {
          console.error(res.message);
          setMessage({ type: 'error', text: 'Failed to load campaigns' });
          setCampaigns([]);
        }
      } catch (error) {
        console.error('Error loading campaigns:', error);
        setMessage({ type: 'error', text: 'Error loading campaigns' });
        setCampaigns([]);
      } finally {
        setIsLoadingCampaigns(false)
      }
    };
    loadCampaigns();
  }, []);

  const handleCreateMOU = async (data: CreateMOUInput) => {
    try {
      return await createMOU(data);
    } catch (error) {
      console.error('Error calling createMOU:', error);
      return {
        success: false,
        message: "Failed to create MOU",
        data: null
      };
    }
  };

  const handleInputChange = (field: keyof CreateMOUInput, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleDeliverableChange = (index: number, value: string) => {
    const newDeliverables = [...deliverables];
    newDeliverables[index] = value;
    setDeliverables(newDeliverables);

    setFormData(prev => ({
      ...prev,
      deliverableDetails: newDeliverables.filter(d => d.trim()).join('\n')
    }));
  };

  const addDeliverable = () => {
    setDeliverables([...deliverables, '']);
  };

  const removeDeliverable = (index: number) => {
    if (deliverables.length > 1) {
      const newDeliverables = deliverables.filter((_, i) => i !== index);
      setDeliverables(newDeliverables);

      setFormData(prev => ({
        ...prev,
        deliverableDetails: newDeliverables.filter(d => d.trim()).join('\n')
      }));
    }
  };

  const formatDateForInput = (date: Date) => {
    return date.toISOString().split('T')[0];
  };

  const handleSubmit = async () => {
    if (!formData.campaignId) {
      setMessage({ type: 'error', text: 'Please select a campaign' });
      return;
    }

    setIsLoading(true);
    setMessage(null);

    try {
      const submissionData: CreateMOUInput = {
        ...formData,
        title: formData.title || undefined,
      };

      const result = await handleCreateMOU(submissionData);

      if (result.success) {
        setMessage({ type: 'success', text: result.message });

        // Reset form on success
        setFormData({
          campaignId: '',
          title: '',
          description: '',
          campaignObjective: '',
          campaignScope: '',
          deliverableDetails: '',
          effectiveDate: new Date(),
          expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          totalBudget: 0,
          paymentTerms: '',
          paymentSchedule: '',
          termsAndConditions: '',
          cancellationClause: '',
          confidentialityClause: '',
          intellectualProperty: ''
        });
        setDeliverables(['']);

        // Call onSuccess callback to refresh data
        if (onSuccess) {
          onSuccess();
        }

        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        setMessage({ type: 'error', text: result.message });
      }
    } catch (error) {
      console.error('Error creating MOU:', error);
      setMessage({ type: 'error', text: 'An unexpected error occurred' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6">
      <div>
        <div className="mb-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-2">Buat MOU Baru</h3>
          <p className="text-gray-600">Buatlah MOU kesepakatan untuk sebuah Campaign</p>
        </div>

        {/* Success/Error Message */}
        {message && (
          <div className={`mb-6 p-4 rounded-lg flex items-center ${message.type === 'success'
            ? 'bg-green-50 text-green-800 border border-green-200'
            : 'bg-red-50 text-red-800 border border-red-200'
            }`}>
            {message.type === 'success' ? (
              <CheckCircle className="w-5 h-5 mr-2" />
            ) : (
              <AlertCircle className="w-5 h-5 mr-2" />
            )}
            {message.text}
          </div>
        )}

        <div className="space-y-8">
          {/* Campaign Selection */}
          <div className="bg-gray-50 p-6 rounded-lg">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Select Campaign
            </label>
            <div className="relative">
              <select
                value={formData.campaignId}
                onChange={(e) => handleInputChange('campaignId', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
                disabled={isLoading || isLoadingCampaigns}
              >
                <option value="">
                  {isLoadingCampaigns ? 'Loading campaigns...' : 'Choose a campaign...'}
                </option>
                {!isLoadingCampaigns && campaigns.length === 0 ? (
                  <option disabled>No campaigns available</option>
                ) : (
                  campaigns.map((campaign) => (
                    <option key={campaign.id} value={campaign.id}>
                      {campaign.name} - {campaign.brands.user.name}
                    </option>
                  ))
                )}
              </select>

              {/* Loading Spinner */}
              {isLoadingCampaigns && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
                </div>
              )}
            </div>

            {/* Helper Text */}
            {isLoadingCampaigns ? (
              <p className="text-sm text-blue-600 mt-2 flex items-center">
                <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                Loading available campaigns...
              </p>
            ) : campaigns.length === 0 ? (
              <p className="text-sm text-gray-500 mt-2">
                No campaigns needing MOU found. Please create a campaign first or check if all campaigns already have MOUs.
              </p>
            ) : (
              <p className="text-sm text-gray-600 mt-2">
                Found {campaigns.length} campaign{campaigns.length !== 1 ? 's' : ''} available for MOU creation.
              </p>
            )}
          </div>

          {/* Basic Information */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                MOU Title
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
                disabled={isLoading || isLoadingCampaigns}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Expiry Date *
              </label>
              <input
                type="date"
                value={formatDateForInput(formData.expiryDate)}
                onChange={(e) => handleInputChange('expiryDate', new Date(e.target.value))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
                disabled={isLoading || isLoadingCampaigns}
              />
            </div>
          </div>

          {/* Deliverables */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Deliverables
            </label>
            <div className="space-y-3">
              {deliverables.map((deliverable, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <input
                    type="text"
                    value={deliverable}
                    onChange={(e) => handleDeliverableChange(index, e.target.value)}
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder={`Deliverable ${index + 1}`}
                    disabled={isLoading || isLoadingCampaigns}
                  />
                  {deliverables.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeDeliverable(index)}
                      className="p-2 text-red-600 hover:text-red-800 disabled:opacity-50"
                      disabled={isLoading || isLoadingCampaigns}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={addDeliverable}
                className="flex items-center px-4 py-2 text-blue-600 border border-blue-300 rounded-lg hover:bg-blue-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isLoading || isLoadingCampaigns}
              >
                <Upload className="w-4 h-4 mr-2" />
                Add Deliverable
              </button>
            </div>
          </div>

          {/* Terms and Payment */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Terms and Conditions
              </label>
              <textarea
                value={formData.termsAndConditions}
                onChange={(e) => handleInputChange('termsAndConditions', e.target.value)}
                rows={6}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Terms and conditions..."
                disabled={isLoading || isLoadingCampaigns}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Payment Terms
              </label>
              <textarea
                value={formData.paymentTerms}
                onChange={(e) => handleInputChange('paymentTerms', e.target.value)}
                rows={6}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Payment terms and schedule..."
                disabled={isLoading || isLoadingCampaigns}
              />
            </div>
          </div>

          {/* Additional Legal Terms */}
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Payment Schedule
              </label>
              <input
                type="text"
                value={formData.paymentSchedule}
                onChange={(e) => handleInputChange('paymentSchedule', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., 50% upfront, 50% on completion"
                disabled={isLoading || isLoadingCampaigns}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cancellation Clause
              </label>
              <textarea
                value={formData.cancellationClause}
                onChange={(e) => handleInputChange('cancellationClause', e.target.value)}
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Conditions for contract cancellation..."
                disabled={isLoading || isLoadingCampaigns}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confidentiality Clause
              </label>
              <textarea
                value={formData.confidentialityClause}
                onChange={(e) => handleInputChange('confidentialityClause', e.target.value)}
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Non-disclosure terms..."
                disabled={isLoading || isLoadingCampaigns}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Intellectual Property
              </label>
              <textarea
                value={formData.intellectualProperty}
                onChange={(e) => handleInputChange('intellectualProperty', e.target.value)}
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="IP ownership and usage rights..."
                disabled={isLoading || isLoadingCampaigns}
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={() => handleSubmit()}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isLoading || isLoadingCampaigns || !formData.campaignId}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin inline" />
                  Saving...
                </>
              ) : (
                'Save as Draft'
              )}
            </button>
            <button
              type="button"
              onClick={() => handleSubmit()}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              disabled={isLoading || isLoadingCampaigns || !formData.campaignId}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating MOU...
                </>
              ) : isLoadingCampaigns ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Loading...
                </>
              ) : (
                'Create MOU'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// FIXED MOUApprovalRow with proper async handling
function MOUApprovalRow({ mou, isSelected, onSelect, onViewDetails, onApprove }: MOUApprovalRowProps) {
  const [isApproving, setIsApproving] = useState(false);

  const getPriorityBadge = () => {
    const daysSinceCreated = Math.floor((Date.now() - new Date(mou.createdAt).getTime()) / (1000 * 60 * 60 * 24));

    if (daysSinceCreated > 7) {
      return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">High</span>;
    } else if (daysSinceCreated > 3) {
      return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">Medium</span>;
    } else {
      return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">Low</span>;
    }
  };

  const getApprovalStatusDisplay = () => {
    const statuses = [
      { type: 'Brand', status: mou.brandApprovalStatus },
      { type: 'Influencer', status: mou.influencerApprovalStatus },
      { type: 'Admin', status: mou.adminApprovalStatus }
    ];

    return (
      <div className="space-y-1">
        {statuses.map(({ type, status }) => (
          <div key={type} className="flex items-center text-xs">
            <span className="w-16 text-gray-500">{type}:</span>
            <span className={`ml-2 px-2 py-0.5 rounded text-xs font-medium ${status === 'APPROVED' ? 'bg-green-100 text-green-800' :
              status === 'REJECTED' ? 'bg-red-100 text-red-800' :
                'bg-yellow-100 text-yellow-800'
              }`}>
              {status}
            </span>
          </div>
        ))}
      </div>
    );
  };

  const handleApprove = async (role: "BRAND" | "INFLUENCER") => {
    if (isApproving) return;

    setIsApproving(true);
    try {
      await onApprove(role);
    } catch (error) {
      console.error('Error in approve handler:', error);
    } finally {
      setIsApproving(false);
    }
  };

  return (
    <tr className={isSelected ? 'bg-blue-50' : 'hover:bg-gray-50'}>
      <td className="px-6 py-4 whitespace-nowrap">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={(e) => onSelect(e.target.checked)}
          className="rounded border-gray-300"
        />
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div>
          <div className="text-sm font-medium text-gray-900">{mou.title}</div>
          <div className="text-sm text-gray-500">
            Created {new Date(mou.createdAt).toLocaleDateString()}
          </div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div>
          <div className="text-sm font-medium text-gray-900">{mou.campaign.name}</div>
          <div className="text-sm text-gray-500">Username Brand</div>
        </div>
      </td>
      <td className="px-6 py-4">
        {getApprovalStatusDisplay()}
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        {getPriorityBadge()}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
        <div className="flex space-x-2">
          <button
            onClick={onViewDetails}
            className="text-blue-600 hover:text-blue-900"
            title="View Details"
            disabled={isApproving}
          >
            <Eye className="w-4 h-4" />
          </button>

          {/* Brand Approve Button */}
          {mou.brandApprovalStatus === 'PENDING' && (
            <button
              onClick={() => handleApprove("BRAND")}
              className="text-green-600 hover:text-green-900 disabled:opacity-50"
              title="Approve as Brand"
              disabled={isApproving}
            >
              {isApproving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <CheckCircle className="w-4 h-4" />
              )}
            </button>
          )}

          {/* Influencer Approve Button */}
          {mou.influencerApprovalStatus === 'PENDING' && (
            <button
              onClick={() => handleApprove("INFLUENCER")}
              className="text-green-600 hover:text-green-900 disabled:opacity-50"
              title="Approve as Influencer"
              disabled={isApproving}
            >
              {isApproving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <UserCheck className="w-4 h-4" />
              )}
            </button>
          )}

          <button className="text-red-600 hover:text-red-900" title="Quick Reject" disabled={isApproving}>
            <XCircle className="w-4 h-4" />
          </button>
        </div>
      </td>
    </tr>
  );
}

// FIXED MOU Approval Tab with proper error handling and state management
function MOUApprovalTab({ onRefresh }: { onRefresh?: () => void }) {
  const [loading, setLoading] = useState(true);
  const [mous, setMous] = useState<MOU[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('pending');
  const [selectedMOUs, setSelectedMOUs] = useState<string[]>([]);
  const [selectedMOU, setSelectedMOU] = useState<MOU | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadMOUs = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getAllMOUs();
      if (res.success) {
        const pendingMOUs = res.data.filter((mou: any) =>
          mou.adminApprovalStatus === 'PENDING' ||
          mou.brandApprovalStatus === 'PENDING' ||
          mou.influencerApprovalStatus === 'PENDING'
        );

        const typedMOUs: MOUForApproval[] = pendingMOUs.map((mou: any) => ({
          id: mou.id,
          title: mou.title,
          campaignId: mou.campaignId,
          createdAt: mou.createdAt,
          updatedAt: mou.createdAt,
          status: mou.status,
          adminApprovalStatus: mou.adminApprovalStatus,
          brandApprovalStatus: mou.brandApprovalStatus,
          influencerApprovalStatus: mou.influencerApprovalStatus,
          campaign: {
            id: mou.campaign.id,
            name: mou.campaign.name,
            type: mou.campaign.type,
            brands: mou.campaign.brands && mou.campaign.brands.length > 0
              ? mou.campaign.brands[0]
              : { id: '', name: 'Unknown Brand', user: { name: null } },
            CampaignInvitation: mou.campaign.CampaignInvitation ?? []
          },
          approvals: mou.approvals,
        }));

        setMous(typedMOUs);
      } else {
        console.error(res.message);
        setError(res.message || '');
        setMous([]);
      }
    } catch (error) {
      console.error('Error loading MOUs for approval:', error);
      setError('Failed to load MOUs');
      setMous([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMOUs();
  }, []);

  // FIXED handleApprove with proper error handling and optimistic updates
  const handleApprove = async (mouId: string, approvalType: "BRAND" | "INFLUENCER") => {
    try {
      console.log('Attempting to approve MOU:', mouId, 'as', approvalType);

      const res = await approveMOU(mouId, approvalType);
      console.log('Approval response:', res);

      if (res.success && res.data) {
        // Optimistic update
        setMous((prev) =>
          prev.map((m) => {
            if (m.id !== mouId) return m;

            const updated = { ...m };
            if (approvalType === "BRAND") {
              updated.brandApprovalStatus = "APPROVED";
            } else if (approvalType === "INFLUENCER") {
              updated.influencerApprovalStatus = "APPROVED";
            }
            return updated;
          })
        );

        // Call refresh callback to update parent data
        if (onRefresh) {
          onRefresh();
        }

        console.log('MOU approved successfully');
      } else {
        console.error('Failed to approve MOU:', res.message);
        setError(res.message || 'Failed to approve MOU');
      }
    } catch (err) {
      console.error("Error approving MOU:", err);
      setError('An error occurred while approving the MOU');
    }
  };

  const handleBulkSelect = (mouId: string, checked: boolean) => {
    if (checked) {
      setSelectedMOUs([...selectedMOUs, mouId]);
    } else {
      setSelectedMOUs(selectedMOUs.filter(id => id !== mouId));
    }
  };

  // Filter MOUs based on search and status
  const filteredMOUs = mous.filter((mou) => {
    const matchesSearch =
      searchTerm === "" ||
      mou.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      mou.campaign?.name?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "pending" && (
        mou.adminApprovalStatus === 'PENDING' ||
        mou.brandApprovalStatus === 'PENDING' ||
        mou.influencerApprovalStatus === 'PENDING'
      )) ||
      (statusFilter === "approved" &&
        mou.adminApprovalStatus === 'APPROVED' &&
        mou.brandApprovalStatus === 'APPROVED' &&
        mou.influencerApprovalStatus === 'APPROVED'
      ) ||
      (statusFilter === "rejected" && (
        mou.adminApprovalStatus === 'REJECTED' ||
        mou.brandApprovalStatus === 'REJECTED' ||
        mou.influencerApprovalStatus === 'REJECTED'
      ));

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">MOU Approval Center</h3>
          <p className="text-gray-500">Review and approve pending MOUs</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={loadMOUs}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Search MOUs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-64"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending Approval</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 rounded-lg bg-red-50 text-red-800 border border-red-200 flex items-center">
          <AlertCircle className="w-5 h-5 mr-2" />
          {error}
          <button
            onClick={() => setError(null)}
            className="ml-auto text-red-600 hover:text-red-800"
          >
            <XCircle className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Bulk Actions Bar */}
      {selectedMOUs.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <CheckCircle className="w-5 h-5 text-blue-600 mr-2" />
              <span className="text-blue-800 font-medium">
                {selectedMOUs.length} MOU{selectedMOUs.length > 1 ? 's' : ''} selected
              </span>
            </div>
            <div className="flex space-x-2">
              <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm">
                Bulk Approve
              </button>
              <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm">
                Bulk Reject
              </button>
              <button
                onClick={() => setSelectedMOUs([])}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm"
              >
                Clear Selection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MOUs Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <input
                    type="checkbox"
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedMOUs(filteredMOUs.map(mou => mou.id));
                      } else {
                        setSelectedMOUs([]);
                      }
                    }}
                    className="rounded border-gray-300"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  MOU Details
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Campaign
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Approval Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Priority
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-6 py-4"><div className="h-4 w-4 bg-gray-200 rounded" /></td>
                    <td className="px-6 py-4"><div className="h-4 w-32 bg-gray-200 rounded" /></td>
                    <td className="px-6 py-4"><div className="h-4 w-24 bg-gray-200 rounded" /></td>
                    <td className="px-6 py-4"><div className="h-4 w-20 bg-gray-200 rounded" /></td>
                    <td className="px-6 py-4"><div className="h-4 w-16 bg-gray-200 rounded" /></td>
                    <td className="px-6 py-4"><div className="h-4 w-12 bg-gray-200 rounded" /></td>
                  </tr>
                ))
              ) : filteredMOUs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-gray-500">
                    No MOUs requiring approval found.
                  </td>
                </tr>
              ) : (
                filteredMOUs.map((mou) => (
                  <MOUApprovalRow
                    key={mou.id}
                    mou={mou}
                    isSelected={selectedMOUs.includes(mou.id)}
                    onSelect={(checked) => handleBulkSelect(mou.id, checked)}
                    onViewDetails={() => setSelectedMOU(mou)}
                    onApprove={(role) => handleApprove(mou.id, role)}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MOU Detail Modal */}
      {selectedMOU && (
        <MOUDetailModal
          mou={selectedMOU}
          onClose={() => setSelectedMOU(null)}
          userRole="ADMIN"
        />
      )}
    </div>
  );
}

// MOU Request Modal (unchanged)
function MOURequestModal({ campaign, onClose }: MOURequestModalProps) {
  const [formData, setFormData] = useState<MOURequestFormData>({
    message: '',
    urgentRequest: false
  });

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900">Create MOU Request</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <XCircle className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="bg-blue-50 p-4 rounded-lg mb-6">
            <h4 className="font-medium text-blue-900 mb-2">{campaign.name}</h4>
            <div className="text-sm text-blue-700 space-y-1">
              <p>Brand: {campaign.brands.user.name}</p>
              <p>Influencers: {campaign.CampaignInvitation.map(inv => inv.influencer.user.name).join(', ')}</p>
            </div>
          </div>

          <form className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Request Message (Optional)
              </label>
              <textarea
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Add any specific requirements or notes for the MOU..."
              />
            </div>

            <div className="flex items-center">
              <input
                id="urgent"
                type="checkbox"
                checked={formData.urgentRequest}
                onChange={(e) => setFormData({ ...formData, urgentRequest: e.target.checked })}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="urgent" className="ml-2 text-sm text-gray-700">
                Mark as urgent request (Allow campaign to start without MOU)
              </label>
            </div>

            {formData.urgentRequest && (
              <div className="bg-yellow-50 p-4 rounded-lg">
                <div className="flex items-start">
                  <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5 mr-2" />
                  <div className="text-sm text-yellow-700">
                    <p className="font-medium">Urgent Request Notice</p>
                    <p>This will allow the campaign to start before MOU approval. Only use for time-sensitive campaigns.</p>
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-end space-x-4 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Request MOU Creation
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

// Bulk Actions Modal (unchanged)
function BulkActionsModal({ selectedMOUs, onClose }: BulkActionsModalProps) {
  const [action, setAction] = useState<string>('');
  const [comments, setComments] = useState<string>('');
  const [rejectionReason, setRejectionReason] = useState<string>('');

  const handleBulkAction = () => {
    console.log('Bulk action:', action, 'for MOUs:', selectedMOUs);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900">Bulk Actions</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <XCircle className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="mb-4">
            <p className="text-sm text-gray-600 mb-4">
              {selectedMOUs.length} MOUs selected for bulk action
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Action
                </label>
                <select
                  value={action}
                  onChange={(e) => setAction(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Choose an action...</option>
                  <option value="approve">Bulk Approve</option>
                  <option value="reject">Bulk Reject</option>
                </select>
              </div>

              {action === 'approve' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Comments (Optional)
                  </label>
                  <textarea
                    value={comments}
                    onChange={(e) => setComments(e.target.value)}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Add approval comments..."
                  />
                </div>
              )}

              {action === 'reject' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Rejection Reason *
                  </label>
                  <textarea
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Explain why these MOUs are being rejected..."
                    required
                  />
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end space-x-4 pt-4">
            <button
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleBulkAction}
              disabled={!action || (action === 'reject' && !rejectionReason)}
              className={`px-6 py-2 rounded-lg transition-colors ${action === 'approve'
                ? 'bg-green-600 hover:bg-green-700 text-white'
                : action === 'reject'
                  ? 'bg-red-600 hover:bg-red-700 text-white'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
            >
              {action === 'approve' ? 'Bulk Approve' : action === 'reject' ? 'Bulk Reject' : 'Execute Action'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// MOU Detail Modal (unchanged)
function MOUDetailModal({ mou, onClose, userRole = 'ADMIN' }: MOUDetailModalProps) {
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [showRejectionModal, setShowRejectionModal] = useState(false);

  const canApprove = (type: 'ADMIN' | 'BRAND' | 'INFLUENCER'): boolean => {
    if (userRole === 'ADMIN') return mou.adminApprovalStatus === 'PENDING';
    if (userRole === 'BRAND' && type === 'BRAND') return mou.brandApprovalStatus === 'PENDING';
    if (userRole === 'INFLUENCER' && type === 'INFLUENCER') return mou.influencerApprovalStatus === 'PENDING';
    return false;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-xl font-semibold text-gray-900">{mou.title}</h3>
              <p className="text-sm text-gray-500">Campaign: {mou.campaign.name}</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <XCircle className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="px-6 py-4 bg-gray-50 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium ${mou.status === "ACTIVE"
                  ? "bg-green-100 text-green-800"
                  : mou.status === "CANCELLED"
                    ? "bg-red-100 text-red-800"
                    : mou.status.startsWith("PENDING")
                      ? "bg-yellow-100 text-yellow-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
              >
                {mou.status}
              </span>

              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-500">Approvals:</span>
                <div className="flex space-x-1">
                  <ApprovalBadge status={mou.brandApprovalStatus} label="Brand" />
                  <ApprovalBadge status={mou.influencerApprovalStatus} label="Influencer" />
                  <ApprovalBadge status={mou.adminApprovalStatus} label="Admin" />
                </div>
              </div>
            </div>
            <div className="text-sm text-gray-500">
              Created: {new Date(mou.createdAt).toLocaleDateString()}
            </div>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              {mou.termsAndConditions && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Terms and Conditions</h4>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-gray-700 whitespace-pre-line">{mou.termsAndConditions}</p>
                  </div>
                </div>
              )}

              {mou.paymentTerms && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Payment Terms</h4>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-gray-700 whitespace-pre-line">{mou.paymentTerms}</p>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-6">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-semibold text-blue-900 mb-3">Campaign Details</h4>
                <div className="space-y-2 text-sm text-blue-800">
                  <p><span className="font-medium">Name:</span> {mou.campaign.name}</p>
                  <p><span className="font-medium">Brand:</span> {mou.campaign.brands.user.name}</p>
                  {mou.timeline && <p><span className="font-medium">Timeline:</span> {mou.timeline}</p>}
                </div>
              </div>

              {userRole !== 'BRAND' && userRole !== 'INFLUENCER' && (
                <div className="space-y-3">
                  <h4 className="font-semibold text-gray-900">Actions</h4>

                  {canApprove('ADMIN') && (
                    <button
                      onClick={() => setShowApprovalModal(true)}
                      className="w-full flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Approve MOU
                    </button>
                  )}

                  {mou.status !== 'REJECTED' && mou.adminApprovalStatus === 'PENDING' && (
                    <button
                      onClick={() => setShowRejectionModal(true)}
                      className="w-full flex items-center justify-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      Reject MOU
                    </button>
                  )}

                  <button className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                    <Download className="w-4 h-4 mr-2" />
                    Download PDF
                  </button>
                </div>
              )}

              {(userRole === 'BRAND' || userRole === 'INFLUENCER') && (
                <div className="space-y-3">
                  <h4 className="font-semibold text-gray-900">Your Actions</h4>

                  {canApprove(userRole) && (
                    <>
                      <button
                        onClick={() => setShowApprovalModal(true)}
                        className="w-full flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Approve MOU
                      </button>

                      <button
                        onClick={() => setShowRejectionModal(true)}
                        className="w-full flex items-center justify-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                      >
                        <XCircle className="w-4 h-4 mr-2" />
                        Reject MOU
                      </button>
                    </>
                  )}

                  <button className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                    <Download className="w-4 h-4 mr-2" />
                    Download PDF
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {showApprovalModal && (
        <ApprovalModal
          mouId={mou.id}
          approvalType={userRole}
          onClose={() => setShowApprovalModal(false)}
          onSuccess={() => {
            setShowApprovalModal(false);
          }}
        />
      )}

      {showRejectionModal && (
        <RejectionModal
          mouId={mou.id}
          rejectionType={userRole}
          onClose={() => setShowRejectionModal(false)}
          onSuccess={() => {
            setShowRejectionModal(false);
          }}
        />
      )}
    </div>
  );
}

// Approval Badge Component (unchanged)
function ApprovalBadge({ status, label }: ApprovalBadgeProps) {
  const getIcon = () => {
    switch (status) {
      case 'APPROVED': return <CheckCircle className="w-3 h-3 text-green-600" />;
      case 'REJECTED': return <XCircle className="w-3 h-3 text-red-600" />;
      default: return <Clock className="w-3 h-3 text-yellow-600" />;
    }
  };

  const getBgColor = () => {
    switch (status) {
      case 'APPROVED': return 'bg-green-100 text-green-800';
      case 'REJECTED': return 'bg-red-100 text-red-800';
      default: return 'bg-yellow-100 text-yellow-800';
    }
  };

  return (
    <div className={`flex items-center px-2 py-1 rounded-full text-xs ${getBgColor()}`}>
      {getIcon()}
      <span className="ml-1">{label}</span>
    </div>
  );
}

// Approval Modal (unchanged)
function ApprovalModal({ mouId, approvalType, onClose, onSuccess }: ApprovalModalProps) {
  const [comments, setComments] = useState('');
  const [loading, setLoading] = useState(false);

  const handleApprove = async () => {
    setLoading(true);
    try {
      console.log('Approving MOU:', mouId, 'as', approvalType, 'with comments:', comments);
      await new Promise(resolve => setTimeout(resolve, 1000));
      onSuccess();
    } catch (error) {
      console.error('Error approving MOU:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[60]">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Approve MOU</h3>
        </div>

        <div className="p-6">
          <p className="text-gray-600 mb-4">
            Are you sure you want to approve this MOU as {approvalType.toLowerCase()}?
          </p>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Comments (Optional)
            </label>
            <textarea
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Add any comments about your approval..."
            />
          </div>

          <div className="flex justify-end space-x-4">
            <button
              onClick={onClose}
              disabled={loading}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleApprove}
              disabled={loading}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
            >
              {loading ? 'Approving...' : 'Approve MOU'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Rejection Modal (unchanged)
function RejectionModal({ mouId, rejectionType, onClose, onSuccess }: RejectionModalProps) {
  const [rejectionReason, setRejectionReason] = useState('');
  const [loading, setLoading] = useState(false);

  const handleReject = async () => {
    if (!rejectionReason.trim()) return;

    setLoading(true);
    try {
      console.log('Rejecting MOU:', mouId, 'as', rejectionType, 'with reason:', rejectionReason);
      await new Promise(resolve => setTimeout(resolve, 1000));
      onSuccess();
    } catch (error) {
      console.error('Error rejecting MOU:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[60]">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Reject MOU</h3>
        </div>

        <div className="p-6">
          <p className="text-gray-600 mb-4">
            Please provide a reason for rejecting this MOU:
          </p>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Rejection Reason *
            </label>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Explain why you are rejecting this MOU..."
              required
            />
          </div>

          <div className="flex justify-end space-x-4">
            <button
              onClick={onClose}
              disabled={loading}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleReject}
              disabled={loading || !rejectionReason.trim()}
              className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
            >
              {loading ? 'Rejecting...' : 'Reject MOU'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}