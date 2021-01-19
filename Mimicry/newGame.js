var config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    pixelArt: true,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: {y: 500},
            debug: false,
            tileBias: 32,
        }
    },
};
 
var game = new Phaser.Game(config);

var gameScene = new Phaser.Scene("game");
var titleScene = new Phaser.Scene("title");
var winScene = new Phaser.Scene("win");
var loseScene = new Phaser.Scene("lose");

game.scene.add('title', titleScene);
game.scene.add("game", gameScene);
game.scene.add("win", winScene);
game.scene.add("lose",loseScene);

game.scene.start('title');
var map;
var player;
var cursors;
var groundLayer, hazardLayer;
var text;
var enemyGroup;
var chameleon;
var timeStill=0;
 
gameScene.preload = function() {
    this.load.tilemapTiledJSON('map', 'Assets/Tilemap/lv1.json');
    this.load.image('tiles','Assets/tiles/spritesheet.png',{
        frameWidth: 32,
        frameHeight: 32
      });
    this.load.image('glass','Assets/Tiles/glass.png');
    this.load.image('player','Assets/player.png');
    this.load.image('spider','Assets/spider.png');
    this.load.image('spider_dead','Assets/spider_dead.png');
    this.load.image('null','Assets/null.png')
    this.load.image('guard','Assets/guard.png');
    this.load.image('guard_dead','Assets/guard_dead.png');
    this.load.image('chameleon',"Assets/chameleon.png");
    this.load.image('chameleon_dead',"Assets/chameleon_dead.png");
}
 
gameScene.create = function()  {
    // load the map 
    map = this.make.tilemap({key: 'map'});
    
    // tiles for the ground layer
    var groundTiles = map.addTilesetImage('sheet','tiles',32,32);
    // create the ground layer
    groundLayer = map.createLayer('platforms',groundTiles,0,0);
    // the player will collide with this layer
    groundLayer.setCollisionByExclusion([-1,3]);

 
    // set the boundaries of our game world
    this.physics.world.bounds.width = groundLayer.width;
    this.physics.world.bounds.height = groundLayer.height;

    player = new Player(this,700,800,'player',30,true,200,200,enemyGroup);
    enemyGroup = this.add.group();
    spider = new Spider(this,800,800,'spider',0,true,200,300);
    enemyGroup.add(spider);
    guard = new Guard(this,2000,800,'guard',20,true,200,400);
    chameleon = new Chameleon(this,1800,800,'chameleon',10,true,400,250);
    enemyGroup.add(chameleon);
    enemyGroup.add(guard);


    this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
    // make the camera follow the player
    this.cameras.main.startFollow(player);
    this.cameras.main.roundPixels = true;
    this.cameras.main.followOffset.y = 150;
    cursors = this.input.keyboard.createCursorKeys();
    //this.input.keyboard.on('keydown_Z', player.attack(this), this);
    z = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Z);
    x = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.X);
    r = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.R);

    this.add.text(700, 960, 'Press "z" to consume the spider', { font: '"Press Start 2P"' });
    this.add.text(900, 960, 'Press "x" to transform into the spider', { font: '"Press Start 2P"' });
    this.add.text(1500, 960, 'Press "z" to attack the guard as the spider', { font: '"Press Start 2P"' });
    this.add.text(1800, 960, 'You can only conusme when in your original form', { font: '"Press Start 2P"' });

    zone = this.add.zone(5000, 600,300, 400);
    this.physics.world.enable(zone, 0); // (0) DYNAMIC (1) STATIC
    zone.body.setAllowGravity(false);
    zone.body.moves = false;
    this.physics.add.overlap(player, zone);
    zone.on('enterzone',() =>this.scene.switch('win'))

    this.spikeGroup = this.physics.add.staticGroup();
    groundLayer.forEachTile(tile => {
      if (tile.index === 3) {
        const spike = this.spikeGroup.create(tile.getCenterX(), tile.getCenterY());
      }
    });
}
 
