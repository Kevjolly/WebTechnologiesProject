var express = require('express')
const { decorateRouter } = require('@awaitjs/express');

var router = decorateRouter(express.Router())

const msgService = require('../service/msg-service')

router.postAsync('/single', async function (req, res, next) {
    try {
        msgService.sendSingle(req.body)
        res.send('{"msg":"single message sent successfully"}')
    } catch (err) {
        next(err)
    }
})

router.postAsync('/group', async function (req, res, next) {
    try {
        res.send('{"msg":"signup successfully"}')
    } catch (e) {
        next(err)
    }
})

module.exports = router