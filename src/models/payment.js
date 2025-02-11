const mongoose = require("mongoose");

const ScheduledPaymentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  senderName: {
    type: String,
    required: true,
  },
  recipient: {
    type: String,
    required: true,
  },
  recipientName: {
    type: String,
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  frequency: {
    type: String,
    enum: ["one-time", "daily", "weekly", "monthly"],
    required: true,
  },
  nextExecutionDate: {
    type: Date,
    required: true,
  },
  status: {
    type: String,
    enum: ["completed", "pending", "failed"],
    default: "pending",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const ScheduledPayment = mongoose.model(
  "ScheduledPayment",
  ScheduledPaymentSchema
);

module.exports = ScheduledPayment;
