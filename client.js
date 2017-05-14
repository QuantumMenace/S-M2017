// var c = document.getElementById("canvas"); 
// var ctx = c.getContext("2d"); 

var player; 
var cursors; 
var clientID;
var positionInfo = [];
var players = {};
var lock = 1;

var game = new Phaser.Game(800, 600, Phaser.AUTO, '', { preload: preload, create: create, update: update, render: render });
var newPosition = [-1000, -1000];

function setNewPostion(x, y) {
	player.x = x;
	player.y = y;
}
var socket;

function preload() {
	game.stage.backgroundColor = '#85b5e1'; 
	game.load.baseURL = 'http://examples.phaser.io/assets/'; 
	game.load.crossOrigin = 'anonymous'; 

	game.load.image('player', 'sprites/wabbit.png');
	game.load.image('player2', 'sprites/treasure_trap.png');
	game.load.image('background', 'tests/debug-grid-1920x1920.png'); 
	playerModel = 'player';
}

function initHandlers(s) {
	s.on('clientconnected', function( data ) {
		clientID = data.id;
		newPosition[0] = data.x; 
		newPosition[1] = data.y;
		lock = 0
		console.log( 'Connected successfully to the socket.io server. My server side ID is ' + data.id );
	});
	s.on('update', function( data) {
		positionInfo = data.msg; 
	})
	s.on('playerDisconnect', function(data) {
		players[data.userid].destroy();
	});
	s.on('movePlayer', function(data) {
		console.log("moving player to new location")
		setNewPostion(data.x, data.y);
	})
}
function create() {
	socket = io.connect('/');
	initHandlers(socket);
	
	game.add.tileSprite(0, 0, 1920, 1920, 'background');

	game.world.setBounds(0, 0, 1920, 1920);

	player = game.add.sprite(newPosition[0], newPosition[1], 'player');
	game.physics.arcade.enable(player);
	player.anchor.setTo(0.5, 0.5)
	player.body.collideWorldBounds = false;
	game.physics.startSystem(Phaser.Physics.ARCADE);
	game.camera.follow(player); 
  
	player.body.allowRotation = false;
	
	game.physics.enable(player, Phaser.Physics.ARCADE);
	 
}

function setModel(xVal, yVal, modelName) {
	if (modelName == playerModel) {
		return;
	}
	player.destroy();
	playerModel = modelName;
	player = game.add.sprite(player.x, player.y, playerModel);
	game.physics.arcade.enable(player);
	player.anchor.setTo(0.5, 0.5);
	player.body.collideWorldBounds = false;
	game.camera.follow(player);
	player.body.allowRotation = false;
	game.physics.enable(player, Phaser.Physics.ARCADE);
}

function update() {
	player.rotation = game.physics.arcade.moveToPointer(player, 120, game.input.activePointer); 
	socket.emit("translate", {rotation: player.rotation, x: player.x, y: player.y});
	for (i = 0; i < positionInfo.length; i++) {
		info = positionInfo[i]
		if (info["userid"] == clientID) {
			if (player.x > 960) {
				setModel(player.x, player.y, 'player2');
			} else if (player.x < 640) {
				setModel(player.x, player.y, 'player');
			}
		}
		else {
			if (!(info["userid"] in players)) {
				console.log("adding player sprite")
				players[info["userid"]] = game.add.sprite(1000, 1000, playerModel);
				players[info["userid"]].anchor.setTo(0.5, 0.5);
			}
			players[info["userid"]].rotation= info["rotation"]; 
			players[info["userid"]].x = info["x"];
			players[info["userid"]].y = info["y"];

			if(checkOverlap(player, players[info["userid"]])) {
				//send message to server regarding collision
				console.log("woah");
				socket.emit("collision", {object1: clientID, object2: info["userid"]}); 
			}
		}

	}

}

function checkOverlap(spriteA, spriteB) {
	var boundsA = spriteA.getBounds(); 
	var boundsB = spriteB.getBounds(); 
	return Phaser.Rectangle.intersects(boundsA, boundsB); 
}

function render() {

}


