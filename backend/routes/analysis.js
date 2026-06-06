const express = require('express');
const { 
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
} = require('../controllers/analysisController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.get('/', protect, getAnalyses);
router.post('/rewrite-bullet', protect, rewriteBulletPoint);
router.post('/outreach', protect, generateOutreach);
router.post('/interview/questions', protect, getInterviewQuestions);
router.post('/interview/feedback', protect, gradeInterviewAnswer);
router.post('/cover-letter', protect, generateCoverLetter);
router.post('/chat', protect, chatWithAI);
router.post('/recommendations', protect, getDynamicJobRecommendations);
router.post('/:resumeId', protect, analyzeResume);
router.get('/:id', protect, getAnalysisById);
router.post('/:resumeId/skill-gap', protect, getSkillGapReport);

module.exports = router;
