import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  FileText, 
  Award, 
  Sparkles, 
  TrendingUp, 
  Upload, 
  Plus, 
  ArrowRight,
  ShieldCheck,
  AlertTriangle
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts';
import { resumeAPI, analysisAPI } from '../utils/api';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import GlassCard from '../components/GlassCard';

const Dashboard = () => {
  const navigate = useNavigate();
  const [resumes, setResumes] = useState([]);
  const [analyses, setAnalyses] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        const resumesRes = await resumeAPI.getAll();
        setResumes(resumesRes.data.data || []);

        const analysesRes = await analysisAPI.getAll();
        setAnalyses(analysesRes.data.data || []);
      } catch (err) {
        console.error('Error fetching dashboard statistics:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const latestResume = resumes[0]; // sorted by newest
  const latestAnalysis = analyses.find(a => latestResume && a.resume?._id === latestResume._id) || analyses[0];

  // Dynamic ATS Score optimization history calculation
  const historyData = analyses.length > 0
    ? [...analyses].reverse().map((a, i) => ({
        name: i === analyses.length - 1 ? 'Latest' : `Audit ${i + 1}`,
        score: a.atsScore
      }))
    : [
        { name: 'Initial', score: 45 },
        { name: 'Latest', score: latestAnalysis ? latestAnalysis.atsScore : 75 }
      ];

  // Dynamic skill category parsing from the active resume
  const getSkillsData = () => {
    if (!latestResume || !latestResume.skills) {
      return [
        { name: 'Languages', value: 30 },
        { name: 'Frameworks', value: 30 },
        { name: 'Databases', value: 20 },
        { name: 'DevOps', value: 10 },
        { name: 'Testing', value: 10 },
      ];
    }

    const skills = latestResume.skills.map(s => s.toLowerCase().trim());
    
    const categories = {
      Languages: ['javascript', 'python', 'java', 'typescript', 'html', 'css', 'c++', 'go', 'ruby', 'sql', 'php', 'rust', 'c#'],
      Frameworks: ['react', 'node', 'express', 'angular', 'vue', 'next', 'django', 'flask', 'spring', 'bootstrap', 'tailwind', 'redux', 'jquery'],
      Databases: ['mongodb', 'postgres', 'postgresql', 'mysql', 'redis', 'sqlite', 'oracle', 'dynamodb', 'firebase'],
      DevOps: ['docker', 'kubernetes', 'aws', 'gcp', 'azure', 'jenkins', 'ci/cd', 'git', 'terraform', 'github', 'linux'],
      Testing: ['jest', 'cypress', 'mocha', 'selenium', 'playwright', 'testing-library', 'junit']
    };

    return Object.keys(categories).map(cat => {
      const count = skills.filter(skill => 
        categories[cat].some(keyword => skill.includes(keyword) || keyword.includes(skill))
      ).length;
      
      const value = count === 0 ? 10 : count === 1 ? 40 : count === 2 ? 70 : count === 3 ? 90 : 100;
      return { name: cat, value };
    });
  };

  const skillsData = getSkillsData();

  return (
    <div className="min-h-screen bg-darkBg text-gray-100 flex">
      <Sidebar />
      
      <main className="flex-1 ml-64 min-h-screen p-8 pt-28 space-y-8 overflow-y-auto">
        <Navbar title="Analytical Command Center" />

        {loading ? (
          <div className="h-[60vh] flex flex-col items-center justify-center gap-3">
            <div className="w-12 h-12 rounded-full border-4 border-brandBlue/30 border-t-brandBlue animate-spin"></div>
            <span className="text-sm text-gray-400">Restructuring parameters...</span>
          </div>
        ) : (
          <>
            {/* 1. HERO METRIC SLATE */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {/* Score Metric */}
              <GlassCard className="md:col-span-2 bg-gradient-to-br from-brandBlue/10 to-brandPurple/10 border-brandBlue/20 flex items-center justify-between">
                <div className="space-y-2">
                  <span className="text-xs text-brandCyan font-bold tracking-widest uppercase">ATS Audit Rating</span>
                  <h2 className="text-5xl font-black tracking-tight text-white">
                    {latestAnalysis ? `${latestAnalysis.atsScore}%` : 'N/A'}
                  </h2>
                  <p className="text-xs text-gray-400">
                    {latestAnalysis && latestAnalysis.atsScore > 75 
                      ? '🟢 Optimal placement strength reached!' 
                      : '🟡 Needs layout restructuring & keywords injection.'}
                  </p>
                </div>
                <div className="w-24 h-24 rounded-full bg-white/5 border border-white/10 flex items-center justify-center relative shadow-neonBlue/10">
                  <Award className="w-10 h-10 text-brandCyan animate-pulse" />
                  <div className="absolute inset-0 rounded-full border-2 border-brandCyan/40 animate-ping opacity-25"></div>
                </div>
              </GlassCard>

              {/* Active Profile */}
              <GlassCard className="flex flex-col justify-between">
                <div className="space-y-1">
                  <span className="text-xs text-gray-500 font-bold uppercase tracking-wider">Active Workspace</span>
                  <h4 className="text-sm font-bold text-white truncate">
                    {latestResume ? latestResume.fileName : 'No Active Resume'}
                  </h4>
                  <p className="text-xs text-gray-500">
                    {latestResume ? `Skills listed: ${latestResume.skills.length}` : 'Click Upload to begin'}
                  </p>
                </div>
                {latestResume ? (
                  <Link to="/builder" className="text-xs text-brandBlue hover:text-brandCyan font-semibold flex items-center gap-1.5 mt-4">
                    Modify profile in Builder <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                ) : (
                  <Link to="/upload" className="text-xs text-brandBlue hover:underline flex items-center gap-1 mt-4">
                    Upload Resume <Plus className="w-3.5 h-3.5" />
                  </Link>
                )}
              </GlassCard>

              {/* Suggestions Flag */}
              <GlassCard className="flex flex-col justify-between">
                <div className="space-y-1">
                  <span className="text-xs text-gray-500 font-bold uppercase tracking-wider">Optimizations Pending</span>
                  <h4 className="text-sm font-bold text-white">
                    {latestAnalysis && latestAnalysis.whereToAdd ? `${latestAnalysis.whereToAdd.length} Actions` : '0 Actions'}
                  </h4>
                  <p className="text-xs text-gray-500">Suggested revisions to boost visibility.</p>
                </div>
                {latestAnalysis ? (
                  <Link to="/analysis" className="text-xs text-brandPurple hover:text-brandCyan font-semibold flex items-center gap-1.5 mt-4">
                    Execute Analysis <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                ) : (
                  <button onClick={() => navigate('/upload')} className="text-xs text-gray-400 flex items-center gap-1.5 mt-4">
                    Upload file to analyze
                  </button>
                )}
              </GlassCard>
            </div>

            {/* 2. ANALYTICAL CHARTS PANEL */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* ATS History Chart */}
              <GlassCard className="lg:col-span-2 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-bold text-white">ATS Optimization History</h3>
                    <p className="text-xs text-gray-500">Review your incremental rating progressions</p>
                  </div>
                  <span className="p-2 bg-white/5 border border-borderGlass rounded-xl text-brandBlue">
                    <TrendingUp className="w-4 h-4" />
                  </span>
                </div>
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={historyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="scoreColor" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="name" stroke="#6b7280" fontSize={11} tickLine={false} />
                      <YAxis stroke="#6b7280" fontSize={11} tickLine={false} domain={[0, 100]} />
                      <Tooltip 
                        contentStyle={{ 
                          background: 'rgba(13, 20, 35, 0.95)', 
                          borderColor: 'rgba(59, 130, 246, 0.4)',
                          borderRadius: '8px',
                          color: '#fff',
                          fontSize: '12px'
                        }} 
                      />
                      <Area type="monotone" dataKey="score" stroke="#3b82f6" strokeWidth={2.5} fillOpacity={1} fill="url(#scoreColor)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </GlassCard>

              {/* Core Skill Categories */}
              <GlassCard className="space-y-4">
                <div>
                  <h3 className="text-base font-bold text-white">Skill Category Coverage</h3>
                  <p className="text-xs text-gray-500">Keyword weights by domain</p>
                </div>
                <div className="h-64 w-full flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={skillsData} layout="vertical" margin={{ top: 10, right: 10, left: -10, bottom: 5 }}>
                      <XAxis type="number" stroke="#6b7280" fontSize={10} tickLine={false} domain={[0, 100]} />
                      <YAxis dataKey="name" type="category" stroke="#6b7280" fontSize={10} tickLine={false} />
                      <Tooltip
                        contentStyle={{
                          background: 'rgba(13, 20, 35, 0.95)',
                          borderColor: 'rgba(139, 92, 246, 0.4)',
                          borderRadius: '8px',
                          color: '#fff',
                          fontSize: '12px'
                        }}
                      />
                      <Bar dataKey="value" fill="#8b5cf6" radius={[0, 4, 4, 0]} barSize={12} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </GlassCard>
            </div>

            {/* 3. CENTRAL ACTIONS ROW */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <GlassCard hoverEffect delay={0.05} onClick={() => navigate('/upload')} className="group flex items-center gap-4">
                <div className="p-3.5 bg-brandBlue/10 border border-brandBlue/20 text-brandBlue rounded-xl group-hover:shadow-neonBlue transition-all">
                  <Upload className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white group-hover:text-brandBlue transition-colors">Upload New Resume</h4>
                  <p className="text-xs text-gray-500">Submit PDF/DOCX to parse details</p>
                </div>
              </GlassCard>

              <GlassCard hoverEffect delay={0.1} onClick={() => navigate('/builder')} className="group flex items-center gap-4">
                <div className="p-3.5 bg-brandPurple/10 border border-brandPurple/20 text-brandPurple rounded-xl group-hover:shadow-neonPurple transition-all">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white group-hover:text-brandPurple transition-colors">Customize in Builder</h4>
                  <p className="text-xs text-gray-500">Tweak standard ATS-friendly profiles</p>
                </div>
              </GlassCard>

              <GlassCard hoverEffect delay={0.15} onClick={() => navigate('/jobs')} className="group flex items-center gap-4">
                <div className="p-3.5 bg-brandCyan/10 border border-brandCyan/20 text-brandCyan rounded-xl group-hover:shadow-neonPurple transition-all">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white group-hover:text-brandCyan transition-colors">Match Job Postings</h4>
                  <p className="text-xs text-gray-500">Calculate percentage scores against JDs</p>
                </div>
              </GlassCard>
            </div>

            {/* 4. DETAILS SECTION (WELCOME SEED MESSAGE) */}
            {!latestAnalysis && (
              <GlassCard className="border border-brandCyan/20 bg-brandCyan/5 p-6 flex flex-col md:flex-row items-center gap-4">
                <AlertTriangle className="w-10 h-10 text-brandCyan flex-shrink-0 animate-bounce" />
                <div className="space-y-1 text-center md:text-left">
                  <h4 className="text-sm font-bold text-white">Starter Resume Activated!</h4>
                  <p className="text-xs text-gray-400">
                    Congratulations on joining Career AI! We have initialized your profile with a **pre-filled ATS-friendly starter resume**. 
                    Click **Customize in Builder** to plug in your details and download your A4 PDF resume immediately.
                  </p>
                </div>
              </GlassCard>
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
