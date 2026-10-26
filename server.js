
require('dotenv').config()

// load all the things we need
const express = require('express')
const path = require('path')
const mongoose = require('mongoose')

// MongoDB
const { MongoClient, ObjectId } = require('mongodb')

// Passport authentication
const passport = require('passport')
const session = require('express-session')
//const MongoStore = require('connect-mongo').MongoStore
const { MongoStore } = require('connect-mongo')
const flash = require('connect-flash')

const app = express()

const PORT = process.env.PORT || 4000


// =========================================================================
// MIDDLEWARE ===============================================================
// =========================================================================

// set EJS as the view engine
app.set('view engine', 'ejs')

// allow Express to read form data
app.use(express.urlencoded({ extended: true }))
app.use(express.json())

// allow Express to use CSS and JavaScript files
app.use(express.static(path.join(__dirname, 'public')))


// =========================================================================
// SESSION SETUP ============================================================
// =========================================================================

// save login sessions in MongoDB
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
        mongoUrl: process.env.MONGODB_URI,
        dbName: 'pinboard'
    })
}))


// =========================================================================
// PASSPORT SETUP ===========================================================
// =========================================================================

// initialize Passport
app.use(passport.initialize())

// allow Passport to remember logged-in users
app.use(passport.session())

// allow login and signup error messages
app.use(flash())

// load our Passport login and signup strategies
require('./config/passport')(passport)


// =========================================================================
// MONGODB ==================================================================
// =========================================================================

// connect to MongoDB Atlas
const client = new MongoClient(process.env.MONGODB_URI)

// connect Mongoose for the User model
mongoose.connect(process.env.MONGODB_URI, {
    dbName: 'pinboard'
})
.then(() => {
    console.log('Mongoose connected!')

    // connect MongoDB for our pins collection
    return client.connect()
})
.then(() => {
    console.log('Connected to MongoDB Atlas!')

    const db = client.db('pinboard')

    // =========================================================================
    // ROUTES =================================================================
    // =========================================================================

    // load all routes from app/routes.js
    // includes login, signup, profile, and Pinboard CRUD
    require('./app/routes')(app, passport, db, ObjectId)

    // =========================================================================
    // START SERVER ============================================================
    // =========================================================================

    app.listen(PORT, () => {
        console.log(`Server running at http://localhost:${PORT}`)
    })
})
.catch(error => {
    console.error('MongoDB connection failed:', error)
})
