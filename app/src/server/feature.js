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
