// src/pages/HomePage.js
import React from 'react';
import { Link } from 'react-router-dom';
import { Video, FileText, Users, Settings, ChevronRight, Shield, Zap, Eye, Scan, Lock, Activity } from 'lucide-react';

const FeatureCard = ({ icon: Icon, title, description, to, delay }) => (
  <Link
    to={to}
    className="group bg-white dark:bg-gray-900 rounded-xl shadow-md hover:shadow-xl transition-all duration-500 p-6 transform hover:-translate-y-2 border border-gray-100 dark:border-gray-800"
    style={{ animationDelay: `${delay}ms` }}
  >
    <div className="flex items-center justify-between mb-4">
      <div className="p-3 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg transform group-hover:scale-110 transition-all duration-300">
        <Icon className="text-white" size={24} />
      </div>
      <ChevronRight className="text-gray-400 dark:text-gray-600 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 group-hover:translate-x-1 transition-all duration-300" size={20} />
    </div>
    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
      {title}
    </h3>
    <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">
      {description}
    </p>
  </Link>
);

const StatCard = ({ icon: Icon, value, label }) => (
  <div className="bg-white dark:bg-gray-900 rounded-xl shadow-md p-6 border border-gray-100 dark:border-gray-800 transform hover:scale-105 transition-all duration-300">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-3xl font-bold text-slate-800 dark:text-white">
          {value}
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{label}</p>
      </div>
      <div className="p-4 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/30 dark:to-teal-900/30 rounded-lg">
        <Icon className="text-emerald-600 dark:text-emerald-400" size={24} />
      </div>
    </div>
  </div>
);

const HomePage = () => {
  const features = [
    {
      icon: Video,
      title: 'Live Monitoring',
      description: 'Real-time face detection and recognition with instant alerts for unauthorized access attempts.',
      to: '/dashboard',
      delay: 100
    },
    {
      icon: FileText,
      title: 'Event Logs',
      description: 'Comprehensive history of all recognition events with search and filtering capabilities.',
      to: '/logs',
      delay: 200
    },
    {
      icon: Users,
      title: 'Personnel Management',
      description: 'Enroll and manage authorized personnel with streamlined registration workflows.',
      to: '/settings',
      delay: 300
    },
    {
      icon: Settings,
      title: 'System Configuration',
      description: 'Configure detection parameters, camera sources, and notification preferences.',
      to: '/settings',
      delay: 400
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors duration-500">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-gray-900 to-slate-800"></div>
        <div className="absolute inset-0 opacity-10" style={{backgroundImage: 'radial-gradient(circle at 25% 25%, rgba(16, 185, 129, 0.3) 0%, transparent 50%), radial-gradient(circle at 75% 75%, rgba(20, 184, 166, 0.2) 0%, transparent 50%)'}}></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28">
          <div className="text-center animate-fade-in">
            <div className="inline-flex items-center px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full mb-8">
              <Shield className="text-emerald-400 mr-2" size={18} />
              <span className="text-sm font-medium text-emerald-400 tracking-wide">
                AI-Powered Security System
              </span>
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-white mb-6 leading-tight tracking-tight">
              Fleet Face
              <span className="block text-emerald-400 mt-2">
                Recognition System
              </span>
            </h1>

            <p className="max-w-2xl mx-auto text-lg text-gray-400 mb-10 leading-relaxed">
              Intelligent facial recognition for fleet management and secure access control.
              Monitor, identify, and manage personnel in real time.
            </p>

            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link
                to="/dashboard"
                className="inline-flex items-center justify-center px-8 py-4 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-xl shadow-lg shadow-emerald-500/25 transform hover:scale-105 transition-all duration-300"
              >
                <Scan className="mr-2" size={20} />
                Open Dashboard
              </Link>
              <Link
                to="/settings"
                className="inline-flex items-center justify-center px-8 py-4 bg-white/10 backdrop-blur-sm text-white font-semibold rounded-xl hover:bg-white/20 transform hover:scale-105 transition-all duration-300 border border-white/10"
              >
                <Users className="mr-2" size={20} />
                Manage Personnel
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 animate-fade-in">
          <StatCard icon={Eye} value="24/7" label="Continuous Monitoring" />
          <StatCard icon={Shield} value="85%" label="Recognition Accuracy" />
          <StatCard icon={Zap} value="~5s" label="Detection Speed" />
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-14 animate-fade-in">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4 tracking-tight">
            Core Capabilities
          </h2>
          <p className="text-lg text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
            A comprehensive platform for fleet security and personnel monitoring
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <div key={index} className="animate-fade-in" style={{ animationDelay: `${feature.delay}ms` }}>
              <FeatureCard {...feature} />
            </div>
          ))}
        </div>
      </div>

      {/* Key Benefits */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-gradient-to-r from-slate-800 to-slate-900 dark:from-slate-900 dark:to-gray-950 rounded-2xl shadow-2xl p-8 sm:p-12 animate-fade-in border border-slate-700/50">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-white">
            <div className="text-center transform hover:scale-105 transition-transform duration-300">
              <div className="w-16 h-16 mx-auto mb-4 bg-emerald-500/10 rounded-xl flex items-center justify-center">
                <Lock className="text-emerald-400" size={32} />
              </div>
              <h3 className="text-xl font-bold mb-2">Secure</h3>
              <p className="text-gray-400">
                Privacy-focused design with encrypted data handling
              </p>
            </div>
            <div className="text-center transform hover:scale-105 transition-transform duration-300">
              <div className="w-16 h-16 mx-auto mb-4 bg-emerald-500/10 rounded-xl flex items-center justify-center">
                <Activity className="text-emerald-400" size={32} />
              </div>
              <h3 className="text-xl font-bold mb-2">Reliable</h3>
              <p className="text-gray-400">
                Consistent detection across varying lighting conditions
              </p>
            </div>
            <div className="text-center transform hover:scale-105 transition-transform duration-300">
              <div className="w-16 h-16 mx-auto mb-4 bg-emerald-500/10 rounded-xl flex items-center justify-center">
                <Scan className="text-emerald-400" size={32} />
              </div>
              <h3 className="text-xl font-bold mb-2">Intelligent</h3>
              <p className="text-gray-400">
                AI-powered recognition with adaptive learning
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center animate-fade-in">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4 tracking-tight">
          Ready to get started?
        </h2>
        <p className="text-lg text-gray-500 dark:text-gray-400 mb-8 max-w-2xl mx-auto">
          Begin monitoring your fleet with intelligent face recognition technology
        </p>
        <Link
          to="/dashboard"
          className="inline-flex items-center px-8 py-4 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-xl shadow-lg shadow-emerald-500/25 transform hover:scale-105 transition-all duration-300"
        >
          Start Monitoring
          <ChevronRight className="ml-2" size={20} />
        </Link>
      </div>
    </div>
  );
};

export default HomePage;
