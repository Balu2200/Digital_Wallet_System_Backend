const accountModel = require("../models/account");

const verifyPin = async (req, res, next) => {
  try {
    const { pin } = req.body;
    if (!pin) {
      return res.status(400).json({ error: "PIN is required" });
    }

    const account = await accountModel
      .findOne({ userId: req.userId })
      .select("+pin");
    if (!account) {
      return res.status(404).json({ error: "No account found" });
    }

    const isMatch = await account.comparePin(pin);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid PIN" });
    }

    next();
  } catch (err) {
    console.error("PIN verification error:", err);
    res
      .status(500)
      .json({ error: "Something went wrong", message: err.message });
  }
};

module.exports = { verifyPin };
