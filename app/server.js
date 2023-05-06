// server.js
const userAPI = require('./src/server/user')
const express = require('express')
const cors = require('cors')


// const { PrismaClient } = require('@prisma/client')
// const prisma = new PrismaClient()

const app = express()
app.use(cors())
app.use(express.json())
app.get('/api/users',  userAPI.findUser)
app.post('/api/users', userAPI.UpdateOrCreateUser)

app.listen(process.env.PORT || 3000, () => {
  console.log(`Server started on port ${process.env.PORT || 3000}`)
})
