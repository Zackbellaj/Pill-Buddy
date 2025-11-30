// models/Medication.js
const mongoose = require('mongoose');

const doseSchema = new mongoose.Schema({
  date: {
    type: String, // Format: YYYY-MM-DD
    required: true
  },
  taken: {
    morning: { type: Boolean, default: false },
    afternoon: { type: Boolean, default: false },
    evening: { type: Boolean, default: false },
    night: { type: Boolean, default: false }
  }
});

const medicationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  dosage: {
    type: String,
    trim: true
  },
  schedule: {
    morning: { type: Boolean, default: false },
    afternoon: { type: Boolean, default: false },
    evening: { type: Boolean, default: false },
    night: { type: Boolean, default: false }
  },
  doses: [doseSchema],
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Ensure one dose entry per date
medicationSchema.index({ user: 1, name: 1 });

module.exports = mongoose.model('Medication', medicationSchema);