const { getDefaultConfig } = require("expo/metro-config");
const exclusionList = require("metro-config/src/defaults/exclusionList");

const config = getDefaultConfig(__dirname);

// Bundled pdf.js for offline document viewer (assets/pdfjs/pdf.min.bundle).
config.resolver.assetExts.push("bundle");

// Native Android CMake temp dirs are deleted during builds and crash Metro's watcher on Windows.
config.resolver.blockList = exclusionList([/\/\.cxx\/.*/, /\/android\/build\/.*/]);

module.exports = config;
