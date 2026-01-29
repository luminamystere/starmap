"use strict";
const { app, BrowserWindow, Menu } = require('electron');
Menu.setApplicationMenu(null);
const createWindow = () => {
    const window = new BrowserWindow({
        width: 1024,
        height: 768,
    });
    window.setIcon('./static/icon/icon.png');
    window.loadFile('index.html');
};
app.whenReady().then(() => {
    createWindow();
    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0)
            createWindow();
    });
});
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin')
        app.quit();
});
