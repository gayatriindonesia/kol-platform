"use client";
import useCampaignAppStore from "@/storeCampaign";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { FileText, Image, MessageSquare, Sparkles } from "lucide-react";

const EducationBackground = () => {
  const { formData, setEducationBackground } = useCampaignAppStore();
  
  const education = formData.direct?.educationBackground?.educations?.[0] || {
    platform: "",
    service: "",
    followers: "",
  };

  const handleFieldChange = (field: keyof typeof education, value: string) => {
    setEducationBackground({
      educations: [{
        ...education,
        [field]: value
      }]
    });
  };

  const campaignFields = [
    {
      id: 'platform',
      label: 'Pesan Utama & Tone of Voice',
      placeholder: 'Contoh: Nikmati kopi segar setiap pagi dengan cara yang praktis dan hemat!',
      icon: FileText,
      value: education.platform,
      description: 'Tone of Voice: Santai, hangat, dan ramah.',
      gradient: 'from-blue-50 to-indigo-50',
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600',
      borderColor: 'border-blue-200'
    },
    {
      id: 'service',
      label: 'Aturan & Larangan',
      placeholder: 'Contoh: Wajib menunjukkan produk dengan jelas',
      icon: Image,
      value: education.service,
      description: 'Tentukan standar visual dan persyaratan konten',
      gradient: 'from-purple-50 to-pink-50',
      iconBg: 'bg-purple-100',
      iconColor: 'text-purple-600',
      borderColor: 'border-purple-200'
    },
    {
      id: 'followers',
      label: 'Kebutuhan Konten',
      placeholder: 'Harus ada CTA (Call to Action) seperti “Coba sekarang” atau “Kunjungi link di bio.”...',
      icon: MessageSquare,
      value: education.followers,
      description: 'Tetapkan pedoman untuk konten dan pesan tertulis',
      gradient: 'from-green-50 to-emerald-50',
      iconBg: 'bg-green-100',
      iconColor: 'text-green-600',
      borderColor: 'border-green-200'
    }
  ];

  const getCharCount = (text: string) => text.length;
  const getWordCount = (text: string) => text.trim() ? text.trim().split(/\s+/).length : 0;

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center space-x-3">
          <div className="p-3 bg-gradient-to-br from-orange-100 to-red-100 rounded-full">
            <Sparkles className="h-8 w-8 text-orange-600" />
          </div>
          <div>
            <h3 className="text-3xl font-bold text-gray-900">Campaign Details</h3>
            <p className="text-gray-600 mt-1">Define your campaign requirements and guidelines</p>
          </div>
        </div>
        <Badge className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 py-1">
          Step 5 of 8
        </Badge>
      </div>
      

      {/* Campaign Fields */}
      <div className="grid gap-6 lg:grid-cols-1 xl:grid-cols-1">
        {campaignFields.map((field) => {
          const Icon = field.icon;
          const charCount = getCharCount(field.value);
          const wordCount = getWordCount(field.value);
          
          return (
            <Card 
              key={field.id}
              className={`border-0 shadow-lg transition-all duration-300 hover:shadow-xl bg-gradient-to-r ${field.gradient}`}
            >
              <CardHeader className="pb-4">
                <div className="flex items-start space-x-4">
                  <div className={`p-3 ${field.iconBg} rounded-lg flex-shrink-0`}>
                    <Icon className={`h-6 w-6 ${field.iconColor}`} />
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-xl text-gray-900 mb-2">
                      {field.label}
                    </CardTitle>
                    <CardDescription className="text-gray-600">
                      {field.description}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Label className="text-sm font-medium text-gray-700">
                    Persyaratan Konten
                  </Label>
                  <div className="relative">
                    <Textarea
                      value={field.value}
                      onChange={(e) => handleFieldChange(field.id as keyof typeof education, e.target.value)}
                      placeholder={field.placeholder}
                      className={`min-h-[120px] bg-white/70 border-2 ${field.borderColor} focus:border-opacity-50 focus:ring-4 focus:ring-opacity-20 transition-all duration-200 resize-none`}
                    />
                    
                    {/* Character and word count */}
                    <div className="flex justify-between items-center mt-3 text-sm text-gray-500">
                      <div className="flex space-x-4">
                        <span>{charCount} characters</span>
                        <span>{wordCount} words</span>
                      </div>
                      {charCount > 0 && (
                        <Badge 
                          variant="secondary" 
                          className={`${field.iconBg} ${field.iconColor} text-xs`}
                        >
                          {charCount < 100 ? 'Brief' : charCount < 300 ? 'Detailed' : 'Comprehensive'}
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  {/* Progress indicator */}
                  {field.value.length > 0 && (
                    <div className={`mt-4 p-3 bg-white/50 rounded-lg border ${field.borderColor}`}>
                      <div className="flex items-center space-x-2">
                        <div className={`h-2 w-2 ${field.iconBg} rounded-full`}></div>
                        <p className="text-sm text-gray-700 font-medium">
                          {field.label} completed
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Summary Card */}
      {(education.platform || education.service || education.followers) && (
        <Card className="border-0 shadow-lg bg-gradient-to-r from-slate-50 to-gray-50">
          <CardHeader>
            <CardTitle className="text-lg text-gray-900 flex items-center space-x-2">
              <FileText className="h-5 w-5 text-gray-600" />
              <span>Campaign Overview</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-700">Brief Status</p>
                <div className="flex items-center space-x-2">
                  <div className={`h-3 w-3 rounded-full ${
                    education.platform ? 'bg-green-500' : 'bg-gray-300'
                  }`}></div>
                  <span className="text-sm text-gray-600">
                    {education.platform ? 'Completed' : 'Pending'}
                  </span>
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-700">Visual Guidelines</p>
                <div className="flex items-center space-x-2">
                  <div className={`h-3 w-3 rounded-full ${
                    education.service ? 'bg-green-500' : 'bg-gray-300'
                  }`}></div>
                  <span className="text-sm text-gray-600">
                    {education.service ? 'Completed' : 'Pending'}
                  </span>
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-sm foStep 4 of 8nt-medium text-gray-700">Caption Rules</p>
                <div className="flex items-center space-x-2">
                  <div className={`h-3 w-3 rounded-full ${
                    education.followers ? 'bg-green-500' : 'bg-gray-300'
                  }`}></div>
                  <span className="text-sm text-gray-600">
                    {education.followers ? 'Completed' : 'Pending'}
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

export default EducationBackground;