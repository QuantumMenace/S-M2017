// var c = document.getElementById("canvas"); 
// var ctx = c.getContext("2d"); 

var player; 
var cursors; 
var clientID;
var positionInfo = [];
var players = {};
var game = new Phaser.Game(800, 600, Phaser.AUTO, '', { preload: preload, create: create, update: update, render: render });
var socket = io.connect('/');
socket.on('clientconnected', function( data ) {
	clientID = data.id;
	console.log( 'Connected successfully to the socket.io server. My server side ID is ' + data.id );
});
socket.on('update', function( data) {
	positionInfo = data.msg; 
})

function preload() {
	game.stage.backgroundColor = '#85b5e1'; 
	game.load.baseURL = 'http://examples.phaser.io/assets/'; 
	game.load.crossOrigin = 'anonymous'; 

	game.load.image('player', 'sprites/wabbit.png'); 
	game.load.image('background', 'tests/debug-grid-1920x1920.png'); 
}



function create() {
   game.add.tileSprite(0, 0, 1920, 1920, 'background');

    game.world.setBounds(0, 0, 1920, 1920);
    
    player = game.add.sprite(game.world.centerX, game.world.centerY, 'player');

    game.physics.arcade.enable(player);
    player.anchor.setTo(0.5, 0.5)

    player.body.collideWorldBounds = false;

    game.physics.startSystem(Phaser.Physics.ARCADE);
    game.camera.follow(player); 
    
    player.body.allowRotation = false;
    
    game.physics.enable(player, Phaser.Physics.ARCADE);
    
}

function update() {
	player.rotation = game.physics.arcade.moveToPointer(player, 60, game.input.activePointer, 600, 600); 
	socket.emit("translate", {x: player.x, y: player.y });
	for (i = 0; i < positionInfo.length; i++) {
		info = positionInfo[i]
		if (info["userid"] == clientID) {

		}
		else if (!(info["userid"] in players)) {
			console.log("adding player sprite")
			players[info["userid"]] = game.add.sprite(info["x"], info["y"], 'player');
		}
		else {
			players[info["userid"]].x = info["x"]; 
			players[info["userid"]].y = info["y"];
		}
	}

}

function render() {

}


