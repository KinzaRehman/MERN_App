


require('dotenv').config()



const express = require('express')


const path = require('path')

const { MongoClient } = require('mongodb')

const app = express()

const PORT = process.env.PORT || 4000

// Middleware
app.set('view engine', 'ejs')

app.use(express.urlencoded({ extended: true }))
app.use(express.json())

app.use(express.static(path.join(__dirname, 'public')))

// MongoDB
const client = new MongoClient(process.env.MONGODB_URI)

let db
//CRUD
//Create post, read get update put, delete delete
// my home page loading
app.get('/', (req, res) => {
  res.render('index')
})

//  Add a new pin
app.post('/pins', (req, res) => {
  console.log(req.body)

  const { imageUrl, category, itemName, color, tags } = req.body

  if (!imageUrl || !category || !itemName || !color) {
    return res.status(400).send('Please fill out all required fields.')
  }

  let url

  try {
    url = new URL(imageUrl)

    if (!['http:', 'https:'].includes(url.protocol)) {
      return res.status(400).send('Invalid image URL')
    }
  } catch (error) {
    return res.status(400).send('Invalid image URL')
  }

  const tagArray = (tags || '')
    .split(',')
    .map(tag => tag.trim().replace(/^#/, ''))
    .filter(tag => tag !== '')

  const newPin = { imageUrl: url.href,
    category,
    itemName,
    color,
    tags: tagArray,
    createdAt: new Date()
  }

  db.collection('pins').insertOne(newPin)
    .then(result => {
      console.log('Pin saved', result.insertedId)
      res.redirect('/')
    })
    .catch(error => {
      console.error(error)
      res.status(500).send('error saving pin')
    })
})

// Connect to MongoDB and start server port 4k
client.connect()
  .then(() => {
    console.log('Connected to MongoDB Atlas!')

    db = client.db('pinboard')

    app.listen(PORT, () => {
      console.log(`Server running at http://localhost:${PORT}`)
    })
  })
  .catch(error => {
    console.error('MongoDB connection failed:', error)
  })




