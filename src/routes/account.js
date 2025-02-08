const express = require("express");
const { userAuth } = require("../middleware/auth");
const accountRouter = express.Router();
const  accountModel  = require("../models/account");
const { default: mongoose } = require("mongoose");


accountRouter.get("/account/balance", userAuth, async (req, res) => {
  try {
    const account = await accountModel.findOne({ userId: req.user._id });
    if (!account) {
      return res.status(404).json({ error: "No account found" });
    }
    res.json({ balance: account.balance });
  } catch (err) {
    console.error("Balance retrieval error:", err);
    res
      .status(500)
      .json({ error: "Something went wrong", message: err.message });
  }
});


accountRouter.post("/account/transfer", userAuth, async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { amount, to } = req.body;
    if (!amount || amount <= 0) {
      throw new Error("Invalid transfer amount");
    }

    const senderAccount = await accountModel
      .findOne({ userId: req.userId })
      .session(session);
    if (!senderAccount || senderAccount.balance < amount) {
      throw new Error("Insufficient balance");
    }

    const recipientAccount = await accountModel
      .findOne({ userId: to })
      .session(session);
    if (!recipientAccount) {
      throw new Error("Invalid recipient account");
    }

    await accountModel
      .updateOne({ userId: req.userId }, { $inc: { balance: -amount } })
      .session(session);
    await accountModel
      .updateOne({ userId: to }, { $inc: { balance: amount } })
      .session(session);

    await session.commitTransaction();
    res.json({ message: "Transaction successful" });
  } catch (err) {
    await session.abortTransaction();
    console.error("Transaction error:", err);
    res.status(400).json({ error: "Transaction failed", message: err.message });
  } finally {
    session.endSession();
  }
});

module.exports = accountRouter;
