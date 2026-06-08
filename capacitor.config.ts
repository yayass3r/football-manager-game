import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.legendclub.game',
  appName: 'نادي الاسطورة',
  webDir: 'out',
  server: {
    // In production, change this to your Vercel URL
    // url: 'https://your-app.vercel.app',
    // For development:
    androidScheme: 'https'
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
    }
  },
  android: {
    buildOptions: {
      signingType: 'apksigner'
    }
  }
};

export default config;
