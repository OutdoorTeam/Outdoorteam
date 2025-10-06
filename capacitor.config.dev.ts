import type { CapacitorConfig } from '@capacitor/cli';

const devServerUrl = process.env.CAPACITOR_DEV_SERVER_URL ?? 'http://10.0.2.2:3000';
const androidScheme = devServerUrl.startsWith('https') ? 'https' : 'http';

const config: CapacitorConfig = {
  appId: 'com.outdoorteam.app',
  appName: 'Outdoor Team',
  webDir: 'dist',
  server: {
    url: devServerUrl,
    androidScheme,
    cleartext: androidScheme === 'http',
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 0,
    },
  },
};

export default config;
