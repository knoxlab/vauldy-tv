const { getDefaultConfig } = require("expo/metro-config");
const exclusionList = require("metro-config/src/defaults/exclusionList");

const config = getDefaultConfig(__dirname);

// Native Android CMake temp dirs are deleted during builds and crash Metro's watcher on Windows.
config.resolver.blockList = exclusionList([/\/\.cxx\/.*/, /\/android\/build\/.*/]);

module.exports = config;
