/**
 * Capacitor Live Update Service
 * 
 * This service enables Over-The-Air (OTA) updates for the iOS app.
 * Updates can be pushed without going through App Store review.
 * 
 * How it works:
 * 1. On app launch, checks for new bundle version
 * 2. Downloads new bundle in background
 * 3. Applies update on next app restart
 */

import { Capacitor } from '@capacitor/core';

// Check if we're running in a native Capacitor environment
const isNative = Capacitor.isNativePlatform();

// Types for live update
interface UpdateInfo {
  version: string;
  bundleUrl: string;
  releaseNotes?: string;
  mandatory?: boolean;
}

interface UpdateResult {
  success: boolean;
  version?: string;
  error?: string;
}

// Current bundle version (updated during build)
const CURRENT_BUNDLE_VERSION = '1.0.0';

// Update check endpoint (your Supabase or CDN)
const UPDATE_API_URL = 'https://hushh.ai/api/app-updates/check';

/**
 * Check if an update is available
 */
export async function checkForUpdate(): Promise<UpdateInfo | null> {
  if (!isNative) {
    console.log('[LiveUpdate] Not running in native environment, skipping update check');
    return null;
  }

  try {
    const response = await fetch(`${UPDATE_API_URL}?currentVersion=${CURRENT_BUNDLE_VERSION}&platform=ios`);
    
    if (!response.ok) {
      console.log('[LiveUpdate] No update available');
      return null;
    }

    const updateInfo: UpdateInfo = await response.json();
    
    // Compare versions
    if (updateInfo.version > CURRENT_BUNDLE_VERSION) {
      console.log(`[LiveUpdate] Update available: ${updateInfo.version}`);
      return updateInfo;
    }

    return null;
  } catch (error) {
    console.error('[LiveUpdate] Error checking for updates:', error);
    return null;
  }
}

/**
 * Download and apply update
 */
export async function downloadAndApplyUpdate(updateInfo: UpdateInfo): Promise<UpdateResult> {
  if (!isNative) {
    return { success: false, error: 'Not running in native environment' };
  }

  try {
    // Dynamic import the live update plugin only in native environment
    const { LiveUpdate } = await import('@capawesome/capacitor-live-update');

    console.log(`[LiveUpdate] Downloading bundle from: ${updateInfo.bundleUrl}`);

    // Download the new bundle
    await LiveUpdate.downloadBundle({
      url: updateInfo.bundleUrl,
      bundleId: updateInfo.version,
    });

    console.log(`[LiveUpdate] Bundle downloaded successfully: ${updateInfo.version}`);

    // Set the new bundle as the active one (will be applied on next restart)
    await LiveUpdate.setNextBundle({
      bundleId: updateInfo.version,
    });

    console.log(`[LiveUpdate] Bundle set as active. Will apply on next restart.`);

    return { 
      success: true, 
      version: updateInfo.version 
    };
  } catch (error) {
    console.error('[LiveUpdate] Error applying update:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

/**
 * Get current bundle info
 */
export async function getCurrentBundleInfo() {
  if (!isNative) {
    return { bundleId: 'web', isBuiltIn: true };
  }

  try {
    const { LiveUpdate } = await import('@capawesome/capacitor-live-update');
    const result = await LiveUpdate.getCurrentBundle();
    return result;
  } catch (error) {
    console.error('[LiveUpdate] Error getting bundle info:', error);
    return { bundleId: CURRENT_BUNDLE_VERSION, isBuiltIn: true };
  }
}

/**
 * Reload the app with the new bundle
 */
export async function reloadApp() {
  if (!isNative) {
    window.location.reload();
    return;
  }

  try {
    const { LiveUpdate } = await import('@capawesome/capacitor-live-update');
    await LiveUpdate.reload();
  } catch (error) {
    console.error('[LiveUpdate] Error reloading app:', error);
    window.location.reload();
  }
}

/**
 * Reset to the original built-in bundle
 */
export async function resetToBuiltInBundle() {
  if (!isNative) {
    return { success: true };
  }

  try {
    const { LiveUpdate } = await import('@capawesome/capacitor-live-update');
    await LiveUpdate.reset();
    console.log('[LiveUpdate] Reset to built-in bundle');
    return { success: true };
  } catch (error) {
    console.error('[LiveUpdate] Error resetting bundle:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

/**
 * Initialize live update check on app startup
 * Call this in your main App component
 */
export async function initLiveUpdate() {
  if (!isNative) {
    console.log('[LiveUpdate] Skipping initialization - not in native environment');
    return;
  }

  console.log('[LiveUpdate] Initializing...');
  console.log(`[LiveUpdate] Current bundle version: ${CURRENT_BUNDLE_VERSION}`);

  // Check for updates in background
  const updateInfo = await checkForUpdate();

  if (updateInfo) {
    console.log(`[LiveUpdate] New version available: ${updateInfo.version}`);
    
    if (updateInfo.mandatory) {
      // For mandatory updates, download and apply immediately
      console.log('[LiveUpdate] Mandatory update - downloading now');
      const result = await downloadAndApplyUpdate(updateInfo);
      
      if (result.success) {
        console.log('[LiveUpdate] Mandatory update downloaded. Reloading app...');
        await reloadApp();
      }
    } else {
      // For optional updates, download in background
      console.log('[LiveUpdate] Optional update - downloading in background');
      downloadAndApplyUpdate(updateInfo).then(result => {
        if (result.success) {
          console.log('[LiveUpdate] Update will be applied on next app restart');
        }
      });
    }
  } else {
    console.log('[LiveUpdate] App is up to date');
  }
}

export { CURRENT_BUNDLE_VERSION };
