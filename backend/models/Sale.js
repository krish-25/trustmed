const mongoose = require('mongoose');

const saleSchema = new mongoose.Schema({
  items: [
    {
      medicineId: { type: mongoose.Schema.Types.ObjectId, ref: 'Medicine', required: true },
      medicineName: String,
      quantity: Number
    }
  ],
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Sale', saleSchema);