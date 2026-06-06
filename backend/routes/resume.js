const express = require('express');
const multer = require('multer');
const { uploadResume, getResumes, getResumeById, updateResume, createResume } = require('../controllers/resumeController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Multer memory storage setting for file streams
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (
      file.mimetype === 'application/pdf' ||
      file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      file.mimetype === 'application/msword'
    ) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF and DOCX files are allowed!'), false);
    }
  }
});

router.post('/upload', protect, upload.single('resume'), uploadResume);
router.get('/', protect, getResumes);
router.post('/', protect, createResume);
router.get('/:id', protect, getResumeById);
router.put('/:id', protect, updateResume);

module.exports = router;
