const express = require('express');
const router = express.Router();
const { getStock, addStock, updateStock } = require('../controllers/stockController');

router.get('/', getStock);
router.post('/', addStock);
router.patch('/:id', updateStock);

module.exports = router;