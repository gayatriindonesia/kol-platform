'use client';

import { MOUTable } from '@/components/mockup/MOUTable';
import { UploadModal } from '@/components/mockup/UploadModal';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { dummyMOUs } from '@/utils/dummy-data';
import { useState, useEffect } from 'react';


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

export default function MOUManagement() {
  const [mous, setMOUs] = useState<MOU[]>([]);
  const [filteredMOUs, setFilteredMOUs] = useState<MOU[]>([]);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  useEffect(() => {
    // Load dummy data
    setMOUs(dummyMOUs);
    setFilteredMOUs(dummyMOUs);
  }, []);

  useEffect(() => {
    // Filter MOUs based on search term and filters
    let filtered = mous.filter(mou =>
      mou.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      mou.partner.toLowerCase().includes(searchTerm.toLowerCase()) ||
      mou.fileName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (statusFilter !== 'all') {
      filtered = filtered.filter(mou => mou.status === statusFilter);
    }

    if (categoryFilter !== 'all') {
      filtered = filtered.filter(mou => mou.category === categoryFilter);
    }

    setFilteredMOUs(filtered);
  }, [mous, searchTerm, statusFilter, categoryFilter]);

  const handleUpload = (newMOU: MOU) => {
    setMOUs(prev => [newMOU, ...prev]);
    // Simulate upload success
    console.log('MOU uploaded:', newMOU);
  };

  const handleDownload = (mou: MOU) => {
    // Simulate file download
    const blob = new Blob(['This is a dummy PDF content for ' + mou.title], { type: 'application/pdf' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.download = mou.fileName;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
    
    console.log('Downloaded:', mou.fileName);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus MOU ini?')) {
      setMOUs(prev => prev.filter(mou => mou.id !== id));
    }
  };

  const stats = {
    total: mous.length,
    active: mous.filter(m => m.status === 'active').length,
    expired: mous.filter(m => m.status === 'expired').length,
    pending: mous.filter(m => m.status === 'pending').length
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">MOU Management System</h1>
          <p className="text-gray-600">Kelola dan pantau semua surat MOU organisasi Anda dengan mudah</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600">Total MOU</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                </div>
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600">Active</p>
                  <p className="text-2xl font-bold text-green-600">{stats.active}</p>
                </div>
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600">Expired</p>
                  <p className="text-2xl font-bold text-red-600">{stats.expired}</p>
                </div>
                <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600">Pending</p>
                  <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
                </div>
                <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
              <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 flex-1">
                <div className="relative flex-1">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Cari MOU berdasarkan judul, partner, atau nama file..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>

                <select
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="all">Semua Status</option>
                  <option value="active">Active</option>
                  <option value="expired">Expired</option>
                  <option value="pending">Pending</option>
                </select>

                <select
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                >
                  <option value="all">Semua Kategori</option>
                  <option value="partnership">Partnership</option>
                  <option value="collaboration">Collaboration</option>
                  <option value="service">Service</option>
                  <option value="research">Research</option>
                </select>
              </div>

              <div className="flex space-x-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchTerm('');
                    setStatusFilter('all');
                    setCategoryFilter('all');
                  }}
                  className="whitespace-nowrap"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Reset Filter
                </Button>
                <Button
                  onClick={() => setIsUploadModalOpen(true)}
                  className="whitespace-nowrap"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Upload MOU
                </Button>
              </div>
            </div>

            {/* Results count */}
            <div className="mt-4 text-sm text-gray-600">
              Menampilkan {filteredMOUs.length} dari {mous.length} MOU
              {searchTerm && (
                <span> untuk pencarian &quot;{searchTerm}&quot;</span>
              )}
            </div>
          </CardContent>
        </Card>

        {/* MOU Table */}
        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold text-gray-900">Daftar MOU</h2>
          </CardHeader>
          <CardContent className="p-0">
            {filteredMOUs.length === 0 ? (
              <div className="text-center py-12">
                <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Tidak ada MOU ditemukan</h3>
                <p className="text-gray-500 mb-4">
                  {searchTerm || statusFilter !== 'all' || categoryFilter !== 'all' 
                    ? 'Tidak ada MOU yang sesuai dengan filter yang dipilih.'
                    : 'Belum ada MOU yang diupload. Mulai dengan mengupload MOU pertama Anda.'
                  }
                </p>
                {(!searchTerm && statusFilter === 'all' && categoryFilter === 'all') && (
                  <Button onClick={() => setIsUploadModalOpen(true)}>
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Upload MOU Pertama
                  </Button>
                )}
              </div>
            ) : (
              <MOUTable
                mous={filteredMOUs}
                onDownload={handleDownload}
                onDelete={handleDelete}
              />
            )}
          </CardContent>
        </Card>

        {/* Upload Modal */}
        <UploadModal
          isOpen={isUploadModalOpen}
          onClose={() => setIsUploadModalOpen(false)}
          onUpload={handleUpload}
        />

        {/* Footer */}
        <div className="mt-12 text-center">
          <div className="border-t border-gray-200 pt-8">
            <p className="text-sm text-gray-500">
              MOU Management System © 2024 - Sistem manajemen MOU yang profesional dan modern
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}