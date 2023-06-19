const { PrismaClient, Role } = require("@prisma/client");

const prisma = new PrismaClient();

module.exports = {
  register: async (req, res) => {
    const { email, password, profile } = req.body;
    const user = await prisma.user.create({
      create: {
        email,
        password: password || undefined,
        profile: {
          create: {
            sub: profile.sub || undefined,
            email: email || profile.email || undefined,
            name: profile.name || undefined,
            given_name: profile.given_name || undefined,
            family_name: profile.family_name || undefined,
            picture: profile.picture || undefined,
          },
        },
      },
    });
    res.json(user);
  },
  login: async (req, res) => {
    const { email, password } = req.body;
    try {
      const user = await prisma.user.findUnique({
        where: {
          email,
        },
        include: {
          profile: true,
        },
      });
      if (user?.password === password) {
        delete user["password"];
        res.json(user);
      } else {
        res.status(404);
        res.json({ error: "Wrong email or password!" });
      }
    } catch {
      res.status(404);
      res.json({ error: "There is some errors!" });
    }
  },
  loginGoogle: async (req, res) => {
    const { email, password, role, profile } = req.body;
    const user = await prisma.user.upsert({
      where: {
        email,
      },
      update: {
        password: password || undefined,
        profile: {
          update: {
            sub: profile.sub || undefined,
            email: email || profile.email || undefined,
            name: profile.name || undefined,
            given_name: profile.given_name || undefined,
            family_name: profile.family_name || undefined,
            picture: profile.picture || undefined,
          },
        },
      },
      create: {
        email,
        password: password || undefined,
        profile: {
          create: {
            sub: profile.sub || undefined,
            email: email || profile.email || undefined,
            name: profile.name || undefined,
            given_name: profile.given_name || undefined,
            family_name: profile.family_name || undefined,
            picture: profile.picture || undefined,
          },
        },
      },
      include: {
        profile: true,
      },
    });
    delete user["password"];
    res.json(user);
  },

  updateOrCreateUser: async (req, res) => {
    const { email, password, role, profile } = req.body;
    const upsertUser = await prisma.user.upsert({
      where: {
        email,
      },
      update: {
        password,
        role: role || Role.USER,
        profile: {
          update: {
            sub: profile.sub || undefined,
            email: email || profile.email || undefined,
            name: profile.name || undefined,
            given_name: profile.given_name || undefined,
            family_name: profile.family_name || undefined,
            picture: profile.picture || undefined,
          },
        },
      },
      create: {
        email,
        profile: {
          create: {
            sub: profile.sub || undefined,
            email: email || profile.email || undefined,
            name: profile.name || undefined,
            given_name: profile.given_name || undefined,
            family_name: profile.family_name || undefined,
            picture: profile.picture || undefined,
          },
        },
      },
    });
    res.json(upsertUser);
  },
  findUser: async (req, res) => {
    const id = req.params.id;
    const user = await prisma.user.findUnique({
      where: {
        id,
      },
    });
    res.json(user);
  },

  getAll: async (req, res) => {
    const users = await prisma.user.findMany({
      include: {
        profile: true,
      },
    });
    res.json(users);
  },

  activateUser: async (req, res) => {
    const id = req.params.id;
    const { activate } = req.body;
    const user = await prisma.user.update({
      where: { id },
      data: {
        activate,
      },
    });
    res.json(user);
  },

  delete: async (req, res) => {
    const { id } = req.query;
    const deleteUser = await prisma.user.delete({
      where: {
        id: id,
      },
    });
    res.json(deleteUser);
  },
};
