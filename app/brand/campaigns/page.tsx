import React from 'react'
import { columns } from '@/components/brand/Campaign/Columns';
import { DataTable } from '@/components/brand/Campaign/DataTable';
import { getAllCampaign } from '@/lib/campaign.actions';

export const dynamic = 'force-dynamic';

const CampaignPageList = async () => {
  const campaigns = await getAllCampaign();
      // console.log(campaigns, "data campaign")
    
      if (campaigns.status !==200 || !campaigns.data) {
        return <p className='text-red-500'>Gagal memuat data</p>
      }

  return (
    <div>
      <DataTable columns={columns} data={campaigns.data} />
    </div>
  )
}

export default CampaignPageList
