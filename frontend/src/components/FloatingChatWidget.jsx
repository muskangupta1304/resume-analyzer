import React, { useState, useEffect, useRef } from 'react';
import { 
  MessageSquare, 
  X, 
  Send, 
  Cpu, 
  User, 
  Sparkles,
  HelpCircle
} from 'lucide-react';
import { resumeAPI, analysisAPI } from '../utils/api';

const FloatingChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [resumes, setResumes] = useState([]);
  const [selectedResumeId, setSelectedResumeId] = useState('');
  const [message, setMessage] = useState('');
  const [chatHistory, setChatHistory] = useState([
    {
      sender: 'mentor',
      text: "Hi! I am your global AI Career Mentor. Ask me any question or doubt about your resume from any screen in the app!"
    }
  ]);
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);

  // Load resumes when widget opens
  useEffect(() => {
    if (!isOpen) return;

    const loadResumes = async () => {
      try {
        const res = await resumeAPI.getAll();
        const list = res.data.data || [];
        setResumes(list);
        if (list.length > 0 && !selectedResumeId) {
          setSelectedResumeId(list[0]._id);
        }
      } catch (err) {
        console.error('Error loading resumes in floating chat widget:', err);
      }
    };
    loadResumes();
  }, [isOpen]);

  // Scroll to bottom
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
      console.error('Error in floating chat widget response:', err);
      setChatHistory(prev => [...prev, { 
        sender: 'mentor', 
        text: '⚠️ API Connection timeout. Please try again in a few seconds.' 
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickPrompt = (promptText) => {
    handleSendMessage(promptText);
  };

  const quickPrompts = [
    { label: "💡 Skills roadmap", text: "Suggest 3 skills I should learn next to level up my career based on my resume." },
    { label: "📝 Critique summary", text: "Critique my professional summary and rewrite it with Google metric formulas." }
  ];

  return (
    <div className="fixed bottom-6 right-6 z-50 font-sans">
      
      {/* 1. FLOATING ACTION ICON BUTTON */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-14 h-14 rounded-full flex items-center justify-center text-white bg-gradient-to-tr from-brandBlue to-brandPurple border border-brandBlue/30 shadow-2xl hover:scale-110 active:scale-95 transition-all duration-300 ${
          isOpen ? 'rotate-90 shadow-neonPurple/20' : 'shadow-neonBlue/20 animate-pulse'
        }`}
      >
        {isOpen ? <X className="w-6 h-6 text-white" /> : <MessageSquare className="w-6 h-6 text-white" />}
      </button>

      {/* 2. CHAT OVERLAY POPUP */}
      {isOpen && (
        <div className="absolute bottom-20 right-0 w-[380px] h-[520px] rounded-3xl glass-panel border border-borderGlass shadow-2xl flex flex-col justify-between overflow-hidden animate-fadeIn backdrop-blur-xl">
          
          {/* Header Row */}
          <div className="p-4 border-b border-slate-900 bg-slate-950/40 flex flex-col gap-2">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="w-6.5 h-6.5 rounded-lg bg-gradient-to-tr from-brandBlue/20 to-brandPurple/20 border border-brandBlue/30 flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-brandCyan" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white leading-none">AI Career Mentor</h4>
                  <span className="text-[9px] text-gray-500 font-semibold block mt-0.5">Global Chat Assistant</span>
                </div>
              </div>
              
              <button 
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-lg bg-white/5 border border-borderGlass text-gray-500 hover:text-white transition"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Resume Selector */}
            <div className="flex items-center justify-between text-[10px] bg-white/5 border border-borderGlass/60 px-2 py-1.5 rounded-xl gap-2">
              <span className="text-gray-400 font-medium flex items-center gap-1">
                <HelpCircle className="w-3 h-3 text-slate-500" /> Active Profile:
              </span>
              {resumes.length === 0 ? (
                <span className="text-gray-500 italic">No workspace profiles</span>
              ) : (
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
                  className="bg-transparent text-gray-200 outline-none font-bold text-[9px] max-w-[190px] cursor-pointer"
                >
                  {resumes.map(r => (
                    <option key={r._id} value={r._id} className="bg-darkBg text-gray-200 text-[10px]">
                      {r.fileName}
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>

          {/* Scrollable Chat Logs Feed */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent text-[11px] leading-relaxed">
            {chatHistory.map((msg, idx) => {
              const isUser = msg.sender === 'user';
              return (
                <div key={idx} className={`flex gap-2.5 max-w-[85%] ${isUser ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}>
                  {/* Avatar */}
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 font-bold ${
                    isUser 
                      ? 'bg-gradient-to-tr from-brandBlue to-brandPurple text-white text-[10px]' 
                      : 'bg-white/5 border border-borderGlass text-brandCyan text-[10px]'
                  }`}>
                    {isUser ? <User className="w-3.5 h-3.5" /> : <Cpu className="w-3.5 h-3.5" />}
                  </div>

                  {/* Speech Bubble */}
                  <div className={`p-3 rounded-2xl text-justify ${
                    isUser 
                      ? 'bg-slate-900 border border-slate-800 text-gray-200 rounded-tr-none' 
                      : 'bg-white/5 border border-borderGlass text-gray-300 rounded-tl-none font-normal'
                  }`}>
                    <pre className="whitespace-pre-wrap font-sans text-[11px]">
                      {msg.text}
                    </pre>
                  </div>
                </div>
              );
            })}

            {/* Loading Indicator */}
            {loading && (
              <div className="flex gap-2.5 max-w-[80%] mr-auto">
                <div className="w-7 h-7 rounded-full bg-white/5 border border-borderGlass flex items-center justify-center text-brandCyan">
                  <Cpu className="w-3.5 h-3.5 animate-bounce" />
                </div>
                <div className="p-3 rounded-2xl bg-white/5 border border-borderGlass rounded-tl-none flex items-center gap-1.5 py-2">
                  <span className="w-1 h-1 bg-brandCyan rounded-full animate-bounce delay-100"></span>
                  <span className="w-1 h-1 bg-brandCyan rounded-full animate-bounce delay-200"></span>
                  <span className="w-1 h-1 bg-brandCyan rounded-full animate-bounce delay-300"></span>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Quick Prompts Panel */}
          {!loading && chatHistory.length < 3 && (
            <div className="px-4 pb-1.5 flex flex-wrap gap-1.5">
              {quickPrompts.map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => handleQuickPrompt(p.text)}
                  disabled={loading || resumes.length === 0}
                  className="px-2 py-1 rounded-lg bg-white/5 border border-borderGlass text-[9px] font-semibold text-gray-400 hover:text-white hover:border-brandPurple hover:bg-brandPurple/5 transition duration-200 flex items-center gap-1 disabled:opacity-50"
                >
                  <Sparkles className="w-2.5 h-2.5 text-brandPurple" />
                  {p.label}
                </button>
              ))}
            </div>
          )}

          {/* Text Console Input Form */}
          <form 
            onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }}
            className="p-3 border-t border-slate-900 bg-slate-950/20 flex items-center gap-2"
          >
            <input
              type="text"
              disabled={loading || resumes.length === 0}
              placeholder="Ask a quick career question..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="flex-1 px-3 py-2 rounded-xl bg-white/5 border border-borderGlass text-[11px] text-gray-200 outline-none focus:border-brandBlue transition"
            />
            <button
              type="submit"
              disabled={loading || !message.trim()}
              className="p-2 rounded-xl bg-brandBlue hover:bg-brandBlue/90 text-white font-bold transition flex items-center justify-center flex-shrink-0 disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>

        </div>
      )}

    </div>
  );
};

export default FloatingChatWidget;
