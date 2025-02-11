const cron = require("node-cron");
const ScheduledPayment = require("../models/payment");
const transactionModel = require("../models/transactions");
const userModel = require("../models/user");

const processPayments = async () => {
  try {
    console.log("🔄 Checking for scheduled payments...");
    const now = new Date();

    const payments = await ScheduledPayment.find({
      nextExecutionDate: { $lte: now },
      status: "pending",
    });

    for (const payment of payments) {

      const sender = await userModel.findById(payment.userId);
      const receiver = await userModel.findById(payment.recipient);

      if (!receiver) {
        console.warn(`⚠️ No user found for recipient ID: ${payment.recipient}`);
      }



      if (!sender || sender.balance < payment.amount) {
        payment.status = "failed";
        console.log(`❌ Insufficient balance for payment ${payment._id}`);
      } else {
        sender.balance -= payment.amount;
        await sender.save();

        if (receiver) {
          receiver.balance += payment.amount;
          await receiver.save();
        }

        await transactionModel.create({
          senderId: sender._id,
          senderName: sender.firstName + " " + sender.lastName,
          receiverId: receiver ? receiver._id : undefined,
          receiverName: receiver
            ? receiver.firstName + " " + receiver.lastName
            : payment.recipient,
          amount: payment.amount,
          type: "scheduled",
        });

        console.log(
          `✅ Processed payment ${payment._id} of ₹${payment.amount}`
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
      await payment.save();
    }
  } catch (err) {
    console.error("❌ Error processing scheduled payments:", err);
  }
};

cron.schedule("*/2 * * * *", processPayments);

module.exports = processPayments;
