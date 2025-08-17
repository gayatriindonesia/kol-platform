"use client";

import Image from 'next/image';
import Link from 'next/link';
import React from 'react';

interface TeamMember {
  name: string;
  industry: string;
  logo: string;
  description: string;
  partnership: string;
  website?: string;
}

interface TeamSectionProps {
  teamMembers: TeamMember[];
}

const TeamSection: React.FC<TeamSectionProps> = ({ teamMembers }) => {
  return (
    <section id="partners" className="py-24 bg-slate-950">
      <div className="container mx-auto px-6">
        <div className="text-center mb-20">
          <span className="inline-block px-4 py-2 bg-blue-500/20 backdrop-blur-sm rounded-full text-blue-300 text-sm font-medium mb-6">
            Strategic Partners
          </span>
          <h2 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
            Trusted Business Partners
          </h2>
          <p className="text-xl text-slate-400 max-w-3xl mx-auto">
            Collaborating with industry-leading organizations to deliver exceptional value and innovative solutions
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {teamMembers.map((partner, index) => (
            <div key={index} className="group relative bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-2xl p-8 hover:border-blue-500/50 transition-all duration-500 hover:shadow-2xl hover:shadow-blue-500/10">
              {/* Partner Logo */}
              <div className="relative mb-6 h-20 flex items-center justify-center">
                <Image
                  src={partner.logo}
                  alt={`${partner.name} logo`}
                  className="max-h-full max-w-full object-contain filter brightness-90 group-hover:brightness-100 transition-all duration-300"
                  width={1000}
                  height={1000}
                />
              </div>

              {/* Partnership Type Badge */}
              <div className="absolute top-4 right-4">
                <span className="px-3 py-1 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full text-xs font-medium text-blue-300 border border-blue-500/30">
                  {partner.partnership}
                </span>
              </div>

              {/* Partner Info */}
              <div className="space-y-4">
                <div>
                  <h3 className="text-xl font-bold mb-2 text-white group-hover:text-blue-300 transition-colors duration-300">
                    {partner.name}
                  </h3>
                  <p className="text-blue-400 font-medium text-sm uppercase tracking-wider">
                    {partner.industry}
                  </p>
                </div>

                {/* Description */}
                <div className="relative overflow-hidden">
                  <p className="text-slate-400 text-sm leading-relaxed">
                    {partner.description}
                  </p>
                </div>

                {/* Website Link */}
                {partner.website && (
                  <div className="pt-4 border-t border-slate-800 group-hover:border-slate-700 transition-colors duration-300">
                    <Link
                      href={partner.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-sm text-slate-400 hover:text-blue-400 transition-colors duration-200"
                    >
                      Visit Website
                      <svg className="ml-2 w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </Link>
                  </div>
                )}
              </div>

              {/* Hover Effect Gradient */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
            </div>
          ))}
        </div>

        {/* Partnership CTA */}
        <div className="text-center mt-16">
          <div className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg text-white font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl cursor-pointer">
            Become a Partner
            <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TeamSection;