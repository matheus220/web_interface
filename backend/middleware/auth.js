const keys = require("../config/keys");
const jwt = require('jsonwebtoken');

function auth(req, res, next) {
    var token = req.header('x-auth-token');

    // Check for token
    if (!token)
        return res.status(401).json({ msg: 'No token, authorizaton denied' });

    if (token.startsWith('Bearer ')) {
        // Remove Bearer from string
        token = token.slice(7, token.length);
    }

    try {
        // Verify token
        const decoded = jwt.verify(token, keys.secretOrKey);
        // Add user from payload
        req.user = decoded;
        console.log("passou")
        next();
    } catch (e) {
        res.status(400).json({ msg: 'Token is not valid' });
    }
}

module.exports = auth;