/* eslint-disable no-unused-vars */
const bcrypt = require('bcrypt')
const usersRouter = require('express').Router()
const User = require('../models/user')

usersRouter.get('/', async (req, res) => {
  res.json(await User.find({}).populate('blogs', { url: 1, title: 1, author: 1, id: 1 }))
})

usersRouter.post('/', async (req, res) => {
  const { username, name, password } = req.body

  if ((username ? username : '').length < 3 || (password ? password : '').length < 3) {
    res.status(400).send({ error: 'username and password must be at least three characters' })
  } else {
    const saltRounds = 10
    const passwordHash = await bcrypt.hash(password, saltRounds)
    const user = new User({
      username,
      name,
      passwordHash
    })
    res.json(await user.save())
  }
})

module.exports = usersRouter
