const listHelper = require('../utils/list_helper')
const { emptyBlogList, oneBlogList, sixBlogList, favoriteBlog } = require('./testblogs')

test('dummy returns one', () => {
  const blogs = []
  const result = listHelper.dummy(blogs)
  expect(result).toBe(1)
})

describe('total likes', () => {
  test('of empty list is zero', () => {
    const result = listHelper.totalLikes(emptyBlogList)
    expect(result).toBe(0)
  })

  test('when list has only one blog equals likes of that', () => {
    const result = listHelper.totalLikes(oneBlogList)
    expect(result).toBe(12)
  })

  test('of a bigger list is calculated right', () => {
    const result = listHelper.totalLikes(sixBlogList)
    expect(result).toBe(36)
  })
})

describe('favorite blog', () => {
  test('of empty list is empty', () => {
    const result = listHelper.favoriteBlog(emptyBlogList)
    expect(result).toEqual({})
  })

  test('when list has only one blog equals likes of that', () => {
    const result = listHelper.favoriteBlog(oneBlogList)
    expect(result).toEqual(favoriteBlog)
  })

  test('of a bigger list is calculated right', () => {
    const result = listHelper.favoriteBlog(sixBlogList)
    expect(result).toEqual(favoriteBlog)
  })

})
