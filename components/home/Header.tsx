"use client";

import React from 'react';
import Link from 'next/link';
import { Shield, FileText, Menu, Loader2 } from 'lucide-react';
import { Button } from '../ui/button';

interface HeaderProps {
  activeSection: string;
  isMenuOpen: boolean;
  setIsMenuOpen: (open: boolean) => void;
  scrollToSection: (section: string) => void;
  handleGetStarted: () => void;
  loading: boolean;
}

const Header: React.FC<HeaderProps> = ({
  activeSection,
  isMenuOpen,
  setIsMenuOpen,
  scrollToSection,
  handleGetStarted,
  loading
}) => {
  const navItems = ['Home', 'Services', 'Team', 'Platforms', 'Gallery', 'Contact'];

  return (
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
            {navItems.map((item) => (
              <button
                key={item}
                onClick={() => scrollToSection(item.toLowerCase())}
                className={`relative px-3 py-2 text-sm font-medium transition-all duration-300 hover:text-blue-400 ${
                  activeSection === item.toLowerCase() ? 'text-blue-400' : 'text-slate-300'
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

            {/* Get Started Button */}
            <div className="flex items-center space-x-4 ml-4">
              <Button
                onClick={handleGetStarted}
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
              </Button>
            </div>
          </nav>

          {/* Mobile Menu Button */}
          <Button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="lg:hidden p-2 rounded-xl hover:bg-slate-800 transition-colors"
          >
            <Menu className="w-6 h-6" />
          </Button>
        </div>

        {/* Mobile Navigation */}
        <div className={`lg:hidden transition-all duration-300 ease-in-out ${
          isMenuOpen ? 'max-h-96 opacity-100 mt-4' : 'max-h-0 opacity-0'
        } overflow-hidden`}>
          <div className="py-4 space-y-2">
            {navItems.map((item) => (
              <Button
                key={item}
                onClick={() => scrollToSection(item.toLowerCase())}
                className="block w-full text-left px-4 py-3 text-slate-300 hover:text-blue-400 hover:bg-slate-800/50 rounded-lg transition-all"
              >
                {item}
              </Button>
            ))}
            <div className="border-t border-slate-800 pt-4 mt-4">
              <Button className="flex items-center space-x-2 px-4 py-3 text-slate-400 hover:text-blue-400 transition-colors">
                <Shield className="w-4 h-4" />
                <span>Privacy Policy</span>
              </Button>
              <Button className="flex items-center space-x-2 px-4 py-3 text-slate-400 hover:text-blue-400 transition-colors">
                <FileText className="w-4 h-4" />
                <span>Terms of Service</span>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;