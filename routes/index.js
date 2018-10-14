const groupBy = require('lodash/groupBy');
const express = require('express');
const router = express.Router();
const request = require('request');

const mongoose = require('mongoose');
const Products = mongoose.model('Products');

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
            user: req.session.currentUser(),
            active_tab: "index"
        });
    });
});

router.get('/products/', function (req, res, next) {
    redirectToLoginOrShow(req, res, function () {
        getGroupedCategories().then(function(productMap) {
            Object.keys(productMap).forEach(function(key) {
                // clean up to show as a title - uppercase first letter + pluralise
                var newKey = key.charAt(0).toUpperCase() + key.substr(1);
                if (newKey.slice(-1) === "s") {
                    newKey += "'";
                } else {
                    newKey += "s";
                }
                productMap[newKey] = productMap[key];
                delete productMap[key];
            });

            res.render('products', {
                groupedProductMap: productMap,
                user: req.session.currentUser(),
                active_tab: "products"
            });
        });
    });
});

router.get('/products/:id/', function (req, res, next) {
    redirectToLoginOrShow(req, res, function() {
        return request.get(
            getBaseUrl(req) + '/api/products/' + req.params.id,
            function (error, response, body) {
                if (!error && response.statusCode === 200) {
                    const product = JSON.parse(body);
                    console.log(product);
                    return res.render('product', {
                        product: product,
                        user: req.session.currentUser(),
                        active_tab: "products"
                    });
                } else {
                    console.log(error);
                }
            }
        );
    });
});

function getGroupedCategories() {
    return new Promise(function(resolve, reject) {
        Products.find().lean().exec(function (err, products) {
            const groupedProductMap = groupBy(products, function(item) {
                return item.category.type;
            });

            resolve(groupedProductMap);
        });
    });
}

function redirectToLoginOrShow(req, res, cb) {
    if (req.session.isLoggedIn()) {
        return cb();
    } else {
        res.redirect('/login');
    }
}

function getBaseUrl(req) {
    return req.protocol + '://' + req.get('host');
}

router.use('/api', require('./api'));

module.exports = router;
