const mongoose = require('mongoose');

const stockSchema = new mongoose.Schema({
  name: { type: String, required: true },
  quantity: { type: Number, default: 0 }
});

module.exports = mongoose.model('Stock', stockSchema);