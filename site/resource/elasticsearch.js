var elasticsearch = require('elasticsearch');
var fs = require('fs');
var path = require('path')
var config = require('../config/config')

var client = new elasticsearch.Client({
    host: config['es-endpoint'],
    log: 'debug'
});

async function init() {
    try {
        var userIndexExists = await client.indices.exists({
            index: 'user'
        })

        if (!userIndexExists) {
            var userMapping = JSON.parse(fs.readFileSync(path.join(__dirname, '../config/user-mappings.json'), 'utf8'));
            client.indices.create({
                index: 'user',
                body: userMapping
            })
        }

        var projectIndexExists = await client.indices.exists({
            index: 'project'
        })

        if (!projectIndexExists) {
            var projectMapping = JSON.parse(fs.readFileSync(path.join(__dirname, '../config/project-mappings.json'), 'utf8'));
            client.indices.create({
                index: 'project',
                body: projectMapping
            })
        }

        var msgIndexExists = await client.indices.exists({
            index: 'message'
        })

        if (!msgIndexExists) {
            var messageMapping = JSON.parse(fs.readFileSync(path.join(__dirname, '../config/message-mappings.json'), 'utf8'));
            client.indices.create({
                index: 'message',
                body: messageMapping
            })
        }

        var ackIndexExists = await client.indices.exists({
            index: 'ack'
        })

        if (!ackIndexExists) {
            var ackMapping = JSON.parse(fs.readFileSync(path.join(__dirname, '../config/ack-mappings.json'), 'utf8'));
            client.indices.create({
                index: 'ack',
                body: ackMapping
            })
        }
    } catch (e) {
        console.error("init elasticsearch client failed", e)
        process.exit(1);
    }
}

init();

module.exports = exports = client
