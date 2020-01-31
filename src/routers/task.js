const express = require('express')
const Task = require('../models/task')
const auth = require('../middleware/auth')

const router = new express.Router()

router.post('/tasks', auth, async (req, res) => {
	// const task = new Task(req.body)
	const task = new Task({
		...req.body,
		owner: req.user._id
	})

	try{
		await task.save()
		res.send("Saved")
	} catch(error)
	{
		res.send(error)
	}
})

router.get('/mytasks/all', auth, async (req, res) => {

	try{
		const tasks = await Task.find({owner: req.user._id})
		if(!tasks)
			return res.status(404).send()

		res.send(tasks)
	} catch(error){
		res.send(error)
	}

})

router.get('/myTasks', auth, async (req, res) => {
	// const theID = req.params.id

	try{
		const task = await Task.find({owner: req.user._id, completed: req.query.completed})
		if(!task)
			return res.status(404).send('Not Found')
		res.send(task)
	} catch(error){
		res.send(error)
	}

})

router.patch('/tasks/:id', auth, async (req, res) => {
	const updates = Object.keys(req.body)
	const allowedUpdates = ['description', 'completed']
	const isValidOperation = updates.every((update) => allowedUpdates.includes(update))

	if(!isValidOperation)
		return res.status(400).send({error: 'Invalid Updates'})

	try{
		const task = await Task.findOne({_id: req.params.id, owner: req.user._id})

		if(!task)
			return res.status(404).send()

		updates.forEach((update) => task[update] = req.body[update])
		await task.save()
		res.send(task)
	}catch (error){
		res.send(error)
	}
})

router.delete('/tasks/:id', auth, async (req, res) => {
	try{
		const task = await Task.findOneAndDelete({_id: req.params.id, owner: req.user._id})

		if(!task)
			return res.status(404).send('Not found')

		res.send('Deleted Successfully')
	} catch(error){
		res.send('error')
	}
})

module.exports = router