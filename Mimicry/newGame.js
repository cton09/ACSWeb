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

game.scene.add('title', titleScene);
game.scene.add("game", gameScene);
game.scene.add("win", winScene);

game.scene.start('title');
var map;
var player;
var cursors;
var groundLayer, hazardLayer;
var text;
var enemyGroup;
 
gameScene.preload = function() {
    this.load.tilemapTiledJSON('map', 'Assets/Tilemap/lv1.json');
    this.load.image('tiles','Assets/tiles/spritesheet.png',{
        frameWidth: 32,
        frameHeight: 32
      });
    this.load.image('glass','Assets/Tiles/glass.png');
    this.load.image('player','Assets/player.png');
    this.load.image('spider','Assets/spider.png');
    this.load.image('null','Assets/null.png')
    this.load.image('guard','Assets/guard.png')
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
    guard = new Guard(this,1800,800,'guard',20,true,300,400);
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
 
gameScene.update = function() {
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

    if(this.physics.world.overlap(player, this.spikeGroup)){
        player.die();
    }
    
    enemyGroup.children.each(function(enemy) {
        if(enemy.type=='guard'&&enemy.dead ==false){   
            var bruh = enemy.ogx - player.x; 
            if(bruh>-300&&bruh<300&&player.form=='player'){
                enemy.move(player);
            }
            else{
                enemy.body.setVelocityX(0);
            }
            
        }
        if(enemy.hp<=0&&enemy.dead==false){
            enemy.die();
        }
      }, this);

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
class Unit extends Phaser.Physics.Arcade.Sprite {

    constructor (scene, x, y, texture, hp, organic,speed,jump)
    {
        super(scene, x, y, texture);
        this.maxHp = this.hp = hp;
        this.organic = organic;
        this.scene = scene;
        if(organic==true){
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
                this.form = 'notplayer'
                this.setTexture(this.lastEaten.texture);
                this.setTintFill(0x6bff33);
                this.scene.time.addEvent({
                delay: 500,
                callback: ()=>{
                    this.clearTint();    
                    },
                loop: false
                })
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
        if(target.texture = 'guard'){
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