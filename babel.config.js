module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      // 'expo-router/babel', // deprecated in SDK 50, babel-preset-expo covers this now
      'react-native-reanimated/plugin'
    ]
  };
};
