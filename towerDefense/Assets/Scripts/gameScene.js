
const gameState = {};

class gameScene extends Phaser.Scene {
    constructor() {
        super("gameScene");
    }

    preload() {
        this.load.image('raw_tile', './Assets/Tiles/Tileset_16x16.png');
        this.load.tilemapCSV('map', './Assets/Tilemaps/bg1.csv');

    }

    create() {
        const map = this.make.tilemap({ key: 'map', tileWidth: 16, tileHeight: 16});
        const tiled_map = map.addTilesetImage('raw_tile');
        map.createStaticLayer(0, tiled_map, 0, 0);

        // create the character (or whatever)
    }
}

export default gameScene;