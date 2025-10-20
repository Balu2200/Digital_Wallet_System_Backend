require("dotenv").config();
const { ChatOpenAI } = require("@langchain/openai"); 

const llm = new ChatOpenAI({
  apiKey: process.env.OPENAI_API_KEY, 
  model: "gpt-4o-mini",
});

module.exports = { llm };
