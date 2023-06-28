const { PrismaClient } = require("@prisma/client");
const { update, map } = require("lodash");

const prisma = new PrismaClient();

module.exports = {
  create: async (req, res) => {
   const updateLocation = await prisma.location.create({
      data: {
        name: req.body.name || '',
        description: req.body.description || '',
        workspace: req.body.workspace || '',
        view: {
          create: {
            extent: req.body.view?.extent || '',
            longitude: parseFloat(req.body.view?.longitude) || 0,
            latitude: parseFloat(req.body.view?.latitude) || 0,
            projectionId: req.body.view.projection.id || undefined,
          },
        },
      },
    });
    res.json(updateLocation);
  },
  /**
   * @swagger
   * /api/locations/{id}:
   *   get:
   *     tags:
   *       - Locations
   *     summary: Get a location by ID
   *     parameters:
   *       - name: id
   *         in: path
   *         description: Location ID
   *         required: true
   *         schema:
   *           type: integer
   *     responses:
   *       200:
   *         description: Successful operation
   *       404:
   *         description: Location not found
   */
  get: async (req, res) => {
    const id = parseInt(req.params.id);
    const location = await prisma.location.findUnique({
      where: {
        id: id,
      },
      include: {
        mapLayers: true,
        view: {
          include: {
            projection: true,
          },
        },
      },
    });
    res.json(location);
  },
  /**
   * @swagger
   * /api/locations:
   *   get:
   *     tags:
   *       - Locations
   *     summary: Get all locations
   *     responses:
   *       200:
   *         description: Successful operation
   *   post:
   *     tags:
   *       - Locations
   *     summary: Post a location
   *     parameters:
   *       - name: id
   *         in: path
   *         description: Location ID
   *         required: true
   *         schema:
   *           type: integer
   *     responses:
   *       200:
   *         description: Successful operation
   *       404:
   *         description: Location not found
   */
  getAll: async (req, res) => {
    const { page = null, per_page = null, search = null } = req.query;
    let locations = null;
    if (page && per_page) {
      if (search) {
        locations = await prisma.location.findMany({
          skip: (parseInt(page) - 1) * parseInt(per_page),
          take: parseInt(per_page),
          where: {
            name: {
              search: search,
            },
            description: {
              search: search,
            },
          },
          // include: {
          //     mapLayers: true,
          // },
        });
      } else {
        locations = await prisma.location.findMany({
          skip: (parseInt(page) - 1) * parseInt(per_page),
          take: parseInt(per_page),
          include: {
            mapLayers: true,
            view: {
              include: {
                projection: true,
              },
            },
          },
        });
      }
    } else {
      if (search) {
        locations = await prisma.location.findMany({
          where: {
            name: {
              search: search,
            },
          },
        });
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
        });
      }
    }
    res.json(locations);
  },
  /**
   * @swagger
   * /api/locations/{id}:
   *   put:
   *     tags:
   *       - Locations
   *     summary: Update a location by ID
   *     parameters:
   *       - name: id
   *         in: path
   *         description: Location ID
   *         required: true
   *         schema:
   *           type: integer
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/Location'
   *     responses:
   *       200:
   *         description: Location updated successfully
   *       404:
   *         description: Location not found
   */
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
            projectionId: req.body.view.projection.id || undefined,
          },
        },
      },
      include: {
        mapLayers: true, // Return all fields
        view: {
          include: {
            projection: true,
          },
        },
      },
    });
    res.json(updateLocation);
  },
  /**
   * @swagger
   * /api/locations/{id}:
   *   delete:
   *     tags:
   *       - Locations
   *     summary: Delete a location
   *     responses:
   *       200:
   *         description: Location deleted successfully
   *       404:
   *         description: Location not found
   */
  delete: async (req, res) => {
    const { id } = req.params;
    const deleteLocation = await prisma.location.delete({
      where: {
        id: parseInt(id),
      },
    });
    res.json(deleteLocation);
  },
};
