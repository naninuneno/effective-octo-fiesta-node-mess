const assert = require('assert');
const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require('../app');
const mongoose = require('mongoose');
const Users = mongoose.model('Users');

chai.use(chaiHttp);

const TEST_USER_USERNAME = 'test';
const TEST_USER_PASSWORD = 'password';

var SESSION_ID = 'should-be-initialised';

describe('login', function () {
    this.timeout(10000);

    before(() => {
        return new Promise(function (resolve) {
            console.log('Running test setup tasks...');

            if (Users.db.name !== 'testfirstrestapidb') {
                throw new Error('Config not configured correctly for testing! Make sure DB points to testfirstrestapidb');
            }

            dropAllCollections()
                .then(createNewUser)
                .then(loginAndGetSessionIdForTests)
                .then((sessionId) => SESSION_ID = sessionId)
                .then(() => {
                    console.log('Test setup tasks finished');
                    resolve();
                });
        });
    });

    it('should show login page if not authenticated', () => {
        return chai.request(app)
            .get('/login/')
            .then(res => {
                const urlIndicatesLogin = res.request.url.indexOf('/login') !== -1;
                assert.strictEqual(urlIndicatesLogin, true, 'expected url to indicate login page');
                assert.strictEqual(res.status, 200);
            });
    });

    it('should redirect to index page if authenticated', () => {
        return chai.request(app)
            .get('/login/')
            .set('Cookie', 'id=' + SESSION_ID)
            .then(res => {
                const urlIndicatesLogin = res.request.url.indexOf('/login') !== -1;
                assert.strictEqual(urlIndicatesLogin, false, 'expected url not to indicate login page');
                assert.strictEqual(res.status, 200);
            });
    });

    it('should return valid session on valid credentials authentication', () => {
        assert.strictEqual(SESSION_ID !== undefined, true, 'expected session id to be set');
        assert.strictEqual(SESSION_ID.length > 10, true, 'expected session id of certain length');
    });

    it('should return errors on missing login details', () => {
        return chai.request(app)
            .post('/api/users/login/')
            .set('content-type', 'application/json')
            .send(
                {
                    user: {
                        email: 'username'
                    }
                })
            .then(res => {
                assert.strictEqual(res.status, 422);
                const errors = res.body.errors;
                assert.strictEqual(errors.length, 1, 'expected only 1 error in response');
                assert.strictEqual(errors[0], 'password is required');
            });
    });

    it('should return errors on invalid credentials authentication', () => {
        return chai.request(app)
            .post('/api/users/login/')
            .set('content-type', 'application/json')
            .send(
                {
                    user: {
                        email: 'no-exist',
                        password: 'incorrect'
                    }
                })
            .then(res => {
                assert.strictEqual(res.status, 422);
                const errors = res.body.errors;
                assert.strictEqual(errors.length, 1, 'expected only 1 error in response');
                assert.strictEqual(errors[0], 'invalid credentials');
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