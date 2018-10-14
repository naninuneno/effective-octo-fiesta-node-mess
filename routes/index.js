const groupBy = require('lodash/groupBy');
const express = require('express');
const router = express.Router();

router.get('/login', function (req, res, next) {
    if (req.session.isLoggedIn()) {
        res.redirect('/');
    } else {
        res.render('login', {notLoggedIn: true});
    }
});

router.get('/', function (req, res, next) {
    redirectToLoginOrShow(req, res, function () {
        res.render('index', {
            title: 'Espresso',
            user: req.session.currentUser()
        });
    });
});

router.get('/products/', function (req, res, next) {
    redirectToLoginOrShow(req, res, function () {
        var products = [
            {
                "name": "Plug Converter",
                "price": 15.99,
                "category": {
                    "type": "appliance"
                }
            },
            {
                "name": "Toaster",
                "price": 29.99,
                "category": {
                    "type": "appliance"
                }
            },
            {
                "name": "Chair",
                "price": 19.99,
                "category": {
                    "type": "furniture"
                }
            }
        ];
        var groupedProductMap = groupBy(products, function(item) {
            return item.category.type;
        });
        Object.keys(groupedProductMap).forEach(function(key) {
            // clean up to show as a title - uppercase first letter + pluralise
            var newKey = key.charAt(0).toUpperCase() + key.substr(1);
            if (newKey.slice(-1) === "s") {
                newKey += "'";
            } else {
                newKey += "s";
            }
            groupedProductMap[newKey] = groupedProductMap[key];
            delete groupedProductMap[key];
        });

        res.render('products', {
            groupedProductMap: groupedProductMap,
            user: req.session.currentUser()
        });
    });
});

function redirectToLoginOrShow(req, res, cb) {
    if (req.session.isLoggedIn()) {
        cb();
    } else {
        res.redirect('/login');
    }
}

router.use('/api', require('./api'));

module.exports = router;
