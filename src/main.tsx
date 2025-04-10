
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { StrictMode } from 'react'

const container = document.getElementById('root')
if (container) {
  try {
    const root = createRoot(container)
    root.render(
      <StrictMode>
        <App />
      </StrictMode>
    )
  } catch (error) {
    console.error("Error rendering app:", error)
    container.innerHTML = '<div style="padding: 20px; text-align: center;"><h1>Something went wrong</h1><p>Please refresh the page</p></div>'
  }
}
