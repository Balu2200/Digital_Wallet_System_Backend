const express = require("express");
const authRouter = express.Router();

const speakeasy = require("speakeasy");
const { validate } = require("../utils/validate");
const userModel = require("../models/user");
const accountModel = require("../models/account");
const nodemailer = require("nodemailer");
const bcrypt = require("bcrypt");
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

/* ----------------------------- 2️⃣ Login API (Password Check + OTP) ----------------------------- */
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

   
    if (!user.secret) {
      user.secret = speakeasy.generateSecret().base32;
      await user.save();
    }

 
    const otp = speakeasy.totp({
      secret: user.secret,
      encoding: "base32",
      step: 60, 
    });

    user.otp = otp;
    user.otpExpires = new Date(Date.now() + 60 * 1000); 
    await user.save();

  
    await transport.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Your PaySwift 2FA OTP",
      text: `Your OTP for login is: ${otp}. It is valid for 60 seconds.`,
    });

    return res.json({
      message: "OTP Sent to Email. Please verify OTP to continue.",
      userId: user._id,
    });
  } catch (err) {
    res.status(401).json({ error: err.message });
  }
});

/* ----------------------------- 3️⃣ Verify OTP API (Complete Login) ----------------------------- */
authRouter.post("/verify-otp", async (req, res) => {
  try {
    const { userId, otp } = req.body;
    const user = await userModel.findById(userId);
    if (!user) throw new Error("User not found");

   
    if (!user.otpExpires || user.otpExpires < Date.now()) {
      throw new Error("OTP expired. Please request a new one.");
    }

    const isValid = speakeasy.totp.verify({
      secret: user.secret,
      encoding: "base32",
      token: otp,
      step: 60, 
      window: 2, 
    });

    if (!isValid) throw new Error("Invalid OTP");

    user.otpExpires = null;
    await user.save();

   
    const token = await user.getJWT();
    res.cookie("token", token, {
      expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      httpOnly: true,
    });

    return res.json({ message: "Login Successful", user });
  } catch (err) {
    res.status(401).json({ error: err.message });
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


