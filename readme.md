### scrath api
#### sane version of the [scratch](https://scratch.mit.edu/) api, as a service

**[Interactive GraphiQL Explorer](https://scrath.imalex.xyz/)**

_scrath api_ is a growing wrapper around the MIT Scratch API (which isn't great) and the bits of the site that don't have APIs yet.

### docs

Who needs docs when you have a self-documenting [schema](src/schema.graphql)?

### usage

It runs on GraphQL, so all you have to do is make a GET request to `https://scrath.imalex.xyz/graphql` with your query to use it. Alternatively, you could use a GraphQL client library, e.g. with Node.js:

```js
let client = require('graphql-client')({ url: 'https://scrath.imalex.xyz/graphql' })

client.query(`
  {
    user(username: "thisandagain") {
      id
      avatar(size: 200)

      followerCount
      followers(limit: 5) { username }

      comments(limit: 10) {
        author { username }
        content
        replies {
          author { username }
          content
        }
      }
    }
  }
`).then(body => {
  console.log(body.data.user)
})
```
