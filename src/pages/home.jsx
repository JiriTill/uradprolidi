import React, { useState, useEffect } from 'react';
import * as pdfjsLib from 'pdfjs-dist/build/pdf';
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.entry';
import Tesseract from 'tesseract.js';

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

export default function Home() {
  const [inputText, setInputText] = useState('');
  const [output, setOutput] = useState('');
  const [pdfText, setPdfText] = useState('');
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [cameraUploadSuccess, setCameraUploadSuccess] = useState(false);
  const [consentChecked, setConsentChecked] = useState(false);
  const [gdprChecked, setGdprChecked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [feedbackVisible, setFeedbackVisible] = useState(false);
  const [feedbackChoice, setFeedbackChoice] = useState(null);
  const [feedbackComment, setFeedbackComment] = useState('');
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);

  useEffect(() => {
    let timer;
    if (loading) {
      timer = setInterval(() => setSeconds((s) => s + 1), 1000);
    } else {
      clearInterval(timer);
      setSeconds(0);
    }
    return () => clearInterval(timer);
  }, [loading]);

  const handlePDFUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const isPDF = file.type === 'application/pdf';
    const isImage = file.type.startsWith('image/');

    if (isPDF) {
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(reader.result) });
          const pdf = await loadingTask.promise;
          const page = await pdf.getPage(1);
          const content = await page.getTextContent();
          const fullText = content.items.map((item) => item.str).join(' ').trim();

          if (fullText.length > 10) {
            setPdfText(fullText);
            setUploadSuccess(true);
            return;
          }

          const viewport = page.getViewport({ scale: 2.0 });
          const canvas = document.createElement('canvas');
          const context = canvas.getContext('2d');
          canvas.width = viewport.width;
          canvas.height = viewport.height;

          await page.render({ canvasContext: context, viewport }).promise;
          const dataUrl = canvas.toDataURL();

          setUploadSuccess(true);
          setInputText(dataUrl);
        } catch (error) {
          console.error("Chyba při zpracování PDF:", error);
          alert('⚠️ Chyba při čtení PDF. Ujistěte se, že soubor je čitelný.');
        }
      };
      reader.readAsArrayBuffer(file);
    } else if (isImage) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64Image = reader.result;
        setInputText(base64Image);
        setUploadSuccess(true);
      };
      reader.readAsDataURL(file);
    } else {
      alert('⚠️ Podporovány jsou pouze PDF a obrázky.');
    }
  };

  const handleCameraCapture = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.capture = 'environment';
    input.style.display = 'none';

    input.addEventListener('change', async (event) => {
      const file = event.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64Image = reader.result;
          setInputText(base64Image);
          setCameraUploadSuccess(true);
          setUploadSuccess(true);
        };
        reader.readAsDataURL(file);
      } else {
        alert('⚠️ Nebyl vybrán žádný soubor.');
      }
    });

    document.body.appendChild(input);
    input.click();
    document.body.removeChild(input);
  };

  const handleSubmit = async () => {
    if (!inputText && !pdfText) {
      alert('⚠️ Nezadal jsi žádný text ani nenahrál dokument.');
      return;
    }

    setOutput('');
    setLoading(true);

    try {
      const isImage = inputText.startsWith('data:image/');
      const payload = {
        type: isImage ? 'image' : 'text',
        content: isImage ? inputText : pdfText || inputText,
      };

      const response = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      setOutput(data.result || '⚠️ Odpověď je prázdná.');
    } catch (error) {
      console.error(error);
      setOutput('⚠️ Došlo k chybě při komunikaci se serverem.');
    } finally {
      setLoading(false);
    }
  };

  const handleFeedbackSubmit = async () => {
    try {
      const payload = {
        časové_razítko: new Date().toLocaleString(),
        zpráva: feedbackComment,
        spokojenost: feedbackChoice === 'yes' ? '👍 Spokojen/a' : '👎 Nespokojen/a',
        zařízení: navigator.userAgent,
        prohlížeč: navigator.vendor,
      };

      await fetch('https://api.sheetbest.com/sheets/46b92d04-c7d1-421e-baf5-fb6a64394214', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      setFeedbackSubmitted(true);
    } catch (error) {
      alert('⚠️ Nepodařilo se odeslat zpětnou vazbu.');
      console.error(error);
    }
  };

  const handleClear = () => {
    setInputText('');
    setOutput('');
    setPdfText('');
    setUploadSuccess(false);
    setCameraUploadSuccess(false);
    setConsentChecked(false);
    setGdprChecked(false);
    setLoading(false);
    setSeconds(0);
  };

  const renderStructuredOutput = () => {
    if (!output) return null;

    const sections = output.split(/(?=🏛️|👤|🆔|📬|🧾|🟨|📌|📣|📎)/g);

    return (
      <div className="bg-white border rounded shadow p-4 mb-4 whitespace-pre-wrap text-gray-800">
        {sections.map((section, index) => (
          <div key={index} className="mb-3">
            {section.trim()}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <h1 className="text-xl font-bold text-center text-red-600">Chybí návratový obsah. Uprav soubor tak, aby obsahoval validní JSX.</h1>
    </div>
  );
}

