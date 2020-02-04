const express = require('express')
const User = require('../models/user')
const auth = require ('../middleware/auth')
const multer = require('multer')
const router = new express.Router()

//SIGN UP
router.post('/users', async (req, res) => {
	const user = new User(req.body)

	try{
		await user.save()
		await user.generateAuthToken()
		res.status(201).send(user)
	} catch(error){
		res.status(400).send(error)
	}
	
})

//LOGIN
router.post('/users/login', async (req, res) => {
	try{
		const user = await User.findByCredentials(req.body.email, req.body.password)
		const token = await user.generateAuthToken()
		res.send({ user, token })
	} catch(error){
		res.send('error')
	}
})

//LOGOUT
router.post('/users/logout', auth, async (req, res) => {
	try{
		req.user.tokens = req.user.tokens.filter((token) => {
			return token.token !== req.token
		})
		await req.user.save()

		res.send('You have been logged out')

	} catch(error){
		res.status(500).send()
	}
})

//LOGOUT ALL USERS
router.post('/users/logoutAll', auth, async (req, res) => {
	try{
		req.user.tokens = req.user.tokens.filter((token) => {
			return token.token === req.token
		})

		await req.user.save()

		res.send('All other sessions have been logged out')
	} catch{
		res.status(500).send()
	}
})

//FIND PERSONAL PROFILE
router.get('/users/me', auth, async (req, res) => {
	res.send(req.user)
})

//UPDATE USER
router.patch('/users/me', auth, async (req, res) => {
	const updates = Object.keys(req.body)
	const allowedUpdates = ['name', 'email', 'password', 'age']
	const isValidOperation = updates.every((update) => allowedUpdates.includes(update))

	if(!isValidOperation)
		return res.status(400).send({ error: 'Invalid Updates'})

	try{
		updates.forEach((update) => {
			req.user[update] = req.body[update]
		})

		await req.user.save()

		res.send(req.user)

	}catch (error){
		res.status(400).send(error)
	}
})

//DELETE USER
router.delete('/users/me', auth, async (req, res) => {
	try{
		await req.user.remove()
		res.send('Deleted')

	} catch(error){
		res.status(500).send(error)
	}
})

//UPLOADING IMAGES
const upload = multer({
	// dest: 'profile pictures',
	limits: {
		fileSize: 100000
	},
	fileFilter(req, file, cb){
		if(!file.originalname.match(/\.(jpg|png|JPG|PNG)$/))
			return cb(new Error('This format is not supported'))

		cb(undefined, true)
	}
})

router.post('/users/upload', auth, upload.single('pic'), async (req, res) => {
	req.user.avatar = req.file.buffer
	await req.user.save()	
	res.send('Successfully uploaded')
}, (error, req, res, next) => {
	res.status(400).send({ error: error.message })
})

//DELETING IMAGES
router.delete('/users/avatar/delete', auth, async (req, res) => {
	try{
		req.user.avatar = undefined
		await req.user.save()
		res.send()
} catch(error) {
		res.status(500).send(error)
	}
})

router.get('/users/:id/avatar', async (req, res) => {
	try{
		const user = await User.findById(req.params.id)

		if(!user || !user.avatar)
			throw new Error()

		// res.set('Content-Type', 'image/jpg')
		res.send(user.avatar)

	} catch(error){
		res.status(404).send()
	}
})

module.exports = router