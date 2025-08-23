const express = require('express');
const router = express.Router();
const { addPatient, getPatients, getQueuedPatients,
  markPatientConsulted
 } = require('../controllers/patientController');

router.post('/', addPatient);
router.get('/', getPatients);

// Queue-specific routes
router.get('/queue', getQueuedPatients);
router.patch('/queue/:id/consulted', markPatientConsulted);


module.exports = router;