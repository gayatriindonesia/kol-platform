"use client";

import React from 'react';
import { Mail, Phone, MapPin } from 'lucide-react';
import { FaInstagram, FaTwitter, FaLinkedin, FaYoutube } from 'react-icons/fa';
import Link from 'next/link';

const ContactSection = () => {
  const contactInfo = [
    { icon: Mail, label: "Email", value: "info@gayatriindonesia.com", href: "mailto:info@gayatriindonesia.com" },
    { icon: Phone, label: "Phone", value: "+62 812 8688 5133", href: "tel:+62 812 8688 5133" },
    { icon: MapPin, label: "Location", value: "Jakarta, Indonesia", href: "#" }
  ];

  const socialLinks = [
    { icon: FaInstagram, color: "#E4405F", href: "#" },
    { icon: FaTwitter, color: "#1DA1F2", href: "#" },
    { icon: FaLinkedin, color: "#0077B5", href: "#" },
    { icon: FaYoutube, color: "#FF0000", href: "#" }
  ];

  return (
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
              {contactInfo.map((contact, index) => (
                <Link
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
                </Link>
              ))}
            </div>

            {/* Social Links */}
            <div className="pt-8">
              <h4 className="text-lg font-semibold mb-4 text-white">Follow Us</h4>
              <div className="flex space-x-4">
                {socialLinks.map((social, index) => (
                  <Link
                    key={index}
                    href={social.href}
                    className="w-12 h-12 bg-slate-800 rounded-xl flex items-center justify-center hover:bg-slate-700 transition-all duration-300 transform hover:scale-110 group"
                    style={{ '--hover-color': social.color } as React.CSSProperties}
                  >
                    <social.icon
                      className="w-5 h-5 text-slate-400 group-hover:text-white transition-colors"
                    />
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <ContactForm />
        </div>
      </div>
    </section>
  );
};

const ContactForm = () => {
  return (
    <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-sm p-8 rounded-3xl border border-slate-700/50">
      <form className="space-y-6">
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">First Name</label>
            <input
              type="text"
              className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl focus:border-blue-400 focus:outline-none transition-colors text-white placeholder-slate-400"
              placeholder="Example"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Last Name</label>
            <input
              type="text"
              className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl focus:border-blue-400 focus:outline-none transition-colors text-white placeholder-slate-400"
              placeholder="Last"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">Email</label>
          <input
            type="email"
            className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl focus:border-blue-400 focus:outline-none transition-colors text-white placeholder-slate-400"
            placeholder="info@gayatri.com"
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
            <option value="influencer-campaign">Social Ads</option>
            <option value="brand-partnership">Programmatic</option>
            <option value="content-creation">Universal Ads</option>
            <option value="consulting">KOL</option>
            <option value="consulting">Ad Optimization</option>
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
  );
};

export default ContactSection;