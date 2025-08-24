const Sale = require('../models/Sale');

exports.recordSales = async (req, res) => {
  try {
    const sale = new Sale(req.body);
    const saved = await sale.save();
    res.status(201).json(saved);
  } catch (err) {
    console.error('Error recording sale:', err.message);
    res.status(500).json({ error: 'Failed to record sale' });
  }
};