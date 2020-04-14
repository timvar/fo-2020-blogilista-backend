const mongoose = require('mongoose')
const supertest = require('supertest')
const bcrypt = require('bcrypt')
const app = require('../app')
const api = supertest(app)
const Blog = require('../models/blog')
const User = require('../models/user')
const { sixBlogList, favoriteBlog } = require('./testblogs')
const helper = require('./test_helper')

beforeEach(async () => {
  const testUser = {
    username: 'superuser',
    name: 'Testaaja',
    password: 'arska'
  }

  await Blog.deleteMany({})
  await User.deleteMany({})
  let blog = new Blog(sixBlogList[0])
  await blog.save()
  blog = new Blog(sixBlogList[1])
  await blog.save()

  await api
    .post('/api/users')
    .send(testUser)
    .expect(200)
    .expect('Content-Type', /application\/json/)
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

test('testUser can log in', async () => {

  const testUserLogin = {
    username: 'superuser',
    password: 'arska'
  }
  await api
    .post('/api/login')
    .send(testUserLogin)
    .expect(200)
    .expect('Content-Type', /application\/json/)
})

test('blog can be added', async () => {
  const responseBefore = await api.get('/api/blogs')
  const testUserLogin = {
    username: 'superuser',
    password: 'arska'
  }

  const user = await api
    .post('/api/login')
    .send(testUserLogin)
    .expect(200)
    .expect('Content-Type', /application\/json/)

  const { token } = user.body

  await api
    .post('/api/blogs')
    .send(favoriteBlog)
    .set('Authorization', `Bearer ${token}`)
    .expect(200)
    .expect('Content-Type', /application\/json/)

  const responseAfter = await api.get('/api/blogs')
  expect(responseAfter.body).toHaveLength(responseBefore.body.length + 1)
})

test('blog likes default value is zero', async () => {
  const newBlog = {
    title: 'New blog with title only',
    url: 'http://foo'
  }

  const testUserLogin = {
    username: 'superuser',
    password: 'arska'
  }

  const user = await api
    .post('/api/login')
    .send(testUserLogin)
    .expect(200)
    .expect('Content-Type', /application\/json/)

  const { token } = user.body

  const response = await api
    .post('/api/blogs')
    .send(newBlog)
    .set('Authorization', `Bearer ${token}`)
    .expect(200)
    .expect('Content-Type', /application\/json/)

  expect(response.body.likes).toBe(0)
})

test('blog must have title and url', async () => {
  const newBlog = {
    author: 'Elvis'
  }

  const testUserLogin = {
    username: 'superuser',
    password: 'arska'
  }

  const user = await api
    .post('/api/login')
    .send(testUserLogin)
    .expect(200)
    .expect('Content-Type', /application\/json/)

  const { token } = user.body

  await api
    .post('/api/blogs')
    .send(newBlog)
    .set('Authorization', `Bearer ${token}`)
    .expect(400)
})

test('blog can be added and removed', async () => {

  const testUserLogin = {
    username: 'superuser',
    password: 'arska'
  }

  const user = await api
    .post('/api/login')
    .send(testUserLogin)
    .expect(200)
    .expect('Content-Type', /application\/json/)

  const { token } = user.body

  const response = await api
    .post('/api/blogs')
    .set('Authorization', `Bearer ${token}`)
    .send(favoriteBlog)
    .expect(200)

  await api
    .delete(`/api/blogs/${response.body.id}`)
    .set('Authorization', `Bearer ${token}`)
    .expect(204)
})

test('blog likes can be updated', async () => {

  const testUserLogin = {
    username: 'superuser',
    password: 'arska'
  }

  const user = await api
    .post('/api/login')
    .send(testUserLogin)
    .expect(200)
    .expect('Content-Type', /application\/json/)

  const { token } = user.body

  const response = await api
    .post('/api/blogs')
    .set('Authorization', `Bearer ${token}`)
    .send(favoriteBlog)
    .expect(200)

  const updatedBlog = {
    title: favoriteBlog.title,
    url: favoriteBlog.url,
    author: favoriteBlog.author,
    likes: 50
  }

  const result = await api
    .put(`/api/blogs/${response.body.id}`)
    .send(updatedBlog)
    .expect(200)

  expect(result.body.likes).toBe(50)

})

describe('when there is initially one user in db', () => {
  beforeEach(async () => {
    await User.deleteMany({})
    const passwordHash = await bcrypt.hash('illbeback', 10)
    const user = new User({ username: 'arska', passwordHash })
    await user.save()
  })

  test('there is one user', async () => {
    const response = await api.get('/api/users')
    expect(response.body).toHaveLength(1)
  })

  test('creation succeeds with a fresh username', async () => {
    const usersAtStart = await helper.usersInDb()

    const newUser = {
      username: 'testihemmo',
      name: 'Tero Testaaja',
      password: 'tete1234',
    }

    await api
      .post('/api/users')
      .send(newUser)
      .expect(200)
      .expect('Content-Type', /application\/json/)

    const usersAtEnd = await helper.usersInDb()
    expect(usersAtEnd).toHaveLength(usersAtStart.length + 1)
    const usernames = usersAtEnd.map(u => u.username)
    expect(usernames).toContain(newUser.username)
  })

  test('creation fails with proper statuscode and message if username already taken', async () => {
    const usersAtStart = await helper.usersInDb()

    const newUser = {
      username: 'arska',
      name: 'Superuser',
      password: 'salainen',
    }

    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    expect(result.body.error).toContain('`username` to be unique')

    const usersAtEnd = await helper.usersInDb()
    expect(usersAtEnd).toHaveLength(usersAtStart.length)
  })

  test('creation fails with proper statuscode and message if username is missing', async () => {
    const usersAtStart = await helper.usersInDb()

    const newUser = {
      name: 'Superuser',
      password: 'salainen',
    }

    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    expect(result.body.error).toContain('username and password must be at least three characters')

    const usersAtEnd = await helper.usersInDb()
    expect(usersAtEnd).toHaveLength(usersAtStart.length)
  })

  test('creation fails with proper statuscode and message if password is missing', async () => {
    const usersAtStart = await helper.usersInDb()

    const newUser = {
      username: 'tehotestaaja',
      name: 'Superuser',
    }

    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    expect(result.body.error).toContain('username and password must be at least three characters')

    const usersAtEnd = await helper.usersInDb()
    expect(usersAtEnd).toHaveLength(usersAtStart.length)
  })

  test('creation fails with proper statuscode and message if username is too short', async () => {
    const usersAtStart = await helper.usersInDb()

    const newUser = {
      username: 'te',
      name: 'Superuser',
      password: 'salainen'
    }

    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    expect(result.body.error).toContain('username and password must be at least three characters')

    const usersAtEnd = await helper.usersInDb()
    expect(usersAtEnd).toHaveLength(usersAtStart.length)
  })

  test('creation fails with proper statuscode and message if password is too short', async () => {
    const usersAtStart = await helper.usersInDb()

    const newUser = {
      username: 'tehotestaaja',
      name: 'Superuser',
      password: 's3'
    }

    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    expect(result.body.error).toContain('username and password must be at least three characters')

    const usersAtEnd = await helper.usersInDb()
    expect(usersAtEnd).toHaveLength(usersAtStart.length)
  })

})

afterAll(() => {
  mongoose.connection.close()
})
