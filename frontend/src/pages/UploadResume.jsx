import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UploadCloud, FileText, CheckCircle, AlertCircle, Loader } from 'lucide-react';
import { resumeAPI, analysisAPI } from '../utils/api';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import GlassCard from '../components/GlassCard';

const UploadResume = () => {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragging(true);
  };

  const handleDragLeave = () => {
    setDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    validateAndSetFile(droppedFile);
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    validateAndSetFile(selectedFile);
  };

  const validateAndSetFile = (file) => {
    setError('');
    if (!file) return;

    const validTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/msword'
    ];

    if (validTypes.includes(file.type)) {
      setFile(file);
    } else {
      setError('Invalid file format. Please upload only PDF or DOCX files.');
      setFile(null);
    }
  };

  const handleUploadSubmit = async () => {
    if (!file) return;
    setLoading(true);
    setError('');
    setStatus('Extracting document text buffers...');

    try {
      const formData = new FormData();
      formData.append('resume', file);

      // 1. Upload & Parse Raw Text
      const uploadRes = await resumeAPI.upload(formData);
      
      if (uploadRes.data.success) {
        const resumeId = uploadRes.data.data._id;
        
        setStatus('Executing advanced Gemini ATS audits...');
        
        // 2. Perform Immediate ATS scoring & keyword analysis
        const analysisRes = await analysisAPI.analyze(resumeId);
        
        if (analysisRes.data.success) {
          setStatus('Audit completed successfully. Navigating to reports...');
          setTimeout(() => {
            navigate('/analysis');
          }, 1000);
        }
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Error processing resume file. Make sure file contains selectable text.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-darkBg text-gray-100 flex">
      <Sidebar />

      <main className="flex-1 ml-64 min-h-screen p-8 pt-28 space-y-8 overflow-y-auto">
        <Navbar title="Resume Processing Portal" />

        <div className="max-w-3xl mx-auto space-y-6">
          <GlassCard className="p-8 border border-borderGlass space-y-6 text-center">
            <div>
              <h3 className="text-xl font-bold text-white">Upload Your Current Resume</h3>
              <p className="text-xs text-gray-500 mt-1">We support standard text-selectable PDF and Word (DOCX) files up to 10MB.</p>
            </div>

            {/* Drop Zone Area */}
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-2xl p-12 transition-all flex flex-col items-center justify-center gap-4 cursor-pointer min-h-[250px] relative ${
                dragging 
                  ? 'border-brandBlue bg-brandBlue/5 scale-[0.99] shadow-neonBlue/10' 
                  : file 
                    ? 'border-emerald-500/50 bg-emerald-500/5' 
                    : 'border-gray-700 hover:border-gray-600 hover:bg-white/5'
              }`}
            >
              <input
                type="file"
                id="file-upload-input"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                onChange={handleFileChange}
                disabled={loading}
              />
              
              {loading ? (
                <div className="flex flex-col items-center gap-3">
                  <Loader className="w-12 h-12 text-brandPurple animate-spin" />
                  <p className="text-sm font-semibold text-white mt-2">{status}</p>
                </div>
              ) : file ? (
                <div className="flex flex-col items-center gap-3">
                  <FileText className="w-16 h-16 text-emerald-400" />
                  <div className="text-center">
                    <span className="text-sm font-bold text-white block">{file.name}</span>
                    <span className="text-xs text-gray-500">{(file.size / (1024 * 1024)).toFixed(2)} MB</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-medium">
                    <CheckCircle className="w-4 h-4" /> Ready for AI processing
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-3">
                  <UploadCloud className="w-16 h-16 text-gray-500 animate-bounce" />
                  <div className="text-center">
                    <p className="text-sm font-bold text-white">Drag & drop your file here</p>
                    <p className="text-xs text-gray-500 mt-1">or click to browse local files</p>
                  </div>
                </div>
              )}
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center justify-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {error}
              </div>
            )}

            {file && !loading && (
              <div className="flex justify-end gap-3 pt-4 border-t border-borderGlass">
                <button
                  onClick={() => setFile(null)}
                  className="px-4 py-2 rounded-xl border border-gray-700 hover:bg-white/5 text-xs text-gray-400 transition"
                >
                  Clear File
                </button>
                <button
                  onClick={handleUploadSubmit}
                  className="px-6 py-2 rounded-xl bg-gradient-to-r from-brandBlue to-brandPurple text-white text-xs font-bold hover:shadow-neonBlue transition duration-300"
                >
                  Start Auditing Profile
                </button>
              </div>
            )}
          </GlassCard>

          {/* Quick Informative Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <GlassCard className="p-5 flex gap-4">
              <div className="w-8 h-8 rounded-lg bg-brandBlue/10 border border-brandBlue/20 text-brandBlue flex items-center justify-center font-bold text-sm">1</div>
              <div className="space-y-1">
                <h4 className="text-xs font-bold text-white">Raw Text Extraction</h4>
                <p className="text-[11px] text-gray-500">Fast parsing models read all string contents securely.</p>
              </div>
            </GlassCard>

            <GlassCard className="p-5 flex gap-4">
              <div className="w-8 h-8 rounded-lg bg-brandPurple/10 border border-brandPurple/20 text-brandPurple flex items-center justify-center font-bold text-sm">2</div>
              <div className="space-y-1">
                <h4 className="text-xs font-bold text-white">Gemini Structuring</h4>
                <p className="text-[11px] text-gray-500">Advanced JSON schema extraction builds structured data representations.</p>
              </div>
            </GlassCard>

            <GlassCard className="p-5 flex gap-4">
              <div className="w-8 h-8 rounded-lg bg-brandCyan/10 border border-brandCyan/20 text-brandCyan flex items-center justify-center font-bold text-sm">3</div>
              <div className="space-y-1">
                <h4 className="text-xs font-bold text-white">Actionable Roadmap</h4>
                <p className="text-[11px] text-gray-500">Provides comprehensive feedback on lacking skills, strengths, and recommendations.</p>
              </div>
            </GlassCard>
          </div>
        </div>
      </main>
    </div>
  );
};

export default UploadResume;
