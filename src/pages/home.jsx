import React, { useState, useEffect } from 'react';
import * as pdfjsLib from 'pdfjs-dist/build/pdf';
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.entry';
import FeedbackForm from '../components/FeedbackForm';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFileAlt, faCamera, faCheckCircle, faSpinner } from '@fortawesome/free-solid-svg-icons';
import Footer from '../components/Footer';

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
          let fullText = '';

          for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
            const page = await pdf.getPage(pageNum);
            const content = await page.getTextContent();
            fullText += content.items.map((item) => item.str).join(' ') + '\n';
          }

          if (fullText.trim().length > 10) {
            setPdfText(fullText);
          } else {
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            const page = await pdf.getPage(1);
            const viewport = page.getViewport({ scale: 2.0 });

            canvas.width = viewport.width;
            canvas.height = viewport.height;
            await page.render({ canvasContext: context, viewport }).promise;
            const imageData = canvas.toDataURL();
            setInputText(imageData);
          }

          setUploadSuccess(true);
        } catch (error) {
          console.error("Chyba při zpracování PDF:", error);
          alert('⚠️ Chyba při čtení PDF. Ujistěte se, že soubor je čitelný.');
        }
      };
      reader.readAsArrayBuffer(file);
    } else if (isImage) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setInputText(reader.result);
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
          setInputText(reader.result);
          setCameraUploadSuccess(true);
          setUploadSuccess(true);
        };
        reader.readAsDataURL(file);
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

    setLoading(true);
    setOutput('');

    try {
      const isImage = inputText.startsWith('data:image/');
      const response = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: isImage ? 'image' : 'text',
          content: isImage ? inputText : pdfText || inputText,
        }),
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
      <div className="bg-blue-50 border-l-4 border-blue-500 rounded-lg p-6 shadow-md mb-6 whitespace-pre-wrap text-gray-800">
        {sections.map((section, index) => (
          <div key={index} className="mb-4 last:mb-0 text-lg">
            {section.trim()}
          </div>
        ))}
      </div>
    );
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.currentTarget.classList.add('border-blue-500', 'bg-blue-50');
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.currentTarget.classList.remove('border-blue-500', 'bg-blue-50');
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.currentTarget.classList.remove('border-blue-500', 'bg-blue-50');
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handlePDFUpload({ target: { files: [files[0]] } });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex flex-col items-center justify-center p-6 font-sans text-gray-800">
      <main className="w-full max-w-3xl bg-white rounded-2xl shadow-xl p-10 my-10">
        <div className="text-center mb-10">
          <h1 className="text-5xl font-extrabold mb-2 text-gray-900">Úřad pro lidi</h1>
          <p className="text-xl text-gray-600">
            Úřady mluví jazykem, kterému rozumí jen úřady. My to přeložíme do člověčiny.
          </p>
        </div>

        <div className="space-y-8">
          {/* Input Section */}
          <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
            <p className="text-lg font-semibold mb-4 text-gray-800">
              Vložte text, nebo nahrajte dokument (PDF nebo fotku):
            </p>

            <textarea
              placeholder="Sem vložte text z úřadu..."
              className="w-full p-4 border border-gray-300 rounded-lg bg-white shadow-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 transition mb-4"
              rows={8}
              value={inputText.startsWith('data:image/') ? '' : inputText}
              onChange={(e) => setInputText(e.target.value)}
            />

            <div
              className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer transition-colors duration-200"
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <div className="flex justify-center items-center mb-2">
                <FontAwesomeIcon icon={faFileAlt} size="2x" className="text-gray-400" />
              </div>
              <p className="text-gray-500 font-medium">
                Přetáhněte sem soubor, nebo klikněte pro nahrání.
              </p>
              <input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={handlePDFUpload}
                className="hidden"
                id="file-upload"
              />
              <label
                htmlFor="file-upload"
                className="mt-4 inline-block bg-blue-100 text-blue-700 font-bold py-2 px-6 rounded-full cursor-pointer hover:bg-blue-200 transition"
              >
                Vybrat soubor
              </label>
            </div>

            {uploadSuccess && (
              <p className="flex items-center text-green-600 mt-4 font-medium">
                <FontAwesomeIcon icon={faCheckCircle} className="mr-2" />
                Soubor byl úspěšně nahrán!
              </p>
            )}

            <div className="mt-6 text-center">
              <button
                type="button"
                className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 rounded-full transition shadow-lg"
                onClick={handleCameraCapture}
              >
                <FontAwesomeIcon icon={faCamera} className="mr-2" />
                Vyfotit dokument mobilem
              </button>
              <p className="text-sm text-gray-500 mt-2">
                Funguje jen na mobilu. Text na fotce musí být dobře čitelný.
              </p>
            </div>
          </div>

          {/* Consent and GDPR Checkboxes */}
          <div className="bg-blue-50 rounded-xl p-6 border border-blue-200 text-sm text-gray-700 space-y-3">
            <label className="flex items-center">
              <input
                type="checkbox"
                className="h-5 w-5 text-blue-600 rounded focus:ring-blue-500"
                checked={consentChecked}
                onChange={(e) => setConsentChecked(e.target.checked)}
              />
              <span className="ml-3">Rozumím, že výstup není právní rada.</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                className="h-5 w-5 text-blue-600 rounded focus:ring-blue-500"
                checked={gdprChecked}
                onChange={(e) => setGdprChecked(e.target.checked)}
              />
              <span className="ml-3">Souhlasím se zpracováním dat.</span>
            </label>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              className={`flex-1 py-4 rounded-full text-lg font-bold transition shadow-lg ${
                consentChecked && gdprChecked
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-gray-400 text-white cursor-not-allowed'
              }`}
              onClick={handleSubmit}
              disabled={!consentChecked || !gdprChecked}
            >
              Přelož do člověčiny
            </button>
            <button
              className="flex-1 bg-white border border-gray-300 text-gray-800 py-4 rounded-full text-lg font-bold hover:bg-gray-100 transition shadow-sm"
              onClick={handleClear}
            >
              Vymazat vše
            </button>
          </div>

          {/* Loading Indicator */}
          {loading && (
            <div className="flex items-center justify-center gap-4 text-blue-600 text-xl font-semibold mt-6">
              <FontAwesomeIcon icon={faSpinner} className="animate-spin" />
              <span>Zpracovávám... ({seconds}s)</span>
            </div>
          )}

          {/* Output Section */}
          {output && (
            <div className="mt-10">
              <h2 className="text-3xl font-bold mb-4 text-gray-900">Výstup:</h2>
              {renderStructuredOutput()}
              <FeedbackForm />
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
