const webpack = require('webpack');

module.exports = function override(config) {
  const fallback = config.resolve.fallback || {};
  Object.assign(fallback, {
    "path": require.resolve("path-browserify"),
    "os": require.resolve("os-browserify/browser"),
    "crypto": require.resolve("crypto-browserify"),
    "stream": require.resolve("stream-browserify"),
    "url": require.resolve("url/"),
    "util": require.resolve("util/"),
    "https": require.resolve("https-browserify"),
    "http": require.resolve("stream-http"),
    "zlib": require.resolve("browserify-zlib"),
    "net": false,
    "tls": false,
    "fs": false,
    "dns": false,
    "child_process": false,
    "assert": require.resolve("assert/"),
    "vm": require.resolve("vm-browserify"),
    "process": false // Temporarily disable to avoid ENOTDIR, use shim instead
  });
  config.resolve.fallback = fallback;

  config.plugins = (config.plugins || []).concat([
    new webpack.ProvidePlugin({
      process: 'process/browser.js', // Explicitly use .js
      Buffer: ['buffer', 'Buffer']
    })
  ]);

  // Debug fallback resolutions
  console.log('Webpack fallbacks:', config.resolve.fallback);

  return config;
};