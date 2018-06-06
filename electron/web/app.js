'use strict'

const express = require('express')
const passport = require('passport')
const flash = require('connect-flash')
const bodyParser = require('body-parser')
const session = require('express-session')
const routes = require('./routes')

const app = express()

app.use(bodyParser.json({ limit: '50mb' }))

app.use(session({ secret: 'raccoonoo attak', resave: true, saveUninitialized: true }))
app.use(flash())
app.use(passport.initialize())
app.use(passport.session())

app.use((req, res, next) => {
	res.header('Access-Control-Allow-Origin', '*')
	res.header('Access-Control-Allow-Methods', 'GET, PUT, POST, DELETE')
	res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept')
	if (req.method === 'OPTIONS')
		res.sendStatus(200)
	else
		next()
})

app.use(...routes)

// catch 404 and forward to error handler
app.use(function (req, res, next) {
	const err = new Error('Not Found')
	err.status = 404
	next(err)
})

// error handler
app.use(function (err, req, res, next) {
	// set locals, only providing error in development
	res.locals.message = err.message
	res.locals.error = req.app.get('env') === 'development' ? err : {}
	res.status(err.status || 500)
	res.send(err.message)
})

module.exports = app