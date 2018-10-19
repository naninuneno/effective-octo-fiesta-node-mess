const groupBy = require('lodash/groupBy');
const express = require('express');
const router = express.Router();
const request = require('request');

const mongoose = require('mongoose');
const Products = mongoose.model('Products');
const Categories = mongoose.model('Categories');

const helper = require('./route_helper');

router.get('/', function (req, res, next) {
    helper.redirectToLoginOrShow(req, res, function () {
        getGroupedCategories().then(function (productMap) {
            Object.keys(productMap).forEach(function (key) {
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

router.get('/:id/', function (req, res, next) {
    helper.redirectToLoginOrShow(req, res, function () {
        return request.get(
            helper.getBaseUrl(req) + '/api/products/' + req.params.id,
            function (error, response, body) {
                if (!error && response.statusCode === 200) {
                    const product = JSON.parse(body);
                    return res.render('product', {
                        product: product,
                        user: req.session.currentUser(),
                        active_tab: "products"
                    });
                } else {
                    console.log(error);
                    return res.json(error);
                }
            }
        );
    });
});

router.get('/:id/delete', function (req, res, next) {
    helper.redirectToLoginOrShow(req, res, function () {
        return request.delete(
            helper.getBaseUrl(req) + '/api/products/' + req.params.id,
            function (error, response, body) {
                if (!error && response.statusCode === 200) {
                    return res.redirect("/products/");
                } else {
                    console.log(error);
                    return res.json(error);
                }
            }
        );
    });
});

router.get('/:id/edit', function (req, res, next) {
    helper.redirectToLoginOrShow(req, res, function () {
        return new Promise(function (resolve, reject) {
            request.get(
                helper.getBaseUrl(req) + '/api/products/' + req.params.id,
                function (error, response, body) {
                    if (!error) {
                        resolve(JSON.parse(body));
                    } else {
                        reject(res.json(error));
                    }
                }
            )
        }).then(function (product) {
            Categories.find().lean().exec(function (err, categories) {
                return res.render('product', {
                    edit: true,
                    product: product,
                    categories: categories,
                    user: req.session.currentUser(),
                    active_tab: "products"
                });
            });
        });
    });
});

router.post('/:id/submit_edit', function (req, res, next) {
    helper.redirectToLoginOrShow(req, res, function () {
        return new Promise(function (resolve, reject) {
            request.put(
                {
                    uri: helper.getBaseUrl(req) + '/api/products/' + req.params.id,
                    json: req.body,
                },
                function (error, response, body) {
                    if (!error && response.statusCode === 200) {
                        return resolve(body);
                    } else {
                        console.log('error: ' + error);
                        return (res.json(error));
                    }
                }
            )
        }).then(function (product) {
            res.send({redirect: '/products/' + product._id});
        });
    });
});

function getGroupedCategories() {
    return new Promise(function (resolve, reject) {
        Products.find().lean().exec(function (err, products) {
            const groupedProductMap = groupBy(products, function (item) {
                return item.category.type;
            });

            resolve(groupedProductMap);
        });
    });
}

module.exports = router;