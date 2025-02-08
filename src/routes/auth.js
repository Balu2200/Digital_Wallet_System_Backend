const express = require("express");
const authRouter = express.Router();

const { validate } = require("../utils/validate");
const userModel = require("../models/user");
const accountModel = require('../models/account');

const bcrypt = require("bcrypt");
const userAuth = require("../middleware/auth");

authRouter.post("/signup", async(req, res) =>{

    try{
        const data = validate(req);
        const {firstName, lastName, email, password} = data;
        const passwordhash = await bcrypt.hash(password, 10);

        const user = new userModel({firstName, lastName, email, password:passwordhash});
        const userId = user._id;
        await accountModel.create({userId, balance:1+Math.random()*1000});

        await user.save();
        return res.status(200).send("User Created Successfully");
    }
    catch(err){
        console.error("Error Detected:", err.message);
        return res.status(500).send("Error:" + err.message);
    }
});

authRouter.post("/login", async(req, res) =>{

    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).send("Email and password are required.");
      }

      const user = await userModel.findOne({ email: email });

      if (!user) {
        throw new Error("User not found");
      }

      const isPasswordValid = await user.validatePassword(password);

      if (isPasswordValid) {
        const token = await user.getJWT();
        res.cookie("token", token, {
          expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        });
        res.send(user);
      } else {
        throw new Error("Invalid password");
      }
    } catch (err) {
      res.status(401).send("Error: " + err.message);
    }
});

authRouter.post("/logout", async (req, res) => {
  try {
    res.cookie("token", null, { expires: new Date(Date.now()) });
    res.send("Logout Successfully");
  } catch (err) {
    res.send("Error:" + err.message);
  }
});

module.exports = authRouter;

