# Project: Teamup

## Project Group:
- Kévin Jolly, Candidate N° 97249
- Ren Jiang, Candidate N° 97247

## Versions:
node -v
v11.9.0

npm -v
6.5.0

## Setup
### setup Elasticsearch
1. Download and unzip Elasticsearch
https://www.elastic.co/downloads/elasticsearch
2. Run bin/elasticsearch (or bin\elasticsearch.bat on Windows)

### start server
```
node .
```

### Access appliaction
http://localhost:8080


## API documentation 
https://documenter.getpostman.com/view/6943885/S17m1XEG

## SDK documentation

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

### Auth SDK

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

### IM SDK

Defined in im.js. Note: be sure to grant push notification permission. IM functions of Teamup relies on it.

1. initialization

Setup a message callback function. When the page is running in foreground, the callback is called automatically.
```
onMessageReceived(function (data) {
    console.log('received', data);
});
```

2. load new messages

If page is in background or closed, you can get offline messages from this API. Ideally, you should call this method each time a page is loaded.

```
loadOfflineMessages(function (res) {
    console.log('offline load result', res);
});
```

res's format:
```
{
    "single": {
        "brucejeaung@gmail.com":[],
        "kevinjolly@gmail.com":[]
    }
    "project": {
        "12345": [],
        "55653": []
    }
}
```

3. load history messages

Call these functions when user scrolls the chat window.
```
function loadSingleHistoryMessages(peerEmail, maxId, count, callback)

function loadProjectHistoryMessages(projectId, maxId, count, callback)
```