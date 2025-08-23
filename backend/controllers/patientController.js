const Patient = require('../models/Patient');

exports.addPatient = async (req, res) => {
  try {
    const patient = await Patient.create(req.body);
    res.json(patient);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getPatients = async (req, res) => {
  try {
    const patients = await Patient.find();
    res.json(patients);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get only queued patients
exports.getQueuedPatients = async (req, res) => {
  try {
    const patients = await Patient.find({ status: 'queued' }).sort({ createdAt: 1 });
    res.json(patients);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Mark patient as consulted (remove from queue)
exports.markPatientConsulted = async (req, res) => {
  try {
    const patient = await Patient.findByIdAndUpdate(
      req.params.id,
      { status: 'consulted' },
      { new: true }
    );
    res.json(patient);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};