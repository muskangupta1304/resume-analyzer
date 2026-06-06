const { GoogleGenAI } = require('@google/genai');

/**
 * Helper to initialize the Gemini AI Client.
 * Returns null if no API key is configured.
 */
const getAiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey.trim() === '' || apiKey.startsWith('your_')) {
    console.warn('\x1b[33m%s\x1b[0m', '⚠️ WARNING: GEMINI_API_KEY is not configured in .env. Falling back to high-fidelity mock AI processing.');
    return null;
  }
  return new GoogleGenAI({ apiKey });
};

/**
 * Extracts structured JSON data from raw resume text.
 */
const parseResumeWithAI = async (rawText) => {
  const ai = getAiClient();
  
  if (!ai) {
    return getMockParsedResume(rawText);
  }

  try {
    const prompt = `
You are an expert resume parser AI. Analyze the following raw text extracted from a resume and structure it into a perfect JSON format.
Extrapolate missing values logically where appropriate but do not invent entirely fictional details. 

> [!IMPORTANT]
> **MULTI-PAGE RESUME REQUIREMENT**:
> The raw text may span multiple pages (1, 2, or more pages). You MUST meticulously extract EVERY SINGLE work experience item, project, education entry, and technical skill listed across the entire document, especially from the second page. Do NOT truncate, summarize, or omit older experiences. Every single job must have its own object in the "experience" array.

Raw Resume Text:
"""
${rawText}
"""

You MUST return ONLY a valid JSON object matching the following structure:
{
  "personalInfo": {
    "name": "Full Name",
    "email": "email@example.com",
    "phone": "Phone number or empty string",
    "website": "portfolio/linkedin url or empty string",
    "location": "City, Country or empty string",
    "summary": "Professional executive summary"
  },
  "skills": ["Skill 1", "Skill 2", ...],
  "experience": [
    {
      "company": "Company Name",
      "position": "Job Title",
      "startDate": "Month Year or Year",
      "endDate": "Month Year / Present",
      "current": true/false,
      "description": "Describe roles, duties and achievements (use complete sentences or bullet points)",
      "location": "City, Country or empty string"
    }
  ],
  "education": [
    {
      "school": "University/Institution Name",
      "degree": "Degree (e.g. BS, MS)",
      "fieldOfStudy": "Major/Field of Study",
      "startDate": "Year",
      "endDate": "Year",
      "current": true/false,
      "gpa": "GPA or empty string",
      "location": "City, Country or empty string"
    }
  ],
  "projects": [
    {
      "title": "Project Title",
      "description": "Details about project accomplishments",
      "technologies": ["Tech 1", "Tech 2", ...],
      "link": "Project URL or empty string"
    }
  ]
}
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const parsedJson = JSON.parse(response.text);
    return parsedJson;
  } catch (error) {
    console.error('Error in parseResumeWithAI:', error);
    return getMockParsedResume(rawText);
  }
};

/**
 * Conducts a complete ATS Audit, identifying lacking skills, strengths (gaining), and direct additions needed.
 */
const analyzeResumeWithAI = async (resumeData) => {
  const ai = getAiClient();

  if (!ai) {
    return getMockAnalysis(resumeData);
  }

  try {
    const prompt = `
You are an expert Executive Recruiter and ATS (Applicant Tracking System) Auditor.
Analyze the structured resume data provided below and conduct a detailed ATS evaluation.

Structured Resume:
${JSON.stringify(resumeData, null, 2)}

Provide actionable insights regarding:
1. Gaining (Strengths): Things they are doing right, well-phrased experiences, strong skills.
2. Lacking (Gaps): Industry-critical keywords or skills missing from the resume.
3. Where to Add: High, Medium, or Low priority improvements showing exactly which sections need what updates.
4. ATS Score: A score from 0 to 100 based on keyword density, standard sections, impact verb usage, and depth.

You MUST return ONLY a valid JSON object matching the following structure:
{
  "atsScore": 78,
  "breakdown": {
    "keywordMatch": 80,
    "formatting": 85,
    "impact": 70,
    "experienceDepth": 75
  },
  "gaining": [
    "Strong summary showcasing core experience",
    "Solid technical skill set listed clearly",
    ...
  ],
  "lacking": [
    "Missing core CI/CD pipelines tools like Docker/Kubernetes",
    "Lacks cloud platform certifications (AWS/Azure)",
    ...
  ],
  "whereToAdd": [
    {
      "section": "Professional Experience",
      "feedback": "Several bullet points lack quantifiable metrics (e.g. percentages, money saved, hours freed).",
      "priority": "High",
      "suggestion": "Rewrite experience bullets to follow the Google X-Y-Z formula: 'Accomplished [X] as measured by [Y], by doing [Z]'."
    },
    {
      "section": "Projects",
      "feedback": "Project descriptions do not mention how the technologies were utilized.",
      "priority": "Medium",
      "suggestion": "Add brief, impact-focused sentences explaining why React, Node, or specific databases were chosen."
    }
  ],
  "recommendedKeywords": ["Docker", "Kubernetes", "AWS Cloud", "Agile Integration"]
}
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    return JSON.parse(response.text);
  } catch (error) {
    console.error('Error in analyzeResumeWithAI:', error);
    return getMockAnalysis(resumeData);
  }
};

/**
 * Optimizes a weak bullet point into a strong metric-oriented achievement.
 */
const rewriteBulletWithAI = async (bulletText, jobTitle) => {
  const ai = getAiClient();

  if (!ai) {
    return {
      original: bulletText,
      suggestions: [
        `Re-engineered core modular workflows as a ${jobTitle || 'Specialist'}, boosting load efficiencies by 35% and trimming server costs by $12K annually.`,
        `Led the development of key components, reducing user click latency by 45% using advanced indexing algorithms.`,
        `Collaborated with cross-functional teams to automate integration deployments, cutting delivery turnaround time by 3 days.`
      ]
    };
  }

  try {
    const prompt = `
You are a career development expert. Optimize this weak resume bullet point into highly impactful, metric-driven achievements.
Job Title: ${jobTitle || 'Professional'}
Original Bullet: "${bulletText}"

You MUST return ONLY a valid JSON object matching the following structure:
{
  "original": "${bulletText}",
  "suggestions": [
    "Quantified achievement 1 starting with strong action verb",
    "Quantified achievement 2 showcasing alternative metric focus",
    "Quantified achievement 3 highlighting team leadership or coordination"
  ]
}
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    return JSON.parse(response.text);
  } catch (error) {
    console.error('Error in rewriteBulletWithAI:', error);
    return {
      original: bulletText,
      suggestions: [
        `Re-engineered core modular workflows, boosting load efficiencies by 35%.`,
        `Led development of key components, reducing click latency by 45%.`,
        `Automated integrations, cutting delivery turnaround time by 3 days.`
      ]
    };
  }
};

/**
 * Compares resume structure with target Job Description to identify overlap, gaps, and an educational learning roadmap.
 */
const analyzeSkillGapWithAI = async (resumeData, targetJD) => {
  const ai = getAiClient();

  if (!ai) {
    return getMockSkillGap(resumeData, targetJD);
  }

  try {
    const prompt = `
You are an expert technical interviewer and recruiter.
Analyze the user's resume data against the target Job Description (JD). Identify matching proficiencies, critical gaps, and map out a structured learning curriculum.

Resume:
${JSON.stringify(resumeData, null, 2)}

Target Job Description:
"""
${targetJD}
"""

You MUST return ONLY a valid JSON object matching the following structure:
{
  "matchPercentage": 65,
  "overlappingSkills": ["React", "CSS", "JavaScript"],
  "missingSkills": ["TypeScript", "GraphQL", "Docker"],
  "gapAnalysis": "The candidate has a solid foundational front-end understanding, but lags in modern typed structures (TypeScript) and orchestration/deployment tools required for this senior tier.",
  "learningRoadmap": [
    {
      "topic": "TypeScript Core Foundations",
      "duration": "1 week",
      "resources": "TypeScript Official Docs, freeCodeCamp Advanced TS course",
      "actionItem": "Convert a standard React component into a fully typed TS component with custom prop types."
    },
    {
      "topic": "Docker Containers & Microservices",
      "duration": "2 weeks",
      "resources": "Docker Crash Course by Traversy Media, Docker Labs",
      "actionItem": "Write a multi-stage Dockerfile for a React-Node full-stack application and host it locally."
    }
  ]
}
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    return JSON.parse(response.text);
  } catch (error) {
    console.error('Error in analyzeSkillGapWithAI:', error);
    return getMockSkillGap(resumeData, targetJD);
  }
};

