require('dotenv').config()
const express = require('express')
const logger = require('morgan')
const cors = require('cors')

const measurementRouter = require('./routes/measurement')

const mongoose = require('mongoose')
const mongoDbUrl = process.env.DB_URL
try {
  mongoose.connect(mongoDbUrl, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
} catch (error) {
  console.error(`MongoDB connection error: ${error}`)
}

const app = express()
const port = process.env.PORT || 3000

app.use(cors())
app.use(logger('dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))

app.use('/api/measurements', measurementRouter)

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

app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`App listening on port: ${port}`)
})

module.exports = app
