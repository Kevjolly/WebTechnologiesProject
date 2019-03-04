var express = require('express')
var router = express.Router()

const userService = require('../service/user-service')

router.post('/signup', async function (req, res, next) {
    console.log('req body', req.body)

    try {
        await userService.signup(req.body);
        res.send('{"code":200}')
    } catch (e) {
        console.log('signup exception', e)
        next(e)
    }
})

router.get('/profile', function (req, res) {
    userService.getProfile(req.query.id).then(() => {
        res.send('profile')
    }).catch(err => {
        next(err)
    });
})

router.get('/search', function (req, res) {
    userService.search(req.query.keyword, req.query.page, req.query.count).then(() => {
        res.send('profile')
    }).catch(err => {
        next(err)
    });
})

module.exports = router