import AsyncStorage from '@react-native-async-storage/async-storage';

const KEYS = {
  LAST_FREQUENCY: '@radio:last_frequency',
  LAST_YEAR: '@radio:last_year',
  LAST_STATION_ID: '@radio:last_station_id',
};

export const storage = {
  async saveFrequency(frequency: number): Promise<void> {
    try {
      await AsyncStorage.setItem(KEYS.LAST_FREQUENCY, frequency.toString());
    } catch (error) {
      console.error('Error saving frequency:', error);
    }
  },

  async getFrequency(): Promise<number | null> {
    try {
      const value = await AsyncStorage.getItem(KEYS.LAST_FREQUENCY);
      return value ? parseFloat(value) : null;
    } catch (error) {
      console.error('Error getting frequency:', error);
      return null;
    }
  },

  async saveYear(year: string): Promise<void> {
    try {
      await AsyncStorage.setItem(KEYS.LAST_YEAR, year);
    } catch (error) {
      console.error('Error saving year:', error);
    }
  },

  async getYear(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(KEYS.LAST_YEAR);
    } catch (error) {
      console.error('Error getting year:', error);
      return null;
    }
  },

  async saveStationId(stationId: string): Promise<void> {
    try {
      await AsyncStorage.setItem(KEYS.LAST_STATION_ID, stationId);
    } catch (error) {
      console.error('Error saving station ID:', error);
    }
  },

  async getStationId(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(KEYS.LAST_STATION_ID);
    } catch (error) {
      console.error('Error getting station ID:', error);
      return null;
    }
  },

  async saveState(frequency: number, year: string, stationId: string): Promise<void> {
    try {
      await Promise.all([
        this.saveFrequency(frequency),
        this.saveYear(year),
        this.saveStationId(stationId),
      ]);
    } catch (error) {
      console.error('Error saving state:', error);
    }
  },

  async getState(): Promise<{ frequency: number | null; year: string | null; stationId: string | null }> {
    try {
      const [frequency, year, stationId] = await Promise.all([
        this.getFrequency(),
        this.getYear(),
        this.getStationId(),
      ]);
      return { frequency, year, stationId };
    } catch (error) {
      console.error('Error getting state:', error);
      return { frequency: null, year: null, stationId: null };
    }
  },

  async clear(): Promise<void> {
    try {
      await AsyncStorage.multiRemove(Object.values(KEYS));
    } catch (error) {
      console.error('Error clearing storage:', error);
    }
  },
};
