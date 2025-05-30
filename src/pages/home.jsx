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
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-8">
      <h1 className="text-3xl font-bold text-center mb-4">Úřad pro lidi</h1>
      <textarea
        className="w-full max-w-xl p-3 border rounded mb-4"
        rows={5}
        placeholder="Zde vložte text nebo nahrajte dokument."
        value={inputText.startsWith('data:image/') ? '' : inputText}
        onChange={(e) => setInputText(e.target.value)}
      />

      <input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={handlePDFUpload} className="mb-4" />

      <button
        className="mb-2 px-4 py-2 bg-green-600 text-white rounded"
        onClick={handleCameraCapture}
      >
        {cameraUploadSuccess ? '✅ Správně nahráno' : '📷 Vyfotit dokument mobilem'}
      </button>

      <div className="flex gap-2 mb-4">
        <label><input type="checkbox" checked={consentChecked} onChange={(e) => setConsentChecked(e.target.checked)} /> Souhlasím s podmínkami</label>
        <label><input type="checkbox" checked={gdprChecked} onChange={(e) => setGdprChecked(e.target.checked)} /> GDPR</label>
      </div>

      <div className="flex gap-4 mb-6">
        <button
          className={`px-6 py-2 rounded text-white ${consentChecked && gdprChecked ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-400 cursor-not-allowed'}`}
          onClick={handleSubmit}
          disabled={!consentChecked || !gdprChecked}
        >
          Přelož do člověčiny
        </button>
        <button
          className="px-6 py-2 bg-gray-300 text-black rounded hover:bg-gray-400"
          onClick={handleClear}
        >
          Vymazat vše
        </button>
      </div>

      {loading && <div className="text-blue-600 mb-4">🔄 Zpracovávám... ({seconds}s)</div>}

      {output && (
        <div className="w-full max-w-2xl">
          <h2 className="text-xl font-semibold mb-4">📄 Výstup:</h2>
          {renderStructuredOutput()}

          {!feedbackSubmitted && (
            <div className="mt-8 bg-gray-100 border rounded p-4">
              <p className="text-gray-800 font-medium mb-2">Byl pro vás výstup srozumitelný?</p>
              <div className="flex gap-4 mb-3">
                <button
                  className={`py-2 px-4 rounded ${feedbackChoice === 'yes' ? 'bg-green-600 text-white' : 'bg-gray-200'}`}
                  onClick={() => {
                    setFeedbackChoice('yes');
                    setFeedbackVisible(true);
                  }}
                >
                  Ano 👍
                </button>
                <button
                  className={`py-2 px-4 rounded ${feedbackChoice === 'no' ? 'bg-red-600 text-white' : 'bg-gray-200'}`}
                  onClick={() => {
                    setFeedbackChoice('no');
                    setFeedbackVisible(true);
                  }}
                >
                  Ne 👎
                </button>
              </div>

              {feedbackVisible && (
                <>
                  <textarea
                    rows={3}
                    className="w-full p-2 border border-gray-300 rounded mb-2"
                    placeholder="Chcete něco dodat?"
                    value={feedbackComment}
                    onChange={(e) => setFeedbackComment(e.target.value)}
                  />
                  <button
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                    onClick={handleFeedbackSubmit}
                  >
                    Odeslat zpětnou vazbu
                  </button>
                </>
              )}
            </div>
          )}

          {feedbackSubmitted && (
            <div className="mt-4 text-green-700 font-semibold">
              Děkujeme za vaši zpětnou vazbu! 🙏
            </div>
          )}
        </div>
      )}
    </div>
  );
}
