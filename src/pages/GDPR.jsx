import React from 'react';

export default function GDPRPage() {
  return (
    <div className="p-8 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">Zásady ochrany osobních údajů (GDPR)</h1>
      <p className="mb-4">
        Tato aplikace zpracovává texty pouze za účelem jejich zjednodušení. Neuchováváme žádné osobní údaje ani soubory
        nahrané uživateli. Vše probíhá anonymně a bez registrace.
      </p>
      <p className="mb-4">
        Po odeslání dat ke zpracování jsou okamžitě anonymizována a nejsou nikde uchovávána. Použitím aplikace
        souhlasíte s těmito podmínkami.
      </p>
      <p className="text-sm text-gray-600">
        Pro více informací kontaktujte správce webu na adrese info@uradprolidi.cz
      </p>
    </div>
  );
}
