'use strict'

module.exports = function (service) {
	return (req, res, next) => service(req)
		.then(result => res.send(result))
		.catch(err => next(err))
}