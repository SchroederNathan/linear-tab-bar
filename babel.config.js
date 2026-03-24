module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      // Must be last: transforms useAnimatedStyle / shared values in app components.
      // Also includes react-native-worklets/plugin internally.
      'react-native-reanimated/plugin',
    ],
  };
};
