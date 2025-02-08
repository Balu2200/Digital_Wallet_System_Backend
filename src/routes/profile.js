const express = require("express");
const profileRouter = express.Router();

const { validate, validateEditProfile } = require("../utils/validate");
const userModel = require("../models/user");
const accountModel = require('../models/account');

const bcrypt = require("bcrypt");
const userAuth = require("../middleware/auth");

profileRouter.get("/profile/view", userAuth, async (req, res) => {
  try {
    const user = req.user;
    res.send(user);
  } catch (err) {
    res.status(401).send("Something went wrong: " + err.message);
  }
});

profileRouter.put("/profile/update", userAuth, async(req, res) =>{
    try {
        if(!validateEditProfile(req)){
            return res.status(411).json({
              message: "Error while updating information",
            });
        }

        await userModel.updateOne({ id: req.userId }, req.body);

        res.json({
          message: "Updated successfully",
        });
        
    } catch (err) {
      res.status(401).send("Something went wrong: " + err.message);
    }
});

profileRouter.get("/profile/bulk", async (req, res) => {
  try {
    const filter = req.query.filter || "";

    const users = await userModel.find({
      $or: [
        {
          firstName: {
            $regex: filter,
          },
        },
        {
          lastName: {
            $regex: filter,
          },
        },
      ],
    });

    res.json({
      user: users.map((user) => ({
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        _id: user._id,
      })),
    });
  } catch (err) {
    console.error("Error Detected:", err.message);
    return res.status(500).send("Error:" + err.message);
  }
});

module.exports = profileRouter;
