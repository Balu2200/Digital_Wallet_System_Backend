const express = require("express");
const { connectDb } = require("./config/database");
const cookieParser = require("cookie-parser");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(
  cors({
    origin: "http://localhost:5173", 
    credentials: true, 
  })
)
app.use(express.json());
app.use(cookieParser());


const authRouter = require("./routes/auth");
const accountRouter = require("./routes/account");
const profileRouter = require("./routes/profile");
const botRouter = require("./routes/botRoute");
const scheduledRouter = require("./routes/shedulePayment");

const processPayments = require("./utils/paymentSheduler");


app.use("/", authRouter);
app.use("/", accountRouter);
app.use("/", profileRouter);
app.use("/", botRouter);
app.use("/", scheduledRouter);


connectDb()
  .then(() => {
    console.log("✅ Database Connected");

    processPayments();
    console.log("Processing payments");

    app.listen(process.env.PORT || 1234, () => {
      console.log("🚀 Server started on port 1234...");
    });
  })
  .catch((err) => {
    console.log("❌ Database Connection Error:", err.message);
  });
