const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({

    userId:{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'order',
    required: true,

    },
//   orderId: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'order',
//     required: true,
//   },
  productIdInOrder: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  size: {
    type: String,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  type: {
    type: String,
    enum: ['cod', 'Wallet', 'RazorPay'], // Adjust as needed
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

module.exports   = mongoose.model('transaction', transactionSchema);

