const mongoose = require('mongoose');
const passport = require('passport');
const router = require('express').Router();
const Users = mongoose.model('Users');

router.get('/', function (req, res, next) {
    res.render('index', {title: 'Users', descriptor: 'still garbage'});
});

// POST new user route (optional, everyone has access)
router.post('/', (req, res, next) => {
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
});

// POST login route (optional, everyone has access)
router.post('/login', (req, res, next) => {
    const {body: {user}} = req;

    if (!user.email) {
        return res.status(422).json({
            errors: [
                'email is required',
            ],
        });
    }

    if (!user.password) {
        return res.status(422).json({
            errors: [
                'password is required',
            ],
        });
    }

    if (req.session.isLoggedIn()) {
        return res.status(422).json({
            errors: [
                'already logged in'
            ]
        });
    }

    return passport.authenticate('local', {session: false}, (err, passportUser, info) => {
        if (err) {
            return next(err);
        }

        if (passportUser) {
            req.session.login(passportUser, function (err) {
                if (err) {
                    return res.status(500).json({
                        errors: [
                            'There was an error logging in. Please try again later.'
                        ]
                    });
                }
            });

            return res.json({
                user: passportUser,
                session: req.session,
                session_id: req.sessionID
            });
        }

        return res.status(400).json({
            errors: [
                'invalid credentials'
            ],
        });
    })(req, res, next);
});

// POST login route (optional, everyone has access)
router.post('/logout', (req, res, next) => {
    req.session.logout();
    return res.json({});
});

module.exports = router;