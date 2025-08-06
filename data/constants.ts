import { Users, TrendingUp, Star } from 'lucide-react';
import { FaFacebook, FaInstagram, FaLinkedin, FaTiktok, FaTwitter, FaYoutube } from 'react-icons/fa';

export const carouselSlides = [
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

export const teamMembers = [
  {
    name: "",
    role: "Founder",
    image: "/images/teams/1_big.jpg",
    bio: "10+ years in digital marketing"
  },
  {
    name: "",
    role: "Business Director",
    image: "/images/teams/2_big.jpg",
    bio: "Award-winning creative strategist"
  },
  {
    name: "",
    role: "Senior Account Manager",
    image: "/images/teams/4_big.jpg",
    bio: "Expert in influencer relations"
  },
  {
    name: "",
    role: "Account Executive",
    image: "/images/teams/5_big.jpg",
    bio: "AI & ML specialist"
  }
];

export const platforms = [
  { name: "Instagram", icon: FaInstagram, users: "2B+", color: "#E4405F", growth: "+15%" },
  { name: "YouTube", icon: FaYoutube, users: "2.7B+", color: "#FF0000", growth: "+12%" },
  { name: "TikTok", icon: FaTiktok, users: "1B+", color: "#000000", growth: "+28%" },
  { name: "Twitter", icon: FaTwitter, users: "450M+", color: "#1DA1F2", growth: "+8%" },
  { name: "Facebook", icon: FaFacebook, users: "2.9B+", color: "#4267B2", growth: "+5%" },
  { name: "LinkedIn", icon: FaLinkedin, users: "900M+", color: "#0077B5", growth: "+18%" }
];

export const videoGallery = [
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

export const stats = [
  { number: "50K+", label: "Verified Creators", icon: Users },
  { number: "500M+", label: "Total Reach", icon: TrendingUp },
  { number: "98%", label: "Client Satisfaction", icon: Star },
  { number: "300%", label: "Average ROI", icon: TrendingUp }
];