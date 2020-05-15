const mongoose = require('mongoose')
const Schema = mongoose.Schema

const Tables = new Schema({
	data: {type: Array, required: true},
	fields: {type: Array, required: true},
	name: {type: String, required: true},
})

module.exports = mongoose.model('Tables', Tables)