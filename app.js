require('dotenv').config()
const express = require('express')
const logger = require('morgan')
const cors = require('cors')

const swaggerUi = require('swagger-ui-express')
const YAML = require('yamljs')
const swaggerDocument = YAML.load(`${__dirname}/swagger.yaml`)

const measurementRouter = require('./routes/measurement')

const mongoose = require('mongoose')
const mongoDbUrl =
  process.env.NODE_ENV !== 'test' ? process.env.DB_URL : process.env.DB_URL_TEST

try {
  mongoose.connect(mongoDbUrl, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
} catch (error) {
  console.error(`MongoDB connection error: ${error}`)
}

const app = express()

app.use(cors())
app.use(logger('dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))

app.use('/api/measurements', measurementRouter)

app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument))

app.use((err, req, res, next) => {
  if (res.headersSent) {
    return next(err)
  }

  const code = err.statusCode || 500

  console.error(err.stack)
  console.error(`Status code: ${code}`)
  res.status(code).json({
    error: err.message
  })
})

module.exports = app
