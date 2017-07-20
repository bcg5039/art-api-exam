require('dotenv').config()
const express = require('express')
const app = express()
const port = process.env.PORT || 5000
const dal = require('./dal.js')
const { pathOr, keys } = require('ramda')
const bodyParser = require('body-parser')
const HTTPError = require('node-http-error')
const checkRequiredFields = require('./lib/check-required-fields')
const checkPaintingReqFields = checkRequiredFields([
  'name',
  'movement',
  'artist',
  'yearCreated',
  'museum'
])
app.use(bodyParser.json())

//sample data
// {
//   _id: 'painting_starry_night',
//   name: 'The Starry Night',
//   type: 'painting',
//   movement: 'post-impressionism',
//   artist: 'Vincent van Gogh',
//   yearCreated: 1889,
//   museum: { name: 'Museum of Modern Art', location: 'New York' }
// }

///////////welcome response////////////
app.get('/', function(req, res, next) {
  res.send('Welcome to the Art API. Manage all the paintings.')
})
//////////////////////////////////////////

//CREATE///////////
app.post('/art/paintings', function(req, res, next) {
  const painting = pathOr(null, ['body'], req)
  const checkResults = checkPaintingReqFields(painting)

  if (checkResults.length > 0) {
    return next(
      new HTTPError(
        400,
        'Painting is missing required fields in the request body.',
        { fields: checkResults }
      )
    )
  }
  dal.createPainting(painting, function(err, result) {
    if (err) return next(new HTTPError(err.status, err.message, err))
    res.status(201).send(result)
  })
})
//////////////////

////////////////READ//////////
app.get('/art/paintings/:id', function(req, res, next) {
  const paintingId = pathOr(null, ['params', 'id'], req)

  if (paintingId) {
    dal.getPainting(paintingId, function(err, doc) {
      if (err) return next(new HTTPError(err.status, err.message, err))
      res.status(200).send(doc)
    })
  } else {
    return next(new HTTPError(400, 'There is no painting id in path!'))
  }
})
//////////////////////////////

////////////////////UPDATE///////////////
app.put('/art/paintings/:id', function(req, res, next) {
  const paintingId = pathOr(null, ['params', 'id'], req)
  const body = pathOr(null, ['body'], req)
  if (!body || keys(body).length === 0)
    return next(new HTTPError(400, 'There is no painting in the request body!'))

  dal.updatePainting(body, function(err, response) {
    if (err) return next(new HTTPError(err.status, err.message, err))
    res.status(200).send(response)
  })
})
/////////////////////////////////////////

//////////////////DELETE///////////////
app.delete('/art/paintings/:id', function(req, res, next) {
  const paintingId = pathOr(null, ['params', 'id'], req)

  dal.deletePainting(paintingId, function(err, response) {
    if (err) return next(new HTTPError(err.status, err.message, err))
    res.status(200).send(response)
  })
})
//////////////////////////////////////

///////////////LIST///////////////////
app.get('/art/paintings', function(req, res, next) {
  const filter = pathOr(null, ['query', 'filter'], req)
  const limit = pathOr(5, ['query', 'limit'], req)
  const lastItem = pathOr(null, ['query', 'lastItem'], req)
  //console.log('filter', filter)
  //console.log('limit', limit)
  //if (filter === yearCreated)
  dal.listPaintings(filter, lastItem, Number(limit), function(err, data) {
    if (err) return next(new HTTPError(err.status, err.message, err))
    res.status(200).send(data)
  })
})
//////////////////////////////////////

//////err handling middleware/////////
app.use(function(err, req, res, next) {
  console.log(req.method, req.path, err)
  res.status(err.status || 500)
  res.send(err)
})
/////////////////////////////////////

//////////////////////listen//////////
app.listen(port, () => console.log('API UP ON port:', port))
