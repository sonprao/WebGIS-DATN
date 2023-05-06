const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()



module.exports = {
  UpdateOrCreateUser: async(req, res) => {
    const {email, sub, family_name, given_name, name } = req.body
    const upsertUser = await prisma.user.upsert({
      where: {
        email
      },
      update: {
        given_name,
        family_name,
        name,
      },
      create: {
        email,
        sub,
        family_name,
        given_name,
        name,
      },
    })
    res.json(upsertUser)
  },
  findUser: async(req, res) => {
    const { id } = req.query
    const user = await prisma.user.findUnique({
      where: {
        id,
      },
    })
    res.json(user)
  },

}