/**
 * Matches user profile against available corporate listings.
 */
const recommendJobsWithAI = async (resumeData, jobsList) => {
  const ai = getAiClient();

  if (!ai) {
    return jobsList.map(job => {
      const isTechMatch = resumeData.skills.some(skill => {
        const cleanSkill = skill.toLowerCase().replace(/\.js$/, ''); // "react.js" -> "react", "node.js" -> "node"
        return job.description.toLowerCase().includes(cleanSkill) ||
          job.requirements.some(req => req.toLowerCase().includes(cleanSkill));
      });
      const matchScore = isTechMatch ? Math.floor(Math.random() * 20) + 75 : Math.floor(Math.random() * 30) + 40;
      return {
        jobId: job._id,
        matchPercentage: matchScore,
        feedback: matchScore > 75 
          ? `Excellent match! Your skill set closely aligns with their tech stack (especially in ${resumeData.skills.slice(0, 3).join(', ')}).`
          : `Moderate match. Consider adding more details regarding project building and structural tools matching their requirements.`
      };
    });
  }

  try {
    const prompt = `
You are an AI Job Matching engine.
Analyze this user's resume data and compare it against the following database job listings. Output a match percentage (0 to 100) and brief, highly specific feedback for every single job.

Resume Data:
${JSON.stringify(resumeData, null, 2)}

Job Listings:
${JSON.stringify(jobsList, null, 2)}

You MUST return ONLY a valid JSON array matching the following structure:
[
  {
    "jobId": "Job database ID string",
    "matchPercentage": 85,
    "feedback": "Short specific reason why they match or what they lack"
  },
  ...
]
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    return JSON.parse(response.text);
  } catch (error) {
    console.error('Error in recommendJobsWithAI:', error);
    // fallback to mock matchers
    return jobsList.map(job => ({
      jobId: job._id,
      matchPercentage: 70,
      feedback: "Decent match. Highlights strong structural frameworks but can expand on cloud deployments."
    }));
  }
};

/**
 * Generates highly personalized outreach scripts (recruiter email and LinkedIn message)
 * based on the user's resume data and the target job description.
 */
const generateColdOutreachWithAI = async (resumeData, jobTitle, companyName, jobDescription) => {
  const ai = getAiClient();

  if (!ai) {
    return getMockColdOutreach(resumeData, jobTitle, companyName, jobDescription);
  }

  try {
    const prompt = `
You are an expert career coach and networking expert.
Generate highly personalized, high-converting outreach scripts (one cold email for recruiters/hiring managers, and one LinkedIn connection request message) based on the candidate's resume and the target role details.

Candidate Resume Data:
${JSON.stringify(resumeData, null, 2)}

Target Role: ${jobTitle || 'Software Engineer'}
Company: ${companyName || 'Target Company'}
Job Description:
"""
${jobDescription || ''}
"""

Guidelines:
1. **Recruiter Cold Email**:
   - Compelling, short subject line.
   - Hook them immediately, mentioning interest in the ${jobTitle} role at ${companyName}.
   - Specifically call out 2-3 of the candidate's core matching skills/projects from their resume that align with the role.
   - Keep it concise, engaging, and professional. Add a clear call-to-action (e.g., "brief 10-minute chat").
2. **LinkedIn Invite Note**:
   - STRICT LIMIT: Must be under 300 characters (LinkedIn limit).
   - Highly conversational, friendly, and non-spammy.
   - Propose connecting and briefly state mutual interest (e.g., "loved your company's latest launch" or "saw your team is building with X").

You MUST return ONLY a valid JSON object matching the following structure:
{
  "email": "Subject: [Compelling Subject]\\n\\nDear Hiring Team,\\n\\n[Email Body]",
  "linkedin": "[LinkedIn Note Under 300 Characters]"
}
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    return JSON.parse(response.text);
  } catch (error) {
    console.error('Error in generateColdOutreachWithAI:', error);
    return getMockColdOutreach(resumeData, jobTitle, companyName, jobDescription);
  }
};

// ==========================================
// HIGH-FIDELITY MOCK FALLBACK FUNCTIONS
// ==========================================

function getMockParsedResume(rawText) {
  const text = rawText ? rawText.toLowerCase() : '';
  const skills = [];
  
  // 1. Healthcare / Nursing category keywords
  const healthcareKeywords = ['nurse', 'nursing', 'patient', 'clinical', 'hospital', 'medical', 'cpr', 'healthcare', 'therapy'];
  let healthcareMatchCount = 0;
  healthcareKeywords.forEach(kw => { if (text.includes(kw)) healthcareMatchCount++; });
  
  // 2. Business / Accounting / Marketing category keywords
  const businessKeywords = ['finance', 'accounting', 'marketing', 'sales', 'audit', 'tax', 'budget', 'client', 'ledger', 'business'];
  let businessMatchCount = 0;
  businessKeywords.forEach(kw => { if (text.includes(kw)) businessMatchCount++; });

  // 3. Education / Teaching category keywords
  const educationKeywords = ['teacher', 'teaching', 'school', 'classroom', 'student', 'lesson', 'curriculum', 'education'];
  let educationMatchCount = 0;
  educationKeywords.forEach(kw => { if (text.includes(kw)) educationMatchCount++; });

  // 4. IT / Software Engineering category keywords
  const techKeywords = ['react', 'node', 'express', 'mongodb', 'javascript', 'html', 'css', 'typescript', 'python', 'java', 'sql', 'aws', 'docker', 'git', 'tailwindcss', 'redux', 'graphql', 'software', 'developer'];
  let techMatchCount = 0;
  techKeywords.forEach(kw => { if (text.includes(kw)) techMatchCount++; });

  // Determine highest matching category to adapt dynamically
  const maxMatch = Math.max(healthcareMatchCount, businessMatchCount, educationMatchCount, techMatchCount);

  if (maxMatch > 0) {
    if (maxMatch === healthcareMatchCount) {
      skills.push('Patient Care', 'Clinical Charting', 'CPR / First Aid', 'Healthcare Administration', 'Electronic Health Records (EHR)', 'Patient Advocacy');
    } else if (maxMatch === businessMatchCount) {
      skills.push('Financial Auditing', 'GAAP Compliance', 'Budget Management', 'Client Relations', 'Strategic Marketing', 'Project Management');
    } else if (maxMatch === educationMatchCount) {
      skills.push('Lesson Planning', 'Classroom Management', 'Student Assessment', 'Curriculum Design', 'Differentiated Instruction', 'Parent-Teacher Relations');
    } else {
      techKeywords.forEach(kw => {
        if (text.includes(kw) && kw !== 'software' && kw !== 'developer') {
          skills.push(kw === 'react' ? 'React.js' : kw === 'node' ? 'Node.js' : kw === 'mongodb' ? 'MongoDB' : kw.charAt(0).toUpperCase() + kw.slice(1));
        }
      });
    }
  }

  // Fallback defaults
  if (skills.length === 0) {
    skills.push('React.js', 'Node.js', 'Express.js', 'MongoDB', 'JavaScript', 'Tailwind CSS');
  }

  // Extract name/email if possible
  let parsedName = 'Job Seeker';
  const nameMatch = rawText ? rawText.match(/^([A-Z][a-z]+)\s+([A-Z][a-z]+)/) : null;
  if (nameMatch) {
    parsedName = `${nameMatch[1]} ${nameMatch[2]}`;
  }

  let parsedEmail = 'developer@example.com';
  const emailMatch = rawText ? rawText.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/) : null;
  if (emailMatch) {
    parsedEmail = emailMatch[1];
  }

  return {
    personalInfo: {
      name: parsedName,
      email: parsedEmail,
      phone: '+1 (555) 019-2834',
      website: 'github.com/developer-portfolio',
      location: 'New York, NY',
      summary: 'Passionate and results-driven professional with extensive experience in core discipline competencies, optimizing operational execution patterns, and building responsive client solutions.'
    },
    skills: skills,
    experience: [
      {
        company: 'Innovate Solutions Inc.',
        position: 'Senior Specialist',
        startDate: 'June 2024',
        endDate: 'Present',
        current: true,
        description: 'Coordinated responsive workflows and team objectives. Managed operational interfaces, resulting in a 30% increase in productivity.',
        location: 'New York, NY'
      },
      {
        company: 'PixelForge Technologies',
        position: 'Junior Associate',
        startDate: 'September 2022',
        endDate: 'May 2024',
        current: false,
        description: 'Developed and optimized client-facing operational dashboards. Conducted comprehensive testing pipelines and maintained detailed documentation standards.',
        location: 'Boston, MA'
      }
    ],
    education: [
      {
        school: 'State Tech University',
        degree: 'Bachelor of Science',
        fieldOfStudy: 'Professional Studies',
        startDate: '2018',
        endDate: '2022',
        current: false,
        gpa: '3.7/4.0',
        location: 'Albany, NY'
      }
    ],
    projects: [
      {
        title: 'Operations Sync Framework',
        description: 'Full-featured online tracking portal equipped with custom integrations, workflow management dashboards, and state-managed metrics.',
        technologies: skills.slice(0, 3),
        link: 'github.com/developer/sync-framework'
      }
    ]
  };
}

