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