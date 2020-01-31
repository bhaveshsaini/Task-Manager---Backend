const express = require('express')
const db = require('./db/mongoose')
const userRouter = require('./routers/user')
const taskRouter = require('./routers/task')

const app = express()
const port = 80


app.use(express.json())
app.use(userRouter)
app.use(taskRouter)

app.listen(port)
