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
var best_array = [1, 8, 7, 9, 7, 9, 10, 7, 10, 15]

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
	t1 = this.add.rectangle(370, 300, 60, 50, 0x00FF00);
	t2 = this.add.rectangle(430, 300, 60, 50, 0xFF0000);
	t1.setInteractive();
	t2.setInteractive();
	this.plusText = this.add.text(360, 300, '+'+this.plus, { fontSize: '16px', fill: '#000' });
	this.multiText = this.add.text(420, 300, 'x'+this.multiply, { fontSize: '16px', fill: '#000' });
	r1 = this.add.rectangle(200, 200, 200, 100, 0xFFFFFF)
	r2 = this.add.rectangle(600, 200, 200, 100, 0xFFFFFF)
	this.numText = this.add.text(150, 200, 'Current: '+this.num, { fontSize: '16px', fill: '#000' });
	this.goalText = this.add.text(550, 200, 'Goal: '+this.goal, { fontSize: '16px', fill: '#000' });
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
	this.initialTime = 40;

	this.text = this.add.text(32, 32, 'Countdown: ' + this.initialTime);
	this.text.setText("Countdown: Unlimited")
	this.scoreText = this.add.text(550,32,"");

    // Each 1000 ms call onEvent
	timedEvent = this.time.addEvent({ delay: 1000, callback: onEvent, callbackScope: this, loop: true });
	this.score = 0;
};
function onEvent ()
{
	if(this.level>10 && this.initialTime>0){
		this.initialTime -= 1; // One second
    	this.text.setText('Countdown: ' + this.initialTime);
	}
	else{
		this.text.setText("Countdown: Unlimited");
	}
    
}

scene.update = function() {
	if(this.num==this.goal) {
		this.level+=1
		if (this.level<=11){
			if (steps==best_array[this.level-2])
				this.score += 10*(this.level-1);
			else
				this.score += Math.floor(5*(this.level-1)*(best_array[this.level-2]/steps));
			this.scoreText.setText("Score: " + this.score);
			steps=0
		}
		if (this.level>10){
			if (this.level>11)
				this.score += Math.floor(this.initialTime*(this.level-1)/10);
			this.scoreText.setText("Score: " + this.score);
			//endless mode starts
			L  = this.level+1;
			this.initialTime = 41;
			k = Math.floor(Math.sqrt(this.level));
			this.plus = 1+Math.floor(Math.random()*(L-1));
			this.multiply = 2+Math.floor(Math.random()*9);
			startNum  = 1+Math.floor(Math.random()*(L-1));
			this.num = startNum;
			this.goal = this.num;
			for(i=0;i<k;i++){
				rand= Math.round(Math.random());
				console.log(rand);
				if(rand==1){
					this.goal+=this.plus;
				}
				else{
					this.goal*=this.multiply;
				}
			}
		}
		else {
		this.num = num_array[this.level-1]
		this.goal = goal_array[this.level-1]
		this.plus = plus_array[this.level-1]
		this.multiply = multiply_array[this.level-1]
		}
		scene.plusText.setText('+'+this.plus);
		scene.multiText.setText('x'+this.multiply);
		scene.goalText.setText('Goal: '+this.goal);
		scene.numText.setText('Current: '+this.num);
		scene.levelText.setText('- Level '+this.level+' -');
	}
	else if (this.num>this.goal){
		if(this.level<=10){
			this.num = num_array[this.level-1]
		}
		else{
			this.num = startNum;
		}
		
	} 
	else {
		scene.plusText.setText('+'+this.plus);
		scene.multiText.setText('x'+this.multiply);
		scene.goalText.setText('Goal: '+this.goal);
		scene.numText.setText('Current: '+this.num);
	}
	if(this.initialTime<=0){
		this.end();
	}
};


scene.end = function() { 
	this.add.text(250, 425, 'Your time is out!', { fontSize: '32px', fill: '#111' });
	//this.add.text(100, 550, 'Your spent ' + (steps-83) + ' more step(s) than the minimum.', { fontSize: '16px', fill: '#111' });
	this.add.text(100, 525, 'Score: ' + this.score, { fontSize: '48px', fill: '#111' });
};
