// types/campaign.ts

// Add PaymentMethod type
type PaymentMethod = {
  id: string;
  name: string;
};


export interface Category {
  id: string;
  name: string;
  description?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Platform {
  id: string;
  name: string;
  services: Service[];
}

export interface PlatformSelection {
  platformId: string;
  platformName: string;
  serviceId: string;
  serviceName: string;
  follower: string;
}

export interface PlatformDataResponse {
  data: Array<{
    id: string;
    name: string;
    createdAt: Date;
    updatedAt: Date;
    services: Array<{
      id: string;
      name: string;
      platformId: string;
      createdAt: Date;
      updatedAt: Date;
      description: string | null;
      type: string;
      isActive: boolean;
    }>;
  }>;
  status: number;
  success: boolean;
  error?: string;
}

export interface Service {
  id: string;
  name: string;
  description?: string;
  type: string;
}

export type CampaignFormData = {
  name: string;
  goal: string;
  brandId: string;
  status: string;
  startDate: Date;
  endDate: Date;
  campaignType: 'DIRECT' | 'SELF_SERVICE';
  personalInfo: {
    name: string;
    email: string;
    phone: string;
  };
  experienceInfo?: {
    fresher: boolean;
    experiences: Array<{
      company: string;
      position: string;
      duration: string;
    }>;
  };
  educationBackground?: {
    educations: Array<{
      platform: string;
      service: string;
      followers: string;
    }>;
  };
  direct?: {
    budget: number;
    targetAudience: string;
    categories: Category[];
    platformSelections: PlatformSelection[];
    paymentMethod?: PaymentMethod | string | null;
    bankId?: string;
  };
  selfService?: {
    influencerId: string;
    influencerName: string;
  }[];
};

export type CampaignStatus = 'PENDING' | 'ACTIVE' | 'REJECTED'

export type Campaign = {
  id: string
  name: string
  goal: string
  type: string
  status: CampaignStatus
  description: string
  budget: number
  startDate: string
  endDate: string
  targetAudience: string
  createdAt: string
  brands: {
    name: string
    email: string
    userId: string
    user: {
      name: string
      email: string
    }
  }
}

export type { PaymentMethod };
