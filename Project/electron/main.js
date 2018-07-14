'use strict'

const [, , local] = process.argv

const electron = require('electron')
const child_process = require('child_process')
const path = require('path')

// Module to control application life.
const app = electron.app

// Module to create native browser window.
const BrowserWindow = electron.BrowserWindow

const prefixes = {
    local: '',
    win32: 'resources/app/',
    linux: 'resources/app/',
    darwin: 'PHYLOViZElectron/Contents/Resources/app/'
}

const prefix = prefixes[local || process.platform]
// Insert apropriate server and client for electron to run
const client = child_process.execFile('node', ['./resources/client/server'], { cwd: prefix })
const server = child_process.execFile('node', ['--max-old-space-size=2048', './resources/server/bin/www'], { cwd: prefix })

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow

function createWindow() {
    // Create the browser window.
    mainWindow = new BrowserWindow({ width: 800, height: 600, icon: path.join(__dirname, 'assets/icons/logo.png') })
    // and load the index.html of the app.
    mainWindow.loadURL('http://localhost:60000')
    if (local) {
        const Menu = electron.Menu
        const menuTemplate = [
            {
                label: 'Settings',
                submenu: [
                    {
                        label: 'Open Dev Tools',
                        click: () => mainWindow.webContents.openDevTools()
                    },
                    {
                        label: 'Reload',
                        click: () => mainWindow.reload()
                    }
                ]
            }
        ]
        const menu = Menu.buildFromTemplate(menuTemplate)
        Menu.setApplicationMenu(menu)
    }
    mainWindow.maximize()
    // Emitted when the window is closed.
    mainWindow.on('closed', function () {
        // Dereference the window object, usually you would store windows
        // in an array if your app supports multi windows, this is the time
        // when you should delete the corresponding element.
        mainWindow = null
    })
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow)

// Quit when all windows are closed.
app.on('window-all-closed', function () {
    client.kill()
    server.kill()
    // On OS X it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin')
        app.quit()
})

app.on('activate', function () {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (mainWindow === null)
        createWindow()
})