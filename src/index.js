const express = require('express')
const db = require('./db/mongoose')
const userRouter = require('./routers/user')
const taskRouter = require('./routers/task')
const app = express()
const cors = require('cors')
const path = require('path')
app.use(cors())


app.use(express.static('profilePictures'));
app.use(express.json())
app.use(userRouter)
app.use(taskRouter)

// if(process.env.NODE_ENV === 'production'){
// 	app.use(express.static('../../task-manager-ui/build'))

// 	app.get('*', (req, res) => {
// 		res.sendFile(path.join(__dirname, '../../task-manager-ui', 'build', 'index.html'))
// 	})
// }

const PORT = process.env.PORT || 80
app.listen(PORT)

