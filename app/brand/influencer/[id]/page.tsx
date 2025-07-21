import InfluencerDetailClient from "@/components/admin/Influencer/InfluencerPageById";


export default function InfluencerDetailPage({ params }: { params: { id: string } }) {
  return <InfluencerDetailClient id={params.id} />;
}