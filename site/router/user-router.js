var express = require('express')
const { decorateRouter } = require('@awaitjs/express');

var router = decorateRouter(express.Router())

const userService = require('../service/user-service')
const projectService = require('../service/project-service')

router.postAsync('/signup', async function (req, res, next) {
    console.log('sign up req body', req.body)

    try {
        await userService.signup(req.body);
        res.send(JSON.stringify({
            code: 0,
            msg: 'signup successfully',
            data: {
            }
        }))
    } catch (e) {
        next(e)
    }
})

router.postAsync('/editProfile', async function (req, res, next) {
    try {
        await userService.editProfile(req.email, req.body);
        res.send(JSON.stringify({
            code: 0,
            msg: 'profile edited',
            data: {
            }
        }))
    } catch (e) {
        next(e)
    }
})

router.getAsync('/profile', async function (req, res, next) {
    try {
        var userId;

        if (req.query.id) {
            userId = req.query.id
        } else if(req.email) {
            userId = req.email
        } else {
            next()
            return
        }

        const user = await userService.getProfile(userId);
        const projects = await projectService.getProjects(user.projects);

        res.setHeader('Content-Type', 'application/json')
        res.send(JSON.stringify({
            code: 0,
            data: {
                user: user,
                projects: projects
            }
        }))
    } catch (e) {
        next(e)
    }
})

router.getAsync('/search', async function (req, res, next) {
    try {
        if (!('page' in req.query)) {
            req.query.page = 1
        }
        if (!('count' in req.query)) {
            req.query.count = 10
        }
        const result = await userService.search(req.query);
        res.send(JSON.stringify({
            code: 0,
            data: {
                result: result
            }
        }))
    } catch (e) {
        next(e)
    }
})

router.postAsync('/bindToken', async function (req, res, next) {
    try {
        await userService.updateToken(req.email, req.body.token);
        res.send(JSON.stringify({
            code: 0,
            msg: 'token uploaded successfully',
            data: {
            }
        }))
    } catch (e) {
        next(e)
    }
})

router.postAsync('/unbindToken', async function (req, res, next) {
    try {
        await userService.unbindToken(req.email);
        res.send(JSON.stringify({
            code: 0,
            msg: 'token unbinded successfully',
            data: {
            }
        }))
    } catch (e) {
        next(e)
    }
})

router.postAsync('/verify', async function (req, res, next) {
    try {
        await userService.setVerified(req.body.email);
        res.send(JSON.stringify({
            code: 0,
            msg: 'token uploaded successfully',
            data: {
            }
        }))
    } catch (e) {
        next(e)
    }
})

module.exports = router