import React, { useState } from 'react';
import ReactDOM from 'react-dom/client';

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
        const pdfjsLib = await import('pdfjs-dist/build/pdf');
        pdfjsLib.GlobalWorkerOptions.workerSrc =
          'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.worker.min.js';

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
        alert('Chyba při čtení PDF');
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
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer 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`,
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "Jsi pomocník, který překládá úřednickou řeč do jednoduché a srozumitelné češtiny pro běžné občany.",
          },
          {
            role: "user",
            content: `Přelož do srozumitelné češtiny:\n\n${combinedText}`,
          },
        ],
        temperature: 0.7,
        max_tokens: 1024,
      }),
    });

    const data = await response.json();

    if (data.choices && data.choices[0]) {
      setOutput(data.choices[0].message.content.trim());
    } else {
      throw new Error("Neplatná odpověď od OpenAI.");
    }
  } catch (error) {
    console.error("Chyba při volání OpenAI:", error);
    setOutput("⚠️ Došlo k chybě při překladu. Zkuste to prosím znovu.");
  }
};

  return (
    <div className="p-6 max-w-3xl mx-auto font-sans">
      <h1 className="text-3xl font-bold mb-4">Úřad pro lidi</h1>
      <p className="mb-6 text-gray-700">
        Úřady mluví jazykem, kterému rozumí jen úřady. My to přeložíme do člověčiny.
      </p>

      <textarea
        placeholder="Sem vložte text z úřadu..."
        className="w-full p-4 border border-gray-300 rounded mb-4"
        rows={6}
        value={inputText}
        onChange={(e) => setInputText(e.target.value)}
      />

      <input
        type="file"
        accept=".pdf"
        onChange={handlePDFUpload}
        className="mb-4"
      />

      <div className="mb-4 text-sm text-gray-600">
        <label className="block mb-1">
          <input type="checkbox" className="mr-2" /> Rozumím, že výstup není právní rada.
        </label>
        <label className="block">
          <input type="checkbox" className="mr-2" /> Souhlasím se zpracováním dat podle GDPR.
        </label>
      </div>

      <button
        className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition"
        onClick={handleSubmit}
      >
        Přelož do člověčiny
      </button>

      {output && (
        <div className="mt-6 p-4 border border-gray-200 rounded bg-gray-50 whitespace-pre-wrap">
          <h2 className="font-semibold mb-2">Výstup:</h2>
          {output}
        </div>
      )}
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
