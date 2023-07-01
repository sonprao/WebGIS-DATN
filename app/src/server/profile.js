const { PrismaClient, Role } = require("@prisma/client");

const prisma = new PrismaClient();

module.exports = {
  /**
   * @swagger
   * /api/profile:
   *   post:
   *     tags:
   *       - Profiles
   *     summary: create a user profile
   *     parameters:
   *       - name: id
   *         in: path
   *         description: Profile ID
   *         required: true
   *         schema:
   *           type: integer
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/Profile'
   *     responses:
   *       200:
   *         description: Profile create successfully
   *       404:
   *         description: Profile not found
   */
  create: async (req, res) => {
    const { profile } = req.body;
    const data = await prisma.profile.create({
      data: {
        sub: profile.sub || undefined,
        email: profile.email || undefined,
        name: profile.name || undefined,
        given_name: profile.given_name || undefined,
        family_name: profile.family_name || undefined,
        picture: profile.picture || undefined,
        gender: profile.gender || undefined,
        address: profile.address || undefined,
        birthday: profile.birthday || undefined,
      },
    });
    res.json(data);
  },
  /**
   * @swagger
   * /api/profile/{id}:
   *   put:
   *     tags:
   *       - Profiles
   *     summary: Update a user profile by ID
   *     parameters:
   *       - name: id
   *         in: path
   *         description: Profile ID
   *         required: true
   *         schema:
   *           type: integer
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/Profile'
   *     responses:
   *       200:
   *         description: Profile updated successfully
   *       404:
   *         description: Profile not found
   */
  update: async (req, res) => {
    const { profile } = req.body;
    const data = await prisma.profile.update({
      where: {
        id: profile.id,
      },
      data: {
        sub: profile.sub || undefined,
        email: profile.email || undefined,
        name: profile.name || undefined,
        given_name: profile.given_name || undefined,
        family_name: profile.family_name || undefined,
        picture: profile.picture || undefined,
        gender: profile.gender || undefined,
        address: profile.address || undefined,
        birthday: profile.birthday || undefined,
      },
    });
    res.json(data);
  },
  /**
   * @swagger
   * /api/profile:
   *   get:
   *     tags:
   *       - Profiles
   *     summary: Get user profiles
   *     responses:
   *       200:
   *         description: Successful operation
   */
  getAll: async (req, res) => {
    const users = await prisma.user.findMany({
      include: {
        profile: true,
      },
    });
    res.json(users);
  },

  /**
   * @swagger
   * /api/profile:
   *   delete:
   *     tags:
   *       - Profiles
   *     summary: delete a Profile by id
   *     responses:
   *       200:
   *         description: Successful operation
   *       404:
   *         description: Profile not found
   */
  delete: async (req, res) => {
    const { id } = req.params;
    const response = await prisma.profile.delete({
      where: {
        id,
      },
    });
    res.json(response);
  },

};
