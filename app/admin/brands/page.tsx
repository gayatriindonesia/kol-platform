import React from 'react'
import { getAllBrand } from '@/lib/brand.actions';
import { columns } from '@/components/TableBrand/Columns';
import { DataTable } from '@/components/TableBrand/DataTable';

export const dynamic = 'force-dynamic';

const BrandPage = async () => {
    const brands = await getAllBrand()
    /// console.log(brands, "data list brand")

    if (brands.status !== 200 || !brands.data) {
        return <p className="text-red-500">Gagal memuat kategori</p>
      }

    return (
        <div>
           <DataTable columns={columns} data={brands.data}/>
        </div>
    )
}

export default BrandPage;
