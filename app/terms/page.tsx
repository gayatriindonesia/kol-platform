import React from 'react'

const TermsOfServicePage = () => {
  return (
    <main className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold mb-6">Ketentuan Layanan</h1>
      <p className="mb-4">
        Dengan menggunakan layanan ini, Anda menyetujui untuk mematuhi semua aturan yang telah
        ditetapkan. Kami berhak untuk mengubah atau memperbarui ketentuan ini kapan saja tanpa
        pemberitahuan sebelumnya.
      </p>
      <p className="mb-4">
        Pengguna bertanggung jawab penuh atas aktivitas yang terjadi dalam akun mereka. Kami tidak
        bertanggung jawab atas kehilangan data, penyalahgunaan akses, atau kerusakan akibat
        penggunaan aplikasi ini.
      </p>
      <p className="mb-4">
        Layanan ini hanya diperuntukkan untuk keperluan sah dan legal. Segala bentuk pelanggaran
        hukum akan dikenakan tindakan sesuai dengan peraturan perundang-undangan yang berlaku.
      </p>
      <p className="mb-4">
        Jika Anda memiliki pertanyaan mengenai Ketentuan Layanan ini, silakan hubungi kami di{' '}
        <a href="mailto:admin@jakil.my.id" className="text-blue-600 underline">
          admin@jakil.my.id
        </a>.
      </p>
    </main>
  )
}

export default TermsOfServicePage