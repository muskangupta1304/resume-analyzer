// Centralized local file-based JSON Database store fallback
const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, '../data');

// Ensure database directory exists locally
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Helpers to load and save data from/to local JSON files
const loadFile = (fileName, defaultValue) => {
  const filePath = path.join(dataDir, fileName);
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, JSON.stringify(defaultValue, null, 2), 'utf-8');
    return defaultValue;
  }
  try {
    const raw = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(raw);
  } catch (error) {
    console.error(`Error loading database file ${fileName}:`, error);
    return defaultValue;
  }
};

const saveFile = (fileName, data) => {
  const filePath = path.join(dataDir, fileName);
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
  } catch (error) {
    console.error(`Error saving database file ${fileName}:`, error);
  }
};

// Seed standard mock jobs
const initialJobs = [
  {
    _id: 'mock-job-1',
    title: 'Full Stack React & Node Developer',
    company: 'InnovateTech Labs',
    location: 'San Francisco, CA (Hybrid)',
    salary: '$110,000 - $135,000',
    description: 'We are seeking a Full Stack Developer to build modern SaaS components. In this role, you will write responsive React architectures, integrate Tailwind CSS, and set up REST API interfaces using Express and MongoDB.',
    requirements: ['React.js', 'Node.js', 'Express.js', 'MongoDB', 'Tailwind CSS', 'Git']
  },
  {
    _id: 'mock-job-2',
    title: 'Senior Frontend Engineer (React/TypeScript)',
    company: 'Apex Cloud Solutions',
    location: 'Remote',
    salary: '$140,000 - $165,000',
    description: 'Join our frontend team to build high-performance microservices. You will spearhead React application designs, optimize page speeds, migrate legacy modules to TypeScript, and collaborate with backend teams to integrate GraphQL APIs.',
    requirements: ['React.js', 'TypeScript', 'GraphQL', 'Redux', 'Jest', 'CI/CD Pipelines']
  },
  {
    _id: 'mock-job-3',
    title: 'Junior Web Specialist',
    company: 'PixelForge Studio',
    location: 'Boston, MA',
    salary: '$70,000 - $85,000',
    description: 'PixelForge is looking for an enthusiastic developer to build client dashboards. You will work on layout design, write responsive CSS, construct frontend elements, and support data management schemas using SQL and MongoDB.',
    requirements: ['JavaScript', 'HTML5', 'CSS3', 'React.js', 'MongoDB', 'Git']
  },
  {
    _id: 'mock-job-4',
    title: 'DevOps & Platform Infrastructure Architect',
    company: 'SecureNet Systems',
    location: 'Remote',
    salary: '$150,000 - $180,000',
    description: 'We are looking for a DevOps Engineer to handle our AWS cloud platform scale. You will build automatic deployment templates, orchestrate container structures using Docker & Kubernetes, and write secure network protocols.',
    requirements: ['Docker', 'Kubernetes', 'AWS (EC2/S3)', 'CI/CD Pipelines', 'Linux', 'Terraform']
  }
];

// Core active datastore arrays (hydrated from disk)
const users = loadFile('users.json', []);
const resumes = loadFile('resumes.json', []);
const analyses = loadFile('analyses.json', []);
const jobs = loadFile('jobs.json', initialJobs);
const applications = loadFile('applications.json', []);

// Persistence sync routines
const saveUsers = () => saveFile('users.json', users);
const saveResumes = () => saveFile('resumes.json', resumes);
const saveAnalyses = () => saveFile('analyses.json', analyses);
const saveJobs = () => saveFile('jobs.json', jobs);
const saveApplications = () => saveFile('applications.json', applications);

// Seed standard mock application if empty
if (applications.length === 0) {
  console.log('[Seed] Auto-seeding persistent Kanban application pipeline...');
  applications.push({
    _id: 'mock-app-1',
    user: 'default-user',
    title: 'Full Stack React & Node Developer',
    company: 'InnovateTech Labs',
    salary: '$110,000 - $135,000',
    stage: 'Wishlist',
    notes: 'Excited about their modern SaaS stack. 85% match percentage!',
    createdAt: new Date()
  });
  saveApplications();
}

// Auto-seed default-user's starter resume if empty
const defaultUserResumeExists = resumes.some(r => r.user === 'default-user');
if (!defaultUserResumeExists) {
  console.log('[Seed] Auto-seeding persistent resume for local single-user command workspace...');
  resumes.push({
    _id: 'default-resume-1',
    user: 'default-user',
    fileName: 'Starter-ATS-Resume.pdf',
    rawText: `Premium User Resume. Software Engineer. Skills: React.js, Node.js, Express.js, MongoDB, JavaScript, HTML5, CSS3, Tailwind CSS, Git. Experience: Junior Web Developer at TechNexus. Education: BS Computer Science.`,
    personalInfo: {
      name: "Premium User",
      email: "user@example.com",
      phone: "+1 (555) 019-2834",
      website: "linkedin.com/in/premium-user",
      location: "San Francisco, CA",
      summary: "Highly motivated Full-Stack Software Developer with a solid foundation in modern web architectures. Experienced in building responsive user interfaces, writing clean modular backend routes, and collaborating within Agile sprint cycles."
    },
    skills: ['React.js', 'Node.js', 'Express.js', 'MongoDB', 'JavaScript', 'HTML5', 'CSS3', 'Tailwind CSS', 'Git', 'REST APIs'],
    experience: [
      {
        company: 'TechNexus Enterprises',
        position: 'Associate Web Developer',
        startDate: 'January 2025',
        endDate: 'Present',
        current: true,
        description: 'Collaborated on frontend developments to construct 15+ highly responsive interface modules using React and Tailwind CSS. Structured lightweight REST API controllers, optimizing backend load delivery speeds by 18%.',
        location: 'San Francisco, CA'
      }
    ],
    education: [
      {
        school: 'California State University',
        degree: 'Bachelor of Science',
        fieldOfStudy: 'Computer Science',
        startDate: '2021',
        endDate: '2025',
        current: false,
        gpa: '3.6/4.0',
        location: 'San Jose, CA'
      }
    ],
    projects: [
      {
        title: 'Dynamic Portfolio Builder',
        description: 'Constructed an open-source resume management portal enabling users to update profile details dynamically and export clean print layouts.',
        technologies: ['React', 'Node.js', 'MongoDB'],
        link: 'github.com/starter/portfolio-builder'
      }
    ],
    createdAt: new Date()
  });
  saveResumes();
}

module.exports = {
  users,
  resumes,
  analyses,
  jobs,
  applications,
  saveUsers,
  saveResumes,
  saveAnalyses,
  saveJobs,
  saveApplications
};
