import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.legendclub.game',
  appName: 'نادي الاسطورة',
  webDir: 'out',
  server: {
    // ⚠️ IMPORTANT: Change this to your Vercel deployment URL after deploying
    // Example: url: 'https://legend-club.vercel.app'
    // For local development, comment out the url line and use: npm run dev
    // url: 'https://your-app.vercel.app',
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
