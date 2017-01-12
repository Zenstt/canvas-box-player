"use strict";
var express = require("express");
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);

var port = process.env.PORT || 8080;
app.set('view engine', 'ejs');

app.use(express.static(__dirname + '/public'));

app.get('/', function(req, res) {
	res.render('index');
});

var players = [];
var id = 0;
app.post('/id', function(req,res){
		id++;
		res.send({
			id: id,
			error: false
		});
		res.end();
});

io.on('connection', function(socket) {
	console.log('Client connected');
	socket.on('move',function(data){
		io.sockets.emit('playerMove',data);
	});
	socket.on('disconnect', function() {
		console.log('Client disconnected');
	});
});

server.listen(port, function() {
	console.log('Server Started on port ' + port)
});