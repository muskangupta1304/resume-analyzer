import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import GlassCard from '../components/GlassCard';
import { 
  Gamepad2, 
  Sparkles, 
  Award, 
  ArrowRight, 
  CheckCircle2, 
  XCircle, 
  MessageSquareCode,
  Copy,
  Check,
  TrendingUp,
  RotateCcw
} from 'lucide-react';
import { resumeAPI, analysisAPI } from '../utils/api';

const InterviewPrep = () => {
  const [resumes, setResumes] = useState([]);
  const [selectedResumeId, setSelectedResumeId] = useState('');
  const [targetRole, setTargetRole] = useState('');
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [loadingFeedback, setLoadingFeedback] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [copiedModel, setCopiedModel] = useState(false);

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
        console.error('Error loading resumes for interview simulator:', err);
      }
    };
    loadResumes();
  }, []);

  const handleStartSim = async (e) => {
    e.preventDefault();
    if (!selectedResumeId) return;

    setLoadingQuestions(true);
    setFeedback(null);
    setUserAnswer('');
    setCurrentIdx(0);
    try {
      const res = await analysisAPI.getInterviewQuestions({
        resumeId: selectedResumeId,
        targetRole
      });
      if (res.data && res.data.success) {
        setQuestions(res.data.data || []);
      }
    } catch (err) {
      console.error('Error loading interview questions:', err);
    } finally {
      setLoadingQuestions(false);
    }
  };

  const handleSubmitAnswer = async (e) => {
    e.preventDefault();
    if (!userAnswer.trim()) return;

    setLoadingFeedback(true);
    setFeedback(null);
    try {
      const activeQuestion = questions[currentIdx].question;
      const res = await analysisAPI.gradeInterviewAnswer({
        resumeId: selectedResumeId,
        question: activeQuestion,
        userAnswer,
        targetRole
      });
      if (res.data && res.data.success) {
        setFeedback(res.data.data);
      }
    } catch (err) {
      console.error('Error grading answer:', err);
    } finally {
      setLoadingFeedback(false);
    }
  };

  const handleNextQuestion = () => {
    setFeedback(null);
    setUserAnswer('');
    setCurrentIdx(prev => prev + 1);
  };

  const handleResetSim = () => {
    setQuestions([]);
    setFeedback(null);
    setUserAnswer('');
    setCurrentIdx(0);
  };

  const handleCopyModel = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedModel(true);
    setTimeout(() => setCopiedModel(false), 2000);
  };

  return (
    <div className="min-h-screen bg-darkBg text-gray-100 flex">
      <Sidebar />

      <main className="flex-1 ml-64 min-h-screen p-8 pt-28 space-y-8 overflow-y-auto">
        <Navbar title="AI Mock Interview Simulator" />

        {/* 1. CONFIGURATION INTERACTION PANEL */}
        {questions.length === 0 && (
          <div className="max-w-2xl mx-auto space-y-6">
            <GlassCard className="p-8 border border-borderGlass space-y-6 text-center">
              <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-brandBlue/20 to-brandPurple/20 border border-brandBlue/30 flex items-center justify-center mx-auto shadow-neonBlue">
                <Gamepad2 className="w-8 h-8 text-brandCyan" />
              </div>

              <div className="space-y-2">
                <h2 className="text-xl font-black text-white">AI Recruiting Simulator</h2>
                <p className="text-xs text-gray-400 max-w-md mx-auto leading-relaxed">
                  Generate challenging behavioral and technical questions dynamically tailored against your active resume. Submit your answers to receive rating audits and Gemini-optimized rewrites.
                </p>
              </div>

              {loadingQuestions ? (
                <div className="py-6 flex flex-col items-center justify-center gap-3">
                  <div className="w-10 h-10 border-4 border-brandBlue/30 border-t-brandBlue rounded-full animate-spin"></div>
                  <span className="text-xs text-gray-400">Drafting questions and analyzing core timeline skills...</span>
                </div>
              ) : (
                <form onSubmit={handleStartSim} className="space-y-4 text-xs max-w-md mx-auto text-left pt-2">
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

                  {/* Target Role */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block">Target Engineering/Business Role</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Senior Full Stack Developer"
                      value={targetRole}
                      onChange={(e) => setTargetRole(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-borderGlass text-gray-200 outline-none focus:border-brandBlue transition"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={resumes.length === 0}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-brandBlue to-brandPurple hover:from-brandBlue/90 hover:to-brandPurple/90 text-white font-bold flex items-center justify-center gap-1.5 shadow-lg shadow-brandBlue/20 hover:scale-[1.02] active:scale-[0.98] transition"
                  >
                    <Sparkles className="w-4 h-4 animate-pulse" /> Launch Interview Session
                  </button>
                </form>
              )}
            </GlassCard>
          </div>
        )}

        {/* 2. ACTIVE SIMULATOR INTERFACE */}
        {questions.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left Column: Question & Answer Console */}
            <div className="lg:col-span-6 space-y-6">
              <GlassCard className="p-6 border border-borderGlass space-y-6">
                {/* Header Progress indicator */}
                <div className="flex justify-between items-center text-xs pb-3 border-b border-slate-900">
                  <span className="px-2.5 py-0.5 rounded-full bg-brandPurple/20 text-brandPurple font-extrabold text-[9px] uppercase tracking-wider">
                    {questions[currentIdx].category} Question
                  </span>
                  <span className="text-gray-400 font-bold">
                    Question {currentIdx + 1} of {questions.length}
                  </span>
                </div>

                {/* Question Box */}
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Interview Question:</h3>
                  <p className="text-base font-black text-white leading-relaxed">
                    "{questions[currentIdx].question}"
                  </p>
                </div>

                {/* Answer form */}
                <form onSubmit={handleSubmitAnswer} className="space-y-4 text-xs">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block">Your Answer Response</label>
                    <textarea
                      rows={6}
                      disabled={loadingFeedback || feedback}
                      placeholder="Type your comprehensive response here... Try including context, actions you took, and final metrics."
                      value={userAnswer}
                      onChange={(e) => setUserAnswer(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-borderGlass text-gray-200 outline-none focus:border-brandBlue transition resize-none leading-relaxed text-xs disabled:opacity-75"
                    />
                  </div>

                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={handleResetSim}
                      className="px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700/50 hover:bg-slate-700 text-gray-300 font-bold text-xs flex items-center justify-center gap-1.5 transition"
                    >
                      <RotateCcw className="w-4 h-4" /> Reset
                    </button>

                    {feedback ? (
                      currentIdx < questions.length - 1 ? (
                        <button
                          type="button"
                          onClick={handleNextQuestion}
                          className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-brandBlue to-brandPurple hover:from-brandBlue/90 hover:to-brandPurple/90 text-white font-bold flex items-center justify-center gap-1.5 shadow-lg shadow-brandBlue/20 transition hover:scale-[1.02]"
                        >
                          Next Question <ArrowRight className="w-4 h-4" />
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={handleResetSim}
                          className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-500/20 transition hover:scale-[1.02]"
                        >
                          <CheckCircle2 className="w-4 h-4" /> Finish Session
                        </button>
                      )
                    ) : (
                      <button
                        type="submit"
                        disabled={loadingFeedback || !userAnswer.trim()}
                        className="flex-1 py-2.5 rounded-xl bg-brandBlue hover:bg-brandBlue/90 text-white font-bold flex items-center justify-center gap-1.5 shadow-lg shadow-brandBlue/20 transition hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:scale-100"
                      >
                        {loadingFeedback ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            Evaluating answer details...
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-4 h-4 animate-pulse" /> Submit & Analyze Answer
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </form>
              </GlassCard>
            </div>

            {/* Right Column: AI Feedback Panel */}
            <div className="lg:col-span-6 space-y-4">
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block">AI Feedback Console</span>

              {loadingFeedback && (
                <GlassCard className="h-[400px] flex flex-col items-center justify-center gap-3 text-center">
                  <div className="w-12 h-12 border-4 border-brandBlue/30 border-t-brandBlue rounded-full animate-spin"></div>
                  <div>
                    <h4 className="text-sm font-bold text-white">Analyzing Behavioral Parameters...</h4>
                    <p className="text-xs text-gray-500 max-w-[260px] leading-normal mt-1">Cross-referencing core resume competencies with corporate expectations...</p>
                  </div>
                </GlassCard>
              )}

              {!loadingFeedback && !feedback && (
                <GlassCard className="h-[400px] flex flex-col items-center justify-center text-center p-8 border border-dashed border-borderGlass">
                  <MessageSquareCode className="w-16 h-16 text-slate-700 mb-4 animate-pulse" />
                  <h4 className="text-white font-bold text-sm">Feedback Terminal Standby</h4>
                  <p className="text-xs text-gray-500 mt-2 max-w-xs leading-normal">Submit your typed answer on the left to activate grading audits, strength matrices, and optimized response models.</p>
                </GlassCard>
              )}

              {!loadingFeedback && feedback && (
                <div className="space-y-6 animate-fadeIn">
                  {/* Rating Scorecard */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <GlassCard className="p-4 flex items-center justify-between col-span-2 bg-gradient-to-br from-brandBlue/10 to-brandPurple/10 border-brandBlue/20">
                      <div className="space-y-1">
                        <span className="text-[9px] text-brandCyan font-bold tracking-widest uppercase block">AI Answer Score</span>
                        <h2 className="text-3xl font-black text-white">{feedback.rating}%</h2>
                        <p className="text-[10px] text-gray-400">
                          {feedback.rating > 80 ? '🟢 Superior rating achieved!' : feedback.rating > 60 ? '🟡 Average score. Can expand details.' : '🔴 Lacks metrics & STAR structure.'}
                        </p>
                      </div>
                      <Award className="w-10 h-10 text-brandCyan" />
                    </GlassCard>

                    <GlassCard className="p-4 flex flex-col justify-center">
                      <span className="text-[9px] text-gray-500 font-bold uppercase tracking-wider block">Audits Pending</span>
                      <h3 className="text-sm font-bold text-white mt-1">
                        {feedback.gaps?.length || 0} Improvements
                      </h3>
                      <span className="text-[9px] text-gray-400 mt-0.5">Recommendations given</span>
                    </GlassCard>
                  </div>

                  {/* Feedback Details Card */}
                  <GlassCard className="p-6 border border-borderGlass space-y-4">
                    {/* Strengths & Gaps */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-[11px]">
                      {/* Strengths */}
                      <div className="space-y-2">
                        <h4 className="font-bold text-emerald-400 flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4 flex-shrink-0" /> Response Strengths
                        </h4>
                        <ul className="space-y-1.5 pl-5 list-disc text-gray-400 leading-relaxed text-justify">
                          {feedback.strengths?.map((s, idx) => <li key={idx}>{s}</li>)}
                        </ul>
                      </div>

                      {/* Gaps */}
                      <div className="space-y-2">
                        <h4 className="font-bold text-amber-400 flex items-center gap-1.5">
                          <XCircle className="w-4 h-4 flex-shrink-0 animate-pulse" /> Areas of Improvement
                        </h4>
                        <ul className="space-y-1.5 pl-5 list-disc text-gray-400 leading-relaxed text-justify">
                          {feedback.gaps?.map((g, idx) => <li key={idx}>{g}</li>)}
                        </ul>
                      </div>
                    </div>

                    {/* Overall Summary Paragraph */}
                    <div className="p-4 bg-white/5 rounded-2xl border border-borderGlass text-[11px] leading-relaxed text-gray-300">
                      <h4 className="font-bold text-white mb-1 uppercase tracking-widest flex items-center gap-1">
                        <TrendingUp className="w-4 h-4 text-brandPurple" /> Coaching Evaluation:
                      </h4>
                      {feedback.feedback}
                    </div>

                    {/* Perfect Model Answer */}
                    <div className="space-y-2 pt-2 border-t border-slate-900">
                      <div className="flex justify-between items-center">
                        <h4 className="text-[10px] font-bold text-brandCyan uppercase tracking-widest flex items-center gap-1.5">
                          <Sparkles className="w-4 h-4 text-brandCyan" /> Optimized STAR Model Answer
                        </h4>
                        <button
                          onClick={() => handleCopyModel(feedback.modelAnswer)}
                          className="px-2 py-1 rounded bg-slate-800 border border-slate-700/50 hover:bg-slate-700 text-gray-300 hover:text-white text-[9px] font-bold flex items-center gap-1 transition"
                        >
                          {copiedModel ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                          {copiedModel ? 'Copied!' : 'Copy Answer'}
                        </button>
                      </div>
                      <p className="p-4 rounded-2xl bg-brandBlue/5 border border-brandBlue/15 text-[10px] italic leading-relaxed text-gray-300 select-all text-justify">
                        "{feedback.modelAnswer}"
                      </p>
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

export default InterviewPrep;
