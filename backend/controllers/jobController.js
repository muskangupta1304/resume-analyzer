const Job = require('../models/Job');
const Resume = require('../models/Resume');
const { recommendJobsWithAI } = require('../services/aiService');
const inMemoryStore = require('../config/inMemoryStore');

// Seed standard mock jobs if the Job collection is empty (for MongoDB mode)
const seedJobsIfEmpty = async () => {
  const count = await Job.countDocuments();
  if (count === 0) {
    console.log('[Seed] Seeding MongoDB mock job opportunities...');
    await Job.create([
      {
        title: 'Full Stack React & Node Developer',
        company: 'InnovateTech Labs',
        location: 'San Francisco, CA (Hybrid)',
        salary: '$110,000 - $135,000',
        description: 'We are seeking a Full Stack Developer to build modern SaaS components. In this role, you will write responsive React architectures, integrate Tailwind CSS, and set up REST API interfaces using Express and MongoDB.',
        requirements: ['React.js', 'Node.js', 'Express.js', 'MongoDB', 'Tailwind CSS', 'Git']
      },
      {
        title: 'Senior Frontend Engineer (React/TypeScript)',
        company: 'Apex Cloud Solutions',
        location: 'Remote',
        salary: '$140,000 - $165,000',
        description: 'Join our frontend team to build high-performance microservices. You will spearhead React application designs, optimize page speeds, migrate legacy modules to TypeScript, and collaborate with backend teams to integrate GraphQL APIs.',
        requirements: ['React.js', 'TypeScript', 'GraphQL', 'Redux', 'Jest', 'CI/CD Pipelines']
      },
      {
        title: 'Junior Web Specialist',
        company: 'PixelForge Studio',
        location: 'Boston, MA',
        salary: '$70,000 - $85,000',
        description: 'PixelForge is looking for an enthusiastic developer to build client dashboards. You will work on layout design, write responsive CSS, construct frontend elements, and support data management schemas using SQL and MongoDB.',
        requirements: ['JavaScript', 'HTML5', 'CSS3', 'React.js', 'MongoDB', 'Git']
      },
      {
        title: 'DevOps & Platform Infrastructure Architect',
        company: 'SecureNet Systems',
        location: 'Remote',
        salary: '$150,000 - $180,000',
        description: 'We are looking for a DevOps Engineer to handle our AWS cloud platform scale. You will build automatic deployment templates, orchestrate container structures using Docker & Kubernetes, and write secure network protocols.',
        requirements: ['Docker', 'Kubernetes', 'AWS (EC2/S3)', 'CI/CD Pipelines', 'Linux', 'Terraform']
      }
    ]);
    console.log('[Seed] Seeding completed!');
  }
};

/**
 * @desc    Get all jobs and evaluate AI recommendations against user's active resume
 * @route   GET /api/job
 * @access  Private
 */
