const express = require("express");
const authRouter = express.Router();

const { validate } = require("../utils/validate");
const userModel = require("../models/user");
const accountModel = require("../models/account");
const bcrypt = require("bcrypt");

authRouter.post("/signup", async (req, res) => {
  try {
    const { firstName, lastName, email, password } = validate(req.body);
    const passwordHash = await bcrypt.hash(password, 10);

    const user = new userModel({
      firstName,
      lastName,
      email,
      password: passwordHash,
    });
    await user.save();

    const userId = user._id;
    await accountModel.create({ userId, balance: 1 + Math.random() * 1000 });

    return res.status(201).json({ message: "User Created Successfully" });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

authRouter.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res
        .status(400)
        .json({ error: "Email and password are required." });
    }

    const user = await userModel.findOne({ email });
    if (!user) throw new Error("User not found");

    const isPasswordValid = await user.validatePassword(password);
    if (!isPasswordValid) throw new Error("Invalid password");

    const token = await user.getJWT();
    res.cookie("token", token, {
      expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      httpOnly: true,
    });

    res.json({ message: "Login Successful", user });
  } catch (err) {
    res.status(401).json({ error: err.message });
  }
});

authRouter.post("/logout", async (req, res) => {
  res.cookie("token", null, { expires: new Date(Date.now()), httpOnly: true });
  res.json({ message: "Logout Successful" });
});

module.exports = authRouter;
