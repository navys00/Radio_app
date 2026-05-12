const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

/**
 * Исправление ошибки с shaka-player в react-native-track-player
 */
config.resolver = {
  ...config.resolver,

  // Блокируем shaka-player для Android и iOS
  blockList: [
    ...config.resolver.blockList || [],
    /shaka-player/,
    /.*shaka-player.*/,
  ],

  // Игнорируем попытки импорта shaka-player
  resolveRequest: (context, moduleName, platform) => {
    if (moduleName.includes('shaka-player')) {
      // Возвращаем пустой модуль вместо shaka-player
      return {
        filePath: require.resolve('react-native/Libraries/Utilities/Platform'),
        type: 'empty',
      };
    }

    // Для web оставляем стандартное поведение
    if (platform === 'web') {
      return context.resolveRequest(context, moduleName, platform);
    }

    return context.resolveRequest(context, moduleName, platform);
  },
};

module.exports = config;