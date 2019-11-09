const Measurement = require('./../models/measurement')

const addMeasurement = async measurement => {
  const createdMeasurement = await Measurement.create(measurement)
  return createdMeasurement
}

const getAllMeasurements = async () => {
  return Measurement.find()
}

const getMeasurementById = async id => {
  return Measurement.findById(id)
}

const getMeasurementsByDate = async (startDate, endDate) => {
  const endDateForQuery = endDate ? new Date(endDate) : new Date()
  const measurements = await Measurement.find({
    date: { $gte: new Date(startDate), $lt: endDateForQuery }
  })

  return measurements
}

const deleteMeasurementById = async id => {
  const { deletedCount } = await Measurement.deleteOne({ _id: id })

  return {
    deletedMeasurements: deletedCount
  }
}

module.exports = {
  addMeasurement,
  getAllMeasurements,
  getMeasurementById,
  getMeasurementsByDate,
  deleteMeasurementById
}
