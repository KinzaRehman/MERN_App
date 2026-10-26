// load the things we need
const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')

// define the schema for our user model
const userSchema = mongoose.Schema({

    local            : {
        email        : String,
        password     : String
    }

});

// generate a hash for the password
userSchema.methods.generateHash = function(password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8))
}

// check if the password is correct
userSchema.methods.validPassword = function(password) {
    return bcrypt.compareSync(password, this.local.password)
}

// create the model for users and expose it to our app
module.exports = mongoose.model('User', userSchema);
