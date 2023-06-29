const { PrismaClient, LayerType } = require("@prisma/client");
const { update } = require("lodash");

const prisma = new PrismaClient();

module.exports = {
  /**
   * @swagger
   * /api/mapLayers:
   *   put:
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
  create: async (req, res) => {
    const { name, description, url, type, locationId } = req.body;
    const upsertMapLayer = await prisma.mapLayer.create({
      data: {
        name: name || '',
        description: description || '',
        url: url || '',
        type: type || LayerType.VECTOR_LAYER, 
        locationId: locationId ? parseInt(locationId) : null,
      },
    });
    res.json(upsertMapLayer);
  },
  /**
   * @swagger
   * /api/mapLayers/{id}:
   *   put:
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
    const { id } = req.params;
    const { name, description, url, type, locationId } = req.body;
    const upsertMapLayer = await prisma.mapLayer.upsert({
      where: {
        id: parseInt(id),
      },
      update: {
        name: name || undefined,
        description: description || undefined,
        url: url || undefined,
        type: type || undefined, 
        locationId: locationId ? parseInt(locationId) : undefined,
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

  getbyLocation: async (req, res) => {
    const { locationId } = req.params;
    const _locationId = parseInt(locationId)
    const { page = 1, per_page = 10, search = '' } = req.query;
    const [count, data] = await prisma.$transaction([
      prisma.mapLayer.count({
        where: {
          locationId: _locationId,
        }
      }),
      prisma.mapLayer.findMany({
        skip: (parseInt(page) - 1) * parseInt(per_page),
        take: parseInt(per_page),
        where: {
          locationId: _locationId,
        },
      }),
    ])
    res.json({count, data, per_page: parseInt(per_page), page: parseInt(page)});
  },

  update: async (req, res) => {
    const { name, description, url, location, locationId } = req.body;
    const { id } = req.query;
    const updateMapLayer = await prisma.mapLayer.update({
      where: {
        id: id,
      },
      data: {
        name: name,
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
