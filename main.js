const {app, BrowserWindow} = require('electron');

let mainWindow; // eslint-disable-line fp/no-let

const createWindow = () => {
  // mainWindow = new BrowserWindow({width: 800, height: 600, useContentSize: true}); // eslint-disable-line fp/no-mutation
  mainWindow = new BrowserWindow(); // eslint-disable-line fp/no-mutation
  mainWindow.loadFile('index.html');
  // mainWindow.webContents.openDevTools()
  mainWindow.on('closed', () => {
    mainWindow = null; // eslint-disable-line fp/no-mutation
  });
};

app.on('ready', createWindow);

app.on('window-all-closed', () => {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow();
  }
});
