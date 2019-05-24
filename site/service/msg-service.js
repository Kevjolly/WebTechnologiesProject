const userDao = require('../dao/user-dao')
const projectDao = require('../dao/project-dao')
const fetch = require('node-fetch');

const serverKey = 'AAAAgYfJ0Wg:APA91bFWmAJSk79StVf9ofPijbVCgc7ft78csLIFrb_dIRaOnRhYcEjeF8Bq4iNQrO9PZey9shc8X-q9sMDuhqW6ZO18FzELZUND2XSXUBfol5I8ePv82jy-a0PrlOpsryn8O9trIeGf';

class MsgService {
    async sendSingle(body) {
        const email = body.to
        const user = await userDao.getUser(email, ['token', 'nickname'])

        if (user.token == '' || !user || !(user.token)) {
            return
        }

        try {
            var notification = {
                'title': 'TeamUP',
                'body': user.nickname + ' sent you a message',
                'click_action': 'http://localhost:8081',
                'icon': 'http://localhost:8081/img/favicon.png'
            };

            const res = await fetch('https://fcm.googleapis.com/fcm/send', {
                'method': 'POST',
                'headers': {
                    'Authorization': 'key=' + serverKey,
                    'Content-Type': 'application/json'
                },
                'body': JSON.stringify({
                    'to': user.token,
                    'data': {
                        'msg': body,
                        'notification': notification
                    }
                })
            })

            console.log('call fcm res', res)
        } catch (e) {
            console.log('failed to send message', e)
        }
    }

    async sendProject(body) {
        const projectId = body.project
        const users = await userDao.getProjectUsers(projectId, ['token'])

        var tokens = [];
        users.forEach(function (user) {
            tokens.push(user.token);
        });

        const project = await projectDao.getProject(projectId)

        body.projectName = project.name;

        var notification = {
            'title': 'TeamUP',
            'body': 'new message from project ' + project.name,
            'click_action': 'http://localhost:8081',
            'icon': 'http://localhost:8081/img/favicon.png'
        };

        try {
            const res = await fetch('https://fcm.googleapis.com/fcm/send', {
                'method': 'POST',
                'headers': {
                    'Authorization': 'key=' + serverKey,
                    'Content-Type': 'application/json'
                },
                'body': JSON.stringify({
                    'registration_ids': tokens,
                    'data': {
                        'msg': body,
                        'notification': notification
                    }
                })
            })

            console.log('send group message fcm response', res)
        } catch (e) {
            console.log('send group message failed', e)
        }
    }
}

module.exports = exports = new MsgService();