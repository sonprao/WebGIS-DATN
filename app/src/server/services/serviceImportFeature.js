const { PrismaClient } = require("@prisma/client");
const fetch = require("node-fetch");
const prisma = new PrismaClient();
module.exports = {
  updateFeature: async (req, res) => {
    const { name } = req.params;
    const mapLayers = await prisma.mapLayer.findMany({
      select: {
        url: true,
        id: true,
      },
    });
    for (const ml of mapLayers) {
      const url = ml.url;
      fetch(
        `http://localhost:8081/geoserver/danang/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=${url}&maxFeatures=50&outputFormat=application%2Fjson`,
        {
          method: "GET",
          headers: {
            Accept: "application/json",
          },
        }
      )
        .then((response) => response.json())
        .then(async (response) => {
          await prisma.feature.createMany({
            data: response.features.map((item) => ({
              name: item.id || null,
              properties: JSON.stringify(item.properties) || null,
              layerId: ml.id,
            })),
            skipDuplicates: true,
          });
        });
    }
    res.status(200).json({message:"Done!"})
  },
};
