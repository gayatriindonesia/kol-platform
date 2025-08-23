"use server";

import { db } from "./db";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { createNotification } from "./notification.actions";
import { MOUStatus, ApprovalStatus, UserRole, MOU, Prisma } from "@prisma/client";

// ==================== DEFINISI TYPE ====================

// Type untuk membuat MOU baru
export type CreateMOUInput = {
  campaignId: string;           // ID kampanye yang akan dibuatkan MOU
  title?: string;               // Judul MOU (opsional)
  description?: string;         // Deskripsi MOU (opsional)
  campaignObjective: string;    // Tujuan kampanye
  campaignScope: string;        // Ruang lingkup kampanye
  deliverableDetails: any;      // Detail deliverable dalam format JSON
  effectiveDate: Date;          // Tanggal mulai berlaku
  expiryDate: Date;            // Tanggal berakhir
  totalBudget: number;         // Total budget
  paymentTerms: string;        // Syarat pembayaran
  paymentSchedule?: any;       // Jadwal pembayaran (JSON)
  termsAndConditions: string;  // Syarat dan ketentuan
  cancellationClause?: string; // Klausul pembatalan
  confidentialityClause?: string; // Klausul kerahasiaan
  intellectualProperty?: string;  // Hak kekayaan intelektual
};

// Type untuk update MOU (membuat revisi)
type UpdateMOUInput = Partial<CreateMOUInput> & {
  mouId: string;              // ID MOU yang akan diupdate
  revisionNotes?: string;     // Catatan revisi
};

// Type untuk approve/reject MOU
type ApproveMOUInput = {
  mouId: string;              // ID MOU
  status: ApprovalStatus;     // Status approval (APPROVED/REJECTED)
  comments?: string;          // Komentar approver
  rejectionReason?: string;   // Alasan penolakan jika ditolak
};

// Type untuk membuat template MOU
type CreateMOUTemplateInput = {
  name: string;                    // Nama template
  description?: string;            // Deskripsi template
  category?: string;               // Kategori template
  titleTemplate: string;          // Template judul
  termsAndConditions: string;     // Template syarat dan ketentuan
  cancellationClause: string;     // Template klausul pembatalan
  confidentialityClause: string;  // Template klausul kerahasiaan
  intellectualProperty: string;   // Template hak kekayaan intelektual
  paymentTermsTemplate: string;   // Template syarat pembayaran
  minimumBudget?: number;         // Budget minimum
  applicablePlatforms?: any;      // Platform yang berlaku
  isDefault?: boolean;            // Apakah template default
};

// Type untuk membuat amandemen MOU
type CreateAmendmentInput = {
  mouId: string;           // ID MOU yang akan diamandemen
  title: string;           // Judul amandemen
  description: string;     // Deskripsi amandemen
  changedFields: any;      // Field yang diubah (JSON)
  effectiveDate: Date;     // Tanggal efektif amandemen
};

// Type untuk request pembuatan MOU
type RequestMOUCreationInput = {
  campaignId: string;      // ID kampanye
  invitationId: string;    // ID undangan kampanye
  message?: string;        // Pesan tambahan
  urgentRequest?: boolean; // Apakah request mendesak
};

// ==================== Helper ====================

/**
 * GENERATE NOMOR MOU OTOMATIS
 * Format: MOU/YYYY/MM/XXX (contoh: MOU/2024/08/001)
 * 
 * @returns String nomor MOU yang unik
 */
async function generateMOUNumber(): Promise<string> {
  const year = new Date().getFullYear();
  const month = String(new Date().getMonth() + 1).padStart(2, '0');

  // Dapatkan hitungan MOU bulan ini
  const startOfMonth = new Date(year, new Date().getMonth(), 1);
  const endOfMonth = new Date(year, new Date().getMonth() + 1, 0);

  const count = await db.mOU.count({
    where: {
      createdAt: {
        gte: startOfMonth,
        lte: endOfMonth
      }
    }
  });

  const sequence = String(count + 1).padStart(3, '0');
  return `MOU/${year}/${month}/${sequence}`;
}

/**
 * CEK AKSES USER KE MOU
 * Menentukan apakah user bisa mengakses MOU tertentu
 * 
 * @param mou - Data MOU
 * @param userId - ID user
 * @param userRole - Role user
 * @returns Boolean akses permission
 */
async function checkMOUAccess(mou: any, userId: string, userRole?: UserRole | null): Promise<boolean> {
  if (userRole === 'ADMIN') return true;

  if (userRole === 'BRAND') {
    return mou.campaign.brands.userId === userId;
  }

  if (userRole === 'INFLUENCER') {
    return mou.campaign.CampaignInvitation.some((inv: any) =>
      inv.influencer.userId === userId
    );
  }

  return false;
}

/**
 * CEK AKSES USER KE MOU APPROVAL
 * Menentukan apakah user bisa mengakses MOU tertentu
 * 
 * @param mou - Data MOU
 * @param userId - ID user
 * @param userRole - Role user
 * @returns Boolean akses permission
 */
async function checkApprovalPermission(mou: any, userId: string, userRole: UserRole): Promise<boolean> {
  if (userRole === 'ADMIN') return true;

  if (userRole === 'BRAND') {
    return mou.campaign.brands.userId === userId;
  }

  if (userRole === 'INFLUENCER') {
    return mou.campaign.CampaignInvitation.some((inv: any) =>
      inv.influencer.userId === userId
    );
  }

  return false;
}

/**
 * EKSTRAK BUDGET DARI CAMPAIGN
 * Helper function untuk mengambil budget dari data campaign
 * 
 * @param campaign - Data campaign
 * @returns Number budget amount
 */
function extractBudgetFromCampaign(campaign: any): number {
  try {
    if (campaign.type === 'DIRECT' && campaign.directData) {
      return campaign.directData.budget || 0;
    }
    return 0;
  } catch {
    return 0;
  }
}

/**
 * EKSTRAK DELIVERABLES DARI CAMPAIGN
 * Helper function untuk mengambil deliverables dari data campaign
 * 
 * @param campaign - Data campaign
 * @returns Object deliverables data
 */
function extractDeliverablesFromCampaign(campaign: any): any {
  try {
    if (campaign.type === 'DIRECT' && campaign.directData) {
      return campaign.directData.platformSelections || [];
    }
    return {};
  } catch {
    return {};
  }
}



// ==================== Notifkasi ====================

// Kirim Notifikasi lebih spesifik
async function sendMOUNotifications(mouId: string, action: 'SUBMITTED_FOR_APPROVAL' | 'CREATED' | 'APPROVED' | 'REJECTED' | 'REVISED') {
  try {
    const mou = await db.mOU.findUnique({
      where: { id: mouId },
      include: {
        campaign: {
          include: {
            brands: {
              include: {
                user: { select: { id: true, name: true, email: true } }
              }
            },
            CampaignInvitation: {
              where: { status: 'ACTIVE' },
              include: {
                influencer: {
                  include: {
                    user: { select: { id: true, name: true, email: true } }
                  }
                }
              }
            }
          }
        }
      }
    });

    if (!mou) return;

    const { createNotification } = await import('./notification.actions');
    const notifications = [];

    let title = '';
    let message = '';

    switch (action) {
      case 'SUBMITTED_FOR_APPROVAL':
        title = 'MOU Pending Approval';
        message = `MOU for campaign "${mou.campaign.name}" is pending your approval`;
        break;
      case 'CREATED':
        title = 'New MOU Created';
        message = `A new MOU has been created for campaign "${mou.campaign.name}"`;
        break;
      case 'APPROVED':
        title = 'MOU Approved';
        message = `MOU for campaign "${mou.campaign.name}" has been approved`;
        break;
      case 'REJECTED':
        title = 'MOU Rejected';
        message = `MOU for campaign "${mou.campaign.name}" has been rejected`;
        break;
      case 'REVISED':
        title = 'MOU Revised';
        message = `MOU for campaign "${mou.campaign.name}" has been revised and needs re-approval`;
        break;
    }

    // Send notification to Brand
    notifications.push(
      createNotification({
        userId: mou.campaign.brands.user.id,
        type: 'SYSTEM',
        title,
        message,
        data: {
          mouId,
          campaignId: mou.campaignId,
          action,
          status: mou.status
        }
      })
    );

    // Send notification to Influencer
    if (mou.campaign.CampaignInvitation[0]) {
      notifications.push(
        createNotification({
          userId: mou.campaign.CampaignInvitation[0].influencer.user.id,
          type: 'SYSTEM',
          title,
          message,
          data: {
            mouId,
            campaignId: mou.campaignId,
            action,
            status: mou.status
          }
        })
      );
    }

    await Promise.all(notifications);
  } catch (error) {
    console.error("Error sending MOU notifications:", error);
  }
}

