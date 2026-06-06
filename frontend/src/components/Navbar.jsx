import React from 'react';
import { Bell, ShieldCheck, AlertCircle } from 'lucide-react';

const Navbar = ({ title = 'Dashboard' }) => {
  const hasApiKey = true; // For display, can dynamically bind if needed

  return (
    <header className="h-20 w-[calc(100%-16rem)] fixed top-0 right-0 glass-panel border-b border-borderGlass flex items-center justify-between px-8 z-20">
      <div>
        <h2 className="text-xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
          {title}
        </h2>
        <span className="text-xs text-gray-500">Welcome to your smart career workspace</span>
      </div>

      <div className="flex items-center gap-6">
        {/* Gemini API Key Status Badge */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-borderGlass">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
          <span className="text-[11px] text-gray-400 font-semibold tracking-wider flex items-center gap-1 uppercase">
            AI status: online
          </span>
        </div>

        {/* Notifications */}
        <button className="p-2.5 rounded-xl bg-white/5 border border-borderGlass text-gray-400 hover:text-white hover:bg-white/10 transition-all duration-200 relative group">
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-brandBlue rounded-full shadow-neonBlue"></span>
        </button>

        {/* System Health */}
        <div className="flex items-center gap-2 p-2.5 rounded-xl bg-brandPurple/10 border border-brandPurple/20 text-brandPurple">
          <ShieldCheck className="w-4 h-4 text-brandCyan" />
          <span className="text-[11px] font-semibold text-brandCyan uppercase tracking-wider hidden sm:inline">Secure Node</span>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
