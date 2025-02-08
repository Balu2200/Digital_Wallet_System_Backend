const mongoose = require("mongoose");

const accountSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
      index: true,
    },
    balance: {
      type: Number,
      required: true,
      min: 0, 
      default: 0, 
    },
  },
  { timestamps: true }
); 

const accountModel = mongoose.model("accounts", accountSchema);
module.exports =  accountModel ;
