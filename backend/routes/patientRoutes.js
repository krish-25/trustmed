const express = require('express');
const router = express.Router();
const { addPatient, getPatients } = require('../controllers/patientController');

router.post('/', addPatient);
router.get('/', getPatients);

module.exports = router;