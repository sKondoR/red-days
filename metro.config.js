// metro.config.js
const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Установка правильного пути к корню приложения
process.env.EXPO_ROUTER_APP_ROOT = path.resolve(__dirname, './src/app');

module.exports = config;