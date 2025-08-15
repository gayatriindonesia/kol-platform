import React from 'react'
import { columns } from '@/components/brand/Campaign/Columns';
import { DataTable } from '@/components/brand/Campaign/DataTable';
import { getAllCampaign } from '@/lib/campaign.actions';
import CampaignErrorState from '@/components/brand/Campaign/CampaignErrorState';

export const dynamic = 'force-dynamic';

const CampaignPageList = async () => {
  const campaigns = await getAllCampaign();

  if (campaigns.status !== 200 || !campaigns.data || campaigns.data.length === 0) {
    return <CampaignErrorState />;
  }

  return (
    <div className="p-6">
      <DataTable columns={columns} data={campaigns.data} />
    </div>
  )
}

export default CampaignPageList;
