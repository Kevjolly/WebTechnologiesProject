const userDao = require('../dao/user-dao')
const projectDao = require('../dao/project-dao')
const fetch = require('node-fetch');

const serverKey = 'AAAAgYfJ0Wg:APA91bFWmAJSk79StVf9ofPijbVCgc7ft78csLIFrb_dIRaOnRhYcEjeF8Bq4iNQrO9PZey9shc8X-q9sMDuhqW6ZO18FzELZUND2XSXUBfol5I8ePv82jy-a0PrlOpsryn8O9trIeGf';

class MsgService {
    async sendSingle(body) {
        const to = body.to
        const user = await userDao.getUser(to, ['token', 'nickname'])

        try {
            var notification = {
                'title': 'Teamup',
                'body': user.nickname + ' sent you a message',
                'click_action': 'http://localhost:8080', // TODO action
                'icon': ''
            };

            const res = await fetch('https://fcm.googleapis.com/fcm/send', {
                'method': 'POST',
                'headers': {
                    'Authorization': 'key=' + serverKey,
                    'Content-Type': 'application/json'
                },
                'body': JSON.stringify({
                    'notification': notification,
                    'to': user.token,
                    'data': body.msg
                })
            })

            console.log('call fcm res', res)
        } catch (e) {
            console.log('failed to send message', e)
        }
    }

    async sendGroup(body) {
        const projectId = body.project
        const users = await userDao.getProjectUsers(projectId, ['token'])

        var tokens = [];
        users.forEach(function (user) {
            tokens.push(user.token);
        });

        const project = await projectDao.getProject(projectId)

        var notification = {
            'title': 'Teamup',
            'body': user.nickname + ' sent a message to project ' + project.name,
            'click_action': 'http://localhost:8080', // TODO action
            'icon': ''
        };

        try {
            const res = await fetch('https://fcm.googleapis.com/fcm/send', {
                'method': 'POST',
                'headers': {
                    'Authorization': 'key=' + serverKey,
                    'Content-Type': 'application/json'
                },
                'body': JSON.stringify({
                    'notification': notification,
                    'registration_ids': tokens,
                    'data': body.msg
                })
            })

            console.log('send group message fcm response', res)
        } catch (e) {
            console.log('send group message failed', e)
        }
    }
}

module.exports = exports = new MsgService();