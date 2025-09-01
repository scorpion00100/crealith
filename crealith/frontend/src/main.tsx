import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// Diagnostic: Vérifier que les styles sont chargés
console.log('🚀 Application démarrée - Vérification des styles...')

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
