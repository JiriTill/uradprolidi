import './style.css';
import React, { useState } from 'react';
import ReactDOM from 'react-dom/client';
import * as pdfjsLib from 'pdfjs-dist';
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.entry';

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

function App() {
  const [inputText, setInputText] = useState('');
  const [output, setOutput] = useState('');
  const [pdfText, setPdfText] = useState('');

  const handlePDFUpload = (event) => {
    const file = event.target.files[0];
    if (!file || !file.type.includes('pdf')) return;

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

        setPdfText(fullText);
      } catch (error) {
        console.error("Chyba při zpracování PDF:", error);
        alert('⚠️ Chyba při čtení PDF. Ujistěte se, že soubor je čitelný.');
      }
    };
    reader.readAsArrayBuffer(file);
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

  const renderStructuredOutput = () => {
    if (!output) return null;

    const sections = output.split(/(?=\d+\.\s)/g);

    return sections.map((section, index) => {
      const trimmed = section.trim();

      if (trimmed.toLowerCase().startsWith("6.")) {
        const content = trimmed.replace(/^6\.\s*Shrnutí obsahu dopisu jednoduchou češtinou:\s*/i, "");

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
    <div className="min-h-screen bg-gray-100 py-10 px-4 font-sans flex justify-center">
      <div className="w-full max-w-3xl">
        <h1 className="text-4xl font-bold mb-4 text-gray-900 text-center">Úřad pro lidi</h1>
        <p className="mb-6 text-gray-700 text-center">
          Úřady mluví jazykem, kterému rozumí jen úřady. My to přeložíme do člověčiny.
        </p>

        <p className="mb-2 text-gray-700 font-medium">
          Vložte text nebo nahrajte čitelný PDF soubor (nikoli sken dokumentu):
        </p>

        <div className="flex flex-col sm:flex-row sm:space-x-4 mb-4">
          <textarea
            placeholder="Sem vložte text z úřadu..."
            className="flex-1 p-4 border border-gray-300 rounded bg-white shadow mb-4 sm:mb-0"
            rows={10}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
          />
          <input
            type="file"
            accept=".pdf"
            onChange={handlePDFUpload}
            className="self-start sm:self-auto"
          />
        </div>

        <div className="mb-6 text-sm text-gray-600 space-y-2">
          <label className="block">
            <input type="checkbox" className="mr-2" /> Rozumím, že výstup není právní rada.
          </label>
          <label className="block">
            <input type="checkbox" className="mr-2" /> Souhlasím se zpracováním dat podle GDPR.
          </label>
        </div>

        <button
          className="bg-blue-600 text-white text-lg px-8 py-3 rounded hover:bg-blue-700 transition mb-10 shadow w-full sm:w-auto"
          onClick={handleSubmit}
        >
          Přelož do člověčiny
        </button>

        {output && (
          <div>
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">Výstup:</h2>
            {renderStructuredOutput()}
          </div>
        )}
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
