// var c = document.getElementById("canvas"); 
// var ctx = c.getContext("2d"); 


var socket = io.connect('/');
			socket.on('clientconnected', function( data ) {
		  		console.log( 'Connected successfully to the socket.io server. My server side ID is ' + data.id );
		  		//ctx.font = "30px Arial"; 
		  		//ctx.fillText("Server ID is " + data.id, 10, 50)
});

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


