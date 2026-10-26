
module.exports = function(app, passport, db, ObjectId) {

// normal routes ===============================================================

    // show the login page when visiting localhost
  // LANDING PAGE
app.get('/', function(req, res) {
    if (req.isAuthenticated()) {
        res.redirect('/profile')
    } else {
        res.render('index.ejs')
    }
});

    // PROFILE SECTION =========================
    app.get('/profile', isLoggedIn, function(req, res) {
        db.collection('pins')
            .find({ userId: req.user._id.toString() })
            .toArray()
            .then(result => {
                res.render('profile.ejs', {
                    user: req.user,
                    pins: result
                })
            })
            .catch(err => {
                console.log(err)
                res.status(500).send('Error loading pin')
            })
    });

    // LOGOUT ==============================
    app.post('/logout', function(req, res, next) {
        req.logout(function(err) {
            if (err) return next(err)

            req.session.destroy(function(err) {
                if (err) return next(err)

                res.clearCookie('connect.sid')
                console.log('User has logged out!')
                res.redirect('/')
            })
        })
    });


// pinboard routes ==============================================================

    // CREATE - add a new pin
    app.post('/pins', isLoggedIn, (req, res) => {

        const { imageUrl, category, itemName, color, tags } = req.body

        // check that the required fields are filled out
        if (!imageUrl || !category || !itemName || !color) {
            return res.status(400).send('Please fill out all required fields.')
        }

        // check if the image URL is valid
        let url

        try {
            url = new URL(imageUrl)

            if (url.protocol !== 'http:' && url.protocol !== 'https:') {
                return res.status(400).send('enter valid URL')
            }
        } catch (err) {
            return res.status(400).send('Invalid image URL')
        }

        // turn tags into an array , and clean them up to make sure the txts consistent
        const tagArray = (tags || '').split(',').map(tag => tag.trim().replace(/^#/, '')).filter(tag => tag !== '')

        // save the new pin to MongoDB
        db.collection('pins').insertOne({
            userId: req.user._id.toString(),
            imageUrl: url.href,
            category: category,
            itemName: itemName,
            color: color,
            tags: tagArray,
            createdAt: new Date()
        })
        .then(result => {
            console.log('Pin saved to database')
            res.redirect('/profile')
        })
        .catch(err => {
            console.log(err)
            res.status(500).send('Error saving pin')
        })
    })

    // UPDATE - edit an existing pin
app.put('/pins/:id', isLoggedIn, (req, res) => {

    const id = req.params.id
    const { imageUrl, category, itemName, color, tags } = req.body

    if (!ObjectId.isValid(id)) {
        return res.status(400).send('Invalid pin ID')
    }

    if (!imageUrl || !category || !itemName || !color) {
        return res.status(400).send('Please fill out all required fields')
    }
    // check the image URL
    let url
    try {
        url = new URL(imageUrl)
        if (url.protocol !== 'http:' && url.protocol !== 'https:') {
            return res.status(400).send('Invalid image URL')
        }
    } catch (err) {
        return res.status(400).send('Invalid image URL')
    }

    // turn tags into an array
    const tagArray = (tags || '')
        .split(',')
        .map(tag => tag.trim().replace(/^#/, ''))
        .filter(tag => tag !== '')

    // update the existing pin instead of creating a new one
    db.collection('pins').updateOne(
        {
            _id: new ObjectId(id),
            userId: req.user._id.toString()
        },
        {
            $set: {
                imageUrl: url.href,
                category: category,
                itemName: itemName,
                color: color,
                tags: tagArray
            }
        }
    )
    .then(result => {
        if (result.matchedCount === 0) {
            return res.status(404).send('Pin not found')
        }
        res.json({ message: 'Pin updated!' })
    })
    .catch(err => {
        console.log(err)
        res.status(500).send('Error updating pin')
    })
})
     


    // DELETE remove a pin
    app.delete('/pins/:id', isLoggedIn, (req, res) => {

        const id = req.params.id

        if (!ObjectId.isValid(id)) {
            return res.status(400).send('Invalid pin ID')
        }

        db.collection('pins').findOneAndDelete({
            _id: new ObjectId(id),
            userId: req.user._id.toString()
        })
        .then(result => {
            if (!result) {
                return res.status(404).send('Pin not found')
            }

            res.json({ message: 'Pin deleted!' })
        })
        .catch(err => {
            console.log(err)
            res.status(500).send('Error deleting pin')
        })
    })


// =============================================================================
// AUTHENTICATE (FIRST LOGIN) ==================================================
// =============================================================================

    // locally --------------------------------

        // LOGIN ===============================

        // show the login form
        app.get('/login', function(req, res) {
            res.render('login.ejs', {
                message: req.flash('error')
            })
        });

        // process the login form
        app.post('/login', passport.authenticate('local-login', {
            successRedirect: '/profile', // redirect to the secure profile section
            failureRedirect: '/login', // redirect back to login if there is an error
            failureFlash: true // allow flash messages
        }));


        // SIGNUP =================================

        // show the signup form
        app.get('/signup', function(req, res) {
            res.render('signup.ejs', {
                message: req.flash('error')
            })
        });

        // process the signup form
        app.post('/signup', passport.authenticate('local-signup', {
            successRedirect: '/profile', // redirect to the secure profile section
            failureRedirect: '/signup', // redirect back to signup if there is an error
            failureFlash: true // allow flash messages
        }));

};

// route middleware to ensure user is logged in
function isLoggedIn(req, res, next) {
    if (req.isAuthenticated())
        return next();

    res.redirect('/login');
}
