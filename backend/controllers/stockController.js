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