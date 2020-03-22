const express = require('express')
const Task = require('../models/task')
const auth = require('../middleware/auth')

const router = new express.Router()

//CREATE A TASK
router.post('/tasks', auth, async (req, res) => {
	// const task = new Task(req.body)
	const task = new Task({
		...req.body,
		owner: req.user._id
	})

	try{
		await task.save()
		res.status(200).send('Saved')
	} catch(error)
	{
		res.send(error)
	}
})

//GET ALL TASKS
router.get('/mytasks/all', auth, async (req, res) => {
	try{
		// const tasks = await Task.find()
		const tasks = await Task.find({owner: req.user._id})
		if(!tasks){
			return res.status(404).send()
		}

		res.send(tasks)
	} catch(error){
		res.send(error)
	}

})

//GET COMPLETED TASKS
router.get('/mytasks', auth, async (req, res) => {
	// const theID = req.params.id
	try{
		const task = await Task.find({owner: req.user._id, completed: 'No'})
		if(!task)
			return res.status(404).send('Not Found')
		res.send(task.length.toString())
	} catch(error){
		res.send(error)
	}
})

//UPDATE TASK
router.patch('/tasks/:id', auth, async (req, res) => {
	const updates = Object.keys(req.body)
	const allowedUpdates = ['description', 'completed']
	const isValidOperation = updates.every((update) => allowedUpdates.includes(update))

	if(!isValidOperation)
		return res.status(400).send({error: 'Invalid Updates'})

	try{
		const task = await Task.findOne({_id: req.params.id})//, owner: req.user._id})

		if(!task)
			return res.status(404).send()

		updates.forEach((update) => task[update] = req.body[update])
		await task.save()
		res.status(200).send()
	}catch (error){
		res.send(error)
	}
})

//DELETE TASK
router.delete('/tasks/:id', auth, async (req, res) => {
	try{
		const task = await Task.findOneAndDelete({_id: req.params.id})//, owner: req.user._id})

		if(!task)
			return res.status(404).send('Not found')

		res.send('Deleted Successfully')
	} catch(error){
		res.send('error')
	}
})

//DELETE ALL TASKS
router.delete('/tasks/deleteall/:id', auth, async (req, res) => {
	try{
		await Task.deleteMany({owner: req.params.id})

		res.status(200).send()
	} catch(error){
		res.send('error')
	}
})

module.exports = router