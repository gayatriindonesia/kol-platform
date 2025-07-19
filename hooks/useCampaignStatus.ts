// hooks/useCampaignStatus.ts
import { useState, useEffect, useCallback } from 'react';

interface Campaign {
    id: string;
    name?: string;
    status?: string;
    startDate?: string | Date;
    endDate?: string | Date;
    updatedAt?: string | Date;
}

interface UseCampaignStatusProps {
    campaign: Campaign;
    autoRefresh?: boolean;
    refreshInterval?: number; // dalam milidetik
}

interface UseCampaignStatusReturn {
    currentStatus: string;
    isExpired: boolean;
    timeRemaining: string;
    isUpdating: boolean;
    refreshStatus: () => Promise<void>;
    forceUpdate: (newStatus: string) => void;
}

export const useCampaignStatus = ({ 
    campaign, 
    autoRefresh = true, 
    refreshInterval = 300000 // 5 menit default
}: UseCampaignStatusProps): UseCampaignStatusReturn => {
    const [currentStatus, setCurrentStatus] = useState(campaign.status || 'PENDING');
    const [timeRemaining, setTimeRemaining] = useState<string>('');
    const [isExpired, setIsExpired] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);

    // Function untuk menghitung waktu tersisa
    const calculateTimeRemaining = useCallback(() => {
        if (!campaign.endDate) return '';
        
        const now = new Date();
        const endDate = new Date(campaign.endDate);
        const timeDiff = endDate.getTime() - now.getTime();
        
        if (timeDiff <= 0) {
            setIsExpired(true);
            return 'Campaign berakhir';
        }
        
        const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
        
        if (days > 0) {
            return `${days} hari ${hours} jam tersisa`;
        } else if (hours > 0) {
            return `${hours} jam ${minutes} menit tersisa`;
        } else {
            return `${minutes} menit tersisa`;
        }
    }, [campaign.endDate]);

    // Function untuk refresh status dari server
    const refreshStatus = useCallback(async () => {
        setIsUpdating(true);
        try {
            // Simulasi API call - ganti dengan actual API call
            const response = await fetch(`/api/campaigns/${campaign.id}/status`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ action: 'check_expiry' })
            });

            if (response.ok) {
                const data = await response.json();
                if (data.success && data.campaign) {
                    setCurrentStatus(data.campaign.status);
                }
            }
        } catch (error) {
            console.error('Error refreshing campaign status:', error);
        } finally {
            setIsUpdating(false);
        }
    }, [campaign.id]);

    // Function untuk force update status
    const forceUpdate = useCallback((newStatus: string) => {
        setCurrentStatus(newStatus);
    }, []);

    // Update countdown setiap menit
    useEffect(() => {
        const updateCountdown = () => {
            const remaining = calculateTimeRemaining();
            setTimeRemaining(remaining);
            
            // Jika campaign berakhir dan statusnya masih ACTIVE, update status
            if (isExpired && currentStatus === 'ACTIVE') {
                setCurrentStatus('COMPLETE');
            }
        };

        updateCountdown();
        const interval = setInterval(updateCountdown, 60000); // Update setiap menit

        return () => clearInterval(interval);
    }, [calculateTimeRemaining, isExpired, currentStatus]);

    // Auto refresh status dari server
    useEffect(() => {
        if (!autoRefresh) return;

        const interval = setInterval(() => {
            refreshStatus();
        }, refreshInterval);

        return () => clearInterval(interval);
    }, [autoRefresh, refreshInterval, refreshStatus]);

    // Initial check saat component mount
    useEffect(() => {
        if (campaign.endDate && new Date(campaign.endDate) < new Date()) {
            setIsExpired(true);
            if (currentStatus === 'ACTIVE') {
                setCurrentStatus('COMPLETE');
            }
        }
    }, [campaign.endDate, currentStatus]);

    return {
        currentStatus,
        isExpired,
        timeRemaining,
        isUpdating,
        refreshStatus,
        forceUpdate
    };
};

// Utility function untuk format status
export const formatCampaignStatus = (status: string): string => {
    switch (status) {
        case 'PENDING': return 'Menunggu';
        case 'ACTIVE': return 'Aktif';
        case 'COMPLETE': return 'Selesai';
        case 'REJECTED': return 'Ditolak';
        default: return status;
    }
};

// Utility function untuk mendapatkan warna status
export const getStatusColor = (status: string): string => {
    switch (status) {
        case 'PENDING': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
        case 'ACTIVE': return 'bg-green-100 text-green-800 border-green-200';
        case 'COMPLETE': return 'bg-blue-100 text-blue-800 border-blue-200';
        case 'REJECTED': return 'bg-red-100 text-red-800 border-red-200';
        default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
};

// Utility function untuk cek apakah campaign aktif
export const isCampaignActive = (campaign: Campaign): boolean => {
    if (!campaign.startDate || !campaign.endDate) return false;
    
    const now = new Date();
    const startDate = new Date(campaign.startDate);
    const endDate = new Date(campaign.endDate);
    
    return now >= startDate && now <= endDate && campaign.status === 'ACTIVE';
};

// Utility function untuk cek apakah campaign berakhir
export const isCampaignExpired = (campaign: Campaign): boolean => {
    if (!campaign.endDate) return false;
    
    const now = new Date();
    const endDate = new Date(campaign.endDate);
    
    return now > endDate;
};