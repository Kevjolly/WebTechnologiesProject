var express = require('express')
const { decorateRouter } = require('@awaitjs/express');

var router = decorateRouter(express.Router())

const msgService = require('../service/msg-service')

router.postAsync('/single', async function (req, res, next) {
    console.log('send single message body', req.body)

    try {
        req.body.from = req.email
        req.body.id = new Date().getTime();

        await msgService.sendSingle(req.body)

        res.send({
            code: 0,
            data: req.body
        })
    } catch (err) {
        next(err)
    }
})

router.postAsync('/project', async function (req, res, next) {
    console.log('send project message body', req.body)

    try {
        req.body.from = req.email
        req.body.id = new Date().getTime();

        await msgService.sendProject(req.body)
        
        res.send({
            code: 0,
            data: req.body
        })
    } catch (err) {
        next(err)
    }
})

router.postAsync('/offline', async function (req, res, next) {
    try {
        const result = await msgService.getOffline(req.email)
        res.send({
            code: 0,
            data: result
        })
    } catch (err) {
        next(err)
    }
})

router.postAsync('/ack', async function (req, res, next) {
    try {
        await msgService.ack(req.email, req.body.messageId)
        res.send({
            code: 0,
            data: {}
        })
    } catch (err) {
        next(err)
    }
})

module.exports = router