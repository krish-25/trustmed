const mongoose = require('mongoose');

const recordSchema = new mongoose.Schema({
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
  date: { type: Date, default: Date.now },
  registration: {
    name: String,
    age: Number,
    gender: String,
    contact: String,
    address: String
  },
  consultation: {
    bp: String,
    spo2: String,
    temperature: String,
    hr: String,
    chiefComplaints: String,
    medicalHistory: String,
    allergies: String,
    examination: String,
    provisionalDiagnosis: String,
    treatment: String,
    followupDate: String
  },
  pdfFileName: String
}, { timestamps: true });

module.exports = mongoose.model('Record', recordSchema);