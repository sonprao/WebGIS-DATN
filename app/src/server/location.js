const { PrismaClient } = require('@prisma/client')
const { update, map } = require('lodash')

const prisma = new PrismaClient()



module.exports = {
    updateOrCreate: async (req, res) => {
        const { id } = req.params
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
        const id = parseInt(req.params.id);
        const location = await prisma.location.findUnique({
            where: {
                id: id,
            },
            include : {
                mapLayers: true,
                view: {
                    include: {
                        projection: true,
                    },
                },
            }
        })
        res.json(location)
    },

    getAll: async (req, res) => {
        const { page = null, per_page = null, search = null } = req.query;
        let locations = null
        if (page && per_page) {
            if (search) {
                locations = await prisma.location.findMany({
                    skip: (parseInt(page) - 1 ) * parseInt(per_page),
                    take: parseInt(per_page),
                    where: {
                        name: {
                            search: search,
                        },
                        description: {
                            search: search,
                        }
                    },
                    // include: {
                    //     mapLayers: true,
                    // },
                })
            } else {
                locations = await prisma.location.findMany({
                    skip: (parseInt(page) - 1 ) * parseInt(per_page),
                    take: parseInt(per_page),
                    include: {
                        mapLayers: true,
                        view: {
                        include: {
                            projection: true,
                        },
                },
                    },
                })
            }
        } else {
            if (search) {
                locations = await prisma.location.findMany({
                    where: {
                        name: {
                            search: search,
                        },
                    },
                })
            } else {
                locations = await prisma.location.findMany({
                    include: {
                        mapLayers: true, // Return all fields
                        view: {
                            include: {
                                projection: true,
                            },
                        },
                    },
                })
            }
        }
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
                view: {
                    update: {
                        extent: req.body.view?.extent || undefined,
                        longitude: parseFloat(req.body.view?.longitude) || 0,
                        latitude: parseFloat(req.body.view?.latitude) || 0,
                    }
                }
            },
            include : {
                mapLayers: true, // Return all fields
                view: {
                    include: {
                        projection: true,
                    },
                },
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