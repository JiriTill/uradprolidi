import Tesseract from 'tesseract.js';

export async function extractTextFromImage(file) {
  return new Promise((resolve, reject) => {
    Tesseract.recognize(file, 'eng', {
      logger: (m) => console.log(m), // volitelné: loguje průběh
    })
      .then(({ data: { text } }) => {
        resolve(text);
      })
      .catch((err) => {
        console.error('OCR error:', err);
        reject(err);
      });
  });
}
