const dummy = blogs => {
  return 1 + blogs.length
}

const totalLikes = blogs => {
  return blogs.reduce((total, blog) => total + blog.likes, 0)
}

const favoriteBlog = blogs => {
  return blogs.reduce(function(maxLikesBlog, blog) {
    return ( maxLikesBlog.likes || 0 ) > blog.likes ? maxLikesBlog : blog
  }, {})
}

module.exports = {
  dummy,
  totalLikes,
  favoriteBlog
}
