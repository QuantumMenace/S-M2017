var io = require('socket.io');
var express = require('express');
var UUID = require('node-uuid');
var http = require('http');
//var phaser = require('phaser')


var game = express();
var server = http.createServer(game);
var verbose = false;

var port = process.env.PORT || 3000;
var host = "137.112.236.153"
server.listen(port, host);
var sio = io.listen(server)
// sio.set('authorization', function (handshakeData, callback) {
// 	callback(null, true);
// });

game.get( '/', function( req, res ){
	console.log('trying to load %s', __dirname + '/Index.html');
	res.sendFile( '/Index.html' , { root:__dirname });
});

game.get( '/*' , function( req, res, next ) {

    //This is the current file they have requested
	var file = req.params[0];

	//For debugging, we can track what files are requested.
	if(verbose) console.log('\t :: Express :: file requested : ' + file);

	//Send the requesting client the file.
	res.sendFile( __dirname + '/' + file );

});

clients = []
var MAXFOOD = 20;
var currentFood = 0; 


function handleCollision(client, other) { 
	var position = generatePosition();
	if (client.info["class"] == other["class"] - 1) {
		client.info["foodCount"] = 0;
		client.info["class"] = 1;
		client.emit('movePlayer', {x: position[0], y: position[1], class:1});
	}
	else if (other["class"] == 0) {
		//food eaten
		for (i =0; i < clients.length; i++) {
			if (clients[i]["userid"] == other["userid"]) {
				clients[i]["x"] = position[0]; 
				clients[i]["y"] = position[1];
				break
			}
		}
		client.info["foodCount"]++;
		if(client.info["foodCount"] == 20) {
			client.info["class"] = 2;
			client.emit('movePlayer', {x: client.info["x"], y: client.info["y"], class: 2});
		}

	}
}

function generateFood() { 
	while (currentFood < MAXFOOD) {
		info = {}; 
		info["userid"] = UUID(); 
		info["class"] = 0; 
		var position = generatePosition();
		info["x"] = position[0]; 
		info["y"] = position[1]; 
		info["rotation"] = 0;
		clients.push(info);
		currentFood++;
	}
}

function broadcastPostions() {
	sio.sockets.emit('update', {msg: clients}); 
}

function sendAlerts() {
	//Send specific messages to clients, such as you got eaten
}

function generatePosition() {
	var x = Math.floor(Math.random()*1920); 
	var y = Math.floor(Math.random()*1920); 
	return [x, y];
}

sio.sockets.on('connection', function(client) {
	client.info = {};
	client.info["userid"] = UUID();
	client.info["class"] = 1;
	client.info["foodCount"] = 0;
	var position = generatePosition();
	client.emit('clientconnected', { id: client.info["userid"]});
	//each client starts as a fish
	client.emit('movePlayer', {x: position[0], y: position[1], class: client.info["class"]});
	console.log('\t socket.io:: player ' + client.info["userid"] + ' connected');
	clients.push(client.info);
	client.on('translate', function(data) {
		client.info["rotation"] = data.rotation;
 		client.info["x"] = data.x
		client.info["y"] = data.y 
		/*console.log("moved to (" + x +", " + y + ")");*/

	})	
	client.on('disconnect', function() {
		for (i =0; i < clients.length; i++) {
			if (clients[i]["userid"] == client.info["userid"]) {
				sio.sockets.emit("playerDisconnect", {userid: clients[i]["userid"]});
				clients.splice(i, 1);
			}
		}
		console.log('\t socket.io:: player ' + client.info["userid"] + ' disconnected');
	});
	client.on('collision', function(data) {
		handleCollision(client, data.object);
	})

});
generateFood()
setInterval(broadcastPostions, 10);