function expoPreset() {
  try {
    return require("babel-preset-expo");
  } catch {
    // Preset is also nested under expo/; Expo's re-export resolves from there.
    return require("expo/internal/babel-preset");
  }
}

module.exports = function (api) {
  api.cache(true);
  // Pass the loaded preset. A string name is resolved from the project root
  // and misses expo/node_modules, so Metro never builds a transformer and
  // Android Hermes bundles 500 at Bundler.transformFile.
  return {
    presets: [expoPreset()],
  };
};
