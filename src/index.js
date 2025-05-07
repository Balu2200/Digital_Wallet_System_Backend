const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const authRouter = require('./routes/auth');
const accountRouter = require('./routes/account');
const transactionRouter = require('./routes/transaction');
const chatbotRouter = require('./routes/chatbot');
const autopayRouter = require('./routes/autopay');

const app = express();

// Middleware
app.use(express.json());
app.use(cookieParser());

// CORS configuration
app.use(cors({
  origin: 'https://pay-swift-frontend.vercel.app',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  exposedHeaders: ['Set-Cookie'],
  preflightContinue: false,
  optionsSuccessStatus: 204
}));

// Routes
app.use('/auth', authRouter);
app.use('/account', accountRouter);
app.use('/transaction', transactionRouter);
app.use('/chatbot', chatbotRouter);
app.use('/autopay', autopayRouter);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); 