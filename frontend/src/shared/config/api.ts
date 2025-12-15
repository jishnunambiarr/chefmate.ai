// API configuration
// In development, use your local IP or localhost
// For production, replace with your actual backend URL

// Detect platform and set appropriate base URL
import { Platform } from 'react-native';

const getApiBaseUrl = () => {
  if (!__DEV__) {
    return 'https://your-production-api.com';
  }

  // Android emulator uses 10.0.2.2 to access host machine's localhost
  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:8000';
  }

  // iOS simulator and web can use localhost
  return 'http://localhost:8000';
};

export const API_BASE_URL = getApiBaseUrl();

