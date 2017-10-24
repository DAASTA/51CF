var width = 800;
var height = 600;

var game = new Phaser.Game(width, height, Phaser.AUTO, '#game');

var cells = new Array();
for (var i = 0; i < 4; i++) {
    cells[i] = Cell.createNew(game, 40 * i, 40 * i, 10 * i, 'circle.png');
}

var states = {
    preload: function () {
        this.preload = function () {
            game.stage.backgroundColor = '#ddd';

            game.load.crossOrigin = 'anonymous';
            for (var i = 0; i < cells.length(); i++) {
                game.load.image(cells[i].img, '.img/' + cells[i].img);
            }

            var progressText = game.add.text(game.world.centerX, game.world.centerY, '0%', {
                fontSize: '20px',
                fill: '#555'
            });
            progressText.anchor.setTo(0.5, 0.5);
            game.load.onFileComplete.add(function (progress) {
                progressText.text = progress + '%';
            });
            game.load.onLoadComplete.add(onLoad);
            var ddl = false;
            setTimeout(function () {
                ddl = true;
            }, 100);

            function onLoad() {
                if (ddl) {
                    game.stage.start('created');
                } else {
                    setTimeout(onLoad, 1000);
                }
            }
        }
    },

    created: function () {
        this.create = function () {

            var title = game.add.text(game.world.centerX, game.world.height * 0.4, 'FC15', {
                fontSize: '40px',
                fontWeight: 'bold',
                fill: '#222'
            });
            title.anchor.setTo(0.5, 0.5);

            var viewButton = game.add.text(game, game.world.centerX, game.world.height * 0.7, 'View', {
                fontSize: '40px',
                fill: '#111',
                backgroundColor: '#bbb',
                //                height: game.world.height * 0.1,
                //                width: game.world.width * 0.2
            });
            viewButton.anchor.setTo(0.5, 0.5);
            viewButton.input.onTap.add(function () {
                viewButton.backgroundColor = '#999';
                game.state.start('view');
            });
        }
    },

    view: function () {
        this.create = function () {
            for (var i = 0; i < cells.length; i++) {
                cells[i].draw();
            }
        }
    },

    empty: function () {
        this.create = function () {
            game.stage.backgroundColor = '#ddd';
            game.add.text(game.world.centerX, game.world.centerY, 'No battles available, please submit your code and wait', {
                fontSize: '30px',
                fontWeight: '1px',
                fill: '#666'
            });
        }
    },

    result: function () {
        this.create = function () {
            var okButton = game.add.text(game.world.centerX, game.world.height * 0.8, 'OK', {
                fontSize: '30px',
                fontWeight: '2px',
                fill: '#333',
                backgroundColor: '#999',
                //                height: game.world.height * 0.05,
                //                width: game.world.width * 0.1
            });

            okButton.anchor.setTo(0.5, 0.5);
            okButton.input.onTap.add(function () {
                game.state.start('empty');
            });
        }
    }
};

Object.keys(states).map(function (key) {
    game.state.add(key, states[key]);
});

game.state.start('preload');
