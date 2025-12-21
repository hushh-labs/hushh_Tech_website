import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'ai.hushh.app',
  appName: 'Hushh - Data Privacy',
  webDir: 'dist',
  
  // iOS specific configuration
  ios: {
    // Use full screen mode
    contentInset: 'automatic',
    // Allow mixed content for development
    allowsLinkPreview: true,
    // Scroll behavior
    scrollEnabled: true,
    // Background color
    backgroundColor: '#000000',
    // Scheme for deep links
    scheme: 'hushh',
  },
  
  // Server configuration for production
  server: {
    // Use HTTPS in production
    androidScheme: 'https',
    iosScheme: 'https',
    // Allow navigation to external links
    allowNavigation: [
      'https://hushh.ai',
      'https://*.hushh.ai',
      'https://*.supabase.co',
      'https://*.stripe.com',
    ],
  },
  
  // Plugins configuration
  plugins: {
    // Splash screen config
    SplashScreen: {
      launchShowDuration: 2000,
      launchAutoHide: true,
      backgroundColor: '#000000',
      showSpinner: false,
      splashFullScreen: true,
      splashImmersive: true,
    },
    // Status bar config
    StatusBar: {
      style: 'dark',
      backgroundColor: '#000000',
    },
    // Keyboard config
    Keyboard: {
      resize: 'body',
      resizeOnFullScreen: true,
    },
  },
};

export default config;
