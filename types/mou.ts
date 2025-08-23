import { ApprovalStatus, Brand, Campaign, CampaignInvitation, Influencer, MOU, MOUStatus, Prisma, User } from "@prisma/client";

export type CampaignMOUResponse = {
  success: boolean;
  message?: string;
  data: Campaign[];
};

export interface CampaignWithRelations extends Campaign {
  CampaignInvitation?: (CampaignInvitation & {
    influencer: {
      id: string;
      name: string;
      email: string | null;
    };
  })[];
  brands: {
    id: string;
    name: string;
    user: {
      name: string | null;
      email: string | null;
    };
  };
  mou?: any;
}


export type MOUWithRelations = MOU & {
  status: MOUStatus;
  brandApprovalStatus: ApprovalStatus;
  influencerApprovalStatus: ApprovalStatus;
  adminApprovalStatus: ApprovalStatus;
  campaign: Campaign & {
    brands: Brand & { user: User };
    CampaignInvitation: (CampaignInvitation & {
      influencer: Influencer & { user: User };
    })[];
  };
};

