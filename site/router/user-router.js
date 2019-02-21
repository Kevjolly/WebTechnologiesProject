var express = require('express')
var router = express.Router()

const userService = require('../service/user-service')

router.post('/signup', function (req, res) {
    userService.signup();
    res.send('signup')
})

router.post('/signin', function (req, res) {
    userService.signin();
    res.send('signin')
})

router.post('/signout', function (req, res) {
    userService.signout();
    res.send('signout')
})

router.get('/profile', function (req, res) {
    userService.getProfile();
    res.send('profile')
})

module.exports = router