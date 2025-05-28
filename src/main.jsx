import React from 'react'
import ReactDOM from 'react-dom/client'

function App() {
  return (
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold">Úřad pro lidi</h1>
      <p className="mt-2">Sem vložte text nebo nahrajte PDF. Přeložíme do člověčiny.</p>
    </div>
  )
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />)
