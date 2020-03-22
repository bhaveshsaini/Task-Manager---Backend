const express = require('express')
const User = require('../models/user')
const auth = require ('../middleware/auth')
const multer = require('multer')
const router = new express.Router()
const fs = require('fs')

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
		const filePath = `/Users/bhaveshsaini/Desktop/Bhavesh Saini/Web apps/TaskManager/profilePictures/${req.user._id}.jpg`
		fs.unlink(filePath, (err) => {
			if(err){
				return
			}
		})

		res.send('done')
	} catch(error){
		res.send(error)
	}
})


//UPLOADING IMAGES

const storage = multer.diskStorage({
	destination: 'profilePictures',
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

	const user = req.user
	user.avatar = req.file.originalname
	await user.save()
	res.status(200).send()
}, (error, req, res, next) => {
	res.send({ error: error.message })
})

//DELETING IMAGES
router.delete('/users/avatar/delete', auth, async (req, res) => {
	try{
		req.user.avatar = 'https://i.stack.imgur.com/34AD2.jpg'
		await req.user.save()

		const filePath = `/Users/bhaveshsaini/Desktop/Bhavesh Saini/Web apps/TaskManager/profilePictures/${req.user._id}.jpg`
		fs.unlink(filePath, (err) => {
			if(err){
				return
			}
		})

		res.status(200).send()
	} catch(error) {
			res.status(500).send(error)
		}
})

//RETURN IMAGES
router.get('/users/avatar', auth, async (req, res) => {
	try{
		const user = await User.findById(req.user._id)

		if(!user)
			throw new Error()

		if(user.avatar === 'https://i.stack.imgur.com/34AD2.jpg')
			res.send(user.avatar)
		else{
			const imagePath = `http://localhost/${req.user.avatar}`
	   		res.send(imagePath)
		}

	} catch(error){
		res.status(404).send()
	}
})

module.exports = router