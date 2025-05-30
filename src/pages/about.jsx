import React from 'react';
import { Link } from 'react-router-dom';

export default function About() {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-between">
      <main className="p-6 max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-4 text-gray-900">O projektu</h1>

        <p className="mb-4 text-gray-800 leading-relaxed">
          Jmenuji se Jirka a rovnou se přiznám — úřední dopisy mě vždycky dokázaly dostat. Tolik paragrafů, nejasností a vět na deset řádků. Často jsem z nich měl chuť brečet, protože jsem si nebyl jistý, co se po mně vlastně chce. Někdy jsem si říkal, jestli nám to ti úředníci a právníci nedělají schválně!
        </p>

        <p className="mb-4 text-gray-800 leading-relaxed">
          Pak se stala ironie osudu — začal jsem pracovat ve veřejné správě. Ano, jako úředník. Už je to skoro 7 let. Denně narážím na ten samý problém, jen z druhé strany. A tak vznikl nápad: vytvořit jednoduchý překladač úředních dokumentů do „člověčiny“.
        </p>

        <p className="mb-4 text-gray-800 leading-relaxed">
          <strong>Úřad pro lidi</strong> pomáhá běžným lidem porozumět složitým dopisům, výzvám a dokumentům. Využíváme umělou inteligenci (OpenAI), optické rozpoznávání textu (OCR) a jednoduchý design, abyste se konečně dozvěděli: <em>co se po vás chce, do kdy a jak to udělat</em>.
        </p>

        <p className="mb-4 text-gray-800 leading-relaxed">
          Tento nástroj je nezávislý, bez reklam a žádná data si neukládám. Pracuji na celém projektu sám za pomocí umělé inteligence. Chci, aby byl užitečný pro každého, kdo se v oficiálních dopisech ztrácí.
        </p>

        <p className="mb-4 text-gray-800 leading-relaxed">
          Do budoucna chci přeložit i svět paragrafů, vyhlášek a nařízení. A nejen to — připravuji také projekt <strong>Lékař pro lidi</strong>, kde se zaměříme na překlady lékařských zpráv a rozborů krve do lidské řeči. Protože i z těch mi vždycky šla hlava kolem.
        </p>

        <Link
          to="/"
          className="inline-block mt-6 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
        >
          Zpět k překladu do člověčiny
        </Link>
      </main>

      <footer className="text-center text-sm text-gray-500 py-6 border-t mt-8">
        <div className="space-x-4">
          <Link to="/o-projektu" className="hover:underline">O projektu</Link>
          <Link to="/jak-to-funguje" className="hover:underline">Jak to funguje</Link>
          <Link to="/gdpr" className="hover:underline">Zpracování dat</Link>
        </div>
        <p className="mt-2">&copy; {new Date().getFullYear()} Úřad pro lidi</p>
      </footer>
    </div>
  );
}

