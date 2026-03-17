import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('api', {
  savePresets: (data: string) => ipcRenderer.invoke('save-presets', data),
  loadPresets: () => ipcRenderer.invoke('load-presets'),
  importSound: () => ipcRenderer.invoke('import-sound'),
  listCustomSounds: () => ipcRenderer.invoke('list-custom-sounds'),
  saveRecording: (opts: { format: string }) => ipcRenderer.invoke('save-recording', opts),
  writeFile: (filePath: string, data: number[]) => ipcRenderer.invoke('write-file', filePath, data),
});
