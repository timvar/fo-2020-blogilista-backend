const blogsRouter = require('express').Router()
const Blog = require('../models/blog')
const User = require('../models/user')
const jwt = require('jsonwebtoken')

blogsRouter.get('/', async (req, res) => {
  const blogs = await Blog.find({}).populate('user', { username: 1, name: 1, id: 1 })
  res.json(blogs)
})

blogsRouter.post('/', async (req, res) => {
  const { title, author, url, likes } = req.body
  const { token } = req
  const decodedToken = jwt.verify(token, process.env.SECRET)
  if (!token || !decodedToken.id) {
    return res.status(401).json({ error: 'token missing or invalid' })
  }
  const user = await User.findById(decodedToken.id)

  const blog = new Blog({
    title,
    author,
    url,
    likes,
    user: user._id
  })

  const savedBlog = await blog.save()
  user.blogs = user.blogs.concat(savedBlog._id)
  await user.save()
  res.json(savedBlog)
})

blogsRouter.put('/:id', async (req, res) => {
  const blog = {
    title: req.body.title,
    author: req.body.author,
    url: req.body.url,
    likes: req.body.likes
  }
  res.json(await Blog.findByIdAndUpdate(req.params.id, blog, { new: true }))
})

blogsRouter.delete('/:id', async (req, res) => {
  const { token } = req
  const decodedToken = jwt.verify(token, process.env.SECRET)

  if (!token || !decodedToken.id) {
    return res.status(401).json({ error: 'token missing or invalid' })
  }

  const blog = await Blog.findById(req.params.id)

  if (!blog) {
    res.status(400).send({ error: 'blog does not exist' })
  } else if (blog.user.toString() === decodedToken.id) {
    await Blog.findByIdAndRemove(req.params.id)
    res.status(204).end()
  } else {
    res.status(400).send({ error: 'You are not authorized to delete this blog.' })
  }
})

module.exports = blogsRouter
