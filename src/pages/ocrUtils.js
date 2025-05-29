import Tesseract from 'tesseract.js';

export const recognizeImageText = async (file) => {
  return new Promise((resolve, reject) => {
    Tesseract.recognize(
      file,
      'eng',
      {
        logger: (m) => console.log(m), // můžeš smazat pro produkci
      }
    ).then(({ data: { text } }) => {
      resolve(text);
    }).catch((err) => {
      reject(err);
    });
  });
};
