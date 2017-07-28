const mysql = require('mysql')
const HTTPError = require('node-http-error')
const {
  path,
  assoc,
  omit,
  compose,
  head,
  propOr,
  prop,
  map,
  split,
  last,
  pick,
  assocPath
} = require('ramda')

//sample data
// "_id": "painting_water_lilies_nympheas",
//   "_rev": "1-61fb3f6ef56792527047965d86c7996e",
//   "name": "Water Lilies Nympheas",
//   "type": "painting",
//   "movement": "impressionism",
//   "artist": "Claude Monet",
//   "yearCreated": 1907,
//   "museum": {
//    "name": "Art Gallery of Ontario",
//    "location": "Toronto"

///////////////////CREATE///////////////////

const addPainting = (painting, callback) => {
  createPainting(painting, callback)
}

////////////////////END CREATE/////////////////

///////////////////READ////////////////////////
const getPainting = (paintingId, callback) => {
  read('painting', paintingId, formatPainting, callback)
}

////////////////////END READ//////////////////

//////////////////UPDATE//////////////////////
const updatePainting = (painting, callback) => update(painting, callback)
/////////////////END UPDATE///////////////////

////////////////DELETE////////////////////////

const deletePainting = (paintingId, callback) => {
  deleteRow('painting', paintingId, callback)
}

////////////////END DELETE/////////////////////

//////////////LIST////////////////////////////

const listPaintings = (filter, lastItem, limit, callback) => {
  if (filter) {
    const arrFilter = split(':', filter)
    const filterField = head(arrFilter)
    const filterValue = last(arrFilter)

    filter = `${filterField}:${filterValue}`
  }

  queryDB('painting', lastItem, filter, limit, function(err, data) {
    if (err) return callback(err)
    callback(null, map(formatPainting, data))
  })
}

//////////////END LIST/////////////////////////

//////////////////HELPERS/////////////////////
function createConnection() {
  return mysql.createConnection({
    user: process.env.MYSQL_USER,
    host: process.env.MYSQL_HOST,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE
  })
}

const createPainting = (painting, callback) => {
  if (painting) {
    const connection = createConnection()
    connection.query(
      'INSERT INTO painting SET ? ',
      prepPaintingForInsert(painting),
      function(err, result) {
        if (err) return callback(err)
        if (propOr(null, 'insertId', result)) {
          callback(null, { ok: true, id: result.insertId })
        } else {
          callback(null, { ok: false, id: null })
        }
      }
    )

    connection.end(function(err) {
      if (err) return err
    })
  } else {
    return callback(new HTTPError(400, 'Missing painting'))
  }
}

const prepPaintingForInsert = painting => {
  painting = assoc('museumName', path(['museum', 'name'], painting), painting)
  painting = assoc(
    'museumLocation',
    path(['museum', 'location'], painting),
    painting
  )
  //console.log('painting after museumName and loc is added: ', painting)
  return compose(omit('_rev'), omit('_id'), omit('type'), omit('museum'))(
    painting
  )
}

const read = (tableName, id, formatter, callback) => {
  if (id && tableName) {
    const connection = createConnection()

    connection.query(
      'SELECT * FROM ' + connection.escapeId(tableName) + ' WHERE ID = ? ',
      [id],
      function(err, result) {
        if (err) return callback(err)
        if (propOr(0, 'length', result) > 0) {
          const formattedResult = formatter(head(result))
          console.log('Formatted Result: ', formattedResult)
          return callback(null, formattedResult)
        } else {
          return callback(
            new HTTPError(404, 'missing', {
              name: 'not_found',
              error: 'not found',
              reason: 'missing'
            })
          )
        }
      }
    )
  }
}

const formatPainting = painting => {
  painting = assoc('_id', prop('ID', painting), painting)
  const newMuseumObject = {
    name: painting.museumName,
    location: painting.museumLocation
  }
  const newObj = compose(omit('museumName'), omit('museumLocation'))(painting)

  return compose(
    omit('ID'),
    assoc('_rev', null),
    assoc('museum', newMuseumObject),
    assoc('type', 'painting')
  )(newObj)
}

