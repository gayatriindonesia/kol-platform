"use client";

import React from 'react';
import { Users, TrendingUp, Star } from 'lucide-react';

const ServicesSection = () => {
  const services = [
    {
      icon: Users,
      title: "Influencer Discovery",
      description: "AI-powered matching with 50,000+ verified creators across all platforms and niches",
      features: ["Advanced filtering", "Audience analysis", "Fraud detection"]
    },
    {
      icon: TrendingUp,
      title: "Campaign Management",
      description: "Full-service campaign execution from planning to performance optimization",
      features: ["Strategy development", "Content oversight", "Real-time optimization"]
    },
    {
      icon: Star,
      title: "Performance Analytics",
      description: "Comprehensive reporting and insights to measure campaign success and ROI",
      features: ["Real-time dashboards", "Custom reports", "ROI tracking"]
    }
  ];

  return (
    <section id="services" className="py-24 bg-gradient-to-br from-slate-900 to-slate-800 relative">
      <div className="container mx-auto px-6">
        <div className="text-center mb-20">
          <span className="inline-block px-4 py-2 bg-blue-500/20 backdrop-blur-sm rounded-full text-blue-300 text-sm font-medium mb-6">
            Our Services
          </span>
          <h2 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
            Comprehensive Solutions
          </h2>
          <p className="text-xl text-slate-400 max-w-3xl mx-auto">
            From strategy to execution, we provide end-to-end influencer marketing services
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <div
              key={index}
              className="group relative bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm p-8 rounded-3xl border border-slate-700/50 hover:border-blue-500/50 transition-all duration-500 hover:-translate-y-2"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

              <div className="relative z-10">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <service.icon className="w-8 h-8 text-white" />
                </div>

                <h3 className="text-2xl font-bold mb-4 text-white">{service.title}</h3>
                <p className="text-slate-300 mb-6 leading-relaxed">{service.description}</p>

                <ul className="space-y-2">
                  {service.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center text-sm text-slate-400">
                      <div className="w-1.5 h-1.5 bg-blue-400 rounded-full mr-3" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;