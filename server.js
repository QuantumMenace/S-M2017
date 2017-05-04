var io = require('socket.io');
var express = require('express');
var UUID = require('node-uuid');
var http = require('http');
var sleep = require('sleep')
//var phaser = require('phaser')

var port = process.env.PORT || 3000;

var game = express();
var server = http.createServer(game);
var verbose = false;

var host = "127.0.0.1"

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
function computeGameStep() {
	//Recompute the positions of each player based off the most currently recieved position vector
}

function broadcastPostions() {
	sio.sockets.emit('update', {msg: clients}); 
}

function sendAlerts() {
	//Send specific messages to clients, such as you got eaten
}
sio.sockets.on('connection', function(client) {
	client.info = {};
	client.info["userid"] = UUID();

	client.emit('clientconnected', { id: client.info["userid"] });
	console.log('\t socket.io:: player ' + client.info["userid"] + ' connected');
	clients.push(client.info);
	client.on('translate', function(data) {
		client.info["x"] = data.x
		client.info["y"] = data.y 
		/*console.log("moved to (" + x +", " + y + ")");*/

	})	
	client.on('disconnect', function() {
		for (i =0; i < clients.length; i++) {
			if (clients[i]["userid"] == client.info["userid"]) {
				clients.splice(i, 1);
			}
		}
		console.log('\t socket.io:: player ' + client.info["userid"] + ' disconnected');
	});
	

});

setInterval(broadcastPostions, 10);


while(0) {
	computeGameStep()
	broadcastPostions()
	sendAlerts()
	sleep.msleep(1000)
}