// kirim notif 2
export async function sendMOUNotificationsTo(mouId: string, action: 'CREATED' | 'APPROVED' | 'REJECTED' | 'REVISED') {
  try {
    const mou = await db.mOU.findUnique({
      where: { id: mouId },
      include: {
        campaign: {
          include: {
            brands: {
              include: {
                user: { select: { id: true, name: true, email: true } }
              }
            },
            CampaignInvitation: {
              where: { status: 'ACTIVE' },
              include: {
                influencer: {
                  include: {
                    user: { select: { id: true, name: true, email: true } }
                  }
                }
              }
            }
          }
        }
      }
    });

    if (!mou) return;

    const notifications = [];

    // Notification to Brand
    notifications.push(
      createNotification({
        userId: mou.campaign.brands.user.id,
        type: 'SYSTEM',
        title: `MOU ${action}`,
        message: `MOU for campaign "${mou.campaign.name}" has been ${action.toLowerCase()}`,
        data: {
          mouId,
          campaignId: mou.campaignId,
          action
        }
      })
    );

    // Notification to Influencer
    if (mou.campaign.CampaignInvitation[0]) {
      notifications.push(
        createNotification({
          userId: mou.campaign.CampaignInvitation[0].influencer.user.id,
          type: 'SYSTEM',
          title: `MOU ${action}`,
          message: `MOU for campaign "${mou.campaign.name}" has been ${action.toLowerCase()}`,
          data: {
            mouId,
            campaignId: mou.campaignId,
            action
          }
        })
      );
    }

    await Promise.all(notifications);
  } catch (error) {
    console.error("Error sending MOU notifications:", error);
  }
}




// ==================== FUNGSI UTAMA MOU ====================

/** DONE
 * 1. MEMBUAT MOU BARU
 * Fungsi ini digunakan untuk membuat MOU baru untuk sebuah kampanye
 * Hanya Admin atau Brand yang bisa membuat MOU
 * 
 * @param data - Data MOU yang akan dibuat
 * @returns Response dengan status success/error dan data MOU
 */
export async function createMOU(data: CreateMOUInput) {
  try {
    // 1. Cek autentikasi user
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, message: "Unauthorized" };
    }

    // 2. Ambil role user untuk validasi permission
    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: { role: true }
    });

    if (!user || !['ADMIN', 'BRAND'].includes(user.role!)) {
      return { success: false, message: "Only Admin or Brand can create MOU" };
    }

    // 3. Ambil data kampanye dengan brand & invitation aktif
    const campaign = await db.campaign.findUnique({
      where: { id: data.campaignId },
      include: {
        brands: {
          include: {
            user: { select: { name: true, email: true } }
          }
        },
        CampaignInvitation: {
          where: { status: 'ACTIVE' },
          include: {
            influencer: {
              include: { user: { select: { name: true, email: true } } }
            }
          }
        }
      }
    });

    if (!campaign) {
      return { success: false, message: "Campaign not found" };
    }

    const brand = campaign.brands // Ambil brand tunggal
    if (!brand) {
      return { success: false, message: "No brand assigned to this campaign" };
    }

    const activeInfluencers = campaign.CampaignInvitation;
    if (!activeInfluencers || activeInfluencers.length === 0) {
      return { success: false, message: "No active influencers found for this campaign" };
    }

    const createdMOUs = [];

    // 4. Buat MOU untuk setiap influencer aktif
    for (const invitation of activeInfluencers) {
      // Cek apakah MOU sudah ada untuk influencer & campaign
      const existingMOU = await db.mOU.findFirst({
        where: { campaignId: data.campaignId }
      });
      if (existingMOU) continue; // Lewati jika sudah ada

      const mouNumber = await generateMOUNumber();

      const mou = await db.mOU.create({
        data: {
          campaignId: data.campaignId,
          // influencerId: invitation.influencer.id,
          mouNumber,
          title: data.title || `MOU - ${campaign.name}`,
          description: data.description,

          // Brand
          brandName: brand.name,
          brandRepresentative: brand.user?.name || "Brand Representative",
          brandEmail: brand.user?.email || "",

          // Influencer
          influencerName: invitation.influencer.user?.name || "Influencer",
          influencerEmail: invitation.influencer.user?.email || "",

          // Campaign Details
          campaignObjective: data.campaignObjective,
          campaignScope: data.campaignScope,
          deliverableDetails: data.deliverableDetails,

          // Timeline
          effectiveDate: data.effectiveDate,
          expiryDate: data.expiryDate,

          // Financial Terms
          totalBudget: data.totalBudget,
          paymentTerms: data.paymentTerms,
          paymentSchedule: data.paymentSchedule,

          // Legal Terms
          termsAndConditions: data.termsAndConditions,
          cancellationClause: data.cancellationClause,
          confidentialityClause: data.confidentialityClause,
          intellectualProperty: data.intellectualProperty,

          // Status awal
          status: 'DRAFT',
          createdBy: session.user.id
        }
      });

      // Approval awal
      await db.mOUApproval.create({
        data: {
          mouId: mou.id,
          approverRole: user.role as UserRole,
          approverUserId: session.user.id,
          status: 'PENDING',
          comments: 'MOU created'
        }
      });

      // Notifikasi
      await sendMOUNotifications(mou.id, 'CREATED');

      createdMOUs.push(mou);
    }

    // Revalidate path
    revalidatePath('/campaigns');
    revalidatePath(`/campaigns/${data.campaignId}`);

    if (createdMOUs.length === 0) {
      return { success: false, message: "All active influencers already have MOU" };
    }

    return {
      success: true,
      data: createdMOUs,
      message: "MOU(s) created successfully"
    };

  } catch (error) {
    console.error("Error creating MOU:", error);
    return {
      success: false,
      message: "Failed to create MOU"
    };
  }
}


/**
 * 2. AMBIL MOU BERDASARKAN ID
 * Fungsi untuk mengambil detail MOU berdasarkan ID MOU
 * Termasuk validasi akses user ke MOU tersebut
 * 
 * @param mouId - ID MOU yang akan diambil
 * @returns Response dengan data MOU lengkap
 */
export async function getMOUById(mouId: string) {
  try {
    // Cek autentikasi
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, message: "Unauthorized" };
    }

    // Ambil MOU dengan semua relasi yang dibutuhkan
    const mou = await db.mOU.findUnique({
      where: { id: mouId },
      include: {
        campaign: {
          include: {
            brands: {
              include: {
                user: { select: { name: true, email: true } }
              }
            },
            CampaignInvitation: {
              where: { status: 'ACTIVE' },
              include: {
                influencer: {
                  include: {
                    user: { select: { name: true, email: true } }
                  }
                }
              }
            }
          }
        },
        approvals: {
          orderBy: { approvedAt: 'desc' }
        },
        amendments: {
          orderBy: { amendmentNumber: 'desc' }
        },
        parentMOU: true,    // MOU induk jika ini adalah revisi
        revisions: true     // Revisi-revisi dari MOU ini
      }
    });

    if (!mou) {
      return { success: false, message: "MOU not found" };
    }

    // Cek permission user untuk akses MOU ini
    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: { role: true }
    });

    const hasAccess = await checkMOUAccess(mou, session.user.id, user?.role);
    if (!hasAccess) {
      return { success: false, message: "Access denied" };
    }

    return {
      success: true,
      data: mou
    };

  } catch (error) {
    console.error("Error getting MOU:", error);
    return {
      success: false,
      message: "Failed to get MOU"
    };
  }
}

/** DONE
 * 3. AMBIL MOU BERDASARKAN CAMPAIGN ID
 * Fungsi untuk mengambil MOU berdasarkan ID kampanye
 * Termasuk history approval untuk tracking
 * 
 * @param campaignId - ID kampanye
 * @returns Response dengan data MOU dan history approval
 */
export async function getMOUByCampaignId(campaignId: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, message: "Unauthorized" };
    }

    // Ambil MOU berdasarkan campaign ID
    const mou = await db.mOU.findUnique({
      where: { campaignId },
      include: {
        campaign: {
          include: {
            brands: {
              include: {
                user: { select: { name: true, email: true } }
              }
            }
          }
        },
        approvals: {
          orderBy: { approvedAt: 'desc' } // Urutkan approval terbaru dulu
        }
      }
    });

    if (!mou) {
      return { success: false, message: "MOU not found for this campaign" };
    }

    // Validasi akses user
    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: { role: true }
    });

    const hasAccess = await checkMOUAccess(mou, session.user.id, user?.role);
    if (!hasAccess) {
      return { success: false, message: "Access denied" };
    }

    return {
      success: true,
      data: mou
    };

  } catch (error) {
    console.error("Error getting MOU by campaign:", error);
    return {
      success: false,
      message: "Failed to get MOU"
    };
  }
}

/**
 * 4. UPDATE MOU (MEMBUAT REVISI)
 * Fungsi untuk mengupdate MOU dengan membuat versi revisi baru
 * Hanya Admin yang bisa membuat revisi MOU
 * 
 * @param data - Data update MOU
 * @returns Response dengan MOU versi baru
 */
