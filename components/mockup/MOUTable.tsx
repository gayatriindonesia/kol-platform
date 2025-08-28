'use client';

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

import { formatFileSize, formatDate, getStatusColor, getCategoryColor } from '@/utils/helpers';
import { Button } from '../ui/button';

interface MOUTableProps {
  mous: MOU[];
  onDownload: (mou: MOU) => void;
  onDelete: (id: string) => void;
}

export const MOUTable = ({ mous, onDownload, onDelete }: MOUTableProps) => {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              MOU Details
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Partner
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Upload Date
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Expiry Date
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {mous.map((mou) => (
            <tr key={mou.id} className="hover:bg-gray-50 transition-colors">
              <td className="px-6 py-4">
                <div className="flex flex-col">
                  <div className="text-sm font-medium text-gray-900">{mou.title}</div>
                  <div className="text-sm text-gray-500">{mou.fileName}</div>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getCategoryColor(mou.category)}`}>
                      {mou.category}
                    </span>
                    <span className="text-xs text-gray-500">{formatFileSize(mou.fileSize)}</span>
                  </div>
                  {mou.description && (
                    <div className="text-xs text-gray-500 mt-1 max-w-xs truncate">
                      {mou.description}
                    </div>
                  )}
                </div>
              </td>
              <td className="px-6 py-4">
                <div className="text-sm text-gray-900">{mou.partner}</div>
              </td>
              <td className="px-6 py-4">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(mou.status)}`}>
                  {mou.status}
                </span>
              </td>
              <td className="px-6 py-4 text-sm text-gray-500">
                {formatDate(mou.uploadDate)}
              </td>
              <td className="px-6 py-4 text-sm text-gray-500">
                {formatDate(mou.expiryDate)}
              </td>
              <td className="px-6 py-4 text-right text-sm font-medium">
                <div className="flex justify-end space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onDownload(mou)}
                    className="inline-flex items-center"
                  >
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Download
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onDelete(mou.id)}
                    className="inline-flex items-center text-red-600 hover:text-red-700 hover:bg-red-50 border-red-300"
                  >
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Delete
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};