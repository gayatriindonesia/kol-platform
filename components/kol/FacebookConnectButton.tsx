'use client'

import { useTransition } from 'react'

export default function FacebookConnectButton() {
  const [isPending, startTransition] = useTransition()

  const handleClick = async () => {
    try {
      const res = await fetch('/api/facebook/initiate')
      const data = await res.json()

      if (data?.url) {
        window.location.href = data.url
      } else {
        alert('Gagal memulai koneksi ke Facebook.')
      }
    } catch (error) {
      console.error('[FacebookConnectButton] Error:', error)
      alert('Terjadi kesalahan saat menghubungkan ke Facebook.')
    }
  }

  return (
    <button
      onClick={() => startTransition(handleClick)}
      disabled={isPending}
      className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
    >
      {isPending ? 'Mengalihkan...' : 'Connect Facebook'}
    </button>
  )
}
