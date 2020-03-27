const express = require('express')
const User = require('../models/user')
const auth = require ('../middleware/auth')
const multer = require('multer')
const router = new express.Router()
const cloud = require('cloudinary').v2

cloud.config({
	cloud_name: process.env.cloud_name,
	api_key: process.env.api_key,
	api_secret: process.env.api_secret
})

//SIGN UP
router.post('/users', async (req, res) => {
	const user = new User(req.body)

	try{
		await user.save()
		await user.generateAuthToken()
		res.send(user)
	} catch(error){
		res.send(error)
	}


})

//LOGIN
router.post('/users/login', async (req, res) => {
	try{
		const user = await User.findByCredentials(req.body.email, req.body.password)
		await user.generateAuthToken()
		res.send({user})
	} catch(error){
		res.send(error)
	}
})

//LOGOUT
router.post('/users/logout', auth, async (req, res) => {
	try{
	req.user.token = ''
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
	const allowedUpdates = ['firstname', 'lastname', 'email', 'password', 'age']
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

		// delete user profile picture when they delete their account
		await cloud.uploader.destroy(req.user.avatar)

		res.status(200).send()
	} catch(error){
		res.send(error)
	}
})


//UPLOADING IMAGES

const storage = multer.diskStorage({
	// destination: 'profilePictures',
	// limits: {
	// 	fileSize: 10000000
	// },
	fileFilter(req, file, cb){
		if(!file.originalname.match(/\.(jpg|png|JPG|PNG)$/))
			return cb(new Error('This format is not supported'))

		cb(undefined, true)
	},

    filename: function (req, file, cb) {
    	cb(null, file.originalname);
  }
})

const upload = multer({ storage: storage })
 
router.post('/users/upload', auth, upload.single('pic'), async (req, res) => {
	const file = req.file
	const user = req.user

	if(user.avatarURL != 'https://i.stack.imgur.com/34AD2.jpg')
	{
		cloud.uploader.destroy(user.avatar)
	}

	await cloud.uploader.upload(file.path, 
		{ public_id: req.file.originalname }, 
		function(e, res) {
			user.avatarURL = res.secure_url
		})

	user.avatar = file.originalname
	await user.save()
	res.status(200).send()
}, (error, req, res, next) => {
	res.send({ error: error.message })
})

//DELETING IMAGES
router.delete('/users/avatar/delete', auth, async (req, res) => {
	try{
		await cloud.uploader.destroy(req.user.avatar)
		req.user.avatarURL = 'https://i.stack.imgur.com/34AD2.jpg'
		req.user.avatar = null
		await req.user.save()

		res.status(200).send()
	} catch(error) {
			res.send(error)
		}
})

//RETURN IMAGES
router.get('/users/avatar', auth, async (req, res) => {
	try{
		const user = await User.findById(req.user._id)

		if(!user)
			throw new Error()

		if(user.avatarURL === 'https://i.stack.imgur.com/34AD2.jpg')
			res.send(user.avatarURL)
		else{
	   		res.send(req.user.avatarURL)
		}

	} catch(error){
		res.status(404).send()
	}
})

module.exports = router