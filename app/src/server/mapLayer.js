const { PrismaClient } = require('@prisma/client')
const { update } = require('lodash')

const prisma = new PrismaClient()



module.exports = {
  updateOrCreate: async (req, res) => {
    const { id, title, description, url, location, locationId } = req.body
    const upsertMapLayer = await prisma.mapLayer.upsert({
      where: {
        id: id
      },
      update: {
        title: title,
        description: description,
        url: url,
        location: location,
        locationId: locationId,
      },
      create: {
        id,
        title,
        description,
        url,
        location,
        locationId
      },
    })
    res.json(upsertMapLayer)
  },

  find: async (req, res) => {
    const { id } = req.query
    const mapLayer = await prisma.mapLayer.findUnique({
      where: {
        id: id,
      },
    })
    res.json(mapLayer)
  },


  update: async (req, res) => {
    const { title, description, url, location, locationId } = req.body
    const { id } = req.query;
    const updateMapLayer = await prisma.mapLayer.update({
      where: {
        id: id,
      },
      data: {
        title: title,
        description: description,
        url: url,
        location: location,
        locationId: locationId,
      },

    })
    res.json(updateMapLayer);
  },

  delete: async (req, res) => {
    const { id } = req.query;
    const deleteMapLayer = await prisma.mapLayer.delete({
      where: {
        id: id,
      },
    })
    res.json(deleteMapLayer);
  }
}