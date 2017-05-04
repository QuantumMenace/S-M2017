// var c = document.getElementById("canvas"); 
// var ctx = c.getContext("2d"); 

var player; 
var cursors; 
var game = new Phaser.Game(800, 600, Phaser.AUTO, '', { preload: preload, create: create, update: update, render: render });
var socket = io.connect('/');
			socket.on('clientconnected', function( data ) {
		  		console.log( 'Connected successfully to the socket.io server. My server side ID is ' + data.id );
		  		//ctx.font = "30px Arial"; 
		  		//ctx.fillText("Server ID is " + data.id, 10, 50)
});

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
}

function render() {

}


/*
function Blob(x, y, size){
	this.pos = createVector(x, y);
	this.r = size;
	
	this.update = function(){
		var mouse = createVector(mouseX - width/2, mouseY - height/2);
		mouse.setMag(3);
		this.pos.add(mouse);
	}
	
	this.show = function(){
		fill(255);
		ellipse(this.pos.x,this.pos.y,this.r*2, this.r*2)
	}
}

var blob;
var blobs = [];

function setup() {
	createCanvas(600, 600);
	blob = new Blob(0, 0, 64);
	for(var i = 0; i < 50; i++){
		var x = random(-width, width)
		var y = random(-height, height)
		blobs[i] = new Blob(x, y, 16);
	}
}

function draw() {
	background(0);
	px = width/2-blob.pos.x
	py = height/2-blob.pos.y
    console.log("moved to (" + px +", " + py + ")");
	socket.emit("translate", {x: px, y: py })
	translate(px, py)
	blob.show();
	blob.update();
	for(var i = 0; i < blobs.length; i++){
		blobs[i].show();
	}
}
*/ 

