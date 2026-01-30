// src/data/repositories/SettingsRepositoryImpl.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SettingsRepositoryContract } from '../contracts/SettingsRepositoryContract';
import { AppSettings } from '../models/AppSettings';

const SETTINGS_KEY_PREFIX = 'app_settings_';

export class SettingsRepositoryImpl implements SettingsRepositoryContract {
  private tableName = 'app_settings';

  async findById(id: number): Promise<AppSettings | null> {
    // Since we're using AsyncStorage for settings, we don't really have IDs
    // Instead, we'll look up by userId stored in the settings object
    throw new Error("Method not implemented for AsyncStorage-based repository");
  }

  async findAll(): Promise<AppSettings[]> {
    // Not applicable for AsyncStorage-based repository
    throw new Error("Method not implemented for AsyncStorage-based repository");
  }

  async findByUserId(userId: string): Promise<AppSettings | null> {
    try {
      const settingsString = await AsyncStorage.getItem(`${SETTINGS_KEY_PREFIX}${userId}`);
      if (settingsString) {
        const settings = JSON.parse(settingsString);
        return new AppSettingsModel({
          ...settings,
          createdAt: new Date(settings.createdAt),
          updatedAt: new Date(settings.updatedAt)
        });
      }
      return null;
    } catch (error) {
      console.error(`Error retrieving settings for user ${userId}:`, error);
      return null;
    }
  }

  async updateSettings(userId: string, settings: Partial<AppSettings>): Promise<AppSettings> {
    try {
      // Get existing settings or create new ones
      let existingSettings = await this.findByUserId(userId);
      
      if (existingSettings) {
        // Update existing settings
        const updatedSettings: AppSettings = {
          ...existingSettings,
          ...settings,
          updatedAt: new Date()
        };

        await AsyncStorage.setItem(
          `${SETTINGS_KEY_PREFIX}${userId}`,
          JSON.stringify(updatedSettings)
        );

        return updatedSettings;
      } else {
        // Create new settings
        const newSettings: AppSettings = {
          id: undefined,
          userId,
          theme: 'auto',
          notificationsEnabled: true,
          reminderTime: '08:00',
          units: 'metric',
          language: 'en',
          privacyMode: false,
          dataSyncEnabled: false,
          createdAt: new Date(),
          updatedAt: new Date(),
          ...settings
        };

        await AsyncStorage.setItem(
          `${SETTINGS_KEY_PREFIX}${userId}`,
          JSON.stringify(newSettings)
        );

        return newSettings;
      }
    } catch (error) {
      console.error(`Error updating settings for user ${userId}:`, error);
      throw error;
    }
  }

  async resetToDefaults(userId: string): Promise<AppSettings> {
    try {
      const defaultSettings: AppSettings = {
        id: undefined,
        userId,
        theme: 'auto',
        notificationsEnabled: true,
        reminderTime: '08:00',
        units: 'metric',
        language: 'en',
        privacyMode: false,
        dataSyncEnabled: false,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      await AsyncStorage.setItem(
        `${SETTINGS_KEY_PREFIX}${userId}`,
        JSON.stringify(defaultSettings)
      );

      return defaultSettings;
    } catch (error) {
      console.error(`Error resetting settings for user ${userId}:`, error);
      throw error;
    }
  }

  async exportSettings(userId: string): Promise<any> {
    try {
      const settings = await this.findByUserId(userId);
      if (!settings) {
        throw new Error(`No settings found for user ${userId}`);
      }
      
      return {
        version: '1.0',
        timestamp: new Date().toISOString(),
        settings: settings
      };
    } catch (error) {
      console.error(`Error exporting settings for user ${userId}:`, error);
      throw error;
    }
  }

  async importSettings(userId: string, settingsData: any): Promise<AppSettings> {
    try {
      if (!settingsData || !settingsData.settings) {
        throw new Error('Invalid settings data provided');
      }
      
      // Validate that imported settings match our AppSettings structure
      const importedSettings: Partial<AppSettings> = settingsData.settings;
      
      // Update settings for the user
      return await this.updateSettings(userId, importedSettings);
    } catch (error) {
      console.error(`Error importing settings for user ${userId}:`, error);
      throw error;
    }
  }

  async save(entity: AppSettings): Promise<AppSettings> {
    try {
      await AsyncStorage.setItem(
        `${SETTINGS_KEY_PREFIX}${entity.userId}`,
        JSON.stringify(entity)
      );
      
      return entity;
    } catch (error) {
      console.error(`Error saving settings for user ${entity.userId}:`, error);
      throw error;
    }
  }

  async update(id: number, entity: AppSettings): Promise<AppSettings> {
    // For AsyncStorage, we update by userId rather than id
    // We'll ignore the id parameter and update using the userId from the entity
    return await this.updateSettings(entity.userId, entity);
  }

  async delete(id: number): Promise<boolean> {
    // Not directly applicable for AsyncStorage-based repository
    // We would need to identify the user by looking up settings with this id
    throw new Error("Method not implemented for AsyncStorage-based repository");
  }

  async exists(id: number): Promise<boolean> {
    // Not directly applicable for AsyncStorage-based repository
    throw new Error("Method not implemented for AsyncStorage-based repository");
  }
}

// Import the model class at the end to avoid circular dependency issues
import { AppSettingsModel } from '../models/AppSettings';