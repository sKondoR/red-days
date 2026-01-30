// src/data/local/AsyncStorageProvider.ts
import AsyncStorage from '@react-native-async-storage/async-storage';

export class AsyncStorageProvider {
  /**
   * Get an item from AsyncStorage
   */
  static async getItem(key: string): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(key);
    } catch (error) {
      console.error(`Error getting item with key "${key}":`, error);
      return null;
    }
  }

  /**
   * Set an item in AsyncStorage
   */
  static async setItem(key: string, value: string): Promise<void> {
    try {
      await AsyncStorage.setItem(key, value);
    } catch (error) {
      console.error(`Error setting item with key "${key}":`, error);
      throw error;
    }
  }

  /**
   * Remove an item from AsyncStorage
   */
  static async removeItem(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.error(`Error removing item with key "${key}":`, error);
      throw error;
    }
  }

  /**
   * Clear all keys in AsyncStorage
   */
  static async clear(): Promise<void> {
    try {
      await AsyncStorage.clear();
    } catch (error) {
      console.error('Error clearing AsyncStorage:', error);
      throw error;
    }
  }

  /**
   * Get all keys in AsyncStorage
   */
  static async getAllKeys(): Promise<string[]> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      return [...keys]; // Convert readonly array to mutable array
    } catch (error) {
      console.error('Error getting all keys from AsyncStorage:', error);
      return [];
    }
  }

  /**
   * Multi-get several items in AsyncStorage
   */
  static async multiGet(keys: string[]): Promise<Array<[string, string | null]>> {
    try {
      const result = await AsyncStorage.multiGet(keys);
      return result.map(([key, value]) => [key, value]); // Convert readonly tuples to mutable tuples
    } catch (error) {
      console.error('Error multi-getting items from AsyncStorage:', error);
      return keys.map(key => [key, null]);
    }
  }

  /**
   * Multi-set multiple items in AsyncStorage
   */
  static async multiSet(keyValuePairs: Array<[string, string]>): Promise<void> {
    try {
      await AsyncStorage.multiSet(keyValuePairs);
    } catch (error) {
      console.error('Error multi-setting items to AsyncStorage:', error);
      throw error;
    }
  }

  /**
   * Merge an existing key's value in AsyncStorage
   */
  static async mergeItem(key: string, value: string): Promise<void> {
    try {
      await AsyncStorage.mergeItem(key, value);
    } catch (error) {
      console.error(`Error merging item with key "${key}":`, error);
      throw error;
    }
  }

  /**
   * Get an object from AsyncStorage and parse it as JSON
   */
  static async getObject<T>(key: string): Promise<T | null> {
    try {
      const item = await AsyncStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error(`Error getting object with key "${key}":`, error);
      return null;
    }
  }

  /**
   * Store an object in AsyncStorage as JSON string
   */
  static async setObject(key: string, value: any): Promise<void> {
    try {
      await AsyncStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Error setting object with key "${key}":`, error);
      throw error;
    }
  }
}