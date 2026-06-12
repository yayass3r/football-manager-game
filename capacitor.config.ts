import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.legendclub.game',
  appName: 'نادي الاسطورة',
  webDir: 'out',
  server: {
    // Load the live Vercel deployment - all API routes work server-side
    url: 'https://my-project-tvyas409.vercel.app',
    androidScheme: 'https',
    // Allow cleartext for local development
    cleartext: true
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      launchAutoHide: true,
      backgroundColor: '#0a1628',
      showSpinner: false,
      androidSplashResourceName: 'splash',
      androidScaleType: 'CENTER_CROP',
    },
    StatusBar: {
      style: 'DARK',
      backgroundColor: '#0a1628'
    },
    App: {
      launchAutoHide: true
    }
  },
  android: {
    buildOptions: {
      signingType: 'apksigner'
    },
    // Allow mixed content for API calls
    allowMixedContent: true
  }
};

export default config;
