var fs = require('fs');
var path = require("path");

const config = JSON.parse(fs.readFileSync(path.join(__dirname, 'config.json'), 'utf8'));

const env = process.env.NODE_ENV || 'development';

console.log('app environment', env)

const configuration = config[env]

console.log('app configuration', configuration)

module.exports = exports = configuration