function getMockAnalysis(resumeData) {
  const skillsCount = resumeData.skills ? resumeData.skills.length : 5;
  const expCount = resumeData.experience ? resumeData.experience.length : 1;
  
  // Calculate a reasonable mock score based on data quality
  let score = 55;
  score += skillsCount > 8 ? 15 : skillsCount * 1.5;
  score += expCount >= 2 ? 15 : expCount * 5;
  if (resumeData.personalInfo && resumeData.personalInfo.summary) score += 10;
  if (resumeData.projects && resumeData.projects.length >= 1) score += 5;
  
  score = Math.min(score, 98); // cap at 98
  
  const hasDocker = resumeData.skills.some(s => s.toLowerCase() === 'docker');
  const hasCloud = resumeData.skills.some(s => ['aws', 'cloud', 'azure', 'gcp'].includes(s.toLowerCase()));

  const lacking = [];
  const recommendedKeywords = [];
  
  if (!hasDocker) {
    lacking.push('Missing container orchestration tools (e.g. Docker, Kubernetes)');
    recommendedKeywords.push('Docker', 'Kubernetes');
  }
  if (!hasCloud) {
    lacking.push('Lacks cloud platform certifications or hands-on experience (AWS, Azure, GCP)');
    recommendedKeywords.push('AWS (EC2/S3)', 'CI/CD Pipelines');
  }
  if (resumeData.skills.length < 10) {
    lacking.push('Technical keywords concentration is low. Target more domain-specific languages.');
    recommendedKeywords.push('TypeScript', 'GraphQL');
  }

  const gaining = [
    'Excellent formatting with logical sections and layout indicators.',
    'Clear and concise contact details provided in personal schema.',
    `Strong technical core with proficiency in ${resumeData.skills.slice(0, 4).join(', ')}.`
  ];

  const whereToAdd = [
    {
      section: 'Professional Experience',
      feedback: 'Your experience description items are somewhat task-oriented rather than metric-driven.',
      priority: 'High',
      suggestion: 'Rewrite sentences to focus on outcomes. Example: Instead of "built features," write "Coordinated development of 4 key core modules, resulting in a 20% increase in daily active user engagements."'
    }
  ];

  if (!resumeData.projects || resumeData.projects.length === 0) {
    whereToAdd.push({
      section: 'Projects',
      feedback: 'No dedicated personal projects section was found.',
      priority: 'High',
      suggestion: 'Add 2-3 specific portfolio projects using modern technologies to demonstrate execution capability.'
    });
  } else {
    whereToAdd.push({
      section: 'Skills',
      feedback: 'Skills are lumped together into a single plain list.',
      priority: 'Medium',
      suggestion: 'Categorize your skills into sections such as "Languages", "Frameworks", and "Developer Tools" to improve readability.'
    });
  }

  return {
    atsScore: Math.round(score),
    breakdown: {
      keywordMatch: Math.min(Math.round(score * 0.95), 100),
      formatting: 90,
      impact: Math.min(Math.round(score * 0.85), 100),
      experienceDepth: Math.min(Math.round(score * 0.9), 100)
    },
    gaining: gaining,
    lacking: lacking.length > 0 ? lacking : ['No major missing skills identified! Excellent profile.'],
    whereToAdd: whereToAdd,
    recommendedKeywords: recommendedKeywords.length > 0 ? recommendedKeywords : ['Serverless Architecture', 'Microservices', 'GraphQL']
  };
}

function getMockSkillGap(resumeData, targetJD) {
  const jdText = targetJD.toLowerCase();
  
  // Match overlap
  const overlapping = [];
  const missing = [];
  
  // List of standard skills to cross check
  const checkList = ['react', 'node', 'express', 'mongodb', 'typescript', 'docker', 'kubernetes', 'aws', 'python', 'java', 'sql', 'graphql', 'next.js', 'tailwindcss', 'redux', 'git'];
  
  checkList.forEach(skill => {
    const isJdSkill = jdText.includes(skill);
    const hasResumeSkill = resumeData.skills.some(s => {
      const sLower = s.toLowerCase().replace(/\.js$/, ''); // "react.js" -> "react"
      return sLower === skill || sLower.includes(skill) || skill.includes(sLower);
    });
    
    if (isJdSkill) {
      const displayName = skill === 'react' ? 'React.js' : skill === 'node' ? 'Node.js' : skill === 'mongodb' ? 'MongoDB' : skill.charAt(0).toUpperCase() + skill.slice(1);
      if (hasResumeSkill) {
        overlapping.push(displayName);
      } else {
        missing.push(displayName);
      }
    }
  });

  // Default fallbacks if empty
  if (overlapping.length === 0) overlapping.push('JavaScript', 'CSS', 'HTML');
  if (missing.length === 0) missing.push('TypeScript', 'Docker', 'AWS Integration');

  const matchPercent = Math.min(Math.max(Math.round((overlapping.length / (overlapping.length + missing.length)) * 100), 45), 95);

  return {
    matchPercentage: matchPercent,
    overlappingSkills: overlapping,
    missingSkills: missing,
    gapAnalysis: `The target role demands specialized exposure in: ${missing.join(', ')}. While your resume shows strong core qualifications in ${overlapping.slice(0, 3).join(', ')}, optimizing your resume to highlight these missing tools is highly recommended.`,
    learningRoadmap: missing.map((skill, index) => {
      const resources = skill === 'TypeScript' ? 'TypeScript Deep Dive, Official Documentation' : skill === 'Docker' ? 'Docker Mastery by Bret Fisher, Docker docs' : 'FreeCodeCamp & Tech Tutorials';
      return {
        topic: `${skill} Integration & Mastery`,
        duration: index === 0 ? '1 week' : `${index + 1} weeks`,
        resources: resources,
        actionItem: `Build a small scale application integrating ${skill} and push the code to GitHub, showing deep usage.`
      };
    })
  };
}

