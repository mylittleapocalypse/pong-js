var ControlType = {AI:0, PLAYER:1};

function Paddle(startX, startY, controlType){
	this.x = startX, this.y = startY;
	this.width = 20, this.height = 100;
	this.controller = (controlType === ControlType.AI) ? new AIControl(this) : new PlayerControl(this);
	this.draw = () => {
		context.fillRect(this.x, this.y, this.width, this.height);
	};
}
function AIControl(paddle){
	this.paddle = paddle;
	this.update = () => {
		console.log(this.paddle.x+" Updated AI X");
	};
}
function PlayerControl(paddle){
	this.paddle = paddle;
	this.update = () => {
		console.log(this.paddle.x+" Updated Player X");
	};
}
var p1 = new Paddle(0,0,ControlType.PLAYER);
var p2 = new Paddle(200,0,ControlType.AI);
p1.controller.update();
p2.controller.update();