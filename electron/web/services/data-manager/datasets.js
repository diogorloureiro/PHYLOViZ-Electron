'use strict'

const fetch = require('isomorphic-fetch')
const xml2js = require('xml2js')
const fs = require('fs')
const csv = require('csv-stream')
const stream = require('stream')

module.exports = { loadDatasetsList, loadDatasetFromUrl, loadDatasetFromFile }

const parser = new xml2js.Parser(xml2js.defaults["0.2"])
const Readable = stream.Readable
const Duplex = stream.Duplex

// Retrieve all datasets (name, number of STs, profile URL, loci(name, locus URL)) from https://pubmlst.org/data/dbases.xml
function loadDatasetsList() {
	return fetch('https://pubmlst.org/data/dbases.xml').then(res => res.text())
		.then(body => new Promise((resolve, reject) =>
			parser.parseString(body, (err, result) => err ? reject(err) : resolve(result))))
		.then(result => result.data.species.map(specie => {
			const database = specie.mlst[0].database[0]
			const profile = database.profiles[0]
			return {
				name: specie._.trim(),
				count: parseInt(profile.count[0]),
				url: profile.url[0],
				loci: database.loci[0].locus.map(locus => ({ name: locus._.trim(), url: locus.url[0] }))
			}
		}))
}

// Retrieve dataset from given URL
function loadDatasetFromUrl(url) {
	return fetch(url).then(res => res.text())
		.then(body => {
			const stream = new Readable()
			stream.push(body)
			stream.push(null) // Representation of end of file
			return parse(stream)
		})
}

// Retrieve dataset from given file
function loadDatasetFromFile(file) {
	const stream = new Duplex()
	stream.push(file.buffer)
	stream.push(null) // Representation of end of file
	return parse(stream)
}

// Parse a .csv or .txt file into allelic profiles
function parse(stream) {
	return new Promise((resolve, reject) => {
		const profiles = []
		stream.pipe(csv.createStream({ delimiter: '\t' }))
			.on('data', function (data) {
				let id
				const loci = []
				for (const property in data) {
					if (data.hasOwnProperty(property)) {
						const element = data[property]
						if (property === '\'ST\'' || property === 'ST')
							id = parseInt(element)
						else if (property !== 'clonal_complex')
							loci.push(parseInt(element))
					}
				}
				profiles.push({ id, loci })
			})
			.on('error', reject)
			.on('end', () => resolve(profiles))
	})
}