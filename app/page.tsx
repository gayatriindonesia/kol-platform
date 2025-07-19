"use client";

import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, Users, TrendingUp, Star, Mail, Phone, MapPin, Video, Play, X } from 'lucide-react';
import { FaFacebook, FaInstagram, FaLinkedin, FaTiktok, FaTwitter, FaYoutube } from 'react-icons/fa';

const InfluencerAgency = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);
  const videoRef = useRef<HTMLIFrameElement>(null);

  const carouselSlides = [
    {
      title: "Connecting Brands with Top Influencers",
      subtitle: "We bridge the gap between innovative brands and influential creators",
      image: "/images/carousel/carousel-1.png"
    },
    {
      title: "Maximize Your Brand's Digital Impact",
      subtitle: "Strategic partnerships that drive engagement and growth",
      image: "/images/carousel/carousel-2.jpg"
    },
    {
      title: "Your Success is Our Mission",
      subtitle: "Data-driven campaigns with measurable results",
      // background: "linear-gradient(135deg, #1d4ed8 0%, #2563eb 50%, #60a5fa 100%)"
    }
  ];

  const teamMembers = [
    {
      name: "",
      role: "CEO & Founder",
      image: "/images/teams/1_big.jpg"
    },
    {
      name: "",
      role: "Business Director",
      image: "/images/teams/2_big.jpg"
    },
    {
      name: "",
      role: "Account Executive",
      image: "/images/teams/5_big.jpg"
    },
    {
      name: "",
      role: "Senior Account Manager",
      image: "/images/teams/4_big.jpg"
    }
  ];

  const platforms = [
    { name: "Instagram", icon: FaInstagram, users: "2B+", color: "#E4405F" },
    { name: "YouTube", icon: FaYoutube, users: "2.7B+", color: "#FF0000" },
    { name: "TikTok", icon: FaTiktok, users: "1B+", color: "#000000" },
    { name: "Twitter", icon: FaTwitter, users: "450M+", color: "#1DA1F2" },
    { name: "Facebook", icon: FaFacebook, users: "2.9B+", color: "#4267B2" },
    { name: "LinkedIn", icon: FaLinkedin, users: "900M+", color: "#0077B5" }
  ];

  // Video gallery data
  const videoGallery = [
    {
      id: "dQw4w9WgXcQ",
      title: "Campaign Highlights 2024",
      description: "Top performing campaigns from our influencer network",
      thumbnail: "/images/gallery/campaign-highlights.jpg"
    },
    {
      id: "tgbNymZ7vqY",
      title: "Behind The Scenes",
      description: "A day in the life of our top influencers",
      thumbnail: "/images/gallery/behind-scenes.jpg"
    },
    {
      id: "pEFH_kCijmg",
      title: "Influencer Collaboration",
      description: "How we create authentic brand partnerships",
      thumbnail: "/images/gallery/influencer-collab.jpg"
    },
    {
      id: "q6EoRBvdVPQ",
      title: "Brand Success Stories",
      description: "Case studies from our satisfied clients",
      thumbnail: "/images/gallery/success-stories.jpg"
    },
    {
      id: "9bZkp7q19f0",
      title: "Content Creation Process",
      description: "How our influencers create engaging content",
      thumbnail: "/images/gallery/content-creation.jpg"
    },
    {
      id: "CevxZvSJLk8",
      title: "Industry Insights",
      description: "Trends and predictions for influencer marketing",
      thumbnail: "/images/gallery/industry-insights.jpg"
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % carouselSlides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    // Close video modal when pressing escape key
    const handleEsc = (event: KeyboardEvent) => {
  if (event.key === 'Escape') {
    setSelectedVideo(null);
  }
};
    
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, []);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % carouselSlides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + carouselSlides.length) % carouselSlides.length);
  };

  const openVideo = (videoId: string) => {
  setSelectedVideo(videoId);
};

  const closeVideo = () => {
    setSelectedVideo(null);
    if (videoRef.current) {
      // Stop video playback by removing the src
      videoRef.current.src = '';
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {/* Video Modal */}
      {selectedVideo && (
        <div className="fixed inset-0 bg-black/90 z-[100] flex items-center justify-center p-4">
          <div className="relative w-full max-w-4xl">
            <button 
              onClick={closeVideo}
              className="absolute -top-12 right-0 p-2 rounded-full hover:bg-slate-700 transition-colors z-10"
            >
              <X className="w-6 h-6 text-white" />
            </button>
            <div className="aspect-w-16 aspect-h-9">
              <iframe
                ref={videoRef}
                src={`https://www.youtube.com/embed/${selectedVideo}?autoplay=1`}
                title="YouTube video player"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full rounded-xl"
              ></iframe>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="fixed top-0 w-full bg-slate-900/95 backdrop-blur-sm border-b border-blue-500/20 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
            GayatriDigital
          </div>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            <a href="#home" className="hover:text-blue-400 transition-colors">Home</a>
            <a href="#services" className="hover:text-blue-400 transition-colors">Services</a>
            <a href="#team" className="hover:text-blue-400 transition-colors">Team</a>
            <a href="#platforms" className="hover:text-blue-400 transition-colors">Platforms</a>
            <a href="#gallery" className="hover:text-blue-400 transition-colors">Gallery</a>
            <a href="#contact" className="hover:text-blue-400 transition-colors">Contact</a>
            <a href="/signin">Signin</a>
          </nav>

          {/* Mobile Menu Button */}
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 relative z-10"
          >
            <div className="w-6 h-6 flex flex-col justify-center space-y-1">
              <div className={`w-full h-0.5 bg-white transition-all duration-300 ease-in-out ${
                isMenuOpen ? 'rotate-45 translate-y-1.5' : ''
              }`}></div>
              <div className={`w-full h-0.5 bg-white transition-all duration-300 ease-in-out ${
                isMenuOpen ? 'opacity-0 scale-0' : 'opacity-100 scale-100'
              }`}></div>
              <div className={`w-full h-0.5 bg-white transition-all duration-300 ease-in-out ${
                isMenuOpen ? '-rotate-45 -translate-y-1.5' : ''
              }`}></div>
            </div>
          </button>
        </div>

        {/* Mobile Navigation */}
        <div className={`md:hidden bg-slate-800 border-t border-blue-500/20 overflow-hidden transition-all duration-300 ease-in-out ${
          isMenuOpen ? 'max-h-80 opacity-100' : 'max-h-0 opacity-0'
        }`}>
          <nav className="flex flex-col space-y-4 p-4">
            <a 
              href="#home" 
              className="hover:text-blue-400 transition-all duration-200 transform hover:translate-x-2"
              onClick={() => setIsMenuOpen(false)}
            >
              Home
            </a>
            <a 
              href="#services" 
              className="hover:text-blue-400 transition-all duration-200 transform hover:translate-x-2"
              onClick={() => setIsMenuOpen(false)}
            >
              Services
            </a>
            <a 
              href="#team" 
              className="hover:text-blue-400 transition-all duration-200 transform hover:translate-x-2"
              onClick={() => setIsMenuOpen(false)}
            >
              Team
            </a>
            <a 
              href="#platforms" 
              className="hover:text-blue-400 transition-all duration-200 transform hover:translate-x-2"
              onClick={() => setIsMenuOpen(false)}
            >
              Platforms
            </a>
            <a 
              href="#gallery" 
              className="hover:text-blue-400 transition-all duration-200 transform hover:translate-x-2"
              onClick={() => setIsMenuOpen(false)}
            >
              Gallery
            </a>
            <a 
              href="#contact" 
              className="hover:text-blue-400 transition-all duration-200 transform hover:translate-x-2"
              onClick={() => setIsMenuOpen(false)}
            >
              Contact
            </a>
          </nav>
        </div>
      </header>

      {/* Hero Carousel */}
      <section id="home" className="relative h-screen flex items-center justify-center overflow-hidden">
        <div 
          className="absolute inset-0 transition-all duration-1000 bg-cover bg-center bg-no-repeat"
          style={{ 
            backgroundImage: `url(${carouselSlides[currentSlide].image})`
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-blue-900/70 via-slate-900/50 to-blue-900/70"></div>
        </div>
        
        <div className="relative z-10 text-center px-4 max-w-4xl">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 animate-fade-in">
            {carouselSlides[currentSlide].title}
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-blue-100">
            {carouselSlides[currentSlide].subtitle}
          </p>
          <button className="bg-white text-blue-900 px-8 py-4 rounded-full font-semibold text-lg hover:bg-blue-50 transition-all transform hover:scale-105 shadow-2xl">
            Get Started Today
          </button>
        </div>

        {/* Carousel Controls */}
        <button 
          onClick={prevSlide}
          className="absolute left-4 top-1/2 transform -translate-y-1/2 p-3 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-all"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <button 
          onClick={nextSlide}
          className="absolute right-4 top-1/2 transform -translate-y-1/2 p-3 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-all"
        >
          <ChevronRight className="w-6 h-6" />
        </button>

        {/* Carousel Indicators */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-3">
          {carouselSlides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-3 h-3 rounded-full transition-all ${
                index === currentSlide ? 'bg-white' : 'bg-white/50'
              }`}
            />
          ))}
        </div>
      </section>

      {/* Product Feature Section */}
<section id="feature" className="py-20 bg-gradient-to-br from-slate-900 to-blue-900/20">
  <div className="container mx-auto px-4">
    <div className="grid md:grid-cols-2 gap-12 items-center">
      {/* Video Column */}
      <div className="relative rounded-2xl overflow-hidden shadow-2xl">
        <div className="relative aspect-w-16 aspect-h-9">
          <video 
            className="w-full h-auto rounded-2xl"
            controls
            poster="/videos/poster.jpg" // Poster image untuk thumbnail
          >
            <source src="/videos/agency-showcase.mp4" type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-24 h-24 bg-blue-600/80 rounded-full flex items-center justify-center backdrop-blur-sm">
            <Play className="w-10 h-10 text-white fill-current" />
          </div>
        </div>
      </div>
      
      {/* Text Column */}
      <div>
        <h2 className="text-4xl font-bold mb-6 bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
          Why Choose Our Agency?
        </h2>
        <p className="text-lg text-slate-300 mb-8">
          We combine data-driven strategies with creative storytelling to deliver impactful 
          influencer campaigns that drive real business results.
        </p>
        <ul className="space-y-6">
          <li className="flex items-start">
            <div className="bg-blue-500 rounded-full p-2 mr-4 mt-1">
              <Users className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-1">Vetted Influencers</h3>
              <p className="text-slate-400">
                Access to our exclusive network of 10,000+ pre-vetted influencers across all major platforms.
              </p>
            </div>
          </li>
          <li className="flex items-start">
            <div className="bg-blue-500 rounded-full p-2 mr-4 mt-1">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-1">Performance Analytics</h3>
              <p className="text-slate-400">
                Comprehensive campaign analytics to measure ROI, engagement, and conversion metrics.
              </p>
            </div>
          </li>
          <li className="flex items-start">
            <div className="bg-blue-500 rounded-full p-2 mr-4 mt-1">
              <Star className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-1">Creative Excellence</h3>
              <p className="text-slate-400">
                Our creative team ensures content aligns with both brand identity and audience preferences.
              </p>
            </div>
          </li>
        </ul>
        <div className="mt-10 flex flex-wrap gap-4">
          <button className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-blue-600 hover:to-blue-700 transition-all">
            Request a Demo
          </button>
          <button className="bg-slate-700 text-white px-6 py-3 rounded-lg font-semibold hover:bg-slate-600 transition-all border border-slate-600">
            Download Brochure
          </button>
        </div>
      </div>
    </div>
  </div>
</section>

      {/* Services Section */}
      <section id="services" className="py-20 bg-slate-800">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-16 bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
            Our Services
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-gradient-to-br from-slate-700 to-slate-800 p-8 rounded-2xl border border-blue-500/20 hover:border-blue-400/40 transition-all transform hover:scale-105">
              <Users className="w-12 h-12 text-blue-400 mb-6" />
              <h3 className="text-2xl font-bold mb-4">Influencer Matching</h3>
              <p className="text-slate-300">Connect with the perfect influencers for your brand using our advanced matching algorithm and extensive network.</p>
            </div>
            <div className="bg-gradient-to-br from-slate-700 to-slate-800 p-8 rounded-2xl border border-blue-500/20 hover:border-blue-400/40 transition-all transform hover:scale-105">
              <TrendingUp className="w-12 h-12 text-blue-400 mb-6" />
              <h3 className="text-2xl font-bold mb-4">Campaign Management</h3>
              <p className="text-slate-300">End-to-end campaign management from strategy development to performance analysis and optimization.</p>
            </div>
            <div className="bg-gradient-to-br from-slate-700 to-slate-800 p-8 rounded-2xl border border-blue-500/20 hover:border-blue-400/40 transition-all transform hover:scale-105">
              <Star className="w-12 h-12 text-blue-400 mb-6" />
              <h3 className="text-2xl font-bold mb-4">Brand Partnerships</h3>
              <p className="text-slate-300">Strategic long-term partnerships that create authentic connections between brands and their target audiences.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section id="team" className="py-20 bg-slate-900">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-16 bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
            Meet Our Team
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {teamMembers.map((member, index) => (
              <div key={index} className="text-center group">
                <div className="relative mb-6 overflow-hidden rounded-2xl">
                  <img 
                    src={member.image} 
                    alt={member.name}
                    className="w-full h-64 object-cover transition-transform duration-300 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-blue-900/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
                <h3 className="text-xl font-bold mb-2">{member.name}</h3>
                <p className="text-blue-400 font-medium">{member.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Platforms Section */}
      <section id="platforms" className="py-20 bg-slate-800">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-16 bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
            Platforms We Work With
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {platforms.map((platform, index) => {
              const IconComponent = platform.icon;
              return (
                <div key={index} className="bg-gradient-to-br from-slate-700 to-slate-800 p-8 rounded-2xl border border-blue-500/20 hover:border-blue-400/40 transition-all transform hover:scale-105 text-center">
                  <IconComponent 
                    className="w-16 h-16 mx-auto mb-4" 
                    style={{ color: platform.color }}
                  />
                  <h3 className="text-2xl font-bold mb-2">{platform.name}</h3>
                  <p className="text-slate-300 text-lg">{platform.users} Users</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Video Gallery Section */}
      <section id="gallery" className="py-20 bg-slate-900">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <div className="inline-flex items-center justify-center mb-4">
              <Video className="w-8 h-8 text-blue-500 mr-3" />
              <h2 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
                Video Gallery
              </h2>
            </div>
            <p className="text-slate-400 max-w-2xl mx-auto">
              Explore our portfolio of successful campaigns and influencer collaborations
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {videoGallery.map((video, index) => (
              <div 
                key={index}
                className="group relative overflow-hidden rounded-2xl cursor-pointer border border-slate-700 hover:border-blue-500 transition-all duration-300 transform hover:-translate-y-1"
                onClick={() => openVideo(video.id)}
              >
                <div className="relative">
                  <img 
                    src={video.thumbnail} 
                    alt={video.title}
                    className="w-full h-52 object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-90 group-hover:opacity-100 transition-opacity"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center transform group-hover:scale-110 transition-transform">
                      <Play className="w-6 h-6 text-white fill-current" />
                    </div>
                  </div>
                </div>
                <div className="p-6 bg-gradient-to-b from-slate-800 to-slate-900">
                  <h3 className="text-xl font-bold mb-2">{video.title}</h3>
                  <p className="text-slate-400">{video.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 bg-slate-900">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-16 bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
            Get In Touch
          </h2>
          <div className="grid md:grid-cols-2 gap-12 max-w-6xl mx-auto">
            <div>
              <h3 className="text-2xl font-bold mb-8">Ready to Start Your Campaign?</h3>
              <div className="space-y-6">
                <div className="flex items-center space-x-4">
                  <Mail className="w-6 h-6 text-blue-400" />
                  <span className="text-lg">contact@influencehub.com</span>
                </div>
                <div className="flex items-center space-x-4">
                  <Phone className="w-6 h-6 text-blue-400" />
                  <span className="text-lg">+1 (555) 123-4567</span>
                </div>
                <div className="flex items-center space-x-4">
                  <MapPin className="w-6 h-6 text-blue-400" />
                  <span className="text-lg">Jakarta, Indonesia</span>
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-slate-700 to-slate-800 p-8 rounded-2xl border border-blue-500/20">
              <div className="space-y-6">
                <div>
                  <input 
                    type="text" 
                    placeholder="Your Name" 
                    className="w-full px-4 py-3 bg-slate-600 border border-slate-500 rounded-lg focus:border-blue-400 focus:outline-none transition-colors"
                  />
                </div>
                <div>
                  <input 
                    type="email" 
                    placeholder="Your Email" 
                    className="w-full px-4 py-3 bg-slate-600 border border-slate-500 rounded-lg focus:border-blue-400 focus:outline-none transition-colors"
                  />
                </div>
                <div>
                  <textarea 
                    placeholder="Your Message" 
                    rows={4}
                    className="w-full px-4 py-3 bg-slate-600 border border-slate-500 rounded-lg focus:border-blue-400 focus:outline-none transition-colors resize-none"
                  ></textarea>
                </div>
                <button className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 rounded-lg font-semibold hover:from-blue-600 hover:to-blue-700 transition-all transform hover:scale-105">
                  Send Message
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-950 py-12 border-t border-blue-500/20">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent mb-4">
                InfluenceHub
              </div>
              <p className="text-slate-400">
                Connecting brands with influential creators to build authentic relationships and drive meaningful engagement.
              </p>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4 text-blue-400">Services</h4>
              <ul className="space-y-2 text-slate-400">
                <li>Influencer Matching</li>
                <li>Campaign Management</li>
                <li>Brand Partnerships</li>
                <li>Analytics & Reporting</li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4 text-blue-400">Company</h4>
              <ul className="space-y-2 text-slate-400">
                <li>About Us</li>
                <li>Our Team</li>
                <li>Careers</li>
                <li>Press</li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4 text-blue-400">Follow Us</h4>
              <div className="flex space-x-4">
                <FaInstagram className="w-6 h-6 text-slate-400 hover:text-blue-400 cursor-pointer transition-colors" />
                <FaTwitter className="w-6 h-6 text-slate-400 hover:text-blue-400 cursor-pointer transition-colors" />
                <FaLinkedin className="w-6 h-6 text-slate-400 hover:text-blue-400 cursor-pointer transition-colors" />
                <FaFacebook className="w-6 h-6 text-slate-400 hover:text-blue-400 cursor-pointer transition-colors" />
              </div>
            </div>
          </div>
          <div className="border-t border-slate-800 mt-8 pt-8 text-center text-slate-400">
            <p>&copy; 2025 InfluenceHub. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default InfluencerAgency;