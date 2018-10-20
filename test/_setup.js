require('./_helper');

const assert = require('assert');
const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require('../app');
const mongoose = require('mongoose');
const Users = mongoose.model('Users');

chai.use(chaiHttp);

const TEST_USER_USERNAME = 'test';
const TEST_USER_PASSWORD = 'password';

before(function() {
    this.timeout(10000);

    return new Promise(function (resolve) {
        console.log('===========================');
        console.log('===========================');
        console.log(' ');
        console.log('Running test setup tasks...');

        if (Users.db.name !== 'testfirstrestapidb') {
            throw new Error('Config not configured correctly for testing! Make sure DB points to testfirstrestapidb');
        }

        dropAllCollections()
            .then(createNewUser)
            .then(loginAndGetSessionIdForTests)
            .then((sessionId) => global.SESSION_ID = sessionId)
            .then(() => {
                console.log('Test setup tasks finished');
                console.log(' ');
                console.log('=========================');
                console.log('=========================');
                resolve();
            });
    });
});

function dropAllCollections() {
    return new Promise(function (resolve) {
        const collections = mongoose.connection.collections;
        console.log('- Dropping collections: ' + Object.keys(collections).join(', '));

        Promise.all(
            Object.keys(collections).map(collectionName => {
                return new Promise(function (resolve) {
                    mongoose.connection.collections[collectionName].drop(resolve);
                });
            })
        ).then(() => {
            console.log('- Dropped all collections');
            resolve();
        });
    });
}

function createNewUser() {
    return new Promise(function (resolve) {
        console.log('- Creating test user before tests');
        const userData = {
            email: TEST_USER_USERNAME,
            password: TEST_USER_PASSWORD
        };

        const testUser = new Users(userData);
        testUser.setPassword(userData.password);
        testUser.save().then(() => {
            console.log('- Created new test user');
            resolve();
        });
    });
}

function loginAndGetSessionIdForTests() {
    return new Promise(function (resolve) {
        console.log('- Logging in to get session ID for tests');
        chai.request(app)
            .post('/api/users/login/')
            .set('content-type', 'application/json')
            .send(
                {
                    user: {
                        email: TEST_USER_USERNAME,
                        password: TEST_USER_PASSWORD
                    }
                })
            .then(res => {
                assert.strictEqual(res.status, 200);
                // set auth cookie for anything needing session for auth
                resolve(res.headers['set-cookie'][0]
                    .split(';')[0]
                    .split('id=')[1]);
            });
    });
}