const mongoose = require('mongoose')
const Schema = mongoose.Schema

const Orgs = new Schema({
	name: {type: String, required: true},
	email: {type: String, required: true},
	password: {type: String, required: true},
	name_id: {type: String, required: true},
	tables: {type: Array, required: true},
	users: {type: Array, required: true}
})


module.exports = mongoose.model('Orgs', Orgs)