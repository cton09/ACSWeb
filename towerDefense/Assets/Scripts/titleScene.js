

class titleScene extends Phaser.Scene {
    constructor() {
        super('titleScreen');
    };

    preload() {
        this.load.image('bg', './Assets/Sprites/all151.png');
    }

    create() {
        // create the background
        var bg = this.add.image(0, 0, 'bg').setAlpha(0.3);
        bg.setOrigin(0, 0);

        // create the button
        var startButton = this.add.text(400, 400, 'Start', { 
            fontFamily: 'Arial',
            backgroundColor: '#555555',
            fontSize: '40px',
            align: 'center',
            padding: 20,
        });

        // add an event listener to the button
        startButton.setInteractive();
        startButton.on('pointerup', () => {
            this.scene.start('gameScene')
        });
    }
}

export default titleScene;