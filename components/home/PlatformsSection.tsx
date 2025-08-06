"use client";

import React from 'react';
import { TrendingUp } from 'lucide-react';
import { IconType } from 'react-icons';

interface Platform {
  name: string;
  icon: IconType;
  users: string;
  color: string;
  growth: string;
}

interface PlatformsSectionProps {
  platforms: Platform[];
}

const PlatformsSection: React.FC<PlatformsSectionProps> = ({ platforms }) => {
  return (
    <section id="platforms" className="py-24 bg-gradient-to-br from-slate-900 to-slate-800">
      <div className="container mx-auto px-6">
        <div className="text-center mb-20">
          <span className="inline-block px-4 py-2 bg-green-500/20 backdrop-blur-sm rounded-full text-green-300 text-sm font-medium mb-6">
            Platforms
          </span>
          <h2 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
            Global Reach
          </h2>
          <p className="text-xl text-slate-400 max-w-3xl mx-auto">
            Connect with audiences across all major social media platforms with our extensive creator network
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {platforms.map((platform, index) => {
            const IconComponent = platform.icon;
            return (
              <div
                key={index}
                className="group relative bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm p-8 rounded-3xl border border-slate-700/50 hover:border-opacity-100 transition-all duration-500 hover:-translate-y-2 text-center"
                style={{ '--border-color': platform.color } as React.CSSProperties}
              >
                <div 
                  className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-10 transition-opacity duration-500"
                  style={{ backgroundColor: platform.color }} 
                />

                <div className="relative z-10">
                  <IconComponent
                    className="w-20 h-20 mx-auto mb-6 transition-transform duration-300 group-hover:scale-110"
                    style={{ color: platform.color }}
                  />
                  <h3 className="text-2xl font-bold mb-2 text-white">{platform.name}</h3>
                  <p className="text-3xl font-bold mb-2" style={{ color: platform.color }}>
                    {platform.users}
                  </p>
                  <p className="text-slate-400">Active Users</p>
                  <div className="mt-4 inline-flex items-center px-3 py-1 bg-green-500/20 rounded-full text-green-300 text-sm">
                    <TrendingUp className="w-4 h-4 mr-1" />
                    {platform.growth} growth
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default PlatformsSection;