
const mongoose = require("mongoose");

const accountSchema = new mongoose.Schema({

    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'user',
        required:true
    },
    balance:{
        type:Number,
        required:true
    }
})

const accountModel = mongoose.Schema({"account", accountSchema});
module.exports ={
    accountModel
}