const fs = require("fs");
const path = require("path");
const xlsx = require("node-xlsx").default;
let cwd = path.join(__dirname, "cache");

if (!fs.existsSync(cwd)) {
  fs.mkdirSync(cwd);
}

function loadTempData() {
  let pros = [];
  pros.push(
    new Promise((resolve, reject) => {
      fs.readFile(path.join(cwd, "temp.json"), "utf8", (err, data) => {
        if (err) {
          resolve({});
          return;
        }
        resolve(JSON.parse(data));
      });
    })
  );

  pros.push(
    new Promise((resolve, reject) => {
      fs.readFile(path.join(cwd, "error.json"), "utf8", (err, data) => {
        if (err) {
          resolve([]);
          return;
        }
        resolve(JSON.parse(data));
      });
    })
  );

  return Promise.all(pros);
}

function loadXML(xmlPath) {
  let userData = xlsx.parse(xmlPath);
  let outData = [];
  userData.forEach(item => {
    outData = item.data;
    outData.shift();
    return false;
  });
  outData = outData.filter(item => item.length > 0);
  return outData;
}

function writeXML(data, name) {
  let buffer = xlsx.build([
    {
      name: "Result",
      data: data
    }
  ]);

  return new Promise((resolve, reject) => {
    fs.writeFile(path.join(process.cwd(), name), buffer, err => {
      if (err) {
        reject(err);
        return;
      }
      resolve();
    });
  });
}

function saveDataFile(data) {
  data = JSON.stringify(data, "", 2);

  if (!fs.existsSync(cwd)) {
    fs.mkdirSync(cwd);
  }

  return new Promise((resolve, reject) => {
    fs.writeFile(path.join(cwd, "temp.json"), data, err => {
      if (err) {
        reject(err);
        return;
      }
      resolve();
    });
  });
}

function saveErrorDataFile(data) {
  data = JSON.stringify(data, "", 2);
  if (!fs.existsSync(cwd)) {
    fs.mkdirSync(cwd);
  }

  return new Promise((resolve, reject) => {
    fs.writeFile(path.join(cwd, "error.json"), data, err => {
      if (err) {
        reject(err);
        return;
      }
      resolve();
    });
  });
}

function shuffle(arr) {
  let i = arr.length;
  while (i) {
    let j = Math.floor(Math.random() * i--);
    let temp = arr[j];
    arr[j] = arr[i];
    arr[i] = temp;
  }
}

module.exports = {
  loadTempData,
  loadXML,
  shuffle,
  writeXML,
  saveDataFile,
  saveErrorDataFile
};
