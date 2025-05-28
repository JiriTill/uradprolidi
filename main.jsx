import React from 'react'
import ReactDOM from 'react-dom/client'

function App() {
  return (
    <div className="p-4">
      <h1 className="text-xl font-bold">Úřad pro lidi</h1>
      <p>Sem vložte text nebo nahrajte PDF. Přeložíme do člověčiny.</p>
    </div>
  )
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />)