gameScene.update = function(time, delta) {
    var dt = delta/1000;
    if (cursors.left.isDown) // if the left arrow key is down
    {
        player.body.setVelocityX(-player.speed); // move left
        player.flipX = true;
    }
    else if (cursors.right.isDown) // if the right arrow key is down
    {
        player.body.setVelocityX(player.speed); // move right
        player.flipX = false;
    }
    else{
        player.body.setVelocityX(0);
    }
    if ((cursors.space.isDown || cursors.up.isDown) && player.body.onFloor())
    {
        player.body.setVelocityY(-player.jump); // jump up
    }
    if (Phaser.Input.Keyboard.JustDown(z)) {
        player.attack(this);
    }
    if(Phaser.Input.Keyboard.JustDown(x)){
        player.transform();
    }
    if(Phaser.Input.Keyboard.JustDown(r)){
        game.scene.stop('game');
        game.scene.start('game');
    }
    var touching = zone.body.touching;
    var wasTouching = zone.body.wasTouching;
    if (!touching.none && wasTouching.none) {
        zone.emit('enterzone');
      }
    player.enemyGroup = enemyGroup;
    if(player.form=='spider'){
        player.isVisible = false;
    }
    else{
        player.isVisible = true;
    }
    if(this.physics.world.overlap(player, this.spikeGroup)){
        player.die();
    }
    if(player.dead){
        this.scene.switch('lose');
    }
    enemyGroup.children.each(function(enemy) {
        if(enemy.type=='guard'&& !enemy.dead){   
            var bruh = enemy.x - player.x; 
            if(((enemy.flipX && bruh > 0 && bruh < 400) || (!enemy.flipX && bruh < 0 && bruh > -400) || (Math.abs(bruh)<80)) && player.isVisible){
                enemy.move(player);
            }
            else{
                enemy.body.setVelocityX(0);
            }
            
        }else if(enemy.type=='chameleon' && !enemy.dead){
            enemy.movePassive();
        }
        if(enemy.hp<=0&&enemy.dead==false){
            enemy.die();
        }
      }, this);
      if(player.form=='chameleon'){
          timeStill=(player.body.velocity.x==0 && player.body.velocity.y==0)?timeStill+dt:0;
          if(timeStill>=1 && player.isVisible){
            fadeOutPlayer(this);
          }
          if(timeStill==0 && !player.isVisible){
              fadeInPlayer(this);
          }
      }
}

titleScene.preload = function() {
    this.load.image('title','Assets/menu.png')
};

titleScene.create = function() {
    var bg = this.add.sprite(0,0,'title');
    bg.setOrigin(0,0);
    var text = this.add.text(400,400, 'Click this to continue');
    text.setInteractive({ useHandCursor: true });
    text.on('pointerdown', () => this.scene.switch('game'));
};

winScene.preload = function() {
    this.load.image('win','Assets/win.png')
};

winScene.create = function() {
    var bg = this.add.sprite(0,0,'win');
    bg.setOrigin(0,0);
};
loseScene.preload = function() {
    this.load.image('lose','Assets/lose.png')
};

loseScene.create = function() {
    var bg = this.add.sprite(0,0,'lose');
    bg.setOrigin(0,0);
};
class Unit extends Phaser.Physics.Arcade.Sprite {

    constructor (scene, x, y, texture, hp, organic,speed,jump)
    {
        super(scene, x, y, texture);
        this.maxHp = this.hp = hp;
        this.organic = organic;
        this.scene = scene;
        if(organic){
            this.dead = false;
        }
        else{
            this.dead = true;
        }
        this.speed = speed;
        this.jump = jump;

        //  You can either do this:
        scene.add.existing(this);
        scene.physics.add.existing(this);

        //  Set some default physics properties
        this.setCollideWorldBounds(true);
        scene.physics.add.collider(groundLayer, this);
    }
    die(){
        this.dead = true;
    }
    attack(){
        
    }

}

class Player extends Unit{
    constructor(scene,x,y,texture,hp,organic,speed,jump,enemyGroup){
        super(scene, x, y, texture,hp,organic,speed,jump);
        this.form = 'player';
        this.lastEaten = null;
        this.enemyGroup = enemyGroup
        this.attacking = false;
        this.isVisible=true;
        this.setOrigin(0.5, 1);
        this.size = (64,64);
        
    }
    die(){
        this.dead = true;
        //lose state
        console.log('l');
        
    }
    hurt(enemy){
        if(enemy.type==null){
            return null;
        }
        else if(enemy.type=='guard'){
            this.die();
        }
    }
    transform(){
        if(this.lastEaten!= null){
            if(this.form=='player'){
                this.form = this.lastEaten.type;
                var isDeadTexture = this.lastEaten.texture.key.indexOf("_dead");
                if(isDeadTexture>-1){
                    this.setTexture(this.lastEaten.texture.key.substring(0,isDeadTexture));
                }else{
                    this.setTexture(this.lastEaten.texture);
                }
                this.setTintFill(0x6bff33);
                this.scene.time.addEvent({
                delay: 500,
                callback: ()=>{
                    this.clearTint();    
                    },
                loop: false
                });
                this.speed = this.lastEaten.speed;
                this.jump = this.lastEaten.jump;
                this.body.setSize(this.lastEaten.size);
            }
            else{
                this.form = 'player'
                this.setTintFill(0x6bff33);
                this.scene.time.addEvent({
                    delay: 500,
                    callback: ()=>{
                        this.clearTint();
                        this.setTexture('player');
                        this.speed = 200;
                    this.jump = 200;
                    this.body.setSize(64,64);
                        },
                    loop: false
                    })
                
            }
        }
    }
    attack(scene){
        this.attacking= true;
        var e = null;
        if(this.attacking&&enemyGroup!=null){
            if(this.form=="player"){
                e =scene.physics.add.overlap(this.enemyGroup,this,this.consume,null,this)
            }
            else{
                e = scene.physics.add.overlap(this.enemyGroup,this,this.lastEaten.attack,null,this)
            }
                
        }
         
        scene.time.addEvent({
            delay: 20,
            callback: ()=>{
                this.attacking = false;
                e.destroy();
                
            },
            loop: false
        })
    }
    consume(target){
        if(!target.dead){
            target.hp -=5
            if(target.hp<=0){
                target.die();
            }
        }
        else{
            this.lastEaten = target;
            target.setTintFill(0x6bff33);
            this.scene.time.addEvent({
                delay: 500,
                callback: ()=>{
                    target.disableBody(true, true);
                    
                },
                loop: false
            })
            this.hp = this.maxHp;
            
        }
    }
}

