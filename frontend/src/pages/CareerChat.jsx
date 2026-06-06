import React, { useState, useEffect, useRef } from 'react';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import GlassCard from '../components/GlassCard';
import { 
  MessageSquare, 
  Send, 
  Sparkles, 
  User, 
  Cpu, 
  HelpCircle,
  AlertCircle
} from 'lucide-react';
import { resumeAPI, analysisAPI } from '../utils/api';

const CareerChat = () => {
  const [resumes, setResumes] = useState([]);
  const [selectedResumeId, setSelectedResumeId] = useState('');
  const [message, setMessage] = useState('');
  const [chatHistory, setChatHistory] = useState([
    {
      sender: 'mentor',
      text: 'Hello! I am your AI Career Mentor. I have loaded your workspace parameters. Ask me any question or doubt regarding your resume, target roles, skill roadmaps, or career pivots!'
    }
  ]);
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);

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
        console.error('Error loading resumes for career chatbot:', err);
      }
    };
    loadResumes();
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory, loading]);

  const handleSendMessage = async (textToSend) => {
    const activeMsg = textToSend || message;
    if (!activeMsg.trim() || !selectedResumeId) return;

    if (!textToSend) {
      setMessage('');
    }

    const newHistory = [...chatHistory, { sender: 'user', text: activeMsg }];
    setChatHistory(newHistory);
    setLoading(true);

    try {
      const res = await analysisAPI.chat({
        resumeId: selectedResumeId,
        chatHistory: chatHistory,
        message: activeMsg
      });

      if (res.data && res.data.success) {
        setChatHistory(prev => [...prev, { sender: 'mentor', text: res.data.data }]);
      }
    } catch (err) {
      console.error('Error communicating with career chatbot:', err);
      setChatHistory(prev => [...prev, { 
        sender: 'mentor', 
        text: '⚠️ Connection timeout. Please verify your internet or local Express server status.' 
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickPrompt = (promptText) => {
    handleSendMessage(promptText);
  };

  const quickPrompts = [
    { label: "💡 Skills to learn next", text: "Suggest 3 skills I should learn next to level up my career based on my resume." },
    { label: "📝 Critique my summary", text: "Critique my professional summary and rewrite it with Google metric formulas." },
    { label: "💰 Expected salary ranges", text: "What kind of salary ranges should I expect for my target roles based on my skills?" }
  ];

  return (
    <div className="min-h-screen bg-darkBg text-gray-100 flex">
      <Sidebar />

      <main className="flex-1 ml-64 min-h-screen p-8 pt-28 space-y-8 flex flex-col justify-between overflow-hidden">
        <Navbar title="AI Career Mentor Studio" />

        <div className="flex-1 grid grid-cols-1 xl:grid-cols-12 gap-8 items-stretch overflow-hidden min-h-[500px]">
          
          {/* Chat Workspace (Left 8 columns) */}
          <div className="xl:col-span-8 flex flex-col justify-between space-y-4 overflow-hidden h-[72vh] glass-panel border border-borderGlass rounded-3xl p-6 relative">
            
            {/* Header Configuration */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-4 border-b border-slate-900 gap-3">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-brandCyan" />
                <h3 className="text-sm font-bold text-white">AI Mentor Console</h3>
              </div>
              
              <div className="flex items-center gap-2 text-xs">
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block">Active Profile:</span>
                <select
                  value={selectedResumeId}
                  onChange={(e) => {
                    const nextId = e.target.value;
                    setSelectedResumeId(nextId);
                    const matched = resumes.find(r => r._id === nextId);
                    if (matched) {
                      setChatHistory(prev => [
                        ...prev,
                        {
                          sender: 'mentor',
                          text: `🔄 Active Profile context switched to: "${matched.fileName}". Ask me any questions or roadmaps based on this profile!`
                        }
                      ]);
                    }
                  }}
                  className="px-2.5 py-1.5 rounded-lg bg-white/5 border border-borderGlass text-gray-200 outline-none text-xs transition"
                >
                  {resumes.map(r => (
                    <option key={r._id} value={r._id} className="bg-darkBg text-gray-200">
                      {r.fileName}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Scrollable Message Box */}
            <div className="flex-1 overflow-y-auto pr-2 space-y-4 py-4 text-xs scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
              {chatHistory.map((msg, idx) => {
                const isUser = msg.sender === 'user';
                return (
                  <div key={idx} className={`flex gap-3 max-w-[85%] ${isUser ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}>
                    {/* Avatar */}
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 font-bold ${
                      isUser 
                        ? 'bg-gradient-to-tr from-brandBlue to-brandPurple text-white' 
                        : 'bg-white/5 border border-borderGlass text-brandCyan'
                    }`}>
                      {isUser ? <User className="w-4 h-4" /> : <Cpu className="w-4 h-4" />}
                    </div>

                    {/* Chat Bubble content */}
                    <div className={`p-4 rounded-2xl leading-relaxed text-justify ${
                      isUser 
                        ? 'bg-slate-900 border border-slate-800 text-gray-100 rounded-tr-none' 
                        : 'bg-white/5 border border-borderGlass/60 text-gray-300 rounded-tl-none font-normal'
                    }`}>
                      <pre className="whitespace-pre-wrap font-sans text-xs">
                        {msg.text}
                      </pre>
                    </div>
                  </div>
                );
              })}

              {/* Typing Loader */}
              {loading && (
                <div className="flex gap-3 max-w-[80%] mr-auto">
                  <div className="w-8 h-8 rounded-full bg-white/5 border border-borderGlass flex items-center justify-center text-brandCyan">
                    <Cpu className="w-4 h-4 animate-bounce" />
                  </div>
                  <div className="p-4 rounded-2xl bg-white/5 border border-borderGlass rounded-tl-none flex items-center gap-1.5 py-3">
                    <span className="w-1.5 h-1.5 bg-brandCyan rounded-full animate-bounce delay-100"></span>
                    <span className="w-1.5 h-1.5 bg-brandCyan rounded-full animate-bounce delay-200"></span>
                    <span className="w-1.5 h-1.5 bg-brandCyan rounded-full animate-bounce delay-300"></span>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Input Form Console */}
            <form 
              onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }} 
              className="flex items-center gap-2.5 pt-4 border-t border-slate-900"
            >
              <textarea
                rows={1}
                disabled={loading || resumes.length === 0}
                placeholder="Ask your Career Mentor anything regarding your profile..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                className="flex-1 px-4 py-3 rounded-xl bg-white/5 border border-borderGlass text-gray-200 text-xs outline-none focus:border-brandBlue transition resize-none max-h-12 overflow-y-auto leading-normal"
              />
              <button
                type="submit"
                disabled={loading || !message.trim()}
                className="p-3 rounded-xl bg-brandBlue hover:bg-brandBlue/90 text-white font-bold shadow-lg shadow-brandBlue/20 transition hover:scale-105 active:scale-95 disabled:opacity-50 disabled:scale-100 flex items-center justify-center flex-shrink-0"
              >
                <Send className="w-4.5 h-4.5" />
              </button>
            </form>
          </div>

          {/* Quick Helper Prompts (Right 4 columns) */}
          <div className="xl:col-span-4 flex flex-col justify-between space-y-6">
            
            {/* Explanatory Panel */}
            <GlassCard className="p-6 border border-borderGlass space-y-4">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <HelpCircle className="w-4.5 h-4.5 text-brandPurple" /> Mentor Guidelines
              </h4>
              <p className="text-xs text-gray-400 leading-relaxed text-justify">
                This Career Mentor Chatbot uses your selected resume as structural context. When you ask questions, the system feeds your timeline and competency tags to provide highly personalized advice.
              </p>
            </GlassCard>

            {/* Helper Prompts Card */}
            <GlassCard className="p-6 border border-borderGlass space-y-4 flex-1 flex flex-col justify-start">
              <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest">Quick Suggestion Prompts</h4>
              
              <div className="space-y-3 pt-2">
                {quickPrompts.map((p, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleQuickPrompt(p.text)}
                    disabled={loading || resumes.length === 0}
                    className="w-full p-3 rounded-2xl bg-white/5 border border-borderGlass/60 text-left text-xs font-semibold text-gray-300 hover:text-white hover:border-brandPurple hover:bg-brandPurple/5 transition duration-300 flex items-start gap-2 disabled:opacity-50 leading-relaxed"
                  >
                    <Sparkles className="w-4 h-4 text-brandPurple flex-shrink-0 mt-0.5" />
                    <span>{p.label}</span>
                  </button>
                ))}
              </div>
            </GlassCard>

            {/* IT Warning Status */}
            <div className="p-4 bg-amber-500/5 rounded-2xl border border-amber-500/10 text-[10px] text-gray-400 leading-relaxed flex items-start gap-2.5">
              <AlertCircle className="w-4.5 h-4.5 text-amber-400 flex-shrink-0 mt-0.5 animate-pulse" />
              <div>
                <h5 className="font-bold text-white uppercase tracking-wider mb-0.5">⚠️ Context Size Notice:</h5>
                History feeds are dynamically truncated to conserve LLM processing bounds. Ensure specific resumes are toggled before starting specialized career queries.
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
};

export default CareerChat;
