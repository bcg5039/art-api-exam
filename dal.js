const PouchDB = require('pouchdb')
PouchDB.plugin(require('pouchdb-find'))
const {
  replace,
  pathOr,
  assoc,
  toLower,
  trim,
  split,
  head,
  last,
  reject,
  join
} = require('ramda')
const db = new PouchDB(process.env.COUCHDB_URL + process.env.COUCHDB_NAME)
const buildPrimaryKey = require('./lib/build-primary-key')
const HTTPError = require('node-http-error')
const paintingPKGenerator = buildPrimaryKey('painting_')

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
//////////////CREATE A PAINTING////////////////////
function createPainting(painting, callback) {
  function drop(x) {
    console.log(x)
    return x === 'a' || x === 'the'
  }
  var name = pathOr('', ['name'], painting)
  name = toLower(name)
  name = name.split(' ')
  name = reject(drop, name)
  name = join(' ', name)
  console.log('name after join', name)
  name = trim(name)
  const pk = paintingPKGenerator(name)
  //console.log('pk before assoc:', pk)
  painting = assoc('_id', pk, painting)
  painting = assoc('type', 'painting', painting)

  createDoc(painting, callback)
}

function createDoc(doc, callback) {
  console.log('createDoc', doc)

  db.put(doc).then(res => callback(null, res)).catch(err => callback(err))
}
/////////////////////////////////////////////////////

//////////GET A PAINTING/////////////////////
function getPainting(paintingId, callback) {
  db.get(paintingId, function(err, doc) {
    if (err) return callback(err)
    doc.type === 'painting'
      ? callback(null, doc)
      : callback(new HTTPError(400, 'the provided id is not a painting'))
  })
}
/////////////////////////////////////////////

//////////UPDATE A PAINTING//////////////////
function updatePainting(painting, callback) {
  painting = assoc('type', 'painting', painting)
  createDoc(painting, callback)
}
/////////////////////////////////////////////

////////////DELETE A PAINTING////////////////
function deletePainting(paintingId, callback) {
  deleteDoc(paintingId, callback)
}

function deleteDoc(id, callback) {
  db
    .get(id)
    .then(function(doc) {
      return db.remove(doc)
    })
    .then(function(result) {
      callback(null, result)
    })
    .catch(function(err) {
      callback(err)
    })
}
/////////////////////////////////////////////

///////////////////LIST PAINTINGS//////////////
function listPaintings(filter, lastItem, limit, callback) {
  var query = {}
  console.log('filter in listPaint ', filter)
  if (filter) {
    const arrFilter = split(':', filter)
    console.log('arrFilter', arrFilter)
    const filterField = head(arrFilter)
    console.log('filterfield', filterField)
    const filterVal = last(arrFilter)
    console.log('filterVal', filterVal)
    const selectorVal = assoc(filterField, filterVal, {})
    console.log('selectorVal', selectorVal)
    if (selectorVal.yearCreated) {
      selectorVal.yearCreated = Number(selectorVal.yearCreated)
    }
    query = {
      selector: selectorVal,
      limit
    }
  } else if (lastItem) {
    query = {
      selector: {
        _id: { $gt: lastItem },
        type: 'painting'
      },
      limit
    }
  } else {
    query = {
      selector: {
        _id: { $gte: null },
        type: 'painting'
      },
      limit
    }
  }
  find(query, function(err, data) {
    if (err) return callback(err)
    callback(null, data.docs)
  })
}

function find(query, callback) {
  query ? db.find(query, callback) : callback(null, [])
}
///////////////////////////////////////////////

const dal = {
  createPainting,
  createDoc,
  getPainting,
  updatePainting,
  deletePainting,
  deleteDoc,
  listPaintings
}

module.exports = dal
