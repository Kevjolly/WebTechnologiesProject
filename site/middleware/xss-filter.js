var xss = require("xss");
const { wrap } = require('@awaitjs/express');

module.exports = exports = wrap(async function (req, res, next) {
    if (req.method == "POST") {
        req.body = JSON.parse(xss(JSON.stringify(req.body)))
    }
})