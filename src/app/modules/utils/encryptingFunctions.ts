import CryptoJS from 'crypto-js';

const encryptText = (key, text) => {
  const encryptedText = CryptoJS.AES.encrypt(text, key).toString();
  return encryptedText;
}

const decryptText = (key, encryptedText) => {
  try {
    const bytes = CryptoJS.AES.decrypt(encryptedText, key);
    const decryptedText = bytes.toString(CryptoJS.enc.Utf8);
    return decryptedText;
  } catch (error) {
    console.error('Decryption error:', error);
    return null;
  }
}

const encDecKey = "Hnbxyq9q1qwXGJ3Kfc7xsparyBPLS5Mt4w+rZHr";

export { encryptText, decryptText, encDecKey };
