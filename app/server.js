// server.js
const userAPI = require('./src/server/user')
const profileAPI = require('./src/server/profile')
const mapLayerAPI = require('./src/server/mapLayer')
const locationAPI = require('./src/server/location')
const express = require('express')
const cors = require('cors')


// const { PrismaClient } = require('@prisma/client')
// const prisma = new PrismaClient()

const app = express()
app.use(cors())
app.use(express.json())
// user
app.delete('/api/users', userAPI.delete)
app.get('/api/users/:id',  userAPI.findUser)
app.get('/api/users',  userAPI.getAll)
app.post('/api/users', userAPI.updateOrCreateUser)
app.put('/api/users/:id', userAPI.activateUser)
app.post('/api/login', userAPI.login)
app.post('/api/login-google', userAPI.loginGoogle)
// profile
app.get('/api/profile',  userAPI.getAll)
app.put('/api/profile/:id',  profileAPI.update)

// mapLayer
app.post('/api/mapLayers',  mapLayerAPI.updateOrCreate)
app.get('/api/mapLayers', mapLayerAPI.find)
app.delete('/api/mapLayers', mapLayerAPI.delete)
//location
// app.post('/api/locations', locationAPI.updateOrCreate)
app.put('/api/locations/:id', locationAPI.update)
app.get('/api/locations/:id', locationAPI.get)
app.get('/api/locations', locationAPI.getAll)
app.delete('/api/locations', locationAPI.delete)

app.listen(process.env.PORT || 3000, () => {
  console.log(`Server started on port ${process.env.PORT || 3000}`)
})
