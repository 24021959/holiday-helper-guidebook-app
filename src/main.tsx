
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Get the root element
const rootElement = document.getElementById('root')

// Check if element exists
if (!rootElement) {
  throw new Error('Failed to find the root element')
}

// Create the root using React 18's createRoot method
const root = createRoot(rootElement)

// Render the app - ensure we pass a single element
root.render(<App />)
