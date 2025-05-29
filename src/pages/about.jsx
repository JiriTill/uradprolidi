import React from 'react';

export default function AboutPage() {
  return (
    <div className="p-8 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">O projektu</h1>
      <p className="mb-4">
        Projekt <strong>Úřad pro lidi</strong> vznikl jako reakce na složitý a často nesrozumitelný jazyk úředních dokumentů.
        Naším cílem je pomoci běžným lidem lépe porozumět dopisům z úřadů, aniž by museli studovat zákony nebo platit právníky.
      </p>
      <p className="mb-4">
        Aplikace využívá moderní umělou inteligenci k tomu, aby přeložila úřední řeč do "člověčiny".
        Vše probíhá bez nutnosti registrace, rychle a zdarma.
      </p>
      <p className="text-sm text-gray-600">
        Projekt je ve fázi testování a vítáme zpětnou vazbu i návrhy na vylepšení.
      </p>
    </div>
  );
}