export async function updateMOU(data: UpdateMOUInput) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, message: "Unauthorized" };
    }

    // Ambil MOU yang akan direvisi
    const currentMOU = await db.mOU.findUnique({
      where: { id: data.mouId },
      include: {
        campaign: true
      }
    });

    if (!currentMOU) {
      return { success: false, message: "MOU not found" };
    }

    // Cek permission - hanya Admin yang bisa update MOU
    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: { role: true }
    });

    if (!user || !['ADMIN'].includes(user.role!)) {
      return { success: false, message: "Only Admin can update MOU" };
    }

    // Buat revisi baru (duplikasi MOU dengan perubahan)
    const newMOU = await db.mOU.create({
      data: {
        mouNumber: currentMOU.mouNumber,
        brandName: currentMOU.brandName,
        brandRepresentative: currentMOU.brandRepresentative,
        brandEmail: currentMOU.brandEmail,

        title: currentMOU.title,
        influencerName: currentMOU.influencerName,
        influencerEmail: currentMOU.influencerEmail,
        campaignObjective: currentMOU.campaignObjective,

        // Field wajib tambahan
        campaignScope: currentMOU.campaignScope,
        deliverableDetails: Prisma.JsonNull,
        effectiveDate: currentMOU.effectiveDate,
        expiryDate: currentMOU.expiryDate,

        campaignId: currentMOU.campaignId,
        version: currentMOU.version + 1,
        parentMOUId: currentMOU.id,
        revisionNotes: data.revisionNotes ?? null,

        status: "DRAFT",
        brandApprovalStatus: "PENDING",
        influencerApprovalStatus: "PENDING",
        adminApprovalStatus: "PENDING",

        createdBy: session.user.id,
        createdAt: new Date(),
        updatedAt: new Date(),

        description: data.description ?? currentMOU.description,
        digitalSignature: Prisma.JsonNull,
        totalBudget: currentMOU.totalBudget,           // wajib
        paymentTerms: currentMOU.paymentTerms,
        termsAndConditions: currentMOU.termsAndConditions,
      },
    });





    // Kirim notifikasi tentang revisi
    await sendMOUNotifications(newMOU.id, 'REVISED');

    return {
      success: true,
      data: newMOU,
      message: "MOU revised successfully"
    };

  } catch (error) {
    console.error("Error updating MOU:", error);
    return {
      success: false,
      message: "Failed to update MOU"
    };
  }
}

/**
 * 5. APPROVE/REJECT MOU DENGAN VALIDASI ADMIN
 * Fungsi untuk approve atau reject MOU berdasarkan role user
 * Sistem approval bertingkat: Brand -> Influencer -> Admin
 * 
 * @param data - Data approval (mouId, status, comments)
 * @returns Response approval status
 */
export async function approveMOUWithAdmin(data: ApproveMOUInput) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, message: "Unauthorized" };
    }

    // Ambil MOU dengan data kampanye
    const mou = await db.mOU.findUnique({
      where: { id: data.mouId },
      include: {
        campaign: {
          include: {
            brands: true,
            CampaignInvitation: {
              where: { status: 'ACTIVE' }
            }
          }
        }
      }
    });

    if (!mou) {
      return { success: false, message: "MOU not found" };
    }

    // Ambil role user
    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: { role: true }
    });

    if (!user) {
      return { success: false, message: "User not found" };
    }

    // Cek permission untuk approve
    const canApprove = await checkApprovalPermission(mou, session.user.id, user.role!);
    if (!canApprove) {
      return { success: false, message: "You don't have permission to approve this MOU" };
    }

    // Update status approval berdasarkan role
    const updateData: any = {
      updatedAt: new Date()
    };

    // Update approval status berdasarkan role user
    if (user.role === 'ADMIN') {
      updateData.adminApprovalStatus = data.status;
      updateData.adminApprovedAt = data.status === 'APPROVED' ? new Date() : null;
      updateData.adminApprovedBy = session.user.id;
      if (data.status === 'REJECTED') {
        updateData.adminRejectionReason = data.rejectionReason;
      }
    } else if (user.role === 'BRAND') {
      updateData.brandApprovalStatus = data.status;
      updateData.brandApprovedAt = data.status === 'APPROVED' ? new Date() : null;
      updateData.brandApprovedBy = session.user.id;
      if (data.status === 'REJECTED') {
        updateData.brandRejectionReason = data.rejectionReason;
      }
    } else if (user.role === 'INFLUENCER') {
      updateData.influencerApprovalStatus = data.status;
      updateData.influencerApprovedAt = data.status === 'APPROVED' ? new Date() : null;
      updateData.influencerApprovedBy = session.user.id;
      if (data.status === 'REJECTED') {
        updateData.influencerRejectionReason = data.rejectionReason;
      }
    }

    // Simpan record approval ke tabel terpisah untuk tracking
    await db.mOUApproval.create({
      data: {
        mouId: data.mouId,
        approverRole: user.role as UserRole,
        approverUserId: session.user.id,
        status: data.status,
        comments: data.comments
      }
    });

    // Cek apakah semua approval sudah selesai
    const finalMOU = await db.mOU.findUnique({
      where: { id: data.mouId }
    });

    if (finalMOU) {
      let newStatus = finalMOU.status;

      // Jika ditolak, langsung set status REJECTED
      if (data.status === 'REJECTED') {
        newStatus = 'REJECTED';
      }
      // Jika semua pihak sudah approve, set status APPROVED
      else if (
        finalMOU.brandApprovalStatus === 'APPROVED' &&
        finalMOU.influencerApprovalStatus === 'APPROVED' &&
        finalMOU.adminApprovalStatus === 'APPROVED'
      ) {
        newStatus = 'APPROVED';

        // Update kampanye agar bisa dimulai
        await db.campaign.update({
          where: { id: mou.campaignId },
          data: {
            status: 'ACTIVE',
            updatedAt: new Date()
          }
        });
      }

      // Update status MOU jika berubah
      if (newStatus !== finalMOU.status) {
        await db.mOU.update({
          where: { id: data.mouId },
          data: { status: newStatus }
        });
      }

      // Kirim notifikasi sesuai status
      const notificationType = data.status === 'APPROVED' ? 'APPROVED' : 'REJECTED';
      await sendMOUNotifications(data.mouId, notificationType);
    }

    // Refresh cache halaman
    revalidatePath('/campaigns');
    revalidatePath(`/mou/${data.mouId}`);

    return {
      success: true,
      message: `MOU ${data.status.toLowerCase()} successfully`
    };

  } catch (error) {
    console.error("Error approving MOU:", error);
    return {
      success: false,
      message: "Failed to approve MOU"
    };
  }
}

/** DONE
 * 6. AMBIL SEMUA MOU (ADMIN DASHBOARD)
 * Fungsi untuk admin mengambil semua MOU dengan filter status
 * Hanya Admin yang bisa mengakses semua MOU
 * 
 * @param status - Filter berdasarkan status MOU (opsional)
 * @returns List semua MOU dengan informasi campaign
 */
export async function getAllMOUs(status?: MOUStatus) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, message: "Unauthorized", data: [] };
    }

    // Validasi hanya Admin yang bisa akses
    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: { role: true }
    });

    if (!user) {
      return { success: false, message: "User not found", data: [] };
    }

    {/** akses hanya admin
    if (!user || user.role !== 'ADMIN') {
      return { success: false, message: "Only Admin can access all MOUs", data: [] };
    }
    */}

    // Buat filter berdasarkan status jika ada
    const whereClause: Prisma.MOUWhereInput = {};
    if (status) {
      whereClause.status = status;
    }

    // Jika role = BRAND → hanya ambil campaign miliknya
    if (user.role === "BRAND") {
      whereClause.campaign = {
        brands: {
          userId: session.user.id
        }
      };
    }

    // Ambil semua MOU dengan relasi yang dibutuhkan
    const mous = await db.mOU.findMany({
      where: whereClause,
      include: {
        campaign: {
          include: {
            brands: {
              include: {
                user: { select: { name: true } }
              }
            }
          }
        },
        approvals: {
          take: 1,                              // Ambil approval terakhir saja
          orderBy: { approvedAt: 'desc' }
        }
      },
      orderBy: {
        createdAt: 'desc'                       // Urutkan dari yang terbaru
      }
    });

    return {
      success: true,
      data: mous
    };

  } catch (error) {
    console.error("Error getting all MOUs:", error);
    return {
      success: false,
      message: "Failed to get MOUs",
      data: []
    };
  }
}

/**
 * 7. AMBIL MOU USER SPESIFIK
 * Fungsi untuk mengambil MOU yang terkait dengan user tertentu
 * Brand: MOU dari kampanye mereka
 * Influencer: MOU dari kampanye yang mereka ikuti
 * 
 * @returns List MOU yang relevan dengan user
 */
export async function getUserMOUs() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, message: "Unauthorized" };
    }

    // Ambil data user dengan relasi brand/influencer
    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: { role: true, brands: true, influencers: true }
    });

    if (!user) {
      return { success: false, message: "User not found" };
    }

    let mous: MOU[] = [];

    // Jika user adalah BRAND, ambil MOU dari kampanye mereka
    if (user.role === 'BRAND') {
      mous = await db.mOU.findMany({
        where: {
          campaign: {
            brandId: {
              in: user.brands.map(brand => brand.id)
            }
          }
        },
        include: {
          campaign: {
            include: {
              brands: true
            }
          },
          approvals: {
            orderBy: { approvedAt: 'desc' }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      });
    }
    // Jika user adalah INFLUENCER, ambil MOU dari kampanye yang mereka ikuti
    else if (user.role === 'INFLUENCER') {
      const influencer = user.influencers;
      if (influencer) {
        mous = await db.mOU.findMany({
          where: {
            campaign: {
              CampaignInvitation: {
                some: {
                  influencerId: influencer.id,
                  status: 'ACTIVE'
                }
              }
            }
          },
          include: {
            campaign: {
              include: {
                brands: true
              }
            },
            approvals: {
              orderBy: { approvedAt: 'desc' }
            }
          },
          orderBy: {
            createdAt: 'desc'
          }
        });
      }
    }

    return {
      success: true,
      data: mous
    };

  } catch (error) {
    console.error("Error getting user MOUs:", error);
    return {
      success: false,
      message: "Failed to get MOUs"
    };
  }
}

