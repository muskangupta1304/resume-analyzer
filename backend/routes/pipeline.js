const express = require('express');
const { getApplications, createApplication, updateApplication, deleteApplication } = require('../controllers/pipelineController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.route('/')
  .get(protect, getApplications)
  .post(protect, createApplication);

router.route('/:id')
  .put(protect, updateApplication)
  .delete(protect, deleteApplication);

module.exports = router;
