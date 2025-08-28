interface MOU {
  id: string;
  title: string;
  fileName: string;
  fileSize: number;
  uploadDate: string;
  status: 'active' | 'expired' | 'pending';
  partner: string;
  expiryDate: string;
  category: 'partnership' | 'collaboration' | 'service' | 'research';
  description?: string;
}


export const dummyMOUs: MOU[] = [
  {
    id: '1',
    title: 'Kerjasama Teknologi Digital',
    fileName: 'mou-tech-digital-2024.pdf',
    fileSize: 2048576,
    uploadDate: '2024-01-15',
    status: 'active',
    partner: 'PT Teknologi Indonesia',
    expiryDate: '2025-01-15',
    category: 'partnership',
    description: 'MOU kerjasama pengembangan teknologi digital dan inovasi'
  },
  {
    id: '2',
    title: 'Kerjasama Penelitian AI',
    fileName: 'mou-research-ai-2024.pdf',
    fileSize: 1536000,
    uploadDate: '2024-02-20',
    status: 'active',
    partner: 'Universitas Indonesia',
    expiryDate: '2025-02-20',
    category: 'research',
    description: 'MOU kerjasama penelitian artificial intelligence dan machine learning'
  },
  {
    id: '3',
    title: 'Kerjasama Layanan Cloud',
    fileName: 'mou-cloud-service-2023.pdf',
    fileSize: 1024000,
    uploadDate: '2023-06-10',
    status: 'expired',
    partner: 'CloudTech Solutions',
    expiryDate: '2024-06-10',
    category: 'service',
    description: 'MOU penyediaan layanan cloud computing dan infrastruktur'
  },
  {
    id: '4',
    title: 'Kolaborasi Startup Inkubator',
    fileName: 'mou-startup-incubator-2024.pdf',
    fileSize: 3072000,
    uploadDate: '2024-03-05',
    status: 'pending',
    partner: 'Startup Hub Indonesia',
    expiryDate: '2025-03-05',
    category: 'collaboration',
    description: 'MOU kolaborasi program inkubator startup teknologi'
  }
];