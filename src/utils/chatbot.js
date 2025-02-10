const chatbotResponses = {
    "check balance":
        "You can check your balance in the dashboard under 'Account Balance'.",
    "transaction history":
        "Your transaction history is available in the 'Transactions' tab.",
    "send money":
        "To send money, search the user and click on 'send money' button, it will navigate to the transaction tab, there you can send your money.",
    "customer support":
        "For support, you can email us at balupasumarthi1@email.com or call our helpline 7995931047.",
    "good morning":
        "Good morning! How can I assist you today?",
    "good afternoon":
        "Good afternoon! How can I help you?",
    "good evening":
        "Good evening! What can I do for you?",
    "happy birthday":
        "Happy Birthday! Wishing you a fantastic day ahead!",
    "happy new year":
        "Happy New Year! May this year bring you joy and prosperity!"
};


const getChatbotResponse = (message) =>{
    message = message.toLowerCase().trim();
    return chatbotResponses[message]||"I'm sorry, I don't understand that. Please try a different query."
}

module.exports = { getChatbotResponse};