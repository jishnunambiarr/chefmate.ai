// API configuration
// In development, use your local IP or localhost
// For production, replace with your actual backend URL
export const API_BASE_URL = __DEV__ 
  ? 'http://10.0.2.2:8000'  // Android emulator localhost
  : 'https://your-production-api.com';

// For iOS simulator, use 'http://localhost:8000'
// For physical devices, use your computer's local IP like 'http://192.168.x.x:8000'

