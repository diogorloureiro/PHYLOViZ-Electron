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

Execute the following command:

##### Take notice that you need to change the arch type to fit your machine! #####

`...\Project\electron> npm run build --platform=darwin --arch=x64`

And you should end up with a .app


### Linux

Execute the following command:

##### Take notice that you need to change the arch type to fit your machine! #####

`...\Project\electron> npm run build --platform=linux --arch=x64`

And you should end up with a folder and a linux runnable file inside.


### Windows:

Execute the following command:

##### Take notice that you need to change the arch type to fit your machine! #####

`...\Project\electron> npm run build --platform=win32 --arch=x64`

And you should end up with a folder with an .exe file inside.


