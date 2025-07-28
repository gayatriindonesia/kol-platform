import React from 'react'

const PrivacyPolicyPage = () => {
  return (
    <main className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold mb-6">Kebijakan Privasi</h1>
      <p className="mb-4">
        Aplikasi ini menghormati dan melindungi privasi setiap pengguna. Informasi pribadi yang
        dikumpulkan, seperti nama, alamat email, atau informasi media sosial, hanya digunakan
        untuk keperluan otentikasi dan personalisasi layanan.
      </p>
      <p className="mb-4">
        Kami tidak akan membagikan informasi pribadi Anda kepada pihak ketiga tanpa izin, kecuali
        diwajibkan oleh hukum. Semua data dikumpulkan dan disimpan dengan standar keamanan tinggi.
      </p>
      <p className="mb-4">
        Jika Anda memiliki pertanyaan terkait kebijakan privasi ini, silakan hubungi kami di{' '}
        <a href="mailto:admin@jakil.my.id" className="text-blue-600 underline">
          admin@jakil.my.id
        </a>.
      </p>
    </main>
  )
}

export default PrivacyPolicyPage