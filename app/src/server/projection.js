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
        name: req.body.name || "",
        definition: req.body.description || "",
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
    const { id } = req.params;
    const response = await prisma.projection.findUnique({
      where: {
        id: parseInt(id),
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
    const { id } = req.params;
    const response = await prisma.projection.update({
      where: {
        id: parseInt(id),
      },
      data: {
        name: req.body.name || undefined,
        definition: req.body.definition || undefined,
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
    const { page = 1, per_page: _per_page, search = "" } = req.query;
    let per_page = 10;
    if (!_per_page) per_page = await prisma.projection.count()
    const [count, data] = await prisma.$transaction([
      prisma.projection.count({
        where: {
          OR: [
            {
              name: {
                contains: search,
              },
            },
            {
              name: {
                in: search || undefined,
              },
            },
            {
              name: {
                equals: search || undefined,
              },
            },
          ],
        },
      }),
      prisma.projection.findMany({
        skip: (parseInt(page) - 1) * parseInt(per_page),
        take: parseInt(per_page),
        where: {
          OR: [
            {
              name: {
                contains: search,
              },
            },
            {
              name: {
                in: search || undefined,
              },
            },
            {
              name: {
                equals: search || undefined,
              },
            },
          ],
        },
        orderBy: {
          createdAt: "asc",
        },
      }),
    ]);
    res.json({
      count,
      data,
      per_page: parseInt(per_page),
      page: parseInt(page),
    });
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
