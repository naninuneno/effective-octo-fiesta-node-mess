require('./_helper');

const assert = require('assert');
const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require('../app');

chai.use(chaiHttp);

describe('login', function () {
    this.timeout(10000);

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
            .set('Cookie', 'id=' + global.SESSION_ID)
            .then(res => {
                const urlIndicatesLogin = res.request.url.indexOf('/login') !== -1;
                assert.strictEqual(urlIndicatesLogin, false, 'expected url not to indicate login page');
                assert.strictEqual(res.status, 200);
            });
    });

    it('should return valid session on valid credentials authentication', () => {
        assert.strictEqual(global.SESSION_ID !== 'should-be-initialised', true, 'expected session id to be set');
        assert.strictEqual(global.SESSION_ID.length > 10, true, 'expected session id of certain length');
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