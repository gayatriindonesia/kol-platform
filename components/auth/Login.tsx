"use client"

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Eye, 
  EyeOff, 
  Mail, 
  Lock, 
  Sparkles, 
  TrendingUp, 
  Users, 
  Zap,
  Star,
  Play,
  Heart,
  MessageCircle,
  Share2
} from 'lucide-react';

// Mock form handling
const LoginForm = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword(prev => !prev);
  };

  const handleGoogleLogin = async () => {
    setIsGoogleLoading(true);
    // Simulate API call
    setTimeout(() => setIsGoogleLoading(false), 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-20 w-32 h-32 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute top-40 right-20 w-32 h-32 bg-pink-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-40 w-32 h-32 bg-orange-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
        
        {/* Floating Icons */}
        <div className="absolute top-1/4 left-10 text-purple-300 animate-float">
          <Heart size={24} />
        </div>
        <div className="absolute top-1/3 right-10 text-pink-300 animate-float animation-delay-1000">
          <Star size={28} />
        </div>
        <div className="absolute bottom-1/4 left-16 text-orange-300 animate-float animation-delay-2000">
          <MessageCircle size={26} />
        </div>
        <div className="absolute bottom-1/3 right-16 text-purple-300 animate-float animation-delay-3000">
          <Share2 size={24} />
        </div>
      </div>

      <div className="w-full max-w-6xl mx-auto grid lg:grid-cols-2 gap-8 items-center relative z-10">
        {/* Left Side - Branding & Features */}
        <div className="hidden lg:block space-y-8">
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  InfluenceHub
                </h1>
                <p className="text-gray-600">Digital Marketing Platform</p>
              </div>
            </div>
            
            <h2 className="text-4xl font-bold text-gray-900 leading-tight">
              Transform Your
              <span className="block bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 bg-clip-text text-transparent">
                Digital Influence
              </span>
            </h2>
            
            <p className="text-xl text-gray-600 leading-relaxed">
              Connect with top influencers, manage campaigns, and track performance all in one powerful platform.
            </p>
          </div>

          {/* Feature Cards */}
          <div className="grid gap-4">
            <div className="flex items-center space-x-4 p-4 bg-white/60 backdrop-blur-sm rounded-2xl border border-white/20 hover:bg-white/80 transition-all duration-300 group">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Analytics & Insights</h3>
                <p className="text-gray-600 text-sm">Real-time campaign performance tracking</p>
              </div>
            </div>

            <div className="flex items-center space-x-4 p-4 bg-white/60 backdrop-blur-sm rounded-2xl border border-white/20 hover:bg-white/80 transition-all duration-300 group">
              <div className="w-12 h-12 bg-pink-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Users className="w-6 h-6 text-pink-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Influencer Network</h3>
                <p className="text-gray-600 text-sm">Access to 10,000+ verified creators</p>
              </div>
            </div>

            <div className="flex items-center space-x-4 p-4 bg-white/60 backdrop-blur-sm rounded-2xl border border-white/20 hover:bg-white/80 transition-all duration-300 group">
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Zap className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Smart Matching</h3>
                <p className="text-gray-600 text-sm">AI-powered influencer recommendations</p>
              </div>
            </div>
          </div>

          {/* Social Proof */}
          <div className="flex items-center space-x-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">50K+</div>
              <div className="text-sm text-gray-600">Active Brands</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">2.5M+</div>
              <div className="text-sm text-gray-600">Campaigns</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">98%</div>
              <div className="text-sm text-gray-600">Success Rate</div>
            </div>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="flex items-center justify-center">
          <Card className="w-full max-w-md bg-white/80 backdrop-blur-sm border-white/20 shadow-xl">
            <CardHeader className="text-center space-y-4 pb-6">
              <div className="flex justify-center">
                <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center lg:hidden">
                  <Sparkles className="w-8 h-8 text-white" />
                </div>
              </div>
              <div className="space-y-2">
                <CardTitle className="text-2xl font-bold text-gray-900">Welcome Back!</CardTitle>
                <CardDescription className="text-gray-600">
                  Sign in to your account to continue
                </CardDescription>
              </div>
              
              {/* Live Stats */}
              <div className="flex justify-center space-x-2">
                <Badge variant="secondary" className="bg-green-100 text-green-700 border-0">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-1 animate-pulse"></div>
                  1,234 online
                </Badge>
                <Badge variant="secondary" className="bg-blue-100 text-blue-700 border-0">
                  <Play size={12} className="mr-1" />
                  45 campaigns live
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              <div className="space-y-4">
                {/* Email Field */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10 h-12 bg-white/50 border-gray-200 focus:border-purple-500 focus:ring-purple-500/20"
                      required
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-gray-700">Password</label>
                    <a href="/reset-password" className="text-sm text-purple-600 hover:text-purple-700 transition-colors">
                      Forgot password?
                    </a>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10 pr-12 h-12 bg-white/50 border-gray-200 focus:border-purple-500 focus:ring-purple-500/20"
                      required
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                      onClick={togglePasswordVisibility}
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>

                {/* Login Button */}
                <Button 
                  type="submit" 
                  className="w-full h-12 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-medium rounded-xl transition-all duration-300 transform hover:scale-[1.02] shadow-lg hover:shadow-xl"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <div className="w-5 h-5 border-2 border-t-transparent border-white rounded-full animate-spin mr-2"></div>
                      Signing in...
                    </div>
                  ) : (
                    'Sign In'
                  )}
                </Button>
              </div>

              {/* Divider */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white text-gray-500">Or continue with</span>
                </div>
              </div>

              {/* Google Login */}
              <Button
                type="button"
                variant="outline"
                onClick={handleGoogleLogin}
                disabled={isGoogleLoading}
                className="w-full h-12 bg-white border-gray-200 hover:bg-gray-50 transition-all duration-300 hover:scale-[1.02] shadow-sm hover:shadow-md"
              >
                {isGoogleLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="w-5 h-5 border-2 border-t-transparent border-gray-600 rounded-full animate-spin mr-2"></div>
                    Connecting...
                  </div>
                ) : (
                  <div className="flex items-center justify-center">
                    <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                      <path
                        d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                        fill="currentColor"
                      />
                    </svg>
                    Continue with Google
                  </div>
                )}
              </Button>

              {/* Sign Up Link */}
              <div className="text-center">
                <span className="text-gray-600">Don&apos;t have an account? </span>
                <a href="/signup" className="text-purple-600 hover:text-purple-700 font-medium transition-colors">
                  Create account
                </a>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <style jsx>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        
        .animate-blob {
          animation: blob 7s infinite;
        }
        
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        
        .animation-delay-1000 {
          animation-delay: 1s;
        }
        
        .animation-delay-3000 {
          animation-delay: 3s;
        }
      `}</style>
    </div>
  );
};

export default LoginForm;