const { expressjwt } = require('express-jwt');

function authJwt() {
    const secret = process.env.SECRET_KEY;
    const api = process.env.API_URL;
    return expressjwt({
        secret,
        algorithms: ['HS256'],
        isRevoked: isRevoked
    }).unless({
        path: [
            { url: /\/public\/uploads(.*)/, method: ['GET', 'OPTION'] },
            { url: /\/api\/v1\/products(.*)/, method: ['GET', 'OPTION'] },
            { url: /\/api\/v1\/categories(.*)/, method: ['GET', 'OPTION'] },
            `${api}/users/login`,
            `${api}/users/register`
        ]
    });
}

async function isRevoked(req, token) {
    return !token.payload.isAdmin;
}

module.exports = authJwt;