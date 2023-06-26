const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
module.exports = {
  create: async (req, res) => {
    const { features, layer_id } = req.body;
    const featuresData = await prisma.feature.createMany({
      data: features.map((item) => ({
        ...item,
        layerId: layer_id,
      })),
      skipDuplicates: true, // Skip 'Bobo'
    });
    res.json(featuresData);
  },
  /**
   * @swagger
   * /api/features/{id}:
   *   put:
   *     tags:
   *       - Features
   *     summary: Update a feature by ID
   *     parameters:
   *       - name: id
   *         in: path
   *         description: Feature ID
   *         required: true
   *         schema:
   *           type: integer
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/Feature'
   *     responses:
   *       200:
   *         description: Feature updated successfully
   *       404:
   *         description: Feature not found
   */
  update: async (req, res) => {
    const id = req.params.id;
    const { feature } = req.body;
    const data = await prisma.feature.update({
      where: {
        id,
      },
      data: {
        ...feature,
      },
    });
    res.json(data);
  },
  /**
   * @swagger
   * /api/features/{name}:
   *   get:
   *     tags:
   *       - Features
   *     summary: Get a feature by name
   *     parameters:
   *       - name: name
   *         in: path
   *         description: Feature name
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Successful operation
   *       404:
   *         description: Feature not found
   */
  get: async (req, res) => {
    const { name } = req.params;
    const data = await prisma.feature.findUnique({
      where: {
        name,
      },
    });
    res.json(data);
  },
};
