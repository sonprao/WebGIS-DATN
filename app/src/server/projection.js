const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

module.exports = {
  /**
   * @swagger
   * /api/projections:
   *   post:
   *     tags:
   *       - Projections
   *     summary: Create a Projection
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/Projection'
   *     responses:
   *       200:
   *         description: Projection created successfully
   *       400:
   *         description: Invalid request
   */
  create: async (req, res) => {
   const response = await prisma.projection.create({
      data: {
        name: req.body.name || '',
        definition: req.body.description || '',
      },
    });
    res.json(response);
  },
  /**
   * @swagger
   * /api/projections/{name}:
   *   get:
   *     tags:
   *       - projections
   *     summary: Get a projection by name
   *     parameters:
   *       - name: name
   *         in: path
   *         description: projection name
   *         required: true
   *         schema:
   *           type: integer
   *     responses:
   *       200:
   *         description: Successful operation
   *       404:
   *         description: projection not found
   */
  get: async (req, res) => {
    const { name } = req.params;
    const response = await prisma.projection.findUnique({
      where: {
        name: name,
      },
    });
    res.json(response);
  },
  /**
   * @swagger
   * /api/projections/{name}:
   *   put:
   *     tags:
   *       - projection
   *     summary: Update a projection by name
   *     parameters:
   *       - name: name
   *         in: path
   *         description: projection name
   *         required: true
   *         schema:
   *           type: integer
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/Projection'
   *     responses:
   *       200:
   *         description: Projection updated successfully
   *       404:
   *         description: Projection not found
   */
  update: async (req, res) => {
    const { name } = req.params;
    const response = await prisma.projection.update({
      where: {
        name: name,
      },
      data: {
        name: req.body.name || '',
        definition: req.body.description || '',
      },
    });
    res.json(response);
  },

  /**
   * @swagger
   * /api/projections:
   *   get:
   *     tags:
   *       - Projections
   *     summary: Get all projection
   *     responses:
   *       200:
   *         description: Successful operation
   *   post:
   *     tags:
   *       - Projections
   *     summary: Post a projection
   *     parameters:
   *       - name: id
   *         in: path
   *         description: Projection ID
   *         required: true
   *         schema:
   *           type: integer
   *     responses:
   *       200:
   *         description: Successful operation
   *       404:
   *         description: Projection not found
   */
  getAll: async (req, res) => {
    const { page = null, per_page = null, search = null } = req.query;
    let projections = null;
    if (page && per_page) {
      if (search) {
        projections = await prisma.projection.findMany({
          skip: (parseInt(page) - 1) * parseInt(per_page),
          take: parseInt(per_page),
          where: {
            name: {
              search: search,
            },
          },
        });
      } else {
        projections = await prisma.projection.findMany({
          skip: (parseInt(page) - 1) * parseInt(per_page),
          take: parseInt(per_page),
        });
      }
    } else {
      if (search) {
        projections = await prisma.projection.findMany({
          where: {
            name: {
              search: search,
            },
          },
        });
      } else {
        projections = await prisma.projection.findMany();
      }
    }
    res.json(projections);
  },

  /**
   * @swagger
   * /api/projections/{name}:
   *   delete:
   *     tags:
   *       - Projections
   *     summary: Delete a projection
   *     responses:
   *       200:
   *         description: projection deleted successfully
   *       404:
   *         description: projection not found
   */
  delete: async (req, res) => {
    const { name } = req.params;
    const response = await prisma.projection.delete({
      where: {
        name,
      },
    });
    res.json(response);
  },
};
