var width = 800;
var height = 600;

var game = new Phaser.Game(width, height, Phaser.AUTO, '#game');
var totalRounds;
var totalPlayers;
var players;
var rounds;
var fragmentSize = 15;
var log;
var cells = [];
var brokenTentacles = [];
var tentacles = [];
var totalOffset = [0];
var roundDuration = [];
var colors = [0x007fff, 0xFFBF00, 0x66FF00, 0x8B00FF, 0x30D5C8, 0xCCCCFF];

var states = {
    preload: function () {
        this.preload = function () {
            game.stage.backgroundColor = '#ddd';
            $.getJSON("js/log.json", function(data) {
                totalRounds = data.head.totalRounds;
                totalPlayers = data.head.totalPlayers;
                players = data.head.playerInfo;
                log = data;
                game.load.crossOrigin = 'anonymous';
                $.each(players, function(i, player) {
                    //game.load.image(player.race, 'img/' + player.race + '.png');
                    game.load.image('DA', 'img/DA.png');
                    //console.log('./img/' + player.race + '.png');
                });
            });

            game.load.image('fragment', 'img/fragment.png');
            game.load.image('slash', 'img/slash.png');
            //console.log(players.length);

            //game.load.image(players[0].race, 'img/' + players[0].race + '.png');
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
                    game.state.start('created');
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

            var startInfo = game.add.text(game.world.centerX, game.world.height * 0.7, 'Press anywhere to continue', {
                fontSize: '20px',
                //fontWeight: '2px',
                fill: '#555',
                //backgroundColor: '#bbb',
                //                height: game.world.height * 0.1,
                //                width: game.world.width * 0.2
            });
            startInfo.anchor.setTo(0.5, 0.5);
            startInfo.inputEnabled = true;
            game.input.onTap.add(function () {
                //viewButton.backgroundColor = '#999';
                game.state.start('view');
            });
        }
    },

    view: function () {
        this.create = function () {
            $.each(log.body, function(i, round) {
                roundDuration[i] = round.runDuration;
                totalOffset[i + 1] = round.runDuration + (i == 0 ? 0 : totalOffset[i]);
                //console.log(totalOffset);
                var currentRound = round.currentRound;
                var duration = round.runDuration;
                //game.add.sprite(0, 0, 'DA');
                $.each(round.cellActions, function (j, command) {
                    //新增
                    if (command.type == 1) {
                        cells[command.id] = Cell.createNew(command.id, command.birthPosition, command.size, command.size/*resources*/, command.team, command.level);
                        cells[command.id].draw();
                    }

                    //大小/资源值改变
                    else if (command.type == 2) {
                        cells[command.id].updateSize(command.newSize, command.newResouce, command.srcTentacles, command.dstTentacles, command.dstTentaclesCut, i);
                    }

                    //等级改变
                    else if (command.type == 3) {
                        cells[command.id].updateLevel(command.newLevel, i);
                    }

                    //派系改变
                    else if (command.type == 4) {
                        cells[command.id].updateTeam(command.newTeam, i);
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
                        tentacles[command.id].strech(command.movement.dx, command.movement.dy, i);
                    }

                    //缩短
                    if (command.type == 3) {
                        tentacles[command.id].shrink(command.movement.dx, command.movement.dy, i);
                    }

                    //传输速度改变
                    if (command.type == 4) {
                        tentacles[command.id].updateTransRate(command.newTransRate, i);
                    }

                    //切断
                    if (command.type == 5) {
                        tentacles[command.id].cutOff(command.cutPosition.x, command.cutPosition.y, i);
                    }

                    //消失
                    if (command.type == 6) {
                        tentacles[command.id].destroy(i);
                    }
                });

                $.each(round.cutTentacleActions, function(j, command) {
                    
                    //新增
                    if (command.type == 1) {
                        brokenTentacles[command.id] = BrokenTentacle.createNew(command.id, command.birthPosition, command.dstCell, command.transRate, command.team, i);
                    }

                    //缩短
                    if (command.type == 2) {
                        brokenTentacles[command.id].shrink(command.movement.dx, command.movement.dy, i);
                    }

                    //消失
                    if (command.type == 3) {
                        brokenTentacles[command.id].destroy(i);
                    }
                });
            });
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
