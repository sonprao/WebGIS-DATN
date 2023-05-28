const { PrismaClient } = require('@prisma/client')
const { update, map } = require('lodash')

const prisma = new PrismaClient()



module.exports = {
    updateOrCreate: async (req, res) => {
        const { name = '', description = '', workspace = '', longitude = 0, latitude = 0, mapLayers = [] } = req.body
        const location = await prisma.location.upsert({
            where: {
                id: id
            },
            update: {
                name: name,
                description: description,
                mapLayers: mapLayers,
            },
            create: {
                id,
                name: name,
                description: description,
                mapLayers: mapLayers,
            },
        })
        res.json(location)
    },

    get: async (req, res) => {
        const { id } = req.query
        const location = await prisma.location.findUnique({
            where: {
                id: id,
            },
            include : {
                mapLayers : true,
            }
        })
        res.json(location)
    },

     getAll: async (req, res) => {
        const locations = await prisma.location.findMany({
            include: {
                mapLayers: true, // Return all fields
            },
        })
        res.json(locations)
    },

    update: async (req, res) => {
        const id = parseInt(req.params.id);
        const updateLocation = await prisma.location.update({
            where: { id },
            data: {
                name: req.body.name || undefined,
                description: req.body.description || undefined,
                workspace: req.body.workspace || undefined,
                longitude: parseFloat(req.body.longitude) || undefined,
                latitude: parseFloat(req.body.latitude) || undefined,
            },
            include : {
                mapLayers : true,
            }
        })
        res.json(updateLocation);
    },

    delete: async (req, res) => {
        const { id } = req.query;
        const deleteLocation = await prisma.location.delete({
            where: {
                id: id,
            },
        })
        res.json(deleteLocation);
    }
}