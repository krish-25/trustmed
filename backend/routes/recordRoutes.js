const express = require('express');
const router = express.Router();
const { addRecord, getAllRecords, getRecordsByPatient } = require('../controllers/recordController');

router.post('/', addRecord);
router.get('/', getAllRecords);
router.get('/:patientId', getRecordsByPatient);

module.exports = router;