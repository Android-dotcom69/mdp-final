// src/pages/HomePage.js - Galaxy Theme
import React from 'react';
import { Link } from 'react-router-dom';
import { Video, FileText, Users, Settings, ChevronRight, Shield, Zap, Eye, Scan, Lock, Activity, Sparkles } from 'lucide-react';

const FeatureCard = ({ icon: Icon, title, description, to, color }) => (
  <Link to={to} className="group relative block">
    <div className="relative bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10 hover:border-violet-500/50 transition-all duration-500 hover:shadow-lg hover:shadow-violet-500/10 hover:-translate-y-1 overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-violet-500/10 to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
        <Icon className="text-white" size={22} />
      </div>
      <h3 className="text-lg font-bold text-white mb-2 group-hover:text-violet-300 transition-colors">
        {title}
      </h3>
      <p className="text-gray-400 text-sm leading-relaxed">
        {description}
      </p>
      <div className="mt-4 flex items-center text-violet-400 text-sm font-medium opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-[-10px] group-hover:translate-x-0">
        Explore <ChevronRight size={16} className="ml-1" />
      </div>
    </div>
  </Link>
);

const HomePage = () => {
  const features = [
    {
      icon: Video,
      title: 'Live Monitoring',
      description: 'Real-time face detection and recognition with instant alerts for unauthorized access.',
      to: '/dashboard',
      color: 'from-violet-500 to-purple-600'
    },
    {
      icon: FileText,
      title: 'Event Logs',
      description: 'Complete history of all recognition events with search and filtering.',
      to: '/logs',
      color: 'from-cyan-500 to-blue-600'
    },
    {
      icon: Users,
      title: 'Personnel Management',
      description: 'Enroll and manage authorized personnel with easy registration.',
      to: '/settings',
      color: 'from-fuchsia-500 to-pink-600'
    },
    {
      icon: Settings,
      title: 'System Configuration',
      description: 'Configure detection parameters, cameras, and notification settings.',
      to: '/settings',
      color: 'from-amber-500 to-orange-600'
    }
  ];

  return (
    <div className="min-h-screen bg-[#0a0a1a] text-white overflow-hidden">
      {/* Animated background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a1a] via-[#0d0d2b] to-[#0a0a1a]"></div>
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-violet-600/20 rounded-full blur-[128px] animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-600/15 rounded-full blur-[128px] animate-pulse" style={{animationDelay: '2s'}}></div>
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-fuchsia-600/10 rounded-full blur-[100px] animate-pulse" style={{animationDelay: '4s'}}></div>
      </div>

      <div className="relative z-10">
        {/* Hero Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-24 sm:pt-24 sm:pb-32">
          <div className="text-center animate-fade-in">
            <div className="inline-flex items-center px-4 py-2 bg-violet-500/10 border border-violet-500/20 rounded-full mb-8 backdrop-blur-sm">
              <Sparkles className="text-violet-400 mr-2" size={16} />
              <span className="text-sm font-medium text-violet-300 tracking-wide">
                AI-Powered Security System
              </span>
            </div>

            <h1 className="text-5xl sm:text-6xl md:text-7xl font-extrabold mb-6 leading-tight tracking-tight">
              <span className="bg-gradient-to-r from-white via-gray-100 to-gray-300 bg-clip-text text-transparent">
                Fleet Face
              </span>
              <br />
              <span className="bg-gradient-to-r from-violet-400 via-fuchsia-400 to-cyan-400 bg-clip-text text-transparent">
                Recognition
              </span>
            </h1>

            <p className="max-w-2xl mx-auto text-lg text-gray-400 mb-12 leading-relaxed">
              Intelligent facial recognition for fleet management and secure access control.
              Monitor, identify, and manage personnel in real time.
            </p>

            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link
                to="/dashboard"
                className="inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white font-semibold rounded-xl shadow-lg shadow-violet-500/25 transform hover:scale-105 transition-all duration-300"
              >
                <Scan className="mr-2" size={20} />
                Open Dashboard
              </Link>
              <Link
                to="/settings"
                className="inline-flex items-center justify-center px-8 py-4 bg-white/5 backdrop-blur-md text-white font-semibold rounded-xl hover:bg-white/10 transform hover:scale-105 transition-all duration-300 border border-white/10"
              >
                <Users className="mr-2" size={20} />
                Manage Personnel
              </Link>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
          <div className="grid grid-cols-3 gap-4 sm:gap-8">
            <div className="text-center p-6 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10">
              <Eye className="mx-auto mb-3 text-cyan-400" size={28} />
              <p className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">24/7</p>
              <p className="text-xs sm:text-sm text-gray-500 mt-1">Continuous Monitoring</p>
            </div>
            <div className="text-center p-6 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10">
              <Shield className="mx-auto mb-3 text-violet-400" size={28} />
              <p className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">85%</p>
              <p className="text-xs sm:text-sm text-gray-500 mt-1">Recognition Accuracy</p>
            </div>
            <div className="text-center p-6 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10">
              <Zap className="mx-auto mb-3 text-amber-400" size={28} />
              <p className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">~5s</p>
              <p className="text-xs sm:text-sm text-gray-500 mt-1">Detection Speed</p>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
          <div className="text-center mb-14 animate-fade-in">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4 tracking-tight">
              Core <span className="bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">Capabilities</span>
            </h2>
            <p className="text-gray-500 max-w-2xl mx-auto">
              A comprehensive platform for fleet security and personnel monitoring
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {features.map((feature, index) => (
              <div key={index} className="animate-fade-in" style={{ animationDelay: `${index * 100}ms` }}>
                <FeatureCard {...feature} />
              </div>
            ))}
          </div>
        </div>

        {/* Key Benefits */}
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
          <div className="relative bg-gradient-to-br from-violet-600/10 via-fuchsia-600/5 to-cyan-600/10 rounded-3xl p-8 sm:p-12 border border-white/10 backdrop-blur-md overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-violet-500 via-fuchsia-500 to-cyan-500"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center group">
                <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-violet-500/20 to-violet-600/10 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 border border-violet-500/20">
                  <Lock className="text-violet-400" size={28} />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Secure</h3>
                <p className="text-gray-500 text-sm">
                  Privacy-focused design with encrypted data handling
                </p>
              </div>
              <div className="text-center group">
                <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-fuchsia-500/20 to-fuchsia-600/10 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 border border-fuchsia-500/20">
                  <Activity className="text-fuchsia-400" size={28} />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Reliable</h3>
                <p className="text-gray-500 text-sm">
                  Consistent detection across varying lighting conditions
                </p>
              </div>
              <div className="text-center group">
                <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-cyan-500/20 to-cyan-600/10 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 border border-cyan-500/20">
                  <Scan className="text-cyan-400" size={28} />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Intelligent</h3>
                <p className="text-gray-500 text-sm">
                  AI-powered recognition with adaptive learning
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24 text-center animate-fade-in">
          <h2 className="text-3xl font-bold mb-4 tracking-tight">
            Ready to get started?
          </h2>
          <p className="text-gray-500 mb-8 max-w-2xl mx-auto">
            Begin monitoring your fleet with intelligent face recognition technology
          </p>
          <Link
            to="/dashboard"
            className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white font-semibold rounded-xl shadow-lg shadow-violet-500/25 transform hover:scale-105 transition-all duration-300"
          >
            Start Monitoring
            <ChevronRight className="ml-2" size={20} />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
