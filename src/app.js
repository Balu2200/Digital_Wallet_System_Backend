const express = require("express");
const { connectDb } = require("./config/database");
const cookieParser = require("cookie-parser");
const cors = require("cors");
require("dotenv").config();

const app = express();

app.use(cors());

app.use(express.json());
app.use(cookieParser());


const authRouter = require("./routes/auth");
const accountRouter = require("./routes/account");
const profileRouter = require("./routes/profile");
const botRouter = require("./routes/botRoute");
const scheduledRouter = require("./routes/shedulePayment");

app.use("/", authRouter);
app.use("/", accountRouter);
app.use("/", profileRouter);
app.use("/", botRouter);
app.use("/", scheduledRouter);


app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});


connectDb()
  .then(() => {
    console.log("Database Connected");
    
    const processPayments = require("./utils/paymentSheduler");
    processPayments();
    console.log("Processing payments");

    const PORT = process.env.PORT || 1234;
    app.listen(PORT, () => {
      console.log(`Server started on port ${PORT}...`);
    });
  })
  .catch((err) => {
    console.log("Database Connection Error:", err.message);
  });
