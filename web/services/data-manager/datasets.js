'use strict'

const request = require('request')
const xml2js = require('xml2js')
const parser = new xml2js.Parser(xml2js.defaults["0.2"])
const fs = require('fs')
const csv = require('csv-stream')
const Readable = require('stream').Readable

module.exports = { loadDatasetsList, loadDatasetFromPubMLST, loadDatasetFromFile }

// Retrieve all datasets (name, number of STs, profile URL, loci(name, locus URL)) from https://pubmlst.org/data/dbases.xml
function loadDatasetsList(cb) {
	request.get('https://pubmlst.org/data/dbases.xml', function (err, res, body) {
		parser.parseString(body, function (err, result) {
			cb(result.data.species.map(specie => {
                const database = specie.mlst[0].database[0]
				const profile = database.profiles[0]
				return {
					name: specie._.trim(),
					count: profile.count[0],
                    url: profile.url[0],
                    loci: database.loci[0].locus.map(locus => {
                        return {
                            name: locus._.trim(),
                            url: locus.url[0]
                        }
                    })
				}
			}))
		})
	})
}

// Retrieve dataset from given URL
function loadDatasetFromPubMLST(url, cb) {
	request.get(url, function (err, res, body) {
		const stream = new Readable() 
		stream.push(body)
		stream.push(null) // Represents end of file
		parse(stream, cb)
	})
}

// Retrieve dataset from given file path
function loadDatasetFromFile(path, cb) {
    parse(fs.createStream(path), cb)
}

// Parse a .csv file into allelic profiles
function parse(stream, cb) {
	let index = 0
	const profiles = []
	stream.pipe(csv.createStream({ delimiter: '\t' }))
		.on('data', function (data) {
			let id
			const locis = []
			for (const property in data) {
				if (data.hasOwnProperty(property)) {
					const element = data[property];
					if (property === '\'ST\'' || property === 'ST')
						id = element
					else
						locis.push(element)
				}
			}
			profiles[index++] = { id, locis }
		})
		.on('error', function (err) {
			cb(err);
		})
		.on('end', function () {
			cb(null, profiles)
		})
}