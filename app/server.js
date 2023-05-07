// server.js
const userAPI = require('./src/server/user')
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
app.post('/api/users', userAPI.delete)
app.get('/api/users',  userAPI.findUser)
app.post('/api/users', userAPI.updateOrCreateUser)
// mapLayer
app.post('/api/mapLayers',  mapLayerAPI.create)
app.get('/api/mapLayers', mapLayerAPI.find)
app.post('/api/mapLayers', mapLayerAPI.update)
app.post('/api/mapLayers', mapLayerAPI.delete)
//location
app.post('/api/locations',  locationAPI.createOrUpdate)
app.get('/api/locations', locationAPI.find)
app.post('/api/locations', locationAPI.delete)

app.listen(process.env.PORT || 3000, () => {
  console.log(`Server started on port ${process.env.PORT || 3000}`)
})
