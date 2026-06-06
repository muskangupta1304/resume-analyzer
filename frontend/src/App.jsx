import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import UploadResume from './pages/UploadResume';
import Analysis from './pages/Analysis';
import ResumeBuilder from './pages/ResumeBuilder';
import JobRecommendations from './pages/JobRecommendations';
import SkillGap from './pages/SkillGap';
import Settings from './pages/Settings';
import Pipeline from './pages/Pipeline';
import PortfolioGenerator from './pages/PortfolioGenerator';
import InterviewPrep from './pages/InterviewPrep';
import CoverLetterGenerator from './pages/CoverLetterGenerator';
import ResumeComparison from './pages/ResumeComparison';
import CareerChat from './pages/CareerChat';
import FloatingChatWidget from './components/FloatingChatWidget';

const App = () => {
  return (
    <Router>
      <Routes>
        {/* Direct Access Workspace Routes - No Authentication Obstacles */}
        <Route path="/" element={<Dashboard />} />
        <Route path="/upload" element={<UploadResume />} />
        <Route path="/analysis" element={<Analysis />} />
        <Route path="/builder" element={<ResumeBuilder />} />
        <Route path="/jobs" element={<JobRecommendations />} />
        <Route path="/pipeline" element={<Pipeline />} />
        <Route path="/portfolio" element={<PortfolioGenerator />} />
        <Route path="/skill-gap" element={<SkillGap />} />
        <Route path="/interview-prep" element={<InterviewPrep />} />
        <Route path="/cover-letter" element={<CoverLetterGenerator />} />
        <Route path="/comparison" element={<ResumeComparison />} />
        <Route path="/chat" element={<CareerChat />} />
        <Route path="/settings" element={<Settings />} />

        {/* Catch-all Redirect fallback to Dashboard home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <FloatingChatWidget />
    </Router>
  );
};

export default App;
export { App };

