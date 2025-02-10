const express = require("express");
const { getChatbotResponse } = require("../utils/chatbot");
const botRouter = express.Router();


botRouter.post("/chatbot/message", (req, res) =>{

    const {message} = req.body;
    const response = getChatbotResponse(message);
    res.json({response});
});

module.exports = botRouter;
