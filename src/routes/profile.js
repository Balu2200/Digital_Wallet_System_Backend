const express = require("express");
const profileRouter = express.Router();

const { validate, validateEditProfile } = require("../utils/validate");
const userModel = require("../models/user");
const accountModel = require("../models/account");
const bcrypt = require("bcrypt");
const {userAuth} = require("../middleware/auth");

/* ----------------------------- Profile view API ----------------------------- */
profileRouter.get("/profile/view", userAuth, async (req, res) => {
  try {
    const { password, ...safeUser } = req.user._doc || req.user; 
    res.json(safeUser);
  } catch (err) {
    console.error("Profile view error:", err);
    res
      .status(500)
      .json({ error: "Something went wrong", message: err.message });
  }
});

/* ----------------------------- Profile update  API ----------------------------- */
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

/* ----------------------------- Get Profiles API ----------------------------- */
profileRouter.get("/profile/bulk", userAuth, async (req, res) => {
  try {
    const filter = req.query.filter || "";
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 7;
    const skip = (page - 1) * limit;
    const loggedInUserId = req.user._id; 

    const users = await userModel
      .find(
        {
          _id: { $ne: loggedInUserId }, 
          $or: [
            { firstName: { $regex: filter, $options: "i" } },
            { lastName: { $regex: filter, $options: "i" } },
          ],
        },
        "username firstName lastName _id"
      )
      .skip(skip)
      .limit(limit);

    const totalUsers = await userModel.countDocuments({
      _id: { $ne: loggedInUserId }, 
      $or: [
        { firstName: { $regex: filter, $options: "i" } },
        { lastName: { $regex: filter, $options: "i" } },
      ],
    });

    res.json({
      users,
      totalUsers,
      totalPages: Math.ceil(totalUsers / limit),
      currentPage: page,
    });
  } catch (err) {
    console.error("Error fetching users:", err);
    res
      .status(500)
      .json({ error: "Something went wrong", message: err.message });
  }
});

/* ----------------------------- Profile me  API ----------------------------- */
profileRouter.get("/profile/me", userAuth, async (req, res) => {
  try {
    const user = await userModel.findById(req.user._id).select("-password"); 

    if (!user) return res.status(404).json({ error: "User not found" });

    res.json({ user });
  } catch (err) {
    console.error("Error fetching user:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});


module.exports = profileRouter;
