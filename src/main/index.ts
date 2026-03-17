import { app, BrowserWindow, ipcMain, dialog } from 'electron';
import * as path from 'path';
import * as fs from 'fs';

let mainWindow: BrowserWindow | null = null;

const isDev = !app.isPackaged;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1000,
    minHeight: 700,
    backgroundColor: '#0a0a0f',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  if (isDev) {
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools({ mode: 'detach' });
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});

// --- User data helpers ---
function getUserDataPath(...segments: string[]): string {
  const base = path.join(app.getPath('userData'), 'radio-presets');
  if (!fs.existsSync(base)) fs.mkdirSync(base, { recursive: true });
  return path.join(base, ...segments);
}

// --- IPC Handlers ---
ipcMain.handle('save-presets', async (_event, data: string) => {
  fs.writeFileSync(getUserDataPath('presets.json'), data, 'utf-8');
  return true;
});

ipcMain.handle('load-presets', async () => {
  const p = getUserDataPath('presets.json');
  if (!fs.existsSync(p)) return null;
  return fs.readFileSync(p, 'utf-8');
});

ipcMain.handle('import-sound', async () => {
  const result = await dialog.showOpenDialog(mainWindow!, {
    properties: ['openFile', 'multiSelections'],
    filters: [{ name: 'Audio', extensions: ['wav', 'mp3', 'ogg', 'flac', 'aac', 'webm'] }],
  });
  if (result.canceled) return [];

  const dir = getUserDataPath('custom-sounds');
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  return result.filePaths.map(fp => {
    const name = path.basename(fp, path.extname(fp));
    const dest = path.join(dir, path.basename(fp));
    fs.copyFileSync(fp, dest);
    return { name, path: dest };
  });
});

ipcMain.handle('list-custom-sounds', async () => {
  const dir = getUserDataPath('custom-sounds');
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir)
    .filter(f => /\.(wav|mp3|ogg|flac|aac|webm)$/i.test(f))
    .map(f => ({ name: f.replace(/\.[^.]+$/, ''), path: path.join(dir, f) }));
});

ipcMain.handle('save-recording', async (_event, opts: { format: string }) => {
  const result = await dialog.showSaveDialog(mainWindow!, {
    filters: [{ name: opts.format.toUpperCase(), extensions: [opts.format] }],
  });
  return result.canceled ? null : result.filePath;
});

ipcMain.handle('write-file', async (_event, filePath: string, data: number[]) => {
  fs.writeFileSync(filePath, Buffer.from(data));
  return true;
});
