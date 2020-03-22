const express = require('express')
const db = require('./db/mongoose')
const userRouter = require('./routers/user')
const taskRouter = require('./routers/task')
const app = express()
const cors = require('cors')
app.use(cors())
// const corsOptions ={
// 	origin: 'http://localhost:3000',
// 	methods: ['POST', 'GET']
// }
// app.use(cors(corsOptions))

// app.use((req, res, next) => {
// 	res.header("Access-Control-Allow-Origin", "*");
//     res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
//     next();
// });


app.use(express.static('profilePictures'));
app.use(express.json())
app.use(userRouter)
app.use(taskRouter)

app.listen(80)

