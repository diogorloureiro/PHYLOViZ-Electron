const electron = require('electron')
const fs = require('fs')
const child_process = require('child_process')

// Module to control application life.
const app = electron.app

// this should be placed at top of main.js to handle setup events quickly
if (handleSquirrelEvent(app)) {
    // squirrel event handled and app will exit in 1000ms, so don't do anything else
    return 
}

function handleSquirrelEvent(application) {
    if (process.argv.length === 1) {
        return false 
    }

    const child_process = require('child_process') 
    const path = require('path') 

    const appFolder = path.resolve(process.execPath, '..') 
    const rootAtomFolder = path.resolve(appFolder, '..') 
    const updateDotExe = path.resolve(path.join(rootAtomFolder, 'Update.exe')) 
    const exeName = path.basename(process.execPath) 

    const spawn = function(command, args) {
        let spawnedProcess, error 

        try {
            spawnedProcess = child_process.spawn(command, args, {
                detached: true
            }) 
        } catch (error) {}

        return spawnedProcess 
    } 

    const spawnUpdate = function(args) {
        return spawn(updateDotExe, args) 
    } 

    const squirrelEvent = process.argv[1] 
    switch (squirrelEvent) {
        case '--squirrel-install':
        case '--squirrel-updated':
            // Optionally do things such as:
            // - Add your .exe to the PATH
            // - Write to the registry for things like file associations and
            //   explorer context menus

            // Install desktop and start menu shortcuts
            spawnUpdate(['--createShortcut', exeName]) 

            setTimeout(application.quit, 1000) 
            return true 

        case '--squirrel-uninstall':
            // Undo anything you did in the --squirrel-install and
            // --squirrel-updated handlers

            // Remove desktop and start menu shortcuts
            spawnUpdate(['--removeShortcut', exeName]) 

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

const localClientDevelopment = './resources/client/server'
const localServerDevelopment = './resources/server/bin/www'

const windowsClientProduction = './resources/app/resources/client/server'
const windowsServerProduction = './resources/app/resources/server/bin/www'

const darwinClientProduction = './PHYLOViZ-Electron/Contents/Resources/app/resources/client/server'
const darwinServerProduction = './PHYLOViZ-Electron/Contents/Resources/app/resources/server/bin/www'

// Insert apropriate server and client for electron to run
child_process.fork(windowsServerProduction)
child_process.fork(windowsClientProduction)

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

	// Open the DevTools.
	// mainWindow.webContents.openDevTools()

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
	// On OS X it is common for applications and their menu bar
	// to stay active until the user quits explicitly with Cmd + Q
	if (process.platform !== 'darwin') {
		app.quit()
	}
})

app.on('activate', function () {
	// On OS X it's common to re-create a window in the app when the
	// dock icon is clicked and there are no other windows open.
	if (mainWindow === null) {
		createWindow()
	}
})
