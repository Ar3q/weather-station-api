const mongoose = require('mongoose')
const Schema = mongoose.Schema

const MeasurementSchema = new Schema({
  temperature: {
    type: Number,
    min: -273
  },
  illuminace: {
    type: Number
  },
  humidity: {
    type: Number
  },
  rain: {
    type: Boolean
  },
  date: {
    type: Date,
    default: Date.now
  }
})

module.exports = mongoose.model('Measurement', MeasurementSchema)
