import React from 'react'
import { Button } from '../ui/button'
import { ExclamationTriangleIcon } from '@radix-ui/react-icons'

const ErrorAuth = () => {
  return (
    <div className='w-full min-h-[50vh] flex flex-col items-center justify-center gap-4 text-center'>
      <ExclamationTriangleIcon className='h-12 w-12 text-destructive' />
      <h2 className='text-xl font-semibold'>Oops! Ada yang salah!</h2>
      <p className='text-muted-foreground mb-2'>Terjadi kesalahan saat autentikasi</p>
      <Button>Kembali</Button>
    </div>
  )
}

export default ErrorAuth