import { Configuration, OpenAIApi } from "openai";
import * as readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import keypress from "keypress";
import { Utils as utils } from "./utils.js";
import { OpenAI } from "langchain/llms/openai";
const rl = readline.createInterface({ input, output });
import fs from "fs";
import { ChatOpenAI } from "langchain/chat_models/openai";
import {
  HumanChatMessage,
  SystemChatMessage,
  AIChatMessage,
} from "langchain/schema";
keypress(input);
// Include list of API commands

// Loop through list of promts
// For each prompt, inject the list of API commands
// Loop through list of user_prompts, each line is a new user prompt
// Save the output to a file, if the experience need additional input from the user, ask it before saving it
// Repeat until all prompts are done

/*const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);*/

let experimentFinished = false;

/*input.on("keypress", function (ch, key) {
  //console.log('got "keypress"', key);
  if (key && key.ctrl && key.name == "c") {
    input.pause();
  } else if (key && key.name == "right") {
    console.log('Processing to the next system prompt + user prompt combination')
    experimentFinished = true;
  }
});*/

/*const model = new OpenAI({
  modelName: "gpt-4",
  temperature: 0.7,
  maxTokens: 1000,
  maxRetries: 5,
});*/

const modelName = "gpt-4";
const modelTemperature = 0;
const modelMaxTokens = 1000;

const chat = new ChatOpenAI({
  temperature: modelTemperature,
  maxTokens: modelMaxTokens,
  maxRetries: 5,
  modelName: modelName,
  openAIApiKey: "INSERT_OPEN_AI_API_KEY",
});

//Store system prompts
let system = {};

//Store user prompts
let user = {};

//load the system prompts
system = await utils.readFiles("system_prompts/");

//load the user prompts
user = await utils.readFiles("user_prompts/");

const systemKeys = Object.keys(system);
const userKeys = Object.keys(user);

let chatMemory = [];
let fileReady = false;

let experimentTimestamp = Date.now();
let experimentFileName = "experiment_" + experimentTimestamp + ".txt";

var fileStream = fs.createWriteStream("./results/" + experimentFileName);
fileStream.once("open", async function (fd) {
  console.log("Ready to write to file: " + experimentFileName);
  fileStream.write("=========================================\n");
  fileStream.write(
    "|                                                          |\n"
  );
  fileStream.write(
    "|       EXPERIMENT WITH LLM TO INTERACT WITH API TOOLS     |\n"
  );
  fileStream.write(
    "|                    " + experimentTimestamp + "               |\n"
  );
  fileStream.write(
    "|                                                          |\n"
  );
  fileStream.write("=========================================\n");
  fileStream.write("ENVIRONMENT:\n");
  fileStream.write("LLM model name: " + modelName + "\n");
  fileStream.write("LLM temperature: " + modelTemperature + "\n");
  fileStream.write("LLM max tokens: " + modelMaxTokens + "\n");
  fileStream.write("=========================================\n");

  let experimentIndex = 0;

  console.log("Welcome to the LLM API tool interaction experiment!");
  console.log(
    "Press the RIGHT ARROW key to move to the next experiment (when the LLM finishes with the right API command or fails)."
  );

  for (let pi = 0; pi < systemKeys.length; pi++) {
    console.log("TESTING SYSTEM PROMPT: " + systemKeys[pi]);
    fileStream.write("TESTING SYSTEM PROMPT: " + systemKeys[pi] + "\n\n\n");
    const systemPrompt = system[systemKeys[pi]].replace("{user_input}", "");
    for (let ui = 0; ui < userKeys.length; ui++) {
      var separateUserPrompts = user[userKeys[ui]].split(/\r?\n|\r|\n/g);
      for (let si = 0; si < separateUserPrompts.length; si++) {
        //restart the experiment
        experimentFinished = false;
        experimentIndex++;
        console.log("TESTING USER PROMPT: " + userKeys[ui] + " - " + si);
        fileStream.write("EXPERIMENT " + experimentIndex + " ====\n");
        let userPrompt = separateUserPrompts[si];
        chatMemory = [
          new SystemChatMessage(systemPrompt),
          new HumanChatMessage(userPrompt),
        ];
        console.log("USER: " + userPrompt);
        while (!experimentFinished) {
          console.log("AI: (thinking...)");
          const res = await chat.call(chatMemory);
          //console.log(res);
          console.log("AI: " + res.text);
          chatMemory.push(new AIChatMessage(res.text));
          //Save the output to a file, if the experience need additional input from the user, ask it before saving it
          userPrompt = await rl.question("USER: ");
          if (userPrompt == "") {
            console.log(
              "Processing to the next system prompt + user prompt combination"
            );
            experimentFinished = true;
          } else {
            chatMemory.push(new HumanChatMessage(userPrompt));
          }
        }

        //Save the output to a file
        for (let i = 0; i < chatMemory.length; i++) {
          fileStream.write(
            (chatMemory[i].constructor.name == "SystemChatMessage"
              ? "SYSTEM PROMPT\n"
              : chatMemory[i].constructor.name == "HumanChatMessage"
              ? "USER: "
              : "AI: ") +
              chatMemory[i].text +
              "\n"
          );
        }
        fileStream.write("\n\n\n");
      }
    }
    //Testing another prompt
    fileStream.write("=====\n====\n\n\n");
  }

  fileStream.end();
  rl.close();
});

/*forEach(async function (systemkey) {
  //console.log(system[systemkey]);

  await Object.keys(user).forEach(async function (userkey) {
    console.log("GOAL: " + userkey);
    var separateUserPrompts = user[userkey].split(/\r?\n|\r|\n/g);
    //Inject the user prompts into the system prompt
    await separateUserPrompts.forEach(async function (userprompt) {
      //Inject the user prompt into the system prompt
      //if its a chat model, we need to remove the {user_input} from the system prompt
      let prompt = system[systemkey].replace("{user_input}", "");
      console.log("USER: " + userprompt);
      console.log("AI: (thinking...)");
      const res = await chat.call([
        new SystemChatMessage(prompt),
        new HumanChatMessage(userprompt),
      ]);

      console.log(res);
      console.log("AI: " + res.text);
      process.exit(0);
    });
  });
});*/

/*const answer =
console.log(`Thank you for your valuable feedback: ${answer}`);

*/
