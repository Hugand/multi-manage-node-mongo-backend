const mongoose = require('mongoose')
const Schema = mongoose.Schema

const Users = new Schema({
	admin: {type: Boolean, required: true},
	email: {type: String, required: true},
	password: {type: String, required: true},
	jobRole: {type: String, required: true},
	name: {type: String, required: true},
	phone: {type: String, required: true},
	username: {type: String, required: true}
})


module.exports = mongoose.model('Users', Users)