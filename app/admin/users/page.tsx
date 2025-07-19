import React from 'react';
import { columns } from '@/components/TableUser/Columns';
import { DataTable } from '@/components/TableUser/DataTable';
import { getAllUser } from '@/lib/user.actions';

export const dynamic = 'force-dynamic';

const UserPage = async () => {
  const users = await getAllUser();

  if (users.status !== 200 || !users.data) {
    return <p className='text-red-500'>Gagal memuat data user</p>
  }

  return (
    <div>
      <DataTable columns={columns} data={users.data} />
    </div>
  )
}

export default UserPage;