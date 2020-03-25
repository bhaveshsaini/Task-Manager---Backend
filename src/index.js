const express = require('express')
const db = require('./db/mongoose')
const userRouter = require('./routers/user')
const taskRouter = require('./routers/task')
const app = express()
const cors = require('cors')
const path = require('path')
// const fileupload = require('express-fileupload')

app.use(cors())


app.use(express.static('profilePictures'));
app.use(express.json())
app.use(userRouter)
app.use(taskRouter)
// app.use(fileupload({
// 	useTempFiles: true
// }))

const PORT = process.env.PORT || 80
app.listen(PORT)
