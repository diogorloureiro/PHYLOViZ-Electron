'use strict'

const electronInstaller = require('electron-winstaller')

const settings = {
    appDirectory: './PHYLOViZ-Electron-win32-x64',
    outputDirectory: './installers',
    authors: 'PHYLOViZ',
    exe: './PHYLOViZ-Electron.exe'
}

electronInstaller.createWindowsInstaller(settings)
    .then(() => console.log("The installers of your application were succesfully created!"))
    .catch(e => console.log(`Well, sometimes you are not so lucky: ${e.message}`))