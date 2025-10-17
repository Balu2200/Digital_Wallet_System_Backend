const express = require("express");
const authRouter = express.Router();

const { validate } = require("../utils/validate");
const userModel = require("../models/user");
const accountModel = require("../models/account");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
require("dotenv").config();

// ----------------------------- Mailtrap SMTP Transport -----------------------------
const transport = nodemailer.createTransport({
  host: "sandbox.smtp.mailtrap.io",
  port: 2525,
  auth: {
    user: "35b527cc37c8c4",
    pass: "17ddac7686c14a",
  },
});

// ----------------------------- 1️⃣ Signup API -----------------------------
authRouter.post("/signup", async (req, res) => {
  try {
    const { firstName, lastName, email, password, pin } = validate(req.body);
    const passwordHash = await bcrypt.hash(password, 10);
    const pinHash = await bcrypt.hash(pin, 10);

    const user = new userModel({
      firstName,
      lastName,
      email,
      password: passwordHash,
      isVerified: true,
    });
    await user.save();

    const userId = user._id;
    await accountModel.create({
      userId,
      balance: 1 + Math.random() * 1000,
      pin: pinHash,
    });

    res.status(201).json({ message: "User Created Successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ----------------------------- 2️⃣ Login API (Password + OTP) -----------------------------
authRouter.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res
        .status(400)
        .json({ message: "Email and password are required" });

    const user = await userModel.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid credentials" });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.otp = otp;
    await user.save();

    // ----------------------------- Send OTP via Mailtrap -----------------------------
    const mailOptions = {
      from: '"PaySwift" <no-reply@payswift.com>',
      to: email, // On free sandbox, emails are captured in Mailtrap inbox
      subject: "Your PayVault Login OTP",
      text: `Your OTP for login is: ${otp}. It is valid for 10 minutes.`,
    };

    await transport.sendMail(mailOptions);
    console.log(`✅ OTP sent for ${email}: ${otp}`);

    res.status(200).json({
      message: "OTP sent successfully",
      email: user.email,
      userId: user._id,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error. Please try again later." });
  }
});

// ----------------------------- 3️⃣ Verify OTP API -----------------------------
authRouter.post("/verify-otp", async (req, res) => {
  try {
    const { userId, otp } = req.body;
    if (!userId || !otp)
      return res.status(400).json({ message: "User ID and OTP are required" });

    const user = await userModel.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.otp !== otp)
      return res.status(400).json({ message: "Invalid OTP" });

    user.otp = null;
    await user.save();

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    res.cookie("token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: 24 * 60 * 60 * 1000,
      path: "/",
    });

    res.status(200).json({
      message: "OTP verified successfully",
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
      },
    });
  } catch (error) {
    console.error("OTP verification error:", error);
    res.status(500).json({ message: "Server error. Please try again later." });
  }
});

// ----------------------------- 4️⃣ Logout API -----------------------------
authRouter.post("/logout", async (req, res) => {
  res.cookie("token", "", {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    expires: new Date(0),
  });

  res.status(200).json({ message: "Logout Successful" });
});

module.exports = authRouter;
