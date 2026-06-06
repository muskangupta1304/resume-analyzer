const Analysis = require('../models/Analysis');
const Resume = require('../models/Resume');
const { 
  analyzeResumeWithAI, 
  rewriteBulletWithAI, 
  analyzeSkillGapWithAI, 
  generateColdOutreachWithAI,
  generateInterviewQuestionsWithAI,
  analyzeInterviewAnswerWithAI,
  generateCoverLetterWithAI,
  chatAboutResumeWithAI,
  generateDynamicJobsWithAI
} = require('../services/aiService');
const inMemoryStore = require('../config/inMemoryStore');

/**
 * @desc    Analyze a resume using Gemini AI and return full ATS audit details
 * @route   POST /api/analysis/:resumeId
 * @access  Private
 */
const analyzeResume = async (req, res) => {
  try {
    let resume;

    // 1. CHOOSE ACTIVE DATALAYER
    if (process.env.USE_IN_MEMORY_DB === 'true') {
      resume = inMemoryStore.resumes.find(r => r._id === req.params.resumeId && r.user === req.user.id);
    } else {
      resume = await Resume.findOne({ _id: req.params.resumeId, user: req.user.id });
    }

    if (!resume) {
      return res.status(404).json({ success: false, message: 'Resume not found' });
    }

    console.log(`[Analysis] Auditing: ${resume.fileName} via Gemini AI...`);

    // 2. RUN AI AUDITOR
    const aiAnalysisResult = await analyzeResumeWithAI(resume);

    // 3. SAVE ANALYSIS ACCORDING TO DATALAYER
    if (process.env.USE_IN_MEMORY_DB === 'true') {
      const mockAnalysisId = `mem-analysis-${Date.now()}`;
      const analysis = {
        _id: mockAnalysisId,
        user: req.user.id,
        resume: {
          _id: resume._id,
          fileName: resume.fileName
        },
        atsScore: aiAnalysisResult.atsScore,
        breakdown: aiAnalysisResult.breakdown,
        gaining: aiAnalysisResult.gaining,
        lacking: aiAnalysisResult.lacking,
        whereToAdd: aiAnalysisResult.whereToAdd,
        recommendedKeywords: aiAnalysisResult.recommendedKeywords,
        createdAt: new Date()
      };
      
      inMemoryStore.analyses.push(analysis);
      inMemoryStore.saveAnalyses(); // Sync to local JSON

      return res.status(201).json({
        success: true,
        message: 'ATS Audit completed successfully (In-Memory)',
        data: analysis,
      });
    }

    // MONGO OPERATIONS
    const analysis = await Analysis.create({
      user: req.user.id,
      resume: resume._id,
      atsScore: aiAnalysisResult.atsScore,
      breakdown: aiAnalysisResult.breakdown,
      gaining: aiAnalysisResult.gaining,
      lacking: aiAnalysisResult.lacking,
      whereToAdd: aiAnalysisResult.whereToAdd,
      recommendedKeywords: aiAnalysisResult.recommendedKeywords,
    });

    return res.status(201).json({
      success: true,
      message: 'ATS Audit completed successfully',
      data: analysis,
    });
  } catch (error) {
    console.error('Analyze Resume Error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Get all ATS analyses of the user
 * @route   GET /api/analysis
 * @access  Private
 */
const getAnalyses = async (req, res) => {
  try {
    // 1. IN-MEMORY PERSISTENT FALLBACK GATE
    if (process.env.USE_IN_MEMORY_DB === 'true') {
      const userAnalyses = inMemoryStore.analyses
        .filter(a => a.user === req.user.id)
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      return res.status(200).json({ success: true, count: userAnalyses.length, data: userAnalyses });
    }

    // 2. MONGO OPERATIONS
    const analyses = await Analysis.find({ user: req.user.id }).sort({ createdAt: -1 }).populate('resume', 'fileName');
    return res.status(200).json({ success: true, count: analyses.length, data: analyses });
  } catch (error) {
    console.error('Get Analyses Error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Get a specific ATS analysis by ID
 * @route   GET /api/analysis/:id
 * @access  Private
 */
const getAnalysisById = async (req, res) => {
  try {
    // 1. IN-MEMORY PERSISTENT FALLBACK GATE
    if (process.env.USE_IN_MEMORY_DB === 'true') {
      const analysis = inMemoryStore.analyses.find(a => a._id === req.params.id && a.user === req.user.id);
      if (!analysis) {
        return res.status(404).json({ success: false, message: 'ATS Analysis report not found' });
      }
      
      // Populate resume metadata
      const associatedResume = inMemoryStore.resumes.find(r => r._id === (analysis.resume._id || analysis.resume));
      const populatedAnalysis = {
        ...analysis,
        resume: associatedResume ? { fileName: associatedResume.fileName, personalInfo: associatedResume.personalInfo } : analysis.resume
      };
      
      return res.status(200).json({ success: true, data: populatedAnalysis });
    }

    // 2. MONGO OPERATIONS
    const analysis = await Analysis.findOne({ _id: req.params.id, user: req.user.id }).populate('resume', 'fileName personalInfo');
    if (!analysis) {
      return res.status(404).json({ success: false, message: 'ATS Analysis report not found' });
    }
    return res.status(200).json({ success: true, data: analysis });
  } catch (error) {
    console.error('Get Analysis By ID Error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Optimize a weak description bullet point in real-time
 * @route   POST /api/analysis/rewrite-bullet
 * @access  Private
 */
const rewriteBulletPoint = async (req, res) => {
  try {
    const { bulletText, jobTitle } = req.body;
    if (!bulletText || bulletText.trim() === '') {
      return res.status(400).json({ success: false, message: 'Please provide bullet text' });
    }

    console.log(`[Optimizer] Rewriting bullet: "${bulletText}" for role "${jobTitle}"...`);
    const suggestions = await rewriteBulletWithAI(bulletText, jobTitle);

    return res.status(200).json({
      success: true,
      data: suggestions,
    });
  } catch (error) {
    console.error('Rewrite Bullet Error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Execute skill gap comparisons against a specific target Job Description (JD)
 * @route   POST /api/analysis/:resumeId/skill-gap
 * @access  Private
 */
const getSkillGapReport = async (req, res) => {
  try {
    const { jobDescription } = req.body;
    if (!jobDescription || jobDescription.trim() === '') {
      return res.status(400).json({ success: false, message: 'Please provide a target job description' });
    }

    let resume;
    // 1. CHOOSE ACTIVE DATALAYER
    if (process.env.USE_IN_MEMORY_DB === 'true') {
      resume = inMemoryStore.resumes.find(r => r._id === req.params.resumeId && r.user === req.user.id);
    } else {
      resume = await Resume.findOne({ _id: req.params.resumeId, user: req.user.id });
    }

    if (!resume) {
      return res.status(404).json({ success: false, message: 'Resume not found' });
    }

    console.log(`[Skill Gap] Evaluating resume against target JD...`);
    const gapReport = await analyzeSkillGapWithAI(resume, jobDescription);

    return res.status(200).json({
      success: true,
      data: gapReport,
    });
  } catch (error) {
    console.error('Skill Gap Analysis Error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Generate personalized cold outreach email & LinkedIn notes
 * @route   POST /api/analysis/outreach
 * @access  Private
 */
const generateOutreach = async (req, res) => {
  try {
    const { resumeId, jobTitle, companyName, jobDescription } = req.body;
    if (!resumeId) {
      return res.status(400).json({ success: false, message: 'Please provide a resumeId' });
    }

    let resume;
    // CHOOSE ACTIVE DATALAYER
    if (process.env.USE_IN_MEMORY_DB === 'true') {
      resume = inMemoryStore.resumes.find(r => r._id === resumeId && r.user === req.user.id);
    } else {
      resume = await Resume.findOne({ _id: resumeId, user: req.user.id });
    }

    if (!resume) {
      return res.status(404).json({ success: false, message: 'Resume not found' });
    }

    console.log(`[Outreach] Drafting tailored pitch for ${jobTitle || 'Role'} at ${companyName || 'Company'}...`);
    const outreach = await generateColdOutreachWithAI(resume, jobTitle, companyName, jobDescription);

    return res.status(200).json({
      success: true,
      data: outreach,
    });
  } catch (error) {
    console.error('Outreach Generation Error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Generate tailored interview questions based on active resume & target role
 * @route   POST /api/analysis/interview/questions
 * @access  Private
 */
const getInterviewQuestions = async (req, res) => {
  try {
    const { resumeId, targetRole } = req.body;
    if (!resumeId) {
      return res.status(400).json({ success: false, message: 'Please provide a resumeId' });
    }

    let resume;
    if (process.env.USE_IN_MEMORY_DB === 'true') {
      resume = inMemoryStore.resumes.find(r => r._id === resumeId && r.user === req.user.id);
    } else {
      resume = await Resume.findOne({ _id: resumeId, user: req.user.id });
    }

    if (!resume) {
      return res.status(404).json({ success: false, message: 'Resume not found' });
    }

    console.log(`[Interview] Compiling custom questions for role "${targetRole || 'Software Engineer'}"...`);
    const questions = await generateInterviewQuestionsWithAI(resume, targetRole);

    return res.status(200).json({
      success: true,
      data: questions,
    });
  } catch (error) {
    console.error('Interview Questions Error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Evaluate candidate answer to a specific interview question
 * @route   POST /api/analysis/interview/feedback
 * @access  Private
 */
const gradeInterviewAnswer = async (req, res) => {
  try {
    const { resumeId, question, userAnswer, targetRole } = req.body;
    if (!resumeId || !question || !userAnswer) {
      return res.status(400).json({ success: false, message: 'Please provide resumeId, question, and userAnswer' });
    }

    let resume;
    if (process.env.USE_IN_MEMORY_DB === 'true') {
      resume = inMemoryStore.resumes.find(r => r._id === resumeId && r.user === req.user.id);
    } else {
      resume = await Resume.findOne({ _id: resumeId, user: req.user.id });
    }

    if (!resume) {
      return res.status(404).json({ success: false, message: 'Resume not found' });
    }

    console.log(`[Interview] Auditing response for question: "${question.substring(0, 30)}..."`);
    const auditFeedback = await analyzeInterviewAnswerWithAI(resume, question, userAnswer, targetRole);

    return res.status(200).json({
      success: true,
      data: auditFeedback,
    });
  } catch (error) {
    console.error('Interview Answer Feedback Error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Generate Cover Letter and Elevator Pitch dynamically
 * @route   POST /api/analysis/cover-letter
 * @access  Private
 */
const generateCoverLetter = async (req, res) => {
  try {
    const { resumeId, jobTitle, companyName, jobDescription } = req.body;
    if (!resumeId) {
      return res.status(400).json({ success: false, message: 'Please provide a resumeId' });
    }

    let resume;
    if (process.env.USE_IN_MEMORY_DB === 'true') {
      resume = inMemoryStore.resumes.find(r => r._id === resumeId && r.user === req.user.id);
    } else {
      resume = await Resume.findOne({ _id: resumeId, user: req.user.id });
    }

    if (!resume) {
      return res.status(404).json({ success: false, message: 'Resume not found' });
    }

    console.log(`[Cover Letter] Compiling document for "${jobTitle || 'Role'}" at "${companyName || 'Company'}"...`);
    const letterData = await generateCoverLetterWithAI(resume, jobTitle, companyName, jobDescription);

    return res.status(200).json({
      success: true,
      data: letterData,
    });
  } catch (error) {
    console.error('Cover Letter Generation Error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Chat with AI career mentor regarding your resume/doubt
 * @route   POST /api/analysis/chat
 * @access  Private
 */
const chatWithAI = async (req, res) => {
  try {
    const { resumeId, chatHistory, message } = req.body;
    if (!resumeId || !message) {
      return res.status(400).json({ success: false, message: 'Please provide resumeId and message' });
    }

    let resume;
    if (process.env.USE_IN_MEMORY_DB === 'true') {
      resume = inMemoryStore.resumes.find(r => r._id === resumeId && r.user === req.user.id);
    } else {
      resume = await Resume.findOne({ _id: resumeId, user: req.user.id });
    }

    if (!resume) {
      return res.status(404).json({ success: false, message: 'Resume not found' });
    }

    console.log(`[Chat] AI Career Mentor answering message: "${message.substring(0, 30)}..."`);
    const reply = await chatAboutResumeWithAI(resume, chatHistory, message);

    return res.status(200).json({
      success: true,
      data: reply,
    });
  } catch (error) {
    console.error('Chat With AI Error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Get dynamic job recommendations split by Core, Adjacent, and Stretch matching
 * @route   POST /api/analysis/recommendations
 * @access  Private
 */
const getDynamicJobRecommendations = async (req, res) => {
  try {
    const { resumeId } = req.body;
    if (!resumeId) {
      return res.status(400).json({ success: false, message: 'Please provide a resumeId' });
    }

    let resume;
    if (process.env.USE_IN_MEMORY_DB === 'true') {
      resume = inMemoryStore.resumes.find(r => r._id === resumeId && r.user === req.user.id);
    } else {
      resume = await Resume.findOne({ _id: resumeId, user: req.user.id });
    }

    if (!resume) {
      return res.status(404).json({ success: false, message: 'Resume not found' });
    }

    console.log(`[Matchmaking] Generating career match and pivot options for: ${resume.fileName}...`);
    const matchmakingData = await generateDynamicJobsWithAI(resume);

    return res.status(200).json({
      success: true,
      data: matchmakingData,
    });
  } catch (error) {
    console.error('Dynamic Job Recommendations Error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  analyzeResume,
  getAnalyses,
  getAnalysisById,
  rewriteBulletPoint,
  getSkillGapReport,
  generateOutreach,
  getInterviewQuestions,
  gradeInterviewAnswer,
  generateCoverLetter,
  chatWithAI,
  getDynamicJobRecommendations
};
