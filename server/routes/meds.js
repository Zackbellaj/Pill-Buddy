// routes/meds.js
const express = require('express');
const Medication = require('../models/Medication');
const { protect } = require('../middleware/auth');
const { validateMed } = require('../utils/validate');

const router = express.Router();

// Helper: get or create dose entry for today
const getOrCreateTodayDose = (med, today) => {
  let doseEntry = med.doses.find(d => d.date === today);
  if (!doseEntry) {
    doseEntry = {
      date: today,
      taken: { morning: false, afternoon: false, evening: false, night: false }
    };
    med.doses.push(doseEntry);
  }
  return doseEntry;
};

// @desc    Get all meds for user
// @route   GET /api/meds
router.get('/', protect, async (req, res) => {
  try {
    const meds = await Medication.find({ user: req.user.id });
    res.json(meds);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Create new med
// @route   POST /api/meds
router.post('/', protect, async (req, res) => {
  const { error } = validateMed(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });

  try {
    const med = new Medication({
      ...req.body,
      user: req.user.id
    });
    await med.save();
    res.status(201).json(med);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Update med
// @route   PUT /api/meds/:id
router.put('/:id', protect, async (req, res) => {
  const { error } = validateMed(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });

  try {
    const med = await Medication.findOne({ _id: req.params.id, user: req.user.id });
    if (!med) return res.status(404).json({ message: 'Medication not found' });

    Object.assign(med, req.body);
    await med.save();
    res.json(med);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Delete med
// @route   DELETE /api/meds/:id
router.delete('/:id', protect, async (req, res) => {
  try {
    const med = await Medication.findOne({ _id: req.params.id, user: req.user.id });
    if (!med) return res.status(404).json({ message: 'Medication not found' });

    await med.deleteOne();
    res.json({ message: 'Medication deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Toggle dose for today
// @route   POST /api/meds/:id/dose
router.post('/:id/dose', protect, async (req, res) => {
  const { timeSlot } = req.body; // "morning", "afternoon", etc.
  const validSlots = ['morning', 'afternoon', 'evening', 'night'];
  
  if (!validSlots.includes(timeSlot)) {
    return res.status(400).json({ message: 'Invalid time slot' });
  }

  try {
    const med = await Medication.findOne({ _id: req.params.id, user: req.user.id });
    if (!med) return res.status(404).json({ message: 'Medication not found' });

    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const doseEntry = getOrCreateTodayDose(med, today);

    // Toggle the dose
    doseEntry.taken[timeSlot] = !doseEntry.taken[timeSlot];

    await med.save();
    res.json(med);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Get a single med by ID
// @route   GET /api/meds/:id
router.get('/:id', protect, async (req, res) => {
  try {
    const med = await Medication.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (!med) {
      return res.status(404).json({ message: 'Medication not found' });
    }

    res.json(med);
  } catch (err) {
    console.error(err);
    if (err.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid ID format' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;