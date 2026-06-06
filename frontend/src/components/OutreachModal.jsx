import React, { useState, useEffect } from 'react';
import { X, Mail, Linkedin, Copy, Check, Sparkles, Loader } from 'lucide-react';
import axios from 'axios';

const OutreachModal = ({ isOpen, onClose, jobTitle, companyName, jobDescription }) => {
  const [activeTab, setActiveTab] = useState('email'); // 'email' or 'linkedin'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [outreachData, setOutreachData] = useState({ email: '', linkedin: '' });
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    
    const fetchOutreach = async () => {
      setLoading(true);
      setError(null);
      setCopied(false);
      try {
        // 1. Fetch user's active resume to get an ID
        const token = localStorage.getItem('token');
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        
        const resumesRes = await axios.get('http://localhost:5000/api/resume', { headers });
        const resumes = resumesRes.data.data;
        
        if (!resumes || resumes.length === 0) {
          throw new Error('Please upload a resume first to generate personalized outreach scripts.');
        }
        
        const resumeId = resumes[0]._id;

        // 2. Query outreach generator endpoint
        const response = await axios.post(
          'http://localhost:5000/api/analysis/outreach',
          {
            resumeId,
            jobTitle,
            companyName,
            jobDescription
          },
          { headers }
        );

        if (response.data.success) {
          setOutreachData(response.data.data);
        } else {
          throw new Error(response.data.message || 'Failed to draft outreach scripts.');
        }
      } catch (err) {
        console.error('Outreach Generation Error:', err);
        setError(err.response?.data?.message || err.message || 'Connection to AI server lost.');
      } finally {
        setLoading(false);
      }
    };

    fetchOutreach();
  }, [isOpen, jobTitle, companyName, jobDescription]);

  if (!isOpen) return null;

  const handleCopy = () => {
    const textToCopy = activeTab === 'email' ? outreachData.email : outreachData.linkedin;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-slate-900/90 border border-slate-700/50 rounded-2xl shadow-2xl overflow-hidden glass-panel">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-brandBlue to-brandPurple flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white animate-pulse" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-white">AI Outreach Writer</h3>
              <p className="text-xs text-gray-400">Tailored templates for {companyName}</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="h-96 flex flex-col items-center justify-center gap-4 text-gray-300">
            <Loader className="w-10 h-10 text-brandCyan animate-spin" />
            <p className="text-sm font-medium animate-pulse">Drafting high-converting pitches...</p>
          </div>
        )}

        {/* Error State */}
        {!loading && error && (
          <div className="h-96 flex flex-col items-center justify-center gap-3 p-6 text-center">
            <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center text-red-500 mb-2">
              <X className="w-6 h-6" />
            </div>
            <h4 className="text-white font-semibold">Failed to Generate Outreach</h4>
            <p className="text-sm text-gray-400 max-w-md">{error}</p>
            <button 
              onClick={onClose}
              className="mt-4 px-5 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-sm font-medium transition-colors"
            >
              Close
            </button>
          </div>
        )}

        {/* Content Tabs */}
        {!loading && !error && (
          <div className="p-6 space-y-6">
            <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800">
              <button
                onClick={() => { setActiveTab('email'); setCopied(false); }}
                className={`flex-1 py-2.5 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 transition-all ${
                  activeTab === 'email'
                    ? 'bg-gradient-to-r from-brandBlue to-brandPurple text-white shadow-lg'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <Mail className="w-4 h-4" />
                Recruiter Cold Email
              </button>
              <button
                onClick={() => { setActiveTab('linkedin'); setCopied(false); }}
                className={`flex-1 py-2.5 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 transition-all ${
                  activeTab === 'linkedin'
                    ? 'bg-gradient-to-r from-brandBlue to-brandPurple text-white shadow-lg'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <Linkedin className="w-4 h-4" />
                LinkedIn Invite Note
              </button>
            </div>

            {/* Script Viewer Box */}
            <div className="relative">
              <div className="bg-slate-950/80 border border-slate-800/80 rounded-xl p-5 h-64 overflow-y-auto font-mono text-xs leading-relaxed text-slate-300 whitespace-pre-line">
                {activeTab === 'email' ? outreachData.email : outreachData.linkedin}
              </div>

              {/* Copy Overlays */}
              <button
                onClick={handleCopy}
                className={`absolute top-3 right-3 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold shadow-md transition-all ${
                  copied
                    ? 'bg-emerald-600 text-white animate-scaleUp'
                    : 'bg-slate-800 hover:bg-slate-700 text-gray-300 hover:text-white'
                }`}
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    Copy Template
                  </>
                )}
              </button>
            </div>

            {/* Advice Callout */}
            <div className="bg-slate-800/30 border border-slate-700/30 p-4 rounded-xl flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-brandCyan/10 flex items-center justify-center text-brandCyan flex-shrink-0">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h5 className="text-xs font-semibold text-white">Coach Pro-Tip:</h5>
                <p className="text-[11px] text-gray-400 leading-normal mt-0.5">
                  {activeTab === 'email' 
                    ? "Cold email conversion rates increase by 40% when you attach your PDF resume and follow up exactly 3 business days later."
                    : "Always personalize LinkedIn requests. This draft highlights core matching skills under LinkedIn's strict 300-character limit."
                  }
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OutreachModal;
