"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, Calendar, CheckCircle, XCircle, AlertCircle, RefreshCw } from 'lucide-react';

interface Campaign {
    id: string;
    name?: string;
    status?: string;
    startDate?: string | Date;
    endDate?: string | Date;
    updatedAt?: string | Date;
}

interface CampaignStatusIndicatorProps {
    campaign: Campaign;
    onStatusUpdate?: (newStatus: string) => void;
}

const CampaignStatusIndicator: React.FC<CampaignStatusIndicatorProps> = ({ 
    campaign, 
    onStatusUpdate 
}) => {
    const [currentStatus, setCurrentStatus] = useState(campaign.status || 'PENDING');
    const [timeRemaining, setTimeRemaining] = useState<string>('');
    const [isExpired, setIsExpired] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);

    // Function untuk menghitung waktu tersisa
    const calculateTimeRemaining = () => {
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
    };

    // Update countdown setiap menit
    useEffect(() => {
        const updateCountdown = () => {
            const remaining = calculateTimeRemaining();
            setTimeRemaining(remaining);
            
            // Jika campaign berakhir dan statusnya masih ACTIVE, update status
            if (isExpired && currentStatus === 'ACTIVE') {
                setCurrentStatus('COMPLETE');
                onStatusUpdate?.('COMPLETE');
            }
        };

        updateCountdown();
        const interval = setInterval(updateCountdown, 60000); // Update setiap menit

        return () => clearInterval(interval);
    }, [campaign.endDate, isExpired, currentStatus, onStatusUpdate]);

    // Function untuk mendapatkan warna status
    const getStatusColor = (status: string) => {
        switch (status) {
            case 'PENDING': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'ACTIVE': return 'bg-green-100 text-green-800 border-green-200';
            case 'COMPLETE': return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'REJECTED': return 'bg-red-100 text-red-800 border-red-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    // Function untuk mendapatkan icon status
    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'PENDING': return <AlertCircle className="w-4 h-4" />;
            case 'ACTIVE': return <CheckCircle className="w-4 h-4" />;
            case 'COMPLETE': return <CheckCircle className="w-4 h-4" />;
            case 'REJECTED': return <XCircle className="w-4 h-4" />;
            default: return <Clock className="w-4 h-4" />;
        }
    };

    // Function untuk manual refresh status
    const handleRefreshStatus = async () => {
        setIsUpdating(true);
        try {
            // Simulasi API call untuk refresh status
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Check apakah campaign sudah berakhir
            if (campaign.endDate && new Date(campaign.endDate) < new Date()) {
                setCurrentStatus('COMPLETE');
                onStatusUpdate?.('COMPLETE');
            }
        } catch (error) {
            console.error('Error refreshing status:', error);
        } finally {
            setIsUpdating(false);
        }
    };

    return (
        <Card className="border-0 shadow-sm bg-white/50 backdrop-blur-sm">
            <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Status Campaign</h3>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleRefreshStatus}
                        disabled={isUpdating}
                        className="text-gray-600 hover:text-gray-900"
                    >
                        <RefreshCw className={`w-4 h-4 ${isUpdating ? 'animate-spin' : ''}`} />
                    </Button>
                </div>

                <div className="space-y-4">
                    {/* Status Badge */}
                    <div className="flex items-center gap-3">
                        <Badge 
                            variant="secondary" 
                            className={`${getStatusColor(currentStatus)} flex items-center gap-2 px-3 py-1`}
                        >
                            {getStatusIcon(currentStatus)}
                            <span className="font-medium">
                                {currentStatus === 'PENDING' && 'Menunggu'}
                                {currentStatus === 'ACTIVE' && 'Aktif'}
                                {currentStatus === 'COMPLETE' && 'Selesai'}
                                {currentStatus === 'REJECTED' && 'Ditolak'}
                            </span>
                        </Badge>
                    </div>

                    {/* Waktu Campaign */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {campaign.startDate && (
                            <div className="flex items-center gap-3 text-sm text-gray-600">
                                <Calendar className="w-4 h-4 text-green-600" />
                                <div>
                                    <span className="font-medium">Mulai:</span>
                                    <br />
                                    <span>{new Date(campaign.startDate).toLocaleDateString('id-ID', {
                                        weekday: 'long',
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                    })}</span>
                                </div>
                            </div>
                        )}

                        {campaign.endDate && (
                            <div className="flex items-center gap-3 text-sm text-gray-600">
                                <Calendar className="w-4 h-4 text-red-600" />
                                <div>
                                    <span className="font-medium">Berakhir:</span>
                                    <br />
                                    <span>{new Date(campaign.endDate).toLocaleDateString('id-ID', {
                                        weekday: 'long',
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                    })}</span>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Countdown Timer */}
                    {campaign.endDate && currentStatus === 'ACTIVE' && (
                        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4 border border-blue-200">
                            <div className="flex items-center gap-3">
                                <Clock className="w-5 h-5 text-blue-600" />
                                <div>
                                    <p className="text-sm font-medium text-blue-900">
                                        {isExpired ? 'Campaign Berakhir' : 'Waktu Tersisa'}
                                    </p>
                                    <p className={`text-lg font-bold ${isExpired ? 'text-red-600' : 'text-blue-600'}`}>
                                        {timeRemaining}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Status Complete Info */}
                    {currentStatus === 'COMPLETE' && (
                        <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-4 border border-green-200">
                            <div className="flex items-center gap-3">
                                <CheckCircle className="w-5 h-5 text-green-600" />
                                <div>
                                    <p className="text-sm font-medium text-green-900">Campaign Selesai</p>
                                    <p className="text-sm text-green-700">
                                        Campaign ini telah berakhir pada {campaign.endDate ? 
                                            new Date(campaign.endDate).toLocaleDateString('id-ID') : 
                                            'tanggal yang ditentukan'
                                        }
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Last Updated */}
                    {campaign.updatedAt && (
                        <div className="text-xs text-gray-500 text-center pt-2 border-t">
                            Terakhir diperbarui: {new Date(campaign.updatedAt).toLocaleString('id-ID')}
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
};

export default CampaignStatusIndicator;