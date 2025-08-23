import { db } from "@/lib/db";

export interface CampaignMetricsData {
  reachRate: number;
  engagementRate: number;
  responseRate: number;
  completionRate: number;
  onTimeDeliveryRate: number;
  rawData: {
    totalReach: number;
    totalImpressions: number;
    totalEngagements: number;
    totalInvitations: number;
    totalResponses: number;
    totalDeliverables: number;
    completedDeliverables: number;
    onTimeDeliveries: number;
    lateDeliveries: number;
  };
}

export class CampaignMetricsService {
  
  async calculateCampaignMetrics(campaignId: string): Promise<CampaignMetricsData> {
    // 1. Hitung Reach Rate
    const reachData = await this.calculateReachMetrics(campaignId);
    
    // 2. Hitung Engagement Rate  
    const engagementData = await this.calculateEngagementMetrics(campaignId);
    
    // 3. Hitung Response Rate
    const responseData = await this.calculateResponseMetrics(campaignId);
    
    // 4. Hitung Completion Rate
    const completionData = await this.calculateCompletionMetrics(campaignId);
    
    // 5. Hitung On-Time Delivery Rate
    const deliveryData = await this.calculateDeliveryMetrics(campaignId);

    const metrics: CampaignMetricsData = {
      reachRate: reachData.reachRate,
      engagementRate: engagementData.engagementRate, 
      responseRate: responseData.responseRate,
      completionRate: completionData.completionRate,
      onTimeDeliveryRate: deliveryData.onTimeDeliveryRate,
      rawData: {
        totalReach: reachData.totalReach,
        totalImpressions: reachData.totalImpressions,
        totalEngagements: engagementData.totalEngagements,
        totalInvitations: responseData.totalInvitations,
        totalResponses: responseData.totalResponses,
        totalDeliverables: completionData.totalDeliverables,
        completedDeliverables: completionData.completedDeliverables,
        onTimeDeliveries: deliveryData.onTimeDeliveries,
        lateDeliveries: deliveryData.lateDeliveries,
      }
    };

    // Simpan ke CampaignPerformance table
    await this.saveCampaignPerformance(campaignId, metrics);

    return metrics;
  }

  private async calculateReachMetrics(campaignId: string) {
    // Ambil semua submission dari campaign ini
    const submissions = await db.deliverableSubmission.findMany({
      where: {
        deliverable: {
          campaignId: campaignId
        }
      },
      select: {
        reachCount: true,
        impressions: true,
      }
    });

    const totalReach = submissions.reduce((sum, sub) => sum + (sub.reachCount || 0), 0);
    const totalImpressions = submissions.reduce((sum, sub) => sum + (sub.impressions || 0), 0);
    
    // Reach Rate = Total Reach / Total Impressions * 100
    const reachRate = totalImpressions > 0 ? (totalReach / totalImpressions) * 100 : 0;

    return {
      totalReach,
      totalImpressions, 
      reachRate
    };
  }

  private async calculateEngagementMetrics(campaignId: string) {
    const submissions = await db.deliverableSubmission.findMany({
      where: {
        deliverable: {
          campaignId: campaignId
        }
      },
      select: {
        engagementCount: true,
        reachCount: true,
      }
    });

    const totalEngagements = submissions.reduce((sum, sub) => sum + (sub.engagementCount || 0), 0);
    const totalReach = submissions.reduce((sum, sub) => sum + (sub.reachCount || 0), 0);
    
    // Engagement Rate = Total Engagements / Total Reach * 100
    const engagementRate = totalReach > 0 ? (totalEngagements / totalReach) * 100 : 0;

    return {
      totalEngagements,
      engagementRate
    };
  }

  private async calculateResponseMetrics(campaignId: string) {
    const invitations = await db.campaignInvitation.findMany({
      where: {
        campaignId: campaignId
      },
      select: {
        status: true,
        respondedAt: true,
      }
    });

    const totalInvitations = invitations.length;
    const totalResponses = invitations.filter(inv => 
      inv.respondedAt !== null || 
      ['ACTIVE', 'COMPLETED', 'REJECTED'].includes(inv.status)
    ).length;

    // Response Rate = Total Responses / Total Invitations * 100
    const responseRate = totalInvitations > 0 ? (totalResponses / totalInvitations) * 100 : 0;

    return {
      totalInvitations,
      totalResponses,
      responseRate
    };
  }

