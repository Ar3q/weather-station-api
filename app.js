require('dotenv').config()
const express = require('express')
const logger = require('morgan')

const indexRouter = require('./routes/index')

const app = express()
const port = process.env.PORT || 3000

app.use(logger('dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))

app.use('/', indexRouter)

app.listen(port, () => {
  console.log(`App listening on port: ${port}`)
})

module.exports = app
