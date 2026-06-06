const mongoose = require('mongoose');

const AnalysisSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  resume: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Resume',
    required: true,
  },
  atsScore: {
    type: Number,
    required: true,
  },
  breakdown: {
    keywordMatch: { type: Number, default: 0 },
    formatting: { type: Number, default: 0 },
    impact: { type: Number, default: 0 },
    experienceDepth: { type: Number, default: 0 },
  },
  gaining: [{ type: String }],
  lacking: [{ type: String }],
  whereToAdd: [
    {
      section: { type: String, default: '' },
      feedback: { type: String, default: '' },
      priority: { type: String, enum: ['High', 'Medium', 'Low'], default: 'Medium' },
      suggestion: { type: String, default: '' },
    },
  ],
  recommendedKeywords: [{ type: String }],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Analysis', AnalysisSchema);
