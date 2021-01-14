var scene = new Phaser.Scene("game");
steps = 0
var config = {
	type: Phaser.AUTO,
	width: 800,
	height: 600,
	scene : scene
};
var num_array = [1, 1, 6, 1, 1, 0.3, 17, 144, 3, 2]
var goal_array = [2, 31, 44, 137, 144, 29.5, 39, 271.6, 5725, 2222]
var plus_array = [1, 1, 1, 1, 7, 0.5, 1, 11, 11, 2]
var multiply_array = [2, 2, 5, 2, 2, 10, 1.2, 1.2, 19, 2]

var game = new Phaser.Game(config);

scene.init = function() {
	this.num = num_array[0]
	this.goal = goal_array[0]
	this.level = 1
	this.numText
	this.levelText
	this.plus = plus_array[0]
	this.multiply = multiply_array[0]
};

scene.preload = function() {
};

scene.create = function() {
	this.cameras.main.setBackgroundColor('#0000FF')
	t1 = this.add.rectangle(100, 100, 60, 50, 0x00FF00);
	t2 = this.add.rectangle(160, 100, 60, 50, 0xFF0000);
	t1.setInteractive();
	t2.setInteractive();
	this.add.text(90, 100, '+'+this.plus, { fontSize: '16px', fill: '#000' });
	this.add.text(150, 100, 'x'+this.multiply, { fontSize: '16px', fill: '#000' });
	r1 = this.add.rectangle(200, 200, 200, 100, 0xFFFFFF)
	r2 = this.add.rectangle(600, 200, 200, 100, 0xFFFFFF)
	this.numText = this.add.text(150, 200, 'Current: '+this.num, { fontSize: '16px', fill: '#000' });
	this.add.text(550, 200, 'Goal: '+this.goal, { fontSize: '16px', fill: '#000' });
	t1.on('pointerdown', function(){
		scene.num+=scene.plus
		scene.numText.setText("Current: " + scene.num);
		steps+=1
	})
	t2.on('pointerup', function(){
		scene.num*=scene.multiply
		scene.numText.setText("Current: " + scene.num);
		steps+=1
	})
	this.levelText = this.add.text(350, 100+30*this.level, '- Level '+this.level+' -', { fontSize: '16px', fill: '#000' });
};

scene.update = function() {
	if(this.num==this.goal) {
		if (this.level==10){
			scene.end()
		}
		else {this.level+=1
		this.num = num_array[this.level-1]
		this.goal = goal_array[this.level-1]
		this.plus = plus_array[this.level-1]
		this.multiply = multiply_array[this.level-1]
		this.create();
		}
	}
	else if (this.num>this.goal){
		this.num = num_array[this.level-1]
	} 
	else {
		this.create();
	}
};


scene.end = function() {
	this.add.text(250, 450, 'Congratulations!', { fontSize: '32px', fill: '#111' });
	this.add.text(100, 550, 'Your spent ' + (steps-83) + ' more step(s) than the minimum.', { fontSize: '16px', fill: '#111' });
};