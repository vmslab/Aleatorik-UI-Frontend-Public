const aes = require("crypto-js/aes");
const enc = require("crypto-js/enc-utf8");

const PASSPHRASE = "#!@#JFDSREW312jksdf";

module.exports = {
  encrypt: text => {
    const result = aes.encrypt(text, PASSPHRASE);
    return result.toString();
  },
  decrypt: text => {
    const result = aes.decrypt(text, PASSPHRASE);
    return result.toString(enc);
  },
};
