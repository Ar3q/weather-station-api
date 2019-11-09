const express = require('express')
const router = express.Router()

const measurementService = require('./../services/measurement')

router
  .route('/')
  .get(async (req, res, next) => {
    let measurements

    const startDate = req.query.startDate
    const endDate = req.query.endDate

    try {
      measurements = startDate
        ? await measurementService.getMeasurementsByDate(startDate, endDate)
        : await measurementService.getAllMeasurements()
    } catch (error) {
      return next(error)
    }

    res.status(200).json(measurements)
  })
  .post(async (req, res, next) => {
    let measurement = {
      temperature: req.body.temperature,
      illuminace: req.body.illuminace,
      humidity: req.body.humidity,
      rain: req.body.rain,
      date: req.body.date
    }

    try {
      measurement = await measurementService.addMeasurement(measurement)
    } catch (error) {
      error.statusCode = 400
      return next(error)
    }

    res.status(201).json(measurement)
  })

router
  .route('/:id')
  .get(async (req, res, next) => {
    let measurement
    try {
      measurement = await measurementService.getMeasurementById(req.params.id)
    } catch (error) {
      error.statusCode = 404
      return next(error)
    }

    if (!measurement) {
      const error = new Error(`Measurment with id: ${req.params.id} not found`)
      error.statusCode = 404
      return next(error)
    }

    res.status(200).json(measurement)
  })
  .delete(async (req, res, next) => {
    let deletedInfo
    try {
      deletedInfo = await measurementService.deleteMeasurementById(
        req.params.id
      )
    } catch (error) {
      return next(error)
    }

    res.json(deletedInfo)
  })

module.exports = router
