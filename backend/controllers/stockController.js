const Stock = require('../models/Stock');

exports.getStock = async (req, res) => {
  const stock = await Stock.find();
  res.json(stock);
};

exports.addStock = async (req, res) => {
  const item = await Stock.create(req.body);
  res.json(item);
};

exports.updateStock = async (req, res) => {
  const updated = await Stock.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(updated);
};

// 🔥 Bulk update for sales deduction
exports.bulkUpdateStock = async (req, res) => {
  try {
    const updates = req.body; // [{ id, sold }]
    const errors = [];

    for (const entry of updates) {
      const stock = await Stock.findById(entry.id);
      if (!stock) {
        errors.push(`Medicine not found: ${entry.id}`);
        continue;
      }

      if (stock.quantity < entry.sold) {
        errors.push(`Insufficient stock for ${stock.name}`);
        continue;
      }

      stock.quantity -= entry.sold;
      await stock.save();
    }

    if (errors.length > 0) {
      return res.status(400).json({ error: errors.join(', ') });
    }

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getOutOfStock = async (req, res) => {
  try {
    const outOfStockItems = await Stock.find({ quantity: { $lte: 0 } });
    res.json(outOfStockItems);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
