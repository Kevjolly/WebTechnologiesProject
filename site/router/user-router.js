var express = require('express')
const { decorateRouter } = require('@awaitjs/express');

var router = decorateRouter(express.Router())

const userService = require('../service/user-service')

router.postAsync('/signup', async function (req, res, next) {
    console.log('req body', req.body)

    try {
        await userService.signup(req.body);
        res.send('{"msg":"signup successfully"}')
    } catch (e) {
        next(err)
    }
})

router.getAsync('/profile', async function (req, res) {
    try {
        const result = await userService.getProfile(req.query.id);
        res.send('profile')
    } catch (e) {
        next(e)
    }
})

router.postAsync('/search', async function (req, res) {
    try {
        const result = await userService.search(req.query.keyword);
        res.send('search')
    } catch (e) {
        next(e)
    }
})

module.exports = router