/**
 * 8. GENERATE PREVIEW MOU
 * Fungsi untuk generate preview MOU sebelum dibuat secara resmi
 * Berguna untuk melihat bagaimana MOU akan terlihat
 * 
 * @param campaignId - ID kampanye
 * @param templateData - Template data (opsional)
 * @returns Preview data MOU
 */
export async function generateMOUPreview(campaignId: string, templateData?: any) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, message: "Unauthorized" };
    }

    // Ambil data kampanye lengkap
    const campaign = await db.campaign.findUnique({
      where: { id: campaignId },
      include: {
        brands: {
          include: {
            user: { select: { name: true, email: true } }
          }
        },
        CampaignInvitation: {
          where: { status: 'ACTIVE' },
          include: {
            influencer: {
              include: {
                user: { select: { name: true, email: true } }
              }
            }
          }
        }
      }
    });

    if (!campaign) {
      return { success: false, message: "Campaign not found" };
    }

    const activeInvitation = campaign.CampaignInvitation[0];
    if (!activeInvitation) {
      return { success: false, message: "No active influencer found" };
    }

    // Ambil template default atau gunakan template yang disediakan
    let template = templateData;
    if (!template) {
      template = await db.mOUTemplate.findFirst({
        where: { isDefault: true, isActive: true }
      });
    }

    // Generate data preview dengan placeholder
    const previewData = {
      mouNumber: "PREVIEW-" + Date.now(),
      title: `MOU - ${campaign.name}`,
      brandName: campaign.brands.name,
      brandRepresentative: campaign.brands.user.name,
      brandEmail: campaign.brands.user.email,
      influencerName: activeInvitation.influencer.user.name,
      influencerEmail: activeInvitation.influencer.user.email,
      campaignObjective: campaign.goal || "Campaign objective to be defined",
      campaignScope: "Scope to be defined based on campaign requirements",
      effectiveDate: campaign.startDate,
      expiryDate: campaign.endDate,
      totalBudget: extractBudgetFromCampaign(campaign),
      paymentTerms: "50% advance, 50% upon completion",
      termsAndConditions: template?.termsAndConditions || "Standard terms and conditions apply",
      cancellationClause: template?.cancellationClause,
      confidentialityClause: template?.confidentialityClause,
      intellectualProperty: template?.intellectualProperty,
      deliverableDetails: extractDeliverablesFromCampaign(campaign)
    };

    return {
      success: true,
      data: previewData
    };

  } catch (error) {
    console.error("Error generating MOU preview:", error);
    return {
      success: false,
      message: "Failed to generate MOU preview"
    };
  }
}


// ==================== MOU TEMPLATE ACTIONS ====================

/**
 * 1. BUAT TEMPLATE MOU BARU
 * Fungsi untuk membuat template MOU yang bisa digunakan berulang
 * Hanya Admin yang bisa membuat template
 * 
 * @param data - Data template MOU
 * @returns Response dengan template yang dibuat
 */
export async function createMOUTemplate(data: CreateMOUTemplateInput) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, message: "Unauthorized" };
    }

    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: { role: true }
    });

    if (!user || user.role !== 'ADMIN') {
      return { success: false, message: "Only Admin can create MOU templates" };
    }

    // Jika template ini diset sebagai default, unset template default yang lain
    if (data.isDefault) {
      await db.mOUTemplate.updateMany({
        where: { isDefault: true },
        data: { isDefault: false }
      });
    }

    const template = await db.mOUTemplate.create({
      data: {
        ...data,
        createdBy: session.user.id
      }
    });

    return {
      success: true,
      data: template,
      message: "MOU template created successfully"
    };

  } catch (error) {
    console.error("Error creating MOU template:", error);
    return {
      success: false,
      message: "Failed to create MOU template"
    };
  }
}

/**
 * 2. AMBIL SEMUA TEMPLATE MOU
 * Fungsi untuk mengambil semua template MOU yang aktif
 * 
 * @returns List template MOU
 */
export async function getMOUTemplates() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, message: "Unauthorized" };
    }

    const templates = await db.mOUTemplate.findMany({
      where: { isActive: true },
      orderBy: [
        { isDefault: 'desc' },  // Default template di atas
        { name: 'asc' }         // Urutkan berdasarkan nama
      ]
    });

    return {
      success: true,
      data: templates
    };

  } catch (error) {
    console.error("Error getting MOU templates:", error);
    return {
      success: false,
      message: "Failed to get MOU templates"
    };
  }
}

/**
 * 3. AMBIL TEMPLATE MOU BY ID
 * Fungsi untuk mengambil detail template MOU berdasarkan ID
 * 
 * @param templateId - ID template
 * @returns Detail template MOU
 */
export async function getMOUTemplateById(templateId: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, message: "Unauthorized" };
    }

    const template = await db.mOUTemplate.findUnique({
      where: { id: templateId }
    });

    if (!template) {
      return { success: false, message: "Template not found" };
    }

    return {
      success: true,
      data: template
    };

  } catch (error) {
    console.error("Error getting MOU template:", error);
    return {
      success: false,
      message: "Failed to get MOU template"
    };
  }
}

/**
 * 4. UPDATE TEMPLATE MOU
 * Fungsi untuk mengupdate template MOU yang sudah ada
 * Hanya Admin yang bisa update template
 * 
 * @param templateId - ID template
 * @param data - Data update template
 * @returns Response update template
 */
export async function updateMOUTemplate(templateId: string, data: Partial<CreateMOUTemplateInput>) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, message: "Unauthorized" };
    }

    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: { role: true }
    });

    if (!user || user.role !== 'ADMIN') {
      return { success: false, message: "Only Admin can update MOU templates" };
    }

    // Jika template ini diset sebagai default, unset yang lain
    if (data.isDefault) {
      await db.mOUTemplate.updateMany({
        where: {
          isDefault: true,
          id: { not: templateId }
        },
        data: { isDefault: false }
      });
    }

    const template = await db.mOUTemplate.update({
      where: { id: templateId },
      data: {
        ...data,
        updatedAt: new Date()
      }
    });

    return {
      success: true,
      data: template,
      message: "MOU template updated successfully"
    };

  } catch (error) {
    console.error("Error updating MOU template:", error);
    return {
      success: false,
      message: "Failed to update MOU template"
    };
  }
}

/**
 * 5. HAPUS TEMPLATE MOU (SOFT DELETE)
 * Fungsi untuk menghapus template MOU (soft delete)
 * Hanya Admin yang bisa hapus template
 * 
 * @param templateId - ID template
 * @returns Response penghapusan
 */
export async function deleteMOUTemplate(templateId: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, message: "Unauthorized" };
    }

    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: { role: true }
    });

    if (!user || user.role !== 'ADMIN') {
      return { success: false, message: "Only Admin can delete MOU templates" };
    }

    // Soft delete dengan set isActive = false
    await db.mOUTemplate.update({
      where: { id: templateId },
      data: {
        isActive: false,
        updatedAt: new Date()
      }
    });

    return {
      success: true,
      message: "MOU template deleted successfully"
    };

  } catch (error) {
    console.error("Error deleting MOU template:", error);
    return {
      success: false,
      message: "Failed to delete MOU template"
    };
  }
}

// ==================== MOU AMENDMENT ACTIONS ====================

/**
 * 6. BUAT AMANDEMEN MOU
 * Fungsi untuk membuat amandemen/perubahan pada MOU yang sudah approved
 * Hanya Admin yang bisa membuat amandemen
 * 
 * @param data - Data amandemen
 * @returns Response amandemen yang dibuat
 */
export async function createMOUAmendment(data: CreateAmendmentInput) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, message: "Unauthorized" };
    }

    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: { role: true }
    });

    if (!user || user.role !== 'ADMIN') {
      return { success: false, message: "Only Admin can create amendments" };
    }

    // Ambil MOU yang akan diamandemen
    const mou = await db.mOU.findUnique({
      where: { id: data.mouId },
      select: { status: true }
    });

    if (!mou) {
      return { success: false, message: "MOU not found" };
    }

    // Hanya MOU yang sudah approved yang bisa diamandemen
    if (mou.status !== 'APPROVED') {
      return { success: false, message: "Can only amend approved MOUs" };
    }

    // Dapatkan nomor amandemen berikutnya
    const lastAmendment = await db.mOUAmendment.findFirst({
      where: { mouId: data.mouId },
      orderBy: { amendmentNumber: 'desc' }
    });

    const amendmentNumber = (lastAmendment?.amendmentNumber || 0) + 1;

    // Buat amandemen baru
    const amendment = await db.mOUAmendment.create({
      data: {
        mouId: data.mouId,
        amendmentNumber,
        title: data.title,
        description: data.description,
        changedFields: data.changedFields,
        effectiveDate: data.effectiveDate,
        createdBy: session.user.id
      }
    });

    // Update status MOU untuk menandakan ada amandemen
    await db.mOU.update({
      where: { id: data.mouId },
      data: {
        status: 'AMENDED',
        updatedAt: new Date()
      }
    });

    return {
      success: true,
      data: amendment,
      message: "MOU amendment created successfully"
    };

  } catch (error) {
    console.error("Error creating MOU amendment:", error);
    return {
      success: false,
      message: "Failed to create MOU amendment"
    };
  }
}

