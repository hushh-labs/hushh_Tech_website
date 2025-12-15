import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import config from './resources/config/config.ts'

// Initialize i18n for multi-language support
import './i18n'

// Import DM Sans font weights
import "@fontsource/dm-sans/400.css";
import "@fontsource/dm-sans/500.css";
import "@fontsource/dm-sans/600.css";
import "@fontsource/dm-sans/700.css";

// Note: Custom DevConsole is now integrated directly in App.tsx
// Activation methods:
// - Dev mode auto-enables in development
// - Use ?debug=true URL parameter
// - Tap Hushh logo 5 times rapidly
// - Set localStorage.devMode = 'true'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
