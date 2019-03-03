var elasticsearch = require('elasticsearch');

var client = new elasticsearch.Client({
    host: 'localhost:9200',
    log: 'debug'
});

module.exports = exports = client