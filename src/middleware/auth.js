const jwt = require("jsonwebtoken");
const userModel = require("../models/user");
require("dotenv").config();

const userAuth = async (req, res, next) => {
  try {
    const { token } = req.cookies;

    if (!token) {
      return res.status(401).json({ error: "Unauthorized: No token provided" });
    }

    const decodedMessage = jwt.verify(token, process.env.JWT_SECRET);
    const user = await userModel.findById(decodedMessage.userId);

    if (!user) {
      return res.status(401).json({ error: "Unauthorized: User not found" });
    } 

    req.user = user;
    req.userId = user._id; 
    next();
  } catch (err) {
    return res.status(401).json({ error: "Unauthorized: Invalid token" });
  }
};

module.exports = { userAuth };
