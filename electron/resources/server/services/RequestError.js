'use strict'

module.exports = class RequestError {
    constructor(message, status) {
        this.message = message
        this.status = status
    }
}