'use strict'

const express = require('express')
const bodyParser = require('body-parser')
const session = require('express-session')
const passport = require('passport')
const cors = require('cors')
const routes = require('./routes')
const RequestError = require('./RequestError')

const app = express()

app.use(bodyParser.json({ limit: '50mb' }))
app.use(session({ secret: 'raccoonoo attak', resave: true, saveUninitialized: true }))
app.use(passport.initialize())
app.use(passport.session())
app.use(cors())

app.use(...routes)

// catch 404 and forward to error handler
app.use(function (req, res, next) {
	next(new RequestError('Not Found', 404))
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