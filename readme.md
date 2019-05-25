# Project: TeamUP

## Project Group:
- Kévin Jolly, Candidate N° 97249
- Ren Jiang, Candidate N° 97247

## Versions:
node -v
v11.9.0

npm -v
6.5.0

elasticsearch
version 6-6-1

## Environment Setup
### setup Elasticsearch
1. Unzip Elasticsearch bundle
2. Run bin/elasticsearch (or bin\elasticsearch.bat on Windows)

### start server
```
node site
```

### Access application
http://localhost:8081

## Cloud Hosted Version
http://teamup-env.qck29pusvr.eu-west-2.elasticbeanstalk.com/


## Development Documentation
### API documentation 
https://documenter.getpostman.com/view/6943885/S17m1XEG

### SDK documentation

See site/public/views/example.html

should include following scripts in every web page: 

```
<script type="text/javascript" src="../js/vendor/jquery-3.3.1.min.js"></script>
<script type="text/javascript" src="../js/vendor/aws-cognito-sdk.min.js"></script>
<script type="text/javascript" src="../js/vendor/amazon-cognito-identity.min.js"></script>
<script type="text/javascript" src="../js/auth.js"></script>
<script src="https://www.gstatic.com/firebasejs/5.8.6/firebase-app.js"></script>
<script src="https://www.gstatic.com/firebasejs/5.8.6/firebase-messaging.js"></script>
<script type="text/javascript" src="../js/im.js"></script>
<script src="//cdn.jsdelivr.net/alasql/0.2/alasql.min.js"></script>
```

#### Auth SDK

Defined in auth.js

1. signup
```
function signup(email, password, nickname, successCallback, failureCallback)
```

2. verify email address
```
function verify(email, code, successCallback, failureCallback)
```

3. sign in
```
function signin(email, password, successCallback, failureCallback)
```

4. signout
```
function signout()
```

5. get Authorization header

    * access the *authToken* variable directly

#### IM SDK

Defined in im.js. Note: be sure to grant push notification permission. IM functions of Teamup relies on it.

1. initialization

Setup a message callback function. When the page is running in foreground, the callback is called automatically.
```
onMessageReceived(function (data) {
    console.log('received', data);
});
```

2. load conversations

Ideally, you should call this method ***each time the page is loaded or the window gains focus***.

```
window.addEventListener("focus", function (event) {
    loadConversations(function (res) {
        console.log('conversation load result', res);
    });
}, false);

```

res's format:
```
{
    "single": [
        {
            "id": 1231435234, // server inserts
            "fromInfo": { // server inserts

            },
            "toInfo": { // server inserts

            },
            "from":"brucejeaung@gmail.com", // server inserts

            "type":"normal",
            "to": "brucejeaung@gmail.com",
            "message": "I want to join the project"
        }
    }],
    "project": [
        {
            "id": 1231435234, // server inserts, timestamp in milliseconds
            "projectInfo": { // server inserts, same format as /project/profile

            },
            "fromInfo":{ // server inserts, same format as /user/profile

            }, 
            "from":"brucejeaung@gmail.com", // server inserts

            "project": 12346,
            "message": "I want to join the project"
        }
    ]
}
```

3. load history messages

Call these functions when a user click on a conversation to open a chat dialogue.
```
function loadSingleHistoryMessages(peerEmail, callback)

function loadProjectHistoryMessages(projectId, callback)
```

4. send messages

```
function sendSingleMessage(message, successCallback, failureCallback)

function sendProjectMessage(message, successCallback, failureCallback)
```

5. message formats
   
```

// normal project message
{
    "id": 1231435234, // server inserts, timestamp in milliseconds
    "projectInfo": { // server inserts, same format as /project/profile

    },
    "fromInfo":{ // server inserts, same format as /user/profile

    }, 
    "from":"brucejeaung@gmail.com", // server inserts

    "project": 12346,
    "message": "I want to join the project"
}

// invitation message
{
    "id": 1231435234, // server inserts
    "fromInfo": { // server inserts

    },
    "toInfo": { // server inserts

    },
    "from":"brucejeaung@gmail.com", // server inserts
    "projectInfo": { // server inserts

    },

    "project": 12345,
    "type":"invitation",
    "to": "brucejeaung@gmail.com",
    "message": "Please join us"
}

// application message
{
    "id": 1231435234, // server inserts
    "fromInfo": { // server inserts

    },
    "toInfo": { // server inserts

    },
    "from":"brucejeaung@gmail.com", // server inserts
    "projectInfo": { // server inserts

    },

    "project": 12345,
    "type":"application",
    "to": "brucejeaung@gmail.com",
    "message": "I want to join the project"
}

// normal single message
{
    "id": 1231435234, // server inserts
    "fromInfo": { // server inserts

    },
    "toInfo": { // server inserts

    },
    "from":"brucejeaung@gmail.com", // server inserts

    "type":"normal",
    "to": "brucejeaung@gmail.com",
    "message": "I want to join the project"
}

```