const userDao = require('../dao/user-dao')
const fetch = require('node-fetch');
const serverKey = 'AAAAgYfJ0Wg:APA91bFWmAJSk79StVf9ofPijbVCgc7ft78csLIFrb_dIRaOnRhYcEjeF8Bq4iNQrO9PZey9shc8X-q9sMDuhqW6ZO18FzELZUND2XSXUBfol5I8ePv82jy-a0PrlOpsryn8O9trIeGf';

class MsgService {
    async sendSingle(body) {
        const to = body.to
        const user = await userDao.getUser(to, ['token'])
        const msg = body.msg

        try {
            // TODO message content
            var notification = {
                'title': 'Portugal vs. Denmark',
                'body': '5 to 1',
                'icon': 'firebase-logo.png',
                'click_action': 'http://localhost:8081'
            };

            const res = await fetch('https://fcm.googleapis.com/fcm/send', {
                'method': 'POST',
                'headers': {
                    'Authorization': 'key=' + serverKey,
                    'Content-Type': 'application/json'
                },
                'body': JSON.stringify({
                    'notification': notification,
                    'to': user.token
                })
            })

            console.log('call fcm res', res)
        } catch (e) {
            console.log('failed to send message', e)
        }
    }

    async sendGroup(body) {
        const group = body.group
    }
}

module.exports = exports = new MsgService();