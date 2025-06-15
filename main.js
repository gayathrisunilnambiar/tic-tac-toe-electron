const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');

let mainWindow;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        frame: false,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: true,
            preload: path.join(__dirname, 'preload.js')
        }
    });

    mainWindow.loadFile('index.html');
}

app.whenReady().then(() => {
    createWindow();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

ipcMain.on('minimize-window', () => {
    const win = BrowserWindow.getFocusedWindow();
    if (win) win.minimize();
});

ipcMain.on('close-window', () => {
    const win = BrowserWindow.getFocusedWindow();
    if (win) win.close();
});

ipcMain.on('navigate', (event, target) => {
    const win = BrowserWindow.getFocusedWindow();
    if (win) {
        console.log('Navigating to:', target);
        if (target === 'index.html') {
            win.loadFile(target);
        } else {
            const filePath = path.join(__dirname, 'renderer', target);
            console.log('Full path:', filePath);
            win.loadFile(filePath);
        }
    }
});
