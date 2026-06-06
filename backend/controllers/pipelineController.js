const Application = require('../models/Application');
const inMemoryStore = require('../config/inMemoryStore');

/**
 * @desc    Get all job applications in the pipeline
 * @route   GET /api/pipeline
 * @access  Private
 */
const getApplications = async (req, res) => {
  try {
    if (process.env.USE_IN_MEMORY_DB === 'true') {
      const userApps = inMemoryStore.applications.filter(app => app.user === req.user.id);
      return res.status(200).json({ success: true, count: userApps.length, data: userApps });
    }

    const apps = await Application.find({ user: req.user.id }).sort({ createdAt: -1 });
    return res.status(200).json({ success: true, count: apps.length, data: apps });
  } catch (error) {
    console.error('Get Applications Error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Track a new job application
 * @route   POST /api/pipeline
 * @access  Private
 */
const createApplication = async (req, res) => {
  try {
    const { title, company, salary, stage, notes } = req.body;
    if (!title || !company) {
      return res.status(400).json({ success: false, message: 'Please provide job title and company' });
    }

    if (process.env.USE_IN_MEMORY_DB === 'true') {
      const newApp = {
        _id: `mem-app-${Date.now()}`,
        user: req.user.id,
        title,
        company,
        salary: salary || 'Competitive',
        stage: stage || 'Wishlist',
        notes: notes || '',
        createdAt: new Date()
      };
      inMemoryStore.applications.push(newApp);
      inMemoryStore.saveApplications();

      return res.status(201).json({ success: true, data: newApp });
    }

    const app = await Application.create({
      user: req.user.id,
      title,
      company,
      salary,
      stage,
      notes,
    });

    return res.status(201).json({ success: true, data: app });
  } catch (error) {
    console.error('Create Application Error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Update application details or stage
 * @route   PUT /api/pipeline/:id
 * @access  Private
 */
const updateApplication = async (req, res) => {
  try {
    const { title, company, salary, stage, notes } = req.body;

    if (process.env.USE_IN_MEMORY_DB === 'true') {
      const index = inMemoryStore.applications.findIndex(app => app._id === req.params.id && app.user === req.user.id);
      if (index === -1) {
        return res.status(404).json({ success: false, message: 'Application card not found' });
      }

      const app = inMemoryStore.applications[index];
      if (title !== undefined) app.title = title;
      if (company !== undefined) app.company = company;
      if (salary !== undefined) app.salary = salary;
      if (stage !== undefined) app.stage = stage;
      if (notes !== undefined) app.notes = notes;

      inMemoryStore.saveApplications();
      return res.status(200).json({ success: true, data: app });
    }

    let app = await Application.findOne({ _id: req.params.id, user: req.user.id });
    if (!app) {
      return res.status(404).json({ success: false, message: 'Application card not found' });
    }

    app = await Application.findByIdAndUpdate(req.params.id, req.body, { new: true });
    return res.status(200).json({ success: true, data: app });
  } catch (error) {
    console.error('Update Application Error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Delete application card
 * @route   DELETE /api/pipeline/:id
 * @access  Private
 */
const deleteApplication = async (req, res) => {
  try {
    if (process.env.USE_IN_MEMORY_DB === 'true') {
      const initialLength = inMemoryStore.applications.length;
      inMemoryStore.applications = inMemoryStore.applications.filter(app => !(app._id === req.params.id && app.user === req.user.id));
      
      if (inMemoryStore.applications.length === initialLength) {
        return res.status(404).json({ success: false, message: 'Application card not found' });
      }

      inMemoryStore.saveApplications();
      return res.status(200).json({ success: true, message: 'Application removed successfully' });
    }

    const app = await Application.findOne({ _id: req.params.id, user: req.user.id });
    if (!app) {
      return res.status(404).json({ success: false, message: 'Application card not found' });
    }

    await Application.findByIdAndDelete(req.params.id);
    return res.status(200).json({ success: true, message: 'Application removed successfully' });
  } catch (error) {
    console.error('Delete Application Error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getApplications,
  createApplication,
  updateApplication,
  deleteApplication
};
