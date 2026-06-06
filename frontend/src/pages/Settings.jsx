import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Settings as SettingsIcon, ShieldCheck, Mail, Target, Key } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import GlassCard from '../components/GlassCard';

const Settings = () => {
  const userName = localStorage.getItem('userName') || 'Job Seeker';
  const userEmail = localStorage.getItem('userEmail') || 'user@example.com';

  const [status, setStatus] = useState({ isGeminiActive: false, isMongoActive: false });

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await axios.get('/api/status');
        if (res.data && res.data.success) {
          setStatus({
            isGeminiActive: res.data.isGeminiActive,
            isMongoActive: res.data.isMongoActive
          });
        }
      } catch (err) {
        console.error('Error fetching environment status:', err);
      }
    };
    fetchStatus();
  }, []);

  const configChecklist = [
    { text: 'Create MongoDB Local or Atlas Database', done: status.isMongoActive, pendingText: 'IN-MEMORY DB ACTIVE' },
    { text: 'Seed Environment config variables inside backend/.env', done: true, pendingText: 'PENDING' },
    { text: 'Integrate User Security JWT parameters', done: true, pendingText: 'PENDING' },
    { text: 'Insert active GEMINI_API_KEY for live processing', done: status.isGeminiActive, pendingText: 'PENDING KEY' },
  ];

  return (
    <div className="min-h-screen bg-darkBg text-gray-100 flex">
      <Sidebar />

      <main className="flex-1 ml-64 min-h-screen p-8 pt-28 space-y-8 overflow-y-auto">
        <Navbar title="Workspace Settings" />

        <div className="max-w-3xl mx-auto space-y-6">
          {/* User Profile Card */}
          <GlassCard className="p-6 border border-borderGlass space-y-4">
            <div className="flex items-center gap-2 text-white font-bold text-sm">
              <ShieldCheck className="w-5 h-5 text-brandCyan" /> Account Profile Details
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              <div className="space-y-1">
                <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest block">User Full Name</span>
                <div className="px-3 py-2.5 rounded-xl bg-white/5 border border-borderGlass text-xs text-gray-200">
                  {userName}
                </div>
              </div>
              
              <div className="space-y-1">
                <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest block">Email Address</span>
                <div className="px-3 py-2.5 rounded-xl bg-white/5 border border-borderGlass text-xs text-gray-200 flex items-center gap-2">
                  <Mail className="w-4 h-4 text-gray-500" />
                  {userEmail}
                </div>
              </div>
            </div>
          </GlassCard>

          {/* AI Configuration Guidance */}
          <GlassCard className="p-6 border border-borderGlass space-y-4">
            <div className="flex items-center gap-2 text-brandPurple font-bold text-sm">
              <Key className="w-5 h-5 shadow-neonPurple text-brandPurple" /> AI Intelligence Service Configurations
            </div>
            
            <div className="space-y-3.5 text-xs text-gray-300 leading-relaxed">
              <p>
                The Career AI workspace is fully built using the standard <strong>Mongoose collection pipelines</strong> and the <strong>official Gemini AI SDK</strong>. 
                To ensure a flawless out-of-the-box local developer experience, we have written a <strong>High-Fidelity Mock AI Fallback System</strong> inside `aiService.js`.
              </p>
              
              <div className="p-4 bg-brandBlue/5 rounded-2xl border border-brandBlue/15 text-[11px] text-gray-400 space-y-2">
                <h5 className="font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                  💡 Running Live Gemini Operations:
                </h5>
                <ol className="list-decimal pl-4 space-y-1">
                  <li>Generate an API Key on your Google AI Studio portal.</li>
                  <li>Open the file <code className="text-brandCyan font-mono bg-white/5 px-1 py-0.5 rounded">backend/.env</code> in your active workspace.</li>
                  <li>Locate the <code className="text-brandCyan font-mono">GEMINI_API_KEY</code> field and paste your active key there.</li>
                  <li>Save and restart the Express server! The backend will automatically detect the key and switch from mock fallback into live Gemini AI intelligence.</li>
                </ol>
              </div>
            </div>
          </GlassCard>

          {/* Workspace Health Checklist */}
          <GlassCard className="p-6 border border-borderGlass space-y-4">
            <div className="flex items-center gap-2 text-white font-bold text-sm">
              <Target className="w-5 h-5 text-accentGold" /> Local Launch Checklists
            </div>

            <div className="space-y-3">
              {configChecklist.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between text-xs p-3 rounded-xl bg-white/5 border border-borderGlass">
                  <span className="text-gray-300">{item.text}</span>
                  <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold ${
                    item.done 
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                      : item.pendingText.includes('ACTIVE') 
                        ? 'bg-brandBlue/10 text-brandCyan border border-brandBlue/20' 
                        : 'bg-amber-500/10 text-amber-400 border border-amber-500/20 animate-pulse'
                  }`}>
                    {item.done ? 'COMPLETED' : item.pendingText}
                  </span>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>
      </main>
    </div>
  );
};

export default Settings;
