const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

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
    pin: {
      type: String,
      required: true,
      select: false, 
    },
  },
  { timestamps: true }
);


accountSchema.pre("save", async function (next) {
  if (!this.isModified("pin")) return next();
  this.pin = await bcrypt.hash(this.pin, 10);
  next();
});


accountSchema.methods.comparePin = async function (enteredPin) {
  return await bcrypt.compare(enteredPin, this.pin);
};

const accountModel = mongoose.model("accounts", accountSchema);
module.exports = accountModel;
