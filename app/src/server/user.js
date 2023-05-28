const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()



module.exports = {
  updateOrCreateUser: async(req, res) => {
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
    const id = req.params.id
    const user = await prisma.user.findUnique({
      where: {
        id,
      },
    })
    res.json(user)
  },

  getAll: async (req, res) => {
    const users = await prisma.user.findMany()
    res.json(users)
  },


  activateUser: async (req, res) => {
    const id = req.params.id
    const { activate } = req.body
    const user = await prisma.user.update({
      where: { id },
      data: {
        activate
      }
    })
    res.json(user)
  },

  delete: async(req, res) => {
    const { id } = req.query
    const deleteUser = await prisma.user.delete({
      where : {
        id : id,
      }
    })
    res.json(deleteUser)
  }

}