/* eslint-disable mocha/no-mocha-arrows */
const app = require('../app')
const Measurement = require('./../models/measurement')

const chai = require('chai')
const chaiHttp = require('chai-http')
const chaiLike = require('chai-like')

const { expect } = chai

const measurementsPath = '/api/measurements'

chai.use(chaiHttp)
chai.use(chaiLike)

describe('/api/measurements endpoint tests', () => {
  const notExsistingId = '5dc861a165f2a94764f89aca'
  const malformedId = '9jk3d029jk09idf9iasdasdasd'
  let measurementIdCreatedInPost
  const newMeasurementValidPost = {
    temperature: 23,
    illuminace: 20,
    humidity: 11,
    rain: false,
    date: '2019-09-11T22:00:00.000Z'
  }

  before(async () => {
    if (process.env.NODE_ENV !== 'test') {
      throw new Error('NODE_ENV is not set to test')
    }

    const measurements = [
      {
        temperature: 23,
        illuminace: 20,
        humidity: 11,
        rain: false,
        date: '2019-09-09T22:00:00.000Z'
      },
      {
        temperature: 10,
        illuminace: 21,
        humidity: 30,
        rain: false,
        date: '2019-09-10T22:00:00.000Z'
      },
      {
        temperature: 24,
        illuminace: 3,
        humidity: 80,
        rain: true,
        date: '2019-09-11T22:00:00.000Z'
      }
    ]
    try {
      await Measurement.deleteMany({})
      await Measurement.create(measurements)
    } catch (error) {
      console.error(error.message)
    }
  })

  describe('GET method', () => {
    it('should return all measurments', async function() {
      const response = await chai.request(app).get(measurementsPath)
      expect(response).to.have.status(200)
      expect(response.body).to.be.an('array')
      expect(response.body.length).to.equal(3)
    })

    describe('should retrun measurements within a requested dates', function() {
      const startDateString = '2019-09-09T22:00:00.000Z'
      const endDateString = '2019-09-10T22:01:00.000Z'
      const startDate = new Date(startDateString)
      const endDate = new Date(endDateString)

      it('when start date and end date are passed', async function() {
        const pathWithDates = `${measurementsPath}?startDate=${startDateString}&endDate=${endDateString}`

        const res = await chai.request(app).get(pathWithDates)

        expect(res).to.have.status(200)
        expect(res.body).to.be.an('array')
        expect(res.body.length).to.equal(2)

        for (const measurement of res.body) {
          expect(measurement).to.have.property('date')
          expect(measurement.date).to.be.a('string')

          const date = new Date(measurement.date)

          expect(date).to.be.a('date')
          expect(date).to.be.gte(startDate)
          expect(date).to.be.below(endDate)
        }
      })

      it('when start date is passed', async () => {
        const pathWithDate = `${measurementsPath}?startDate=${startDateString}`

        const res = await chai.request(app).get(pathWithDate)

        expect(res).to.have.status(200)
        expect(res.body).to.be.an('array')
        expect(res.body.length).to.equal(3)

        for (const measurement of res.body) {
          expect(measurement).to.have.property('date')
          expect(measurement.date).to.be.a('string')

          const date = new Date(measurement.date)

          expect(date).to.be.a('date')
          expect(date).to.be.gte(startDate)
        }
      })
    })
  })

  describe('POST method', () => {
    it('should create a new measurment', async () => {
      const res = await chai
        .request(app)
        .post(measurementsPath)
        .send(newMeasurementValidPost)
      const body = res.body

      expect(res).to.have.status(201)

      expect(body).to.have.property('temperature')
      expect(body.temperature).to.equal(23)

      expect(body).to.have.property('illuminace')
      expect(body.illuminace).to.equal(20)

      expect(body).to.have.property('humidity')
      expect(body.humidity).to.equal(11)

      expect(body).to.have.property('rain')
      expect(body.rain).to.equal(false)

      expect(body).to.have.property('date')
      expect(body.date).to.equal('2019-09-11T22:00:00.000Z')

      expect(body).to.have.property('_id')

      measurementIdCreatedInPost = body._id
    })

    it('should return 400 because temperature of measurement is below -273 C', async () => {
      const newMeasurement = {
        temperature: -274,
        illuminace: 20,
        humidity: 11,
        rain: false,
        date: '2019-09-11T22:00:00.000Z'
      }

      const res = await chai
        .request(app)
        .post(measurementsPath)
        .send(newMeasurement)

      expect(res).to.have.status(400)
    })

    it('should return 400 because of wrong type of rain', async () => {
      const newMeasurement = {
        temperature: 0,
        illuminace: 20,
        humidity: 11,
        rain: 'Mariusz Pudzianowski',
        date: '2019-09-11T22:00:00.000Z'
      }

      const res = await chai
        .request(app)
        .post(measurementsPath)
        .send(newMeasurement)

      expect(res).to.have.status(400)
    })
  })

  describe('/api/measurements/:id', () => {
    describe('GET method', () => {
      it('should return measurement with :id', async () => {
        const res = await chai
          .request(app)
          .get(`${measurementsPath}/${measurementIdCreatedInPost}`)

        const body = res.body

        expect(res).to.have.status(200)
        expect(body.temperature).to.equal(newMeasurementValidPost.temperature)
        expect(body.illuminace).to.equal(newMeasurementValidPost.illuminace)
        expect(body.humidity).to.equal(newMeasurementValidPost.humidity)
        expect(body.rain).to.equal(newMeasurementValidPost.rain)
        expect(body.date).to.equal(newMeasurementValidPost.date)
        expect(body._id).to.equal(measurementIdCreatedInPost)
      })

      it('should return 404 because of malformed :id', async () => {
        const res = await chai
          .request(app)
          .get(`${measurementsPath}/${malformedId}`)

        expect(res).to.have.status(404)
      })

      it('should return 404 because of not exsting measurement with :id', async () => {
        const res = await chai
          .request(app)
          .get(`${measurementsPath}/${notExsistingId}`)

        expect(res).to.have.status(404)
      })
    })

    describe('DELETE method', () => {
      it('should delete measurement with :id', async () => {
        const res = await chai
          .request(app)
          .delete(`${measurementsPath}/${measurementIdCreatedInPost}`)

        expect(res).to.have.status(200)
        expect(res.body).to.have.property('deletedMeasurements')
        expect(res.body.deletedMeasurements).to.equal(1)
      })

      it('should return 404 because of attempting to delete measurement with malformed :id', async () => {
        const res = await chai
          .request(app)
          .delete(`${measurementsPath}/${malformedId}`)

        expect(res).to.have.status(404)
      })

      it('should return 404 because of attempting to delete not existing measurement with :id', async () => {
        const res = await chai
          .request(app)
          .delete(`${measurementsPath}/${notExsistingId}`)

        expect(res).to.have.status(404)
        expect(res.body).to.have.property('deletedMeasurements')
        expect(res.body.deletedMeasurements).to.equal(0)
      })
    })
  })
})
