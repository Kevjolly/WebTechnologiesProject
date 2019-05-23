// Loading the library modules
var express = require('express');
var path = require("path");
var app = express();
var morgan = require('morgan');
var bodyParser = require('body-parser');
var jwtValidation = require('./middleware/jwt-validation');
var xssFilter = require('./middleware/xss-filter');
var mustache = require('mustache-express');
var formidable = require('formidable');
var fs = require('fs');

// middlewares
// I use the express.static middleware to serve up the static files in the public/ directory
app.use(morgan('common'));
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

// Search
// app.get('/search', function(req, res) {
// 	var search_content = req.query.search_content
// 	res.sendFile('public/views/search.html', {root: __dirname });	
// });	

// app.get('/project', function(req, res) {
// 	var search_content = req.query.search_content
// 	res.sendFile('public/views/project.html', {root: __dirname });	
// });	

// File uploads to the uploads directory
app.post('/addprojectimage', function(req, res){
	// Create an incoming form object
	var form = new formidable.IncomingForm();

	// Store all uploads in the same directory
	form.uploadDir = __dirname + "/public/project_images/"

	// Every time a file has been uploaded successfully,
	// Rename the file
	form.on('file', function(field, file) {
		console.log(file.name);
		fs.rename(file.path, path.join(form.uploadDir, file.name), function(err){
			if (err){
				console.log("The server failed to rename the uploaded file to its true name "+file.name+". Error: "+err);
				throw err;
			}
		});
	});

	// Log any errors that occur
	form.on('error', function(err) {
		console.log("An error has occured when the server tried to upload the file given by the user. Error: "+ err);
	});

	// Once the file was uploaded, send a response to the client
	form.on('end', function() {
		res.sendStatus(200);
	});

	// Parse the incoming request containing the form data
	form.parse(req);
});	

// File uploads to the uploads directory
app.post('/adduserimage', function(req, res){
	// Create an incoming form object
	var form = new formidable.IncomingForm();

	// Store all uploads in the same directory
	form.uploadDir = __dirname + "/public/user_images/"

	// Every time a file has been uploaded successfully,
	// Rename the file
	form.on('file', function(field, file) {
		console.log(file.name);
		fs.rename(file.path, path.join(form.uploadDir, file.name), function(err){
			if (err){
				console.log("The server failed to rename the uploaded file to its true name "+file.name+". Error: "+err);
				throw err;
			}
		});
	});

	// Log any errors that occur
	form.on('error', function(err) {
		console.log("An error has occured when the server tried to upload the file given by the user. Error: "+ err);
	});

	// Once the file was uploaded, send a response to the client
	form.on('end', function() {
		res.sendStatus(200);
	});

	// Parse the incoming request containing the form data
	form.parse(req);
});	

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