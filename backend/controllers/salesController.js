const Sale = require('../models/Sale');
const Stock = require('../models/Stock');

exports.recordSales = async (req, res) => {
  try {
    const entries = req.body; // [{ medicineId, quantity }]
    for (const entry of entries) {
      const stock = await Stock.findById(entry.medicineId);
      if (!stock || stock.quantity < entry.quantity) {
        return res.status(400).json({ error: `Insufficient stock for ${entry.medicineId}` });
      }

      await Sale.create(entry);
      stock.quantity -= entry.quantity;
      await stock.save();
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};