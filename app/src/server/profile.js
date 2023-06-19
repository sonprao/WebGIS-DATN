const { PrismaClient, Role } = require("@prisma/client");

const prisma = new PrismaClient();

module.exports = {
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

  getAll: async (req, res) => {
    const users = await prisma.user.findMany({
      include: {
        profile: true,
      },
    });
    res.json(users);
  },

};
