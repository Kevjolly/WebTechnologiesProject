var jose = require('node-jose');
var fs = require('fs');
var path = require("path");
const { wrap } = require('@awaitjs/express');

const jwks = JSON.parse(fs.readFileSync(path.join(__dirname, '../config/jwks.json'), 'utf8'));

var whiteList = {
    '/user/signup': true,
    '/user/verify': true
}

var appClientId = '7mjqob9h58ic27tn5kf23uhe1n'

module.exports = exports = wrap(async function (req, res, next) {
    const token = req.headers['authorization'];

    if (req.method == "POST" && !whiteList[req.path]) {
        if (!token) {
            res.status(403).send('{"msg":"authorization required"}');
        } else {
            try {
                var sections = token.split('.');
                // get the kid from the headers prior to verification
                var header = jose.util.base64url.decode(sections[0]);
                header = JSON.parse(header);
                var kid = header.kid;

                var keys = jwks['keys'];

                var key_index = -1;
                for (var i = 0; i < keys.length; i++) {
                    if (kid == keys[i].kid) {
                        key_index = i;
                        break;
                    }
                }
                if (key_index == -1) {
                    console.log('public key not found in jwks.json');
                    res.status(403).send('{"msg":"public key not found in jwks.json"}');
                    return;
                }

                var key = await jose.JWK.asKey(keys[key_index]);
                var result = await jose.JWS.createVerify(key).verify(token);

                var payload = JSON.parse(result.payload);

                console.log('payload', payload);

                // and the Audience (use payload.client_id if verifying an access token)
                if (payload.aud != appClientId) {
                    res.status(403).send('{"msg":"token was not issued for this audience"}');
                    return
                }

                // additionally we can verify the token expiration
                var current_ts = Math.floor(new Date() / 1000);
                if (current_ts > payload.exp) {
                    res.status(403).send('{"msg":"token expired"}');
                    return;
                }

                // pass email to next handler
                req.email = payload.email;
            } catch (e) {
                console.log('validate token failed', e);
                res.status(403).send('{"msg":"token validation failed"}');
            }
        }
    }
})