/**
 * 7. AMBIL AMANDEMEN MOU
 * Fungsi untuk mengambil semua amandemen dari MOU tertentu
 * 
 * @param mouId - ID MOU
 * @returns List amandemen MOU
 */
export async function getMOUAmendments(mouId: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, message: "Unauthorized" };
    }

    const amendments = await db.mOUAmendment.findMany({
      where: { mouId },
      orderBy: { amendmentNumber: 'desc' }  // Urutkan dari amandemen terbaru
    });

    return {
      success: true,
      data: amendments
    };

  } catch (error) {
    console.error("Error getting MOU amendments:", error);
    return {
      success: false,
      message: "Failed to get MOU amendments"
    };
  }
}

// ==================== MOU WORKFLOW ACTIONS ====================

/** DONE
 * 8. SUBMIT MOU UNTUK APPROVAL
 * Fungsi untuk mengubah status MOU dari DRAFT ke proses approval
 * Hanya Admin atau Brand yang bisa submit MOU
 * 
 * @param mouId - ID MOU
 * @returns Response submission status
 */
export async function submitMOUForApproval(mouId: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, message: "Unauthorized" };
    }

    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: { role: true }
    });

    if (!user || !['ADMIN', 'BRAND'].includes(user.role!)) {
      return { success: false, message: "Only Admin or Brand can submit MOU for approval" };
    }

    const mou = await db.mOU.findUnique({
      where: { id: mouId },
      include: {
        campaign: {
          include: {
            brands: true,
            CampaignInvitation: {
              where: { status: 'ACTIVE' },
              include: {
                influencer: {
                  include: {
                    user: { select: { id: true } }
                  }
                }
              }
            }
          }
        }
      }
    });

    if (!mou) {
      return { success: false, message: "MOU not found" };
    }

    if (mou.status !== 'DRAFT') {
      return { success: false, message: "Only draft MOU can be submitted for approval" };
    }

    // Tentukan status berikutnya berdasarkan flow approval
    let nextStatus: MOUStatus = 'PENDING_BRAND';

    // Jika disubmit oleh brand, skip approval brand
    if (user.role === 'BRAND') {
      nextStatus = 'PENDING_INFLUENCER';
      await db.mOU.update({
        where: { id: mouId },
        data: {
          brandApprovalStatus: 'APPROVED',
          brandApprovedAt: new Date(),
          brandApprovedBy: session.user.id
        }
      });
    }

    await db.mOU.update({
      where: { id: mouId },
      data: {
        status: nextStatus,
        updatedAt: new Date()
      }
    });

    // Kirim notifikasi ke pihak yang perlu approve
    await sendMOUNotifications(mouId, 'SUBMITTED_FOR_APPROVAL');

    revalidatePath(`/mou/${mouId}`);

    return {
      success: true,
      message: "MOU submitted for approval successfully"
    };

  } catch (error) {
    console.error("Error submitting MOU for approval:", error);
    return {
      success: false,
      message: "Failed to submit MOU for approval"
    };
  }
}

/** DONE
 * 9. AMBIL MOU YANG PENDING UNTUK USER
 * Fungsi untuk mengambil MOU yang menunggu approval dari user tertentu
 * 
 * @returns List MOU yang pending approval
 */
