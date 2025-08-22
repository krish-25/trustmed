const Record = require('../models/Record');

exports.addRecord = async (req, res) => {
  try {
    const record = await Record.create(req.body);
    res.json(record);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getRecordsByPatient = async (req, res) => {
  try {
    const records = await Record.find({ patientId: req.params.patientId }).sort({ date: -1 });
    res.json(records);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};