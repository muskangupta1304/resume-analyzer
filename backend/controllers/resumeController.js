const Resume = require('../models/Resume');
const { parseResume } = require('../services/parserService');
const { parseResumeWithAI } = require('../services/aiService');
const inMemoryStore = require('../config/inMemoryStore');

/**
 * @desc    Upload resume document, parse text, structure with AI, and save
 * @route   POST /api/resume/upload
 * @access  Private
 */
const uploadResume = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please upload a PDF or DOCX file' });
    }

    const fileBuffer = req.file.buffer;
    const mimeType = req.file.mimetype;
    const fileName = req.file.originalname;

    console.log(`[Upload] Processing: ${fileName} (${mimeType})`);
    
    const rawText = await parseResume(fileBuffer, mimeType);
    if (!rawText || rawText.trim() === '') {
      return res.status(400).json({ success: false, message: 'Could not extract text from this document. Please ensure it contains selectable text.' });
    }

    console.log(`[Upload] Extracted text (${rawText.length} chars). Structuring with AI...`);
    const structuredResume = await parseResumeWithAI(rawText);

    // 1. IN-MEMORY PERSISTENT FALLBACK GATE
    if (process.env.USE_IN_MEMORY_DB === 'true') {
      const mockResumeId = `mem-resume-${Date.now()}`;
      const resume = {
        _id: mockResumeId,
        user: req.user.id,
        fileName,
        rawText,
        personalInfo: structuredResume.personalInfo,
        skills: structuredResume.skills,
        experience: structuredResume.experience,
        education: structuredResume.education,
        projects: structuredResume.projects,
        createdAt: new Date()
      };
      
      inMemoryStore.resumes.unshift(resume); 
      inMemoryStore.saveResumes(); // Sync to local JSON

      return res.status(201).json({
        success: true,
        message: 'Resume parsed and saved successfully (In-Memory)',
        data: resume,
      });
    }

    // 2. MONGO OPERATIONS
    const resume = await Resume.create({
      user: req.user.id,
      fileName,
      rawText,
      personalInfo: structuredResume.personalInfo,
      skills: structuredResume.skills,
      experience: structuredResume.experience,
      education: structuredResume.education,
      projects: structuredResume.projects,
    });

    return res.status(201).json({
      success: true,
      message: 'Resume parsed and saved successfully',
      data: resume,
    });
  } catch (error) {
    console.error('Upload & Parsing Error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Get all resumes of the authenticated user
 * @route   GET /api/resume
 * @access  Private
 */
const getResumes = async (req, res) => {
  try {
    // 1. IN-MEMORY PERSISTENT FALLBACK GATE
    if (process.env.USE_IN_MEMORY_DB === 'true') {
      const userResumes = inMemoryStore.resumes
        .filter(r => r.user === req.user.id)
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      return res.status(200).json({ success: true, count: userResumes.length, data: userResumes });
    }

    // 2. MONGO OPERATIONS
    const resumes = await Resume.find({ user: req.user.id }).sort({ createdAt: -1 });
    return res.status(200).json({ success: true, count: resumes.length, data: resumes });
  } catch (error) {
    console.error('Get Resumes Error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Get a single resume by ID
 * @route   GET /api/resume/:id
 * @access  Private
 */
const getResumeById = async (req, res) => {
  try {
    // 1. IN-MEMORY PERSISTENT FALLBACK GATE
    if (process.env.USE_IN_MEMORY_DB === 'true') {
      const resume = inMemoryStore.resumes.find(r => r._id === req.params.id && r.user === req.user.id);
      if (!resume) {
        return res.status(404).json({ success: false, message: 'Resume not found' });
      }
      return res.status(200).json({ success: true, data: resume });
    }

    // 2. MONGO OPERATIONS
    const resume = await Resume.findOne({ _id: req.params.id, user: req.user.id });
    if (!resume) {
      return res.status(404).json({ success: false, message: 'Resume not found' });
    }
    return res.status(200).json({ success: true, data: resume });
  } catch (error) {
    console.error('Get Resume By ID Error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Update structured resume details (interactive builder sync)
 * @route   PUT /api/resume/:id
 * @access  Private
 */
const updateResume = async (req, res) => {
  try {
    const { personalInfo, skills, experience, education, projects } = req.body;

    // 1. IN-MEMORY PERSISTENT FALLBACK GATE
    if (process.env.USE_IN_MEMORY_DB === 'true') {
      const resumeIndex = inMemoryStore.resumes.findIndex(r => r._id === req.params.id && r.user === req.user.id);
      if (resumeIndex === -1) {
        return res.status(404).json({ success: false, message: 'Resume not found' });
      }

      const activeResume = inMemoryStore.resumes[resumeIndex];
      const updatedResume = {
        ...activeResume,
        personalInfo: personalInfo || activeResume.personalInfo,
        skills: skills || activeResume.skills,
        experience: experience || activeResume.experience,
        education: education || activeResume.education,
        projects: projects || activeResume.projects
      };
      
      inMemoryStore.resumes[resumeIndex] = updatedResume;
      inMemoryStore.saveResumes(); // Sync to local JSON

      return res.status(200).json({
        success: true,
        message: 'Resume updated successfully (In-Memory)',
        data: updatedResume,
      });
    }

    // 2. MONGO OPERATIONS
    let resume = await Resume.findOne({ _id: req.params.id, user: req.user.id });
    if (!resume) {
      return res.status(404).json({ success: false, message: 'Resume not found' });
    }

    resume.personalInfo = personalInfo || resume.personalInfo;
    resume.skills = skills || resume.skills;
    resume.experience = experience || resume.experience;
    resume.education = education || resume.education;
    resume.projects = projects || resume.projects;

    await resume.save();

    return res.status(200).json({
      success: true,
      message: 'Resume updated successfully',
      data: resume,
    });
  } catch (error) {
    console.error('Update Resume Error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Create a new structured resume directly (from empty builder)
 * @route   POST /api/resume
 * @access  Private
 */
const createResume = async (req, res) => {
  try {
    const { personalInfo, skills, experience, education, projects } = req.body;

    // 1. IN-MEMORY PERSISTENT FALLBACK GATE
    if (process.env.USE_IN_MEMORY_DB === 'true') {
      const mockResumeId = `mem-resume-${Date.now()}`;
      const resume = {
        _id: mockResumeId,
        user: req.user.id,
        fileName: 'Interactive-Resume.pdf',
        personalInfo,
        skills: skills || [],
        experience: experience || [],
        education: education || [],
        projects: projects || [],
        createdAt: new Date()
      };
      
      inMemoryStore.resumes.push(resume);
      inMemoryStore.saveResumes(); // Sync to local JSON

      return res.status(201).json({
        success: true,
        message: 'Resume created successfully (In-Memory)',
        data: resume,
      });
    }

    // 2. MONGO OPERATIONS
    const resume = await Resume.create({
      user: req.user.id,
      fileName: 'Interactive-Resume.pdf',
      personalInfo,
      skills,
      experience,
      education,
      projects,
    });

    return res.status(201).json({
      success: true,
      message: 'Resume created successfully',
      data: resume,
    });
  } catch (error) {
    console.error('Create Resume Error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  uploadResume,
  getResumes,
  getResumeById,
  updateResume,
  createResume,
};
