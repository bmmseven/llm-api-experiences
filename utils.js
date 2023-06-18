import fs from "fs";
import {
  HumanChatMessage,
  SystemChatMessage,
  AIChatMessage,
} from "langchain/schema";
export class Utils {
  static readFiles(dirname) {
    return new Promise((resolve, reject) => {
      const folderContent = {};
      const filePromises = [];
      fs.readdir(dirname, function (err, filenames) {
        if (err) {
          reject(err);
          return;
        }
        filenames.forEach(function (filename) {
          filePromises.push(Utils.readFile(dirname, filename));
        });
        Promise.all(filePromises)
          .then((files) => {
            files.forEach((file) => {
              folderContent[file.filename] = file.content;
            });
            resolve(folderContent);
          })
          .catch((err) => {
            reject(err);
          });
      });
    });
  }
  static readFile(dirname, filename) {
    return new Promise((resolve, reject) => {
      fs.readFile(dirname + filename, "utf-8", function (err, content) {
        if (err) {
          reject(err);
          return;
        }
        resolve({
          filename: filename,
          content: content,
        });
      });
    });
  }

  static async huggingFaceApiCall(chat = [], model, temperature, apiKey) {
    let input = "";
    //Create the input from the chat
    if (
      model == "stabilityai/stablelm-tuned-alpha-7b" ||
      model == "stabilityai/stablelm-base-alpha-7b"
    ) {
      //"inputs": "Can you please let us know more details about your ",
      chat.forEach((message) => {
        console.log("MESSAGE TYPE");
        console.log(message.constructor.name);
        if (message.constructor.name == "HumanChatMessage") {
          input += "<|USER|>" + message.text + " ";
        } else if (message.constructor.name == "SystemChatMessage") {
          input += "<|SYSTEM|>" + message.text + " ";
        } else if (message.constructor.name == "AIChatMessage") {
          input += "<|ASSISTANT|>" + message.text;
        } else {
          console.warn("Unknown message type");
        }
      });
    }
    const response = await fetch(
      "https://api-inference.huggingface.co/models/" + model,
      {
        headers: {
          Authorization: "Bearer " + apiKey,
        },
        method: "POST",
        body: JSON.stringify({
          inputs: input,
          parameters: {
            temperature: temperature,
          },
        }),
      }
    );
    const result = await response.json();
    console.log("RESULT");
    if(result.error) {
      console.log(result.error);
      return result.error;
    }
    console.log(result);
    return result;
  }
}