function getMockColdOutreach(resumeData, jobTitle, companyName, jobDescription) {
  const candidateName = resumeData.personalInfo ? resumeData.personalInfo.name : 'Job Seeker';
  const role = jobTitle || 'Software Engineer';
  const company = companyName || 'InnovateTech Labs';
  const skillsList = resumeData.skills ? resumeData.skills.slice(0, 3).join(', ') : 'React, Node, Express';

  const mockEmail = `Subject: Passionate ${role} Candidate - ${candidateName}

Dear Hiring Team at ${company},

I hope this email finds you well. 

I recently saw your opening for the ${role} position and felt compelled to reach out. As a professional with hands-on experience in ${skillsList}, I am passionate about constructing robust systems and user experiences that align perfectly with ${company}'s forward-thinking product goals.

In my recent experience, I've designed responsive modules and optimized backend REST API delivery by 18%, saving development time and improving user latency. I would love to bring these core execution capabilities to your team.

I have attached my resume for your review. Would you be open to a brief 10-minute introductory call next Tuesday to discuss how my skill set can support your engineering objectives?

Thank you for your time and consideration.

Warm regards,

${candidateName}
${resumeData.personalInfo ? resumeData.personalInfo.email : 'user@example.com'}
${resumeData.personalInfo ? resumeData.personalInfo.phone : ''}`;

  const mockLinkedin = `Hi! I saw you manage recruitment at ${company}. As a developer experienced in ${skillsList}, I admire your team's engineering work. I'd love to connect and keep in touch regarding the ${role} opening or future collaborations. Best, ${candidateName.split(' ')[0]}`;

  return {
    email: mockEmail,
    linkedin: mockLinkedin
  };
}

/**
 * Generates 5 tailored technical & behavioral interview questions based on the candidate's active skills.
 */
const generateInterviewQuestionsWithAI = async (resumeData, targetRole) => {
  const ai = getAiClient();

  if (!ai) {
    return getMockInterviewQuestions(resumeData, targetRole);
  }

  try {
    const prompt = `
You are an expert technical interviewer and recruiter.
Analyze the user's resume data and generate 5 highly specific, challenging interview questions tailored to the candidate for a ${targetRole || 'Software Engineer'} role.
Provide:
- 2 Technical Questions: digging deep into specific skills or projects listed.
- 2 Behavioral Questions: evaluating situations, conflict resolution, or team leadership.
- 1 Situational / Architectural Question: checking system designs or standard workspace challenges.

Candidate Resume Data:
${JSON.stringify(resumeData, null, 2)}

You MUST return ONLY a valid JSON array matching the following structure:
[
  {
    "id": 1,
    "category": "Technical",
    "question": "Question text here focusing on their specific experience (e.g. React hooks, Express endpoints, or MongoDB optimizations)."
  },
  ...
]
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    return JSON.parse(response.text);
  } catch (error) {
    console.error('Error in generateInterviewQuestionsWithAI:', error);
    return getMockInterviewQuestions(resumeData, targetRole);
  }
};

/**
 * Grades a user's answer to an interview question.
 */
const analyzeInterviewAnswerWithAI = async (resumeData, question, userAnswer, targetRole) => {
  const ai = getAiClient();

  if (!ai) {
    return getMockAnswerAnalysis(question, userAnswer);
  }

  try {
    const prompt = `
You are an expert technical interviewer and career coach.
Analyze the candidate's response to the interview question below for the role of ${targetRole || 'Software Engineer'}.
Evaluate their response and grade it. Highlight their strengths, identify structural or conceptual gaps, and provide a polished, high-impact "Model Answer" using the Google STAR formula (Situation, Task, Action, Result) incorporating skills from their resume.

Candidate Resume Data:
${JSON.stringify(resumeData, null, 2)}

Question: "${question}"
Candidate's Answer: "${userAnswer}"

You MUST return ONLY a valid JSON object matching the following structure:
{
  "rating": 78,
  "strengths": ["Clear articulation of the problem", "Demonstrated basic familiarity with specific APIs"],
  "gaps": ["Lacked concrete metrics or business impact", "Did not mention error handling or performance optimization in their React/Express flow"],
  "feedback": "Your answer covered the basics but was too task-oriented. Recruiters look for metrics, business value, and robust architectural patterns.",
  "modelAnswer": "Here is how you should answer using the STAR format: 'In my last project, I faced a situation where... I took the action of... which resulted in a 25% performance gain...'"
}
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    return JSON.parse(response.text);
  } catch (error) {
    console.error('Error in analyzeInterviewAnswerWithAI:', error);
    return getMockAnswerAnalysis(question, userAnswer);
  }
};

/**
 * Generates a high-quality Cover Letter & 30-second Elevator Pitch based on the active resume and job details.
 */
const generateCoverLetterWithAI = async (resumeData, jobTitle, companyName, jobDescription) => {
  const ai = getAiClient();

  if (!ai) {
    return getMockCoverLetter(resumeData, jobTitle, companyName, jobDescription);
  }

  try {
    const prompt = `
You are an expert career writer.
Generate a professionally-formatted, high-converting Cover Letter and a brief 30-second elevator pitch based on the candidate's resume and target job details.

Candidate Resume Data:
${JSON.stringify(resumeData, null, 2)}

Target Job: ${jobTitle || 'Software Engineer'}
Company: ${companyName || 'Target Company'}
Job Description:
"""
${jobDescription || ''}
"""

You MUST return ONLY a valid JSON object matching the following structure:
{
  "coverLetter": "Dear Hiring Team at [Company],\\n\\nI am writing to express my strong interest...\\n\\nSincerely,\\n[Name]",
  "elevatorPitch": "Hi, I'm [Name]. I'm a developer specializing in [Skills]. Recently, I built a [Project] that..."
}
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    return JSON.parse(response.text);
  } catch (error) {
    console.error('Error in generateCoverLetterWithAI:', error);
    return getMockCoverLetter(resumeData, jobTitle, companyName, jobDescription);
  }
};

function getMockInterviewQuestions(resumeData, targetRole) {
  const role = targetRole || 'Software Engineer';
  const skillsList = resumeData.skills && resumeData.skills.length > 0 ? resumeData.skills.slice(0, 4).join(', ') : 'React, Node, Express, MongoDB';
  return [
    {
      id: 1,
      category: 'Technical',
      question: `In your resume, you listed skills in ${skillsList}. Can you explain how you would design a scalable, secure REST API controller in Node.js to manage high traffic without crashing the server?`
    },
    {
      id: 2,
      category: 'Technical',
      question: 'Explain how you optimize frontend render cycles in a React application. How do hooks like useMemo or useCallback prevent performance bottlenecks, and when should you avoid them?'
    },
    {
      id: 3,
      category: 'Behavioral',
      question: `Describe a time at a previous company (like ${resumeData.experience?.[0]?.company || 'your last employer'}) where you had a disagreement with a product manager or team member regarding engineering design. How did you resolve it?`
    },
    {
      id: 4,
      category: 'Behavioral',
      question: 'Tell me about a complex technical problem you solved under tight constraints. What was your systematic debugging approach and what was the business outcome?'
    },
    {
      id: 5,
      category: 'Situational / Architectural',
      question: 'If our team is migrating client dashboards to support real-time websocket integrations, how would you structure the state synchronization layer between your Express server and the React UI?'
    }
  ];
}

function getMockAnswerAnalysis(question, userAnswer) {
  const ans = userAnswer ? userAnswer.toLowerCase() : '';
  let rating = 50;
  if (ans.length > 30) rating += 15;
  if (ans.length > 100) rating += 15;
  if (ans.includes('because') || ans.includes('example')) rating += 10;
  if (ans.includes('result') || ans.includes('%') || ans.includes('percent')) rating += 8;
  rating = Math.min(rating, 95);

  return {
    rating: Math.round(rating),
    strengths: [
      "Demonstrated basic familiarity with the core terminology.",
      "Provided an actual direct response instead of dodging the question.",
      userAnswer.length > 60 ? "Provided sufficient technical detail to begin an evaluation." : "Clear, direct introductory explanation."
    ],
    gaps: [
      !ans.includes('%') && "Lacks quantifiable metrics or business outcomes (e.g. time saved, latency reduced).",
      !ans.includes('star') && "Did not structure response following the formal STAR (Situation, Task, Action, Result) model.",
      userAnswer.length < 50 && "Answer is brief. Consider elaborating on technical design complexities and edge cases."
    ].filter(Boolean),
    feedback: "Your response covers the conceptual baseline, but technical interviewers expect highly specific evidence. Rewrite this response using the STAR formula to focus heavily on the 'Actions' you specifically drove and the 'Results' (quantifiable metrics) you delivered.",
    modelAnswer: `Here is a high-impact model answer using the STAR format:
"Situation: In my previous project, we faced critical performance lags during spike traffic periods which impacted checkout completions by 15%.
Task: As the leading developer, I was tasked with diagnosing the bottleneck and refactoring the API routing architecture.
Action: I implemented custom Redis caching layers across our high-read MongoDB collections, added compound indexing on query conditions, and converted React layouts to lazy-load elements.
Result: This optimized latency by 45%, decreased server CPU loads by 25%, and boosted conversion rates by 8% within two weeks."`
  };
}

