const express = require("express");
const { userAuth } = require("../middleware/auth");
const accountRouter = express.Router();
const  accountModel  = require("../models/account");
const { default: mongoose } = require("mongoose");
const transactionModel = require("../models/transactions");



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

    // ✅ Save transaction record
    const transaction = new transactionModel({
      senderId: req.userId,
      receiverId: to,
      amount,
      status: "success",
    });

    await transaction.save({ session });

    await session.commitTransaction();
    res.json({ message: "Transaction successful" });
  } catch (err) {
    await session.abortTransaction();
    console.error("Transaction error:", err);

    // ✅ Save failed transaction record
    await new transactionModel({
      senderId: req.userId,
      receiverId: to,
      amount,
      status: "failed",
    }).save();

    res.status(400).json({ error: "Transaction failed", message: err.message });
  } finally {
    session.endSession();
  }
});

accountRouter.put("/account/update", userAuth, async (req, res) => {
  try {
    const { amount } = req.body; 
    if (!amount || isNaN(amount) || amount <= 0) {
      return res.status(400).json({ error: "Invalid amount" });
    }
  
    const account = await accountModel.findOne({ userId: req.user._id });
    if (!account) {
      return res.status(404).json({ error: "No account found" });
    }

    account.balance += Number(amount);
    await account.save();
    res.json({ balance: account.balance });
    
  } catch (err) {
    console.error("Balance update error:", err);
    res
      .status(500)
      .json({ error: "Something went wrong", message: err.message });
  }
});

accountRouter.get("/account/transactions", userAuth, async(req, res) =>{
   
  try{
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 5;
      const skip = (page - 1) * limit;

      const transactions = await transactionModel
      .find({ userId: req.user._id })
      .sort({ date: -1 })
      .skip(skip)
      .limit(limit);

      const totalTransactions = await transactionModel.countDocuments({
        userId: req.user._id,
      });

      res.json({
        transactions,
        totalTransactions,
        totalPages: Math.ceil(totalTransactions / limit),
        currentPage: page,
      });
  } 
  catch(err){
    console.error("Error fetching transactions:", err);
    res
      .status(500)
      .json({ error: "Something went wrong", message: err.message });
  }
});



module.exports = accountRouter;
