const { PrismaClient } = require("@prisma/client");
const { update } = require("lodash");

const prisma = new PrismaClient();

module.exports = {
  /**
   * @swagger
   * /api/mapLayers:
   *   post:
   *     tags:
   *       - MapLayers
   *     summary: Create a map layer
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/MapLayer'
   *     responses:
   *       200:
   *         description: Map layer created successfully
   *       400:
   *         description: Invalid request
   */
  updateOrCreate: async (req, res) => {
    const { id, title, description, url, location, locationId } = req.body;
    const upsertMapLayer = await prisma.mapLayer.upsert({
      where: {
        id: id,
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
        locationId,
      },
    });
    res.json(upsertMapLayer);
  },
  /**
   * @swagger
   * /api/mapLayers:
   *   get:
   *     tags:
   *       - MapLayers
   *     summary: Get map layers by location
   *     responses:
   *       200:
   *         description: Successful operation
   */
  find: async (req, res) => {
    const { id } = req.query;
    const mapLayer = await prisma.mapLayer.findUnique({
      where: {
        id: id,
      },
    });
    res.json(mapLayer);
  },

  update: async (req, res) => {
    const { title, description, url, location, locationId } = req.body;
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
    });
    res.json(updateMapLayer);
  },
  /**
   * @swagger
   * /api/mapLayers/{id}:
   *   delete:
   *     tags:
   *       - MapLayers
   *     summary: Delete a map layer by ID
   *     responses:
   *       200:
   *         description: Map layer deleted successfully
   *       404:
   *         description: Map layer not found
   *   put:
   *     tags:
   *       - MapLayers
   *     summary: Update a map layer by ID
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/MapLayer'
   *     responses:
   *       200:
   *         description: Map layer updated successfully
   *       400:
   *         description: Invalid request
   *   get:
   *     tags:
   *       - MapLayers
   *     summary: get a map layer by ID
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/MapLayer'
   *     responses:
   *       200:
   *         description: Map layer updated successfully
   *       400:
   *         description: Invalid request

   */
  delete: async (req, res) => {
    const { id } = req.query;
    const deleteMapLayer = await prisma.mapLayer.delete({
      where: {
        id: id,
      },
    });
    res.json(deleteMapLayer);
  },
};
