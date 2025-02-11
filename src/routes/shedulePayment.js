const express = require("express");
const scheduledPaymentModel = require("../models/payment");
const { userAuth } = require("../middleware/auth");
const sheduledPaymentModel = require("../models/payment");
const sheduledRouter = express.Router();


// ----------------------------- 1️⃣sheduling the payment-------------------------------------------------
sheduledRouter.post("/shedule-payment", userAuth, async(req, res) =>{

    try{

        const{receipent, amount, frequency, nextExecutionDate} = req.body;
        const newPayment = new sheduledPaymentModel({
            userid:req.user._id,
            receipent,
            amount,
            frequency,
            nexExecutionDate
        });

        await newPayment.save();
        res.status(201).json({message:"Payment sheduled successfully", newPayment});  
    }
    catch(err){
        res.status(500).json({ error: err.message });
    }
});

// ----------------------------- 1️⃣getting  the sheduled payment------------------------------------------
sheduledRouter.get("/sheduled-payments", userAuth, async (req, res) => {
  try {
    const payments = await sheduledPaymentModel.find({userid:req.user._id});
    res.status(201).json(payments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ----------------------------- 1️⃣cancelling the sheduled payment------------------------------------------
sheduledRouter.delete("/sheduled-payment/:id", userAuth, async (req, res) => {
  try {
    const payment = await sheduledPaymentModel.findByIdAndDelete(req.params.id);
    if(!payment){
        res.status(404).json({message:"Payment not found"});
    }
    res.status(201).json({ message: "Scheduled payment deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = sheduledRouter;

