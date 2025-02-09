const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema({
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  senderName: { type: String, required: true }, 

  receiverId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  receiverName: { type: String, required: true }, 

  amount: { type: Number, required: true },
  timestamp: { type: Date, default: Date.now },
  status: { type: String, enum: ["success", "failed"], default: "success" },
});

const transactionModel = mongoose.model("transactions", transactionSchema);
module.exports = transactionModel;
