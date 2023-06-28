const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

module.exports = {
  create: async (req, res) => {
   const response = await prisma.projection.create({
      data: {
        name: req.body.name || '',
        definition: req.body.description || '',
      },
    });
    res.json(response);
  },

  get: async (req, res) => {
    const { name } = req.params;
    const response = await prisma.projection.findUnique({
      where: {
        name: name,
      },
    });
    res.json(response);
  },

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
