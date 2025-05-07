const express = require("express");
const { userAuth } = require("../middleware/auth");
const accountRouter = express.Router();
const  accountModel  = require("../models/account");
const { default: mongoose } = require("mongoose");
const transactionModel = require("../models/transactions");
const userModel = require("../models/user");
const {verifyPin} = require("../middleware/verifyPin");
const jwt = require("jsonwebtoken");

// Middleware to verify JWT token
const verifyToken = (req, res, next) => {
  const token = req.cookies.token;
  
  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid token" });
  }
};

/* ----------------------------- 1️⃣ Checking Balance API ----------------------------- */
accountRouter.get("/account/balance", verifyToken, async (req, res) => {
  try {
    const account = await accountModel.findOne({ userId: req.userId });
    if (!account) {
      return res.status(404).json({ message: "Account not found" });
    }
    res.status(200).json({ balance: account.balance });
  } catch (error) {
    console.error("Balance fetch error:", error);
    res.status(500).json({ message: "Error fetching balance" });
  }
});

/* ----------------------------- 1️⃣ Transfering money API ----------------------------- */
accountRouter.post("/account/transfer", verifyToken, verifyPin,  async (req, res) => {
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

  
    const sender = await userModel.findById(req.userId);
    const receiver = await userModel.findById(to);

    if (!sender || !receiver) {
      throw new Error("User details not found");
    }

    await accountModel
      .updateOne({ userId: req.userId }, { $inc: { balance: -amount } })
      .session(session);
    await accountModel
      .updateOne({ userId: to }, { $inc: { balance: amount } })
      .session(session);

    await transactionModel.create(
      [
        {
          senderId: req.userId,
          senderName: sender.firstName + " " + sender.lastName,
          receiverId: to,
          receiverName: receiver.firstName + " " + receiver.lastName,
          amount,
          status: "success",
        },
      ],
      { session }
    );

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

/* ----------------------------- 1️⃣ Balance updating API ----------------------------- */
accountRouter.put("/account/update", verifyToken, verifyPin,  async (req, res) => {
  try {
    const { amount } = req.body; 
    if (!amount || isNaN(amount) || amount <= 0) {
      return res.status(400).json({ error: "Invalid amount" });
    }
  
    const account = await accountModel.findOne({ userId: req.userId });
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

/* ----------------------------- 1️⃣ Getting all transactions API ----------------------------- */
accountRouter.get("/account/transactions", verifyToken, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const skip = (page - 1) * limit;

    const transactions = await transactionModel
      .find({
        $or: [{ senderId: req.userId }, { receiverId: req.userId }],
      })
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(limit)
      .select("senderName receiverName amount timestamp status"); 

    const totalTransactions = await transactionModel.countDocuments({
      $or: [{ senderId: req.userId }, { receiverId: req.userId }],
    });

    res.json({
      transactions,
      totalTransactions,
      totalPages: Math.ceil(totalTransactions / limit),
      currentPage: page,
    });
  } catch (err) {
    console.error("Error fetching transactions:", err);
    res
      .status(500)
      .json({ error: "Something went wrong", message: err.message });
  }
});

/* ----------------------------- 1️⃣ Update account PIN API ----------------------------- */
accountRouter.put("/account/pin", verifyToken, async (req, res) => {
  try {
    const { pin } = req.body;
    if (!pin) {
      return res.status(400).json({ message: "PIN is required" });
    }

    const account = await accountModel.findOne({ userId: req.userId });
    if (!account) {
      return res.status(404).json({ message: "Account not found" });
    }

    account.pin = pin;
    await account.save();

    res.status(200).json({ message: "PIN updated successfully" });
  } catch (error) {
    console.error("PIN update error:", error);
    res.status(500).json({ message: "Error updating PIN" });
  }
});

module.exports = accountRouter;
