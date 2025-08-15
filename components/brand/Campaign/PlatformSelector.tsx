"use client";

import { useEffect, useState } from "react";
import useCampaignAppStore from "@/storeCampaign";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  X, 
  Plus, 
  Trash2, 
  Users, 
  Smartphone, 
  CheckCircle2, 
  AlertCircle,
  Sparkles,
  Target
} from "lucide-react";
import { getAllPlatform } from "@/lib/platform.actions";
import { Platform, PlatformSelection } from "@/types/campaign";

const PlatformSelector = () => {
  const { formData, setDirectCampaignData } = useCampaignAppStore();
  const [platforms, setPlatforms] = useState<Platform[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Get selected platforms from formData or initialize with empty array
  const platformSelections = formData.direct?.platformSelections || [];

  // Fetch available platforms and services using server action
  useEffect(() => {
    const fetchPlatforms = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await getAllPlatform();
        
        // Transform the API response to match our Platform interface
        if (response.success && response.data) {
          const transformedData: Platform[] = response.data.map(platform => ({
            id: platform.id,
            name: platform.name,
            services: platform.services.map(service => ({
              id: service.id,
              name: service.name,
              description: service.description || undefined,
              type: service.type
            }))
          }));
          
          setPlatforms(transformedData);
        } else {
          setError("Failed to load platforms. Please try again.");
          console.error("Failed to fetch platforms:", response.error);
        }
      } catch (error) {
        setError("Network error. Please check your connection.");
        console.error("Error fetching platforms:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPlatforms();
  }, []);

  // Update the platform selections in the store
  const updatePlatformSelections = (newSelections: PlatformSelection[]) => {
    setDirectCampaignData({ platformSelections: newSelections });
  };

  // Handle platform change
  const handlePlatformChange = (index: number, platformId: string) => {
    const platform = platforms.find((p) => p.id === platformId);
    const newSelections = [...platformSelections];
    
    newSelections[index] = {
      ...newSelections[index],
      platformId,
      platformName: platform?.name || "",
      serviceId: "", // Reset service when platform changes
      serviceName: ""
    };
    
    updatePlatformSelections(newSelections);
  };

  // Handle service change
  const handleServiceChange = (index: number, serviceId: string) => {
    const platform = platforms.find((p) => p.id === platformSelections[index].platformId);
    const service = platform?.services.find((s) => s.id === serviceId);
    
    const newSelections = [...platformSelections];
    newSelections[index] = {
      ...newSelections[index],
      serviceId,
      serviceName: service?.name || ""
    };
    
    updatePlatformSelections(newSelections);
  };

  // Handle followers change
  const handleFollowerChange = (index: number, follower: string) => {
    const newSelections = [...platformSelections];
    newSelections[index] = {
      ...newSelections[index],
      follower
    };
    
    updatePlatformSelections(newSelections);
  };

  // Add a new platform selection
  const addPlatformSelection = () => {
    updatePlatformSelections([
      ...platformSelections,
      {
        platformId: "",
        platformName: "",
        serviceId: "",
        serviceName: "",
        follower: "",
      }
    ]);
  };

  // Remove a platform selection
  const removePlatformSelection = (index: number) => {
    const newSelections = platformSelections.filter((_, i) => i !== index);
    updatePlatformSelections(newSelections);
  };

  // Remove all platform selections
  const removeAllPlatformSelections = () => {
    updatePlatformSelections([]);
  };

  // Check if a selection is complete
  const isSelectionComplete = (selection: PlatformSelection) => {
    return selection.platformId && selection.serviceId && selection.follower;
  };

  // Format follower count for display
  const formatFollowerCount = (count: string) => {
    const num = parseInt(count);
    if (isNaN(num)) return count;
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="text-center space-y-4">
          <Skeleton className="h-8 w-48 mx-auto" />
          <Skeleton className="h-4 w-64 mx-auto" />
        </div>
        {[1, 2].map((i) => (
          <Card key={i} className="border-0 shadow-sm">
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-0 shadow-sm bg-red-50">
        <CardContent className="text-center py-8">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-red-800 mb-2">Error Loading Platforms</h3>
          <p className="text-red-600 mb-4">{error}</p>
          <Button 
            onClick={() => window.location.reload()} 
            className="bg-red-600 hover:bg-red-700"
          >
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center space-x-3">
          <div className="p-3 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full">
            <Smartphone className="h-8 w-8 text-blue-600" />
          </div>
          <div>
            <h3 className="text-3xl font-bold text-gray-900">Platform Selection</h3>
            <p className="text-gray-600 mt-1">Choose platforms and define your targeting criteria</p>
          </div>
        </div>
        <div className="flex items-center justify-center space-x-4">
          <Badge className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-4 py-1">
            Step 4 of 8
          </Badge>
          {platformSelections.length > 0 && (
            <Badge variant="secondary" className="bg-green-100 text-green-700">
              {platformSelections.length} Platform{platformSelections.length > 1 ? 's' : ''} Selected
            </Badge>
          )}
        </div>
      </div>

      {/* Platform Selections */}
      {platformSelections.length === 0 ? (
        <Card className="border-0 shadow-lg bg-gradient-to-r from-gray-50 to-slate-50">
          <CardContent className="text-center py-12">
            <div className="space-y-4">
              <div className="p-4 bg-gray-100 rounded-full w-20 h-20 mx-auto flex items-center justify-center">
                <Target className="h-10 w-10 text-gray-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Platforms Selected</h3>
                <p className="text-gray-600 mb-6">Start by adding your first platform to target your audience</p>
                <Button 
                  onClick={addPlatformSelection}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add First Platform
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {platformSelections.map((selection, idx) => {
            const isComplete = isSelectionComplete(selection);
            const selectedPlatform = platforms.find(p => p.id === selection.platformId);
            
            return (
              <Card 
                key={idx} 
                className={`border-0 shadow-lg transition-all duration-300 hover:shadow-xl ${
                  isComplete 
                    ? 'bg-gradient-to-r from-green-50 to-emerald-50' 
                    : 'bg-gradient-to-r from-blue-50 to-indigo-50'
                }`}
              >
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-lg ${
                        isComplete ? 'bg-green-100' : 'bg-blue-100'
                      }`}>
                        <Smartphone className={`h-5 w-5 ${
                          isComplete ? 'text-green-600' : 'text-blue-600'
                        }`} />
                      </div>
                      <div>
                        <CardTitle className="text-lg text-gray-900">
                          Platform {idx + 1}
                          {selection.platformName && (
                            <span className="text-base font-normal text-gray-600 ml-2">
                              - {selection.platformName}
                            </span>
                          )}
                        </CardTitle>
                        <CardDescription className="text-sm">
                          Configure platform targeting and requirements
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {isComplete && (
                        <Badge className="bg-green-100 text-green-700 border-green-200">
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          Complete
                        </Badge>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removePlatformSelection(idx)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <div className="grid gap-6 md:grid-cols-3">
                    {/* Platform Selection */}
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-700">
                        Platform
                      </Label>
                      <Select
                        value={selection.platformId}
                        onValueChange={(value) => handlePlatformChange(idx, value)}
                      >
                        <SelectTrigger className="bg-white border-2 focus:border-blue-500">
                          <SelectValue placeholder="Choose platform" />
                        </SelectTrigger>
                        <SelectContent>
                          {platforms.map((platform) => (
                            <SelectItem key={platform.id} value={platform.id}>
                              <div className="flex items-center space-x-2">
                                <span>{platform.name}</span>
                                <Badge variant="secondary" className="text-xs">
                                  {platform.services.length} services
                                </Badge>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Service Selection */}
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-700">
                        Service Type
                      </Label>
                      <Select
                        value={selection.serviceId}
                        onValueChange={(value) => handleServiceChange(idx, value)}
                        disabled={!selection.platformId}
                      >
                        <SelectTrigger className="bg-white border-2 focus:border-blue-500">
                          <SelectValue placeholder="Choose service" />
                        </SelectTrigger>
                        <SelectContent>
                          {selectedPlatform?.services.map((service) => (
                            <SelectItem key={service.id} value={service.id}>
                              <div className="flex flex-col items-start">
                                <Badge variant="outline" className="text-xs mt-1">
                                  {service.type}
                                </Badge>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Followers Input */}
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-700 flex items-center space-x-1">
                        <Users className="h-4 w-4" />
                        <span>Minimum Followers</span>
                      </Label>
                      <div className="relative">
                        <Input
                          type="number"
                          value={selection.follower}
                          onChange={(e) => handleFollowerChange(idx, e.target.value)}
                          placeholder="e.g. 10000"
                          className="bg-white border-2 focus:border-blue-500"
                        />
                        {selection.follower && (
                          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                            <Badge variant="secondary" className="text-xs">
                              {formatFollowerCount(selection.follower)}
                            </Badge>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Selection Summary */}
                  {isComplete && (
                    <div className="mt-4 p-4 bg-white/70 rounded-lg border border-green-200">
                      <div className="flex items-center space-x-2 text-sm text-green-800">
                        <CheckCircle2 className="h-4 w-4" />
                        <span>
                          Targeting <strong>{selection.platformName}</strong> • 
                          <strong> {selection.serviceName}</strong> • 
                          Min <strong>{formatFollowerCount(selection.follower)} followers</strong>
                        </span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-4 justify-center">
        <Button 
          onClick={addPlatformSelection}
          className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Platform
        </Button>
        
        {platformSelections.length > 0 && (
          <Button 
            variant="outline"
            onClick={removeAllPlatformSelections}
            className="border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Clear All
          </Button>
        )}
      </div>

      {/* Summary Card */}
      {platformSelections.length > 0 && (
        <Card className="border-0 shadow-lg bg-gradient-to-r from-purple-50 to-pink-50">
          <CardHeader>
            <CardTitle className="text-lg text-gray-900 flex items-center space-x-2">
              <Sparkles className="h-5 w-5 text-purple-600" />
              <span>Platform Summary</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-700">Total Platforms</p>
                <p className="text-2xl font-bold text-purple-700">
                  {platformSelections.length}
                </p>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-700">Completed Selections</p>
                <p className="text-2xl font-bold text-green-600">
                  {platformSelections.filter(isSelectionComplete).length}
                </p>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-700">Progress</p>
                <div className="flex items-center space-x-2">
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full transition-all duration-300"
                      style={{ 
                        width: `${(platformSelections.filter(isSelectionComplete).length / Math.max(platformSelections.length, 1)) * 100}%` 
                      }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium text-gray-600">
                    {Math.round((platformSelections.filter(isSelectionComplete).length / Math.max(platformSelections.length, 1)) * 100)}%
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PlatformSelector;