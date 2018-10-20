const mongoose = require('mongoose');

//Configure mongoose's promise to global promise
mongoose.promise = global.Promise;

const dbname = process.env.NODE_ENV === 'test' ? 'testfirstrestapidb' : 'firstrestapidb';
console.log('DB name: ' + dbname);

const dbUrl = 'mongodb://localhost/' + dbname;

const config = {
    db: {
        db: dbname,
        host: '127.0.0.1',
        url: dbUrl
    },
    secret: 'donotuseinproduction'
};

function get_connection() {
    mongoose.connect(dbUrl);
    mongoose.set('debug', true);
    return mongoose;
}

module.exports = {
    config: config,
    get_connection: get_connection
};