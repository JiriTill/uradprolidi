import React from 'react';

export default function Footer() {
  return (
    <footer className="w-full text-center text-sm text-gray-600 py-6">
      <div className="space-x-4 mb-2">
        <a href="/o-projektu" className="hover:underline">
          O projektu
        </a>
        <a href="/jak-to-funguje" className="hover:underline">
          Jak to funguje
        </a>
        <a href="/gdpr" className="hover:underline">
          Zpracování dat
        </a>
        <a 
          href="https://lekarprolidi.vercel.app/" 
          className="hover:underline"
          target="_blank" 
          rel="noopener noreferrer"
        >
          Lékař pro lidi
        </a>
      </div>
      <p className="mt-2">&copy; {new Date().getFullYear()} Úřad pro lidi</p>
    </footer>
  );
}
