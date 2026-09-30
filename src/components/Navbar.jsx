import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useAccessibility } from '../context/AccessibilityContext';
import { 
  ShieldAlert, 
  Activity, 
  User, 
  LogOut, 
  LogIn, 
  SunMoon, 
  Type, 
  Volume2, 
  VolumeX 
} from 'lucide-react';

export const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const { highContrast, toggleContrast, fontSize, setFontSize, isSpeaking, stopSpeaking } = useAccessibility();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const cycleFontSize = () => {
    if (fontSize === 'normal') setFontSize('large');
    else if (fontSize === 'large') setFontSize('xlarge');
    else setFontSize('normal');
  };

  return (
    <header className="sticky top-0 z-50 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand Logo */}
        <Link to="/" className="flex items-center space-x-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-rose-600 to-red-500 flex items-center justify-center shadow-lg shadow-rose-900/40 group-hover:scale-105 transition-transform">
            <ShieldAlert className="w-6 h-6 text-white animate-pulse" />
          </div>
          <div>
            <span className="text-xl font-black tracking-tight text-white flex items-center gap-1.5">
              SAFEHELP <span className="text-rose-500">AI</span>
            </span>
            <span className="text-[10px] text-slate-400 block -mt-1 font-mono uppercase tracking-wider">
              Emergency Dispatch & Support
            </span>
          </div>
        </Link>

        {/* Accessibility Tools & Navigation Links */}
        <div className="flex items-center space-x-2 sm:space-x-4">
          
          {/* Audio Stopper if speaking */}
          {isSpeaking && (
            <button
              onClick={stopSpeaking}
              className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-semibold hover:bg-amber-500/30 transition-all animate-pulse"
              title="Stop voice read-aloud"
            >
              <VolumeX className="w-4 h-4" />
              <span className="hidden sm:inline">Mute Voice</span>
            </button>
          )}

          {/* High Contrast Mode Toggle */}
          <button
            onClick={toggleContrast}
            className={`p-2 rounded-lg border transition-colors ${
              highContrast 
                ? 'bg-yellow-400 text-black border-yellow-300' 
                : 'bg-slate-800 text-slate-300 border-slate-700 hover:text-white hover:bg-slate-700'
            }`}
            title="Toggle High Contrast Mode (Accessibility)"
            aria-label="Toggle High Contrast Mode"
          >
            <SunMoon className="w-4 h-4" />
          </button>

          {/* Font Size Adjuster */}
          <button
            onClick={cycleFontSize}
            className="p-2 rounded-lg bg-slate-800 text-slate-300 border border-slate-700 hover:text-white hover:bg-slate-700 transition-colors flex items-center gap-1"
            title={`Adjust text size (Current: ${fontSize})`}
            aria-label="Adjust font size"
          >
            <Type className="w-4 h-4" />
            <span className="text-xs font-bold uppercase">{fontSize === 'normal' ? 'A' : fontSize === 'large' ? 'A+' : 'A++'}</span>
          </button>

          {/* Dashboard Link */}
          <Link
            to="/dashboard"
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-800 text-slate-200 border border-slate-700 hover:bg-slate-700 hover:text-white text-xs sm:text-sm font-medium transition-all"
          >
            <Activity className="w-4 h-4 text-emerald-400" />
            <span className="hidden md:inline">Emergency Dashboard</span>
            <span className="md:hidden">Dashboard</span>
          </Link>

          {/* User Auth Links */}
          {isAuthenticated ? (
            <div className="flex items-center space-x-2">
              <Link
                to="/profile"
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-800 text-slate-200 border border-slate-700 hover:bg-slate-700 text-xs sm:text-sm font-medium transition-all"
              >
                <User className="w-4 h-4 text-rose-400" />
                <span className="hidden sm:inline">{user?.name?.split(' ')[0] || 'Profile'}</span>
              </Link>
              <button
                onClick={handleLogout}
                className="p-2 rounded-lg bg-slate-800 text-slate-400 hover:text-rose-400 hover:bg-slate-700 transition-colors"
                title="Log Out"
                aria-label="Log Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs sm:text-sm font-semibold transition-all shadow-md shadow-rose-900/30"
            >
              <LogIn className="w-4 h-4" />
              <span>Login</span>
            </Link>
          )}

        </div>
      </div>
    </header>
  );
};
