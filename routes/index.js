const express = require('express');
const router = express.Router();

const helper = require('./route_helper');

router.get('/login', function (req, res, next) {
    if (req.session.isLoggedIn()) {
        res.redirect('/');
    } else {
        res.render('login', {notLoggedIn: true});
    }
});

router.get('/', function (req, res, next) {
    helper.redirectToLoginOrShow(req, res, function () {
        res.render('index', {
            title: 'Espresso',
            user: req.session.currentUser(),
            active_tab: "index"
        });
    });
});

router.use('/api', require('./api'));
router.use('/products', require('./products'));

module.exports = router;
