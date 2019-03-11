var express = require('express')
const { decorateRouter } = require('@awaitjs/express');

var router = decorateRouter(express.Router())

const projectService = require('../service/project-service')

router.getAsync('/profile', async function (req, res, next) {
    try {
        const project = await projectService.getProject(req.query.id)
        res.send(JSON.stringify({
            code: 0,
            data: {
                project: project
            }
        }))
    } catch (err) {
        next(err)
    }
})

router.getAsync('/search', async function (req, res, next) {
    try {
        const projects = await projectService.search(req.query.keyword)
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