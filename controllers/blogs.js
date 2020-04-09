const blogsRouter = require('express').Router()
const Blog = require('../models/blog')

blogsRouter.get('/', async (request, response) => {
  response.json(await Blog.find({}) )
})

blogsRouter.post('/', async (request, response) => {
  const blog = new Blog(request.body)
  response.json(await blog.save())
})


module.exports = blogsRouter
