import { create } from "zustand";
import { CampaignFormData } from "./types/campaign";
import { createCampaign, sendCampaignInvitation } from "./lib/campaign.actions";
// Import server action jika perlu
// import { createCampaign } from '@/app/actions/campaign';

// Type Definitions
type CampaignType = 'direct' | 'selfService' | null;

interface Category {
  id: string;
  name: string;
  description?: string;
}

interface PlatformSelection {
  platformId: string;
  platformName: string;
  serviceId: string;
  serviceName: string;
  follower: string;
}

interface PersonalInfo {
  name: string;
  email: string;
  phone: string;
}

interface Experience {
  company: string;
  position: string;
  duration: string;
}

interface ExperienceInfo {
  fresher: boolean;
  experiences: Experience[];
}

interface Education {
  platform: string;
  service: string;
  followers: string;
}

interface EducationBackground {
  educations: Education[];
}

interface DirectCampaignData {
  budget: number;
  targetAudience: string;
  experienceInfo: ExperienceInfo;
  educationBackground: EducationBackground;
  categories: Category[]; // Category
  platformSelections: PlatformSelection[]; // Platform
}

export interface SelectedInfluencer {
  influencerId: string;
  influencerName: string;
  username: string;
  followers: string;
  platforms: {
  name: string;
  username: string;
  followers: string;
}[]
  image: string | null;
  categories: string[];
}

export interface SelfServiceCampaignData {
  selectedInfluencers: SelectedInfluencer[];
}

interface BaseFormData {
  personalInfo: PersonalInfo;
  startDate?: Date;    // StarDate Campaign
  endDate?: Date;      // EndDate Campaign
}

interface FormData {
  direct: DirectCampaignData;
  selfService: SelfServiceCampaignData;
}

interface CampaignAppState {
// Tambahkan state untuk brand
  selectedBrand: { id: string; name: string } | null;
  setSelectedBrand: (brand: { id: string; name: string } | null) => void;

  updateFormData: (data: Partial<FormData & BaseFormData>) => void;
  
  campaignType: CampaignType;
  step: number;
  name: string; // name Campaign
  formData: FormData & BaseFormData;
  nextStep: () => void;
  prevStep: () => void;
  getTotalSteps: () => number;
  setName: (name: string) => void; // Method untuk mengatur nama campaign
  setCampaignType: (type: CampaignType) => void;
  setDirectCategories: (categories: Category[]) => void; // Category
  setPersonalInfo: (data: Partial<PersonalInfo>) => void;
  setExperienceInfo: (data: Partial<ExperienceInfo>) => void;
  setEducationBackground: (data: Partial<EducationBackground>) => void;
  setDirectCampaignData: (data: Partial<DirectCampaignData>) => void;
  setSelfServiceCampaignData: (data: Partial<SelfServiceCampaignData>) => void;
  isSubmitting: boolean;
  setIsSubmitting: (value: boolean) => void;
  submitForm: () => Promise<
    | { success: true; data: { id: string; [key: string]: any }; message?: string }
    | { success: false; message: string; data?: null }
  >;
  resetForm: () => void;

  // Invitation state to send notif to influencers
  selectedInfluencers: SelectedInfluencer[];
  invitationMessage: string;
  budgetPerInfluencer: number;
  setSelectedInfluencers: (influencers: SelectedInfluencer[]) => void;
  setInvitationMessage: (message: string) => void;
  setBudgetPerInfluencer: (budget: number) => void;

// Tambahkan method untuk sync data
  syncInfluencersFromForm: () => void;
  updateSelectedInfluencers: (influencers: SelectedInfluencer[]) => void;

  sendCampaignInvitations: (campaignId: string) => Promise<{ success: boolean; message?: string }>;
}

// Initial States
const initialBaseData: BaseFormData = {
  personalInfo: {
    name: '',
    email: '',
    phone: '',
  },
};

const initialDirectData: DirectCampaignData = {
  budget: 0,
  targetAudience: '',
  experienceInfo: {
    fresher: false,
    experiences: [],
  },
  educationBackground: {
    educations: [],
  },
  categories: [],
  platformSelections: [],
};

const initialSelfServiceData: SelfServiceCampaignData = {
  selectedInfluencers: [],
};

