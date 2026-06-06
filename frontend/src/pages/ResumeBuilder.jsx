import React, { useState, useEffect } from 'react';
import { 
  FileEdit, 
  Save, 
  Download, 
  Plus, 
  Trash2, 
  ArrowLeft,
  ChevronDown,
  Sparkles,
  Info,
  CheckCircle2
} from 'lucide-react';
import { resumeAPI, analysisAPI } from '../utils/api';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import GlassCard from '../components/GlassCard';
import ResumePreview from '../components/ResumePreview';

const ResumeBuilder = () => {
  const [loading, setLoading] = useState(true);
  const [resumeId, setResumeId] = useState(null);
  const [resumeData, setResumeData] = useState(null);
  
  const [saveStatus, setSaveStatus] = useState('');
  const [activeTab, setActiveTab] = useState('personal'); // personal, skills, experience, education, projects

  useEffect(() => {
    const fetchResume = async () => {
      try {
        const resumesRes = await resumeAPI.getAll();
        const latest = resumesRes.data.data[0];
        
        if (latest) {
          setResumeId(latest._id);
          setResumeData(latest);
        } else {
          // Fallback - should never happen due to signup seeding, but handled
          const emptyTemplate = {
            personalInfo: { name: '', email: '', phone: '', website: '', location: '', summary: '' },
            skills: [],
            experience: [],
            education: [],
            projects: []
          };
          const created = await resumeAPI.create(emptyTemplate);
          setResumeId(created.data.data._id);
          setResumeData(created.data.data);
        }
      } catch (err) {
        console.error('Error fetching builder details:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchResume();
  }, []);

  const handlePersonalChange = (e) => {
    setResumeData({
      ...resumeData,
      personalInfo: {
        ...resumeData.personalInfo,
        [e.target.name]: e.target.value
      }
    });
  };

  // Skill Handlers
  const [skillInput, setSkillInput] = useState('');
  const handleAddSkill = () => {
    if (!skillInput.trim()) return;
    if (resumeData.skills.includes(skillInput.trim())) return;
    setResumeData({
      ...resumeData,
      skills: [...resumeData.skills, skillInput.trim()]
    });
    setSkillInput('');
  };
  const handleDeleteSkill = (index) => {
    setResumeData({
      ...resumeData,
      skills: resumeData.skills.filter((_, idx) => idx !== index)
    });
  };

  // Experience Handlers
  const handleExperienceChange = (index, field, value) => {
    const updated = [...resumeData.experience];
    updated[index][field] = value;
    setResumeData({ ...resumeData, experience: updated });
  };
  const handleAddExperience = () => {
    setResumeData({
      ...resumeData,
      experience: [
        ...resumeData.experience,
        { company: '', position: '', startDate: '', endDate: '', current: false, description: '', location: '' }
      ]
    });
  };
  const handleDeleteExperience = (index) => {
    setResumeData({
      ...resumeData,
      experience: resumeData.experience.filter((_, idx) => idx !== index)
    });
  };

  // Education Handlers
  const handleEducationChange = (index, field, value) => {
    const updated = [...resumeData.education];
    updated[index][field] = value;
    setResumeData({ ...resumeData, education: updated });
  };
  const handleAddEducation = () => {
    setResumeData({
      ...resumeData,
      education: [
        ...resumeData.education,
        { school: '', degree: '', fieldOfStudy: '', startDate: '', endDate: '', gpa: '', location: '' }
      ]
    });
  };
  const handleDeleteEducation = (index) => {
    setResumeData({
      ...resumeData,
      education: resumeData.education.filter((_, idx) => idx !== index)
    });
  };

  // Projects Handlers
  const handleProjectChange = (index, field, value) => {
    const updated = [...resumeData.projects];
    if (field === 'technologies') {
      updated[index][field] = value.split(',').map(t => t.trim());
    } else {
      updated[index][field] = value;
    }
    setResumeData({ ...resumeData, projects: updated });
  };
  const handleAddProject = () => {
    setResumeData({
      ...resumeData,
      projects: [
        ...resumeData.projects,
        { title: '', description: '', technologies: [], link: '' }
      ]
    });
  };
  const handleDeleteProject = (index) => {
    setResumeData({
      ...resumeData,
      projects: resumeData.projects.filter((_, idx) => idx !== index)
    });
  };

  // Save changes & run backend ATS analysis
  const handleSaveAndSync = async () => {
    setSaveStatus('Saving database changes...');
    try {
      // 1. PUT details back to resume schema
      await resumeAPI.update(resumeId, resumeData);

      setSaveStatus('Re-analyzing ATS compliance metrics...');
      
      // 2. Trigger back-end AI analyze score update
      await analysisAPI.analyze(resumeId);

      setSaveStatus('Saved & Audited Successfully!');
      setTimeout(() => setSaveStatus(''), 2000);
    } catch (err) {
      console.error(err);
      setSaveStatus('Failed to sync changes.');
    }
  };

  // High-fidelity standard single-column A4 text-selectable PDF printable exporter
  const handleExportPDF = () => {
    const previewEl = document.getElementById('resume-print-content');
    if (!previewEl) return;

    // Create a new sandbox print window to prevent main React page reloads
    const printWindow = window.open('', '_blank', 'width=800,height=900');
    
    printWindow.document.write('<html><head><title>ATS-Optimized-Resume</title>');
    printWindow.document.write('<style>');
    printWindow.document.write(`
      @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
      body {
        font-family: 'Inter', Arial, sans-serif;
        background: white;
        color: black;
        margin: 0;
        padding: 40px;
        box-sizing: border-box;
        line-height: 1.5;
        font-size: 12.5px;
      }
      .text-center { text-align: center; }
      .text-justify { text-align: justify; }
      .mb-5 { margin-bottom: 20px; }
      .mb-2 { margin-bottom: 8px; }
      h1 {
        text-transform: uppercase;
        font-size: 22px;
        font-weight: 700;
        letter-spacing: 1px;
        margin: 0 0 4px 0;
        color: black;
      }
      .contact-row {
        display: flex;
        justify-content: center;
        align-items: center;
        flex-wrap: wrap;
        gap: 6px;
        font-size: 11px;
        color: #4b5563;
      }
      .bullet-dot { color: #9ca3af; margin: 0 4px; }
      .underline { text-decoration: underline; color: #4b5563; }
      .italic { font-style: italic; color: #374151; }
      h2 {
        text-transform: uppercase;
        font-size: 13px;
        font-weight: 700;
        letter-spacing: 0.8px;
        border-bottom: 1.5px solid #374151;
        padding-bottom: 2px;
        margin-top: 20px;
        margin-bottom: 8px;
        color: black;
      }
      .flex-between {
        display: flex;
        justify-content: space-between;
        align-items: baseline;
        font-weight: 700;
        font-size: 12px;
        color: black;
      }
      .normal-font { font-weight: 400; color: #4b5563; }
      .date-text { font-size: 11px; font-weight: 400; color: #374151; }
      .location-text { font-size: 10px; font-style: italic; color: #4b5563; margin-top: -2px; margin-bottom: 4px; }
      ul {
        list-style-type: disc;
        padding-left: 20px;
        margin: 4px 0 0 0;
        font-size: 11.5px;
      }
      li {
        margin-bottom: 3px;
        text-align: justify;
        color: #1f2937;
      }
      p { font-size: 11.5px; color: #1f2937; margin: 4px 0; }
    `);
    printWindow.document.write('</style></head><body>');
    
    // Copy the DOM structures inside our preview element cleanly
    const content = previewEl.innerHTML;
    printWindow.document.write(content);
    
    printWindow.document.write('</body></html>');
    printWindow.document.close();
    printWindow.focus();
    
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 500);
  };

  const tabs = [
    { id: 'personal', name: 'Personal Details' },
    { id: 'skills', name: 'Skills & Tools' },
    { id: 'experience', name: 'Work History' },
    { id: 'projects', name: 'Projects' },
    { id: 'education', name: 'Education' },
  ];

  return (
    <div className="min-h-screen bg-darkBg text-gray-100 flex">
      <Sidebar />

      <main className="flex-1 ml-64 min-h-screen p-8 pt-28 space-y-8 overflow-y-auto">
        <Navbar title="Interactive Resume Builder" />

        {loading ? (
          <div className="h-[60vh] flex flex-col items-center justify-center gap-3">
            <div className="w-12 h-12 rounded-full border-4 border-brandBlue/30 border-t-brandBlue animate-spin"></div>
            <span className="text-sm text-gray-400">Loading interactive schema...</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 items-start">
            
            {/* LEFT INPUT FORMS PANEL */}
            <div className="space-y-6">
              <GlassCard className="p-4 flex gap-2 flex-wrap border border-borderGlass">
                {tabs.map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-4 py-2 rounded-xl text-xs font-semibold transition ${
                      activeTab === tab.id 
                        ? 'bg-gradient-to-r from-brandBlue to-brandPurple text-white shadow-neonBlue/20' 
                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    {tab.name}
                  </button>
                ))}
              </GlassCard>

              {/* SAVE / EXPORT PANEL BAR */}
              <GlassCard className="p-4 flex items-center justify-between border border-borderGlass">
                <span className="text-xs text-brandCyan font-semibold flex items-center gap-1.5">
                  {saveStatus ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 animate-pulse" />
                      {saveStatus}
                    </>
                  ) : (
                    <>
                      <Info className="w-4 h-4" /> Live changes reflected on preview
                    </>
                  )}
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={handleSaveAndSync}
                    className="px-4 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold flex items-center gap-1.5 hover:bg-emerald-500/20 transition"
                  >
                    <Save className="w-3.5 h-3.5" /> Save & Sync
                  </button>
                  <button
                    onClick={handleExportPDF}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-brandBlue to-brandPurple text-white text-xs font-bold flex items-center gap-1.5 hover:shadow-neonBlue transition"
                  >
                    <Download className="w-3.5 h-3.5" /> Download PDF
                  </button>
                </div>
              </GlassCard>

              {/* DYNAMIC FORMS ACCORDIONS */}
              <GlassCard className="p-6 border border-borderGlass space-y-6">
                
                {/* 1. PERSONAL TAB */}
                {activeTab === 'personal' && (
                  <div className="space-y-4">
                    <h3 className="text-sm font-bold text-white mb-2">Personal Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-[10px] font-semibold text-gray-500 uppercase">Full Name</label>
                        <input
                          type="text"
                          name="name"
                          value={resumeData.personalInfo?.name || ''}
                          onChange={handlePersonalChange}
                          className="w-full px-3 py-2.5 glass-input text-xs mt-1"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-semibold text-gray-500 uppercase">Email Address</label>
                        <input
                          type="email"
                          name="email"
                          value={resumeData.personalInfo?.email || ''}
                          onChange={handlePersonalChange}
                          className="w-full px-3 py-2.5 glass-input text-xs mt-1"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-semibold text-gray-500 uppercase">Phone Number</label>
                        <input
                          type="text"
                          name="phone"
                          value={resumeData.personalInfo?.phone || ''}
                          onChange={handlePersonalChange}
                          className="w-full px-3 py-2.5 glass-input text-xs mt-1"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-semibold text-gray-500 uppercase">Website / Portfolio</label>
                        <input
                          type="text"
                          name="website"
                          value={resumeData.personalInfo?.website || ''}
                          onChange={handlePersonalChange}
                          className="w-full px-3 py-2.5 glass-input text-xs mt-1"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="text-[10px] font-semibold text-gray-500 uppercase">Location (City, State)</label>
                        <input
                          type="text"
                          name="location"
                          value={resumeData.personalInfo?.location || ''}
                          onChange={handlePersonalChange}
                          className="w-full px-3 py-2.5 glass-input text-xs mt-1"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="text-[10px] font-semibold text-gray-500 uppercase">Executive Summary</label>
                        <textarea
                          rows={4}
                          name="summary"
                          value={resumeData.personalInfo?.summary || ''}
                          onChange={handlePersonalChange}
                          className="w-full px-3 py-2.5 glass-input text-xs mt-1 resize-none"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* 2. SKILLS TAB */}
                {activeTab === 'skills' && (
                  <div className="space-y-4">
                    <h3 className="text-sm font-bold text-white mb-2">Technical Skills & Core Competencies</h3>
                    
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Add skill (e.g. React, Docker, Kubernetes)"
                        value={skillInput}
                        onChange={(e) => setSkillInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleAddSkill()}
                        className="flex-1 px-3 py-2 glass-input text-xs"
                      />
                      <button
                        onClick={handleAddSkill}
                        className="px-4 py-2 rounded-xl bg-brandBlue text-white text-xs font-bold hover:shadow-neonBlue transition"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="flex flex-wrap gap-2 pt-2">
                      {resumeData.skills?.map((skill, index) => (
                        <div
                          key={index}
                          className="px-3 py-1.5 rounded-xl bg-white/5 border border-borderGlass text-xs text-gray-200 flex items-center gap-2 group hover:border-red-500/30 transition"
                        >
                          {skill}
                          <button
                            onClick={() => handleDeleteSkill(index)}
                            className="text-gray-500 hover:text-red-400 transition"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 3. EXPERIENCE TAB */}
                {activeTab === 'experience' && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-bold text-white">Work History</h3>
                      <button
                        onClick={handleAddExperience}
                        className="px-3 py-1.5 rounded-xl bg-brandPurple/10 border border-brandPurple/20 text-brandPurple text-xs font-semibold flex items-center gap-1 hover:bg-brandPurple/20 transition"
                      >
                        <Plus className="w-3.5 h-3.5" /> Add Experience
                      </button>
                    </div>

                    <div className="space-y-6">
                      {resumeData.experience?.map((exp, idx) => (
                        <div key={idx} className="p-4 rounded-2xl bg-white/5 border border-borderGlass relative space-y-4">
                          <button
                            onClick={() => handleDeleteExperience(idx)}
                            className="absolute top-4 right-4 text-gray-500 hover:text-red-400 transition"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                          
                          <h4 className="text-xs font-bold text-brandCyan">Role #{idx + 1}</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="text-[9px] font-semibold text-gray-500 uppercase">Company Name</label>
                              <input
                                type="text"
                                value={exp.company}
                                onChange={(e) => handleExperienceChange(idx, 'company', e.target.value)}
                                className="w-full px-3 py-2 glass-input text-xs mt-1"
                              />
                            </div>
                            <div>
                              <label className="text-[9px] font-semibold text-gray-500 uppercase">Job Title</label>
                              <input
                                type="text"
                                value={exp.position}
                                className="w-full px-3 py-2 glass-input text-xs mt-1"
                                onChange={(e) => handleExperienceChange(idx, 'position', e.target.value)}
                              />
                            </div>
                            <div>
                              <label className="text-[9px] font-semibold text-gray-500 uppercase">Start Date</label>
                              <input
                                type="text"
                                placeholder="Month Year"
                                value={exp.startDate}
                                className="w-full px-3 py-2 glass-input text-xs mt-1"
                                onChange={(e) => handleExperienceChange(idx, 'startDate', e.target.value)}
                              />
                            </div>
                            <div>
                              <label className="text-[9px] font-semibold text-gray-500 uppercase">End Date</label>
                              <input
                                type="text"
                                placeholder="Month Year or Present"
                                value={exp.endDate}
                                disabled={exp.current}
                                className="w-full px-3 py-2 glass-input text-xs mt-1"
                                onChange={(e) => handleExperienceChange(idx, 'endDate', e.target.value)}
                              />
                            </div>
                            <div className="md:col-span-2 flex items-center gap-2">
                              <input
                                type="checkbox"
                                id={`exp-curr-${idx}`}
                                checked={exp.current}
                                onChange={(e) => handleExperienceChange(idx, 'current', e.target.checked)}
                                className="rounded border-gray-700 bg-white/5 text-brandBlue focus:ring-0"
                              />
                              <label htmlFor={`exp-curr-${idx}`} className="text-xs text-gray-400">Currently work here</label>
                            </div>
                            <div className="md:col-span-2">
                              <label className="text-[9px] font-semibold text-gray-500 uppercase">Role Description & Achievements</label>
                              <textarea
                                rows={4}
                                placeholder="Describe your achievements here. Start bullets with strong action verbs. Use newline to separate each bullet point."
                                value={exp.description}
                                className="w-full px-3 py-2 glass-input text-xs mt-1 resize-none"
                                onChange={(e) => handleExperienceChange(idx, 'description', e.target.value)}
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 4. PROJECTS TAB */}
                {activeTab === 'projects' && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-bold text-white">Technical Projects</h3>
                      <button
                        onClick={handleAddProject}
                        className="px-3 py-1.5 rounded-xl bg-brandPurple/10 border border-brandPurple/20 text-brandPurple text-xs font-semibold flex items-center gap-1 hover:bg-brandPurple/20 transition"
                      >
                        <Plus className="w-3.5 h-3.5" /> Add Project
                      </button>
                    </div>

                    <div className="space-y-6">
                      {resumeData.projects?.map((proj, idx) => (
                        <div key={idx} className="p-4 rounded-2xl bg-white/5 border border-borderGlass relative space-y-4">
                          <button
                            onClick={() => handleDeleteProject(idx)}
                            className="absolute top-4 right-4 text-gray-500 hover:text-red-400 transition"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>

                          <h4 className="text-xs font-bold text-brandCyan">Project #{idx + 1}</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="text-[9px] font-semibold text-gray-500 uppercase">Project Title</label>
                              <input
                                type="text"
                                value={proj.title}
                                className="w-full px-3 py-2 glass-input text-xs mt-1"
                                onChange={(e) => handleProjectChange(idx, 'title', e.target.value)}
                              />
                            </div>
                            <div>
                              <label className="text-[9px] font-semibold text-gray-500 uppercase">Link URL</label>
                              <input
                                type="text"
                                placeholder="github.com/username/project"
                                value={proj.link}
                                className="w-full px-3 py-2 glass-input text-xs mt-1"
                                onChange={(e) => handleProjectChange(idx, 'link', e.target.value)}
                              />
                            </div>
                            <div className="md:col-span-2">
                              <label className="text-[9px] font-semibold text-gray-500 uppercase">Technologies Utilized (Comma Separated)</label>
                              <input
                                type="text"
                                placeholder="React, Node.js, Express, MongoDB"
                                value={proj.technologies?.join(', ')}
                                className="w-full px-3 py-2 glass-input text-xs mt-1"
                                onChange={(e) => handleProjectChange(idx, 'technologies', e.target.value)}
                              />
                            </div>
                            <div className="md:col-span-2">
                              <label className="text-[9px] font-semibold text-gray-500 uppercase">Project Description</label>
                              <textarea
                                rows={3}
                                value={proj.description}
                                className="w-full px-3 py-2 glass-input text-xs mt-1 resize-none"
                                onChange={(e) => handleProjectChange(idx, 'description', e.target.value)}
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 5. EDUCATION TAB */}
                {activeTab === 'education' && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-bold text-white">Education Details</h3>
                      <button
                        onClick={handleAddEducation}
                        className="px-3 py-1.5 rounded-xl bg-brandPurple/10 border border-brandPurple/20 text-brandPurple text-xs font-semibold flex items-center gap-1 hover:bg-brandPurple/20 transition"
                      >
                        <Plus className="w-3.5 h-3.5" /> Add Education
                      </button>
                    </div>

                    <div className="space-y-6">
                      {resumeData.education?.map((edu, idx) => (
                        <div key={idx} className="p-4 rounded-2xl bg-white/5 border border-borderGlass relative space-y-4">
                          <button
                            onClick={() => handleDeleteEducation(idx)}
                            className="absolute top-4 right-4 text-gray-500 hover:text-red-400 transition"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>

                          <h4 className="text-xs font-bold text-brandCyan">Education #{idx + 1}</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="text-[9px] font-semibold text-gray-500 uppercase">University / School</label>
                              <input
                                type="text"
                                value={edu.school}
                                className="w-full px-3 py-2 glass-input text-xs mt-1"
                                onChange={(e) => handleEducationChange(idx, 'school', e.target.value)}
                              />
                            </div>
                            <div>
                              <label className="text-[9px] font-semibold text-gray-500 uppercase">Degree (e.g. BS, MS)</label>
                              <input
                                type="text"
                                value={edu.degree}
                                className="w-full px-3 py-2 glass-input text-xs mt-1"
                                onChange={(e) => handleEducationChange(idx, 'degree', e.target.value)}
                              />
                            </div>
                            <div>
                              <label className="text-[9px] font-semibold text-gray-500 uppercase">Field of Study (Major)</label>
                              <input
                                type="text"
                                value={edu.fieldOfStudy}
                                className="w-full px-3 py-2 glass-input text-xs mt-1"
                                onChange={(e) => handleEducationChange(idx, 'fieldOfStudy', e.target.value)}
                              />
                            </div>
                            <div>
                              <label className="text-[9px] font-semibold text-gray-500 uppercase">GPA / Scores</label>
                              <input
                                type="text"
                                placeholder="3.7/4.0"
                                value={edu.gpa}
                                className="w-full px-3 py-2 glass-input text-xs mt-1"
                                onChange={(e) => handleEducationChange(idx, 'gpa', e.target.value)}
                              />
                            </div>
                            <div>
                              <label className="text-[9px] font-semibold text-gray-500 uppercase">Start Year</label>
                              <input
                                type="text"
                                placeholder="2020"
                                value={edu.startDate}
                                className="w-full px-3 py-2 glass-input text-xs mt-1"
                                onChange={(e) => handleEducationChange(idx, 'startDate', e.target.value)}
                              />
                            </div>
                            <div>
                              <label className="text-[9px] font-semibold text-gray-500 uppercase">End Year</label>
                              <input
                                type="text"
                                placeholder="2024"
                                value={edu.endDate}
                                className="w-full px-3 py-2 glass-input text-xs mt-1"
                                onChange={(e) => handleEducationChange(idx, 'endDate', e.target.value)}
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              </GlassCard>
            </div>

            {/* RIGHT REAL-TIME PREVIEW PANEL */}
            <div className="sticky top-28 space-y-4">
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block ml-2">Text-Selectable A4 Paper Preview</span>
              <div className="rounded-2xl overflow-hidden border border-gray-700 bg-white shadow-2xl scale-[0.98] origin-top max-h-[78vh] overflow-y-auto">
                <ResumePreview resumeData={resumeData} />
              </div>
            </div>

          </div>
        )}
      </main>
    </div>
  );
};

export default ResumeBuilder;
