const express = require('express');
const router = express.Router();
const {
  getStock,
  addStock,
  updateStock,
  bulkUpdateStock,
  getOutOfStock
} = require('../controllers/stockController');

router.get('/', getStock);
router.post('/', addStock);
router.patch('/:id', updateStock); // optional, kept for single updates
router.patch('/bulk/update', bulkUpdateStock); // 🔥 main route for SalesEntryScreen
router.get('/out-of-stock', getOutOfStock);

module.exports = router;