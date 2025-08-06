"use client";

import React from 'react';
import { Play } from 'lucide-react';

interface VideoItem {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
}

interface GallerySectionProps {
  videoGallery: VideoItem[];
  openVideo: (videoId: string) => void;
}

const GallerySection: React.FC<GallerySectionProps> = ({ videoGallery, openVideo }) => {
  return (
    <section id="gallery" className="py-24 bg-slate-950">
      <div className="container mx-auto px-6">
        <div className="text-center mb-20">
          <span className="inline-block px-4 py-2 bg-red-500/20 backdrop-blur-sm rounded-full text-red-300 text-sm font-medium mb-6">
            Portfolio
          </span>
          <h2 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
            Success Stories
          </h2>
          <p className="text-xl text-slate-400 max-w-3xl mx-auto">
            Explore our portfolio of successful campaigns and influencer collaborations that drove real results
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {videoGallery.map((video, index) => (
            <div
              key={index}
              className="group relative overflow-hidden rounded-3xl cursor-pointer border border-slate-800 hover:border-blue-500/50 transition-all duration-500 transform hover:-translate-y-2"
              onClick={() => openVideo(video.id)}
            >
              <div className="relative overflow-hidden">
                <img
                  src={video.thumbnail}
                  alt={video.title}
                  className="w-full h-64 object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-20 h-20 bg-blue-600/90 backdrop-blur-sm rounded-full flex items-center justify-center transform group-hover:scale-110 transition-all duration-300 shadow-2xl">
                    <Play className="w-8 h-8 text-white fill-current ml-1" />
                  </div>
                </div>
              </div>

              <div className="p-6 bg-gradient-to-b from-slate-800/50 to-slate-900">
                <h3 className="text-xl font-bold mb-2 text-white">{video.title}</h3>
                <p className="text-slate-400 text-sm">{video.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default GallerySection;