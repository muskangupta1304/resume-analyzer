const mongoose = require('mongoose');

const ResumeSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  fileName: {
    type: String,
    default: 'Interactive-Resume.pdf',
  },
  rawText: {
    type: String,
    default: '',
  },
  personalInfo: {
    name: { type: String, default: '' },
    email: { type: String, default: '' },
    phone: { type: String, default: '' },
    website: { type: String, default: '' },
    location: { type: String, default: '' },
    summary: { type: String, default: '' },
  },
  skills: [{ type: String }],
  experience: [
    {
      company: { type: String, default: '' },
      position: { type: String, default: '' },
      startDate: { type: String, default: '' },
      endDate: { type: String, default: '' },
      current: { type: Boolean, default: false },
      description: { type: String, default: '' },
      location: { type: String, default: '' },
    },
  ],
  education: [
    {
      school: { type: String, default: '' },
      degree: { type: String, default: '' },
      fieldOfStudy: { type: String, default: '' },
      startDate: { type: String, default: '' },
      endDate: { type: String, default: '' },
      current: { type: Boolean, default: false },
      gpa: { type: String, default: '' },
      location: { type: String, default: '' },
    },
  ],
  projects: [
    {
      title: { type: String, default: '' },
      description: { type: String, default: '' },
      technologies: [{ type: String }],
      link: { type: String, default: '' },
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Resume', ResumeSchema);