function getMockCoverLetter(resumeData, jobTitle, companyName, jobDescription) {
  const name = resumeData.personalInfo ? resumeData.personalInfo.name : 'Premium Candidate';
  const email = resumeData.personalInfo ? resumeData.personalInfo.email : 'user@example.com';
  const phone = resumeData.personalInfo ? resumeData.personalInfo.phone : '+1 (555) 019-2834';
  const location = resumeData.personalInfo ? resumeData.personalInfo.location : 'San Francisco, CA';
  const company = companyName || 'InnovateTech Labs';
  const role = jobTitle || 'Software Engineer';
  const skillsList = resumeData.skills ? resumeData.skills.slice(0, 4).join(', ') : 'React, Node, Express, MongoDB';

  const mockLetter = `[Your Contact Details]
${name}
${email} | ${phone} | ${location}

[Date]
Hiring Team
${company}

Subject: Application for ${role} - ${name}

Dear Hiring Manager and Engineering Team at ${company},

I am writing to express my enthusiastic interest in the ${role} opening at ${company}. With my strong engineering foundation in modern web architectures and hands-on experience utilizing ${skillsList}, I am confident in my ability to immediately support your team's upcoming features and deployment goals.

Looking at your product goals, I appreciate ${company}'s dedication to scaling high-performance user interfaces and building secure database pipelines. In my recent roles, I collaborated closely with technical teams to construct responsive React interfaces and optimize Express API routes. This resulted in an 18% increase in API throughput and saved crucial server compute costs. I specialize in turning complex specs into clean, modular, and maintainable source code.

I would welcome the opportunity to discuss my qualifications with you in more detail. Thank you for your time, consideration, and the excellent work your team continues to build.

Sincerely,

${name}`;

  const mockPitch = `Hi! I'm ${name}, a Software Developer specializing in ${skillsList}. I have a passion for engineering highly interactive web apps and modular backend APIs. Recently, I've worked on optimizing system speeds, improving load times by 18%, and collaborating in Agile teams. I'm excited about the ${role} role at ${company} because I can bring my direct experience with full-stack optimization and help build high-quality web assets.`;

  return {
    coverLetter: mockLetter,
    elevatorPitch: mockPitch
  };
}

/**
 * Dynamic AI Chatbot system to answer resume-specific queries and doubts.
 */
const chatAboutResumeWithAI = async (resumeData, chatHistory, userMessage) => {
  const ai = getAiClient();

  if (!ai) {
    return getMockChatResponse(chatHistory, userMessage, resumeData);
  }

  try {
    const formattedHistory = (chatHistory || []).map(msg => `${msg.sender === 'user' ? 'User' : 'Mentor'}: "${msg.text}"`).join('\n');
    const prompt = `
You are an expert AI Career Mentor and Resume Coach. You are chatting with a user about their career goals and their active resume.
Cross-reference your suggestions directly with their timeline, skills, and projects. Provide actionable, supportive, and extremely concise coaching advice.

Candidate Resume Data:
${JSON.stringify(resumeData, null, 2)}

Conversation History so far:
${formattedHistory}

Candidate Message: "${userMessage}"

Generate your response in markdown format. Keep it concise, engaging, and professional.
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: prompt,
    });

    return response.text;
  } catch (error) {
    console.error('Error in chatAboutResumeWithAI:', error);
    return getMockChatResponse(chatHistory, userMessage, resumeData);
  }
};

/**
 * AI-generated professional matchmaking categorized by Core, Adjacent, and Stretch fits.
 */
const generateDynamicJobsWithAI = async (resumeData) => {
  const ai = getAiClient();

  if (!ai) {
    return getMockDynamicJobs(resumeData);
  }

  try {
    const prompt = `
You are a state-of-the-art AI Career Matchmaker and Pivot Coach.
Analyze the user's resume data and automatically detect their core profession (e.g. Software Engineer, Primary Teacher, Nurse, Business Analyst, etc.).
Based on their actual profession, compile exactly 4 dynamic job recommendations:
- 2 Core Placements (High Fit, 85-98% match): Direct jobs within their primary profession.
- 1 Adjacent Pivot (Medium Fit, 65-80% match): Jobs in a closely related field where their core skills transfer beautifully.
- 1 Stretch Leap (Skill Bridge, 45-60% match): Jobs in an alternative domain where a "small and unique skill" or specific detail from their resume acts as a bridge.

Structured Resume:
${JSON.stringify(resumeData, null, 2)}

Also, compile a single-sentence career coaching rationale explaining their matches. It MUST follow this specific template strictly:
"As per your profession as a [Detected Profession], you should try [Core/Adjacent Job] because of [A]. Furthermore, because of your small and unique [Skill Tag] skill, it can take you to [Stretch Job]."

You MUST return ONLY a valid JSON object matching the following structure:
{
  "coachingRationale": "The strict single-sentence rationale follows the template here.",
  "jobs": [
    {
      "title": "Job Title",
      "company": "Company Name",
      "location": "Location (City, State or Remote)",
      "salary": "$X - $Y range",
      "description": "Short description of the job duties and responsibilities customized specifically to why they fit.",
      "requirements": ["Skill 1", "Skill 2", ...],
      "matchPercentage": 92,
      "category": "Core Placement",
      "feedback": "Why they fit..."
    },
    ...
  ]
}
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    return JSON.parse(response.text);
  } catch (error) {
    console.error('Error in generateDynamicJobsWithAI:', error);
    return getMockDynamicJobs(resumeData);
  }
};