export async function getPendingMOUsForUser() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, message: "Unauthorized" };
    }

    const user = await db.user.findUnique({
      where: { id: session.user.id },
      include: {
        brands: true,
        influencers: true
      }
    });

    if (!user) {
      return { success: false, message: "User not found" };
    }

    let whereClause: any = {};

    // Filter berdasarkan role user
    if (user.role === 'ADMIN') {
      whereClause = {
        OR: [
          { status: 'PENDING_ADMIN' },
          { adminApprovalStatus: 'PENDING' }
        ]
      };
    } else if (user.role === 'BRAND') {
      whereClause = {
        AND: [
          {
            campaign: {
              brandId: { in: user.brands.map(b => b.id) }
            }
          },
          {
            OR: [
              { status: 'PENDING_BRAND' },
              { brandApprovalStatus: 'PENDING' }
            ]
          }
        ]
      };
    } else if (user.role === 'INFLUENCER' && user.influencers) {
      whereClause = {
        AND: [
          {
            campaign: {
              CampaignInvitation: {
                some: {
                  influencerId: user.influencers.id,
                  status: 'ACTIVE'
                }
              }
            }
          },
          {
            OR: [
              { status: 'PENDING_INFLUENCER' },
              { influencerApprovalStatus: 'PENDING' }
            ]
          }
        ]
      };
    }

    const mous = await db.mOU.findMany({
      where: whereClause,
      include: {
        campaign: {
          include: {
            brands: {
              include: {
                user: {
                  select: {
                    name: true,
                    email: true // Add email field
                  }
                }
              }
            },
            CampaignInvitation: { // Add CampaignInvitation
              include: {
                influencer: {
                  include: {
                    user: {
                      select: {
                        name: true,
                        email: true
                      }
                    }
                  }
                }
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Transform the data to match the MOU interface
    const transformedMous = mous.map(mou => ({
      ...mou,
      campaign: {
        ...mou.campaign,
        brands: {
          userId: mou.campaign.brands.userId,
          user: {
            name: mou.campaign.brands.user.name || '',
            email: mou.campaign.brands.user.email || ''
          }
        },
        CampaignInvitation: mou.campaign.CampaignInvitation.map(invitation => ({
          id: invitation.id,
          influencerId: invitation.influencerId,
          status: invitation.status,
          influencer: {
            userId: invitation.influencer.userId,
            user: {
              name: invitation.influencer.user.name || '',
              email: invitation.influencer.user.email || ''
            }
          }
        }))
      }
    }));

    return {
      success: true,
      data: transformedMous
    };

  } catch (error) {
    console.error("Error getting pending MOUs:", error);
    return {
      success: false,
      message: "Failed to get pending MOUs"
    };
  }
}

/** DONE
 * 10. BULK APPROVE MOU (ADMIN)
 * Fungsi untuk approve banyak MOU sekaligus oleh admin
 * Hanya Admin yang bisa melakukan bulk approval
 * 
 * @param mouIds - Array ID MOU yang akan diapprove
 * @param comments - Komentar approval (opsional)
 * @returns Response bulk approval
 */
export async function bulkApproveMOUs(mouIds: string[], comments?: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, message: "Unauthorized" };
    }

    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: { role: true }
    });

    if (!user || user.role !== 'ADMIN') {
      return { success: false, message: "Only Admin can bulk approve MOUs" };
    }

    const results = [];
    const errors = [];

    // Proses setiap MOU
    for (const mouId of mouIds) {
      try {
        // Ambil data MOU
        const mou = await db.mOU.findUnique({
          where: { id: mouId },
          include: {
            campaign: {
              include: {
                brands: true,
                CampaignInvitation: {
                  where: { status: 'ACTIVE' },
                  include: { influencer: true }
                }
              }
            }
          }
        });

        if (!mou) {
          errors.push({ mouId, error: 'MOU not found' });
          continue;
        }

        // Update approval admin
        const updateData: any = {
          adminApprovalStatus: 'APPROVED',
          adminApprovedAt: new Date(),
          adminApprovedBy: session.user.id,
          updatedAt: new Date()
        };

        if (comments) {
          updateData.adminComments = comments;
        }

        // Cek apakah semua approval sudah lengkap
        const allApproved =
          mou.brandApprovalStatus === 'APPROVED' &&
          mou.influencerApprovalStatus === 'APPROVED';

        if (allApproved) {
          updateData.status = 'APPROVED';
          updateData.approvedAt = new Date();
        }

        // Kirim notifikasi jika MOU sudah fully approved
        if (allApproved) {
          const allParticipants = [
            mou.campaign.brands.userId,
            ...mou.campaign.CampaignInvitation.map(inv => inv.influencer.userId)
          ];

          for (const userId of allParticipants) {
            await createNotification({
              userId: userId,
              type: 'SYSTEM',
              title: 'MOU Approved by Admin',
              message: `MOU for campaign "${mou.campaign.name}" has been approved by admin`,
              data: {
                campaignId: mou.campaignId,
                mouId: mouId,
                comments: comments
              }
            });
          }
        }

        results.push({
          mouId,
          status: 'approved',
          fullyApproved: allApproved
        });

      } catch (error) {
        errors.push({
          mouId,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    // Refresh cache
    revalidatePath('/admin/mou');

    return {
      success: true,
      data: {
        successful: results,
        failed: errors,
        totalProcessed: mouIds.length,
        successCount: results.length,
        errorCount: errors.length
      },
      message: `Bulk approval completed. ${results.length} successful, ${errors.length} failed.`
    };

  } catch (error) {
    console.error("Error in bulk approve MOUs:", error);
    return {
      success: false,
      message: "Failed to process bulk approval"
    };
  }
}

/** DONE
 * 11. AMBIL SEMUA MOU DENGAN FILTER (ADMIN)
 * Fungsi untuk admin mengambil semua MOU dengan berbagai filter dan pagination
 * Mendukung pencarian dan filter berdasarkan status, campaign, dll
 * 
 * @param filters - Object filter (status, campaignId, search, limit, offset)
 * @returns List MOU dengan pagination dan total count
 */
export async function getAllMOUsWithFIlter(filters?: {
  status?: MOUStatus;
  campaignId?: string;
  search?: string;
  limit?: number;
  offset?: number;
}) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, message: "Unauthorized" };
    }

    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: { role: true }
    });

    if (!user || user.role !== 'ADMIN') {
      return { success: false, message: "Only Admin can access all MOUs" };
    }

    // Bangun where clause berdasarkan filter
    const whereClause: Prisma.MOUWhereInput = {};

    if (filters?.status) {
      whereClause.status = filters.status;
    }

    if (filters?.campaignId) {
      whereClause.campaignId = filters.campaignId;
    }

    // Filter pencarian berdasarkan judul MOU atau nama kampanye
    if (filters?.search) {
      whereClause.OR = [
        { title: { contains: filters.search, mode: 'insensitive' } },
        { campaign: { name: { contains: filters.search, mode: 'insensitive' } } }
      ];
    }

    // Ambil data dengan pagination dan hitung total
    const [mous, total] = await Promise.all([
      db.mOU.findMany({
        where: whereClause,
        include: {
          campaign: {
            include: {
              brands: {
                include: {
                  user: { select: { name: true, email: true } }
                }
              },
              CampaignInvitation: {
                where: { status: 'ACTIVE' },
                include: {
                  influencer: {
                    include: {
                      user: { select: { name: true, email: true } }
                    }
                  }
                }
              }
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: filters?.limit || 50,      // Default 50 items per page
        skip: filters?.offset || 0       // Offset untuk pagination
      }),
      db.mOU.count({ where: whereClause })
    ]);

    return {
      success: true,
      data: {
        mous,
        total,
        hasMore: (filters?.offset || 0) + mous.length < total
      }
    };

  } catch (error) {
    console.error("Error getting all MOUs:", error);
    return {
      success: false,
      message: "Failed to get MOUs"
    };
  }
}

/**
 * 12. BULK REJECT MOU (ADMIN)
 * Fungsi untuk reject banyak MOU sekaligus oleh admin
 * Hanya Admin yang bisa melakukan bulk rejection
 * 
 * @param mouIds - Array ID MOU yang akan direject
 * @param rejectionReason - Alasan penolakan
 * @returns Response bulk rejection
 */
export async function bulkRejectMOUs(mouIds: string[], rejectionReason: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, message: "Unauthorized" };
    }

    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: { role: true }
    });

    if (!user || user.role !== 'ADMIN') {
      return { success: false, message: "Only Admin can bulk reject MOUs" };
    }

    const results = [];
    const errors = [];

    for (const mouId of mouIds) {
      try {
        const mou = await db.mOU.findUnique({
          where: { id: mouId },
          include: {
            campaign: {
              include: {
                brands: true,
                CampaignInvitation: {
                  where: { status: 'ACTIVE' },
                  include: { influencer: true }
                }
              }
            }
          }
        });

        if (!mou) {
          errors.push({ mouId, error: 'MOU not found' });
          continue;
        }

        // Update rejection status
        await db.mOU.update({
          where: { id: mouId },
          data: {
            status: 'REJECTED',
            adminApprovalStatus: 'REJECTED',
            adminRejectionReason: rejectionReason,
            createdBy: session.user.id,
            updatedAt: new Date()
          }
        });

        // Notify all parties about rejection
        const allParticipants = [
          mou.campaign.brands.userId,
          ...mou.campaign.CampaignInvitation.map(inv => inv.influencer.userId)
        ];

        for (const userId of allParticipants) {
          await createNotification({
            userId: userId,
            type: 'SYSTEM',
            title: 'MOU Rejected by Admin',
            message: `MOU for campaign "${mou.campaign.name}" has been rejected by admin`,
            data: {
              campaignId: mou.campaignId,
              mouId: mouId,
              adminRejectionReason: rejectionReason,
            }
          });
        }

        results.push({
          mouId,
          status: 'rejected'
        });

      } catch (error) {
        errors.push({
          mouId,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    // Revalidate paths
    revalidatePath('/admin/mou');

    return {
      success: true,
      data: {
        successful: results,
        failed: errors,
        totalProcessed: mouIds.length,
        successCount: results.length,
        errorCount: errors.length
      },
      message: `Bulk rejection completed. ${results.length} successful, ${errors.length} failed.`
    };

  } catch (error) {
    console.error("Error in bulk reject MOUs:", error);
    return {
      success: false,
      message: "Failed to process bulk rejection"
    };
  }
}

/**
 * 13. REJECT MOU (ADMIN)
 * Fungsi untuk reject banyak MOU sekaligus oleh admin
 * Hanya Admin yang bisa melakukan bulk rejection
 * 
 * @param mouIds - Array ID MOU yang akan direject
 * @param rejectionReason - Alasan penolakan
 * @returns Response bulk rejection
 */
export async function rejectMOU(mouId: string, rejectionReason: string, rejectionType: 'BRAND' | 'INFLUENCER') {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, message: "Unauthorized" };
    }

    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: { role: true }
    });

    if (!user) {
      return { success: false, message: "User not found" };
    }

    const mou = await db.mOU.findUnique({
      where: { id: mouId },
      include: {
        campaign: {
          include: {
            brands: true,
            CampaignInvitation: {
              where: { status: 'ACTIVE' },
              include: { influencer: true }
            }
          }
        }
      }
    });

    if (!mou) {
      return { success: false, message: "MOU not found" };
    }

    // Check authorization
    const canReject =
      (rejectionType === 'BRAND' && user.role === 'BRAND' &&
        mou.campaign.brands.userId === session.user.id) ||
      (rejectionType === 'INFLUENCER' && user.role === 'INFLUENCER' &&
        mou.campaign.CampaignInvitation.some(inv => inv.influencer.userId === session.user.id));

    if (!canReject) {
      return { success: false, message: "Not authorized to reject this MOU" };
    }

    // Update rejection status
    const updateData: any = {
      status: 'REJECTED',
      rejectionReason: rejectionReason,
      rejectedAt: new Date(),
      rejectedBy: session.user.id,
      updatedAt: new Date()
    };

    if (rejectionType === 'BRAND') {
      updateData.brandApprovalStatus = 'REJECTED';
    } else {
      updateData.influencerApprovalStatus = 'REJECTED';
    }

    await db.mOU.update({
      where: { id: mouId },
      data: updateData
    });

    // Notify all parties about rejection
    const allParticipants = [
      mou.campaign.brands.userId,
      ...mou.campaign.CampaignInvitation.map(inv => inv.influencer.userId)
    ];

    for (const userId of allParticipants) {
      await createNotification({
        userId: userId,
        type: 'CAMPAIGN_REJECTION',
        title: 'MOU Rejected',
        message: `MOU for campaign "${mou.campaign.name}" has been rejected by ${rejectionType.toLowerCase()}`,
        data: {
          campaignId: mou.campaignId,
          mouId: mouId,
          rejectionReason: rejectionReason,
          rejectedBy: rejectionType
        }
      });
    }

    revalidatePath(`/campaigns/${mou.campaignId}`);
    revalidatePath('/admin/mou');

    return {
      success: true,
      message: `MOU rejected by ${rejectionType.toLowerCase()}`,
      data: {
        mouId: mouId,
        rejectionType: rejectionType,
        rejectionReason: rejectionReason
      }
    };

  } catch (error) {
    console.error("Error rejecting MOU:", error);
    return {
      success: false,
      message: "Failed to reject MOU"
    };
  }
}

