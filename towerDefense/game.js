import titleScene from './Assets/Scripts/titleScene.js'
import gameScene from './Assets/Scripts/gameScene.js'

var config = {
    type: Phaser.AUTO,
    width: 800,
    height: 686,
    parent: 'target',
    scene: [ titleScene, gameScene ]
};

var game = new Phaser.Game(config);