  private async calculateCompletionMetrics(campaignId: string) {
    const deliverables = await db.campaignDeliverable.findMany({
      where: {
        campaignId: campaignId
      },
      select: {
        status: true,
        requiredCount: true,
        deliveredCount: true,
      }
    });

    const totalDeliverables = deliverables.reduce((sum, del) => sum + del.requiredCount, 0);
    const completedDeliverables = deliverables.reduce((sum, del) => {
      if (del.status === 'COMPLETED' || del.status === 'APPROVED') {
        return sum + del.deliveredCount;
      }
      return sum;
    }, 0);

    // Completion Rate = Completed Deliverables / Total Deliverables * 100
    const completionRate = totalDeliverables > 0 ? (completedDeliverables / totalDeliverables) * 100 : 0;

    return {
      totalDeliverables,
      completedDeliverables,
      completionRate
    };
  }

  private async calculateDeliveryMetrics(campaignId: string) {
    const deliverables = await db.campaignDeliverable.findMany({
      where: {
        campaignId: campaignId,
        status: {
          in: ['COMPLETED', 'APPROVED']
        }
      },
      include: {
        submissions: {
          where: {
            approvedAt: {
              not: null
            }
          },
          select: {
            submittedAt: true,
          }
        }
      }
    });

    let onTimeDeliveries = 0;
    let lateDeliveries = 0;

    deliverables.forEach(deliverable => {
      deliverable.submissions.forEach(submission => {
        if (submission.submittedAt <= deliverable.dueDate) {
          onTimeDeliveries++;
        } else {
          lateDeliveries++;
        }
      });
    });

    const totalDeliveries = onTimeDeliveries + lateDeliveries;
    
    // On-Time Delivery Rate = On-Time Deliveries / Total Deliveries * 100
    const onTimeDeliveryRate = totalDeliveries > 0 ? (onTimeDeliveries / totalDeliveries) * 100 : 0;

    return {
      onTimeDeliveries,
      lateDeliveries,
      onTimeDeliveryRate
    };
  }

  private async saveCampaignPerformance(campaignId: string, metrics: CampaignMetricsData) {
    await db.campaignPerformance.upsert({
      where: {
        campaignId: campaignId
      },
      update: {
        totalReach: metrics.rawData.totalReach,
        totalImpressions: metrics.rawData.totalImpressions,
        avgReachRate: metrics.reachRate,
        totalEngagements: metrics.rawData.totalEngagements,
        avgEngagementRate: metrics.engagementRate,
        totalInvitations: metrics.rawData.totalInvitations,
        totalResponses: metrics.rawData.totalResponses,
        responseRate: metrics.responseRate,
        totalDeliverables: metrics.rawData.totalDeliverables,
        completedDeliverables: metrics.rawData.completedDeliverables,
        completionRate: metrics.completionRate,
        onTimeDeliveries: metrics.rawData.onTimeDeliveries,
        lateDeliveries: metrics.rawData.lateDeliveries,
        onTimeDeliveryRate: metrics.onTimeDeliveryRate,
      },
      create: {
        campaignId: campaignId,
        totalReach: metrics.rawData.totalReach,
        totalImpressions: metrics.rawData.totalImpressions,
        avgReachRate: metrics.reachRate,
        totalEngagements: metrics.rawData.totalEngagements,
        avgEngagementRate: metrics.engagementRate,
        totalInvitations: metrics.rawData.totalInvitations,
        totalResponses: metrics.rawData.totalResponses,
        responseRate: metrics.responseRate,
        totalDeliverables: metrics.rawData.totalDeliverables,
        completedDeliverables: metrics.rawData.completedDeliverables,
        completionRate: metrics.completionRate,
        onTimeDeliveries: metrics.rawData.onTimeDeliveries,
        lateDeliveries: metrics.rawData.lateDeliveries,
        onTimeDeliveryRate: metrics.onTimeDeliveryRate,
      }
    });
  }

  // Method untuk get metrics yang sudah tersimpan
  async getCampaignMetrics(campaignId: string): Promise<CampaignMetricsData | null> {
    const performance = await db.campaignPerformance.findUnique({
      where: {
        campaignId: campaignId
      }
    });

    if (!performance) return null;

    return {
      reachRate: performance.avgReachRate,
      engagementRate: performance.avgEngagementRate,
      responseRate: performance.responseRate,
      completionRate: performance.completionRate,
      onTimeDeliveryRate: performance.onTimeDeliveryRate,
      rawData: {
        totalReach: performance.totalReach,
        totalImpressions: performance.totalImpressions,
        totalEngagements: performance.totalEngagements,
        totalInvitations: performance.totalInvitations,
        totalResponses: performance.totalResponses,
        totalDeliverables: performance.totalDeliverables,
        completedDeliverables: performance.completedDeliverables,
        onTimeDeliveries: performance.onTimeDeliveries,
        lateDeliveries: performance.lateDeliveries,
      }
    };
  }
}