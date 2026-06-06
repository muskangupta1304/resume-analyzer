const express = require('express');
const { getJobs, createJob } = require('../controllers/jobController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.get('/', protect, getJobs);
router.post('/', protect, createJob);

module.exports = router;
