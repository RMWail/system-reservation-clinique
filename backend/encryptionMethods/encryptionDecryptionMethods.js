
import CryptoJS from 'crypto-js';
import Utf8 from 'crypto-js/enc-utf8.js';

function encryptWithFixedIV(text, secretKey) {
  const iv = CryptoJS.enc.Hex.parse('00000000000000000000000000000000'); // 16 bytes IV
  const cipher = CryptoJS.AES.encrypt(text, CryptoJS.enc.Utf8.parse(secretKey), { iv: iv });
  return cipher.toString();
}

// Decryption function with fixed IV
function decryptWithFixedIV(encryptedText, secretKey) {
  const iv = CryptoJS.enc.Hex.parse('00000000000000000000000000000000'); // 16 bytes IV
  const bytes = CryptoJS.AES.decrypt(encryptedText, CryptoJS.enc.Utf8.parse(secretKey), { iv: iv });
  const decryptedText = bytes.toString(CryptoJS.enc.Utf8);
  return decryptedText;
}


export {
  encryptWithFixedIV,
  decryptWithFixedIV,
}