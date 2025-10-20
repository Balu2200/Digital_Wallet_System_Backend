const { PromptTemplate } = require("@langchain/core/prompts");
const { llm } = require("../config/llm.js");

const template = `
You are a helpful chatbot for a platform called PayVault.
Answer user questions clearly using platform knowledge.

Question: {question}
`;

const prompt = new PromptTemplate({
  template,
  inputVariables: ["question"],
});

async function generateAnswer(userQuestion) {
  const formattedPrompt = await prompt.format({ question: userQuestion });
  const response = await llm.invoke(formattedPrompt);
  return response.content;
}

module.exports = { generateAnswer };
