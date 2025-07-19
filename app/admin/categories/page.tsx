import React from 'react';
import { getAllCategories } from '@/lib/category.actions';
import { columns } from '@/components/admin/Category/Columns';
import { DataTable } from '@/components/admin/Category/DataTable';

export const dynamic = 'force-dynamic'

const CategoryPage = async () => {
  const categories = await getAllCategories();
  console.log("Ini data dari : ", categories)

  if (categories.status !== 200 || !categories.data) {
    return <p className="text-red-500">Gagal memuat kategori</p>
  }

  return (
    <div>
      {/**
      <ListCategory categories={categories.data} />
     */}
     <DataTable columns={columns} data={categories.data} />
      </div>
  )
}

export default CategoryPage;