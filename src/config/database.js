const mongoose = require("mongoose");
require("dotenv").config();

const connectDb = async () =>{
    try {
      await mongoose.connect(process.env.MONGODB_CONNECTION, {});
      console.log("Database connected successfully");
    } catch (err) {
      console.error("Error in connection", err.message);
      process.exit(1);
    }   
}
module.exports = {
  connectDb,
};