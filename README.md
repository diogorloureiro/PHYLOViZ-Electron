# Before cloning

Make sure Node version 8 or above and npm are installed.

**For Windows or Darwin download the installer from:** https://nodejs.org/en/

**For Linux:**

`curl -sL https://deb.nodesource.com/setup_8.x | sudo -E bash - `

`sudo apt-get install -y nodejs `


# After cloning

Open Command Prompt inside the clone repository then execute the following commands:

`...> cd Project/electron`

`...\Project\electron> npm install`

`...\Project\electron> cd resources/client`

`...\Project\electron\resources\client> npm install`

`...\Project\electron\resources\client> npm run build`

`...\Project\electron\resources\client> cd ../server`

`...\Project\electron\resources\server> npm install`

`...\Project\electron\resources\server> cd ../..`

After all these commands are executed you're all set and back to `...\Project\electron>`.

To run the application execute:
`...\Project\electron> npm start`

# To build the application for distribution:

### Darwin:

Enter config.json file and change the value of "mode" to "darwin".
Then execute the following command:

##### Take notice that you need to change the arch type to fit your machine! #####

`...\Project\electron> npm run build --platform=darwin --arch=x64`

And you should end up with a .app


### Linux

Enter config.json file and change the value of "mode" to "windowsOrLinux".
Then execute the following command:

##### Take notice that you need to change the arch type to fit your machine! #####

`...\Project\electron> npm run build --platform=linux --arch=x64`

And you should end up with a folder and a linux runnable file inside.


### Windows:

Enter config.json file and change the value of "mode" to "windowsOrLinux".
Then execute the following command:

##### Take notice that you need to change the arch type to fit your machine! #####

`...\Project\electron> npm run build --platform=win32 --arch=x64`

And you should end up with a folder with an .exe file inside.

#### Windows Installer:

After the windows distribution build is done building you can create a windows installer for the application.

Execute the following commands:

`...\Project\electron> move X ..`

X = name of the folder generated after built.

`...\Project\electron> cd ..`

`...\Project> mkdir installers`

`...\Project> npm install electron-winstaller`

`...\Project> node build.js`

Inside the folder `...\Project\installers` there should be an .exe which you can run to install the application.
