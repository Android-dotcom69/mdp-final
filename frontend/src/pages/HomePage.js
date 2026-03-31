// src/pages/HomePage.js - Matte Black Theme
import React from 'react';
import { Link } from 'react-router-dom';
import { Video, FileText, Users, Settings, ChevronRight, Shield, Zap, Eye, Scan, Lock, Activity, Sparkles } from 'lucide-react';

const FeatureCard = ({ icon: Icon, title, description, to, color }) => (
  <Link to={to} className="group relative block">
    <div className="relative bg-neutral-900 rounded-2xl p-6 border border-neutral-800 hover:border-neutral-600 transition-all duration-500 hover:shadow-lg hover:shadow-black/40 hover:-translate-y-1">
      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
        <Icon className="text-white" size={22} />
      </div>
      <h3 className="text-lg font-bold text-white mb-2 group-hover:text-neutral-300 transition-colors">
        {title}
      </h3>
      <p className="text-neutral-500 text-sm leading-relaxed">
        {description}
      </p>
      <div className="mt-4 flex items-center text-neutral-400 text-sm font-medium opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-[-10px] group-hover:translate-x-0">
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
      color: 'from-neutral-600 to-neutral-700'
    },
    {
      icon: FileText,
      title: 'Event Logs',
      description: 'Complete history of all recognition events with search and filtering.',
      to: '/logs',
      color: 'from-neutral-600 to-neutral-700'
    },
    {
      icon: Users,
      title: 'Personnel Management',
      description: 'Enroll and manage authorized personnel with easy registration.',
      to: '/settings',
      color: 'from-neutral-600 to-neutral-700'
    },
    {
      icon: Settings,
      title: 'System Configuration',
      description: 'Configure detection parameters, cameras, and notification settings.',
      to: '/settings',
      color: 'from-neutral-600 to-neutral-700'
    }
  ];

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Hero Section */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-b from-neutral-900/50 to-black"></div>
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-28">
          <div className="text-center">
            <div className="inline-flex items-center px-4 py-2 bg-neutral-900 border border-neutral-800 rounded-full mb-8">
              <Shield className="text-white mr-2" size={16} />
              <span className="text-sm font-medium text-neutral-300 tracking-wider uppercase">
                AI-Powered Security
              </span>
            </div>

            <h1 className="text-5xl sm:text-6xl md:text-7xl font-extrabold mb-6 leading-tight tracking-tight text-white">
              VisionLog
              <br />
              <span className="text-neutral-500">Face Recognition</span>
            </h1>

            <p className="max-w-xl mx-auto text-lg text-neutral-500 mb-12 leading-relaxed">
              Intelligent facial recognition for workplace management and secure access control.
            </p>

            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link
                to="/dashboard"
                className="inline-flex items-center justify-center px-8 py-4 bg-white text-black font-semibold rounded-xl hover:bg-neutral-200 transform hover:scale-105 transition-all duration-300"
              >
                <Scan className="mr-2" size={20} />
                Open Dashboard
              </Link>
              <Link
                to="/settings"
                className="inline-flex items-center justify-center px-8 py-4 bg-neutral-900 text-white font-semibold rounded-xl hover:bg-neutral-800 transform hover:scale-105 transition-all duration-300 border border-neutral-800"
              >
                <Users className="mr-2" size={20} />
                Manage Personnel
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="grid grid-cols-3 gap-4 sm:gap-8">
          <div className="text-center p-6 bg-neutral-900 rounded-2xl border border-neutral-800">
            <Eye className="mx-auto mb-3 text-neutral-400" size={28} />
            <p className="text-3xl sm:text-4xl font-bold text-white">24/7</p>
            <p className="text-xs sm:text-sm text-neutral-600 mt-1">Continuous Monitoring</p>
          </div>
          <div className="text-center p-6 bg-neutral-900 rounded-2xl border border-neutral-800">
            <Shield className="mx-auto mb-3 text-neutral-400" size={28} />
            <p className="text-3xl sm:text-4xl font-bold text-white">85%</p>
            <p className="text-xs sm:text-sm text-neutral-600 mt-1">Recognition Accuracy</p>
          </div>
          <div className="text-center p-6 bg-neutral-900 rounded-2xl border border-neutral-800">
            <Zap className="mx-auto mb-3 text-neutral-400" size={28} />
            <p className="text-3xl sm:text-4xl font-bold text-white">~5s</p>
            <p className="text-xs sm:text-sm text-neutral-600 mt-1">Detection Speed</p>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="text-center mb-14">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4 tracking-tight text-white">
            Core Capabilities
          </h2>
          <p className="text-neutral-600 max-w-2xl mx-auto">
            A comprehensive platform for workplace security and personnel monitoring
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {features.map((feature, index) => (
            <FeatureCard key={index} {...feature} />
          ))}
        </div>
      </div>

      {/* Key Benefits */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="bg-neutral-900 rounded-2xl p-8 sm:p-12 border border-neutral-800">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center group">
              <div className="w-14 h-14 mx-auto mb-4 bg-neutral-800 rounded-xl flex items-center justify-center group-hover:bg-neutral-700 transition-colors duration-300">
                <Lock className="text-neutral-400" size={24} />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Secure</h3>
              <p className="text-neutral-600 text-sm">Privacy-focused design with encrypted data handling</p>
            </div>
            <div className="text-center group">
              <div className="w-14 h-14 mx-auto mb-4 bg-neutral-800 rounded-xl flex items-center justify-center group-hover:bg-neutral-700 transition-colors duration-300">
                <Activity className="text-neutral-400" size={24} />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Reliable</h3>
              <p className="text-neutral-600 text-sm">Consistent detection across varying lighting conditions</p>
            </div>
            <div className="text-center group">
              <div className="w-14 h-14 mx-auto mb-4 bg-neutral-800 rounded-xl flex items-center justify-center group-hover:bg-neutral-700 transition-colors duration-300">
                <Scan className="text-neutral-400" size={24} />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Intelligent</h3>
              <p className="text-neutral-600 text-sm">AI-powered recognition with adaptive learning</p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-24 text-center">
        <h2 className="text-3xl font-bold mb-4 text-white">Ready to get started?</h2>
        <p className="text-neutral-600 mb-8 max-w-2xl mx-auto">
          Begin monitoring your workplace with intelligent face recognition technology
        </p>
        <Link
          to="/dashboard"
          className="inline-flex items-center px-8 py-4 bg-white text-black font-semibold rounded-xl hover:bg-neutral-200 transform hover:scale-105 transition-all duration-300"
        >
          Start Monitoring
          <ChevronRight className="ml-2" size={20} />
        </Link>
      </div>
    </div>
  );
};

export default HomePage;
