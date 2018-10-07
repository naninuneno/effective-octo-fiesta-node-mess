const mongoose = require('mongoose');
const passport = require('passport');
const router = require('express').Router();
const auth = require('../auth');
const Users = mongoose.model('Users');

router.get('/', function(req, res, next) {
    res.render('index', { title: 'Users', descriptor: 'still garbage' });
});

//POST new user route (optional, everyone has access)
router.post('/', auth.optional, (req, res, next) => {
    const {body: {user}} = req;

    if (!user.email) {
        return res.status(422).json({
            errors: {
                email: 'is required',
            },
        });
    }

    if (!user.password) {
        return res.status(422).json({
            errors: {
                password: 'is required',
            },
        });
    }

    const finalUser = new Users(user);

    finalUser.setPassword(user.password);

    return finalUser.save();

    // return finalUser.save()
    //     .then(() => res.json({user: finalUser.toAuthJSON()}));
});

//POST login route (optional, everyone has access)
router.post('/login', auth.optional, (req, res, next) => {
    const {body: {user}} = req;

    if (!user.email) {
        return res.status(422).json({
            errors: {
                email: 'is required',
            },
        });
    }

    if (!user.password) {
        return res.status(422).json({
            errors: {
                password: 'is required',
            },
        });
    }

    return passport.authenticate('local', {session: false}, (err, passportUser, info) => {
        if (err) {
            return next(err);
        }

        if (passportUser) {
            req.session.login(passportUser, function(err) {
                if (err) {
                    return res.status(500).json({
                        errors: {
                            general: "There was an error logging in. Please try again later."
                        }
                    });
                }
            });

            return res.json({user: passportUser});

            // const user = passportUser;
            // user.token = passportUser.generateJWT();
            // return res.json({user: user.toAuthJSON()});
        }

        return res.status(400).json({
            errors: {
                general: 'invalid credentials'
            },
        });
    })(req, res, next);
});

//GET current user (required, only authenticated users have access)
router.get('/current', auth.required, (req, res, next) => {
    // const {payload: {id}} = req;
    //
    // return Users.findById(id)
    //     .then((user) => {
    //         if (!user) {
    //             return res.sendStatus(400);
    //         }
    //
    //         return res.json({user: user.toAuthJSON()});
    //     });
});

module.exports = router;