const groupBy = require('lodash/groupBy');
const express = require('express');
const router = express.Router();
const request = require('request');

const mongoose = require('mongoose');
const Products = mongoose.model('Products');

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