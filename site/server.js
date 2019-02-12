
// Loading the library modules and defining global c
var express = require('express');
var http = require("http");
var fs = require("fs");
var path = require("path");
var app = express();
var OK = 200, NotFound = 404, BadType = 415, Error = 500;

// I use the express.static middleware to serve up the static files in the public/ directory
app.use(express.static(path.join(__dirname, './public')));

// Send to home page of the website
app.get('/', function(req, res) {
	res.sendFile('public/views/index.html', {root: __dirname });
});

// In case of an unknown url
app.use(function(req, res, next){
	res.setHeader('Content-Type', 'text/plain');
	res.status(NotFound).send('Page not found!');
});

// Port to listen to
app.listen(8080);