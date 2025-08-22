const mongoose = require('mongoose');

const patientSchema = new mongoose.Schema({
  name: String,
  age: Number,
  gender: String,
  contact: String,
  address: String,
  bp: String,
  spo2: String,
  temperature: String,
  hr: String,
  status: { type: String, default: 'queued' }
}, { timestamps: true });

module.exports = mongoose.model('Patient', patientSchema);