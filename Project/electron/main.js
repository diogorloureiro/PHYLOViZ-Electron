'use strict'

const electron = require('electron')
const child_process = require('child_process')
const path = require('path')
const fs = require('fs')

// Module to control application life.
const app = electron.app

if (handleSquirrelEvent(app))
    return

function handleSquirrelEvent(application) {
    if (process.argv.length === 1)
        return false

    const appFolder = path.resolve(process.execPath, '..')
    const rootAtomFolder = path.resolve(appFolder, '..')
    const updateDotExe = path.resolve(path.join(rootAtomFolder, 'Update.exe'))
    const exeName = path.basename(process.execPath)

    const update = command => child_process.spawn(updateDotExe, [command, exeName], { detached: true })

    const squirrelEvent = process.argv[1]
    switch (squirrelEvent) {
        case '--squirrel-install':
        case '--squirrel-updated':
            // Install desktop and start menu shortcuts
            update('--createShortcut')
            setTimeout(application.quit, 1000)
            return true
        case '--squirrel-uninstall':
            // Remove desktop and start menu shortcuts
            update('--removeShortcut')
            setTimeout(application.quit, 1000)
            return true
        case '--squirrel-obsolete':
            // This is called on the outgoing version of your app before
            // we update to the new version - it's the opposite of
            // --squirrel-updated
            application.quit()
            return true
    }
}

// Module to create native browser window.
const BrowserWindow = electron.BrowserWindow

const prefixes = {
    local: '',
    windowsOrLinux: 'resources/app/',
    darwin: 'PHYLOViZ-Electron/Contents/Resources/app/'
}
const prefix = prefixes[JSON.parse(fs.readFileSync('./config.json')).mode]
// Insert apropriate server and client for electron to run
const client = child_process.execFile('node', [path.join(__dirname, prefix, 'resources/client/server')])
const server = child_process.execFile('node', [path.join(__dirname, prefix, 'resources/server/bin/www')])

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow

function createWindow() {
    // Create the browser window.
    mainWindow = new BrowserWindow({ width: 800, height: 600 })
    // and load the index.html of the app.
    mainWindow.loadURL('http://localhost:8080')
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