const useCampaignAppStore = create<CampaignAppState>((set, get) => ({

  isSubmitting: false,
  setIsSubmitting: (value) => set({ isSubmitting: value }),

  selectedBrand: null,
  setSelectedBrand: (brand) => set({ selectedBrand: brand }),

  campaignType: null,
  step: 1,
  name: '', // Name Campaign
  formData: {
    ...initialBaseData,
    direct: initialDirectData,
    selfService: initialSelfServiceData,
  },

  // Navigation
  nextStep: () => set((state) => ({
    step: Math.min(state.step + 1, get().getTotalSteps())
  })),
  prevStep: () => set((state) => ({
    step: Math.max(state.step - 1, 1)
  })),

  setDirectCategories: (categories) => set((state) => ({
    formData: {
      ...state.formData,
      direct: {
        ...state.formData.direct,
        categories: categories
      }
    }
  })),

  // Set campaign name
  setName: (name) => set({ name }),

  updateFormData: (data) => set((state) => ({
    formData: {
      ...state.formData,
      ...data,
    }
  })),

  // Campaign type handling
  setCampaignType: (type) => set({
    campaignType: type,
    step: 1,
    // Reset form tetapi jangan reset nama campaign
    formData: {
      ...initialBaseData,
      direct: initialDirectData,
      selfService: initialSelfServiceData,
    }
  }),

  // Data setters
  setPersonalInfo: (data) => set((state) => ({
    formData: {
      ...state.formData,
      personalInfo: {
        ...state.formData.personalInfo,
        ...data,
      }
    }
  })),

  setExperienceInfo: (data: Partial<ExperienceInfo>) => set((state) => ({
    formData: {
      ...state.formData,
      direct: {
        ...state.formData.direct,
        experienceInfo: {
          ...state.formData.direct.experienceInfo,
          ...data,
        }
      }
    }
  })),

  setEducationBackground: (data: Partial<EducationBackground>) => set((state) => ({
    formData: {
      ...state.formData,
      direct: {
        ...state.formData.direct,
        educationBackground: {
          ...state.formData.direct.educationBackground,
          ...data,
        }
      }
    }
  })),

  setDirectCampaignData: (data) => set((state) => ({
    formData: {
      ...state.formData,
      direct: {
        ...state.formData.direct,
        ...data,
      }
    }
  })),

  setSelfServiceCampaignData: (data) => set((state) => ({
    formData: {
      ...state.formData,
      selfService: {
        ...state.formData.selfService,
        ...data,
      }
    }
  })),

  selectedInfluencers: [],
  invitationMessage: '',
  budgetPerInfluencer: 0,

  // Method untuk sync data influencer dari form ke invitation state
  syncInfluencersFromForm: () => {
    const { formData, campaignType } = get();
    
    if (campaignType === 'selfService') {
      // Ambil influencer dari formData dan sync ke invitation state
      const influencersFromForm = formData.selfService.selectedInfluencers;
      set({ selectedInfluencers: influencersFromForm });
    }
  },

  // Method untuk update influencer di kedua tempat sekaligus
  updateSelectedInfluencers: (influencers: SelectedInfluencer[]) => {
    // Update di form data
    set((state) => ({
      formData: {
        ...state.formData,
        selfService: {
          ...state.formData.selfService,
          selectedInfluencers: influencers,
        }
      },
      // Update di invitation state juga
      selectedInfluencers: influencers
    }));
  },

  setSelectedInfluencers: (influencers) => set({ selectedInfluencers: influencers }),
  setInvitationMessage: (message) => set({ invitationMessage: message }),
  setBudgetPerInfluencer: (budget) => set({ budgetPerInfluencer: budget }),

  // Form Submission
  submitForm: async (): Promise<
  | { success: true; data: { id: string; [key: string]: any }; message?: string }
  | { success: false; message: string; data?: null }
> => {
  set({ isSubmitting: true });

  try {
    const { name, campaignType, formData, selectedBrand } = get();

// Sync influencer data sebelum validasi (untuk selfService)
      if (campaignType === 'selfService') {
        get().syncInfluencersFromForm();
      }

    if (!name.trim()) {
      return { 
        success: false, 
        message: 'Nama campaign harus diisi', 
        data: null
      };
    }

    if (!selectedBrand?.id) {
      return {
        success: false,
        message: 'Brand harus dipilih',
        data: null
      };
    }

    if (!formData.startDate || !formData.endDate) {
      return {
        success: false,
        message: 'Tanggal mulai dan selesai harus diisi',
        data: null
      };
    }

    if (formData.endDate < formData.startDate) {
      return {
        success: false,
        message: 'Tanggal selesai tidak boleh sebelum tanggal mulai',
        data: null
      };
    }

    if (campaignType === 'direct' && formData.direct.categories.length === 0) {
      return {
        success: false,
        message: 'Kategori belum dipilih',
        data: null
      };
    }

     // Validasi untuk selfService - pastikan ada influencer yang dipilih
      if (campaignType === 'selfService' && formData.selfService.selectedInfluencers.length === 0) {
        return {
          success: false,
          message: 'Belum ada influencer yang dipilih',
          data: null
        };
      }

    const campaignData: CampaignFormData = {
      name,
      brandId: selectedBrand.id,
      status: 'PENDING',
      startDate: formData.startDate,
      endDate: formData.endDate,
      campaignType: campaignType === 'direct' ? 'DIRECT' : 'SELF_SERVICE',
      personalInfo: formData.personalInfo,
      experienceInfo: campaignType === 'direct' ? formData.direct.experienceInfo : undefined,
      educationBackground: campaignType === 'direct' ? formData.direct.educationBackground : undefined,
      direct: campaignType === 'direct' ? {
        budget: formData.direct.budget,
        targetAudience: formData.direct.targetAudience,
        categories: formData.direct.categories.map(c => ({ id: c.id, name: c.name })),
        platformSelections: formData.direct.platformSelections,
      } : undefined,
      selfService: campaignType === 'selfService'
        ? formData.selfService.selectedInfluencers.map(influencer => ({
            influencerId: influencer.influencerId,
            influencerName: influencer.influencerName
          }))
        : undefined
    };

    const result = await createCampaign(campaignData);

    // Fix: Explicitly handle the success/failure cases
    if (result.success && result.data) {
      return {
        success: true,
        data: result.data,
        message: result.message
      };
    } else {
      return {
        success: false,
        message: result.message || "Gagal menyimpan campaign",
        data: null
      };
    }

  } catch (error: any) {
    console.error("Submission error:", error);
    return {
      success: false,
      message: "Gagal menyimpan campaign",
      data: null
    };
  } finally {
    set({ isSubmitting: false });
  }
},

// Update sendCampaignInvitations dengan mapping yang benar
  sendCampaignInvitations: async (campaignId) => {
    // Sync data terlebih dahulu
    get().syncInfluencersFromForm();
    
    const {
      selectedInfluencers,
      invitationMessage,
      // budgetPerInfluencer,
      selectedBrand,
      campaignType,
      formData
    } = get();

    // Debug logs
    console.log('=== DEBUG INVITATION ===');
    console.log('Campaign Type:', campaignType);
    console.log('Selected Influencers (invitation state):', selectedInfluencers);
    console.log('Form Data Influencers:', formData.selfService.selectedInfluencers);
    console.log('Selected Brand:', selectedBrand);
    console.log('========================');

    if (!selectedInfluencers.length) {
      // Coba ambil dari formData sebagai fallback
      const influencersFromForm = formData.selfService.selectedInfluencers;
      if (influencersFromForm.length > 0) {
        console.log('Using influencers from form data as fallback');
        set({ selectedInfluencers: influencersFromForm });
        // Recursive call dengan data yang sudah ter-sync
        return get().sendCampaignInvitations(campaignId);
      }
      
      return { success: false, message: 'Tidak ada influencer yang dipilih' };
    }

    if (!selectedBrand) {
      return { success: false, message: 'Brand belum dipilih' };
    }

    try {
      const result = await sendCampaignInvitation({
        campaignId,
        // Mapping dari SelectedInfluencer ke format yang dibutuhkan server action
        influencerIds: selectedInfluencers.map(inf => inf.influencerId), // Gunakan influencerId
        brandId: selectedBrand.id,
        message: invitationMessage,
      });

      return result;
    } catch (error: any) {
      return {
        success: false,
        message: error.message || 'Gagal mengirim undangan campaign'
      };
    }
  },


  // Reset form
  resetForm: () => set({
    campaignType: null,
    step: 1,
    name: '', // Reset nama campaign juga
    formData: {
      ...initialBaseData,
      direct: initialDirectData,
      selfService: initialSelfServiceData,
    }
  }),

  // Step calculation dengan memperhitungkan langkah tambahan untuk input nama
  getTotalSteps: () => {
    const type = get().campaignType;
    // Tambahkan 1 langkah untuk input nama campaign
    return type === 'direct' ? 8 : 5;
  },

  
}));

export default useCampaignAppStore;