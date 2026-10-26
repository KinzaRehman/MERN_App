
 // config/passport.js

// load all the things we need
const LocalStrategy = require('passport-local').Strategy

// load up the user model
const User = require('../app/models/user')

// expose this function to our app using module.exports
module.exports = function(passport) {

    // =========================================================================
    // PASSPORT SESSION SETUP ==================================================
    // =========================================================================
    // required for persistent login sessions
    // passport needs to serialize and deserialize users out of the session

    // used to serialize the user for the session
    // stores the user's ID in the session
    passport.serializeUser(function(user, done) {
        done(null, user.id)
    })

    // used to deserialize the user
    // finds the user in MongoDB using the ID stored in the session
    passport.deserializeUser(function(id, done) {
        User.findById(id)
            .then(user => {
                done(null, user)
            })
            .catch(error => {
                done(error)
            })
    })


    // =========================================================================
    // LOCAL SIGNUP ============================================================
    // =========================================================================
    // we are using named strategies since we have one for login and one for signup
    // by default, if there was no name, it would just be called 'local'

    passport.use('local-signup', new LocalStrategy({
        // by default, local strategy uses username and password
        // we will override username with email
        usernameField: 'email',
        passwordField: 'password',
        passReqToCallback: true // allows us to pass the request to the callback
    },
    function(req, email, password, done) {

        // make email lowercase so duplicate accounts aren't created
        email = email.trim().toLowerCase()

        // find a user whose email matches the signup form
        // check if the user already exists
        User.findOne({ 'local.email': email })
            .then(user => {

                // if the email already exists, don't create another account
                if (user) {
                    return done(null, false, {
                        message: 'That email is already taken.'
                    })
                }

                // if no user exists, create a new user
                const newUser = new User()

                // set the user's local credentials
                newUser.local.email = email

                // hash the password before saving it to MongoDB
                // we never want to store the original password
                newUser.local.password = newUser.generateHash(password)

                // save the new user to MongoDB
                newUser.save()
                    .then(savedUser => {
                        // signup was successful
                        return done(null, savedUser)
                    })
                    .catch(error => {
                        // return an error if saving fails
                        return done(error)
                    })

            })
            .catch(error => {
                // return an error if searching MongoDB fails
                return done(error)
            })

    }))


    // =========================================================================
    // LOCAL LOGIN =============================================================
    // =========================================================================
    // this strategy checks if the user's email and password are correct

    passport.use('local-login', new LocalStrategy({
        // use email instead of username for login
        usernameField: 'email',
        passwordField: 'password'
    },
    function(email, password, done) {

        // convert email to lowercase to match signup
        email = email.trim().toLowerCase()

        // search MongoDB for the user trying to log in
        User.findOne({ 'local.email': email })
            .then(user => {

                // if no user is found, login fails
                if (!user) {
                    return done(null, false, {
                        message: 'No user found.'
                    })
                }

                // if the user exists but the password is incorrect
                if (!user.validPassword(password)) {
                    return done(null, false, {
                        message: 'Oops! Wrong password.'
                    })
                }

                // if the email and password are correct
                // return the user and allow login
                return done(null, user)

            })
            .catch(error => {
                // return any MongoDB errors
                return done(error)
            })

    }))

}
