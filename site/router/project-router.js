var express = require('express')
const { decorateRouter } = require('@awaitjs/express');

var router = decorateRouter(express.Router());

const projectService = require('../service/project-service');

// TODO list projects API

router.postAsync('/create', async function (req, res, next) {
    try {
        var projectId = new Date().getTime();
        req.body.id = projectId;
        req.body.creator = req.email;

        await projectService.create(req.body)
        res.send(JSON.stringify({
            code: 0,
            data: {
                projectId: projectId
            }
        }));
    } catch (err) {
        next(err);
    }
})

router.postAsync('/edit', async function (req, res, next) {
    try {
        await projectService.update(req.body.projectId, req.body);
        res.send(JSON.stringify({
            code: 0,
            msg: 'project edited',
            data: {
            }
        }));
    } catch (e) {
        next(e);
    }
})

router.postAsync('/join', async function (req, res, next) {
    try {
        await projectService.join(req.email, req.body.projectId);
        res.send(JSON.stringify({
            code: 0,
            data: {
            }
        }));
    } catch (err) {
        next(err);
    }
})

router.postAsync('/quit', async function (req, res, next) {
    try {
        await projectService.quit(req.email, req.body.projectId);
        res.send(JSON.stringify({
            code: 0,
            data: {
            }
        }));
    } catch (err) {
        next(err);
    }
})

router.postAsync('/approve', async function (req, res, next) {
    try {
        projectService.agree(req.body.applicant, req.body.projectId);
        res.send(JSON.stringify({
            code: 0,
            data: {
            }
        }));
    } catch (err) {
        next(err);
    }
})

router.get('/profile', async function (req, res, next) {
    try {
        const result = await projectService.getProject(req.query.id);
        res.render('project.html', result);
    } catch (err) {
        next(err);
    }
})

router.get('/search', async function (req, res, next) {
    try {
        if (!('page' in req.query)) {
            req.query.page = 1;
        }
        if (!('count' in req.query)) {
            req.query.count = 12;
        }
        const result = await projectService.search(req.query);
        res.render('search_projects.html', result);
        // res.send(JSON.stringify({
        //     code: 0,
        //     msg: 'project edited',
        //     data: result
        // }))
    } catch (err) {
        next(err);
    }
})

module.exports = router;