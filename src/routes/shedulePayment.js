const express = require("express");
const scheduledPaymentModel = require("../models/payment");
const { userAuth } = require("../middleware/auth");
const scheduledRouter = express.Router();

// ----------------------------- Scheduling the Payment -------------------------------------------------
scheduledRouter.post("/schedule-payment", userAuth, async (req, res) => {
  try {
    const { recipient, recipientName, amount, frequency, nextExecutionDate } = req.body;
    

    const newPayment = new scheduledPaymentModel({
      userId: req.userId,
      senderName: req.user.firstName + " " + req.user.lastName,
      recipient,
      recipientName,
      amount,
      frequency,
      nextExecutionDate,
    });

    await newPayment.save();
    res
      .status(201)
      .json({ message: "Payment scheduled successfully", newPayment });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ----------------------------- Getting the Scheduled Payments ------------------------------------------
scheduledRouter.get("/scheduled-payments", userAuth, async (req, res) => {
  try {
    const payments = await scheduledPaymentModel.find({ userId: req.userId });

    const formattedPayments = payments.map((payment) => ({
      id: payment._id,
      senderName: payment.senderName,
      recipient: payment.recipient,
      recipientName: payment.recipientName,
      amount: payment.amount,
      frequency: payment.frequency,
      nextExecutionDate: payment.nextExecutionDate,
      status: payment.status,
      createdAt: payment.createdAt,
    }));

    res.status(200).json(formattedPayments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ----------------------------- Cancelling a Scheduled Payment ------------------------------------------
scheduledRouter.delete("/scheduled-payment/:id", userAuth, async (req, res) => {
  try {
    const payment = await scheduledPaymentModel.findByIdAndDelete(
      req.params.id
    );
    if (!payment) {
      return res.status(404).json({ message: "Payment not found" });
    }
    res.status(200).json({ message: "Scheduled payment deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});



module.exports = scheduledRouter;
