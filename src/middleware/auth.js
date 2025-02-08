
const jwt = require('jsonwebtoken');
const userModel = require("../models/user");
require('dotenv').config();



const userAuth = async (req, res , next) =>{

    try {
      const token = req.cookies;
      if (!token) {
        return res.status(401).send("Unauthorized: No token");
      }

      const decodedMessage = jwt.verify(token, process.env.JWT_SECRET);
      const { _id } = decodedMessage;
      const user = userModel.findById(_id);
      if (!user) {
        return res.status(401).send("Unauthorized: No user found");
      }
      req.user = user;
      next();
    } catch (err) {
      return res.status(401).send("Unauthorized: Invalid token");
    }
}
module.exports = {userAuth};


