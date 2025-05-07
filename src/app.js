const express = require("express");
const { connectDb } = require("./config/database");
const cookieParser = require("cookie-parser");
const cors = require("cors");
require("dotenv").config();

const app = express();

// CORS configuration
const allowedOrigins = [
  'https://pay-swift-frontend.vercel.app',
  'http://localhost:5173'
];

app.use(cors({
  origin: function(origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  exposedHeaders: ['Set-Cookie']
}));

app.use(express.json());
app.use(cookieParser());

// Routes
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

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// Initialize database connection and start server
connectDb()
  .then(() => {
    console.log("✅ Database Connected");
    
    const processPayments = require("./utils/paymentSheduler");
    processPayments();
    console.log("🔄 Processing payments");

    const PORT = process.env.PORT || 1234;
    app.listen(PORT, () => {
      console.log(`🚀 Server started on port ${PORT}...`);
    });
  })
  .catch((err) => {
    console.log("❌ Database Connection Error:", err.message);
  });

// Import the main application
require('./index.js');
