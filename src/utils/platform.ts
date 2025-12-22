/**
 * Platform detection utilities for Capacitor/Web hybrid app
 */

import { Capacitor } from '@capacitor/core';

/**
 * Check if running in a Capacitor native app (iOS or Android)
 */
export function isNativeApp(): boolean {
  return Capacitor.isNativePlatform();
}

/**
 * Check if running on iOS
 */
export function isIOS(): boolean {
  return Capacitor.getPlatform() === 'ios';
}

/**
 * Check if running on Android
 */
export function isAndroid(): boolean {
  return Capacitor.getPlatform() === 'android';
}

/**
 * Check if running on web
 */
export function isWeb(): boolean {
  return Capacitor.getPlatform() === 'web';
}

/**
 * Get the current platform
 */
export function getPlatform(): 'ios' | 'android' | 'web' {
  return Capacitor.getPlatform() as 'ios' | 'android' | 'web';
}

/**
 * Get the appropriate base URL for the current platform
 * - Web: Uses current origin
 * - Native: Uses production URL (hushhtech.com for Universal Links)
 */
export function getBaseUrl(): string {
  if (isNativeApp()) {
    // In native apps, use production URL with Universal Links support
    // This MUST match the domain in AASA file and iOS entitlements
    return 'https://www.hushhtech.com';
  }
  // On web, use current origin (works for both dev and prod)
  return typeof window !== 'undefined' ? window.location.origin : 'https://www.hushhtech.com';
}

/**
 * Get the OAuth redirect URL for the current platform
 */
export function getOAuthRedirectUrl(): string {
  return `${getBaseUrl()}/auth/callback`;
}

/**
 * Get the deep link URL scheme for the app
 */
export function getDeepLinkScheme(): string {
  return 'hushh';
}

/**
 * Get the deep link URL for auth callback
 */
export function getDeepLinkAuthUrl(): string {
  return `${getDeepLinkScheme()}://auth/callback`;
}
