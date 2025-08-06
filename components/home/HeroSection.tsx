"use client";

import React from 'react';
import { ChevronLeft, ChevronRight, Play } from 'lucide-react';

interface CarouselSlide {
  title: string;
  subtitle: string;
  image: string;
  cta: string;
}

interface Stat {
  number: string;
  label: string;
  icon: React.ComponentType<any>;
}

interface HeroSectionProps {
  currentSlide: number;
  nextSlide: () => void;
  prevSlide: () => void;
  setCurrentSlide: (index: number) => void;
  carouselSlides: CarouselSlide[];
  stats: Stat[];
}

const HeroSection: React.FC<HeroSectionProps> = ({
  currentSlide,
  nextSlide,
  prevSlide,
  setCurrentSlide,
  carouselSlides,
  stats
}) => {
  return (
    <section id="home" className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0">
        <img
          src={carouselSlides[currentSlide].image}
          alt="Hero background"
          className="w-full h-full object-cover transition-all duration-1000"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950/80 via-slate-900/60 to-blue-900/40" />
      </div>

      {/* Animated particles background */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-blue-400/20 rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${3 + Math.random() * 2}s`
            }}
          />
        ))}
      </div>

      {/* Hero Content */}
      <div className="relative z-10 text-center px-6 max-w-5xl mx-auto">
        <div className="mb-8">
          <span className="inline-block px-4 py-2 bg-blue-500/20 backdrop-blur-sm rounded-full text-blue-300 text-sm font-medium mb-6 border border-blue-400/30">
            🚀 #1 Influencer Marketing Platform
          </span>
        </div>

        <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold mb-8 leading-tight">
          <span className="bg-gradient-to-r from-white via-blue-100 to-blue-300 bg-clip-text text-transparent">
            {carouselSlides[currentSlide].title}
          </span>
        </h1>

        <p className="text-xl md:text-2xl mb-12 text-slate-300 max-w-3xl mx-auto leading-relaxed">
          {carouselSlides[currentSlide].subtitle}
        </p>

        <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
          <button className="group bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 py-4 rounded-2xl font-semibold text-lg hover:from-blue-600 hover:to-purple-700 transition-all transform hover:scale-105 shadow-2xl hover:shadow-blue-500/25">
            <span className="flex items-center space-x-2">
              <span>{carouselSlides[currentSlide].cta}</span>
              <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </span>
          </button>

          <button className="flex items-center space-x-3 text-white hover:text-blue-400 transition-colors group">
            <div className="w-12 h-12 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center group-hover:bg-blue-500/20 transition-colors">
              <Play className="w-5 h-5 fill-current" />
            </div>
            <span className="font-medium">Watch Demo</span>
          </button>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-16 pt-16 border-t border-slate-700/50">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-white mb-2">{stat.number}</div>
              <div className="text-slate-400 text-sm">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Carousel Controls */}
      <button
        onClick={prevSlide}
        className="absolute left-6 top-1/2 transform -translate-y-1/2 p-4 bg-slate-800/80 backdrop-blur-sm rounded-2xl hover:bg-slate-700/80 transition-all group"
      >
        <ChevronLeft className="w-6 h-6 group-hover:-translate-x-1 transition-transform" />
      </button>

      <button
        onClick={nextSlide}
        className="absolute right-6 top-1/2 transform -translate-y-1/2 p-4 bg-slate-800/80 backdrop-blur-sm rounded-2xl hover:bg-slate-700/80 transition-all group"
      >
        <ChevronRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
      </button>

      {/* Indicators */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-3">
        {carouselSlides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`w-12 h-2 rounded-full transition-all ${
              index === currentSlide
                ? 'bg-gradient-to-r from-blue-400 to-purple-400'
                : 'bg-slate-600 hover:bg-slate-500'
            }`}
          />
        ))}
      </div>
    </section>
  );
};

export default HeroSection;