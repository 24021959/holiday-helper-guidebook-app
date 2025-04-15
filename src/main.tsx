
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Otteniamo il riferimento all'elemento root
const rootElement = document.getElementById('root')

// Verifichiamo che l'elemento esista
if (!rootElement) {
  throw new Error('Failed to find the root element')
}

// Creiamo il root utilizzando il metodo createRoot di React 18
const root = createRoot(rootElement)

// Effettuiamo il rendering dell'app
root.render(<App />)
