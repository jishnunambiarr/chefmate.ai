export interface UserPreferences {
  userId: string;
  name: string;
  diet: string[];
  allergies: string;
  temperatureUnit: 'Celcius' | 'Fahrenheit';
  updatedAt?: Date;
}