class Spider extends Unit{
    constructor(scene,x,y,texture,hp,organic,speed,jump){
        super(scene, x, y, texture,hp,organic,speed,jump);
        this.size = (32,32);
        this.type = 'spider';
    }
    die(){
        this.dead = true;
    }
    attack(target){
        if(target.type == 'guard'){
            target.die();
        }
        else{
            target.hp -=2;
        }
    }
}

class Guard extends Unit{
    constructor(scene,x,y,texture,hp,organic,speed,jump){
        super(scene, x, y, texture,hp,organic,speed,jump);
        this.size = (64,128);
        this.type = 'guard';
        this.ogx = x;
    }
    die(){
        this.setTexture('guard_dead');
        this.body.setSize(128,64);
        this.dead = true;
        
    }
    attack(target){
        if(!target.dead){
            target.hp -=5
            if(target.hp<=0){
                target.die();
            }
        }
        else{
            target.disableBody(true, true);
        }
    }
    move(player){
        if(this.x-player.x>-5&&this.x-player.x<5){
            this.body.setVelocityX(0);
            player.die();
        }
        else if(this.x-player.x>0){
            this.body.setVelocityX(-this.speed);
            this.flipX = true;
        }
        else if(this.x-player.x<5){
            this.body.setVelocityX(this.speed);
            this.flipX = false;
        }
         
    }
}

class Chameleon extends Unit{
    constructor(scene,x,y,texture,hp,organic,speed,jump){
        super(scene,x,y,texture,hp,organic,speed,jump);
        this.size=(64,48);
        this.type='chameleon';
        this.ogx=x;
        this.roamRange = 400;
        this.destX = this.ogx+this.roamRange;
        this.moving=true;
        this.isVisible=true;
    }
    die(){
        this.setTexture('chameleon_dead');
        this.dead=true;
    }
    attack(target){
        //Do nothing
    }
    movePassive(){
        //Use flipX as a proxy for current direction, true = left, false = right
        if(this.moving){
            if(this.x<this.destX){
                if(this.flipX){
                    //set new destX, go from moving left to moving right
                    this.destX = this.ogx+this.roamRange;
                    this.moving=false;
                    this.setInvisible();
                    this.flipX=false;
                }else{
                    this.body.setVelocityX(this.speed);
                }
            }else{
                if(!this.flipX){
                    //if destination is to the left and moving right
                    this.destX = this.ogx-this.roamRange;
                    this.moving=false;
                    this.setInvisible();
                    this.flipX=true;
                }else{
                    this.body.setVelocityX(-this.speed);
                }
            }
        }else{
            this.body.setVelocityX(0);
        }
    }
    setInvisible(){
        this.scene.tweens.add({
            delay:2000,
            targets:this,
            alpha:{from:1,to:0},
            ease:'Power2',
            duration:800,
            onComplete:()=>this.isVisible=false
        });
        setTimeout(()=>{
            this.moving=true;
            this.destX = this.flipX?this.x-this.roamRange:this.x+this.roamRange
            this.setVisible();
        },4000);
    }
    setVisible(){
        this.scene.tweens.add({
            targets:this,
            alpha:{from:0,to:1},
            ease:'Power2',
            duration:800
        });
        this.isVisible=true;
    }
}
function fadeOutPlayer(scene){
    scene.tweens.add({
        targets:player,
        alpha:{from:1,to:0},
        ease:'Power2',
        duration:800,
    });
    player.isVisible=false;
}
function fadeInPlayer(scene){
    scene.tweens.add({
        targets:player,
        alpha:{from:0,to:1},
        ease:'Power2',
        duration:800
    });
    player.isVisible=true;
}