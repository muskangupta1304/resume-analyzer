import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import GlassCard from '../components/GlassCard';
import { 
  FileSpreadsheet, 
  Sparkles, 
  FileText, 
  Volume2, 
  Copy, 
  Check, 
  Printer, 
  Send,
  Building,
  Briefcase
} from 'lucide-react';
import { resumeAPI, analysisAPI } from '../utils/api';

const CoverLetterGenerator = () => {
  const [resumes, setResumes] = useState([]);
  const [selectedResumeId, setSelectedResumeId] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [outreachData, setOutreachData] = useState(null);
  const [activeTab, setActiveTab] = useState('letter'); // 'letter', 'pitch'
  const [copiedLetter, setCopiedLetter] = useState(false);
  const [copiedPitch, setCopiedPitch] = useState(false);

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
        console.error('Error loading resumes for cover letter builder:', err);
      }
    };
    loadResumes();
  }, []);

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!selectedResumeId) return;

    setLoading(true);
    try {
      const res = await analysisAPI.generateCoverLetter({
        resumeId: selectedResumeId,
        jobTitle,
        companyName,
        jobDescription
      });
      if (res.data && res.data.success) {
        setOutreachData(res.data.data);
      }
    } catch (err) {
      console.error('Error generating cover letter:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text, type) => {
    navigator.clipboard.writeText(text);
    if (type === 'letter') {
      setCopiedLetter(true);
      setTimeout(() => setCopiedLetter(false), 2000);
    } else {
      setCopiedPitch(true);
      setTimeout(() => setCopiedPitch(false), 2000);
    }
  };

  const handlePrint = () => {
    if (!outreachData) return;
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>Cover Letter - ${jobTitle || 'Application'}</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; padding: 40px; color: #333; max-width: 800px; margin: auto; }
            h1 { font-size: 24px; margin-bottom: 20px; border-bottom: 2px solid #ccc; padding-bottom: 10px; }
            pre { white-space: pre-wrap; font-family: inherit; font-size: 14px; }
          </style>
        </head>
        <body>
          <pre>${outreachData.coverLetter}</pre>
          <script>window.print();</script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="min-h-screen bg-darkBg text-gray-100 flex">
      <Sidebar />

      <main className="flex-1 ml-64 min-h-screen p-8 pt-28 space-y-8 overflow-y-auto">
        <Navbar title="Outreach Writing Studio" />

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Parameter Form Panel */}
          <div className="xl:col-span-5 space-y-6">
            <GlassCard className="p-6 border border-borderGlass space-y-6">
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <FileSpreadsheet className="w-5 h-5 text-brandCyan" /> Target Placement Details
                </h3>
                <p className="text-xs text-gray-500">Provide role specifications to configure your AI content builder.</p>
              </div>

              <form onSubmit={handleGenerate} className="space-y-4 text-xs">
                {/* Select Workspace Resume */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block">Choose Base Profile</label>
                  {resumes.length === 0 ? (
                    <div className="p-3 text-center border border-dashed border-borderGlass rounded-xl text-gray-500">
                      No workspace profiles found.
                    </div>
                  ) : (
                    <select
                      value={selectedResumeId}
                      onChange={(e) => setSelectedResumeId(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-borderGlass text-gray-200 outline-none focus:border-brandBlue transition"
                    >
                      {resumes.map(r => (
                        <option key={r._id} value={r._id} className="bg-darkBg text-gray-200">
                          {r.fileName}
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                {/* Job Title */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block">Target Job Title</label>
                  <div className="relative">
                    <Briefcase className="absolute left-3 top-2.5 w-4 h-4 text-gray-500" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. Senior Frontend Engineer"
                      value={jobTitle}
                      onChange={(e) => setJobTitle(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-white/5 border border-borderGlass text-gray-200 outline-none focus:border-brandBlue transition"
                    />
                  </div>
                </div>

                {/* Company Name */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block">Target Company Name</label>
                  <div className="relative">
                    <Building className="absolute left-3 top-2.5 w-4 h-4 text-gray-500" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. Google DeepMind"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-white/5 border border-borderGlass text-gray-200 outline-none focus:border-brandBlue transition"
                    />
                  </div>
                </div>

                {/* Job Description */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block">Target Job Description (Optional)</label>
                  <textarea
                    rows={6}
                    placeholder="Paste the core requirements, responsibilities, or tech stack here to align context..."
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-borderGlass text-gray-200 outline-none focus:border-brandBlue transition resize-none leading-relaxed"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading || resumes.length === 0}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-brandBlue to-brandPurple hover:from-brandBlue/90 hover:to-brandPurple/90 text-white font-bold flex items-center justify-center gap-1.5 shadow-lg shadow-brandBlue/20 hover:scale-[1.02] active:scale-[0.98] transition disabled:opacity-50 disabled:scale-100"
                >
                  <Sparkles className="w-4 h-4 animate-pulse" /> Compile AI Outreach Bundle
                </button>
              </form>
            </GlassCard>
          </div>

          {/* Right Column: AI Output Slate View */}
          <div className="xl:col-span-7 space-y-4">
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block">AI Compiler Outputs</span>

            {loading ? (
              <GlassCard className="h-[500px] flex flex-col items-center justify-center gap-3 text-center">
                <div className="w-12 h-12 rounded-full border-4 border-brandBlue/30 border-t-brandBlue animate-spin"></div>
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-white">Synthesizing Qualifications...</h4>
                  <p className="text-xs text-gray-500 max-w-[280px] leading-normal">Aligning active resume structures with target corporate metrics...</p>
                </div>
              </GlassCard>
            ) : !outreachData ? (
              <GlassCard className="h-[500px] flex flex-col items-center justify-center text-center p-8 border border-dashed border-borderGlass">
                <FileSpreadsheet className="w-16 h-16 text-slate-700 mb-4 animate-pulse" />
                <h4 className="text-white font-bold text-sm">Outreach Sandbox Idle</h4>
                <p className="text-xs text-gray-500 mt-2 max-w-sm leading-normal">Select your target profile and fill in the job details on the left, then click generate to compile professional cover letters and elevator pitches.</p>
              </GlassCard>
            ) : (
              <div className="space-y-4">
                {/* Tab Selectors Row */}
                <div className="flex gap-2">
                  <button
                    onClick={() => setActiveTab('letter')}
                    className={`px-4 py-2.5 rounded-xl text-xs font-bold border flex items-center gap-1.5 transition ${
                      activeTab === 'letter'
                        ? 'border-brandBlue bg-brandBlue/10 text-brandBlue shadow-md shadow-brandBlue/5'
                        : 'border-slate-800 bg-slate-900 text-gray-400 hover:text-white'
                    }`}
                  >
                    <FileText className="w-4 h-4" /> Cover Letter
                  </button>
                  <button
                    onClick={() => setActiveTab('pitch')}
                    className={`px-4 py-2.5 rounded-xl text-xs font-bold border flex items-center gap-1.5 transition ${
                      activeTab === 'pitch'
                        ? 'border-brandPurple bg-brandPurple/10 text-brandPurple shadow-md shadow-brandPurple/5'
                        : 'border-slate-800 bg-slate-900 text-gray-400 hover:text-white'
                    }`}
                  >
                    <Volume2 className="w-4 h-4" /> 30s Elevator Pitch
                  </button>
                </div>

                {/* Tab Canvas Content */}
                {activeTab === 'letter' ? (
                  <GlassCard className="p-6 border border-borderGlass space-y-4 relative">
                    {/* Header Controls */}
                    <div className="flex justify-between items-center pb-3 border-b border-slate-900">
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Formal Document View</span>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleCopy(outreachData.coverLetter, 'letter')}
                          className="px-2.5 py-1.5 rounded-lg bg-slate-800 border border-slate-700/50 hover:bg-slate-700 text-gray-300 hover:text-white text-[10px] font-bold flex items-center gap-1 transition-colors"
                        >
                          {copiedLetter ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                          {copiedLetter ? 'Copied!' : 'Copy Letter'}
                        </button>
                        <button
                          onClick={handlePrint}
                          className="px-2.5 py-1.5 rounded-lg bg-slate-800 border border-slate-700/50 hover:bg-slate-700 text-gray-300 hover:text-white text-[10px] font-bold flex items-center gap-1 transition-colors"
                        >
                          <Printer className="w-3.5 h-3.5 text-brandCyan" /> Print Layout
                        </button>
                      </div>
                    </div>

                    {/* Styled Print Sheet Sheet Paper */}
                    <div className="p-8 rounded-2xl bg-white border border-slate-200 text-slate-800 font-sans shadow-2xl overflow-y-auto max-h-[500px] leading-relaxed text-sm select-all">
                      <pre className="whitespace-pre-wrap font-sans font-normal text-slate-800 text-justify text-xs">
                        {outreachData.coverLetter}
                      </pre>
                    </div>
                  </GlassCard>
                ) : (
                  <GlassCard className="p-6 border border-borderGlass space-y-4">
                    {/* Header Controls */}
                    <div className="flex justify-between items-center pb-3 border-b border-slate-900">
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Conversational Networking Pitch</span>
                      <button
                        onClick={() => handleCopy(outreachData.elevatorPitch, 'pitch')}
                        className="px-2.5 py-1.5 rounded-lg bg-slate-800 border border-slate-700/50 hover:bg-slate-700 text-gray-300 hover:text-white text-[10px] font-bold flex items-center gap-1 transition-colors"
                      >
                        {copiedPitch ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        {copiedPitch ? 'Copied!' : 'Copy Pitch'}
                      </button>
                    </div>

                    {/* Executive Pitch Speech Bubble */}
                    <div className="p-6 rounded-2xl bg-gradient-to-br from-brandPurple/10 to-brandBlue/5 border border-brandPurple/20 text-gray-200 font-sans leading-relaxed text-xs relative overflow-hidden">
                      <div className="absolute w-24 h-24 bg-brandPurple/10 rounded-full blur-[40px] -top-5 -right-5"></div>
                      <Volume2 className="w-8 h-8 text-brandPurple animate-bounce mb-3" />
                      <p className="italic relative z-10 leading-relaxed">
                        "{outreachData.elevatorPitch}"
                      </p>
                    </div>

                    <div className="p-4 bg-white/5 rounded-2xl border border-borderGlass text-[10px] text-gray-400 leading-normal flex items-start gap-2.5">
                      <Send className="w-4 h-4 text-brandCyan flex-shrink-0 mt-0.5" />
                      <div>
                        <h5 className="font-bold text-white uppercase tracking-wider mb-0.5">💬 Interview Tip:</h5>
                        Use this pitch during the first 1-2 minutes of your interview when asked "Tell me about yourself." It is strictly structured to start with a hook, showcase your peak quantified technical values, and close with a targeted company integration motive.
                      </div>
                    </div>
                  </GlassCard>
                )}
              </div>
            )}
          </div>

        </div>
      </main>
    </div>
  );
};

export default CoverLetterGenerator;
