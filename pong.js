var ControlType = {AI:0, PLAYER:1};
var HEIGHT = 700, WIDTH = 600;
var PI = Math.PI;
var game;
var Player1, Player2, GameBall;
var keystate;
var P1Score = 0, P2Score = 0;
var KEY =  {UP:38, DOWN:40};
function Paddle(controlType){
	this.x = 0, this.y = 0;
	this.width = 20, this.height = 100;
	this.controller = (controlType === ControlType.AI) ? new AIControl(this) : new PlayerControl(this);
	this.draw = (ctx) => {
		ctx.fillRect(this.x, this.y, this.width, this.height);
	};
}
function AIControl(paddle){
	this.paddle = paddle;
	this.update = () => {
		var desty = GameBall.y - (this.paddle.height - GameBall.size) * 0.5;
		this.paddle.y += (desty-this.paddle.y)*0.1;
	};
}
function PlayerControl(paddle){
	this.paddle = paddle;
	this.update = () => {
		if(keystate[KEY.UP]) this.paddle.y -= 7;
		if(keystate[KEY.DOWN]) this.paddle.y += 7;
				this.paddle.y = Math.max(Math.min(this.paddle.y, HEIGHT - this.paddle.height),0);
	};
}

function Ball(){
	this.x = 0;
	this.y = 0;
	this.size = 20;
	this.speed = 10;
	this.velocity = null;

	this.serve = (side) => {
		var r = Math.random();
		this.x = side === 1 ? Player1.x + Player1.width : Player2.x - this.size;
		this.y = (HEIGHT-this.size) * r;
		var phi = 0.1 * PI * (1-2*r);
		this.velocity = {
			x: side * this.speed * Math.cos(phi),
			y: this.speed * Math.sin(phi)
		};
	};
	this.update = () => {
		this.x += this.velocity.x;
		this.y += this.velocity.y;
		if(0 >this.y || this.y+this.size > HEIGHT){
			var offset = this.velocity.y < 0 ? 0 - this.y : HEIGHT - (this.y+this.size);
			this.y += 2*offset;
			this.velocity.y *= -1;
		}
		var paddle = this.velocity.x < 0 ? Player1 : Player2;
		if(AABBIntersect(paddle.x, paddle.y, paddle.width, paddle.height,
						 this.x, this.y, this.size, this.size)) {
			this.x = paddle===Player1 ? Player1.x+paddle.width : Player2.x-this.size;
			var n = (this.y+this.size - paddle.y)/(paddle.height+this.size);
			var phi = 0.25 * PI * (2 * n - 1);
			var smash = Math.abs(phi) > 0.2 * PI ? 1.5 : 1;
			this.velocity.x = smash * (paddle===Player1 ? 1 : -1) * this.speed * Math.cos(phi);
			this.velocity.y = smash * this.speed * Math.sin(phi);
		}
		if(0 > this.x + this.size || this.x > WIDTH){
			if(this.velocity.x > 0)
				P1Score++;
			else
				P2Score++;
			this.serve(paddle == Player1 ? 1 : -1);
		}
	}
	this.draw = (ctx) => {
		ctx.fillRect(this.x, this.y, this.size, this.size);
	}
}

function Game(){
	var canvas, context;
	this.init = () => {
		canvas = document.createElement('canvas');
		context = canvas.getContext('2d');
		canvas.width = WIDTH;
		canvas.height = HEIGHT;
		document.body.appendChild(canvas);
		keystate = {};
		document.addEventListener("keydown", e => keystate[e.keyCode] = true);
		document.addEventListener("keyup", e => delete keystate[e.keyCode]);
		Player1 = new Paddle(ControlType.PLAYER);
		Player2 = new Paddle(ControlType.AI);
		GameBall = new Ball();
		this.start();
	}
	this.start = () => {
		Player1.x = Player1.width;
		Player1.y = (HEIGHT - Player1.height)/2;
		Player2.x = WIDTH - (Player1.width + Player2.width);
		Player2.y = (HEIGHT - Player2.height)/2;
		GameBall.serve(1);
		this.update();
	}
	this.update = () => {
		GameBall.update();
		Player1.controller.update();
		Player2.controller.update();
		this.draw();
		window.requestAnimationFrame(this.update);
	}
	this.draw = () => {
		context.fillRect(0,0, WIDTH, HEIGHT);
		context.save();
		context.fillStyle = "#FFF";

		GameBall.draw(context);
		Player1.draw(context);
		Player2.draw(context);

		var w = 4;
		var x = (WIDTH - w) * 0.5;
		var y = 0;
		var step = HEIGHT / 15;
		while(y < HEIGHT) {
			context.fillRect(x,y+step*0.25,w,step*0.5);
			y+=step;
		}
		context.font = "30px sans-serif";
		context.fillText(P1Score, WIDTH/2-40, 40);
		context.fillText(P2Score, WIDTH/2+40-context.measureText(P2Score).width, 40);
		context.restore();
	}
}

function AABBIntersect(ax,ay,aw,ah,bx,by,bw,bh){
	return ax < bx+bw && ay < by+bh && bx < ax+aw && by < ay+ah;
}

game = new Game();
game.init();