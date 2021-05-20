"use strict"
const socket = io.connect(window.location.host, { path: window.location.pathname + "socket.io" });
// let socket=io.connect('192.168.0.46:8080',{'forceNew':true});
// let socket=io.connect('localhost:8080',{'forceNew':true});
// 
let canvWidth = 1000;
let canvHeight = 500;

let myGamePiece = [];
let id;
let mine;

window.onload = function () {
	$.ajax({
		url: './id',
		data: null,
		method: 'POST',
		success: function (res, textStatus, xhr) {
			if (res.error) {
				console.log(error);
			} else {
				id = res.id;
				myGameArea.start();
				mine = new component(id, 30, 30, "red", 10, 120);
				myGamePiece.push(mine);
			}
			console.log(id)
		}
	});
	document.addEventListener('keydown', function (e) {
		move(e.keyCode);
	});
	document.addEventListener('keyup', function (e) {
		stopMove(e.keyCode);
	});

}
socket.on('playerMove', function (data) {
	let buli = true;
	for (let index of myGamePiece) {
		if (index.id == data.id) {
			if (data.id != id) {
				index.x = data.x;
				index.y = data.y;
				index.speedX = data.speedX;
				index.speedY = data.speedY;
			}
			buli = false;
		}
	}
	if (buli) {
		myGamePiece.push(new component(data.id, 30, 30, "blue", 10, 120));
	}
});

let myGameArea = {
	canvas: document.createElement("canvas"),
	start: function () {
		this.canvas.width = canvWidth;
		this.canvas.height = canvHeight;
		this.context = this.canvas.getContext("2d");
		document.body.insertBefore(this.canvas, document.body.childNodes[0]);
		this.interval = setInterval(updateGameArea, 20);
	},
	clear: function () {
		this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
	}
}
function component(id, width, height, color, x, y) {
	this.id = id;
	this.width = width;
	this.height = height;
	this.speedX = 0;
	this.speedY = 0;
	this.maxSpeed = 10;
	this.fallSpeed = -15;
	this.x = x;
	this.y = y;
	this.onGround = false;
	this.jump = false;
	this.move = {
		up: false,
		down: false,
		left: false,
		right: false
	}
	let ctx = myGameArea.context;
	ctx.fillStyle = color;
	ctx.fillRect(this.x, this.y, this.width, this.height);
	this.newPos = function () {
		if (this.speedY >= this.fallSpeed || this.onGround == false) {
			this.speedY++;
		}
		speed(this);
		if (this.jump && this.onGround) {
			this.speedY = -17;
			this.jump = false;
			this.onGround = false;
		}


		this.x += this.speedX;
		this.y += this.speedY;
		if (this.x <= 0) {
			this.x = 0;
			this.speedX = Math.floor(this.speedX * (-1) / 2);
		}
		if (this.x >= canvWidth - this.width) {
			this.x = canvWidth - this.width;
			this.speedX = Math.floor(this.speedX * (-1) / 2);
		}
		if (this.y <= 0) {
			this.y = 0;
			// this.speedY = Math.floor(this.speedY*(-1)/2);
		}
		if (this.y >= canvHeight - this.height) {
			this.y = canvHeight - this.height;
			this.onGround = true;
			this.speedY = Math.floor(this.speedY * (-1) / 2);
		}
		socket.emit('move', { id: mine.id, x: mine.x, y: mine.y, speedX: mine.speedX, speedY: mine.speedY })

	}
	this.update = function () {
		ctx = myGameArea.context;
		ctx.fillStyle = color;
		ctx.fillRect(this.x, this.y, this.width, this.height);
	}
}
function speed(option) {
	if (option.move.right) {
		if (option.speedX < option.maxSpeed) {
			option.speedX++;
		}
	}
	if (option.move.left) {
		if (option.speedX > 0 - option.maxSpeed) {
			option.speedX--;
		}
	}
	// if (option.move.up){
	// 	if (option.speedY > 0-option.maxSpeed){
	// 		option.speedY --;
	// 	}
	// }
	if (option.move.down) {
		if (option.speedY < option.maxSpeed) {
			option.speedY++;
		}
	}
	if ((!option.move.left && !option.move.right) || (option.move.left && option.move.right)) {
		if (option.speedX != 0) {
			if (option.speedX < 0) {
				option.speedX++;
			} else {
				option.speedX--;
			}
		}
	}
	// if ((!option.move.up && !option.move.down)||(option.move.up && option.move.down)){
	// 	if (option.speedY != 0){
	// 		if (option.speedY<0){
	// 			option.speedY ++;
	// 		} else {
	// 			option.speedY --;
	// 		}
	// 	}
	// }
}
function move(e) {
	switch (e) {
		case 37: mine.move.left = true; break;
		case 39: mine.move.right = true; break;
		case 38: if (mine.onGround) { mine.jump = true }; break;
		case 40: mine.move.down = true; break;
		default: console.log("Error move"); break;
	}
}
function test() {
	console.log(myGamePiece)
}
function stopMove(e) {
	switch (e) {
		case 37: mine.move.left = false; break;
		case 39: mine.move.right = false; break;
		case 38: mine.move.up = false; break;
		case 40: mine.move.down = false; break;
		case 65: test(); break;
		default: console.log("Error stopMove"); break;
	}
}
function updateGameArea() {
	myGameArea.clear();
	for (let index of myGamePiece) {
		index.newPos();
		index.update();
	}

}