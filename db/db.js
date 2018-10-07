const mongoose = require('mongoose');

//Configure mongoose's promise to global promise
mongoose.promise = global.Promise;

const dbUrl = 'mongodb://localhost/firstrestapidb';

const config = {
    db: {
        db: 'firstrestapidb',
        host: '127.0.0.1',
        url: dbUrl
        // port: 6646,  // optional, default: 27017
        // username: 'admin', // optional
        // password: 'secret', // optional
        // collection: 'mySessions' // optional, default: sessions
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