const update = (painting, callback) => {
  if (painting) {
    const connection = createConnection()
    painting = prepPaintingForUpdate(painting)

    connection.query(
      'UPDATE painting SET ? WHERE ID = ?',
      [painting, painting.ID],
      function(err, result) {
        if (err) return callback(err)
        console.log('Updated result: ', result)

        if (propOr(0, 'affectedRows', result) === 1) {
          return callback(null, { ok: true, id: painting.ID })
        } else if (propOr(0, 'affectedRows', result) === 0) {
          return callback(
            new HTTPError(404, 'missing', {
              name: 'not_found',
              error: 'not found',
              reason: 'missing'
            })
          )
        }
      }
    )

    connection.end(function(err) {
      if (err) return err
    })
  } else {
    return callback(new HTTPError(400, 'Missing information'))
  }
}

const prepPaintingForUpdate = painting => {
  painting = assoc('ID', prop('_id', painting), painting)
  painting = assoc('museumName', path(['museum', 'name'], painting), painting)
  painting = assoc(
    'museumLocation',
    path(['museum', 'location'], painting),
    painting
  )

  return compose(omit('_id'), omit('_rev'), omit('type'), omit('museum'))(
    painting
  )
}

const deleteRow = (tableName, id, callback) => {
  if (tableName && id) {
    const connection = createConnection()
    console.log('tableName: ', tableName)
    console.log('id: ', id)

    connection.query(
      'DELETE FROM ' + connection.escapeId(tableName) + ' WHERE ID = ?',
      [id],
      function(err, result) {
        if (err) return callback(err)
        if (result && result.affectedRows === 1) {
          return callback(null, { ok: true, id: id })
        } else if (result && result.affectedRows === 0) {
          return callback(
            new HTTPError(404, 'missing', {
              name: 'not_found',
              error: 'not found',
              reason: 'missing'
            })
          )
        }
      }
    )

    connection.end(err => err)
  } else {
    return callback(new HTTPError(400, 'Missing id or entity name.'))
  }
}

const queryDB = (tableName, lastItem, filter, limit, callback) => {
  limit = limit ? limit : 5

  const connection = createConnection()

  if (filter) {
    console.log('FILTER MODE')
    const arrFilter = split(':', filter)
    const filterField = head(arrFilter)
    const filterValue = last(arrFilter)

    let whereClause = ` WHERE ${filterField} = ?`
    let sql = `SELECT *
       FROM ${connection.escapeId(tableName)}
       ${whereClause}
       ORDER BY name
       LIMIT ${limit}`

    console.log('SQL: ', sql)

    connection.query(sql, [filterValue], function(err, result) {
      if (err) return callback(err)
      return callback(null, result)
    })
  } else if (lastItem) {
    console.log('NEXT PAGE MODE')
    let whereClause = ' WHERE name > ? '
    let sql = `SELECT *
     FROM ${connection.escapeId(tableName)}
     ${whereClause}
     ORDER BY name
     LIMIT ${limit}`
    console.log('SQL: ', sql)
    connection.query(sql, [lastItem], function(err, result) {
      if (err) return callback(err)
      return callback(null, result)
    })
  } else {
    console.log('FIRST PAGE MODE')
    let whereClause = " WHERE name > '' "
    let sql = `SELECT *
       FROM ${connection.escapeId(tableName)}
       ${whereClause}
       ORDER BY name
       LIMIT ${limit}`
    console.log('SQL: ', sql)
    connection.query(sql, function(err, result) {
      if (err) return callback(err)
      return callback(null, result)
    })
  }
  connection.end(err => err)
}

////////////////////END HELPERS//////////////
const dal = {
  createPainting,
  getPainting,
  updatePainting,
  deletePainting,
  listPaintings
}

module.exports = dal
