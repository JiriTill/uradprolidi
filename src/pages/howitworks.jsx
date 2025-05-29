import React from 'react';

export default function HowItWorksPage() {
  return (
    <div className="p-8 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">Jak to funguje</h1>
      <ol className="list-decimal pl-5 space-y-3 text-gray-800">
        <li>
          Vložte text úředního dopisu do textového pole nebo nahrajte čitelný PDF soubor (ne sken).
        </li>
        <li>
          Potvrďte, že rozumíte, že výstup není právní rada, a že souhlasíte s podmínkami zpracování dat.
        </li>
        <li>
          Klikněte na tlačítko <strong>"Přelož do člověčiny"</strong>. Text se odešle ke zpracování umělé inteligenci.
        </li>
        <li>
          Výstupem je jednoduchý souhrn: o co se jedná, co se po vás chce, do kdy a jak to máte udělat.
        </li>
      </ol>
      <p className="mt-6 text-sm text-gray-600">
        Celý proces probíhá anonymně a žádná data se neukládají.
      </p>
    </div>
  );
}
