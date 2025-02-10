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
);
app.use(express.json());
app.use(cookieParser());

const authRouter = require("./routes/auth");
const accountRouter = require("./routes/account");
const profileRouter = require("./routes/profile");
const botRouter = require("./routes/botRoute");


app.use("/", authRouter);
app.use("/", accountRouter);
app.use("/", profileRouter);
app.use("/", botRouter);

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
