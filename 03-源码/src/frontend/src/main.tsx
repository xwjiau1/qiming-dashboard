import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router'
import { gsap } from 'gsap'
import { useGSAP } from '@gsap/react'
import './index.css'
import App from './App.tsx'

// Register GSAP plugins globally (once, before any GSAP code runs)
gsap.registerPlugin(useGSAP)

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
)
