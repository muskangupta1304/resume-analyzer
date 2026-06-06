import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import OutreachModal from '../components/OutreachModal';
import { 
  Trello, 
  Plus, 
  Briefcase, 
  Trash2, 
  ArrowLeft, 
  ArrowRight, 
  Mail, 
  Sparkles,
  ClipboardList,
  ChevronRight,
  UserCheck
} from 'lucide-react';
import axios from 'axios';

const Pipeline = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Form states
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    company: '',
    salary: '',
    notes: '',
    stage: 'Wishlist'
  });

  // Outreach Modal states
  const [outreachOpen, setOutreachOpen] = useState(false);
  const [outreachJob, setOutreachJob] = useState({ title: '', company: '', description: '' });

  // Columns layout configuration
  const columns = [
    { key: 'Wishlist', label: 'Wishlist / Saved', color: 'border-brandBlue text-brandBlue bg-brandBlue/5' },
    { key: 'Applied', label: 'Applied', color: 'border-amber-500 text-amber-500 bg-amber-500/5' },
    { key: 'Interviewing', label: 'Interviewing', color: 'border-brandPurple text-brandPurple bg-brandPurple/5' },
    { key: 'Offer', label: 'Offer Received', color: 'border-emerald-500 text-emerald-500 bg-emerald-500/5' }
  ];

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const response = await axios.get('http://localhost:5000/api/pipeline', { headers });
      if (response.data.success) {
        setApplications(response.data.data);
      }
    } catch (err) {
      console.error('Fetch Pipeline Error:', err);
      setError('Could not connect to pipeline database.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.company) return;

    try {
      const token = localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const response = await axios.post('http://localhost:5000/api/pipeline', formData, { headers });
      if (response.data.success) {
        setApplications([response.data.data, ...applications]);
        setFormData({ title: '', company: '', salary: '', notes: '', stage: 'Wishlist' });
        setShowAddForm(false);
      }
    } catch (err) {
      console.error('Create Application Card Error:', err);
    }
  };

  const handleShift = async (id, currentStage, direction) => {
    const stageOrder = ['Wishlist', 'Applied', 'Interviewing', 'Offer'];
    const currentIndex = stageOrder.indexOf(currentStage);
    const nextIndex = currentIndex + direction;

    if (nextIndex < 0 || nextIndex >= stageOrder.length) return;
    const newStage = stageOrder[nextIndex];

    try {
      const token = localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const response = await axios.put(`http://localhost:5000/api/pipeline/${id}`, { stage: newStage }, { headers });
      if (response.data.success) {
        setApplications(applications.map(app => app._id === id ? response.data.data : app));
      }
    } catch (err) {
      console.error('Shift Card Stage Error:', err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to remove this job application?')) return;
    try {
      const token = localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const response = await axios.delete(`http://localhost:5000/api/pipeline/${id}`, { headers });
      if (response.data.success) {
        setApplications(applications.filter(app => app._id !== id));
      }
    } catch (err) {
      console.error('Delete Application Card Error:', err);
    }
  };

  const triggerOutreach = (title, company, notes) => {
    setOutreachJob({ title, company, description: notes });
    setOutreachOpen(true);
  };

  return (
    <div className="flex bg-slate-950 min-h-screen text-slate-100 font-sans">
      <Sidebar />
      
      <main className="flex-1 pl-64 p-8">
        
        {/* Top Header Section */}
        <div className="flex items-center justify-between mb-8 border-b border-borderGlass pb-6">
          <div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brandBlue/20 to-brandPurple/20 border border-brandBlue/30 flex items-center justify-center">
                <Trello className="w-6 h-6 text-brandCyan" />
              </div>
              <h2 className="text-3xl font-extrabold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">Job Search Pipeline</h2>
            </div>
            <p className="text-sm text-gray-400 mt-2">Manage your career outreach, interviews, and job hunting pipeline in a single CRM dashboard.</p>
          </div>

          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-brandBlue to-brandPurple hover:from-brandBlue/90 hover:to-brandPurple/90 rounded-xl text-sm font-semibold shadow-lg shadow-brandBlue/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            <Plus className="w-4 h-4 text-white" />
            Add Application
          </button>
        </div>

        {/* Add Application Slide-down Form */}
        {showAddForm && (
          <form onSubmit={handleCreate} className="mb-8 p-6 rounded-2xl glass-panel border border-borderGlass animate-scaleUp max-w-2xl">
            <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-brandCyan" />
              New Application Details
            </h3>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-xs text-gray-400 mb-1.5 font-medium">Job Title *</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Senior Software Engineer"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-brandBlue transition-all"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1.5 font-medium">Company Name *</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. InnovateTech"
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-brandBlue transition-all"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-xs text-gray-400 mb-1.5 font-medium">Salary Range</label>
                <input 
                  type="text" 
                  placeholder="e.g. $120,000 - $140,000"
                  value={formData.salary}
                  onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-brandBlue transition-all"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1.5 font-medium">Initial Stage</label>
                <select
                  value={formData.stage}
                  onChange={(e) => setFormData({ ...formData, stage: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-brandBlue transition-all"
                >
                  <option value="Wishlist">Wishlist / Saved</option>
                  <option value="Applied">Applied</option>
                  <option value="Interviewing">Interviewing</option>
                  <option value="Offer">Offer Received</option>
                </select>
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-xs text-gray-400 mb-1.5 font-medium">Notes & Description (For AI Outreach Context)</label>
              <textarea 
                placeholder="Paste key notes about requirements or role details here..."
                rows="3"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-brandBlue transition-all resize-none"
              />
            </div>

            <div className="flex justify-end gap-3">
              <button 
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold transition-colors"
              >
                Cancel
              </button>
              <button 
                type="submit"
                className="px-5 py-2.5 bg-gradient-to-r from-brandBlue to-brandPurple text-white rounded-xl text-xs font-semibold transition-all hover:scale-[1.02]"
              >
                Save Card
              </button>
            </div>
          </form>
        )}

        {/* Loading Spinner */}
        {loading && (
          <div className="flex items-center justify-center h-96">
            <div className="w-10 h-10 border-4 border-slate-800 border-t-brandCyan rounded-full animate-spin" />
          </div>
        )}

        {/* Empty Pipeline State */}
        {!loading && applications.length === 0 && (
          <div className="flex flex-col items-center justify-center h-96 border border-dashed border-borderGlass rounded-2xl p-8 text-center max-w-lg mx-auto">
            <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 mb-4">
              <ClipboardList className="w-6 h-6" />
            </div>
            <h4 className="text-white font-semibold text-base mb-1">Your Pipeline is Empty</h4>
            <p className="text-xs text-gray-400">Track your job applications in one dedicated workspace. Add your first job above or save it from the Job Matching page!</p>
          </div>
        )}

        {/* Kanban Board Layout */}
        {!loading && applications.length > 0 && (
          <div className="grid grid-cols-4 gap-6 items-start">
            {columns.map((col) => {
              const colApps = applications.filter(app => app.stage === col.key);
              return (
                <div key={col.key} className="flex flex-col rounded-2xl bg-slate-900/40 border border-slate-800/80 p-4 min-h-[500px]">
                  
                  {/* Column Title Header */}
                  <div className={`border-b-2 ${col.color.split(' ')[0]} pb-3 mb-4 flex items-center justify-between`}>
                    <h4 className="font-bold text-xs text-white uppercase tracking-wider">{col.label}</h4>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${col.color.split(' ')[1]} ${col.color.split(' ')[2]}`}>
                      {colApps.length}
                    </span>
                  </div>

                  {/* Column Cards */}
                  <div className="space-y-4 flex-1 overflow-y-auto">
                    {colApps.map((app) => (
                      <div 
                        key={app._id} 
                        className="bg-slate-900 border border-slate-800/70 p-4 rounded-xl shadow-lg relative group transition-all duration-200 hover:border-slate-700 hover:shadow-brandBlue/5"
                      >
                        <h5 className="font-bold text-sm text-white leading-snug pr-6">{app.title}</h5>
                        <p className="text-xs text-brandCyan font-semibold mt-1 flex items-center gap-1">
                          <Briefcase className="w-3 h-3" />
                          {app.company}
                        </p>
                        
                        {app.salary && (
                          <span className="text-[10px] text-gray-500 font-medium block mt-2">{app.salary}</span>
                        )}

                        {app.notes && (
                          <p className="text-[10px] text-gray-400 mt-2 line-clamp-2 italic leading-relaxed border-l-2 border-slate-800 pl-2">
                            "{app.notes}"
                          </p>
                        )}

                        {/* Card Options (Outreach & Shift Stage) */}
                        <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-800/50">
                          
                          {/* AI Outreach Trigger */}
                          <button
                            onClick={() => triggerOutreach(app.title, app.company, app.notes)}
                            className="flex items-center gap-1 text-[10px] text-brandPurple font-bold hover:text-white px-2 py-1 rounded bg-brandPurple/5 hover:bg-brandPurple transition-colors"
                          >
                            <Mail className="w-3 h-3" />
                            Draft Outreach
                          </button>

                          {/* Stage Shift Controls */}
                          <div className="flex items-center gap-1.5">
                            <button
                              disabled={col.key === 'Wishlist'}
                              onClick={() => handleShift(app._id, app.stage, -1)}
                              className={`w-6 h-6 rounded flex items-center justify-center text-gray-400 bg-slate-800 hover:bg-slate-700 hover:text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed`}
                            >
                              <ArrowLeft className="w-3.5 h-3.5" />
                            </button>
                            <button
                              disabled={col.key === 'Offer'}
                              onClick={() => handleShift(app._id, app.stage, 1)}
                              className={`w-6 h-6 rounded flex items-center justify-center text-gray-400 bg-slate-800 hover:bg-slate-700 hover:text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed`}
                            >
                              <ArrowRight className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Card Delete Float Option */}
                        <button
                          onClick={() => handleDelete(app._id)}
                          className="absolute top-4 right-4 text-gray-600 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>

                </div>
              );
            })}
          </div>
        )}

      </main>

      {/* Embedded Outreach Modal Script Drawer */}
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

export default Pipeline;
