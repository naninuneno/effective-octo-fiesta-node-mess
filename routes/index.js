var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Espresso', descriptor: 'garbage' });
});

router.get('/login', function(req, res, next) {
  res.render('login');
});

router.use('/api', require('./api'));

module.exports = router;
