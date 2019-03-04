// Loading the library modules
var express = require('express');
var path = require("path");
var app = express();
var bodyParser = require('body-parser')

// middlewares
// I use the express.static middleware to serve up the static files in the public/ directory
app.use(express.static(path.join(__dirname, './public')));
app.use(bodyParser.json());

// index
app.get('/', function (req, res) {
	res.sendFile('public/views/index.html', { root: __dirname });
});

// routers
var userRouter = require('./router/user-router');

app.use('/user', userRouter);

// general error handler
app.use(function (err, req, res, next) {
	if (err) {
		console.log('errorrrrr', err.stack);
		res.sendStatus(500).send(err.message);
	} else {
		next()
	}
});

// not found handler
app.use(function (req, res, next) {
	console.log('not found');
	res.sendStatus(404).send('404 not found');
});

// Port to listen to
app.listen(8080, () => console.log(`server started`));