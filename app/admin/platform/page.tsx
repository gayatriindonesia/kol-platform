import React from 'react';
import { columns } from '@/components/admin/Platform/Columns';
import { DataTable } from '@/components/admin/Platform/DataTable'
import { getAllPlatform } from '@/lib/platform.actions'

export const dynamic = 'force-dynamic'

const PlatformPage = async () => {
    const platforms = await getAllPlatform();
    // console.log(platforms, "List Data platform")

    if(platforms.status !== 200 || !platforms.data) {
        return <p className='text-red-500'>Gagal memuat data platform</p>
    }

  return (
    <div>
      <DataTable columns={columns} data={platforms.data}/>
    </div>
  )
}

export default PlatformPage
