// src/components/Navbar.js - Galaxy Theme
import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import {
  Home,
  LayoutDashboard,
  FileText,
  Settings,
  LogOut,
  Menu,
  X,
  Moon,
  Sun,
  User,
  ChevronDown,
  Shield
} from 'lucide-react';

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const { user, logout, isAuthenticated } = useAuth();
  const { darkMode, toggleDarkMode } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
    setIsMobileMenuOpen(false);
    setIsUserMenuOpen(false);
  };

  const navLinks = [
    { to: '/', label: 'Home', icon: Home },
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/logs', label: 'Logs', icon: FileText },
    { to: '/settings', label: 'Settings', icon: Settings },
  ];

  const isActive = (path) => location.pathname === path;
  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  if (!isAuthenticated) return null;

  return (
    <>
      <nav className="bg-[#0a0a1a]/90 backdrop-blur-xl sticky top-0 z-50 border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link to="/" className="flex items-center space-x-3 group" onClick={closeMobileMenu}>
                <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-fuchsia-600 rounded-xl flex items-center justify-center transform group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-violet-500/20">
                  <Shield className="text-white" size={20} />
                </div>
                <div className="hidden sm:block">
                  <span className="text-lg font-bold text-white tracking-tight">FleetFR</span>
                  <span className="text-[10px] text-gray-500 block -mt-1 tracking-widest uppercase">Face Recognition</span>
                </div>
              </Link>
            </div>

            <div className="hidden md:flex items-center space-x-1">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const active = isActive(link.to);
                return (
                  <Link
                    key={link.to}
                    to={link.to}
                    className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                      active
                        ? 'bg-violet-500/10 text-violet-300 border border-violet-500/20'
                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <Icon size={18} className="mr-2" />
                    {link.label}
                  </Link>
                );
              })}
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={toggleDarkMode}
                className="p-2 rounded-lg hover:bg-white/5 transition-all duration-300"
                title={darkMode ? 'Light Mode' : 'Dark Mode'}
              >
                {darkMode ? <Sun className="text-amber-400" size={20} /> : <Moon className="text-gray-400" size={20} />}
              </button>

              <div className="hidden md:block relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-white/5 transition-all duration-300"
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-violet-500 to-fuchsia-600 rounded-full flex items-center justify-center">
                    <User className="text-white" size={14} />
                  </div>
                  <span className="text-sm font-medium text-gray-300">{user?.username || 'User'}</span>
                  <ChevronDown size={16} className={`text-gray-500 transition-transform duration-300 ${isUserMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                {isUserMenuOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setIsUserMenuOpen(false)}></div>
                    <div className="absolute right-0 mt-2 w-56 bg-[#12122a] rounded-xl shadow-2xl border border-white/10 z-20 animate-fade-in backdrop-blur-xl">
                      <div className="p-3 border-b border-white/5">
                        <p className="text-sm font-semibold text-white">{user?.username}</p>
                        <p className="text-xs text-gray-500">{user?.email}</p>
                      </div>
                      <div className="p-2">
                        <button
                          onClick={() => { navigate('/settings'); setIsUserMenuOpen(false); }}
                          className="w-full flex items-center px-3 py-2 text-sm text-gray-300 hover:bg-white/5 rounded-lg transition-all"
                        >
                          <Settings size={16} className="mr-2" /> Settings
                        </button>
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                        >
                          <LogOut size={16} className="mr-2" /> Logout
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>

              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-2 rounded-lg hover:bg-white/5 transition-all duration-300"
              >
                {isMobileMenuOpen ? <X className="text-gray-300" size={24} /> : <Menu className="text-gray-300" size={24} />}
              </button>
            </div>
          </div>
        </div>

        <div className={`md:hidden transition-all duration-300 ease-in-out ${isMobileMenuOpen ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}`}>
          <div className="px-4 py-3 space-y-2 bg-[#0a0a1a] border-t border-white/5">
            <div className="flex items-center space-x-3 p-3 bg-white/5 rounded-xl mb-3">
              <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-fuchsia-600 rounded-full flex items-center justify-center">
                <User className="text-white" size={20} />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">{user?.username}</p>
                <p className="text-xs text-gray-500">{user?.email}</p>
              </div>
            </div>

            {navLinks.map((link) => {
              const Icon = link.icon;
              const active = isActive(link.to);
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={closeMobileMenu}
                  className={`flex items-center px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 ${
                    active ? 'bg-violet-500/10 text-violet-300' : 'text-gray-400 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <Icon size={20} className="mr-3" />
                  {link.label}
                </Link>
              );
            })}

            <button
              onClick={handleLogout}
              className="w-full flex items-center px-4 py-3 text-sm font-medium text-red-400 hover:bg-red-500/10 rounded-xl transition-all"
            >
              <LogOut size={20} className="mr-3" /> Logout
            </button>
          </div>
        </div>
      </nav>

      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 bg-black/60 z-40" onClick={closeMobileMenu}></div>
      )}
    </>
  );
};

export default Navbar;
