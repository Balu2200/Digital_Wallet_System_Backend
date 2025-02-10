const mongoose = require("mongoose");
const chatbotModel = require("../models/chatbot");
require("dotenv").config();

mongoose.connect(process.env.MONGODB_CONNECTION);

const seedData = [
    {
        question: "check balance",
        response: "You can check your balance in the dashboard under 'Account Balance'."
    },
    {
        question: "transaction history",
        response: "Your transaction history is available in the 'Transactions' tab."
    },
    {
        question: "send money",
        response: "To send money, search the user and click on 'send money' button, it will navigate to the transaction tab, there you can send your money."
    },
    {
        question: "customer support",
        response: "For support, you can email us at balupasumarthi1@email.com or call our helpline 7995931047."
    },
    {
        question: "good morning",
        response: "Good morning! How can I assist you today?"
    },
    {
        question: "good afternoon",
        response: "Good afternoon! How can I help you?"
    },
    {
        question: "good evening",
        response: "Good evening! What can I do for you?"
    },
    {
        question: "happy birthday",
        response: "Happy Birthday! Wishing you a fantastic day ahead!"
    },
    {
        question: "happy new year",
        response: "Happy New Year! May this year bring you joy and prosperity!"
    }
];


const seedDb = async() =>{
    await chatbotModel.insertMany(seedData);
    console.log("Chatbot responses added!");
    mongoose.connection.close();
}

seedDb();
