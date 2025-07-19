import React from 'react'
import { columns } from '@/components/admin/Services/Columns';
import { DataTable } from '@/components/admin/Services/DataTable';
import { getAllPlatform } from '@/lib/platform.actions';
import { getAllService } from '@/lib/service.actions';

export const dynamic = 'force-dynamic'

const ServicePage = async () => {
  const [servicesResponse, platformsResponse] = await Promise.all([
    getAllService(),
    getAllPlatform()
  ]);

  if (servicesResponse.status !== 200 || !servicesResponse.data) {
    return <p className='text-red-500'>Gagal memuat data service platform</p>
  }

  // Check data platform
  if (platformsResponse.status !== 200 || !platformsResponse.data) {
    console.error("Gagal memuat data platform");
  }

  // forward platform to DataTable
  const platforms = platformsResponse.status === 200 ? platformsResponse.data : null;

  return (
    <div>
      <DataTable
        columns={columns}
        data={servicesResponse.data} 
        platforms={platforms}
        />
    </div>
  )
}

export default ServicePage
