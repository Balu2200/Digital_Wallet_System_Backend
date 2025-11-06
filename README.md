# PaySwift - Digital Wallet System Backend

[![Commits](https://img.shields.io/github/commit-activity/t/Balu2200/Digital_Wallet_System_Backend)](https://github.com/Balu2200/Digital_Wallet_System_Backend/commits/main)
[![License](https://img.shields.io/badge/license-ISC-blue.svg)](LICENSE)
[![Node Version](https://img.shields.io/badge/node-20.x-brightgreen.svg)](https://nodejs.org/)

## 📊 Project Statistics

- **Total Commits**: 310+ commits
- **Active Development**: Continuous updates and improvements
- **Contributors**: Multiple developers actively maintaining the project

## 🚀 About PaySwift

PaySwift is a comprehensive digital wallet system backend built with Node.js, Express, and MongoDB. This API provides secure payment processing, user authentication, and account management features for a modern digital wallet application.

## 🛠️ Tech Stack

- **Runtime**: Node.js 20.x
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT & bcrypt
- **Email Service**: Nodemailer with Mailtrap
- **AI Integration**: LangChain with OpenAI
- **Additional Features**: 
  - Two-factor authentication with Speakeasy
  - Scheduled payments with node-cron
  - CORS enabled for cross-origin requests

## 📦 Dependencies

### Core Dependencies
- `express` - Web application framework
- `mongoose` - MongoDB object modeling
- `jsonwebtoken` - JWT authentication
- `bcrypt` / `bcryptjs` - Password hashing
- `dotenv` - Environment configuration
- `cors` - Cross-origin resource sharing
- `cookie-parser` - Cookie parsing middleware

### Additional Features
- `@langchain/core` & `@langchain/openai` - AI chatbot integration
- `nodemailer` & `mailtrap` - Email services
- `speakeasy` - 2FA implementation
- `node-cron` - Scheduled task execution
- `validator` - Input validation

## 🚦 Getting Started

### Prerequisites
- Node.js 20.x or higher
- MongoDB instance
- npm or yarn package manager

### Installation

1. Clone the repository:
```bash
git clone https://github.com/Balu2200/Digital_Wallet_System_Backend.git
cd Digital_Wallet_System_Backend
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Create a `.env` file in the root directory with necessary configurations.

4. Start the server:
```bash
# Development mode
npm run dev

# Production mode
npm start
```

## 📁 Project Structure

```
src/
├── app.js          # Main application entry point
├── config/         # Configuration files
├── middleware/     # Custom middleware
├── models/         # Database models
├── routes/         # API route definitions
└── utils/          # Utility functions
```

## 🔗 API Endpoints

The API includes routes for:
- Authentication (login, register, password reset)
- Account management
- User profiles
- Chatbot integration
- Scheduled payments

## 👨‍💻 Development

### Running in Development Mode
```bash
npm run dev
```

This will start the server with nodemon for auto-reloading on file changes.

## 📄 License

This project is licensed under the ISC License.

## 👤 Author

**Balu Pasumarthi**

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! With over 310 commits, this project is actively maintained and continuously improving.

## 📈 Development Activity

This project has seen significant development activity with **more than 310 commits**, demonstrating active maintenance and continuous feature additions. The commit history reflects ongoing improvements in security, functionality, and user experience.

---

For more information, visit the [GitHub repository](https://github.com/Balu2200/Digital_Wallet_System_Backend).
