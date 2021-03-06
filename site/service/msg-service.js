const userDao = require('../dao/user-dao')
const projectDao = require('../dao/project-dao')
const messageDao = require('../dao/msg-dao')
const fetch = require('node-fetch');
var config = require('../config/config')

const serverKey = 'AAAAgYfJ0Wg:APA91bFWmAJSk79StVf9ofPijbVCgc7ft78csLIFrb_dIRaOnRhYcEjeF8Bq4iNQrO9PZey9shc8X-q9sMDuhqW6ZO18FzELZUND2XSXUBfol5I8ePv82jy-a0PrlOpsryn8O9trIeGf';

class MsgService {
    async sendSingle(body) {
        const toUser = await userDao.getUser(body.to)

        body.toInfo = toUser
        body.fromInfo = await userDao.getUser(body.from)

        if (body.type == 'invitation' || body.type == 'application') {
            body.projectInfo = await projectDao.getProject(body.project)
        }

        await messageDao.saveSingle(body)

        var content;
        if (body.type == 'invitation') {
            content = body.fromInfo.nickname + ' invites you to join project ' + body.projectInfo.name;
        } else if (body.type == 'application') {
            content = body.fromInfo.nickname + ' applies to join project ' + body.projectInfo.name;
        } else {
            content = body.fromInfo.nickname + ' sent you a message';
        }

        if (toUser.token == '' || !toUser || !(toUser.token)) {
            return
        }

        try {
            var notification = {
                'title': 'TeamUP',
                'body': content,
                'click_action': config['host'] + "/message",
                'icon': config['host'] + '/img/favicon.png'
            };

            const res = await fetch('https://fcm.googleapis.com/fcm/send', {
                'method': 'POST',
                'headers': {
                    'Authorization': 'key=' + serverKey,
                    'Content-Type': 'application/json'
                },
                'body': JSON.stringify({
                    'to': toUser.token,
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
        const users = await userDao.getProjectUsers(projectId, ['email', 'token'])
        console.log('project users', users);

        var tokens = [];
        var isMember = false;
        users.forEach(function (user) {
            if (user.email != body.from) { // exclude sender
                tokens.push(user.token);
            } else {
                isMember = true;
            }
        });

        console.log(body.from, 'is a member of the project', isMember)

        if (!isMember) {
            console.log('sender not project member', body.from, projectId)
            return
        }

        const project = await projectDao.getProject(projectId)

        body.projectInfo = project
        body.fromInfo = await userDao.getUser(body.from)

        var notification = {
            'title': 'TeamUP',
            'body': 'new message from project ' + project.name,
            'click_action': config['host'] + "/message",
            'icon': config['host'] + '/img/favicon.png'
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

            await messageDao.saveProject(users, body)

            console.log('send group message fcm response', res)
        } catch (e) {
            console.log('send group message failed', e)
        }
    }

    async getOffline(user, maxId) {
        return await messageDao.getOffline(user, maxId)
    }

    async ack(user, messageId) {
        await messageDao.ack(user, messageId)
    }
}

module.exports = exports = new MsgService();