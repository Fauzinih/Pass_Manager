import CryptoJS from 'crypto-js';

const SECRET_KEY = 'sb_secret_3ks5ZNG7a4swuF6tpfLEHA_JcbEMiel'; 

export const encryptPassword = (password) => {
  return CryptoJS.AES.encrypt(password, SECRET_KEY).toString();
};

export const decryptPassword = (ciphertext) => {
  const bytes = CryptoJS.AES.decrypt(ciphertext, SECRET_KEY);
  const originalText = bytes.toString(CryptoJS.enc.Utf8);
  return originalText;
};