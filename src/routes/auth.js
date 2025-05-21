const express = require("express");
const authRouter = express.Router();

const speakeasy = require("speakeasy");
const { validate } = require("../utils/validate");
const userModel = require("../models/user");
const accountModel = require("../models/account");
const nodemailer = require("nodemailer");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config();


const transport = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

/* ----------------------------- 1️⃣ Signup API ----------------------------- */
authRouter.post("/signup", async (req, res) => {
  try {
    const { firstName, lastName, email, password, pin, phoneNumber } = validate(req.body);
    const passwordHash = await bcrypt.hash(password, 10);

    const user = new userModel({
      firstName,
      lastName,
      email,
      password: passwordHash,
      phoneNumber
    });
    await user.save();

  
    const userId = user._id;
    await accountModel.create({
      userId,
      balance: 1 + Math.random() * 1000,
      pin
    });

    return res.status(201).json({ message: "User Created Successfully" });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

/* ----------------------------- 2️⃣ Login API (Password Check + OTP) ----------------------------- */
authRouter.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const user = await userModel.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.otp = otp;
    await user.save();

    // Send OTP via email
    try {
      await transport.sendMail({
        from: process.env.EMAIL_USER,
        to: email,
        subject: "Your PaySwift Login OTP",
        text: `Your OTP for login is: ${otp}. It is valid for 10 minutes.`,
      });
    } catch (emailErr) {
      console.error("Email sending failed:", emailErr);
      return res.status(500).json({ message: "Failed to send OTP. Please try again." });
    }

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

/* ----------------------------- 3️⃣ Verify OTP API (Complete Login) ----------------------------- */
authRouter.post("/verify-otp", async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return res.status(400).json({ message: "Email and OTP are required" });
    }

    const user = await userModel.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.otp !== otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    // Clear OTP after successful verification
    user.otp = null;
    await user.save();

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    // Set cookie with secure attributes
    res.cookie("token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      path: "/"
    });

    res.status(200).json({ 
      message: "OTP verified successfully",
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName
      }
    });
  } catch (error) {
    console.error("OTP verification error:", error);
    res.status(500).json({ message: "Server error. Please try again later." });
  }
});

/* ----------------------------- 4️⃣ Logout API ----------------------------- */
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


