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

// Initialize Mobile Dev Console (Eruda) for debugging
// Activation: Dev mode auto-enables, or use ?debug=true, or tap logo 5 times
import { initMobileDevConsole, enableDevModeFromUrl, enableNetworkLogging } from './utils/mobileDevConsole'

// Enable dev console based on URL parameter or localStorage flag
enableDevModeFromUrl()
initMobileDevConsole().then(() => {
  // Enable network request logging when dev console is active
  enableNetworkLogging()
})

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
