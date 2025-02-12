const express = require("express");
const botRouter = express.Router();
const { userAuth } = require("../middleware/auth");
const chatbotModel = require("../models/chatbot");

/* ----------------------------- 1️⃣ Chatbot API ----------------------------- */
botRouter.post("/chatbot/message", async (req, res) =>{

    try{
        const {question} = req.body;
        const query = question.toLowerCase().trim();

        const chatbotresponse = await chatbotModel.findOne({question:query});

        if(chatbotresponse){
            return res.json({response:chatbotresponse.response})
        }
        else{
            return res.json({
              response:
                "Sorry, I don't understand that. Please try a different question.",
            });
        }
    }
    catch(err){
        res.status(500).json({ error: "Server error" });
    }

});

module.exports = botRouter;
