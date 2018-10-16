function redirectToLoginOrShow(req, res, cb) {
    if (req.session.isLoggedIn()) {
        return cb();
    } else {
        res.redirect('/login');
    }
}

function getBaseUrl(req) {
    return req.protocol + '://' + req.get('host');
}

module.exports = {
    redirectToLoginOrShow: redirectToLoginOrShow,
    getBaseUrl: getBaseUrl
};