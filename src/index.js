const express = require('express')
const RateLimit = require('express-rate-limit')
const bodyParser = require('body-parser')
const { graphqlExpress, graphiqlExpress } = require('graphql-server-express')
const { makeExecutableSchema } = require('graphql-tools')
const User = require('./User')

const app = express()
const fs = require('fs')

app.enable('trust proxy')
app.set('json spaces', 2)
app.disable('x-powered-by')

let limiter = new RateLimit({
  // delay responses by 3s/req if over the limit of 5req/1min
  windowMs: 1 * 60 * 1000,
  delayAfter: 5,
  delayMs: 3 * 1000,
  headers: true,
})

// apply to all requests
//app.use(limiter) // XXX: disabled for now

const resolvers = {
  Query: {
    user(root, { username }, ctx, info) {
      return User.get(username)
    }
  }
}

const typeDefs = fs.readFileSync(__dirname + '/schema.graphql', 'utf8')
let schema = makeExecutableSchema({ typeDefs, resolvers })

app.use('/graphql', bodyParser.json(), graphqlExpress({ schema }))
app.use('/', graphiqlExpress({ endpointURL: '/graphql' }))

app.listen(7060, () => console.log('listening on port 7060'))