const getJobs = async (req, res) => {
  try {
    let jobsList = [];
    let resume = null;

    // Helper to calculate exact missing skills to acquire
    const getMissingSkills = (jobReqs, userSkills) => {
      if (!userSkills || userSkills.length === 0) return jobReqs;
      return jobReqs.filter(req => 
        !userSkills.some(skill => {
          const sLower = skill.toLowerCase().replace(/\.js$/, '');
          const rLower = req.toLowerCase().replace(/\.js$/, '');
          return sLower === rLower || sLower.includes(rLower) || rLower.includes(sLower);
        })
      );
    };

    // 1. IN-MEMORY PERSISTENT FALLBACK GATE
    if (process.env.USE_IN_MEMORY_DB === 'true') {
      jobsList = inMemoryStore.jobs;
      resume = inMemoryStore.resumes
        .filter(r => r.user === req.user.id)
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0];
        
      if (!resume) {
        const formattedJobs = jobsList.map(job => ({
          ...job,
          matchPercentage: 0,
          isClosestTarget: false,
          skillsToAcquire: job.requirements,
          feedback: 'Upload or build a resume in the portal to receive tailored AI job recommendations.'
        }));
        return res.status(200).json({ success: true, count: formattedJobs.length, data: formattedJobs });
      }

      console.log(`[Job Match] Matching in-memory resume (${resume.fileName}) against jobs...`);
      const matchScores = await recommendJobsWithAI(resume, jobsList);
      
      const recommendedJobs = jobsList.map(job => {
        const match = matchScores.find(score => score.jobId.toString() === job._id.toString());
        const score = match ? match.matchPercentage : 50;
        const missing = getMissingSkills(job.requirements, resume.skills);
        return {
          ...job,
          matchPercentage: score,
          isClosestTarget: false,
          skillsToAcquire: missing,
          feedback: match ? match.feedback : 'Moderate overlap. Optimize skills layout.'
        };
      }).sort((a, b) => b.matchPercentage - a.matchPercentage);

      // Flag the highest match as the closest career leap
      if (recommendedJobs.length > 0) {
        recommendedJobs[0].isClosestTarget = true;
      }

      return res.status(200).json({ success: true, count: recommendedJobs.length, data: recommendedJobs });
    }

    // 2. MONGO OPERATIONS
    await seedJobsIfEmpty();
    jobsList = await Job.find({}).sort({ createdAt: -1 });
    resume = await Resume.findOne({ user: req.user.id }).sort({ createdAt: -1 });

    if (!resume) {
      const formattedJobs = jobsList.map(job => ({
        ...job.toObject(),
        matchPercentage: 0,
        isClosestTarget: false,
        skillsToAcquire: job.requirements,
        feedback: 'Upload or build a resume in the portal to receive tailored AI job recommendations.'
      }));
      return res.status(200).json({ success: true, count: formattedJobs.length, data: formattedJobs });
    }

    console.log(`[Job Match] Matching database resume (${resume.fileName}) against jobs...`);
    const matchScores = await recommendJobsWithAI(resume, jobsList);

    const recommendedJobs = jobsList.map(job => {
      const match = matchScores.find(score => score.jobId.toString() === job._id.toString());
      const score = match ? match.matchPercentage : 50;
      const missing = getMissingSkills(job.requirements, resume.skills);
      return {
        ...job.toObject(),
        matchPercentage: score,
        isClosestTarget: false,
        skillsToAcquire: missing,
        feedback: match ? match.feedback : 'Moderate overlap. Optimize skills layout.'
      };
    }).sort((a, b) => b.matchPercentage - a.matchPercentage);

    // Flag the highest match as the closest target leap
    if (recommendedJobs.length > 0) {
      recommendedJobs[0].isClosestTarget = true;
    }

    return res.status(200).json({ success: true, count: recommendedJobs.length, data: recommendedJobs });
  } catch (error) {
    console.error('Get Jobs Error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Directly create a new Job listing in database
 * @route   POST /api/job
 * @access  Private
 */
const createJob = async (req, res) => {
  try {
    const { title, company, description, requirements, location, salary } = req.body;

    if (!title || !company || !description) {
      return res.status(400).json({ success: false, message: 'Please provide Title, Company, and Description' });
    }

    // IN-MEMORY PERSISTENT FALLBACK GATE
    if (process.env.USE_IN_MEMORY_DB === 'true') {
      const mockJob = {
        _id: `mem-job-${Date.now()}`,
        title,
        company,
        description,
        requirements: requirements || [],
        location: location || 'Remote',
        salary: salary || 'Competitive',
        createdAt: new Date()
      };
      
      inMemoryStore.jobs.push(mockJob);
      inMemoryStore.saveJobs(); // Sync to local JSON
      return res.status(201).json({ success: true, message: 'Job posting created successfully (In-Memory)', data: mockJob });
    }

    // MONGO OPERATIONS
    const job = await Job.create({
      title,
      company,
      description,
      requirements: requirements || [],
      location,
      salary,
    });

    return res.status(201).json({
      success: true,
      message: 'Job posting created successfully',
      data: job,
    });
  } catch (error) {
    console.error('Create Job Error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getJobs,
  createJob,
};
