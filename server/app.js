import express from 'express'
import cors from 'cors'
import knex from 'knex'
import knexConfig from './knexfile.js'

import userRouter from './routes/user.js'
import cohortRouter from './routes/cohort.js'

import morgan from 'morgan'
import swaggerUI from 'swagger-ui-express'
import swaggerDocument from './docs/openapi.json' with { type: 'json' }
import 'dotenv/config'

const app = express()
const port = 3000

morgan.token('res', (req, res) => {
  const headers = {}
  res.getHeaderNames().map(h => headers[h] = res.getHeader(h))
  return JSON.stringify(headers)
})

const db = knex(knexConfig)
app.use((req, res, next) => {
  req.db = db
  next()
})

app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cors())
app.use(morgan('dev'))
app.use('/', swaggerUI.serve)
app.get('/', swaggerUI.setup(swaggerDocument))

app.use('/user', userRouter)
app.use('/cohort', cohortRouter)

app.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}`);
});