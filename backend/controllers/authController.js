const User = require('../models/User');
const Resume = require('../models/Resume');
const jwt = require('jsonwebtoken');
const inMemoryStore = require('../config/inMemoryStore');

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

const getStarterResumeObject = (userId, name, email) => {
  return {
    _id: `mem-resume-${Date.now()}`,
    user: userId,
    fileName: 'Starter-ATS-Resume.pdf',
    rawText: `John Doe Resume. Software Engineer. Skills: React.js, Node.js, Express.js, MongoDB, JavaScript, HTML5, CSS3, Tailwind CSS, Git. Experience: Junior Web Developer at TechNexus. Education: BS Computer Science.`,
    personalInfo: {
      name: name,
      email: email,
      phone: '+1 (555) 019-2834',
      website: 'linkedin.com/in/johndoe-starter',
      location: 'San Francisco, CA',
      summary: 'Highly motivated Full-Stack Software Developer with a solid foundation in modern web architectures. Experienced in building responsive user interfaces, writing clean modular backend routes, and collaborating within Agile sprint cycles.'
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
  };
};

/**
 * @desc    Register a new user and assign a pre-filled ATS-friendly starter resume
 * @route   POST /api/auth/register
 * @access  Public
 */
const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // 1. IN-MEMORY PERSISTENT FALLBACK GATE
    if (process.env.USE_IN_MEMORY_DB === 'true') {
      const userExists = inMemoryStore.users.find(u => u.email === email);
      if (userExists) {
        return res.status(400).json({ success: false, message: 'User already exists' });
      }

      const mockUserId = `mem-user-${Date.now()}`;
      const mockUser = {
        _id: mockUserId,
        name,
        email,
        password
      };
      
      inMemoryStore.users.push(mockUser);
      inMemoryStore.saveUsers(); // Sync to local JSON
      
      const starterResume = getStarterResumeObject(mockUserId, name, email);
      inMemoryStore.resumes.push(starterResume);
      inMemoryStore.saveResumes(); // Sync to local JSON

      return res.status(201).json({
        success: true,
        _id: mockUserId,
        name: mockUser.name,
        email: mockUser.email,
        token: generateToken(mockUserId),
      });
    }

    // 2. MONGO OPERATIONS
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'User already exists' });
    }

    const user = await User.create({
      name,
      email,
      password,
    });

    if (user) {
      const starterResume = getStarterResumeObject(user._id, name, email);
      await Resume.create(starterResume);

      return res.status(201).json({
        success: true,
        _id: user._id,
        name: user.name,
        email: user.email,
        token: generateToken(user._id),
      });
    } else {
      return res.status(400).json({ success: false, message: 'Invalid user data received' });
    }
  } catch (error) {
    console.error('Registration Error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Authenticate user & get token
 * @route   POST /api/auth/login
 * @access  Public
 */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. IN-MEMORY PERSISTENT FALLBACK GATE
    if (process.env.USE_IN_MEMORY_DB === 'true') {
      const user = inMemoryStore.users.find(u => u.email === email);
      if (!user) {
        return res.status(401).json({ success: false, message: 'Invalid credentials' });
      }
      
      if (user.password !== password) {
        return res.status(401).json({ success: false, message: 'Invalid credentials' });
      }

      return res.json({
        success: true,
        _id: user._id,
        name: user.name,
        email: user.email,
        token: generateToken(user._id),
      });
    }

    // 2. MONGO OPERATIONS
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    return res.json({
      success: true,
      _id: user._id,
      name: user.name,
      email: user.email,
      token: generateToken(user._id),
    });
  } catch (error) {
    console.error('Login Error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Get current user profile details
 * @route   GET /api/auth/me
 * @access  Private
 */
const getMe = async (req, res) => {
  try {
    // 1. IN-MEMORY PERSISTENT FALLBACK GATE
    if (process.env.USE_IN_MEMORY_DB === 'true') {
      const user = inMemoryStore.users.find(u => u._id === req.user.id);
      return res.status(200).json({
        success: true,
        data: user
      });
    }

    // 2. MONGO OPERATIONS
    const user = await User.findById(req.user.id);
    return res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('GetMe Error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  register,
  login,
  getMe,
};
