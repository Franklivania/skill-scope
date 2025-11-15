import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import ThemeChangerProvider from './context/theme-changer.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ThemeChangerProvider>
      <App />
    </ThemeChangerProvider>
  </StrictMode>,
)
