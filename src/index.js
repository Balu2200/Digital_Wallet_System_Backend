const express = require('express');
const cors = require('cors');

const app = express();

app.use(
  cors({
    origin: process.env.NODE_ENV === "production" 
      ? "https://pay-swift-frontend.vercel.app"  // Updated frontend URL
      : "http://localhost:5173",                 // Development URL
    credentials: true,
  })
);

// ... rest of the existing code ... 