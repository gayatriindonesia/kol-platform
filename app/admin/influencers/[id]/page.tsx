import React from 'react'
import InfluencerDetailClient from '@/components/admin/Influencer/InfluencerPageById';

interface InfluencerDetailPageProps {
    params: {
        id: string;
    };
}

const InfluencerPageDetail = async ({ params }: InfluencerDetailPageProps) => {

    return (
        <InfluencerDetailClient id={params.id} />
    )
}

export default InfluencerPageDetail