function getMockChatResponse(chatHistory, userMessage, resumeData) {
  const msg = userMessage ? userMessage.toLowerCase().trim() : '';
  const name = resumeData.personalInfo && resumeData.personalInfo.name && resumeData.personalInfo.name !== 'Job Seeker'
    ? resumeData.personalInfo.name 
    : 'Job Seeker';
  
  // 1. Extract resume details
  const skills = resumeData.skills && resumeData.skills.length > 0 ? resumeData.skills : ['Professional Communication', 'Project Coordination', 'Strategic Planning'];
  const skillsList = skills.slice(0, 4).join(', ');
  
  const experience = resumeData.experience && resumeData.experience.length > 0 ? resumeData.experience : [];
  const primaryCompany = experience.length > 0 ? experience[0].company : 'your previous role';
  const primaryPosition = experience.length > 0 ? experience[0].position : 'Specialist';
  const primaryDesc = experience.length > 0 ? experience[0].description : '';
  
  const projects = resumeData.projects && resumeData.projects.length > 0 ? resumeData.projects : [];
  const primaryProject = projects.length > 0 ? projects[0].title : '';
  const primaryProjectTech = projects.length > 0 && projects[0].technologies ? projects[0].technologies.join(', ') : '';

  // 2. Profession Detection
  let profession = 'Specialist';
  let primaryJob = 'Professional Specialist';
  let adjacentJob = 'Project Coordinator';
  let stretchJob = 'Operations Consultant';
  let learningRoadmapItems = [];
  let salaryRanges = '';

  const skillsString = skills.join(' ').toLowerCase();
  const rawText = resumeData.rawText ? resumeData.rawText.toLowerCase() : '';

  const isHealthcare = skillsString.includes('nurse') || skillsString.includes('clinical') || skillsString.includes('patient') || skillsString.includes('hospital') || rawText.includes('nurse') || rawText.includes('clinical') || rawText.includes('hospital') || rawText.includes('patient');
  const isEducation = skillsString.includes('teach') || skillsString.includes('school') || skillsString.includes('classroom') || skillsString.includes('lesson') || skillsString.includes('student') || rawText.includes('teacher') || rawText.includes('classroom') || rawText.includes('student') || rawText.includes('lesson');
  const isBusiness = skillsString.includes('audit') || skillsString.includes('finance') || skillsString.includes('marketing') || skillsString.includes('budget') || skillsString.includes('account') || rawText.includes('finance') || rawText.includes('marketing') || rawText.includes('budget') || rawText.includes('audit');
  
  if (isHealthcare) {
    profession = 'Healthcare Professional';
    primaryJob = 'Registered Nurse (RN) / Clinical Nurse';
    adjacentJob = 'Healthcare Operations Specialist';
    stretchJob = 'Medical Product Specialist / Clinical Informatics';
    learningRoadmapItems = [
      '**EHR System Administration**: Master electronic health record configurations.',
      '**Clinical Operations Telemetry**: Learn to track patient outcomes with modern analytical software.',
      '**Healthcare Quality Auditing**: Study compliance frameworks (e.g. HIPAA audit standards) to lead hospital teams.'
    ];
    salaryRanges = `* **Registered Nurse / Clinical Specialist:** $75,000 - $98,000 / year
* **Healthcare Operations Manager:** $92,000 - $115,000 / year
* **Clinical Informatics Specialist:** $105,000 - $130,000 / year`;
  } else if (isEducation) {
    profession = 'Educator / Teacher';
    primaryJob = 'Senior Primary School Teacher';
    adjacentJob = 'Academic Curriculum Coordinator';
    stretchJob = 'Instructional Designer / E-Learning Specialist';
    learningRoadmapItems = [
      '**E-Learning Technology Integrations (LMS)**: Learn standard platforms like Canvas, Moodle, and Blackboard.',
      '**Educational Curriculum Metrics**: Master data-driven student assessment analytics.',
      '**Corporate Instructional Design**: Study adult learning principles to build corporate training frameworks.'
    ];
    salaryRanges = `* **Senior Primary / Secondary Teacher:** $58,000 - $74,000 / year
* **Curriculum Developer / Coordinator:** $70,000 - $88,000 / year
* **Corporate Instructional Designer:** $85,000 - $110,000 / year`;
  } else if (isBusiness) {
    profession = 'Business & Operations Specialist';
    primaryJob = 'Business Operations Analyst';
    adjacentJob = 'Agile Project Manager / Scrum Master';
    stretchJob = 'Corporate Strategy & Planning Consultant';
    learningRoadmapItems = [
      '**Advanced Data Analytics (Power BI / Tableau)**: Learn to construct dynamic reporting dashboards.',
      '**Agile Scrum Master Certification**: Study sprint delivery frameworks to manage engineering alignments.',
      '**Financial Modelling & Forecasting**: Master operational budgeting methods.'
    ];
    salaryRanges = `* **Business Operations Analyst:** $72,000 - $90,000 / year
* **Agile Scrum Master / PM:** $88,000 - $112,000 / year
* **Strategy & Planning Consultant:** $105,000 - $135,000 / year`;
  } else {
    // Default to Tech/Software Developer
    profession = 'Technology Specialist (Software Developer)';
    primaryJob = 'Software Engineer / Full-Stack Developer';
    adjacentJob = 'Developer Advocate / Technical Product Owner';
    stretchJob = 'Cloud Solutions Architect';
    learningRoadmapItems = [
      '**TypeScript & Microservices**: Master strongly typed architectures standard in large tech teams.',
      '**Docker / Containers**: Learn multi-stage container builds to simplify deployment pipelines.',
      '**CI/CD Automation (GitHub Actions)**: Build automated release pipelines from commit to cloud.'
    ];
    salaryRanges = `* **Junior to Mid Full-Stack Engineer:** $85,000 - $115,000 / year
* **Senior Specialist Software Developer:** $120,000 - $155,000 / year
* **Solutions / Cloud Architect:** $145,000 - $190,000 / year`;
  }

  // 3. Keyword/Topic Match Logic
  // GREETINGS
  if (msg.match(/^(hi|hello|hey|hy|yo|greetings|good morning|good afternoon|good evening|sup)/i) || msg === 'hi' || msg === 'hy') {
    return `### 👋 Hello ${name}! 
    
Welcome back to your career session! I'm your global **AI Career Mentor** (simulated fallback engine).

As a talented **${profession}** specializing in **${skillsList}**, your profile shows great promise. 

**How can I help you today? Here are some topics we can explore:**
* 🎯 **Job Recommendations:** Ask *"Which jobs should I apply for?"*
* 📈 **Salary Outlook:** Ask *"What is the salary expectation for my roles?"*
* 💡 **Skills & Training:** Ask *"What skills should I learn next?"*
* 📝 **Resume Critique:** Ask *"Can you critique my professional summary?"*
* 📂 **Experience Audit:** Ask *"What feedback do you have on my experience?"*
  
Feel free to ask me any of the above or any general career question!`;
  }

  // JOBS / CAREER RECOMMENDATIONS
  if (msg.includes('job') || msg.includes('career') || msg.includes('recommend') || msg.includes('apply') || msg.includes('pivot') || msg.includes('role') || msg.includes('position') || msg.includes('work')) {
    return `### 🎯 Tailored Career Matchmaking for ${name}

Since you are a skilled **${profession}** with hands-on history at **${primaryCompany}**, here are the optimal career fits matching your current profile:

1. 🟢 **Core Placement (High Fit | 85-98% Match)**
   * **${primaryJob}**
   * *Rationale:* This role directly leverages your expert skills in **${skillsList}** and aligns with your background as **${primaryPosition}**.

2. 🟡 **Adjacent Pivot (Medium Fit | 65-80% Match)**
   * **${adjacentJob}**
   * *Rationale:* This pathway transfers your day-to-day coordination competencies into a highly structured environment where you can oversee team integrations.

3. 🔵 **Stretch Leap (Skill Bridge | 45-60% Match)**
   * **${stretchJob}**
   * *Rationale:* By leveraging a unique combinations of skills from your resume, you can bridge the gap into high-level consultations.

*Would you like me to draft a cover letter or elevator pitch for one of these positions?*`;
  }

  // SALARIES
  if (msg.includes('salary') || msg.includes('pay') || msg.includes('money') || msg.includes('earn') || msg.includes('compensation') || msg.includes('rate')) {
    return `### 💰 Salary Band Outlook for ${name}

Based on recent industry market reports for a **${profession}** specializing in **${skillsList}**, here are the typical compensation brackets:

${salaryRanges}

*Note: Your experience at **${primaryCompany}** and custom projects can position you at the upper percentile of these brackets. Optimizing your experience descriptions to show quantitative growth is the best way to leverage higher starting bids.*`;
  }

  // SUMMARY CRITIQUE
  if (msg.includes('critique') || msg.includes('rewrite') || msg.includes('summary') || msg.includes('objective') || msg.includes('headline') || msg.includes('bio')) {
    const currentSummary = resumeData.personalInfo && resumeData.personalInfo.summary 
      ? resumeData.personalInfo.summary 
      : '';
    
    let critiqueText = '';
    let suggestionText = '';

    if (currentSummary && currentSummary.trim() !== '') {
      critiqueText = `Your current summary is a solid foundation:
> *"${currentSummary}"*

However, technical recruiters expect **metric-oriented proof** rather than passive duty listings.`;
      
      suggestionText = `### 📝 Recommended Google STAR Formula Summary:
      
> *"Results-driven **${profession}** with proven expertise utilizing **${skillsList}**. Coordinated operational workflows at **${primaryCompany}** that boosted system latency throughput by 18%, resolved core service bottlenecks, and improved team delivery rates by 15% in Agile sprints."*`;
    } else {
      critiqueText = `I noticed you don't have a professional summary section in your active resume profile. Adding one is highly recommended to immediately hook hiring managers!`;
      
      suggestionText = `### 📝 Recommended Summary for your profile:
      
> *"Passionate and results-oriented **${profession}** with deep expertise in **${skillsList}**. Skilled at optimizing operational processes and managing key deliveries at **${primaryCompany}** to drive continuous growth and team performance in fast-paced environments."*`;
    }

    return `### 📝 Professional Summary Audit
    
${critiqueText}

${suggestionText}

*Would you like me to rewrite this for a specific target job description?*`;
  }

  // SKILLS & ROADMAP
  if (msg.includes('skill') || msg.includes('learn') || msg.includes('roadmap') || msg.includes('grow') || msg.includes('study') || msg.includes('course') || msg.includes('suggest')) {
    return `### 💡 Personalized Skills Roadmap for ${name}

Based on your active resume, you have strong core qualifications in **${skillsList}**. To unlock higher seniority roles and stand out to hiring managers, I recommend focusing on these training milestones:

1. ${learningRoadmapItems[0]}
2. ${learningRoadmapItems[1]}
3. ${learningRoadmapItems[2]}

*Would you like resources or tips on how to display these skills on your resume before you fully master them?*`;
  }

  // EXPERIENCE & PROJECTS
  if (msg.includes('experience') || msg.includes('project') || msg.includes('company') || msg.includes('history') || msg.includes('build')) {
    let expDetails = '';
    if (experience.length > 0) {
      expDetails += `* **${primaryPosition}** at **${primaryCompany}** (${experience[0].startDate} - ${experience[0].endDate}):
  > *"${primaryDesc || 'Coordinated team responsibilities and workflow integrations.'}"*`;
      if (experience.length > 1) {
        expDetails += `\n* **${experience[1].position}** at **${experience[1].company}** (${experience[1].startDate} - ${experience[1].endDate}):
  > *"${experience[1].description || 'Developed and maintained key operational assets.'}"*`;
      }
    } else {
      expDetails = `*No formal work experiences were found on your active profile. We should focus on adding internship or freelance records to showcase your practical skills!*`;
    }

    let projDetails = '';
    if (projects.length > 0) {
      projDetails += `* **${primaryProject}** (Built with: *${primaryProjectTech || 'Core Skills'}*):
  > *"${projects[0].description || 'Dynamic custom portal built to manage operational metrics.'}"*`;
    } else {
      projDetails = `*No personal portfolio projects were found. Adding at least one large-scale project demonstrating your skills in **${skills.slice(0, 2).join(' and ')}** is highly advised.*`;
    }

    return `### 📂 Resume Experience & Projects Audit for ${name}

Here is the parsed history I'm referencing for your coaching session:

#### 💼 Work History:
${expDetails}

#### 🛠️ Portfolio Projects:
${projDetails}

**Mentor Recommendations:**
* Your work description at **${primaryCompany}** can be significantly optimized. Let's rewrite it to focus on **quantifiable results** (e.g. money saved, hours freed, percent productivity increases) rather than tasks.
* Make sure your project **${primaryProject || 'portfolio item'}** is linked directly to your GitHub or live URL to give recruiters instant proof of your coding abilities!`;
  }

  // SEMANTIC OR GENERAL FALLBACK
  // Search for any skills matches in user message
  let matchedSkill = '';
  for (let s of skills) {
    if (msg.includes(s.toLowerCase())) {
      matchedSkill = s;
      break;
    }
  }

  if (matchedSkill) {
    return `### 💡 Insights on your skill in: ${matchedSkill}

I noticed you asked or mentioned **${matchedSkill}**. Your resume shows direct hands-on proficiency in **${matchedSkill}**, which you've utilized during your career (such as at **${primaryCompany}**).

**Recruiting Tip for ${matchedSkill}:**
When interviewing, don't just list **${matchedSkill}** as a keyword. Frame it as a solution:
> *"At my previous role, we had a bottleneck in our operations. I utilized **${matchedSkill}** to restructure our processes, which successfully reduced bottleneck delay by 18% and improved our delivery."*

Would you like me to help you brainstorm a specific interview story focusing on how you used **${matchedSkill}**?`;
  }

  // Absolute generic fallback, but still highly personalized
  return `### 👋 Career Coach Consultation for ${name}

That is an interesting question! As an expert **${profession}**, approaching this strategic decision requires looking at how we market your experience at **${primaryCompany}** and your key skills in **${skillsList}**.

Because I am operating in offline simulated mode (while we rest the Gemini API quotas), let's dive into some specific actions:
* To look at job listings matching your skills, type: **"Which jobs fit my resume?"**
* To audit your summary and get a professional rewrite, type: **"Critique my resume summary"**
* To identify high-value skills to learn next, type: **"What skills should I learn?"**
* Or tell me: What specific goal or role are you preparing for next? Let's strategize together!`;
}

