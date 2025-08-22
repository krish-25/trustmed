const express = require('express');
const router = express.Router();
const { addRecord, getRecordsByPatient } = require('../controllers/recordController');

router.post('/', addRecord);
router.get('/:patientId', getRecordsByPatient);

module.exports = router;