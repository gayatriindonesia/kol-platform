"use client";

import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, Users, TrendingUp, Star, Mail, Phone, MapPin, Play, X, Shield, FileText, Menu, Loader2 } from 'lucide-react';
import { FaFacebook, FaInstagram, FaLinkedin, FaTiktok, FaTwitter, FaYoutube } from 'react-icons/fa';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const InfluencerAgency = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState('home');
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Enhanced carousel slides with better content
  const carouselSlides = [
    {
      title: "Transform Your Brand's Digital Presence",
      subtitle: "Connect with millions through authentic influencer partnerships",
      image: "https://images.unsplash.com/photo-1557804506-669a67965ba0?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80",
      cta: "Start Your Campaign"
    },
    {
      title: "Data-Driven Influencer Marketing",
      subtitle: "Maximize ROI with our advanced analytics and targeting",
      image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80",
      cta: "View Analytics"
    },
    {
      title: "Global Network of Creators",
      subtitle: "Access 50,000+ verified influencers across all platforms",
      image: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80",
      cta: "Browse Creators"
    }
  ];

  const teamMembers = [
    {
      name: "Sarah Chen",
      role: "CEO & Founder",
      image: "https://images.unsplash.com/photo-1494790108755-2616c22082ad?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
      bio: "10+ years in digital marketing"
    },
    {
      name: "Marcus Johnson",
      role: "Creative Director",
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
      bio: "Award-winning creative strategist"
    },
    {
      name: "Elena Rodriguez",
      role: "Head of Partnerships",
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
      bio: "Expert in influencer relations"
    },
    {
      name: "David Kim",
      role: "Data Analytics Lead",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
      bio: "AI & ML specialist"
    }
  ];

  const platforms = [
    { name: "Instagram", icon: FaInstagram, users: "2B+", color: "#E4405F", growth: "+15%" },
    { name: "YouTube", icon: FaYoutube, users: "2.7B+", color: "#FF0000", growth: "+12%" },
    { name: "TikTok", icon: FaTiktok, users: "1B+", color: "#000000", growth: "+28%" },
    { name: "Twitter", icon: FaTwitter, users: "450M+", color: "#1DA1F2", growth: "+8%" },
    { name: "Facebook", icon: FaFacebook, users: "2.9B+", color: "#4267B2", growth: "+5%" },
    { name: "LinkedIn", icon: FaLinkedin, users: "900M+", color: "#0077B5", growth: "+18%" }
  ];

  const videoGallery = [
    {
      id: "dQw4w9WgXcQ",
      title: "Campaign Success Story",
      description: "How we achieved 300% ROI for a beauty brand",
      thumbnail: "https://images.unsplash.com/photo-1611224923853-80b023f02d71?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80"
    },
    {
      id: "tgbNymZ7vqY",
      title: "Creator Collaboration",
      description: "Behind the scenes of viral content creation",
      thumbnail: "https://images.unsplash.com/photo-1551650975-87deedd944c3?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80"
    },
    {
      id: "pEFH_kCijmg",
      title: "Brand Partnership",
      description: "Long-term influencer relationship building",
      thumbnail: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80"
    }
  ];

  // Stats data
  const stats = [
    { number: "50K+", label: "Verified Creators", icon: Users },
    { number: "500M+", label: "Total Reach", icon: TrendingUp },
    { number: "98%", label: "Client Satisfaction", icon: Star },
    { number: "300%", label: "Average ROI", icon: TrendingUp }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % carouselSlides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const sections = ['home', 'services', 'team', 'platforms', 'gallery', 'contact'];
      const scrollPosition = window.scrollY + 100;

      sections.forEach(section => {
        const element = document.getElementById(section);
        if (element) {
          const { offsetTop, offsetHeight } = element;
          if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
            setActiveSection(section);
          }
        }
      });
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
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
      videoRef.current.src = '';
    }
  };

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setIsMenuOpen(false);
  };

  const handleClick = () => {
    setLoading(true)
    // Simulasi delay (misal fetch atau animasi)
    setTimeout(() => {
      router.push('/signin')
    }, 1000) // ganti sesuai kebutuhan
  }


  return (
    <div className="min-h-screen bg-slate-950 text-white overflow-x-hidden">
      {/* Video Modal */}
      {selectedVideo && (
        <div className="fixed inset-0 bg-black/95 z-[100] flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-5xl">
            <button
              onClick={closeVideo}
              className="absolute -top-12 right-0 p-3 rounded-full bg-slate-800/80 hover:bg-slate-700 transition-colors z-10"
            >
              <X className="w-6 h-6 text-white" />
            </button>
            <div className="aspect-video rounded-2xl overflow-hidden shadow-2xl">
              <video
                ref={videoRef}
                src={`https://www.youtube.com/embed/${selectedVideo}?autoplay=1`}
                title="YouTube video player"
                className="w-full h-full"
              />
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Header */}
      <header className="fixed top-0 w-full bg-slate-950/90 backdrop-blur-xl border-b border-slate-800/50 z-50 transition-all duration-300">
        <div className="container mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-lg">G</span>
              </div>
              <div className="text-2xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-blue-600 bg-clip-text text-transparent">
                GayatriDigital
              </div>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-8">
              {['Home', 'Services', 'Team', 'Platforms', 'Gallery', 'Contact'].map((item) => (
                <button
                  key={item}
                  onClick={() => scrollToSection(item.toLowerCase())}
                  className={`relative px-3 py-2 text-sm font-medium transition-all duration-300 hover:text-blue-400 ${activeSection === item.toLowerCase()
                    ? 'text-blue-400'
                    : 'text-slate-300'
                    }`}
                >
                  {item}
                  {activeSection === item.toLowerCase() && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full" />
                  )}
                </button>
              ))}

              {/* Privacy & Terms */}
              <div className="flex items-center space-x-4 ml-8 pl-8 border-l border-slate-700">
                <Link
                  href="/privacy"
                  className="flex items-center space-x-2 text-slate-400 hover:text-blue-400 transition-colors"
                >
                  <Shield className="w-4 h-4" />
                  <span className="text-sm">Privacy</span>
                </Link>

                <Link
                  href="/terms"
                  className="flex items-center space-x-2 text-slate-400 hover:text-blue-400 transition-colors"
                >
                  <FileText className="w-4 h-4" />
                  <span className="text-sm">Terms</span>
                </Link>
              </div>
              {/** Navbar Get Started or signin */}
              <div className="flex items-center space-x-4 ml-4">
                <button
                  onClick={handleClick}
                  disabled={loading}
                  className="flex items-center justify-center bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-2.5 rounded-xl font-semibold hover:from-blue-600 hover:to-purple-700 transition-all transform hover:scale-105 shadow-lg hover:shadow-blue-500/25 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <Loader2 className="animate-spin mr-2 h-5 w-5" />
                      Loading...
                    </>
                  ) : (
                    'Get Started'
                  )}
                </button>
              </div>
            </nav>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden p-2 rounded-xl hover:bg-slate-800 transition-colors"
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>

          {/* Mobile Navigation */}
          <div className={`lg:hidden transition-all duration-300 ease-in-out ${isMenuOpen ? 'max-h-96 opacity-100 mt-4' : 'max-h-0 opacity-0'
            } overflow-hidden`}>
            <div className="py-4 space-y-2">
              {['Home', 'Services', 'Team', 'Platforms', 'Gallery', 'Contact'].map((item) => (
                <button
                  key={item}
                  onClick={() => scrollToSection(item.toLowerCase())}
                  className="block w-full text-left px-4 py-3 text-slate-300 hover:text-blue-400 hover:bg-slate-800/50 rounded-lg transition-all"
                >
                  {item}
                </button>
              ))}
              <div className="border-t border-slate-800 pt-4 mt-4">
                <button className="flex items-center space-x-2 px-4 py-3 text-slate-400 hover:text-blue-400 transition-colors">
                  <Shield className="w-4 h-4" />
                  <span>Privacy Policy</span>
                </button>
                <button className="flex items-center space-x-2 px-4 py-3 text-slate-400 hover:text-blue-400 transition-colors">
                  <FileText className="w-4 h-4" />
                  <span>Terms of Service</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Enhanced Hero Section */}
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

        {/* Enhanced Carousel Controls */}
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

        {/* Enhanced Indicators */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-3">
          {carouselSlides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-12 h-2 rounded-full transition-all ${index === currentSlide
                ? 'bg-gradient-to-r from-blue-400 to-purple-400'
                : 'bg-slate-600 hover:bg-slate-500'
                }`}
            />
          ))}
        </div>
      </section>

      {/* Enhanced Services Section */}
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
            {[
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
            ].map((service, index) => (
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

      {/* Enhanced Team Section */}
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

      {/* Enhanced Platforms Section */}
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
                  style={{ '--border-color': platform.color, } as React.CSSProperties}
                >
                  <div className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-10 transition-opacity duration-500"
                    style={{ backgroundColor: platform.color }} />

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

      {/* Enhanced Gallery Section */}
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

      {/* Enhanced Contact Section */}
      <section id="contact" className="py-24 bg-gradient-to-br from-slate-900 to-slate-800 relative">
        <div className="container mx-auto px-6">
          <div className="text-center mb-20">
            <span className="inline-block px-4 py-2 bg-yellow-500/20 backdrop-blur-sm rounded-full text-yellow-300 text-sm font-medium mb-6">
              Contact Us
            </span>
            <h2 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
              Start Your Journey
            </h2>
            <p className="text-xl text-slate-400 max-w-3xl mx-auto">
              Ready to transform your brand&apos;s digital presence? Let&apos;s create something amazing together.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-16 max-w-6xl mx-auto">
            {/* Contact Info */}
            <div className="space-y-8">
              <div>
                <h3 className="text-3xl font-bold mb-8 text-white">Get in Touch</h3>
                <p className="text-slate-300 text-lg mb-8 leading-relaxed">
                  We&apos;re here to help you navigate the world of influencer marketing.
                  Reach out to discuss your next campaign or partnership opportunity.
                </p>
              </div>

              <div className="space-y-6">
                {[
                  { icon: Mail, label: "Email", value: "hello@gayatridigital.com", href: "mailto:hello@gayatridigital.com" },
                  { icon: Phone, label: "Phone", value: "+62 21 1234 5678", href: "tel:+622112345678" },
                  { icon: MapPin, label: "Location", value: "Jakarta, Indonesia", href: "#" }
                ].map((contact, index) => (
                  <a
                    key={index}
                    href={contact.href}
                    className="flex items-center space-x-4 p-4 rounded-2xl bg-slate-800/50 hover:bg-slate-700/50 transition-all duration-300 group"
                  >
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                      <contact.icon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="text-slate-400 text-sm">{contact.label}</p>
                      <p className="text-white font-medium">{contact.value}</p>
                    </div>
                  </a>
                ))}
              </div>

              {/* Social Links */}
              <div className="pt-8">
                <h4 className="text-lg font-semibold mb-4 text-white">Follow Us</h4>
                <div className="flex space-x-4">
                  {[
                    { icon: FaInstagram, color: "#E4405F", href: "#" },
                    { icon: FaTwitter, color: "#1DA1F2", href: "#" },
                    { icon: FaLinkedin, color: "#0077B5", href: "#" },
                    { icon: FaYoutube, color: "#FF0000", href: "#" }
                  ].map((social, index) => (
                    <a
                      key={index}
                      href={social.href}
                      className="w-12 h-12 bg-slate-800 rounded-xl flex items-center justify-center hover:bg-slate-700 transition-all duration-300 transform hover:scale-110 group"
                      style={{ '--hover-color': social.color, } as React.CSSProperties}
                    >
                      <social.icon
                        className="w-5 h-5 text-slate-400 group-hover:text-white transition-colors"
                      />
                    </a>
                  ))}
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-sm p-8 rounded-3xl border border-slate-700/50">
              <form className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">First Name</label>
                    <input
                      type="text"
                      className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl focus:border-blue-400 focus:outline-none transition-colors text-white placeholder-slate-400"
                      placeholder="John"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Last Name</label>
                    <input
                      type="text"
                      className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl focus:border-blue-400 focus:outline-none transition-colors text-white placeholder-slate-400"
                      placeholder="Doe"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Email</label>
                  <input
                    type="email"
                    className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl focus:border-blue-400 focus:outline-none transition-colors text-white placeholder-slate-400"
                    placeholder="john@example.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Company</label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl focus:border-blue-400 focus:outline-none transition-colors text-white placeholder-slate-400"
                    placeholder="Your Company"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Project Type</label>
                  <select className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl focus:border-blue-400 focus:outline-none transition-colors text-white">
                    <option value="">Select a service</option>
                    <option value="influencer-campaign">Influencer Campaign</option>
                    <option value="brand-partnership">Brand Partnership</option>
                    <option value="content-creation">Content Creation</option>
                    <option value="consulting">Strategy Consulting</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Message</label>
                  <textarea
                    rows={4}
                    className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl focus:border-blue-400 focus:outline-none transition-colors resize-none text-white placeholder-slate-400"
                    placeholder="Tell us about your project goals and requirements..."
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-4 rounded-xl font-semibold hover:from-blue-600 hover:to-purple-700 transition-all transform hover:scale-105 shadow-lg hover:shadow-blue-500/25"
                >
                  Send Message
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Footer */}
      <footer className="bg-slate-950 py-16 border-t border-slate-800">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
            {/* Company Info */}
            <div className="lg:col-span-2">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <span className="text-white font-bold text-xl">G</span>
                </div>
                <div className="text-2xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-blue-600 bg-clip-text text-transparent">
                  GayatriDigital
                </div>
              </div>
              <p className="text-slate-400 text-lg leading-relaxed mb-6 max-w-md">
                Transforming brands through authentic influencer partnerships and data-driven marketing strategies.
                Your success is our mission.
              </p>
              <div className="flex space-x-4">
                {[
                  { icon: FaInstagram, href: "#", color: "#E4405F" },
                  { icon: FaTwitter, href: "#", color: "#1DA1F2" },
                  { icon: FaLinkedin, href: "#", color: "#0077B5" },
                  { icon: FaYoutube, href: "#", color: "#FF0000" },
                  { icon: FaTiktok, href: "#", color: "#000000" }
                ].map((social, index) => (
                  <a
                    key={index}
                    href={social.href}
                    className="w-10 h-10 bg-slate-800 rounded-lg flex items-center justify-center hover:bg-slate-700 transition-all duration-300 transform hover:scale-110 group"
                  >
                    <social.icon className="w-5 h-5 text-slate-400 group-hover:text-white transition-colors" />
                  </a>
                ))}
              </div>
            </div>

            {/* Services */}
            <div>
              <h4 className="text-lg font-semibold mb-6 text-white">Services</h4>
              <ul className="space-y-3">
                {[
                  'Influencer Discovery',
                  'Campaign Management',
                  'Content Creation',
                  'Performance Analytics',
                  'Brand Partnerships',
                  'Strategy Consulting'
                ].map((service, index) => (
                  <li key={index}>
                    <a href="#" className="text-slate-400 hover:text-blue-400 transition-colors">
                      {service}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Company */}
            <div>
              <h4 className="text-lg font-semibold mb-6 text-white">Company</h4>
              <ul className="space-y-3">
                {[
                  'About Us',
                  'Our Team',
                  'Careers',
                  'News & Press',
                  'Case Studies',
                  'Contact'
                ].map((item, index) => (
                  <li key={index}>
                    <a href="#" className="text-slate-400 hover:text-blue-400 transition-colors">
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Bottom Section */}
          <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-slate-400 text-sm">
              © 2025 GayatriDigital. All rights reserved.
            </div>

            <div className="flex items-center space-x-6 text-sm">
              <a href="#" className="text-slate-400 hover:text-blue-400 transition-colors flex items-center space-x-1">
                <Shield className="w-4 h-4" />
                <span>Privacy Policy</span>
              </a>
              <a href="#" className="text-slate-400 hover:text-blue-400 transition-colors flex items-center space-x-1">
                <FileText className="w-4 h-4" />
                <span>Terms of Service</span>
              </a>
              <a href="#" className="text-slate-400 hover:text-blue-400 transition-colors">
                Cookie Policy
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default InfluencerAgency;