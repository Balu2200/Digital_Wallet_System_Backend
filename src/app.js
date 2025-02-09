const express = require("express");
const { connectDb } = require("./config/database");
const cookieParser = require("cookie-parser");
const cors = require("cors");
require("dotenv").config();

const app = express();
const allowedOrigins = [
  "http://localhost:5173", 
  "https://pay-swift-frontend.vercel.app", 
];

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true, 
  })
);
app.use(express.json());
app.use(cookieParser());

const authRouter = require("./routes/auth");
const accountRouter = require("./routes/account");
const profileRouter = require("./routes/profile");


app.use("/", authRouter);
app.use("/", accountRouter);
app.use("/", profileRouter);

connectDb()
  .then(() => {
    console.log("Database Connected");
    app.listen(process.env.PORT, () => {
      console.log("Server started on port 1234.....");
    });
  })
  .catch((err) => {
    console.log("Error:", err.message);
  });
