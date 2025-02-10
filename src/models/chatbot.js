const mongoose = require("mongoose");

const chatbotSchema = new mongoose.Schema({

    question:{
        type:String,
        required:true,
        unique:true
    },
    response:{
        type:String,
        required:true
    }
})

const chatbotModel = mongoose.model("chatbot", chatbotSchema);

module.exports = chatbotModel;