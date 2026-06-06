import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FileText, 
  Award, 
  ThumbsUp, 
  AlertCircle, 
  PlusCircle, 
  ArrowRight,
  TrendingUp,
  Sparkles,
  Copy,
  CheckCircle2,
  ListRestart
} from 'lucide-react';
import { analysisAPI, resumeAPI } from '../utils/api';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import GlassCard from '../components/GlassCard';

const Analysis = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [analysis, setAnalysis] = useState(null);
  
  // Bullet Rewriter States
  const [bulletInput, setBulletInput] = useState('');
  const [jobTitleInput, setJobTitleInput] = useState('Software Engineer');
  const [rewriterLoading, setRewriterLoading] = useState(false);
  const [rewriterSuggestions, setRewriterSuggestions] = useState([]);
  const [copiedIndex, setCopiedIndex] = useState(null);

  useEffect(() => {
    const fetchLatestAnalysis = async () => {
      try {
        const resumesRes = await resumeAPI.getAll();
        const activeResume = resumesRes.data.data[0];

        if (activeResume) {
          const analysesRes = await analysisAPI.getAll();
          const activeAnalysis = analysesRes.data.data.find(a => a.resume?._id === activeResume._id);
          
          if (activeAnalysis) {
            setAnalysis(activeAnalysis);
          } else {
            // Trigger auto analysis if resume exists but no analysis found
            console.log('No analysis found for latest resume. Auto-auditing...');
            const newAnalysis = await analysisAPI.analyze(activeResume._id);
            setAnalysis(newAnalysis.data.data);
          }
        }
      } catch (err) {
        console.error('Error fetching latest resume audits:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchLatestAnalysis();
  }, []);

  const handleRewriteBullet = async (e) => {
    e.preventDefault();
    if (!bulletInput.trim()) return;
    setRewriterLoading(true);
    setRewriterSuggestions([]);
    
    try {
      const res = await analysisAPI.rewriteBullet({
        bulletText: bulletInput,
        jobTitle: jobTitleInput
      });
      if (res.data.success) {
        setRewriterSuggestions(res.data.data.suggestions || []);
      }
    } catch (err) {
      console.error('Error optimizing bullet point:', err);
    } finally {
      setRewriterLoading(false);
    }
  };

  const handleCopyText = (text, index) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 1500);
  };

  return (
    <div className="min-h-screen bg-darkBg text-gray-100 flex">
      <Sidebar />

      <main className="flex-1 ml-64 min-h-screen p-8 pt-28 space-y-8 overflow-y-auto">
        <Navbar title="ATS Compliance Auditor" />

        {loading ? (
          <div className="h-[60vh] flex flex-col items-center justify-center gap-3">
            <div className="w-12 h-12 rounded-full border-4 border-brandBlue/30 border-t-brandBlue animate-spin"></div>
            <span className="text-sm text-gray-400">Loading audit parameters...</span>
          </div>
        ) : !analysis ? (
          <GlassCard className="p-12 text-center max-w-2xl mx-auto space-y-6">
            <FileText className="w-16 h-16 text-gray-500 mx-auto animate-float" />
            <div>
              <h3 className="text-xl font-bold text-white">No Active Resume Audited Yet</h3>
              <p className="text-xs text-gray-500 mt-2">
                Upload your resume or build one inside the interactive workspace to run a comprehensive ATS Audit.
              </p>
            </div>
            <div className="flex gap-4 justify-center pt-4">
              <button
                onClick={() => navigate('/upload')}
                className="px-6 py-2.5 rounded-xl bg-brandBlue hover:shadow-neonBlue font-semibold text-xs text-white transition duration-300"
              >
                Upload Resume
              </button>
              <button
                onClick={() => navigate('/builder')}
                className="px-6 py-2.5 rounded-xl border border-gray-700 hover:bg-white/5 font-semibold text-xs text-gray-400 transition"
              >
                Go to Builder
              </button>
            </div>
          </GlassCard>
        ) : (
          <div className="space-y-8">
            {/* 1. SCORE HERO SECTIONS */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Giant Radial Score Glow */}
              <GlassCard className="lg:col-span-1 bg-gradient-to-br from-brandBlue/10 to-brandPurple/10 border-brandBlue/20 flex flex-col items-center justify-center p-6 text-center">
                <span className="text-xs text-brandCyan font-bold tracking-wider uppercase mb-4">Overall Score</span>
                <div className="w-32 h-32 rounded-full border-4 border-dashed border-brandBlue flex items-center justify-center relative shadow-neonBlue mb-4">
                  <span className="text-4xl font-extrabold text-white">{analysis.atsScore}%</span>
                  <div className="absolute inset-0 rounded-full border-4 border-brandPurple animate-pulse opacity-30"></div>
                </div>
                <h4 className="text-xs font-semibold text-white">
                  {analysis.atsScore >= 80 ? 'ATS Compliant Profile' : 'Needs Optimization'}
                </h4>
              </GlassCard>

              {/* Granular Progress Breakdown */}
              <GlassCard className="lg:col-span-3 space-y-5 justify-center flex flex-col">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">Audit Factor Breakdown</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Item */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-gray-400">Keyword Density Match</span>
                      <span className="text-brandBlue">{analysis.breakdown?.keywordMatch || 70}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                      <div className="h-full bg-brandBlue" style={{ width: `${analysis.breakdown?.keywordMatch || 70}%` }}></div>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-gray-400">Visual Layout & Formatting</span>
                      <span className="text-brandPurple">{analysis.breakdown?.formatting || 80}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                      <div className="h-full bg-brandPurple" style={{ width: `${analysis.breakdown?.formatting || 80}%` }}></div>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-gray-400">Achievement Impact Verbs</span>
                      <span className="text-brandCyan">{analysis.breakdown?.impact || 65}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                      <div className="h-full bg-brandCyan" style={{ width: `${analysis.breakdown?.impact || 65}%` }}></div>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-gray-400">Experience Density Depth</span>
                      <span className="text-accentGold">{analysis.breakdown?.experienceDepth || 75}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                      <div className="h-full bg-accentGold" style={{ width: `${analysis.breakdown?.experienceDepth || 75}%` }}></div>
                    </div>
                  </div>
                </div>
              </GlassCard>
            </div>

            {/* 2. GAINING AND LACKING SLATES */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Gaining (Strengths) */}
              <GlassCard className="border border-emerald-500/10 bg-emerald-500/5 space-y-4">
                <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                  <ThumbsUp className="w-5 h-5" /> Gaining (Existing Strengths)
                </div>
                <ul className="space-y-3.5">
                  {analysis.gaining?.map((item, idx) => (
                    <li key={idx} className="text-xs text-gray-300 flex items-start gap-2.5">
                      <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full mt-1.5 flex-shrink-0"></span>
                      {item}
                    </li>
                  ))}
                </ul>
              </GlassCard>

              {/* Lacking (Skill Gaps) */}
              <GlassCard className="border border-red-500/10 bg-red-500/5 space-y-4">
                <div className="flex items-center gap-2 text-red-400 font-bold text-sm">
                  <AlertCircle className="w-5 h-5 animate-pulse" /> Lacking (Critical Gaps)
                </div>
                <ul className="space-y-3.5">
                  {analysis.lacking?.map((item, idx) => (
                    <li key={idx} className="text-xs text-gray-300 flex items-start gap-2.5">
                      <span className="w-1.5 h-1.5 bg-red-400 rounded-full mt-1.5 flex-shrink-0"></span>
                      {item}
                    </li>
                  ))}
                </ul>
              </GlassCard>
            </div>

            {/* 3. WHERE TO ADD GRID */}
            <GlassCard className="space-y-4">
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">Detailed Section Audit Reviews</h3>
                <p className="text-xs text-gray-500">Step-by-step suggestions to bypass standard resume filtering bots</p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-borderGlass text-gray-400 font-semibold bg-white/5">
                      <th className="py-3 px-4 rounded-l-lg">Target Section</th>
                      <th className="py-3 px-4">Priority</th>
                      <th className="py-3 px-4">Problem Detected</th>
                      <th className="py-3 px-4 rounded-r-lg">Actionable Optimization Recommendation</th>
                    </tr>
                  </thead>
                  <tbody>
                    {analysis.whereToAdd?.map((item, idx) => (
                      <tr key={idx} className="border-b border-borderGlass/50 hover:bg-white/5 transition-colors">
                        <td className="py-4 px-4 font-bold text-white">{item.section}</td>
                        <td className="py-4 px-4">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                            item.priority === 'High' 
                              ? 'bg-red-500/10 border-red-500/20 text-red-400' 
                              : item.priority === 'Medium' 
                                ? 'bg-amber-500/10 border-amber-500/20 text-amber-400' 
                                : 'bg-brandBlue/10 border-brandBlue/20 text-brandBlue'
                          }`}>
                            {item.priority}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-gray-400 max-w-[200px] truncate-3-lines">{item.feedback}</td>
                        <td className="py-4 px-4 text-gray-200">{item.suggestion}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </GlassCard>

            {/* 4. AI BULLET REWRITER PLAYGROUND */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Form Input */}
              <GlassCard className="lg:col-span-1 space-y-4">
                <div className="flex items-center gap-2 text-brandPurple font-bold text-sm">
                  <Sparkles className="w-5 h-5 shadow-neonPurple" /> AI Bullet Optimizer
                </div>
                <p className="text-xs text-gray-500">
                  Transform vague, passive bullet points into high-impact, quantified accomplishments.
                </p>

                <form onSubmit={handleRewriteBullet} className="space-y-4 pt-2">
                  <div>
                    <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest block mb-1">Target Job Title</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Full Stack React Developer"
                      value={jobTitleInput}
                      onChange={(e) => setJobTitleInput(e.target.value)}
                      className="w-full px-3 py-2 glass-input text-xs"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest block mb-1">Basic Bullet Point</label>
                    <textarea
                      required
                      rows={3}
                      placeholder="e.g. I worked on coding frontend components and helped in backend APIs."
                      value={bulletInput}
                      onChange={(e) => setBulletInput(e.target.value)}
                      className="w-full px-3 py-2 glass-input text-xs resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={rewriterLoading}
                    className="w-full py-2 rounded-xl bg-gradient-to-r from-brandBlue to-brandPurple text-white text-xs font-bold flex items-center justify-center gap-2 hover:shadow-neonBlue transition"
                  >
                    {rewriterLoading ? 'Re-engineering Bullet...' : 'Optimize Achievement'}
                    <Sparkles className="w-3.5 h-3.5" />
                  </button>
                </form>
              </GlassCard>

              {/* AI Output Suggestions */}
              <GlassCard className="lg:col-span-2 space-y-4">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">ATS-Optimized Achievement Suggestions</h3>
                
                {rewriterSuggestions.length === 0 ? (
                  <div className="h-48 flex items-center justify-center text-gray-600 text-xs border border-dashed border-gray-800 rounded-xl">
                    Fill the form on the left to generate quantified AI replacements.
                  </div>
                ) : (
                  <div className="space-y-3.5">
                    {rewriterSuggestions.map((sug, idx) => (
                      <div key={idx} className="p-4 rounded-xl bg-white/5 border border-borderGlass flex items-start justify-between gap-4 group hover:border-brandPurple/30 transition">
                        <p className="text-xs text-gray-200 leading-relaxed font-mono">
                          {sug}
                        </p>
                        <button
                          onClick={() => handleCopyText(sug, idx)}
                          className="p-1.5 rounded-lg bg-white/5 border border-borderGlass text-gray-400 hover:text-white transition flex-shrink-0 relative"
                        >
                          {copiedIndex === idx ? (
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    ))}
                    <div className="p-3 bg-brandBlue/5 rounded-xl border border-brandBlue/10 text-[10px] text-gray-400 italic">
                      💡 **Tip**: Copy any of the optimized bullets above and paste them into your **Resume Builder** experience cards to immediately boost your ATS Score!
                    </div>
                  </div>
                )}
              </GlassCard>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Analysis;
