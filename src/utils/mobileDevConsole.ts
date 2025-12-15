/**
 * Mobile Developer Console - Eruda Integration
 * 
 * Provides a Chrome DevTools-like experience on mobile devices.
 * Features: Console, Network, Storage, Elements, System info
 * 
 * Activation methods:
 * 1. Development mode - auto-enabled
 * 2. URL parameter: ?debug=true
 * 3. LocalStorage: devMode = 'true'
 * 4. Secret gesture: Tap logo 5 times quickly
 */

// Eruda types
declare global {
  interface Window {
    eruda?: {
      init: (options?: { 
        container?: HTMLElement;
        tool?: string[];
        autoScale?: boolean;
        useShadowDom?: boolean;
        defaults?: {
          displaySize?: number;
          transparency?: number;
          theme?: 'Light' | 'Dark';
        };
      }) => void;
      destroy: () => void;
      show: (name?: string) => void;
      hide: () => void;
      add: (tool: any) => void;
      remove: (name: string) => void;
      get: (name: string) => any;
      _isInit: boolean;
    };
  }
}

// Track initialization state
let isInitialized = false;
let tapCount = 0;
let lastTapTime = 0;
const TAP_THRESHOLD = 500; // ms between taps
const REQUIRED_TAPS = 5;

/**
 * Check if dev console should be enabled
 */
export const shouldEnableDevConsole = (): boolean => {
  // Always enable in development
  if (import.meta.env.DEV) {
    return true;
  }
  
  // Check URL parameter
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get('debug') === 'true') {
    return true;
  }
  
  // Check localStorage flag
  if (typeof window !== 'undefined' && localStorage.getItem('devMode') === 'true') {
    return true;
  }
  
  return false;
};

/**
 * Initialize Eruda mobile dev console
 */
export const initMobileDevConsole = async (): Promise<void> => {
  if (isInitialized || !shouldEnableDevConsole()) {
    return;
  }

  try {
    // Dynamic import for better code splitting
    const eruda = await import('eruda');
    
    // Initialize with custom settings
    eruda.default.init({
      autoScale: true,
      useShadowDom: true,
      defaults: {
        displaySize: 50, // Panel takes 50% of screen height
        transparency: 0.95,
        theme: 'Dark', // Match app theme
      },
    });

    isInitialized = true;
    
    // Log initialization message
    console.log('📱 Mobile Dev Console Initialized');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📊 Console - View logs, errors, warnings');
    console.log('🌐 Network - Monitor API calls');
    console.log('📦 Storage - Inspect localStorage/cookies');
    console.log('🔍 Elements - DOM inspection');
    console.log('📱 System - Device info');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
  } catch (error) {
    console.warn('Failed to initialize mobile dev console:', error);
  }
};

/**
 * Destroy Eruda instance
 */
export const destroyMobileDevConsole = (): void => {
  if (window.eruda && isInitialized) {
    window.eruda.destroy();
    isInitialized = false;
    console.log('📱 Mobile Dev Console Destroyed');
  }
};

/**
 * Toggle dev console visibility
 */
export const toggleDevConsole = (): void => {
  if (!isInitialized) {
    initMobileDevConsole();
    return;
  }
  
  // Eruda will handle its own toggle
  console.log('📱 Dev Console toggled');
};

/**
 * Secret gesture handler - Tap 5 times to enable
 * Attach this to any element (e.g., logo)
 */
export const handleSecretGesture = (): void => {
  const now = Date.now();
  
  // Reset if too much time passed
  if (now - lastTapTime > TAP_THRESHOLD) {
    tapCount = 0;
  }
  
  tapCount++;
  lastTapTime = now;
  
  if (tapCount >= REQUIRED_TAPS) {
    tapCount = 0;
    
    // Toggle dev mode
    const isDevMode = localStorage.getItem('devMode') === 'true';
    
    if (isDevMode) {
      localStorage.removeItem('devMode');
      destroyMobileDevConsole();
      alert('🔒 Developer Mode Disabled');
    } else {
      localStorage.setItem('devMode', 'true');
      initMobileDevConsole();
      alert('🔧 Developer Mode Enabled!\n\nYou can now access the dev console.');
    }
  }
};

/**
 * Enable dev mode via URL (useful for sharing debug links)
 */
export const enableDevModeFromUrl = (): void => {
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get('debug') === 'true') {
    localStorage.setItem('devMode', 'true');
    initMobileDevConsole();
  }
};

/**
 * Log helper - adds timestamp and styling
 */
export const devLog = (message: string, type: 'info' | 'warn' | 'error' | 'success' = 'info'): void => {
  const timestamp = new Date().toLocaleTimeString();
  const prefix = {
    info: '📘',
    warn: '⚠️',
    error: '❌',
    success: '✅',
  }[type];
  
  console[type === 'success' ? 'log' : type](`${prefix} [${timestamp}] ${message}`);
};

/**
 * Network request logger - automatically logs fetch/XHR
 */
export const enableNetworkLogging = (): void => {
  // Intercept fetch
  const originalFetch = window.fetch;
  window.fetch = async (...args) => {
    const startTime = Date.now();
    const input = args[0];
    const url = typeof input === 'string' 
      ? input 
      : input instanceof URL 
        ? input.href 
        : input.url;
    const method = (args[1]?.method || 'GET').toUpperCase();
    
    try {
      const response = await originalFetch.apply(window, args);
      const duration = Date.now() - startTime;
      devLog(`${method} ${url} → ${response.status} (${duration}ms)`, 
        response.ok ? 'success' : 'error');
      return response;
    } catch (error) {
      devLog(`${method} ${url} → FAILED`, 'error');
      throw error;
    }
  };
};

export default {
  init: initMobileDevConsole,
  destroy: destroyMobileDevConsole,
  toggle: toggleDevConsole,
  handleSecretGesture,
  enableDevModeFromUrl,
  devLog,
  enableNetworkLogging,
  shouldEnableDevConsole,
};
