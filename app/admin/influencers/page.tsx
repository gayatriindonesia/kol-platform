import React from 'react';
import { columns } from '@/components/TableInfluencer/Columns';
import { DataTable } from '@/components/TableInfluencer/DataTable';
import { getAllInfluencer } from '@/lib/influencer.actions';

export const dynamic = 'force-dynamic';

const InfluencerPage = async () => {
  const influencers = await getAllInfluencer()
  //console.log(influencers, "data list influencer")

  if (influencers.status !== 200 || !influencers.data) {
    return <p className="text-red-500">Gagal memuat Influencer</p>
  }

  return (
    <div>
      <DataTable columns={columns} data={influencers.data} />
    </div>
  )
}

export default InfluencerPage;