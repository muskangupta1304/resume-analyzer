import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  UploadCloud, 
  FileText, 
  FileEdit, 
  Briefcase, 
  LineChart, 
  Settings, 
  Target,
  Trello,
  Globe,
  Gamepad2,
  FileSpreadsheet,
  GitCompare,
  MessageSquare
} from 'lucide-react';

const Sidebar = () => {
  const userName = 'Premium User';

  const menuItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Upload Resume', path: '/upload', icon: UploadCloud },
    { name: 'ATS Analysis', path: '/analysis', icon: FileText },
    { name: 'Resume Builder', path: '/builder', icon: FileEdit },
    { name: 'Job Matching', path: '/jobs', icon: Briefcase },
    { name: 'Pipeline Tracker', path: '/pipeline', icon: Trello },
    { name: 'Portfolio Site', path: '/portfolio', icon: Globe },
    { name: 'Skill Gap Analysis', path: '/skill-gap', icon: LineChart },
    { name: 'Interview Coach', path: '/interview-prep', icon: Gamepad2 },
    { name: 'Cover Letter AI', path: '/cover-letter', icon: FileSpreadsheet },
    { name: 'Version Comparison', path: '/comparison', icon: GitCompare },
    { name: 'AI Mentor Chat', path: '/chat', icon: MessageSquare },
  ];

  return (
    <aside className="w-64 h-screen fixed left-0 top-0 glass-panel border-r border-borderGlass flex flex-col justify-between z-30">
      <div>
        {/* Brand Logo */}
        <div className="p-6 border-b border-borderGlass flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brandBlue to-brandPurple flex items-center justify-center shadow-neonBlue">
            <Target className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="font-extrabold text-lg bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">CAREER AI</h1>
            <span className="text-[10px] text-brandCyan tracking-widest font-semibold uppercase">PRO AUDITOR</span>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="p-4 space-y-1 overflow-y-auto max-h-[calc(100vh-170px)] pr-2 scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.name}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group ${
                    isActive
                      ? 'bg-gradient-to-r from-brandBlue/20 to-brandPurple/20 text-white border-l-4 border-brandBlue shadow-neonBlue/10'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`
                }
              >
                <Icon className="w-5 h-5 transition-transform duration-200 group-hover:scale-110" />
                {item.name}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* User Footer Profile (No Logout Action Required) */}
      <div className="p-6 border-t border-borderGlass">
        <div className="flex items-center gap-3 px-2 py-1">
          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-brandPurple to-brandCyan flex items-center justify-center font-bold text-white text-sm">
            {userName.charAt(0).toUpperCase()}
          </div>
          <div className="overflow-hidden">
            <h4 className="text-xs font-semibold text-white truncate">{userName}</h4>
            <span className="text-[10px] text-brandCyan tracking-wide block font-medium">Active Workspace</span>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
