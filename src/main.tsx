
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import App from './App.tsx'
import Index from './pages/Index.tsx'
import './index.css'
import { Toaster } from 'sonner'

const container = document.getElementById('root')
if (container) {
  const root = createRoot(container)
  root.render(
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/*" element={<App />} />
        </Routes>
      </BrowserRouter>
      <Toaster position="top-right" richColors />
    </>
  )
}
