import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { LineChart, Sparkles, AlertCircle, ArrowRight, ShieldCheck, CheckCircle2, Award } from 'lucide-react';
import { resumeAPI, analysisAPI } from '../utils/api';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import GlassCard from '../components/GlassCard';

const SkillGap = () => {
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [resume, setResume] = useState(null);
  
  // Skill Gap States
  const [jdInput, setJdInput] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [gapData, setGapData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    // Pre-fill target JD if passed from Job Matchmaking closest target leap!
    if (location.state && location.state.jobDescription) {
      setJdInput(location.state.jobDescription);
    }
  }, [location]);

  useEffect(() => {
    const fetchLatestResume = async () => {
      try {
        const resumesRes = await resumeAPI.getAll();
        const latest = resumesRes.data.data[0];
        if (latest) {
          setResume(latest);
        }
      } catch (err) {
        console.error('Error fetching resume for skill gap:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchLatestResume();
  }, []);

  const handleRunSkillGap = async (e) => {
    e.preventDefault();
    if (!jdInput.trim() || !resume) return;
    setAnalyzing(true);
    setError('');
    setGapData(null);

    try {
      const res = await analysisAPI.skillGap(resume._id, jdInput);
      if (res.data.success) {
        setGapData(res.data.data);
      }
    } catch (err) {
      console.error(err);
      setError('Failed to compute Skill Gap analysis. Make sure the backend service is reachable.');
    } finally {
      setAnalyzing(false);
    }
  };

  // Sample target JD to easily fill form
  const handleInsertSampleJd = () => {
    setJdInput(`We are looking for a Senior Full Stack Engineer with extensive experience in React.js and Node.js. 
You will be required to write clean modular code, migrate features to TypeScript, set up secure CI/CD pipelines using Docker and Kubernetes, and orchestrate server instances in AWS cloud environments.
Experience with GraphQL and microservices is a huge plus.`);
  };

  return (
    <div className="min-h-screen bg-darkBg text-gray-100 flex">
      <Sidebar />

      <main className="flex-1 ml-64 min-h-screen p-8 pt-28 space-y-8 overflow-y-auto">
        <Navbar title="AI Skill Gap Analysis" />

        {loading ? (
          <div className="h-[60vh] flex flex-col items-center justify-center gap-3">
            <div className="w-12 h-12 rounded-full border-4 border-brandBlue/30 border-t-brandBlue animate-spin"></div>
            <span className="text-sm text-gray-400">Loading workspace files...</span>
          </div>
        ) : !resume ? (
          <GlassCard className="p-12 text-center max-w-2xl mx-auto space-y-4">
            <LineChart className="w-16 h-16 text-gray-500 mx-auto" />
            <div>
              <h3 className="text-xl font-bold text-white">No Active Profile Found</h3>
              <p className="text-xs text-gray-500 mt-2">Upload or build a resume profile first to run comparative gap audits.</p>
            </div>
          </GlassCard>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 items-start">
            
            {/* Left Column: JD Input Panel */}
            <div className="xl:col-span-1 space-y-6">
              <GlassCard className="p-6 border border-borderGlass space-y-4">
                <div className="flex items-center gap-2 text-brandPurple font-bold text-sm">
                  <Sparkles className="w-5 h-5 shadow-neonPurple" /> Target Job Details
                </div>
                <p className="text-xs text-gray-500 leading-normal">
                  Paste the Job Description (JD) of a position you want to target. We will audit your active resume against it to find matches and gaps.
                </p>

                <div className="flex justify-end">
                  <button
                    onClick={handleInsertSampleJd}
                    type="button"
                    className="text-[10px] text-brandBlue hover:text-brandCyan font-semibold"
                  >
                    ✨ Insert Sample Senior Dev JD
                  </button>
                </div>

                <form onSubmit={handleRunSkillGap} className="space-y-4">
                  <div>
                    <label className="text-[10px] font-semibold text-gray-500 uppercase block mb-1">Target Job Description</label>
                    <textarea
                      rows={8}
                      required
                      placeholder="Paste target job requirements here..."
                      value={jdInput}
                      onChange={(e) => setJdInput(e.target.value)}
                      className="w-full px-3 py-2 glass-input text-xs resize-none"
                    />
                  </div>

                  {error && (
                    <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs text-center">
                      {error}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={analyzing}
                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-brandBlue to-brandPurple text-white text-xs font-bold flex items-center justify-center gap-2 hover:shadow-neonBlue transition"
                  >
                    {analyzing ? 'Auditing Skill Matrices...' : 'Analyze Skill Gap'}
                    <LineChart className="w-3.5 h-3.5" />
                  </button>
                </form>
              </GlassCard>
            </div>

            {/* Right Column: Comparative Audit Output */}
            <div className="xl:col-span-2 space-y-6">
              {!gapData ? (
                <div className="h-[50vh] flex items-center justify-center border border-dashed border-gray-800 rounded-2xl text-xs text-gray-600">
                  Submit the target JD on the left to map your educational curriculum and compatibility rating.
                </div>
              ) : (
                <div className="space-y-8 animate-fade-in">
                  
                  {/* Hero Rate Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <GlassCard className="md:col-span-1 bg-gradient-to-br from-brandBlue/10 to-brandPurple/10 border-brandBlue/20 flex flex-col items-center justify-center p-6 text-center">
                      <span className="text-xs text-brandCyan font-bold tracking-wider uppercase mb-2">JD Match Index</span>
                      <div className="w-24 h-24 rounded-full border-4 border-dashed border-brandBlue flex items-center justify-center relative shadow-neonBlue mb-2">
                        <span className="text-2xl font-black text-white">{gapData.matchPercentage}%</span>
                      </div>
                      <h4 className="text-[10px] font-semibold text-gray-400">
                        {gapData.matchPercentage > 75 ? '🟢 Highly Compatible' : '🟡 Recommended Additions'}
                      </h4>
                    </GlassCard>

                    <GlassCard className="md:col-span-2 justify-center flex flex-col space-y-2">
                      <h4 className="text-xs font-bold text-white uppercase tracking-wider">AI Gap Analysis Summary</h4>
                      <p className="text-xs text-gray-300 leading-relaxed text-justify">
                        {gapData.gapAnalysis}
                      </p>
                    </GlassCard>
                  </div>

                  {/* Overlaps vs Gaps Tags */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Overlaps */}
                    <GlassCard className="border border-emerald-500/10 bg-emerald-500/5 space-y-3">
                      <div className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4" /> Overlapping Skills (Possessed)
                      </div>
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {gapData.overlappingSkills?.map((skill, idx) => (
                          <span key={idx} className="px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-[10px] text-emerald-300 font-medium">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </GlassCard>

                    {/* Missing */}
                    <GlassCard className="border border-red-500/10 bg-red-500/5 space-y-3">
                      <div className="text-xs font-bold text-red-400 flex items-center gap-1.5">
                        <AlertCircle className="w-4 h-4" /> Missing Critical Gaps (Lacking)
                      </div>
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {gapData.missingSkills?.map((skill, idx) => (
                          <span key={idx} className="px-2.5 py-1 rounded-lg bg-red-500/10 border border-red-500/20 text-[10px] text-red-300 font-medium animate-pulse">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </GlassCard>
                  </div>

                  {/* Dynamic Learning Roadmap Curriculum */}
                  <GlassCard className="space-y-4">
                    <div className="flex items-center gap-2 text-white font-bold text-sm">
                      <Award className="w-5 h-5 text-brandCyan" /> Tailored Educational Learning Curriculum
                    </div>
                    <p className="text-xs text-gray-500">A step-by-step roadmap to master missing skills and bridge the gap</p>

                    <div className="space-y-4">
                      {gapData.learningRoadmap?.map((item, idx) => (
                        <div key={idx} className="p-4 rounded-xl bg-white/5 border border-borderGlass space-y-2 hover:border-brandPurple/30 transition">
                          {/* Title */}
                          <div className="flex justify-between items-baseline font-bold text-xs text-white">
                            <span>
                              {idx + 1}. {item.topic}
                            </span>
                            <span className="text-[10px] text-brandCyan font-semibold">
                              ⌛ {item.duration}
                            </span>
                          </div>
                          
                          {/* Resources */}
                          <div className="text-[11px] text-gray-400">
                            <strong>Recommended Material:</strong> {item.resources}
                          </div>

                          {/* Action Item */}
                          <div className="text-[11px] text-gray-200 bg-white/5 p-2 rounded-lg border border-borderGlass/50">
                            <strong>Action Project:</strong> {item.actionItem}
                          </div>
                        </div>
                      ))}
                    </div>
                  </GlassCard>

                </div>
              )}
            </div>

          </div>
        )}
      </main>
    </div>
  );
};

export default SkillGap;
