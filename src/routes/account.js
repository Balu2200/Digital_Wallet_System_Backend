const express = require("express");
const { userAuth } = require("../middleware/auth");
const accountRouter = express.Router();
const { accountModel } = require("../models/account");
const { default: mongoose } = require("mongoose");

accountRouter.get("/account/balance", userAuth, async (req, res) => {
  try {
    const account = await accountModel.findOne({
      userId: req.userId,
    });
    if (!account) {
      return res.status(400).send("No account found");
    }

    res.json({
      balance: account.balance,
    });
  } catch (err) {
    console.error("Error Detected:", err.message);
    return res.status(500).send("Error:" + err.message);
  }
});

accountRouter.post("/account/transfer", userAuth, async (req, res) => {
  
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { amount, to } = req.body;

    const account = await accountModel.findOne({ userId: req.userId }).session(session);
    if (!account || account.balance < amount) {
      await session.abortTransaction();
      return res.status(400).json({
        message: "Insufficient balance",
      });
    }

    const toAccount = await accountModel.findOne({ userId: to }).session(session);
    if (!toAccount) {
      await session.abortTransaction();
      return res.status(400).json({
        message: "Invalid account",
      });
    }

    await account.updateOne({ userId: req.userId }, { $inc: { balance: -amount } }).session(session);
    await toAccount.updateOne({ userId: to }, { $inc: { balance: amount } }).session(session);

    await session.commitTransaction();
    res.json({
      message: "Transaction successful",
    });
  } catch (err) {
    await session.abortTransaction();
    console.error("Error Detected:", err.message);
    return res.status(500).send("Error:" + err.message);
  } finally {
    session.endSession();
  }
});

module.exports = accountRouter;
