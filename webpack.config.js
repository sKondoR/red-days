const path = require('path');
const createExpoWebpackConfigAsync = require('@expo/webpack-config');
const { withWasmSupport } = require('./src/plugins/wasm-loader');

// Установка правильного пути к корню приложения
process.env.EXPO_ROUTER_APP_ROOT = path.resolve(__dirname, './src/app');

module.exports = async function (env, argv) {
  const config = await createExpoWebpackConfigAsync(env, argv);
  
  // Apply WASM support configuration
  return withWasmSupport(config);
};