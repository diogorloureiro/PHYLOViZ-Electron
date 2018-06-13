'use strict'

const fetch = require('isomorphic-fetch')
const xml2js = require('xml2js')
const papaparse = require('papaparse')
const RequestError = require('../../RequestError')

const parser = new xml2js.Parser(xml2js.defaults["0.2"])

// Retrieve all datasets (name, number of STs, profile URL, loci(name, locus URL)) from https://pubmlst.org/data/dbases.xml
function loadDatasetsList() {
	return fetch('https://pubmlst.org/data/dbases.xml')
		.then(res => res.text())
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
	return fetch(url)
		.then(res => res.text())
		.then(body => parseDataset(body))
}

// Retrieve dataset from given file
function loadDatasetFromFile(file) {
	return parseDataset(file.buffer.toString())
}

// Parse a .csv or .txt file into allelic profiles
function parseDataset(body) {
	return new Promise((resolve, reject) => {
		papaparse.parse(body, {
			dynamicTyping: true,
			skipEmptyLines: true,
			quoteChar: '\'',
			complete: results => {
				const rows = results.data
				const loci = rows.shift()
				loci.shift()
				const clonal_complex = loci[loci.length - 1] === 'clonal_complex'
				const profiles = rows.map(columns => {
					const id = columns.shift()
					if (clonal_complex)
						columns.pop()
					return { id, loci: columns }
				})
				resolve({ loci, profiles })
			},
			error: err => reject(new RequestError(`Corrupt file: ${err}`, 400))
		})
	})
}

// Retrieve ancillary data from given file
function loadAncillaryDataFromFile(file) {
	return parseAncillaryData(file.buffer.toString())
}

// Parse a .csv or .txt file into ancillary data
function parseAncillaryData(body) {
	return new Promise((resolve, reject) => {
		papaparse.parse(body, {
			dynamicTyping: true,
			skipEmptyLines: true,
			quoteChar: '\'',
			header: true,
			trimHeaders: true,
			complete: results => {
				results.data.forEach(row => {
					for (const key in row)
						if (row.hasOwnProperty(key) && (row[key] === 'unspecified' || row[key] === 'nd'))
							delete row[key]
				})
				resolve({ head: results.meta.fields, body: results.data })
			},
			error: err => reject(new RequestError(`Corrupt file: ${err}`, 400))
		})
	})
}

module.exports = {
	loadDatasetsList,
	loadDatasetFromUrl,
	loadDatasetFromFile,
	loadAncillaryDataFromFile
}