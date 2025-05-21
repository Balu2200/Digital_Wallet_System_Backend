const express = require("express");
const { connectDb } = require("./config/database");
const cookieParser = require("cookie-parser");
const cors = require("cors");
require("dotenv").config();

const app = express();

const allowedOrigins = [
  "http://localhost:5173",
  "https://pay-swift-frontend.vercel.app/",
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);


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
