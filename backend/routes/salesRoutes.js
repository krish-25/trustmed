const express = require('express');
const router = express.Router();
const { recordSales } = require('../controllers/salesController');

router.post('/', recordSales);

module.exports = router;