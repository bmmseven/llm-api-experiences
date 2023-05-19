import fs from "fs";
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
};
