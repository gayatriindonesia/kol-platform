interface CampaignWithRelations {
  id: string;
  name: string;
  status: string;
  mouRequired: boolean;
  canStartWithoutMOU: boolean;
  mou?: {
    id: string;
    status: string;
    brandApprovalStatus: string;
    influencerApprovalStatus: string;
    adminApprovalStatus: string;
  } | null;
  CampaignInvitation?: Array<{
    id: string;
    status: string;
    mouCreationRequested?: boolean;
    mouCreatedAt?: Date | null;
  }>;
}

export interface MOURequestStatus {
  hasMOU: boolean;
  mouCreationRequested: boolean;
  canRequestMOU: boolean;
  canStartWithoutMOU: boolean;
  mouStatus: string | null;
  isFullySigned: boolean | null | undefined;
}

export const computeMOUStatus = (campaign: CampaignWithRelations): MOURequestStatus => {
  const hasMOU = !!campaign.mou;
  
  const mouCreationRequested = campaign.CampaignInvitation?.some(invitation => 
    invitation.mouCreationRequested
  ) || false;
  
  // Determine if MOU is fully signed (all parties approved)
  const isFullySigned = hasMOU && campaign.mou && 
    campaign.mou.brandApprovalStatus === 'APPROVED' &&
    campaign.mou.influencerApprovalStatus === 'APPROVED' &&
    campaign.mou.adminApprovalStatus === 'APPROVED';

  // Determine if user can request MOU
  const canRequestMOU = campaign.mouRequired && 
    !hasMOU && 
    !mouCreationRequested &&
    campaign.status !== 'COMPLETED' &&
    campaign.status !== 'CANCELLED';

  return {
    hasMOU,
    mouCreationRequested,
    canRequestMOU,
    canStartWithoutMOU: campaign.canStartWithoutMOU,
    mouStatus: campaign.mou?.status || null,
    isFullySigned
  };
};

// Enhanced campaign type that includes computed MOU status
export interface CampaignWithMOUStatus extends CampaignWithRelations {
  mouRequestStatus: MOURequestStatus;
}

export const addMOUStatusToCampaign = (campaign: CampaignWithRelations): CampaignWithMOUStatus => {
  return {
    ...campaign,
    mouRequestStatus: computeMOUStatus(campaign)
  };
};