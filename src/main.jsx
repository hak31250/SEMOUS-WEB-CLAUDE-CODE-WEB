import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Toaster } from 'react-hot-toast'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
    <Toaster
      position="top-center"
      toastOptions={{
        duration: 3000,
        style: {
          background: '#0a0a0a',
          color: '#fff',
          borderRadius: '8px',
          padding: '12px 16px',
        },
      }}
    />
  </StrictMode>,
)
