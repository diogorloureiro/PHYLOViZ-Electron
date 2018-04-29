'use strict'

const request = require('request')
const xml2js = require('xml2js')
const parser = new xml2js.Parser(xml2js.defaults["0.2"])
const fs = require('fs')
const csv = require('csv-stream')
const stream = require('stream')
const Readable = stream.Readable
const Duplex = stream.Duplex

module.exports = { loadDatasetsList, loadDatasetFromPubMLST, loadDatasetFromFile }

// Retrieve all datasets (name, number of STs, profile URL, loci(name, locus URL)) from https://pubmlst.org/data/dbases.xml
function loadDatasetsList(cb) {
	request.get('https://pubmlst.org/data/dbases.xml', function (err, res, body) {
		if (err) return cb(err)
		parser.parseString(body, function (err, result) {
			if (err) return cb(err)
			cb(null, result.data.species.map(specie => {
				const database = specie.mlst[0].database[0]
				const profile = database.profiles[0]
				return {
					name: specie._.trim(),
					count: parseInt(profile.count[0]),
					url: profile.url[0],
					loci: database.loci[0].locus.map(locus => ({ name: locus._.trim(), url: locus.url[0] }))
				}
			}))
		})
	})
}

// Retrieve dataset from given URL
function loadDatasetFromPubMLST(url, cb) {
	request.get(url, function (err, res, body) {
		if (err) return cb(err)
		const stream = new Readable()
		stream.push(body)
		stream.push(null) // Representation of end of file
		parse(stream, cb)
	})
}

// Retrieve dataset from given file path
function loadDatasetFromFile(file, cb) {
	const stream = new Duplex()
	stream.push(file.buffer)
	stream.push(null) // Representation of end of file
	parse(stream, cb)
}

// Parse a .csv file into allelic profiles
function parse(stream, cb) {
	let index = 0
	const profiles = []
	stream.pipe(csv.createStream({ delimiter: '\t' }))
		.on('data', function (data) {
			let id
			const loci = []
			for (const property in data) {
				if (data.hasOwnProperty(property)) {
					const element = data[property];
					if (property === '\'ST\'' || property === 'ST')
						id = parseInt(element)
					else if (property !== 'clonal_complex')
						loci.push(parseInt(element))
				}
			}
			profiles[index++] = { id, loci }
		})
		.on('error', cb)
		.on('end', () => cb(null, profiles))
}