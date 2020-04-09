const dummy = blogs => {
  return 1 + blogs.length
}

const totalLikes = blogs => {
  return blogs.reduce((total, blog) => total + blog.likes, 0)
}

module.exports = {
  dummy,
  totalLikes
}
