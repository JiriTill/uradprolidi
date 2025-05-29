import React, { useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist/build/pdf';
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.entry';
import { extractTextFromImage } from './ocrUtils';
import Tesseract from 'tesseract.js';

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

export default function Home() {
  const [inputText, setInputText] = useState('');
  const [output, setOutput] = useState('');
  const [pdfText, setPdfText] = useState('');

  const handlePDFUpload = (event) => {
      const file = event.target.files[0];
      if (!file) return;
    
      const isPDF = file.type.includes('pdf');
      const reader = new FileReader();
    
      if (isPDF) {
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
    
            setPdfText(fullText);
          } catch (error) {
            console.error("Chyba při zpracování PDF:", error);
            alert('⚠️ Chyba při čtení PDF. Ujistěte se, že soubor je čitelný.');
          }
        };
        reader.readAsArrayBuffer(file);
      } else {
        // 🧠 Zde přidáváme rozpoznávání obrázku pomocí OCR
        Tesseract.recognize(file, 'ces', {
          logger: (m) => console.log(m),
        }).then(({ data: { text } }) => {
          if (text.trim()) {
            setPdfText(text);
          } else {
            alert('⚠️ Text na obrázku nebyl rozpoznán. Zkuste to prosím znovu.');
          }
        }).catch((err) => {
          console.error("Chyba při čtení obrázku:", err);
          alert('⚠️ Chyba při čtení obrázku.');
        });
      }
    };

  
   const handleCameraCapture = async () => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.capture = 'environment'; // otevře zadní kameru na mobilu
    
      input.onchange = async (event) => {
        const file = event.target.files[0];
        if (file) {
          try {
            const text = await extractTextFromImage(file);
            setPdfText(text); // uložíme OCR výstup jako kdyby to byl PDF text
          } catch (err) {
            alert('⚠️ Nepodařilo se rozpoznat text z obrázku.');
          }
        }
      };
    
      input.click();
    };



  const handleSubmit = async () => {
    const combinedText = pdfText || inputText;

    if (!combinedText.trim()) {
      alert("Zadejte text nebo nahrajte PDF.");
      return;
    }

    setOutput("Překládám...");

    try {
      const response = await fetch("/api/simplify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ input: combinedText }),
      });

      const data = await response.json();
      setOutput(data.result || "⚠️ Chyba při zpracování.");
    } catch (err) {
      setOutput("⚠️ Došlo k chybě při překladu. Zkuste to prosím znovu.");
    }
  };

  const handleClear = () => {
    setInputText('');
    setOutput('');
    setPdfText('');
  };

  const renderStructuredOutput = () => {
    if (!output) return null;

    const sections = output.split(/(?=\d+\.\s)/g);

    return sections.map((section, index) => {
      const trimmed = section.trim();

      if (trimmed.toLowerCase().startsWith("6.")) {
        const content = trimmed.replace(/^6\.\s*Shrnutí.*?:\s*/i, "");

        const aMatch = content.match(/O co se jedná\??(.*?)(?=Co se po mně chce\?|$)/s);
        const bMatch = content.match(/Co se po mně chce\??(.*?)(?=Do kdy to mám udělat\?|$)/s);
        const cMatch = content.match(/Do kdy to mám udělat\??(.*?)(?=Jak to mám udělat\?|$)/s);
        const dMatch = content.match(/Jak to mám udělat\??(.*)/s);

        const parts = [
          { title: "a) O co se jedná?", text: aMatch?.[1]?.trim() },
          { title: "b) Co se po mně chce?", text: bMatch?.[1]?.trim() },
          { title: "c) Do kdy to mám udělat?", text: cMatch?.[1]?.trim() },
          { title: "d) Jak to mám udělat?", text: dMatch?.[1]?.trim() },
        ];

        return (
          <div key={index} className="bg-white border rounded shadow p-4 mb-4">
            <h3 className="text-lg font-semibold mb-4">Shrnutí obsahu dopisu jednoduchou češtinou:</h3>
            <div className="space-y-4">
              {parts.map(
                (part, i) =>
                  part.text && (
                    <div key={i} className="bg-gray-50 border rounded p-3">
                      <h4 className="font-semibold text-gray-700 mb-1">{part.title}</h4>
                      <p className="text-gray-800 whitespace-pre-wrap">{part.text}</p>
                    </div>
                  )
              )}
            </div>
          </div>
        );
      }

      return (
        <div key={index} className="bg-white border rounded shadow p-4 mb-4">
          <p className="whitespace-pre-wrap text-gray-800">{trimmed.replace(/^\d+\.\s*/, '')}</p>
        </div>
      );
    });
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-between">
      <main className="p-6 font-sans flex-grow flex items-center justify-center">
        <div className="max-w-2xl w-full bg-white rounded-lg shadow-md p-8">
          <h1 className="text-4xl font-bold mb-2 text-center text-gray-900">Úřad pro lidi</h1>
          <p className="mb-6 text-center text-gray-700">
            Úřady mluví jazykem, kterému rozumí jen úřady. My to přeložíme do člověčiny.
          </p>

          <p className="font-medium text-gray-800 mb-2">
            Vložte text nebo nahrajte čitelný PDF soubor (nikoli sken dokumentu):
          </p>

         <p className="font-medium text-gray-800 mb-2">
              Vyberte jednu z možností pro nahrání dokumentu:
            </p>
            
            <div className="flex flex-col gap-4 mb-4">
              {/* Textové pole */}
              <textarea
                placeholder="Sem vložte text z úřadu..."
                className="p-4 border border-gray-300 rounded bg-white shadow resize-none"
                rows={8}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
              />
            
              {/* Nahrání souboru (PDF nebo obrázku) */}
              <div>
                <label className="block mb-1 text-gray-700 font-medium">Nahrát PDF nebo fotku dokumentu (.pdf, .jpg, .png):</label>
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={handlePDFUpload}
                  className="block"
                />
              </div>
            
              {/* Focení dokumentu mobilem */}
              <div>
                <button
                  type="button"
                  className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded transition"
                  onClick={handleCameraCapture}
                >
                  📷 Vyfotit dokument mobilem
                </button>
                <p className="text-sm text-gray-600 mt-1">Funguje jen na mobilu. Text na fotce musí být dobře čitelný.</p>
              </div>
            </div>


          <div className="bg-gray-50 rounded border p-4 mb-6 text-sm text-gray-700 space-y-2">
            <label className="block">
              <input type="checkbox" className="mr-2" /> Rozumím, že výstup není právní rada.
            </label>
            <label className="block">
              <input type="checkbox" className="mr-2" /> Souhlasím se zpracováním dat podle GDPR.
            </label>
          </div>

          <div className="flex gap-4 mb-4">
            <button
              className="flex-1 bg-blue-600 text-white py-3 rounded-lg text-lg font-semibold hover:bg-blue-700 transition shadow"
              onClick={handleSubmit}
            >
              Přelož do člověčiny
            </button>
            <button
              className="flex-1 bg-gray-300 text-gray-800 py-3 rounded-lg text-lg font-semibold hover:bg-gray-400 transition shadow"
              onClick={handleClear}
            >
              Vymazat vše
            </button>
          </div>

          {output && (
            <div className="mt-10">
              <h2 className="text-2xl font-semibold mb-4 text-gray-800">Výstup:</h2>
              {renderStructuredOutput()}
            </div>
          )}
        </div>
      </main>

      <footer className="text-center text-sm text-gray-500 py-4">
        <div className="space-x-4">
          <a href="/o-projektu" className="hover:underline">O projektu</a>
          <a href="/jak-to-funguje" className="hover:underline">Jak to funguje</a>
          <a href="/gdpr" className="hover:underline">Zpracování dat</a>
        </div>
        <p className="mt-2">&copy; {new Date().getFullYear()} Úřad pro lidi</p>
      </footer>
    </div>
  );
}
