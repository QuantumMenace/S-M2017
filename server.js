var io = require('socket.io');
var express = require('express');
var UUID = require('node-uuid');
var http = require('http');
//var sleep = require('sleep')
//var phaser = require('phaser')

var port = process.env.PORT || 3000;

var game = express();
var server = http.createServer(game);
var verbose = false;

server.listen(port);

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

sio.sockets.on('connection', function(client) {

	client.userid = UUID();

	client.emit('clientconnected', { id: client.userid });
	console.log('\t socket.io:: player ' + client.userid + ' connected');
	clients.push(client.userid)
	client.on('translate', function(data) {
		x = data.x
		y = data.y 
		console.log("moved to (" + x +", " + y + ")");
	})	
	client.on('disconnect', function() {
		console.log('\t socket.io:: player ' + client.userid + ' disconnected');
	});
	

});
/*
while(0) {
	computeGameStep()
	broadcastPositions()
	sendAlerts()
	thread.msleep(50)
}
*/


function computeGameStep() {
	//Recompute the positions of each player based off the most currently recieved position vector
}

function broadcastPostions() {

}

function sendAlerts() {
	//Send specific messages to clients, such as you got eaten
}



