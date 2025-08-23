'use client';

import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { FileText, Clock, CheckCircle, AlertTriangle, Send } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { requestMOUCreation } from '@/lib/mou.actions';

interface MOURequestComponentProps {
  campaign: {
    id: string;
    name: string;
    status: string;
    mouRequired: boolean;
    canStartWithoutMOU: boolean;
    mou?: {
      id: string;
      status: string;
      brandApprovalStatus: string;
      influencerApprovalStatus: string;
      adminApprovalStatus: string;
    } | null;
    CampaignInvitation?: Array<{
      id: string;
      campaignId: string;
      influencerId: string;
      status: string;
      message?: string | null;
      responseMessage?: string | null;
      invitedAt: Date;
      respondedAt?: Date | null;
      brandId: string;
      createdAt: Date;
      updatedAt: Date;
      mouCreationRequested?: boolean;
      mouCreatedAt?: Date | null;
      mouCreatedBy?: string | null;
      influencer: {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        user: {
          id: string;
          name: string | null;
          email: string | null;
        };
      };
    }>;
  };
  userRole: 'BRAND' | 'INFLUENCER' | 'ADMIN';
  userId: string;
}

const MOURequestComponent: React.FC<MOURequestComponentProps> = ({
  campaign,
  userRole,
}) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [urgentRequest, setUrgentRequest] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Compute MOU request status from campaign data
  const mouRequestStatus = useMemo(() => {
    const hasMOU = !!campaign.mou;
    const mouCreationRequested = campaign.CampaignInvitation?.some(invitation => 
      invitation.mouCreationRequested
    ) || false;
    
    // Determine if MOU is fully signed (all parties approved)
    const isFullySigned = hasMOU && campaign.mou && 
      campaign.mou.brandApprovalStatus === 'APPROVED' &&
      campaign.mou.influencerApprovalStatus === 'APPROVED' &&
      campaign.mou.adminApprovalStatus === 'APPROVED';

    // Determine if user can request MOU
    const canRequestMOU = campaign.mouRequired && 
      !hasMOU && 
      !mouCreationRequested &&
      campaign.status !== 'COMPLETED' &&
      campaign.status !== 'CANCELLED';

    return {
      hasMOU,
      mouCreationRequested,
      canRequestMOU,
      canStartWithoutMOU: campaign.canStartWithoutMOU,
      mouStatus: campaign.mou?.status || null,
      isFullySigned
    };
  }, [campaign]);

  // Get the appropriate invitation
  const relevantInvitation = campaign.CampaignInvitation?.[0];

  const handleMOURequest = async () => {
    if (!relevantInvitation) {
      toast({
        title: "Error",
        description: "No valid invitation found for this campaign",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    try {
      const result = await requestMOUCreation({
        campaignId: campaign.id,
        invitationId: relevantInvitation.id,
        message: message.trim() || undefined,
        urgentRequest: urgentRequest && userRole === 'ADMIN'
      });

      if (result.success) {
        toast({
          title: "Success",
          description: result.message,
        });
        setIsDialogOpen(false);
        setMessage('');
        setUrgentRequest(false);
        // Optionally refresh the page or update local state
        window.location.reload();
      } else {
        toast({
          title: "Error",
          description: result.message,
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error requesting MOU:', error);
      toast({
        title: "Error",
        description: "Failed to request MOU creation",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getMOUStatusBadge = () => {
    const { hasMOU, mouCreationRequested, isFullySigned } = mouRequestStatus;

    if (hasMOU && isFullySigned) {
      return (
        <Badge variant="default" className="bg-green-100 text-green-800 border-green-300">
          <CheckCircle className="w-3 h-3 mr-1" />
          MOU Fully Signed
        </Badge>
      );
    }

    if (hasMOU && !isFullySigned) {
      return (
        <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 border-yellow-300">
          <Clock className="w-3 h-3 mr-1" />
          Pending Signatures
        </Badge>
      );
    }

    if (mouCreationRequested) {
      return (
        <Badge variant="secondary" className="bg-blue-100 text-blue-800 border-blue-300">
          <Clock className="w-3 h-3 mr-1" />
          MOU Requested
        </Badge>
      );
    }

    return (
      <Badge variant="outline" className="bg-gray-100 text-gray-800 border-gray-300">
        <AlertTriangle className="w-3 h-3 mr-1" />
        No MOU
      </Badge>
    );
  };

  const canRequestMOU = mouRequestStatus.canRequestMOU && 
    (userRole === 'BRAND' || userRole === 'INFLUENCER' || userRole === 'ADMIN');

  const showUrgentOption = userRole === 'ADMIN' && campaign.status === 'ACTIVE';

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="w-5 h-5" />
          MOU Status
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Current Status:</span>
          {getMOUStatusBadge()}
        </div>

        {mouRequestStatus.canStartWithoutMOU && (
          <Alert className="bg-yellow-50 border-yellow-200">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription className="text-yellow-800">
              This campaign can start without MOU (urgent approval granted)
            </AlertDescription>
          </Alert>
        )}

        {relevantInvitation?.mouCreationRequested && relevantInvitation?.mouCreatedAt && (
          <div className="text-sm text-gray-600">
            <p>MOU requested on: {new Date(relevantInvitation.mouCreatedAt).toLocaleDateString()}</p>
          </div>
        )}

        {canRequestMOU && (
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="w-full">
                <Send className="w-4 h-4 mr-2" />
                Request MOU Creation
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Request MOU Creation</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="message">Message (Optional)</Label>
                  <Textarea
                    id="message"
                    placeholder="Add any specific requirements or notes for the MOU..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="mt-1"
                    rows={3}
                  />
                </div>

                {showUrgentOption && (
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="urgent"
                      checked={urgentRequest}
                      onCheckedChange={(checked) => setUrgentRequest(checked as boolean)}
                    />
                    <Label htmlFor="urgent" className="text-sm">
                      Mark as urgent (allow campaign to start without MOU)
                    </Label>
                  </div>
                )}

                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    This will notify the admin to create an MOU for this campaign. 
                    Both parties will need to sign the MOU once it&apos;s created.
                  </AlertDescription>
                </Alert>

                <div className="flex gap-2">
                  <Button
                    onClick={handleMOURequest}
                    disabled={isLoading}
                    className="flex-1"
                  >
                    {isLoading ? (
                      <>
                        <Clock className="w-4 h-4 mr-2 animate-spin" />
                        Requesting...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        Request MOU
                      </>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                    disabled={isLoading}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}

        {!canRequestMOU && !mouRequestStatus.hasMOU && !mouRequestStatus.mouCreationRequested && (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              You don&apos;t have permission to request MOU for this campaign.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};

export default MOURequestComponent;