var express = require('express')
const { decorateRouter } = require('@awaitjs/express');

var router = decorateRouter(express.Router())

const projectService = require('../service/project-service')

router.postAsync('/create', async function (req, res, next) {
    try {
        var projectId = new Date().getTime()
        req.body.id = projectId
        req.body.creator = req.email

        await projectService.create(req.body)
        res.send(JSON.stringify({
            code: 0,
            data: {
                projectId: projectId
            }
        }))
    } catch (err) {
        next(err)
    }
})

router.postAsync('/join', async function (req, res, next) {
    try {
        projectService.join(req.email, req.body.projectId)
        res.send(JSON.stringify({
            code: 0,
            data: {
            }
        }))
    } catch (err) {
        next(err)
    }
})

router.postAsync('/quit', async function (req, res, next) {
    try {
        projectService.quit(req.email, req.body.projectId)
        res.send(JSON.stringify({
            code: 0,
            data: {
            }
        }))
    } catch (err) {
        next(err)
    }
})

router.postAsync('/agree', async function (req, res, next) {
    try {
        projectService.agree(req.body.applicant, req.body.projectId)
        res.send(JSON.stringify({
            code: 0,
            data: {
            }
        }))
    } catch (err) {
        next(err)
    }
})

router.getAsync('/profile', async function (req, res, next) {
    try {
        const result = await projectService.getProject(req.query.id)
        res.send(JSON.stringify({
            code: 0,
            data: result
        }))
    } catch (err) {
        next(err)
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
        const projects = await projectService.search(req.query)
        res.send(JSON.stringify({
            code: 0,
            data: {
                projects: projects
            }
        }))
    } catch (err) {
        next(err)
    }
})

module.exports = router