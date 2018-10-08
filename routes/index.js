var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
    if (req.session.isLoggedIn()) {
        res.render('index', {title: 'Espresso', descriptor: 'garbage'});
    } else {
        res.redirect('/login');
    }
});

router.get('/login', function(req, res, next) {
    if (req.session.isLoggedIn()) {
        res.redirect('/');
    } else {
        res.render('login');
    }
});

router.use('/api', require('./api'));

module.exports = router;
