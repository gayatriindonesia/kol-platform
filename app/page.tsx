"use client";

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

import { teamMembers, platforms, videoGallery, stats, carouselSlides } from '@/data/constants';
import ServicesSection from '@/components/home/ServicesSection';
import HeroSection from '@/components/home/HeroSection';
import VideoModal from '@/components/home/VideoModal';
import Header from '@/components/home/Header';
import TeamSection from '@/components/home/TeamSection';
import PlatformsSection from '@/components/home/PlatformsSection';
import GallerySection from '@/components/home/GallerySection';
import ContactSection from '@/components/home/ContactSection';
import Footer from '@/components/home/Footer';
import PartnershipClientsSection from '@/components/home/PartnershipClientsSection';

const InfluencerAgency = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState('home');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement | null>(null);

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

  const handleGetStarted = () => {
    setLoading(true);
    setTimeout(() => {
      router.push('/signin');
    }, 1000);
  };

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setIsMenuOpen(false);
  };

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

  return (
    <div className="min-h-screen bg-slate-950 text-white overflow-x-hidden">
      <VideoModal
        selectedVideo={selectedVideo}
        closeVideo={closeVideo}
        videoRef={videoRef}
      />
      
      <Header
        activeSection={activeSection}
        isMenuOpen={isMenuOpen}
        setIsMenuOpen={setIsMenuOpen}
        scrollToSection={scrollToSection}
        handleGetStarted={handleGetStarted}
        loading={loading}
      />
      
      <HeroSection
        currentSlide={currentSlide}
        nextSlide={nextSlide}
        prevSlide={prevSlide}
        setCurrentSlide={setCurrentSlide}
        carouselSlides={carouselSlides}
        stats={stats}
      />
      
      <ServicesSection />
      <PartnershipClientsSection />
      <TeamSection teamMembers={teamMembers} />
      <PlatformsSection platforms={platforms} />
      <GallerySection videoGallery={videoGallery} openVideo={openVideo} />
      <ContactSection />
      <Footer />
    </div>
  );
};

export default InfluencerAgency;