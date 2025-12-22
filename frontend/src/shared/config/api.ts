// API configuration
// In development, use your local IP or localhost
// For production, replace with your actual backend URL

// Detect platform and set appropriate base URL
import { Platform } from 'react-native';

// Replace this with your computer's local IP address
// Find it using: ipconfig (Windows)
const LOCAL_IP = '192.168.1.103';

const getApiBaseUrl = () => {
  if (!__DEV__) {
    return 'https://your-production-api.com';
  }

  // Android emulator uses 10.0.2.2 to access host machine's localhost
  if (Platform.OS === 'android') {
    return `http://${LOCAL_IP}:8000`;
  }

  // iOS simulator and web can use localhost
  return 'http://localhost:8000';
};

export const API_BASE_URL = getApiBaseUrl();

