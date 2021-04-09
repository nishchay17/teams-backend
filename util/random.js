const crypto = require("crypto");

exports.getRandomNumber = (max, min) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

exports.getJoiningID = (length = 10) => {
  return crypto.randomBytes(length).toString("hex");
};
