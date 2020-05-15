const mongoose = require('mongoose')
const Schema = mongoose.Schema

const Fields = new Schema({
    display_table: {type: Boolean, required: true},
	name: {type: String, required: true},
	type: {type: String, required: true},
	select_data: {type: Array, required: true},
})

module.exports = mongoose.model('Fields', Fields)