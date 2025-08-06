"use client";

import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Star, TrendingUp, Award, Users } from 'lucide-react';

interface Client {
  id: number;
  name: string;
  logo: string;
  industry: string;
  description: string;
  results: {
    metric: string;
    value: string;
    improvement: string;
  }[];
  testimonial?: string;
  author?: string;
  position?: string;
  rating?: number;
  campaignType: string;
  featured?: boolean;
}

interface PartnershipClientsSectionProps {
  clients?: Client[];
}

const PartnershipClientsSection: React.FC<PartnershipClientsSectionProps> = ({ 
  clients = defaultClients 
}) => {
  const [activeTab, setActiveTab] = useState('all');
  const [currentSlide, setCurrentSlide] = useState(0);
  
  const industries = ['all', 'beauty', 'fashion', 'tech', 'food', 'gaming', 'lifestyle'];
  
  const filteredClients = activeTab === 'all' 
    ? clients 
    : clients.filter(client => client.industry.toLowerCase() === activeTab);

  const featuredClients = clients.filter(client => client.featured);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % featuredClients.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [featuredClients.length]);

  return (
    <section id="clients" className="py-24 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-6 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-20">
          <span className="inline-block px-4 py-2 bg-orange-500/20 backdrop-blur-sm rounded-full text-orange-300 text-sm font-medium mb-6 border border-orange-400/30">
            <Award className="w-4 h-4 inline mr-2" />
            Our Partners
          </span>
          <h2 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-white via-blue-100 to-purple-200 bg-clip-text text-transparent">
            Trusted by Industry Leaders
          </h2>
          <p className="text-xl text-slate-400 max-w-3xl mx-auto leading-relaxed">
            We've partnered with leading brands across industries to deliver exceptional influencer marketing campaigns that drive real business results.
          </p>
        </div>

        {/* Featured Client Carousel */}
        <div className="mb-20">
          <h3 className="text-2xl font-bold text-white mb-8 text-center">Featured Success Stories</h3>
          <div className="relative">
            <div className="overflow-hidden rounded-3xl">
              <div 
                className="flex transition-transform duration-700 ease-in-out"
                style={{ transform: `translateX(-${currentSlide * 100}%)` }}
              >
                {featuredClients.map((client, index) => (
                  <div key={client.id} className="w-full flex-shrink-0">
                    <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-sm p-8 md:p-12 rounded-3xl border border-slate-700/50">
                      <div className="grid lg:grid-cols-2 gap-12 items-center">
                        {/* Client Info */}
                        <div>
                          <div className="flex items-center mb-6">
                            <img 
                              src={client.logo} 
                              alt={client.name}
                              className="w-16 h-16 rounded-2xl object-cover mr-4 border border-slate-600"
                            />
                            <div>
                              <h4 className="text-2xl font-bold text-white">{client.name}</h4>
                              <p className="text-blue-400 font-medium">{client.industry}</p>
                            </div>
                          </div>

                          <p className="text-slate-300 text-lg mb-8 leading-relaxed">
                            {client.description}
                          </p>

                          {client.testimonial && (
                            <blockquote className="border-l-4 border-blue-500 pl-6 mb-6">
                              <p className="text-slate-200 italic text-lg mb-4">
                                "{client.testimonial}"
                              </p>
                              <footer className="text-slate-400">
                                <strong className="text-white">{client.author}</strong>
                                <span className="mx-2">•</span>
                                {client.position}
                              </footer>
                            </blockquote>
                          )}

                          <div className="flex items-center space-x-2">
                            {[...Array(5)].map((_, i) => (
                              <Star 
                                key={i} 
                                className={`w-5 h-5 ${
                                  i < (client.rating || 5) 
                                    ? 'text-yellow-400 fill-current' 
                                    : 'text-slate-600'
                                }`} 
                              />
                            ))}
                            <span className="text-slate-400 ml-2">({client.rating || 5}.0)</span>
                          </div>
                        </div>

                        {/* Results */}
                        <div>
                          <h5 className="text-xl font-bold text-white mb-6">Campaign Results</h5>
                          <div className="grid gap-6">
                            {client.results.map((result, idx) => (
                              <div key={idx} className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700/30">
                                <div className="flex items-center justify-between mb-2">
                                  <span className="text-slate-400 text-sm">{result.metric}</span>
                                  <div className="flex items-center text-green-400 text-sm">
                                    <TrendingUp className="w-4 h-4 mr-1" />
                                    {result.improvement}
                                  </div>
                                </div>
                                <div className="text-3xl font-bold text-white">{result.value}</div>
                              </div>
                            ))}
                          </div>
                          
                          <div className="mt-6 px-4 py-2 bg-blue-500/20 rounded-full text-center">
                            <span className="text-blue-300 text-sm font-medium">
                              Campaign Type: {client.campaignType}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Carousel Controls */}
            {featuredClients.length > 1 && (
              <>
                <button
                  onClick={() => setCurrentSlide((prev) => 
                    prev === 0 ? featuredClients.length - 1 : prev - 1
                  )}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 p-3 bg-slate-800/80 backdrop-blur-sm rounded-full hover:bg-slate-700/80 transition-all group"
                >
                  <ChevronLeft className="w-6 h-6 text-white group-hover:-translate-x-1 transition-transform" />
                </button>

                <button
                  onClick={() => setCurrentSlide((prev) => 
                    (prev + 1) % featuredClients.length
                  )}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 p-3 bg-slate-800/80 backdrop-blur-sm rounded-full hover:bg-slate-700/80 transition-all group"
                >
                  <ChevronRight className="w-6 h-6 text-white group-hover:translate-x-1 transition-transform" />
                </button>

                {/* Indicators */}
                <div className="flex justify-center mt-6 space-x-2">
                  {featuredClients.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentSlide(index)}
                      className={`w-3 h-3 rounded-full transition-all ${
                        index === currentSlide 
                          ? 'bg-blue-400 w-8' 
                          : 'bg-slate-600 hover:bg-slate-500'
                      }`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Industry Filter Tabs */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {industries.map((industry) => (
            <button
              key={industry}
              onClick={() => setActiveTab(industry)}
              className={`px-6 py-3 rounded-full font-medium transition-all duration-300 ${
                activeTab === industry
                  ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                  : 'bg-slate-800/50 text-slate-300 hover:bg-slate-700/50 hover:text-white'
              }`}
            >
              {industry.charAt(0).toUpperCase() + industry.slice(1)}
            </button>
          ))}
        </div>

        {/* Client Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredClients.map((client, index) => (
            <div
              key={client.id}
              className="group bg-gradient-to-br from-slate-800/40 to-slate-900/40 backdrop-blur-sm p-6 rounded-2xl border border-slate-700/30 hover:border-blue-500/50 transition-all duration-500 hover:-translate-y-2"
            >
              <div className="flex items-center mb-4">
                <img 
                  src={client.logo} 
                  alt={client.name}
                  className="w-12 h-12 rounded-xl object-cover mr-3 border border-slate-600"
                />
                <div>
                  <h4 className="text-lg font-bold text-white">{client.name}</h4>
                  <p className="text-blue-400 text-sm">{client.industry}</p>
                </div>
              </div>

              <p className="text-slate-300 text-sm mb-4 line-clamp-3">
                {client.description}
              </p>

              <div className="grid grid-cols-2 gap-3 mb-4">
                {client.results.slice(0, 2).map((result, idx) => (
                  <div key={idx} className="text-center">
                    <div className="text-2xl font-bold text-white">{result.value}</div>
                    <div className="text-xs text-slate-400">{result.metric}</div>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i} 
                      className={`w-4 h-4 ${
                        i < (client.rating || 5) 
                          ? 'text-yellow-400 fill-current' 
                          : 'text-slate-600'
                      }`} 
                    />
                  ))}
                </div>
                <span className="text-xs text-slate-500 bg-slate-800/50 px-2 py-1 rounded-full">
                  {client.campaignType}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Stats Summary */}
        <div className="mt-20 grid md:grid-cols-4 gap-8">
          {[
            { icon: Users, label: "Active Partnerships", value: "150+" },
            { icon: TrendingUp, label: "Average ROI Increase", value: "340%" },
            { icon: Star, label: "Client Satisfaction", value: "98%" },
            { icon: Award, label: "Industry Awards", value: "25+" }
          ].map((stat, index) => (
            <div key={index} className="text-center group">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                <stat.icon className="w-8 h-8 text-white" />
              </div>
              <div className="text-3xl font-bold text-white mb-2">{stat.value}</div>
              <div className="text-slate-400">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// Default clients data
const defaultClients: Client[] = [
  {
    id: 1,
    name: "BeautyLux",
    logo: "https://images.unsplash.com/photo-1586953208448-b95a79798f07?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80",
    industry: "beauty",
    description: "Premium skincare brand targeting millennials and Gen Z consumers through authentic beauty influencer partnerships.",
    results: [
      { metric: "Reach", value: "2.5M", improvement: "+250%" },
      { metric: "Engagement", value: "8.2%", improvement: "+180%" },
      { metric: "Conversions", value: "12.4K", improvement: "+320%" }
    ],
    testimonial: "GayatriDigital transformed our influencer strategy. The ROI exceeded all expectations and the quality of partnerships was outstanding.",
    author: "Sarah Chen",
    position: "Marketing Director",
    rating: 5,
    campaignType: "Beauty Influencer Campaign",
    featured: true
  },
  {
    id: 2,
    name: "TechNova",
    logo: "https://images.unsplash.com/photo-1611224923853-80b023f02d71?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80",
    industry: "tech",
    description: "Innovative tech startup leveraging micro-influencers to build brand awareness in the competitive SaaS market.",
    results: [
      { metric: "Lead Generation", value: "5.8K", improvement: "+400%" },
      { metric: "App Downloads", value: "25K", improvement: "+280%" },
      { metric: "User Acquisition Cost", value: "-45%", improvement: "Reduced" }
    ],
    testimonial: "The micro-influencer strategy was perfect for our B2B SaaS product. Quality leads and amazing conversion rates.",
    author: "Mike Rodriguez",
    position: "Growth Manager",
    rating: 5,
    campaignType: "Tech Micro-Influencer",
    featured: true
  },
  {
    id: 3,
    name: "FashionForward",
    logo: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80",
    industry: "fashion",
    description: "Sustainable fashion brand connecting with eco-conscious consumers through lifestyle and fashion influencers.",
    results: [
      { metric: "Brand Awareness", value: "+85%", improvement: "+85%" },
      { metric: "Sales", value: "$125K", improvement: "+220%" },
      { metric: "Social Following", value: "+45K", improvement: "+180%" }
    ],
    rating: 5,
    campaignType: "Sustainable Fashion",
    featured: false
  },
  {
    id: 4,
    name: "FoodieDelight",
    logo: "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80",
    industry: "food",
    description: "Gourmet food delivery service partnering with food bloggers and culinary influencers across major cities.",
    results: [
      { metric: "Orders", value: "18.5K", improvement: "+190%" },
      { metric: "Customer Retention", value: "78%", improvement: "+45%" },
      { metric: "Market Share", value: "+12%", improvement: "+12%" }
    ],
    rating: 4,
    campaignType: "Food & Lifestyle",
    featured: false
  },
  {
    id: 5,
    name: "GameStorm",
    logo: "https://images.unsplash.com/photo-1542751371-adc38448a05e?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80",
    industry: "gaming",
    description: "Mobile gaming company collaborating with gaming creators and streamers to drive user acquisition.",
    results: [
      { metric: "Game Downloads", value: "500K", improvement: "+300%" },
      { metric: "Daily Active Users", value: "85K", improvement: "+250%" },
      { metric: "In-App Revenue", value: "$75K", improvement: "+180%" }
    ],
    testimonial: "The gaming influencer partnerships drove incredible user engagement and retention rates we never thought possible.",
    author: "Alex Kim",
    position: "User Acquisition Lead",
    rating: 5,
    campaignType: "Gaming & Esports",
    featured: true
  },
  {
    id: 6,
    name: "WellnessHub",
    logo: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80",
    industry: "lifestyle",
    description: "Health and wellness platform working with fitness and wellness influencers to promote healthy living.",
    results: [
      { metric: "App Signups", value: "32K", improvement: "+220%" },
      { metric: "Course Enrollments", value: "8.5K", improvement: "+180%" },
      { metric: "Community Growth", value: "+28K", improvement: "+160%" }
    ],
    rating: 5,
    campaignType: "Health & Wellness",
    featured: false
  }
];

export default PartnershipClientsSection;