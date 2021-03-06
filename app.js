const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const session = require('express-session');
const hbs = require('hbs');
const cors = require('cors');
const MongoStore = require('connect-mongo')(session);

const db = require('./db/db');

const app = express();

// view engine setup - Handlebars
hbs.registerPartials(__dirname + '/views/partials');
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

/*
    Custom helper for `if` equality check in handlebars template
    Example usage:
    {{#if (eq <val1> <val2>)}}<body>{{/if}}
 */
hbs.registerHelper('eq', function () {
    const args = Array.prototype.slice.call(arguments, 0, -1);
    return args.every(function (expression) {
        return args[0] === expression;
    });
});

// other app config
app.use(cors());
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(express.static(path.join(__dirname, 'public')));
app.use(cookieParser());

// session
app.use(session({
    secret: db.config.secret,
    maxAge: new Date(Date.now() + 3600000),
    store: new MongoStore(db.config.db),
    saveUninitialized: true,
    resave: false,
    // for obfuscation purposes
    name: "id",
    cookie: {
        // only the agent (e.g. browser) will have access for resubmission on requests
        httpOnly: true,
        maxAge: 7 * 24 * 60 * 60 * 1000
    }
}));

setupSession();

function setupSession() {
    // convenience method to associate user info with a user session
    session.Session.prototype.login = function(user, cb) {
        const req = this.req;
        req.session.regenerate(function(err){
            if (err){
                cb(err);
            }
        });

        req.session.userInfo = user;
        cb();
    };

    session.Session.prototype.logout = function() {
        this.req.session.userInfo = null;
    };

    session.Session.prototype.isLoggedIn = function() {
        return !(this.req.session.userInfo == null);
    };

    session.Session.prototype.currentUser = function() {
        return this.req.session.userInfo.email;
    };
}

// models
require('./db/models/users');
require('./db/models/categories');
require('./db/models/products');
// to perform after all models
require('./config/passportConfig');

// routes
app.use(require('./routes'));

db.get_connection();

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});

module.exports = app;
