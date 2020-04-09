const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const api = supertest(app)
const Blog = require('../models/blog')
const { sixBlogList, favoriteBlog } = require('./testblogs')

beforeEach(async () => {
  await Blog.deleteMany({})
  let blog = new Blog(sixBlogList[0])
  await blog.save()
  blog = new Blog(sixBlogList[1])
  await blog.save()
})

test('blogs are returned as json', async () => {
  await api
    .get('/api/blogs')
    .expect(200)
    .expect('Content-Type', /application\/json/)
})

test('there are two blogs', async () => {
  const response = await api.get('/api/blogs')
  expect(response.body).toHaveLength(2)
})

test('blogs have id key', async () => {
  const result = await api.get('/api/blogs')
  expect(result.body[0].id).toBeDefined()
})

test('blog can be added', async () => {
  const responseBefore = await api.get('/api/blogs')

  await api
    .post('/api/blogs')
    .send(favoriteBlog)
    .expect(201)
    .expect('Content-Type', /application\/json/)

  const responseAfter = await api.get('/api/blogs')
  expect(responseAfter.body).toHaveLength(responseBefore.body.length + 1)
})

afterAll(() => {
  mongoose.connection.close()
})
