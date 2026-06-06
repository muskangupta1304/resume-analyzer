const mongoose = require('mongoose');

const ApplicationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  company: {
    type: String,
    required: true,
  },
  salary: {
    type: String,
    default: 'Competitive',
  },
  stage: {
    type: String,
    enum: ['Wishlist', 'Applied', 'Interviewing', 'Offer', 'Closed'],
    default: 'Wishlist',
  },
  notes: {
    type: String,
    default: '',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Application', ApplicationSchema);
