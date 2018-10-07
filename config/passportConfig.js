const mongoose = require('mongoose');
const passportConfig = require('passport');
const LocalStrategy = require('passport-local');

const Users = mongoose.model('Users');

passportConfig.use(new LocalStrategy({
    usernameField: 'user[email]',
    passwordField: 'user[password]'
}, (email, password, done) => {
    Users.findOne({email})
        .then((user) => {
            if (!user || !user.validatePassword(password)) {
                return done(null, false, {errors: {'email or password': 'is invalid'}});
            }

            return done(null, user);
        }).catch(done);
}));