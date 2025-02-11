const mongoose = require("mongoose");

const ShedulePaymentSchema = new mongoose.Schema({
    userid: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
        required: true
    },
    receipent: {
        type: String,
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    frequency: {
        type: String,
        enum: ["one-time", "daily", "weekly", "monthly"],
        required: true
    },
    nexExecutionDate: {
        type: Date,
        required: true
    },
    status: {
        type: String,
        enum: ["completed", "pending", "failed"],
        default: "pending"
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const sheduledPaymentModel = mongoose.model("sheduledPayment", ShedulePaymentSchema);

module.exports = sheduledPaymentModel;
