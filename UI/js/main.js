var width = 800;
var height = 600;

var game = new Phaser.Game(width, height, Phaser.AUTO, '#game');
var totalRounds;
var totalPlayers;
var players;
var rounds;

var cells = new Array();
for (var i = 0; i < 4; i++) {
    cells[i] = Cell.createNew(game, 40 * i, 40 * i, 10 * i, 'circle.png');
}

var states = {
    preload: function () {
        this.preload = function () {

            $.getJSON("js/LogSchema.json", function(data) {
                totalRounds = data.head.totalRounds;
                totalPlayers = data.head.totalPlayers;
                players = data.head.playerInfo;
                $.each(data.body, function(i, round) {
                    var currentRound = round.currentRound;
                    var duration = round.runDuration;
                    $.each(round.cellActions, function (j, command) {

                        //新增
                        if (command.type == 1) {
                            cells[command.id] = Cell.createNew(command.id, command.pos, command.size, command.resources, command.team, command.level, command.race);
                            cells[command.id].draw();
                        }

                        //大小/资源值改变
                        else if (command.type == 2) {
                            cells[command.id].updateSize(command.newSize, command.newResouce, command.srcTentacles, command.dstTentacles, command.dstTentaclesCut);
                        }

                        //等级改变
                        else if (command.type == 3) {
                            cells[command.id].updateLevel(command.newLevel);
                        }

                        //派系改变
                        else if (command.type == 4) {
                            cells[command.id].updateTeam(command.newTeam);
                        }
                    });

                    $.each(round.tentacleActions, function (j, command) {

                        //新增
                        if (command.type == 1) {
                            tentacles[command.id] = Tentacle.createNew(command.id, command.srcCell, command.dstCell, command.transRate);
                            tentacles[command.id].draw();
                        }

                        //伸长
                        if (command.type == 2) {
                            tentacles[command.id].stretch(command.movement.dx, command.movement.dy);
                        }

                        //缩短
                        if (command.type == 3) {
                            tentacles[command.id].shrink(command.movement.dx, command.movement.dy);
                        }

                        //传输速度改变
                        if (command.type == 4) {
                            tentacles[command.id].updateTransRate(command.newTransRate);
                        }

                        //切断
                        if (command.type == 5) {
                            tentacles[command.id].cutOff(command.cutPosition.x, command.cutPosition.y);
                        }

                        //消失
                        if (command.type == 6) {
                            tentacles[command.id].destroy();
                        }
                    });

                    $.each(round.cutTentacleActions, function(j, command) {
                        
                        //新增
                        if (command.type == 1) {
                            brokenTentacles[command.id] = BrokenTantecle.createNew(command.id, command.birthPosition, command.dstCell, command.transRate);
                        }

                        //缩短
                        if (command.type == 2) {
                            brokenTentacles[command.id].shrink(command.movement.dx, command.movement.dy);
                        }

                        //消失
                        if (command.type == 3) {
                            brokenTentacles[command.id].destroy();
                        }
                    });
                });
            });
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
