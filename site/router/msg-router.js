var express = require('express')
const { decorateRouter } = require('@awaitjs/express');

var router = decorateRouter(express.Router())

const msgService = require('../service/msg-service')

router.postAsync('/single', async function (req, res, next) {
    try {
        req.body.from = req.email
        await msgService.sendSingle(req.body)
        res.send('{"msg":"single message sent successfully"}')
    } catch (err) {
        next(err)
    }
})

router.postAsync('/project', async function (req, res, next) {
    try {
        req.body.from = req.email
        await msgService.sendProject(req.body)
        res.send('{"msg":"group message sent successfully"}')
    } catch (err) {
        next(err)
    }
})

module.exports = router