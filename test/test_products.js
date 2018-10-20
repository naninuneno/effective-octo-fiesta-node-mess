require('./_helper');

const assert = require('assert');
const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require('../app');
const parse = require("node-html-parser").parse;
const mongoose = require('mongoose');
const Products = mongoose.model('Products');
const Categories = mongoose.model('Categories');

chai.use(chaiHttp);

describe('view products', function () {
    this.timeout(10000);

    it('should show login page if not authenticated', () => {
        return chai.request(app)
            .get('/products/')
            .then(res => {
                const urlIndicatesLogin = res.request.url.indexOf('/login') !== -1;
                assert.strictEqual(urlIndicatesLogin, true, 'expected url to indicate login page');
                assert.strictEqual(res.status, 200);
            });
    });

    it('should display message when no products', () => {
        return chai.request(app)
            .get('/products/')
            .set('Cookie', 'id=' + global.SESSION_ID)
            .then(res => {
                const assertion = res.text.indexOf('<p>No products to display</p>') !== -1;
                assert.strictEqual(assertion, true, 'expected no products message when no products to show');
            });
    });

    describe('with existing products', function () {

        before(function () {
            return new Promise(function (resolve) {
                createCategories()
                    .then(createProducts)
                    .then(() => {
                        resolve();
                    });
            });
        });

        it('should display all products', () => {
            return chai.request(app)
                .get('/products/')
                .set('Cookie', 'id=' + global.SESSION_ID)
                .then(res => {
                    const page = parse(res.text);
                    const products = page.querySelectorAll('.item-container');

                    assert.strictEqual(products.length, 3);
                    validateProduct(products[0].rawText, 'Product 1', 19.99, 'Application');
                    validateProduct(products[1].rawText, 'Product 2', 99.99, 'Furniture');
                    validateProduct(products[2].rawText, 'Product 3', 249.99, 'Furniture');
                });
        });

        it('should display products split by category', () => {
            return chai.request(app)
                .get('/products/')
                .set('Cookie', 'id=' + global.SESSION_ID)
                .then(res => {
                    const page = parse(res.text);
                    const categories = page.querySelectorAll('.category-container h3');

                    assert.strictEqual(categories.length, 2);
                    assert.strictEqual(categories[0].rawText.includes('Applications'), true);
                    assert.strictEqual(categories[1].rawText.includes('Furniture'), true);
                });
        });

        function validateProduct(productText, name, price, category) {
            assert.strictEqual(productText.includes('Name: ' + name), true);
            assert.strictEqual(productText.includes('Price: ' + price), true);
            assert.strictEqual(productText.includes('Category: ' + category), true);
        }
    });
});

function createCategories() {
    return new Promise(function (resolve) {
        const category1Data = {
            type: 'Application'
        };
        const category2Data = {
            type: 'Furniture'
        };

        const testCategory1 = new Categories(category1Data);
        const testCategory2 = new Categories(category2Data);

        Promise.all([testCategory1.save(), testCategory2.save()])
            .then(() => resolve());
    });
}

function createProducts() {
    return new Promise(function (resolve) {
        const product1Data = {
            name: 'Product 1',
            price: 19.99,
            category: {
                type: 'Application'
            }
        };
        const product2Data = {
            name: 'Product 2',
            price: 99.99,
            category: {
                type: 'Furniture'
            }
        };
        const product3Data = {
            name: 'Product 3',
            price: 249.99,
            category: {
                type: 'Furniture'
            }
        };

        const testProduct1 = new Products(product1Data);
        const testProduct2 = new Products(product2Data);
        const testProduct3 = new Products(product3Data);

        Promise.all([testProduct1.save(), testProduct2.save(), testProduct3.save()])
            .then(() => resolve());
    });
}