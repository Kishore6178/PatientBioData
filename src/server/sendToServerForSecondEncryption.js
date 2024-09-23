import CryptoJS from 'crypto-js'

const sendToServerForSecondEncryption = {
    encryptFirstCipherText: (firstCipherText, sender, medicalReportId) => {
        let hash = CryptoJS.SHA256(firstCipherText).toString(CryptoJS.enc.Hex)
        let secondCipherText = CryptoJS.AES.encrypt(firstCipherText, hash).toString();
        localStorage.setItem(sender+medicalReportId, hash)
        return secondCipherText
    },
    decryptSecondCipherText: (secondCipherText, sender, medicalReportId) => {
        let hash = localStorage.getItem(sender + medicalReportId)
        let firstCipherText = CryptoJS.AES.decrypt(secondCipherText, hash).toString(CryptoJS.enc.Utf8);
        return firstCipherText
    }
}

export default sendToServerForSecondEncryption



// const sendToServerForSecondEncryption = {
//     encryptFirstCipherText: (cipherText, account, medReportId) => {
//       // Mock encryption logic on server side
//       return `encrypted(${cipherText})`;  // Simulate encryption
//     },
//     decryptSecondCipherText: (cipherText, sender, medReportId) => {
//       // Mock decryption logic
//       return `decrypted(${cipherText})`;  // Simulate decryption
//     }
//   };
  
//   export default sendToServerForSecondEncryption;
  