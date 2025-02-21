const cron = require("node-cron");
const mongoose = require("mongoose");
const ScheduledPayment = require("../models/payment");
const transactionModel = require("../models/transactions");
const accountModel = require("../models/account");
const userModel = require("../models/user");

const processPayments = async () => {
  console.log("🔄 Checking for scheduled payments...");
  const session = await mongoose.startSession();

  try {
    session.startTransaction();
    const now = new Date();

    const payments = await ScheduledPayment.find({
      nextExecutionDate: { $lte: now },
      status: "pending",
    }).session(session);

    for (const payment of payments) {
      const senderAccount = await accountModel
        .findOne({ userId: payment.userId })
        .session(session);
      const receiverAccount = await accountModel
        .findOne({ userId: payment.recipient })
        .session(session);

      const sender = await userModel.findById(payment.userId).session(session);
      const receiver = await userModel
        .findById(payment.recipient)
        .session(session);

      if (
        !senderAccount ||
        senderAccount.balance < payment.amount ||
        payment.amount <= 0
      ) {
        payment.status = "failed";
        await transactionModel.create(
          [
            {
              senderId: sender ? sender._id : null,
              senderName: sender
                ? `${sender.firstName} ${sender.lastName}`
                : "Unknown Sender",
              receiverId: receiver ? receiver._id : null,
              receiverName: receiver
                ? `${receiver.firstName} ${receiver.lastName}`
                : "Unknown Recipient",
              amount: payment.amount || 0,
              status: "failed",
              timestamp: new Date(),
            },
          ],
          { session }
        );
      } else {
        await accountModel.findOneAndUpdate(
          { userId: senderAccount.userId },
          { $inc: { balance: -payment.amount } },
          { session }
        );

        if (receiverAccount) {
          await accountModel.findOneAndUpdate(
            { userId: receiverAccount.userId },
            { $inc: { balance: payment.amount } },
            { session }
          );
        }

        await transactionModel.create(
          [
            {
              senderId: sender ? sender._id : null,
              senderName: sender
                ? `${sender.firstName} ${sender.lastName}`
                : "Unknown Sender",
              receiverId: receiver ? receiver._id : null,
              receiverName: receiver
                ? `${receiver.firstName} ${receiver.lastName}`
                : "Unknown Recipient",
              amount: payment.amount || 0,
              status: "success",
              timestamp: new Date(),
            },
          ],
          { session }
        );

        payment.status = "completed";

        if (payment.frequency !== "one-time") {
          const nextDate = new Date(payment.nextExecutionDate);
          if (payment.frequency === "daily")
            nextDate.setDate(nextDate.getDate() + 1);
          if (payment.frequency === "weekly")
            nextDate.setDate(nextDate.getDate() + 7);
          if (payment.frequency === "monthly")
            nextDate.setMonth(nextDate.getMonth() + 1);

          payment.nextExecutionDate = nextDate;
          payment.status = "pending";
        }
      }

      await payment.save({ session });
    }

    await session.commitTransaction();
  } catch (err) {
    await session.abortTransaction();
    console.error("Error processing scheduled payments:", err);
  } finally {
    session.endSession();
  }
};

cron.schedule("*/2 * * * *", processPayments);

module.exports = processPayments;
