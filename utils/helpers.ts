export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('id-ID', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

export const getStatusColor = (status: string): string => {
  switch (status) {
    case 'active': return 'bg-green-100 text-green-800';
    case 'expired': return 'bg-red-100 text-red-800';
    case 'pending': return 'bg-yellow-100 text-yellow-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

export const getCategoryColor = (category: string): string => {
  switch (category) {
    case 'partnership': return 'bg-blue-100 text-blue-800';
    case 'collaboration': return 'bg-purple-100 text-purple-800';
    case 'service': return 'bg-indigo-100 text-indigo-800';
    case 'research': return 'bg-teal-100 text-teal-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};