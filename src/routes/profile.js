const express = require("express");
const profileRouter = express.Router();

const { validate, validateEditProfile } = require("../utils/validate");
const userModel = require("../models/user");
const accountModel = require("../models/account");
const bcrypt = require("bcrypt");
const {userAuth} = require("../middleware/auth");


profileRouter.get("/profile/view", userAuth, async (req, res) => {
  try {
    const { password, ...safeUser } = req.user._doc || req.user; // Exclude password
    res.json(safeUser);
  } catch (err) {
    console.error("Profile view error:", err);
    res
      .status(500)
      .json({ error: "Something went wrong", message: err.message });
  }
});


profileRouter.put("/profile/update", userAuth, async (req, res) => {
  try {
    if (!validateEditProfile(req.body)) {
      return res.status(400).json({ message: "Invalid profile data" });
    }

    const updatedUser = await userModel.findOneAndUpdate(
      { _id: req.user._id },
      { $set: req.body },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ message: "Updated successfully", user: updatedUser });
  } catch (err) {
    console.error("Profile update error:", err);
    res
      .status(500)
      .json({ error: "Something went wrong", message: err.message });
  }
});


profileRouter.get("/profile/bulk", async (req, res) => {
  try {
    const filter = req.query.filter || "";

    const users = await userModel.find(
      {
        $or: [
          { firstName: { $regex: filter, $options: "i" } },
          { lastName: { $regex: filter, $options: "i" } },
        ],
      },
      "username firstName lastName _id"
    ); // Select only required fields

    res.json({ users });
  } catch (err) {
    console.error("Error fetching users:", err);
    res
      .status(500)
      .json({ error: "Something went wrong", message: err.message });
  }
});

module.exports = profileRouter;
