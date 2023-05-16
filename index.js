const { Configuration, OpenAIApi } = require("openai");

// Include list of API commands

// Loop through list of promts
// For each prompt, inject the list of API commands
// Loop through list of user_prompts, each line is a new user prompt
// Save the output to a file, if the experience need additional input from the user, ask it before saving it
// Repeat until all prompts are done


const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