// Approve BRAND & INFLUENCER
export async function approveMOU(mouId: string, approvalType: 'BRAND' | 'INFLUENCER') {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, message: "Unauthorized" };
    }

    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: { role: true }
    });

    if (!user) {
      return { success: false, message: "User not found" };
    }

    const mou = await db.mOU.findUnique({
      where: { id: mouId },
      include: {
        campaign: {
          include: {
            brands: true,
            CampaignInvitation: {
              where: { status: 'ACTIVE' },
              include: { influencer: true }
            }
          }
        }
      }
    });

    if (!mou) {
      return { success: false, message: "MOU not found" };
    }

    // Check authorization
    const canApprove =
      (approvalType === 'BRAND' && user.role === 'BRAND' &&
        mou.campaign.brands.userId === session.user.id) ||
      (approvalType === 'INFLUENCER' && user.role === 'INFLUENCER' &&
        mou.campaign.CampaignInvitation.some(inv => inv.influencer.userId === session.user.id));

    if (!canApprove) {
      return { success: false, message: "Not authorized to approve this MOU" };
    }

    // Update approval status
    const updateData: any = {};
    if (approvalType === 'BRAND') {
      updateData.brandApprovalStatus = 'APPROVED';
      updateData.brandApprovedAt = new Date();
      updateData.brandApprovedBy = session.user.id;
    } else {
      updateData.influencerApprovalStatus = 'APPROVED';
      updateData.influencerApprovedAt = new Date();
      updateData.influencerApprovedBy = session.user.id;
    }

    const updatedMOU = await db.mOU.update({
      where: { id: mouId },
      data: {
        ...updateData,
        updatedAt: new Date()
      }
    });

    // Check if all approvals are done
    const allApproved =
      updatedMOU.brandApprovalStatus === 'APPROVED' &&
      updatedMOU.influencerApprovalStatus === 'APPROVED' &&
      updatedMOU.adminApprovalStatus === 'APPROVED';

    if (allApproved) {
      await db.mOU.update({
        where: { id: mouId },
        data: {
          status: 'APPROVED',
          updatedAt: new Date()
        }
      });

      // Notify all parties that MOU is fully approved
      const allParticipants = [
        mou.campaign.brands.userId,
        ...mou.campaign.CampaignInvitation.map(inv => inv.influencer.userId)
      ];

      for (const userId of allParticipants) {
        await createNotification({
          userId: userId,
          type: 'CAMPAIGN_APPROVAL',
          title: 'MOU Fully Approved',
          message: `MOU for campaign "${mou.campaign.name}" has been approved by all parties`,
          data: {
            campaignId: mou.campaignId,
            mouId: mouId
          }
        });
      }
    }

    revalidatePath(`/campaigns/${mou.campaignId}`);
    revalidatePath('/admin/mou');

    return {
      success: true,
      message: `MOU approved successfully by ${approvalType.toLowerCase()}`,
      data: {
        mouId: mouId,
        approvalType: approvalType,
        allApproved: allApproved
      }
    };

  } catch (error) {
    console.error("Error approving MOU:", error);
    return {
      success: false,
      message: "Failed to approve MOU"
    };
  }
}

export async function getMOUByCampaignIdWithInfluencer(campaignId: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, message: "Unauthorized" };
    }

    const mou = await db.mOU.findUnique({
      where: { campaignId: campaignId },
      include: {
        campaign: {
          include: {
            brands: {
              include: {
                user: { select: { id: true, name: true, email: true } }
              }
            },
            CampaignInvitation: {
              where: { status: 'ACTIVE' },
              include: {
                influencer: {
                  include: {
                    user: { select: { id: true, name: true, email: true } }
                  }
                }
              }
            }
          }
        }
      }
    });

    if (!mou) {
      return { success: false, message: "MOU not found" };
    }

    // Check if user has access to this MOU
    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: { role: true }
    });

    const hasAccess =
      user?.role === 'ADMIN' ||
      (user?.role === 'BRAND' && mou.campaign.brands.userId === session.user.id) ||
      (user?.role === 'INFLUENCER' && mou.campaign.CampaignInvitation.some(
        inv => inv.influencer.userId === session.user.id
      ));

    if (!hasAccess) {
      return { success: false, message: "Access denied" };
    }

    return {
      success: true,
      data: mou
    };

  } catch (error) {
    console.error("Error getting MOU:", error);
    return {
      success: false,
      message: "Failed to get MOU"
    };
  }
}

export async function createMOUAdminOnly(campaignId: string, mouData: {
  mouNumber: string;  // wajib
  brandName: string;  // wajib
  brandRepresentative: string; // wajib
  brandEmail: string; // wajib
  influencerName: string; // wajib
  influencerEmail: string; //
  campaignObjective: string;
  campaignScope: string;
  deliverableDetails: [];
  expiryDate: Date;
  effectiveDate: Date;
  totalBudget: number;

  title: string;
  content: string;
  termsAndConditions?: string;
  paymentTerms?: string;
}) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, message: "Unauthorized" };
    }

    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: { role: true }
    });

    if (!user || user.role !== 'ADMIN') {
      return { success: false, message: "Only Admin can create MOU" };
    }

    // Check if campaign exists
    const campaign = await db.campaign.findUnique({
      where: { id: campaignId },
      include: {
        brands: {
          include: {
            user: { select: { id: true, name: true } }
          }
        },
        CampaignInvitation: {
          where: { status: 'ACTIVE' },
          include: {
            influencer: {
              include: {
                user: { select: { id: true, name: true } }
              }
            }
          }
        }
      }
    });

    if (!campaign) {
      return { success: false, message: "Campaign not found" };
    }

    // Check if MOU already exists
    const existingMOU = await db.mOU.findUnique({
      where: { campaignId: campaignId }
    });

    if (existingMOU) {
      return { success: false, message: "MOU already exists for this campaign" };
    }

    // Create MOU
    const mou = await db.mOU.create({
      data: {
        mouNumber: mouData.mouNumber,  // wajib
        brandName: mouData.brandName,  // wajib
        brandRepresentative: mouData.brandRepresentative, // wajib
        brandEmail: mouData.brandEmail, // wajib
        influencerName: mouData.influencerName, // wajib
        influencerEmail: mouData.influencerEmail,
        campaignObjective: mouData.campaignObjective,
        campaignScope: mouData.campaignScope,
        deliverableDetails: mouData.deliverableDetails ?? [], // JSON
        effectiveDate: new Date(mouData.effectiveDate),
        expiryDate: new Date(mouData.expiryDate),
        totalBudget: mouData.totalBudget,

        title: mouData.title ?? "",
        termsAndConditions: mouData.termsAndConditions ?? "",
        paymentTerms: mouData.paymentTerms ?? "",
        campaignId: campaignId,
        status: "DRAFT",
        brandApprovalStatus: "PENDING",
        influencerApprovalStatus: "PENDING",
        adminApprovalStatus: "APPROVED",
        createdBy: session.user.id,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    });

    // Notify all parties
    const allParticipants = [
      campaign.brands.user.id,
      ...campaign.CampaignInvitation.map(inv => inv.influencer.user.id)
    ];

    for (const userId of allParticipants) {
      await createNotification({
        userId: userId,
        type: 'SYSTEM',
        title: 'MOU Created',
        message: `MOU has been created for campaign "${campaign.name}"`,
        data: {
          campaignId: campaignId,
          mouId: mou.id
        }
      });
    }

    revalidatePath(`/campaigns/${campaignId}`);
    revalidatePath('/admin/mou');

    return {
      success: true,
      message: "MOU created successfully",
      data: mou
    };

  } catch (error) {
    console.error("Error creating MOU:", error);
    return {
      success: false,
      message: "Failed to create MOU"
    };
  }
}

// APPROVE CAMPAIGN START (Dengan atau tanpa MOU) - CONTINUATION
export async function approveCampaignStart(campaignId: string, force: boolean = false) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, message: "Unauthorized" };
    }

    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: { role: true }
    });

    if (!user || user.role !== 'ADMIN') {
      return { success: false, message: "Only Admin can approve campaign start" };
    }

    const campaign = await db.campaign.findUnique({
      where: { id: campaignId },
      include: {
        mou: true,
        brands: {
          include: {
            user: { select: { id: true, name: true } }
          }
        },
        CampaignInvitation: {
          where: { status: 'ACTIVE' },
          include: {
            influencer: {
              include: {
                user: { select: { id: true, name: true } }
              }
            }
          }
        }
      }
    });

    if (!campaign) {
      return { success: false, message: "Campaign not found" };
    }

    // Check MOU requirements
    if (campaign.mouRequired && !force) {
      if (!campaign.mou) {
        return {
          success: false,
          message: "MOU is required but not created yet",
          requiresForce: true
        };
      }

      if (campaign.mou.status !== 'APPROVED') {
        return {
          success: false,
          message: "MOU exists but not fully approved yet",
          mouStatus: campaign.mou.status,
          requiresForce: true
        };
      }
    }

    // Start campaign
    await db.campaign.update({
      where: { id: campaignId },
      data: {
        status: 'ACTIVE',
        updatedAt: new Date()
      }
    });

    // Update MOU to ACTIVE if exists
    if (campaign.mou && campaign.mou.status === 'APPROVED') {
      await db.mOU.update({
        where: { id: campaign.mou.id },
        data: {
          status: 'ACTIVE',
          updatedAt: new Date()
        }
      });
    }

    // Notify all parties
    const allParticipants = [
      campaign.brands.user.id,
      ...campaign.CampaignInvitation.map(inv => inv.influencer.user.id)
    ];

    for (const userId of allParticipants) {
      await createNotification({
        userId: userId,
        type: 'SYSTEM',
        title: 'Campaign Started',
        message: `Campaign "${campaign.name}" has been started`,
        data: {
          campaignId: campaignId,
          forcedStart: force
        }
      });
    }

    revalidatePath(`/campaigns/${campaignId}`);
    revalidatePath('/admin/campaigns');

    return {
      success: true,
      message: force ? "Campaign started forcefully without MOU" : "Campaign started successfully",
      data: {
        campaignId: campaignId,
        status: 'ACTIVE',
        mouRequired: campaign.mouRequired,
        mouStatus: campaign.mou?.status
      }
    };

  } catch (error) {
    console.error("Error approving campaign start:", error);
    return {
      success: false,
      message: "Failed to approve campaign start"
    };
  }
}

