"use client";

import React from 'react';

interface TeamMember {
  name: string;
  role: string;
  image: string;
  bio: string;
}

interface TeamSectionProps {
  teamMembers: TeamMember[];
}

const TeamSection: React.FC<TeamSectionProps> = ({ teamMembers }) => {
  return (
    <section id="team" className="py-24 bg-slate-950">
      <div className="container mx-auto px-6">
        <div className="text-center mb-20">
          <span className="inline-block px-4 py-2 bg-purple-500/20 backdrop-blur-sm rounded-full text-purple-300 text-sm font-medium mb-6">
            Our Team
          </span>
          <h2 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
            Meet the Experts
          </h2>
          <p className="text-xl text-slate-400 max-w-3xl mx-auto">
            Industry leaders with decades of combined experience in digital marketing and creator partnerships
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {teamMembers.map((member, index) => (
            <div key={index} className="group text-center">
              <div className="relative mb-6 overflow-hidden rounded-3xl">
                <img
                  src={member.image}
                  alt={member.name}
                  className="w-full h-80 object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="absolute bottom-4 left-4 right-4 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300 opacity-0 group-hover:opacity-100">
                  <p className="text-sm text-slate-300">{member.bio}</p>
                </div>
              </div>
              <h3 className="text-xl font-bold mb-2 text-white">{member.name}</h3>
              <p className="text-blue-400 font-medium">{member.role}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TeamSection;