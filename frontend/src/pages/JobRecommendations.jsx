import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import GlassCard from '../components/GlassCard';
import OutreachModal from '../components/OutreachModal';
import { 
  Briefcase, 
  Sparkles, 
  ArrowRight, 
  CheckCircle2, 
  Award, 
  Mail,
  Building,
  MapPin,
  TrendingUp,
  Flame,
  ArrowUpRight
} from 'lucide-react';
import { resumeAPI, analysisAPI } from '../utils/api';

const JobRecommendations = () => {
  const navigate = useNavigate();
  const [resumes, setResumes] = useState([]);
  const [selectedResumeId, setSelectedResumeId] = useState('');
  const [loading, setLoading] = useState(false);
  const [matchData, setMatchData] = useState(null);
  
  const [outreachOpen, setOutreachOpen] = useState(false);
  const [outreachJob, setOutreachJob] = useState({ title: '', company: '', description: '' });

  // Load all resumes on mount
  useEffect(() => {
    const loadResumes = async () => {
      try {
        const res = await resumeAPI.getAll();
        const list = res.data.data || [];
        setResumes(list);
        if (list.length > 0) {
          setSelectedResumeId(list[0]._id);
        }
      } catch (err) {
        console.error('Error fetching resumes for matchmaking:', err);
      }
    };
    loadResumes();
  }, []);

  // Fetch dynamic job recommendations when selected resume changes
  useEffect(() => {
    if (!selectedResumeId) return;

    const fetchRecommendations = async () => {
      setLoading(true);
      try {
        const res = await analysisAPI.getDynamicRecommendations({
          resumeId: selectedResumeId
        });
        if (res.data && res.data.success) {
          setMatchData(res.data.data);
        }
      } catch (err) {
        console.error('Error compiling career recommendations:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchRecommendations();
  }, [selectedResumeId]);

  const handleRunSkillGap = (job) => {
    navigate('/skill-gap', { 
      state: { 
        jobDescription: `Job Title: ${job.title} at ${job.company}\n\nDescription:\n${job.description}\n\nRequirements:\n${job.requirements.join(', ')}` 
      } 
    });
  };

  const triggerOutreach = (job) => {
    setOutreachJob({
      title: job.title,
      company: job.company,
      description: `Job Title: ${job.title} at ${job.company}\n\nDescription:\n${job.description}\n\nRequirements:\n${job.requirements?.join(', ')}`
    });
    setOutreachOpen(true);
  };

  return (
    <div className="min-h-screen bg-darkBg text-gray-100 flex">
      <Sidebar />

      <main className="flex-1 ml-64 min-h-screen p-8 pt-28 space-y-8 overflow-y-auto">
        <Navbar title="AI Matchmaking & Pivot Advisor" />

        {/* 1. SELECTION & CONFIGURATION ROW */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-4 border-b border-slate-900 gap-4">
          <div>
            <h2 className="text-lg font-black text-white">Dynamic Placements</h2>
            <p className="text-xs text-gray-500">Automatically evaluates your resume categories to draft profession-specific options.</p>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block">Active Profile:</span>
            {resumes.length === 0 ? (
              <span className="text-gray-500 italic">No workspace profiles</span>
            ) : (
              <select
                value={selectedResumeId}
                onChange={(e) => setSelectedResumeId(e.target.value)}
                className="px-3 py-2 rounded-xl bg-white/5 border border-borderGlass text-gray-200 outline-none text-xs transition focus:border-brandBlue"
              >
                {resumes.map(r => (
                  <option key={r._id} value={r._id} className="bg-darkBg text-gray-200">
                    {r.fileName}
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>

        {/* 2. LOADING SPIN CANVAS */}
        {loading && (
          <div className="h-[50vh] flex flex-col items-center justify-center gap-3">
            <div className="w-12 h-12 rounded-full border-4 border-brandBlue/30 border-t-brandBlue animate-spin"></div>
            <span className="text-sm text-gray-400">Auditing timeline specialties and drafting tailored placement structures...</span>
          </div>
        )}

        {/* 3. CORE DISPLAY PANELS */}
        {!loading && !matchData && (
          <GlassCard className="p-12 text-center max-w-2xl mx-auto space-y-4 border border-dashed border-borderGlass">
            <Briefcase className="w-16 h-16 text-slate-700 mx-auto animate-pulse" />
            <div>
              <h3 className="text-xl font-bold text-white">Matchmaking Engine Ready</h3>
              <p className="text-xs text-gray-500 mt-2">Select an active workspace profile from the selector above to compile career openings.</p>
            </div>
          </GlassCard>
        )}

        {!loading && matchData && (
          <div className="space-y-8 animate-fadeIn">
            
            {/* ==========================================
                🏆 PERSONALIZED PIVOT RATIONALE CARD
                ========================================== */}
            <GlassCard className="p-6 bg-gradient-to-br from-brandPurple/15 to-brandBlue/10 border-brandPurple/30 relative overflow-hidden flex items-start gap-4">
              {/* Background Neon Spot */}
              <div className="absolute w-40 h-40 bg-brandPurple/10 rounded-full blur-[50px] -top-10 -right-10"></div>
              
              <div className="p-3 bg-brandPurple/20 border border-brandPurple/30 rounded-2xl text-brandPurple shadow-neonPurple flex-shrink-0 animate-bounce">
                <Sparkles className="w-6 h-6" />
              </div>

              <div className="space-y-1 relative z-10 text-xs">
                <span className="text-[10px] text-brandCyan font-bold tracking-widest uppercase block">Personalized Career Coaching Pitch</span>
                <p className="text-sm font-semibold leading-relaxed text-gray-200 text-justify pt-1">
                  "{matchData.coachingRationale}"
                </p>
              </div>
            </GlassCard>

            {/* ==========================================
                📦 PLACEMENTS LISTING BY MATCH LEVEL
                ========================================== */}
            <div className="space-y-6">
              <div>
                <h3 className="text-base font-bold text-white">Dynamic Placements & Transition Paths</h3>
                <p className="text-xs text-gray-500">Corporate openings dynamically drafted to align with your core, adjacent, or stretch capabilities.</p>
              </div>

              <div className="grid grid-cols-1 gap-6">
                {matchData.jobs?.map((job, idx) => {
                  const isCore = job.category === 'Core Placement';
                  const isAdjacent = job.category === 'Adjacent Pivot';
                  const isStretch = job.category === 'Stretch Leap';

                  // Dynamic color styles
                  const styles = isCore
                    ? {
                        border: 'border-emerald-500/10 hover:border-emerald-500/30',
                        bgGradient: 'from-emerald-500/5 to-transparent',
                        badge: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
                        scoreBorder: 'border-emerald-500 text-emerald-400',
                        actionBtn: 'text-emerald-400 bg-emerald-500/5 border-emerald-500/10 hover:text-white hover:bg-emerald-600'
                      }
                    : isAdjacent
                    ? {
                        border: 'border-brandBlue/10 hover:border-brandBlue/30',
                        bgGradient: 'from-brandBlue/5 to-transparent',
                        badge: 'bg-brandBlue/10 text-brandBlue border-brandBlue/20',
                        scoreBorder: 'border-brandBlue text-brandBlue',
                        actionBtn: 'text-brandBlue bg-brandBlue/5 border-brandBlue/10 hover:text-white hover:bg-brandBlue'
                      }
                    : {
                        border: 'border-brandPurple/15 hover:border-brandPurple/30',
                        bgGradient: 'from-brandPurple/5 to-transparent',
                        badge: 'bg-brandPurple/10 text-brandPurple border-brandPurple/20',
                        scoreBorder: 'border-brandPurple text-brandPurple shadow-neonPurple/10',
                        actionBtn: 'text-brandPurple bg-brandPurple/5 border-brandPurple/10 hover:text-white hover:bg-brandPurple'
                      };

                  return (
                    <GlassCard 
                      key={idx} 
                      className={`p-6 border ${styles.border} flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6 bg-gradient-to-r ${styles.bgGradient} transition-all duration-300`}
                    >
                      {/* Left: Job Details */}
                      <div className="space-y-3.5 flex-1">
                        <div className="flex flex-wrap items-center gap-3">
                          <span className={`px-2.5 py-1 rounded-xl text-[9px] font-black tracking-wider uppercase border ${styles.badge}`}>
                            {job.category} • {job.matchPercentage}% Compatible
                          </span>
                          <span className="text-xs text-gray-500 font-semibold flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-gray-500" />
                            {job.location}
                          </span>
                          <span className="text-xs text-gray-500 font-semibold flex items-center gap-1">
                            <Building className="w-3.5 h-3.5 text-gray-500" />
                            {job.salary}
                          </span>
                        </div>

                        <div className="space-y-1">
                          <h4 className="text-lg font-black text-white leading-tight">{job.title}</h4>
                          <h5 className="text-xs text-brandCyan font-bold">{job.company}</h5>
                        </div>

                        <p className="text-xs text-gray-400 max-w-3xl leading-relaxed text-justify">
                          {job.description}
                        </p>

                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {job.requirements?.map((req, rIdx) => (
                            <span key={rIdx} className="px-2.5 py-1 rounded-lg bg-white/5 border border-borderGlass text-[9px] text-gray-300 font-semibold">
                              {req}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Right Panel Actions */}
                      <div className="flex flex-col items-center justify-center text-center p-5 rounded-2xl bg-white/5 border border-borderGlass/60 min-w-[220px] gap-2.5">
                        <div className={`w-14 h-14 rounded-full border-4 flex items-center justify-center font-black text-sm ${styles.scoreBorder}`}>
                          {job.matchPercentage}%
                        </div>
                        <div className="space-y-1">
                          <h5 className="text-[10px] font-bold text-white uppercase tracking-wider block">Match Rationale</h5>
                          <p className="text-[10px] text-gray-400 leading-normal max-w-[170px] truncate-3-lines">
                            {job.feedback}
                          </p>
                        </div>
                        
                        <div className="space-y-1.5 w-full mt-2 text-xs">
                          <button
                            onClick={() => handleRunSkillGap(job)}
                            className="w-full py-2 text-[10px] text-brandCyan hover:text-white font-bold flex items-center justify-center gap-1 transition bg-white/5 border border-borderGlass rounded-lg"
                          >
                            Tweak Skill Gap <ArrowUpRight className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => triggerOutreach(job)}
                            className={`w-full py-2 text-[10px] font-bold flex items-center justify-center gap-1 transition rounded-lg border ${styles.actionBtn}`}
                          >
                            AI Recruiter Outreach <Mail className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                    </GlassCard>
                  );
                })}
              </div>
            </div>

          </div>
        )}
      </main>

      <OutreachModal 
        isOpen={outreachOpen}
        onClose={() => setOutreachOpen(false)}
        jobTitle={outreachJob.title}
        companyName={outreachJob.company}
        jobDescription={outreachJob.description}
      />
    </div>
  );
};

export default JobRecommendations;