// CHECK CAMPAIGN MOU STATUS
export async function checkCampaignMOUStatus(campaignId: string) {
  try {
    const campaign = await db.campaign.findUnique({
      where: { id: campaignId },
      include: {
        mou: {
          select: {
            id: true,
            status: true,
            brandApprovalStatus: true,
            influencerApprovalStatus: true,
            adminApprovalStatus: true
          }
        },
        CampaignInvitation: {
          where: { status: 'ACTIVE' },
          select: {
            mouCreationRequested: true,
            mouCreatedAt: true
          }
        }
      }
    });

    if (!campaign) {
      return { success: false, message: "Campaign not found" };
    }

    const mouStatus = {
      required: campaign.mouRequired,
      exists: !!campaign.mou,
      requested: campaign.CampaignInvitation.some(inv => inv.mouCreationRequested),
      canStartWithoutMOU: campaign.canStartWithoutMOU,
      status: campaign.mou?.status || null,
      approvalStatus: {
        brand: campaign.mou?.brandApprovalStatus || 'PENDING',
        influencer: campaign.mou?.influencerApprovalStatus || 'PENDING',
        admin: campaign.mou?.adminApprovalStatus || 'PENDING'
      },
      campaignCanStart: !campaign.mouRequired ||
        campaign.canStartWithoutMOU ||
        campaign.mou?.status === 'APPROVED'
    };

    return {
      success: true,
      data: mouStatus
    };

  } catch (error) {
    console.error("Error checking campaign MOU status:", error);
    return {
      success: false,
      message: "Failed to check MOU status"
    };
  }
}

// GET CAMPAIGNS THAT NEED MOU
export async function getCampaignsNeedingMOU() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, message: "Unauthorized", data: [] };
    }

    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: { role: true }
    });

    {/** hanya admin yang punya akses
    if (!user || user.role !== 'ADMIN') {
      return { success: false, message: "Only Admin can access MOU requests", data: [] };
    }
    */}

    if (!user || !['ADMIN', 'BRAND'].includes(user.role!)) {
      return { success: false, message: "Only Admin or Brand can access MOU requests", data: [] };
    }

    const whereClause: any = {
      AND: [
        { mouRequired: true },
        { mou: null }, // Pastikan belum ada MOU
        {
          CampaignInvitation: {
            some: {
              mouCreationRequested: true,
              status: 'ACTIVE'
            }
          }
        }
      ]
    };

    // Kalau role = BRAND, filter berdasarkan userId brand
    if (user.role === 'BRAND') {
      whereClause.brands = { userId: session.user.id };
    }

    // Get campaigns with active invitations that requested MOU creation
    const campaigns = await db.campaign.findMany({
      where: whereClause,
      include: {
        brands: {
          include: {
            user: { select: { name: true, email: true } }
          }
        },
        CampaignInvitation: {
          where: {
            mouCreationRequested: true,
            status: 'ACTIVE'
          },
          include: {
            influencer: {
              include: {
                user: { select: { name: true, email: true } }
              }
            }
          }
        }
      },
      orderBy: {
        updatedAt: 'desc'
      }
    });

    return {
      success: true,
      data: campaigns
    };

  } catch (error) {
    console.error("Error getting campaigns needing MOU:", error);
    return { success: false, message: "Failed to get campaigns needing MOU", data: [] };
  }
}

// REQUEST MOU CREATION (Brand atau Influencer bisa request)
export async function requestMOUCreation(data: RequestMOUCreationInput) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, message: "Unauthorized" };
    }

    // Get user role
    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: { role: true }
    });

    if (!user) {
      return { success: false, message: "User not found" };
    }

    // Get campaign and invitation details
    const campaign = await db.campaign.findUnique({
      where: { id: data.campaignId },
      include: {
        brands: {
          include: {
            user: { select: { id: true, name: true, email: true } }
          }
        },
        CampaignInvitation: {
          where: { id: data.invitationId },
          include: {
            influencer: {
              include: {
                user: { select: { id: true, name: true, email: true } }
              }
            }
          }
        }
      }
    });

    if (!campaign) {
      return { success: false, message: "Campaign not found" };
    }

    const invitation = campaign.CampaignInvitation[0];
    if (!invitation) {
      return { success: false, message: "Invitation not found" };
    }

    // Check if MOU already exists
    const existingMOU = await db.mOU.findUnique({
      where: { campaignId: data.campaignId }
    });

    if (existingMOU) {
      return { success: false, message: "MOU already exists for this campaign" };
    }

    // Check authorization
    const isAuthorized =
      user.role === 'ADMIN' ||
      (user.role === 'BRAND' && campaign.brands.userId === session.user.id) ||
      (user.role === 'INFLUENCER' && invitation.influencer.userId === session.user.id);

    if (!isAuthorized) {
      return { success: false, message: "Not authorized to request MOU for this campaign" };
    }

    // Update invitation to indicate MOU creation was requested
    await db.campaignInvitation.update({
      where: { id: data.invitationId },
      data: {
        mouCreationRequested: true,
        mouCreatedAt: new Date(),
        mouCreatedBy: session.user.id,
        updatedAt: new Date()
      }
    });

    // If urgent request, allow campaign to start without MOU temporarily
    if (data.urgentRequest && user.role === 'ADMIN') {
      await db.campaign.update({
        where: { id: data.campaignId },
        data: {
          canStartWithoutMOU: true,
          updatedAt: new Date()
        }
      });
    }

    // Create notification for admin to create MOU
    await createNotification({
      userId: 'admin', // You might need to get actual admin user ID
      type: 'SYSTEM',
      title: 'MOU Creation Requested',
      message: `MOU creation requested for campaign "${campaign.name}" by ${user.role}`,
      data: {
        campaignId: data.campaignId,
        invitationId: data.invitationId,
        requestedBy: session.user.id,
        requestMessage: data.message,
        urgentRequest: data.urgentRequest || false
      }
    });

    // Notify the other party about MOU request
    const otherPartyUserId = user.role === 'BRAND'
      ? invitation.influencer.user.id
      : campaign.brands.user.id;

    await createNotification({
      userId: otherPartyUserId,
      type: 'SYSTEM',
      title: 'MOU Creation Requested',
      message: `MOU has been requested for campaign "${campaign.name}"`,
      data: {
        campaignId: data.campaignId,
        invitationId: data.invitationId,
        requestedBy: session.user.id
      }
    });

    revalidatePath(`/campaigns/${data.campaignId}`);
    revalidatePath('/admin/mou/requests');

    return {
      success: true,
      message: "MOU creation requested successfully",
      data: {
        campaignId: data.campaignId,
        invitationId: data.invitationId,
        canStartWithoutMOU: data.urgentRequest && user.role === 'ADMIN'
      }
    };

  } catch (error) {
    console.error("Error requesting MOU creation:", error);
    return {
      success: false,
      message: "Failed to request MOU creation"
    };
  }
}

// 11. GET MOU STATISTICS (Admin Dashboard)
export async function getMOUStatistics() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, message: "Unauthorized" };
    }

    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: { role: true }
    });

    if (!user || user.role !== 'ADMIN') {
      return { success: false, message: "Only Admin can access MOU statistics" };
    }

    const [
      totalMOUs,
      draftMOUs,
      pendingMOUs,
      approvedMOUs,
      rejectedMOUs,
      activeMOUs,
      expiredMOUs,
      recentMOUs
    ] = await Promise.all([
      db.mOU.count(),
      db.mOU.count({ where: { status: 'DRAFT' } }),
      db.mOU.count({
        where: {
          status: {
            in: ['PENDING_BRAND', 'PENDING_INFLUENCER', 'PENDING_ADMIN']
          }
        }
      }),
      db.mOU.count({ where: { status: 'APPROVED' } }),
      db.mOU.count({ where: { status: 'REJECTED' } }),
      db.mOU.count({ where: { status: 'ACTIVE' } }),
      db.mOU.count({ where: { status: 'EXPIRED' } }),
      db.mOU.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Last 7 days
          }
        }
      })
    ]);

    // Calculate approval rate
    const totalProcessed = approvedMOUs + rejectedMOUs;
    const approvalRate = totalProcessed > 0 ? (approvedMOUs / totalProcessed) * 100 : 0;

    // Get monthly MOU creation trend
    const monthlyTrend = await db.mOU.groupBy({
      by: ['createdAt'],
      _count: {
        id: true
      },
      where: {
        createdAt: {
          gte: new Date(Date.now() - 12 * 30 * 24 * 60 * 60 * 1000) // Last 12 months
        }
      }
    });

    return {
      success: true,
      data: {
        summary: {
          total: totalMOUs,
          draft: draftMOUs,
          pending: pendingMOUs,
          approved: approvedMOUs,
          rejected: rejectedMOUs,
          active: activeMOUs,
          expired: expiredMOUs,
          recentlyCreated: recentMOUs,
          approvalRate: Math.round(approvalRate * 100) / 100
        },
        trends: {
          monthly: monthlyTrend
        }
      }
    };

  } catch (error) {
    console.error("Error getting MOU statistics:", error);
    return {
      success: false,
      message: "Failed to get MOU statistics"
    };
  }
}