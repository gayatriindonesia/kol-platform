'use client';

import { respondToCampaignInvitation } from '@/lib/campaign.actions';

type Props = {
  invitationId: string;
  influencerId: string;
  onApprove: () => void;
  onReject: () => void;
};

export default function InvitationActionButton({
  invitationId,
  influencerId,
  onApprove,
  onReject,
}: Props) {
  const handleApprove = async () => {
    const res = await respondToCampaignInvitation({
      invitationId,
      influencerId,
      response: 'ACCEPTED',
      message: 'Saya bersedia mengikuti kampanye ini.',
    });

    if (res.success) {
      alert('Undangan telah disetujui!');
      onApprove();
    } else {
      alert(res.error || 'Gagal menyetujui undangan.');
    }
  };

  const handleReject = async () => {
    const res = await respondToCampaignInvitation({
      invitationId,
      influencerId,
      response: 'REJECTED',
      message: 'Maaf, saya tidak bisa mengikuti kampanye ini.',
    });

    if (res.success) {
      alert('Undangan telah ditolak.');
      onReject();
    } else {
      alert(res.error || 'Gagal menolak undangan.');
    }
  };

  return (
    <div className="flex gap-3">
      <button
        onClick={handleApprove}
        className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm rounded-lg"
      >
        Setujui
      </button>
      <button
        onClick={handleReject}
        className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm rounded-lg"
      >
        Tolak
      </button>
    </div>
  );
}
