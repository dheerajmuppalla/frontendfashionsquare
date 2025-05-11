// src/process-shim.js
window.process = {
    env: { NODE_ENV: 'development' }, // Minimal process env for axios
    version: '',
  };
  
  // Polyfill Buffer if needed
  if (!window.Buffer) {
    window.Buffer = require('buffer').Buffer;
  }