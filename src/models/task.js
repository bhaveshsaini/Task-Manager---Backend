const mongoose = require('mongoose')

//TASK MODEL**********************************
const taskSchema = new mongoose.Schema({
	description: {
		type: String,
		trim: true,
		required: true
	},

	completed: {
		type: String,
		default: 'No',
	},

	owner: {
		type: mongoose.Schema.Types.ObjectId,
		required: true,
		ref: 'User'
	},

	due: {
		type: String,
		default: ''
	}
})

const task = mongoose.model('Task', taskSchema)


module.exports = task