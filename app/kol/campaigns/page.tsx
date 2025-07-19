import { auth } from '@/auth';
import InfluencerDashboardInvitations from '@/components/kol/InfluencerDashboardInvitations';
import { getInfluencerInvitations } from '@/lib/campaign.actions';
import { db } from '@/lib/db';
import React from 'react'

export const dynamic = 'force-dynamic';

const CampaignPage = async () => {
  const session = await auth();
  const user = session?.user;
  
  if (!user?.id) {
    return <div className="text-center text-red-500">Anda bukan role influencer.</div>;
  }
  
  if (!user || user.role !== 'INFLUENCER') {
    return <div className="text-center text-red-500">Akses ditolak. Hanya influencer yang dapat mengakses halaman ini.</div>;
  }
  
  // Ambil influencerId berdasarkan userId
  const influencer = await db.influencer.findUnique({
    where: { userId: user.id },
    select: { id: true },
  });
  
  if (!influencer?.id) {
    return <div className="text-red-600">Akunmu belum terdaftar sebagai Influencer.</div>;
  }
  
  const res = await getInfluencerInvitations(influencer.id);
  
  if (!res.success) {
    return <div className="text-red-600">Gagal memuat undangan: {res.error}</div>;
  }
  
  // Fix the type mapping to convert null to undefined
  const invitations = res.data.map((item) => ({
    id: item.id,
    campaignId: item.campaignId,
    influencerId: item.influencerId,
    brandId: item.brandId,
    message: item.message ?? undefined, // Convert null to undefined
    responseMessage: item.responseMessage ?? undefined, // Also fix responseMessage if needed
    status: item.status,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
    invitedAt: item.invitedAt,
    respondedAt: item.respondedAt ?? undefined, // Convert null to undefined
  }));
  
  return (
    <div>
      <InfluencerDashboardInvitations initialInvitations={invitations} influencerId={influencer.id} />
    </div>
  )
}

export default CampaignPage