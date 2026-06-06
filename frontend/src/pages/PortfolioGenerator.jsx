import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import { 
  Globe, 
  Download, 
  Sparkles, 
  Palette, 
  ExternalLink, 
  Mail, 
  Phone, 
  MapPin, 
  Code,
  Calendar,
  Layers,
  GraduationCap
} from 'lucide-react';
import axios from 'axios';

const PortfolioGenerator = () => {
  const [resume, setResume] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTheme, setSelectedTheme] = useState('blue'); // 'blue', 'green', 'purple', 'red'

  // Colors mapping for live in-app preview styling
  const themes = {
    blue: {
      gradient: 'from-blue-600 to-cyan-500',
      text: 'text-cyan-400',
      bgGlow: 'shadow-blue-500/10 border-blue-500/20',
      badge: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20'
    },
    green: {
      gradient: 'from-emerald-600 to-teal-500',
      text: 'text-teal-400',
      bgGlow: 'shadow-emerald-500/10 border-emerald-500/20',
      badge: 'bg-teal-500/10 text-teal-400 border-teal-500/20'
    },
    purple: {
      gradient: 'from-purple-600 to-pink-500',
      text: 'text-pink-400',
      bgGlow: 'shadow-purple-500/10 border-purple-500/20',
      badge: 'bg-pink-500/10 text-pink-400 border-pink-500/20'
    },
    red: {
      gradient: 'from-rose-600 to-orange-500',
      text: 'text-rose-400',
      bgGlow: 'shadow-rose-500/10 border-rose-500/20',
      badge: 'bg-rose-500/10 text-rose-400 border-rose-500/20'
    }
  };

  useEffect(() => {
    const fetchResume = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        const response = await axios.get('http://localhost:5000/api/resume', { headers });
        const resumes = response.data.data;
        if (resumes && resumes.length > 0) {
          setResume(resumes[0]);
        }
      } catch (err) {
        console.error('Fetch Resume Error:', err);
        setError('Could not connect to resume database.');
      } finally {
        setLoading(false);
      }
    };

    fetchResume();
  }, []);

  const activeTheme = themes[selectedTheme];

  const handleDownload = () => {
    if (!resume) return;

    // String compilation of the entire HTML portfolio bundle
    const name = resume.personalInfo?.name || 'Job Seeker';
    const email = resume.personalInfo?.email || '';
    const phone = resume.personalInfo?.phone || '';
    const location = resume.personalInfo?.location || '';
    const website = resume.personalInfo?.website || '';
    const summary = resume.personalInfo?.summary || '';
    
    const skillsHtml = (resume.skills || []).map(skill => `
      <span class="px-3 py-1.5 bg-slate-900 border border-slate-800 text-slate-300 rounded-lg text-xs font-semibold hover:border-cyan-500 hover:text-cyan-400 transition-all cursor-default">
        ${skill}
      </span>
    `).join('');

    const experienceHtml = (resume.experience || []).map(exp => `
      <div class="relative pl-8 border-l-2 border-slate-800 group hover:border-cyan-500 transition-all">
        <div class="absolute -left-1.5 top-1.5 w-3 h-3 rounded-full bg-slate-900 border-2 border-slate-800 group-hover:bg-cyan-500 group-hover:border-cyan-500 transition-all"></div>
        <div class="flex flex-wrap items-center justify-between gap-2">
          <h4 class="font-bold text-sm text-white">${exp.position}</h4>
          <span class="text-[10px] text-cyan-400 font-semibold px-2 py-0.5 rounded bg-cyan-950/20 border border-cyan-500/20">
            ${exp.startDate} - ${exp.endDate}
          </span>
        </div>
        <p class="text-xs text-slate-400 font-medium mt-0.5">${exp.company} &bull; ${exp.location || 'Remote'}</p>
        <p class="text-xs text-slate-400 leading-relaxed mt-2 pl-2 border-l border-slate-800">${exp.description}</p>
      </div>
    `).join('<div class="h-6"></div>');

    const educationHtml = (resume.education || []).map(edu => `
      <div class="relative pl-8 border-l-2 border-slate-800 group hover:border-cyan-500 transition-all">
        <div class="absolute -left-1.5 top-1.5 w-3 h-3 rounded-full bg-slate-900 border-2 border-slate-800 group-hover:bg-cyan-500 group-hover:border-cyan-500 transition-all"></div>
        <div class="flex flex-wrap items-center justify-between gap-2">
          <h4 class="font-bold text-sm text-white">${edu.degree} in ${edu.fieldOfStudy}</h4>
          <span class="text-[10px] text-cyan-400 font-semibold px-2 py-0.5 rounded bg-cyan-950/20 border border-cyan-500/20">
            ${edu.startDate} - ${edu.endDate}
          </span>
        </div>
        <p class="text-xs text-slate-400 font-medium mt-0.5">${edu.school} &bull; ${edu.location || ''}</p>
        ${edu.gpa ? `<span class="text-[10px] text-slate-500 font-medium block mt-1">GPA: ${edu.gpa}</span>` : ''}
      </div>
    `).join('<div class="h-6"></div>');

    const projectsHtml = (resume.projects || []).map(proj => `
      <div class="bg-slate-950 border border-slate-900 hover:border-slate-800/80 rounded-xl p-5 shadow-lg flex flex-col justify-between hover:shadow-cyan-500/5 transition-all">
        <div>
          <h4 class="font-bold text-sm text-white">${proj.title}</h4>
          <p class="text-xs text-slate-400 mt-2 leading-relaxed">${proj.description}</p>
        </div>
        <div class="mt-4 pt-3 border-t border-slate-900 flex items-center justify-between">
          <div class="flex flex-wrap gap-1">
            ${(proj.technologies || []).slice(0, 3).map(tech => `
              <span class="text-[9px] font-semibold text-slate-500 bg-slate-900 border border-slate-800 px-1.5 py-0.5 rounded">
                ${tech}
              </span>
            `).join('')}
          </div>
          ${proj.link ? `
            <a href="https://${proj.link.replace(/^(https?:\/\/)?(www\.)?/, '')}" target="_blank" class="text-[10px] font-semibold text-cyan-400 hover:text-white flex items-center gap-0.5 transition-colors">
              Link <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-external-link"><path d="M15 3h6v6"/><path d="M10 14 21 3"/><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/></svg>
            </a>
          ` : ''}
        </div>
      </div>
    `).join('');

    const htmlBundle = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${name} - Personal Portfolio</title>
  <!-- Google Fonts: Outfit -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
  <!-- Tailwind CSS CDN -->
  <script src="https://cdn.tailwindcss.com"></script>
  <script>
    tailwind.config = {
      theme: {
        extend: {
          fontFamily: {
            sans: ['Outfit', 'sans-serif'],
          }
        }
      }
    }
  </script>
  <style>
    body {
      background-color: #020617;
      color: #cbd5e1;
    }
    /* Glow custom animations */
    .glow-card:hover {
      box-shadow: 0 10px 30px -10px rgba(6, 182, 212, 0.15);
      border-color: rgba(6, 182, 212, 0.4);
    }
  </style>
</head>
<body class="font-sans min-h-screen relative overflow-x-hidden">
  
  <!-- Glowing Atmospheric Background Elements -->
  <div class="absolute w-[500px] h-[500px] rounded-full bg-cyan-500/10 blur-[120px] top-[-100px] left-[-100px] pointer-events-none z-0"></div>
  <div class="absolute w-[500px] h-[500px] rounded-full bg-blue-600/5 blur-[120px] bottom-[100px] right-[-100px] pointer-events-none z-0"></div>

  <div class="max-w-4xl mx-auto px-6 py-12 relative z-10">
    
    <!-- Hero / Profile Header -->
    <header class="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-12 border-b border-slate-900">
      <div>
        <h1 class="text-4xl md:text-5xl font-black bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent leading-none">${name}</h1>
        <p class="text-sm font-semibold text-cyan-400 uppercase tracking-widest mt-2">${resume.experience?.[0]?.position || 'Software Developer'}</p>
        
        <div class="flex flex-wrap items-center gap-4 text-xs text-slate-400 mt-4">
          ${email ? `<div class="flex items-center gap-1"><span class="text-slate-500">Email:</span> ${email}</div>` : ''}
          ${phone ? `<div class="flex items-center gap-1"><span class="text-slate-500">Phone:</span> ${phone}</div>` : ''}
          ${location ? `<div class="flex items-center gap-1"><span class="text-slate-500">Location:</span> ${location}</div>` : ''}
          ${website ? `<div class="flex items-center gap-1"><span class="text-slate-500">URL:</span> <a href="https://${website.replace(/^(https?:\/\/)?(www\.)?/, '')}" target="_blank" class="hover:text-cyan-400 transition-colors">${website}</a></div>` : ''}
        </div>
      </div>
      
      <div class="w-16 h-16 rounded-2xl bg-gradient-to-tr from-cyan-600 to-blue-500 flex items-center justify-center font-black text-2xl text-white shadow-xl shadow-cyan-500/20">
        ${name.charAt(0).toUpperCase()}
      </div>
    </header>

    <!-- Professional Summary -->
    ${summary ? `
      <section class="py-10 border-b border-slate-900">
        <h3 class="text-xs font-black text-white uppercase tracking-widest mb-4 flex items-center gap-2">
          <span class="w-1.5 h-4 bg-cyan-500 rounded-sm"></span> About Me
        </h3>
        <p class="text-xs md:text-sm text-slate-400 leading-relaxed font-normal">${summary}</p>
      </section>
    ` : ''}

    <!-- Core Skills nodes -->
    <section class="py-10 border-b border-slate-900">
      <h3 class="text-xs font-black text-white uppercase tracking-widest mb-6 flex items-center gap-2">
        <span class="w-1.5 h-4 bg-cyan-500 rounded-sm"></span> Core Competencies
      </h3>
      <div class="flex flex-wrap gap-2.5">
        ${skillsHtml}
      </div>
    </section>

    <!-- Professional Timeline Experience -->
    ${experienceHtml ? `
      <section class="py-10 border-b border-slate-900">
        <h3 class="text-xs font-black text-white uppercase tracking-widest mb-8 flex items-center gap-2">
          <span class="w-1.5 h-4 bg-cyan-500 rounded-sm"></span> Professional Experience
        </h3>
        <div class="space-y-8">
          ${experienceHtml}
        </div>
      </section>
    ` : ''}

    <!-- Academic Education Timeline -->
    ${educationHtml ? `
      <section class="py-10 border-b border-slate-900">
        <h3 class="text-xs font-black text-white uppercase tracking-widest mb-8 flex items-center gap-2">
          <span class="w-1.5 h-4 bg-cyan-500 rounded-sm"></span> Education & Certifications
        </h3>
        <div class="space-y-8">
          ${educationHtml}
        </div>
      </section>
    ` : ''}

    <!-- Featured Projects Grid -->
    ${projectsHtml ? `
      <section class="py-10">
        <h3 class="text-xs font-black text-white uppercase tracking-widest mb-8 flex items-center gap-2">
          <span class="w-1.5 h-4 bg-cyan-500 rounded-sm"></span> Featured Portfolio Projects
        </h3>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
          ${projectsHtml}
        </div>
      </section>
    ` : ''}

    <!-- Web Footer -->
    <footer class="pt-16 pb-8 text-center border-t border-slate-900 text-[10px] text-slate-500">
      <p>&copy; ${new Date().getFullYear()} ${name}. Handcrafted using Career AI personal website generator.</p>
    </footer>

  </div>
</body>
</html>`;

    // Download dynamic blob triggers
    const blob = new Blob([htmlBundle], { type: 'text/html;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${name.toLowerCase().replace(/\s+/g, '-')}-portfolio.html`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex bg-slate-950 min-h-screen text-slate-100 font-sans">
      <Sidebar />
      
      <main className="flex-1 pl-64 p-8">
        
        {/* Header Title Section */}
        <div className="flex items-center justify-between mb-8 border-b border-borderGlass pb-6">
          <div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brandBlue/20 to-brandPurple/20 border border-brandBlue/30 flex items-center justify-center">
                <Globe className="w-6 h-6 text-brandCyan" />
              </div>
              <h2 className="text-3xl font-extrabold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">One-Click Portfolio</h2>
            </div>
            <p className="text-sm text-gray-400 mt-2">Generate a fully responsive, glowing digital resume landing page website ready to deploy to the web.</p>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center h-96">
            <div className="w-10 h-10 border-4 border-slate-800 border-t-brandCyan rounded-full animate-spin" />
          </div>
        )}

        {/* Empty warning state */}
        {!loading && !resume && (
          <div className="flex flex-col items-center justify-center h-96 border border-dashed border-borderGlass rounded-2xl p-8 text-center max-w-lg mx-auto">
            <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 mb-4">
              <Globe className="w-6 h-6" />
            </div>
            <h4 className="text-white font-semibold text-base mb-1">No Parsed Resume Found</h4>
            <p className="text-xs text-gray-400">Please upload a resume first or create your profile in the Resume Builder page to compile a portfolio website.</p>
          </div>
        )}

        {/* Split View Page Grid */}
        {!loading && resume && (
          <div className="grid grid-cols-3 gap-8 items-start">
            
            {/* Left Control Panel Container */}
            <div className="col-span-1 space-y-6">
              
              {/* Palette Selection Card */}
              <div className="glass-panel border border-borderGlass rounded-2xl p-6">
                <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                  <Palette className="w-4.5 h-4.5 text-brandCyan" />
                  Visual Theme Palette
                </h3>
                
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setSelectedTheme('blue')}
                    className={`py-2 rounded-xl text-xs font-semibold border flex items-center justify-center gap-1.5 transition-all ${
                      selectedTheme === 'blue'
                        ? 'border-blue-500 bg-blue-500/10 text-blue-400 shadow-md'
                        : 'border-slate-800 bg-slate-900 text-gray-400 hover:text-white'
                    }`}
                  >
                    <span className="w-3 h-3 rounded-full bg-cyan-400 inline-block"></span>
                    Ocean Breeze
                  </button>
                  <button
                    onClick={() => setSelectedTheme('green')}
                    className={`py-2 rounded-xl text-xs font-semibold border flex items-center justify-center gap-1.5 transition-all ${
                      selectedTheme === 'green'
                        ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400 shadow-md'
                        : 'border-slate-800 bg-slate-900 text-gray-400 hover:text-white'
                    }`}
                  >
                    <span className="w-3 h-3 rounded-full bg-teal-400 inline-block"></span>
                    Emerald Aurora
                  </button>
                  <button
                    onClick={() => setSelectedTheme('purple')}
                    className={`py-2 rounded-xl text-xs font-semibold border flex items-center justify-center gap-1.5 transition-all ${
                      selectedTheme === 'purple'
                        ? 'border-purple-500 bg-purple-500/10 text-purple-400 shadow-md'
                        : 'border-slate-800 bg-slate-900 text-gray-400 hover:text-white'
                    }`}
                  >
                    <span className="w-3 h-3 rounded-full bg-pink-400 inline-block"></span>
                    Purple Nebula
                  </button>
                  <button
                    onClick={() => setSelectedTheme('red')}
                    className={`py-2 rounded-xl text-xs font-semibold border flex items-center justify-center gap-1.5 transition-all ${
                      selectedTheme === 'red'
                        ? 'border-rose-500 bg-rose-500/10 text-rose-400 shadow-md'
                        : 'border-slate-800 bg-slate-900 text-gray-400 hover:text-white'
                    }`}
                  >
                    <span className="w-3 h-3 rounded-full bg-orange-400 inline-block"></span>
                    Crimson Ember
                  </button>
                </div>
              </div>

              {/* Stat Checklist */}
              <div className="glass-panel border border-borderGlass rounded-2xl p-6">
                <h3 className="text-sm font-semibold text-white mb-3">Compiled Asset Details</h3>
                <ul className="text-xs text-gray-400 space-y-2 leading-relaxed">
                  <li className="flex items-center justify-between border-b border-slate-900 pb-2">
                    <span>Parsed Contact Details</span>
                    <span className="text-white font-medium">Valid</span>
                  </li>
                  <li className="flex items-center justify-between border-b border-slate-900 pb-2">
                    <span>Technical Competencies</span>
                    <span className="text-white font-medium">{resume.skills?.length || 0} Listed</span>
                  </li>
                  <li className="flex items-center justify-between border-b border-slate-900 pb-2">
                    <span>Experience Timeline</span>
                    <span className="text-white font-medium">{resume.experience?.length || 0} Entries</span>
                  </li>
                  <li className="flex items-center justify-between pb-1">
                    <span>Featured Projects</span>
                    <span className="text-white font-medium">{resume.projects?.length || 0} Compiled</span>
                  </li>
                </ul>
              </div>

              {/* Big Exporter Button */}
              <button
                onClick={handleDownload}
                className="w-full flex items-center justify-center gap-2 py-4 bg-gradient-to-r from-brandBlue to-brandPurple hover:from-brandBlue/90 hover:to-brandPurple/90 text-white rounded-2xl text-base font-bold shadow-lg shadow-brandBlue/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                <Download className="w-5 h-5 text-white animate-bounce" />
                Download Standalone Site
              </button>
            </div>

            {/* Right Live Preview Box Container */}
            <div className="col-span-2 space-y-4">
              <span className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">Digital Website Canvas Preview</span>
              
              <div className="border border-slate-800 rounded-2xl bg-slate-950 p-6 max-h-[700px] overflow-y-auto glow-panel shadow-2xl relative">
                
                {/* Visual Glow Layer */}
                <div className={`absolute -top-10 -left-10 w-48 h-48 rounded-full bg-gradient-to-tr ${activeTheme.gradient} opacity-[0.03] blur-3xl pointer-events-none`}></div>

                {/* Portfolio Profile Header */}
                <div className="flex justify-between items-start border-b border-slate-900 pb-8 relative z-10">
                  <div>
                    <h3 className="text-2xl font-black text-white leading-tight">{resume.personalInfo?.name || 'Your Full Name'}</h3>
                    <p className={`text-xs font-semibold ${activeTheme.text} uppercase tracking-widest mt-1.5`}>
                      {resume.experience?.[0]?.position || 'Software Engineer Specialist'}
                    </p>
                    
                    <div className="flex flex-wrap items-center gap-3 mt-4 text-[10px] text-gray-500 font-medium">
                      {resume.personalInfo?.email && (
                        <span className="flex items-center gap-1">
                          <Mail className="w-3 h-3 text-slate-600" />
                          {resume.personalInfo.email}
                        </span>
                      )}
                      {resume.personalInfo?.phone && (
                        <span className="flex items-center gap-1">
                          <Phone className="w-3 h-3 text-slate-600" />
                          {resume.personalInfo.phone}
                        </span>
                      )}
                      {resume.personalInfo?.location && (
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-slate-600" />
                          {resume.personalInfo.location}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-tr ${activeTheme.gradient} flex items-center justify-center font-black text-xl text-white shadow-xl shadow-brandBlue/10`}>
                    {(resume.personalInfo?.name || 'Y').charAt(0).toUpperCase()}
                  </div>
                </div>

                {/* Summary Section */}
                {resume.personalInfo?.summary && (
                  <div className="py-6 border-b border-slate-900">
                    <h4 className="text-[10px] font-black text-white uppercase tracking-widest mb-3 flex items-center gap-1">
                      <span className={`w-1 h-3 bg-gradient-to-t ${activeTheme.gradient} rounded-sm`}></span>
                      About Me
                    </h4>
                    <p className="text-xs text-gray-400 leading-relaxed font-normal">{resume.personalInfo.summary}</p>
                  </div>
                )}

                {/* Skills nodes Section */}
                {resume.skills && (
                  <div className="py-6 border-b border-slate-900">
                    <h4 className="text-[10px] font-black text-white uppercase tracking-widest mb-4 flex items-center gap-1">
                      <span className={`w-1 h-3 bg-gradient-to-t ${activeTheme.gradient} rounded-sm`}></span>
                      Technical Stack
                    </h4>
                    <div class="flex flex-wrap gap-2">
                      {resume.skills.map((skill, index) => (
                        <span 
                          key={index}
                          className={`px-2.5 py-1 bg-slate-900/60 border border-slate-800/80 rounded-lg text-[10px] font-semibold transition-all hover:border-cyan-500 hover:text-cyan-400`}
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Experience Timeline Section */}
                {resume.experience && resume.experience.length > 0 && (
                  <div className="py-6 border-b border-slate-900">
                    <h4 className="text-[10px] font-black text-white uppercase tracking-widest mb-6 flex items-center gap-1">
                      <span className={`w-1 h-3 bg-gradient-to-t ${activeTheme.gradient} rounded-sm`}></span>
                      Professional Experience
                    </h4>
                    <div className="space-y-6">
                      {resume.experience.map((exp, index) => (
                        <div key={index} className="relative pl-6 border-l border-slate-800/80 group">
                          <div className={`absolute -left-1 top-1 w-2 h-2 rounded-full bg-slate-950 border border-slate-800 group-hover:bg-cyan-500 group-hover:border-cyan-500 transition-all`}></div>
                          <div className="flex items-center justify-between flex-wrap gap-1">
                            <h5 className="font-bold text-xs text-white">{exp.position}</h5>
                            <span className={`text-[9px] font-semibold px-2 py-0.5 rounded ${activeTheme.badge}`}>
                              {exp.startDate} - {exp.endDate}
                            </span>
                          </div>
                          <p className="text-[10px] text-gray-500 font-semibold mt-0.5">{exp.company} &bull; {exp.location || 'Remote'}</p>
                          <p className="text-[10px] text-gray-400 mt-2 leading-relaxed pl-2 border-l border-slate-900 font-normal">{exp.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Education Timeline Section */}
                {resume.education && resume.education.length > 0 && (
                  <div className="py-6 border-b border-slate-900">
                    <h4 className="text-[10px] font-black text-white uppercase tracking-widest mb-6 flex items-center gap-1">
                      <span className={`w-1 h-3 bg-gradient-to-t ${activeTheme.gradient} rounded-sm`}></span>
                      Education & Certifications
                    </h4>
                    <div className="space-y-6">
                      {resume.education.map((edu, index) => (
                        <div key={index} className="relative pl-6 border-l border-slate-800/80 group">
                          <div className="absolute -left-1 top-1 w-2 h-2 rounded-full bg-slate-950 border border-slate-800 group-hover:bg-cyan-500 group-hover:border-cyan-500 transition-all"></div>
                          <div className="flex items-center justify-between flex-wrap gap-1">
                            <h5 className="font-bold text-xs text-white">{edu.degree} in {edu.fieldOfStudy}</h5>
                            <span className={`text-[9px] font-semibold px-2 py-0.5 rounded ${activeTheme.badge}`}>
                              {edu.startDate} - {edu.endDate}
                            </span>
                          </div>
                          <p className="text-[10px] text-gray-500 font-semibold mt-0.5">{edu.school} &bull; {edu.location || ''}</p>
                          {edu.gpa && <span className="text-[9px] text-slate-500 block mt-1">GPA: {edu.gpa}</span>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Projects Section */}
                {resume.projects && resume.projects.length > 0 && (
                  <div className="py-6">
                    <h4 className="text-[10px] font-black text-white uppercase tracking-widest mb-6 flex items-center gap-1">
                      <span className={`w-1 h-3 bg-gradient-to-t ${activeTheme.gradient} rounded-sm`}></span>
                      Featured Projects
                    </h4>
                    <div className="grid grid-cols-2 gap-4">
                      {resume.projects.map((proj, index) => (
                        <div key={index} className="bg-slate-900/40 border border-slate-800/60 rounded-xl p-4 flex flex-col justify-between hover:border-slate-700 transition-all shadow">
                          <div>
                            <h5 className="font-bold text-xs text-white">{proj.title}</h5>
                            <p className="text-[10px] text-gray-400 mt-1.5 leading-normal font-normal">{proj.description}</p>
                          </div>
                          <div className="mt-3 pt-2 border-t border-slate-900/50 flex items-center justify-between flex-wrap gap-1">
                            <div className="flex flex-wrap gap-1">
                              {proj.technologies?.slice(0, 2).map((tech, tIdx) => (
                                <span key={tIdx} className="text-[8px] font-semibold text-slate-500 bg-slate-950 border border-slate-900 px-1 py-0.5 rounded">
                                  {tech}
                                </span>
                              ))}
                            </div>
                            {proj.link && (
                              <span className={`text-[9px] font-bold ${activeTheme.text} flex items-center gap-0.5`}>
                                URL <ExternalLink className="w-2.5 h-2.5" />
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              </div>
            </div>

          </div>
        )}

      </main>
    </div>
  );
};

export default PortfolioGenerator;
