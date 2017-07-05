const { fetch } = require('./util')
const cheerio = require('cheerio')

module.exports = class User {
  /*
    type User {
      id: Int
      username: String
      
      joinDate: String
      country: String

      avatar(size: Int = 100): String

      aboutMe: String
      workingOn: String

      comments(limit: Int = 10): [Comment]

      followers(limit: Int = 50): [User]
      followerCount: Int

      following(limit: Int = 50): [User]
      followingCount: Int
    }
  */

  static get(username) {
    return fetch(`https://api.scratch.mit.edu/users/${username}`)
      .then(res => res.json())
      .then(data => {
        return {
          id: data.id,
          username: data.username,

          joinDate: data.history.joined,
          country: data.profile.country,

          avatar({ size }) {
            return data.profile.images['90x90']
              .replace('90x90', `${size}x${size}`)
          },

          aboutMe: data.profile.bio,
          workingOn: data.profile.status,

          async followers({ limit }) {
            const res = await fetch(`https://scratch.mit.edu/users/${username}/followers`)
            const html = await res.text()
            const $ = cheerio.load(html)

            let pages = $('.pagination .page-links .page-current').length || 1
            let usernames = []

            for (let page = 1; page <= pages && usernames.length < limit; page++) {
              const res = await fetch(`https://scratch.mit.edu/users/${username}/followers?page=${page}`)
              const html = await res.text()
              const $ = cheerio.load(html)

              usernames.push(...$('.box-content .user .title a').text().split(/\s+/)
                .filter(u => u !== ''))
            }

            if (usernames.length > limit)
              usernames.length = limit

            return Promise.all(usernames.map(User.get))
          },

          followerCount() {
            return fetch(`https://scratch.mit.edu/users/${username}/followers`)
              .then(res => res.text())
              .then(html => {
                const $ = cheerio.load(html)

                let count = $('.box-head > h2').text().match(/Followers \(([0-9]+)\)/)[1]
                return Number(count)
              })
          },

          async following({ limit }) {
            const res = await fetch(`https://scratch.mit.edu/users/${username}/following`)
            const html = await res.text()
            const $ = cheerio.load(html)

            let pages = $('.pagination .page-links .page-current').length || 1
            let usernames = []

            for (let page = 1; page <= pages && usernames.length < limit; page++) {
              const res = await fetch(`https://scratch.mit.edu/users/${username}/following?page=${page}`)
              const html = await res.text()
              const $ = cheerio.load(html)

              usernames.push(...$('.box-content .user .title a').text().split(/\s+/)
                .filter(u => u !== ''))
            }

            if (usernames.length > limit)
              usernames.length = limit

            return Promise.all(usernames.map(User.get))
          },

          followingCount() {
            return fetch(`https://scratch.mit.edu/users/${username}/following`)
              .then(res => res.text())
              .then(html => {
                const $ = cheerio.load(html)

                let count = $('.box-head > h2').text().match(/Following \(([0-9]+)\)/)[1]
                return Number(count)
              })
          },

          async comments({ limit }) {
            let comments = []

            for (let page = 1; comments.length < limit; page++) {
              const res = await fetch(`https://scratch.mit.edu/site-api/comments/user/${username}/?page=${page}`)
              const html = await res.text()
              const $ = cheerio.load(html)

              let cs = $('.top-level-reply').toArray()

              for (let c of cs) {
                /*
                  type Comment {
                    id: Int
                    author: User
                    content: String
                    createDate: String
                    replies: [Reply]
                  }

                  type Reply {
                    id: Int
                    author: User
                    content: String
                    createDate: String
                  }
                */

                let data = {}

                data.id = Number($(c).find('> .comment').attr('data-comment-id'))
                data.author = await User.get($(c).find('> .comment #comment-user').attr('data-comment-user'))
                data.content = $(c).find('> .comment .info .content').text().trim().replace(/ *\n/g, '')
                data.createDate = $(c).find('> .comment .info .time').attr('title')
                data.replies = []

                let replies = $(c).find('> .replies > .reply').toArray()

                for (let r of replies) {
                  let d = {}

                  d.id = Number($(r).find('> .comment').attr('data-comment-id'))
                  d.author = await User.get($(r).find('#comment-user').attr('data-comment-user'))
                  d.content = $(r).find('.info .content').text().trim().replace(/ *\n/g, '')
                  d.createDate = $(r).find('.info .time').attr('title')

                  data.replies.push(d)
                }

                comments.push(data)
                if(comments.length >= limit)
                  break
              }
            }

            if (comments.length > limit)
              comments.length = limit

            return comments
          },
        }
      })
  }
}
