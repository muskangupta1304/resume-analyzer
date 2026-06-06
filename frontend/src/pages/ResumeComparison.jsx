import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import GlassCard from '../components/GlassCard';
import { 
  GitCompare, 
  Award, 
  ArrowUpRight, 
  TrendingUp, 
  Sparkles, 
  ArrowRight,
  PlusCircle,
  FolderSync,
  Layers,
  GraduationCap,
  XCircle
} from 'lucide-react';
import { resumeAPI, analysisAPI } from '../utils/api';

const ResumeComparison = () => {
  const [resumes, setResumes] = useState([]);
  const [analyses, setAnalyses] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [resumeAId, setResumeAId] = useState('');
  const [resumeBId, setResumeBId] = useState('');
  const [loadingAnalysis, setLoadingAnalysis] = useState(false);
  const [analysisA, setAnalysisA] = useState(null);
  const [analysisB, setAnalysisB] = useState(null);

  useEffect(() => {
    const loadWorkspaceData = async () => {
      try {
        const resumesRes = await resumeAPI.getAll();
        const list = resumesRes.data.data || [];
        setResumes(list);

        const analysesRes = await analysisAPI.getAll();
        const auditList = analysesRes.data.data || [];
        setAnalyses(auditList);

        if (list.length > 0) {
          setResumeAId(list[list.length - 1]._id); // oldest resume initially
          setResumeBId(list[0]._id); // newest resume initially
        }
      } catch (err) {
        console.error('Error loading data for comparison screen:', err);
      } finally {
        setLoading(false);
      }
    };
    loadWorkspaceData();
  }, []);

  useEffect(() => {
    if (!resumeAId || !resumeBId) return;

    const fetchAnalysisData = async () => {
      setLoadingAnalysis(true);
      try {
        // 1. Locate already audited reports or run live audits!
        let auditA = analyses.find(a => (a.resume?._id || a.resume) === resumeAId);
        let auditB = analyses.find(a => (a.resume?._id || a.resume) === resumeBId);

        if (!auditA) {
          console.log(`[Diff] Running dynamic analysis for Version A: ${resumeAId}...`);
          const res = await analysisAPI.analyze(resumeAId);
          auditA = res.data.data;
        }

        if (!auditB) {
          console.log(`[Diff] Running dynamic analysis for Version B: ${resumeBId}...`);
          const res = await analysisAPI.analyze(resumeBId);
          auditB = res.data.data;
        }

        setAnalysisA(auditA);
        setAnalysisB(auditB);
      } catch (err) {
        console.error('Error auditing comparison items:', err);
      } finally {
        setLoadingAnalysis(false);
      }
    };

    fetchAnalysisData();
  }, [resumeAId, resumeBId, resumes]);

  const resumeA = resumes.find(r => r._id === resumeAId);
  const resumeB = resumes.find(r => r._id === resumeBId);

  // Compute Skill overlap deltas
  const getSkillsDeltas = () => {
    if (!resumeA || !resumeB) return { added: [], removed: [], overlapping: [] };
    const skillsA = (resumeA.skills || []).map(s => s.toLowerCase().trim());
    const skillsB = (resumeB.skills || []).map(s => s.toLowerCase().trim());

    const added = (resumeB.skills || []).filter(s => !skillsA.includes(s.toLowerCase().trim()));
    const removed = (resumeA.skills || []).filter(s => !skillsB.includes(s.toLowerCase().trim()));
    const overlapping = (resumeB.skills || []).filter(s => skillsA.includes(s.toLowerCase().trim()));

    return { added, removed, overlapping };
  };

  const { added, removed, overlapping } = getSkillsDeltas();

  // Compute overall score progress
  const scoreDelta = analysisA && analysisB ? analysisB.atsScore - analysisA.atsScore : 0;

  return (
    <div className="min-h-screen bg-darkBg text-gray-100 flex">
      <Sidebar />

      <main className="flex-1 ml-64 min-h-screen p-8 pt-28 space-y-8 overflow-y-auto">
        <Navbar title="ATS Version Comparative Dashboard" />

        {loading ? (
          <div className="h-[60vh] flex flex-col items-center justify-center gap-3">
            <div className="w-12 h-12 rounded-full border-4 border-brandBlue/30 border-t-brandBlue animate-spin"></div>
            <span className="text-sm text-gray-400">Loading version directories...</span>
          </div>
        ) : resumes.length < 2 ? (
          <div className="max-w-xl mx-auto space-y-6 pt-10 text-center">
            <GlassCard className="p-8 border border-dashed border-borderGlass space-y-4">
              <GitCompare className="w-16 h-16 text-slate-700 mx-auto animate-pulse" />
              <div>
                <h3 className="text-lg font-bold text-white">Insufficient Workspace Versions</h3>
                <p className="text-xs text-gray-500 mt-2 max-w-sm mx-auto leading-relaxed">
                  Version comparison requires at least **two separate resume revisions** in the workspace. Upload a new PDF/DOCX or create a second profile inside the **Resume Builder** to activate this dashboard.
                </p>
              </div>
            </GlassCard>
          </div>
        ) : (
          <div className="space-y-8">
            
            {/* ==========================================
                1. DUAL SELECTOR HEADER ROW
                ========================================== */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
              {/* Selector A */}
              <GlassCard className="p-4 border border-borderGlass flex items-center justify-between gap-4">
                <div className="space-y-1 flex-1 text-xs">
                  <label className="text-[9px] font-bold text-gray-500 uppercase tracking-widest block">Original Revision (Version A)</label>
                  <select
                    value={resumeAId}
                    onChange={(e) => setResumeAId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white/5 border border-borderGlass text-gray-200 outline-none focus:border-brandBlue text-xs transition"
                  >
                    {resumes.map(r => (
                      <option key={r._id} value={r._id} className="bg-darkBg text-gray-200">
                        {r.fileName} ({new Date(r.createdAt).toLocaleDateString()})
                      </option>
                    ))}
                  </select>
                </div>
              </GlassCard>

              {/* Selector B */}
              <GlassCard className="p-4 border border-borderGlass flex items-center justify-between gap-4">
                <div className="space-y-1 flex-1 text-xs">
                  <label className="text-[9px] font-bold text-gray-500 uppercase tracking-widest block">Optimized Revision (Version B)</label>
                  <select
                    value={resumeBId}
                    onChange={(e) => setResumeBId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white/5 border border-borderGlass text-gray-200 outline-none focus:border-brandPurple text-xs transition"
                  >
                    {resumes.map(r => (
                      <option key={r._id} value={r._id} className="bg-darkBg text-gray-200">
                        {r.fileName} ({new Date(r.createdAt).toLocaleDateString()})
                      </option>
                    ))}
                  </select>
                </div>
              </GlassCard>
            </div>

            {loadingAnalysis ? (
              <GlassCard className="h-[50vh] flex flex-col items-center justify-center gap-3">
                <div className="w-12 h-12 border-4 border-brandBlue/30 border-t-brandBlue rounded-full animate-spin"></div>
                <span className="text-xs text-gray-400">Performing side-by-side audit deltas...</span>
              </GlassCard>
            ) : (
              <div className="space-y-8">

                {/* ==========================================
                    2. PROGRESS RATINGS HERO DELTA CARD
                    ========================================== */}
                {analysisA && analysisB && (
                  <GlassCard className="p-6 bg-gradient-to-br from-brandBlue/10 to-brandPurple/10 border-brandBlue/20 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
                    <div className="absolute w-40 h-40 bg-brandBlue/10 rounded-full blur-[60px] top-[-50px] left-[-50px] pointer-events-none"></div>
                    
                    <div className="space-y-2 text-center md:text-left">
                      <span className="text-[10px] text-brandCyan font-bold tracking-widest uppercase flex items-center justify-center md:justify-start gap-1">
                        <Sparkles className="w-4 h-4 text-brandCyan" /> Score Progression delta
                      </span>
                      <h2 className="text-xl font-black text-white leading-tight">
                        {scoreDelta > 0 
                          ? `📈 Score boosted by +${scoreDelta}% points!` 
                          : scoreDelta === 0 
                            ? '📊 Both revisions match parameters identically.' 
                            : `📉 Performance decreased by ${scoreDelta}% points.`}
                      </h2>
                      <p className="text-xs text-gray-400 max-w-xl">
                        Review quantified gains below. Focus on adding high-impact action verbs and technical keywords from your target Job Description.
                      </p>
                    </div>

                    <div className="flex items-center gap-6">
                      <div className="text-center space-y-1">
                        <span className="text-[9px] text-gray-500 uppercase tracking-widest font-bold">Ver A</span>
                        <div className="w-14 h-14 rounded-full border-2 border-brandBlue flex items-center justify-center font-extrabold text-white text-xs">
                          {analysisA.atsScore}%
                        </div>
                      </div>
                      <ArrowRight className="w-5 h-5 text-gray-500" />
                      <div className="text-center space-y-1">
                        <span className="text-[9px] text-gray-500 uppercase tracking-widest font-bold">Ver B</span>
                        <div className="w-16 h-16 rounded-full border-4 border-brandPurple flex items-center justify-center font-black text-white text-sm shadow-neonPurple">
                          {analysisB.atsScore}%
                        </div>
                      </div>
                    </div>
                  </GlassCard>
                )}

                {/* ==========================================
                    3. SPLIT COMPONENT DETAIL METRICS
                    ========================================== */}
                {analysisA && analysisB && resumeA && resumeB && (
                  <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
                    
                    {/* Comparative Breakdown Sliders (Left) */}
                    <div className="xl:col-span-7 space-y-6">
                      <GlassCard className="p-6 border border-borderGlass space-y-6">
                        <h3 className="text-sm font-bold text-white flex items-center gap-2">
                          <TrendingUp className="w-4.5 h-4.5 text-brandCyan" /> ATS Matrix Comparatives
                        </h3>

                        <div className="space-y-5 text-xs text-gray-400">
                          {/* Formatting Slider */}
                          <div className="space-y-1.5">
                            <div className="flex justify-between font-medium">
                              <span>Formatting & Layout Audits</span>
                              <span>{analysisA.breakdown?.formatting || 80}% ➔ {analysisB.breakdown?.formatting || 80}%</span>
                            </div>
                            <div className="h-2 w-full bg-slate-900 rounded-full overflow-hidden flex">
                              <div style={{ width: `${analysisA.breakdown?.formatting || 80}%` }} className="h-full bg-brandBlue/45"></div>
                              <div style={{ width: `${Math.max(0, (analysisB.breakdown?.formatting || 80) - (analysisA.breakdown?.formatting || 80))}%` }} className="h-full bg-brandPurple shadow-neonPurple"></div>
                            </div>
                          </div>

                          {/* Keyword Slider */}
                          <div className="space-y-1.5">
                            <div className="flex justify-between font-medium">
                              <span>Technical Keywords Concentration</span>
                              <span>{analysisA.breakdown?.keywordMatch || 70}% ➔ {analysisB.breakdown?.keywordMatch || 70}%</span>
                            </div>
                            <div className="h-2 w-full bg-slate-900 rounded-full overflow-hidden flex">
                              <div style={{ width: `${analysisA.breakdown?.keywordMatch || 70}%` }} className="h-full bg-brandBlue/45"></div>
                              <div style={{ width: `${Math.max(0, (analysisB.breakdown?.keywordMatch || 70) - (analysisA.breakdown?.keywordMatch || 70))}%` }} className="h-full bg-brandPurple shadow-neonPurple"></div>
                            </div>
                          </div>

                          {/* Impact Slider */}
                          <div className="space-y-1.5">
                            <div className="flex justify-between font-medium">
                              <span>Metric-Driven Impact (STAR verbs)</span>
                              <span>{analysisA.breakdown?.impact || 60}% ➔ {analysisB.breakdown?.impact || 60}%</span>
                            </div>
                            <div className="h-2 w-full bg-slate-900 rounded-full overflow-hidden flex">
                              <div style={{ width: `${analysisA.breakdown?.impact || 60}%` }} className="h-full bg-brandBlue/45"></div>
                              <div style={{ width: `${Math.max(0, (analysisB.breakdown?.impact || 60) - (analysisA.breakdown?.impact || 60))}%` }} className="h-full bg-brandPurple shadow-neonPurple"></div>
                            </div>
                          </div>

                          {/* Depth Slider */}
                          <div className="space-y-1.5">
                            <div className="flex justify-between font-medium">
                              <span>Professional Experience Depth</span>
                              <span>{analysisA.breakdown?.experienceDepth || 75}% ➔ {analysisB.breakdown?.experienceDepth || 75}%</span>
                            </div>
                            <div className="h-2 w-full bg-slate-900 rounded-full overflow-hidden flex">
                              <div style={{ width: `${analysisA.breakdown?.experienceDepth || 75}%` }} className="h-full bg-brandBlue/45"></div>
                              <div style={{ width: `${Math.max(0, (analysisB.breakdown?.experienceDepth || 75) - (analysisA.breakdown?.experienceDepth || 75))}%` }} className="h-full bg-brandPurple shadow-neonPurple"></div>
                            </div>
                          </div>
                        </div>
                      </GlassCard>

                      {/* Structural Details Comparison */}
                      <GlassCard className="p-6 border border-borderGlass space-y-4">
                        <h3 className="text-sm font-bold text-white flex items-center gap-2">
                          <Layers className="w-4.5 h-4.5 text-brandPurple" /> Structural Auditing Deltas
                        </h3>

                        <div className="grid grid-cols-3 gap-4 text-center text-xs">
                          {/* Timeline entries */}
                          <div className="p-3 bg-white/5 rounded-xl border border-borderGlass">
                            <span className="text-[9px] text-gray-500 uppercase tracking-widest font-bold block">Experience Entries</span>
                            <h4 className="text-sm font-black text-white mt-1">
                              {resumeA.experience?.length || 0} ➔ {resumeB.experience?.length || 0}
                            </h4>
                          </div>

                          {/* Projects */}
                          <div className="p-3 bg-white/5 rounded-xl border border-borderGlass">
                            <span className="text-[9px] text-gray-500 uppercase tracking-widest font-bold block">Projects Listed</span>
                            <h4 className="text-sm font-black text-white mt-1">
                              {resumeA.projects?.length || 0} ➔ {resumeB.projects?.length || 0}
                            </h4>
                          </div>

                          {/* Skills count */}
                          <div className="p-3 bg-white/5 rounded-xl border border-borderGlass">
                            <span className="text-[9px] text-gray-500 uppercase tracking-widest font-bold block">Keywords Total</span>
                            <h4 className="text-sm font-black text-white mt-1">
                              {resumeA.skills?.length || 0} ➔ {resumeB.skills?.length || 0}
                            </h4>
                          </div>
                        </div>
                      </GlassCard>
                    </div>

                    {/* Technical Keyword Overlap Diff List (Right) */}
                    <div className="xl:col-span-5 space-y-6">
                      <GlassCard className="p-6 border border-borderGlass space-y-4 min-h-[380px]">
                        <h3 className="text-sm font-bold text-white flex items-center gap-2">
                          <GitCompare className="w-4.5 h-4.5 text-accentGold" /> Keyword Delta Diff
                        </h3>

                        <div className="space-y-4 text-[10px]">
                          {/* Added skills */}
                          <div className="space-y-2">
                            <h4 className="font-bold text-emerald-400 uppercase tracking-widest flex items-center gap-1">
                              <PlusCircle className="w-3.5 h-3.5" /> Added in Optimized version:
                            </h4>
                            <div className="flex flex-wrap gap-1.5">
                              {added.length === 0 ? (
                                <span className="text-gray-500 italic">No new technical skills added.</span>
                              ) : (
                                added.map((s, idx) => (
                                  <span key={idx} className="px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold">
                                    {s}
                                  </span>
                                ))
                              )}
                            </div>
                          </div>

                          {/* Removed skills */}
                          <div className="space-y-2 pt-2 border-t border-slate-900">
                            <h4 className="font-bold text-red-400 uppercase tracking-widest flex items-center gap-1">
                              <XCircle className="w-3.5 h-3.5" /> Omitted in Optimized version:
                            </h4>
                            <div className="flex flex-wrap gap-1.5">
                              {removed.length === 0 ? (
                                <span className="text-gray-500 italic">No technical skills omitted.</span>
                              ) : (
                                removed.map((s, idx) => (
                                  <span key={idx} className="px-2 py-0.5 rounded bg-red-500/10 border border-red-500/20 text-red-400 font-bold">
                                    {s}
                                  </span>
                                ))
                              )}
                            </div>
                          </div>

                          {/* Overlapping skills */}
                          <div className="space-y-2 pt-2 border-t border-slate-900">
                            <h4 className="font-bold text-brandBlue uppercase tracking-widest flex items-center gap-1">
                              <FolderSync className="w-3.5 h-3.5" /> Maintained overlap:
                            </h4>
                            <div className="flex flex-wrap gap-1.5 max-h-[140px] overflow-y-auto">
                              {overlapping.length === 0 ? (
                                <span className="text-gray-500 italic">No overlapping skills.</span>
                              ) : (
                                overlapping.map((s, idx) => (
                                  <span key={idx} className="px-2 py-0.5 rounded bg-white/5 border border-borderGlass text-gray-300 font-medium">
                                    {s}
                                  </span>
                                ))
                              )}
                            </div>
                          </div>
                        </div>
                      </GlassCard>
                    </div>

                  </div>
                )}

              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default ResumeComparison;
