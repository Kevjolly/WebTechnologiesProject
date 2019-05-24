// Loading the library modules
var express = require('express');
var path = require("path");
var app = express();
var bodyParser = require('body-parser');
var jwtValidation = require('./middleware/jwt-validation');
var xssFilter = require('./middleware/xss-filter');
var mustache = require('mustache-express');

// middlewares
// I use the express.static middleware to serve up the static files in the public/ directory
app.use(express.static(path.join(__dirname, './public')));
app.use(bodyParser.json());
app.use(jwtValidation);
app.use(xssFilter);

app.engine('html', mustache());
app.set('view engine', 'html');
app.set('views', path.join(__dirname, './public/views'));

// index
app.get('/', function (req, res) {
	res.sendFile('public/views/index.html', { root: __dirname });
});

app.get('/example', function (req, res) {
	res.sendFile('public/views/example.html', { root: __dirname });
});

// app.get('/search', function (req, res){
// 	res.sendFile('public/views/search.html', { root: __dirname });
// });

// routers
app.use('/user', require('./router/user-router'));
app.use('/msg', require('./router/msg-router'));
app.use('/project', require('./router/project-router'));

// general error handler
app.use(function (err, req, res, next) {
	if (err) {
		console.log('internal server error', err);
		res.status(500).send(JSON.stringify({
			code: 500,
			msg: err.message
		}));
	} else {
		next()
	}
});

// not found handler
app.use(function (req, res, next) {
	console.log(req.path, 'not found');
	res.status(404).send('404 not found');
});

// Port to listen to
app.listen(8081, "localhost", () => console.log(`server started`));