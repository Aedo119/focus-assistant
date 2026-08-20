const { contextBridge } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  // Future APIs will go here
});