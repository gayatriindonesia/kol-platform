"use client";

import React from 'react';
import Link from 'next/link';
import { Shield, FileText } from 'lucide-react';
import { FaInstagram, FaTwitter, FaLinkedin, FaYoutube, FaTiktok } from 'react-icons/fa';

const Footer = () => {
  const services = [
    'Social Ads',
    'Programmatic',
    'Universal Ads',
    'KOL',
    'Ad Optimization',
  ];

  const company = [
    'About Us',
    'Our Team',
    'Careers',
    'News & Press',
    'Case Studies',
    'Contact'
  ];

  const socialLinks = [
    { icon: FaInstagram, href: "#", color: "#E4405F" },
    { icon: FaTwitter, href: "#", color: "#1DA1F2" },
    { icon: FaLinkedin, href: "#", color: "#0077B5" },
    { icon: FaYoutube, href: "#", color: "#FF0000" },
    { icon: FaTiktok, href: "#", color: "#000000" }
  ];

  return (
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
              Let&apos;s make your brand brilliant!

              If you would like to work with us or just want to get in touch, we&apos;d love to hear from you!
            </p>
            <div className="flex space-x-4">
              {socialLinks.map((social, index) => (
                <Link
                  key={index}
                  href={social.href}
                  className="w-10 h-10 bg-slate-800 rounded-lg flex items-center justify-center hover:bg-slate-700 transition-all duration-300 transform hover:scale-110 group"
                >
                  <social.icon className="w-5 h-5 text-slate-400 group-hover:text-white transition-colors" />
                </Link>
              ))}
            </div>
          </div>

          {/* Services */}
          <div>
            <h4 className="text-lg font-semibold mb-6 text-white">Services</h4>
            <ul className="space-y-3">
              {services.map((service, index) => (
                <li key={index}>
                  <Link href="#" className="text-slate-400 hover:text-blue-400 transition-colors">
                    {service}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-lg font-semibold mb-6 text-white">Company</h4>
            <ul className="space-y-3">
              {company.map((item, index) => (
                <li key={index}>
                  <Link href="#" className="text-slate-400 hover:text-blue-400 transition-colors">
                    {item}
                  </Link>
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
            <Link href="#" className="text-slate-400 hover:text-blue-400 transition-colors flex items-center space-x-1">
              <Shield className="w-4 h-4" />
              <span>Privacy Policy</span>
            </Link>
            <Link href="#" className="text-slate-400 hover:text-blue-400 transition-colors flex items-center space-x-1">
              <FileText className="w-4 h-4" />
              <span>Terms of Service</span>
            </Link>
            <Link href="#" className="text-slate-400 hover:text-blue-400 transition-colors">
              Cookie Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;