import fs from "fs";
import {
  HumanMessage,
  SystemMessage,
  AIMessage,
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

  static async huggingFaceApiCall(
    chat = [],
    model,
    temperature,
    apiKey,
    modelsURLS = {
      default:
        "https://sa5f263ws6d0mmwu.us-east-1.aws.endpoints.huggingface.cloud", //"https://api-inference.huggingface.co/models/",
      "upstage/Llama-2-70b-instruct-v2":
        "https://sa5f263ws6d0mmwu.us-east-1.aws.endpoints.huggingface.cloud",
    }
  ) {
    /*
curl https://sa5f263ws6d0mmwu.us-east-1.aws.endpoints.huggingface.cloud \
-X POST \
-d '{"inputs":"My name is Julien and I like to"}' \
-H "Authorization: Bearer <hf_token>" \
-H "Content-Type: application/json"
*/

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

        if (message.constructor.name == "HumanMessage") {
          input += "<|USER|>" + message.text + " ";
        } else if (message.constructor.name == "SystemMessage") {
          input += "<|SYSTEM|>" + message.text + " ";
        } else if (message.constructor.name == "AIMessage") {
          input += "<|ASSISTANT|>" + message.text;
        } else {
          console.warn("Unknown message type");
        }
      });
    } else if (model == "upstage/Llama-2-70b-instruct-v2" || model == "meta-llama/Llama-2-70b-chat-hf") {
      chat.forEach((message) => {
        //console.log("MESSAGE TYPE");
        //console.log(message.constructor.name);
        if (message.constructor.name == "HumanMessage") {
          input += "### User:\n" + message.text + "\n\n";
        } else if (message.constructor.name == "SystemMessage") {
          input += "### System:\n" + message.text + "\n\n";
        } else if (message.constructor.name == "AIMessage") {
          input += "### Assistant:\n" + message.text + "\n\n";
        } else {
          console.warn("Unknown message type");
        }
      });
    }
    //end with an assistant
    input += "### Assistant:\n"
    console.log("HUGGING FACE RAW PROMPT");
    console.log(input);
    const response = await fetch(modelsURLS[model] ?? modelsURLS["default"], {
      headers: {
        //Authorization: "Bearer " + apiKey,
        "Content-Type": "application/json",
      },
      method: "POST",
      body: JSON.stringify({
        inputs: input,
        parameters: {
          temperature: 1,
        },
      }),
    });
    const result = await response.text();
    console.log("RESULT");
    if (result.error) {
      console.log(result.error);
      return result.error;
    }
    let parsedResult = "";
    if (typeof result === "string") {
      parsedResult = JSON.parse(result);
    }
    /*console.log(
      parsedResult,
      Array.isArray(parsedResult),
      parsedResult[0].generated_text
    );*/
    return {
      text: parsedResult[0].generated_text,
    };
  }
}
