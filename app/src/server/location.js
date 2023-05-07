const { PrismaClient } = require('@prisma/client')
const { update, map } = require('lodash')

const prisma = new PrismaClient()



module.exports = {
    createOrUpdate: async (req, res) => {
        const { title = '', description = '', mapLayers = [] } = req.body
        const location = await prisma.location.upsert({
            where: {
                id: id
            },
            update: {
                title: title,
                description: description,
                mapLayers: mapLayers,
            },
            create: {
                id,
                title: title,
                description: description,
                mapLayers: mapLayers,
            },
        })
        res.json(location)
    },

    find: async (req, res) => {
        const { id } = req.query
        const location = await prisma.location.findUnique({
            where: {
                id: id,
            },
        })
        res.json(location)
    },
    update: async (req, res) => {
        const { title = "", description = "", mapLayers = [] } = req.body
        const { id } = req.query;
        const updateLocation = await prisma.location.update({
            where: {
                id: id,
            },
            data: {
                title: title,
                description: description,
                mapLayers: mapLayers
            },

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