function getMockDynamicJobs(resumeData) {
  const rawText = resumeData.rawText ? resumeData.rawText.toLowerCase() : '';
  
  const healthcareKeywords = ['nurse', 'nursing', 'patient', 'clinical', 'hospital', 'medical', 'cpr', 'healthcare'];
  let healthcareMatchCount = 0;
  healthcareKeywords.forEach(kw => { if (rawText.includes(kw)) healthcareMatchCount++; });
  
  const educationKeywords = ['teacher', 'teaching', 'school', 'classroom', 'student', 'lesson', 'curriculum', 'education'];
  let educationMatchCount = 0;
  educationKeywords.forEach(kw => { if (rawText.includes(kw)) educationMatchCount++; });

  const techKeywords = ['react', 'node', 'express', 'mongodb', 'javascript', 'html', 'css', 'typescript', 'python', 'java', 'sql', 'aws', 'docker', 'git'];
  let techMatchCount = 0;
  techKeywords.forEach(kw => { if (rawText.includes(kw)) techMatchCount++; });

  const maxMatch = Math.max(healthcareMatchCount, educationMatchCount, techMatchCount);

  if (maxMatch > 0 && maxMatch === educationMatchCount) {
    return {
      coachingRationale: "As per your profession as an Educator, you should try Senior Primary School Teacher because of your classroom leadership. Furthermore, because of your small and unique Curriculum Design skill, it can take you to Instructional Designer.",
      jobs: [
        {
          title: "Senior Primary School Teacher",
          company: "Kendriya Vidyalaya Academy",
          location: "San Jose, CA (Hybrid)",
          salary: "$65,000 - $80,000",
          description: "Seeking an experienced educator to lead active classes, implement modern lessons, and coordinate student evaluations. You are an excellent fit because of your direct classroom management background.",
          requirements: ["Classroom Management", "Lesson Planning", "Differentiated Instruction"],
          matchPercentage: 94,
          category: "Core Placement",
          feedback: "Perfect direct fit for your teaching timeline."
        },
        {
          title: "Bilingual Learning Facilitator",
          company: "Global Literacy Hub",
          location: "Remote",
          salary: "$55,000 - $70,000",
          description: "Coordinate interactive online classes for students globally. Direct fit leveraging your educational background and supportive learning styles.",
          requirements: ["Online Instruction", "Bilingual Literacy", "Student Assessment"],
          matchPercentage: 88,
          category: "Core Placement",
          feedback: "Direct instructional role mapping to your core teaching values."
        },
        {
          title: "Corporate Trainer",
          company: "Nexus Enterprises",
          location: "New York, NY (Hybrid)",
          salary: "$85,000 - $105,000",
          description: "Pivot your pedagogical skills to coordinate employee onboarding pipelines, design business manuals, and coach corporate divisions.",
          requirements: ["Adult Learning", "Public Speaking", "Instructional Systems"],
          matchPercentage: 76,
          category: "Adjacent Pivot",
          feedback: "Great pivot to corporate training utilizing classroom delivery expertise."
        },
        {
          title: "Instructional Designer",
          company: "SkillForge E-Learning",
          location: "Remote",
          salary: "$90,000 - $115,000",
          description: "Use your curriculum building skills to construct digital learning portals, design course flows, and script video content. Your unique curriculum layout skill acts as the bridge here.",
          requirements: ["E-Learning Layouts", "Curriculum Design", "SaaS Portals"],
          matchPercentage: 58,
          category: "Stretch Leap",
          feedback: "Stretch leap utilizing curriculum building to transition to tech e-learning."
        }
      ]
    };
  } else if (maxMatch > 0 && maxMatch === healthcareMatchCount) {
    return {
      coachingRationale: "As per your profession as a Clinical Nurse, you should try Clinical Nurse Specialist because of your hands-on patient charting. Furthermore, because of your small and unique Electronic Health Records (EHR) skill, it can take you to Healthcare IT Consultant.",
      jobs: [
        {
          title: "Clinical Nurse Specialist",
          company: "Saint Jude Medical Center",
          location: "Boston, MA",
          salary: "$95,000 - $120,000",
          description: "Seeking a dedicated clinical nurse to oversee patient diagnostic pipelines, charting operations, and support triage divisions. Your direct hospital experience makes you a high-value candidate.",
          requirements: ["Clinical Triage", "Patient Charting", "CPR / First Aid"],
          matchPercentage: 95,
          category: "Core Placement",
          feedback: "Direct match for clinical medical charting expertise."
        },
        {
          title: "Healthcare Coordinator",
          company: "MediLife Wellness",
          location: "Remote",
          salary: "$70,000 - $85,000",
          description: "Coordinate telehealth logistics, manage outpatient schedules, and audit patient records. Direct fit matching your clinical workflow patterns.",
          requirements: ["Telehealth Operations", "Outpatient Scheduling", "Patient Advocacy"],
          matchPercentage: 86,
          category: "Core Placement",
          feedback: "Supportive clinical match perfect for remote telehealth coordination."
        },
        {
          title: "Pharmaceutical Clinical Auditor",
          company: "PharmaSync Labs",
          location: "New York, NY (Hybrid)",
          salary: "$110,000 - $130,000",
          description: "Pivot clinical skills to audit medicine delivery pipelines, check trial documentation standards, and ensure GAAP compliance.",
          requirements: ["Clinical Trial Auditing", "Compliance", "Data Management"],
          matchPercentage: 74,
          category: "Adjacent Pivot",
          feedback: "Excellent pivot from patient care to clinical database auditing."
        },
        {
          title: "Healthcare IT Consultant",
          company: "SecureMed Systems",
          location: "Remote",
          salary: "$120,000 - $145,000",
          description: "Help hospital groups deploy and optimize complex medical software. Your unique EHR database charting skill bridges you directly to healthcare software consulting.",
          requirements: ["EHR Systems", "Software Deployment", "Client Coaching"],
          matchPercentage: 55,
          category: "Stretch Leap",
          feedback: "Stretch leap into SaaS consulting using EHR software experience."
        }
      ]
    };
  } else {
    return {
      coachingRationale: "As per your profession as a Software Engineer, you should try React Full Stack Developer because of your responsive UI design. Furthermore, because of your small and unique API Optimization skill, it can take you to Technical Product Manager.",
      jobs: [
        {
          title: "React Full Stack Developer",
          company: "InnovateTech Labs",
          location: "San Francisco, CA (Hybrid)",
          salary: "$110,000 - $135,000",
          description: "We are seeking a Full Stack Developer to build modern SaaS components. Write React code, integrate Tailwind CSS, and set up REST API interfaces using Express and MongoDB. You are a high-value match because of your React/Node skills.",
          requirements: ["React.js", "Node.js", "Express.js", "MongoDB", "Tailwind CSS"],
          matchPercentage: 92,
          category: "Core Placement",
          feedback: "Excellent direct fit for your React and Node.js timeline."
        },
        {
          title: "Junior Web Specialist",
          company: "PixelForge Studio",
          location: "Boston, MA",
          salary: "$70,000 - $85,000",
          description: "Build client dashboards, design custom responsive CSS layouts, and maintain Express route structures. High-value match for your modern web skills.",
          requirements: ["JavaScript", "HTML5", "CSS3", "React.js", "Git"],
          matchPercentage: 86,
          category: "Core Placement",
          feedback: "Great junior match with extensive frontend layouts overlap."
        },
        {
          title: "DevOps Engineer (Cloud Platform Scale)",
          company: "SecureNet Systems",
          location: "Remote",
          salary: "$140,000 - $165,000",
          description: "Pivot your full-stack engineering skills to automate deployments, orchestrate container structures using Docker, and configure AWS networks.",
          requirements: ["Docker", "Kubernetes", "AWS (EC2/S3)", "CI/CD Pipelines"],
          matchPercentage: 72,
          category: "Adjacent Pivot",
          feedback: "Adjacent pivot to infrastructure automation utilizing backend container exposure."
        },
        {
          title: "Technical Product Manager",
          company: "SaaSify Solutions",
          location: "Remote",
          salary: "$150,000 - $175,000",
          description: "Bridge your coding skills to write technical specs, manage roadmap features, and coordinate cross-functional teams. Your unique API optimization and workflow coordination skills acts as the bridge here.",
          requirements: ["Technical Spec Writing", "Agile Sprints", "Client Consulting"],
          matchPercentage: 56,
          category: "Stretch Leap",
          feedback: "Stretch leap into product management utilizing backend routing designs to bridge the gap."
        }
      ]
    };
  }
}

module.exports = {
  parseResumeWithAI,
  analyzeResumeWithAI,
  rewriteBulletWithAI,
  analyzeSkillGapWithAI,
  recommendJobsWithAI,
  generateColdOutreachWithAI,
  generateInterviewQuestionsWithAI,
  analyzeInterviewAnswerWithAI,
  generateCoverLetterWithAI,
  chatAboutResumeWithAI,
  generateDynamicJobsWithAI
};
