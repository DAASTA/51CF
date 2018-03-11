
var width = 800;
var height = 800;

var game;// = new Phaser.Game(width, height, Phaser.AUTO, '#game');
var totalRounds;
var totalPlayers;
var players;
var rounds;
var frameDuration = 300;
var isPlaying = true;
var currentRound = 0;
var isReverselyPlaying = false;
var fragmentSize = 15;
var cellSize = 50;
var log;
var cells = [];
var brokenTentacles = [];
var tentacles = [];
var totalOffset = [0];
var roundDuration = [];
var playerNames = ['Neutral', 'Player 1', 'Player 2', 'Player 3', 'Player 4'];
var playerRes = [];
var stgs = ['normal', 'attack', 'defence', 'grow'];
var levels = ['lv1', 'lv1', 'lv2', 'lv3', 'lv4', 'lv4'];
var colors = [0x888888, 0x007fff, 0x66FF00, 0x8B00FF, 0x30D5C8, 0xCCCCFF];
var chartColors = ['#888888', '#007fff', '#66FF00', '#8B00FF', '#30D5C8', '#CCCCFF'];
var roundTxt;

//function loader()

function loadRound(roundNum) {
    var round = log.body[roundNum];
    roundTxt.text = "Round " + roundNum;
    $.each(round.cellActions, function (j, command) {
        //新增
        if (command.type == 1) {
            cells[command.id] = Cell.createNew(command.id, command.birthPosition, command.size, command.resources, command.team, command.level, command.strategy);
            cells[command.id].draw();
        }

        //大小/资源值改变
        else if (command.type == 2) {
            cells[command.id].updateSize(command.newSize, command.newResource, command.srcTentacles, command.dstTentacles, command.dstTentaclesCut, roundNum);

        }

        //等级改变
        else if (command.type == 3) {
            cells[command.id].updateLevel(command.newLevel, roundNum);
        }

        //策略改变
        else if (command.type == 4) {
            cells[command.id].updateStg(command.newStg, roundNum);
        }

        //派系改变
        else if (command.type == 5) {
            cells[command.id].updateTeam(command.newTeam, roundNum);
        }
    });

    $.each(round.tentacleActions, function (j, command) {
        //新增
        if (command.type == 1) {
            tentacles[command.id] = Tentacle.createNew(command.id, command.srcCell, command.dstCell, command.transRate);
            //tentacles[command.id].draw();
        }

        //伸长
        if (command.type == 2) {
            setTimeout(function () {
                tentacles[command.id].strech(command.movement.dx, command.movement.dy, roundNum);
            }, 50);
        }

        //缩短
        if (command.type == 3) {
            setTimeout(function () {
                tentacles[command.id].shrink(command.movement.dx, command.movement.dy, roundNum);
            }, 50);
        }

        //传输速度改变
        if (command.type == 4) {
            tentacles[command.id].updateTransRate(command.newTransRate, roundNum);
        }

        //切断
        if (command.type == 5) {
            tentacles[command.id].cutOff(command.cutPosition.x, command.cutPosition.y, roundNum);
        }

        //消失
        if (command.type == 6) {
            tentacles[command.id].destroy(roundNum);
        }
    });

    $.each(round.cutTentacleActions, function (j, command) {
        //新增
        if (command.type == 1) {
            brokenTentacles[command.id] = BrokenTentacle.createNew(command.id, command.birthPosition, command.dstCell, command.transRate, command.team, roundNum);
        }
        //缩短
        if (command.type == 2) {
            brokenTentacles[command.id].shrink(command.movement.dx, command.movement.dy, roundNum);
        }
        //消失
        if (command.type == 3) {
            brokenTentacles[command.id].destroy(roundNum);
        }
    });

    currentRound = roundNum + 1;

}

function loadGame() {
    game = new Phaser.Game(width, height, Phaser.AUTO, '#game');
    var states = {
        welcome: function () {
            this.preload = function () {
                game.load.image('welcome', 'img/welcome.png');
                game.load.image('rect', 'img/rect.png');
                game.load.onLoadComplete.add(function () {
                    game.state.start('loading');
                });
            }
        },
        loading: function () {
            this.preload = function () {
                var welc = game.add.sprite(0, 0, 'welcome');
                //welc.scale.setTo(800 / 933);
                //game.stage.backgroundColor = '#ddd';
                totalRounds = jsonData.head.totalRounds;
                totalPlayers = jsonData.head.totalPlayers;
                players = jsonData.head.playerInfo;
                log = jsonData;
                // game.load.crossOrigin = 'anonymous';
                // $.each(players, function(i, player) {
                //     //game.load.image(player.race, 'img/' + player.race + '.png');
                //     ;
                //     //console.log('./img/' + player.race + '.png');
                // });

                game.load.image('bg', 'img/bg1.jpg');

                game.load.image('over', 'img/over.png');
                game.load.image('rank', 'img/rank.png');
                game.load.image('pause', 'img/pause.png');
                game.load.image('resume', 'img/resume.png');
                game.load.image('pre', 'img/pre.png');
                game.load.image('next', 'img/next.png');

                game.load.image('neutral', 'img/neutral.png');
                game.load.image('official', 'img/official.png');
                for (var i = 0; i < 4; i += 1)
                    for (var j = 0; j < 6; j += 1)
                        game.load.image(stgs[i] + '-' + levels[j], 'img/' + stgs[i] + '-' + levels[j] + '.png');


                game.load.image('fragment', 'img/fragment.png');
                game.load.image('circle', 'img/circle.png');
                game.load.image('slash', 'img/slash.png');
                game.load.image('DA', 'img/DA.png');

                var progressBar = game.add.sprite(275, 620, 'rect');
                progressBar.scale.y = 50 / 200;
                progressBar.tint = 0x996600;
                //game.debug.geom(progressBar, 'rgba(153, 102, 0, 0.9)');
                game.load.onFileComplete.add(function (progress) {
                    //progressText.text = progress + '%';
                    progressBar.scale.x = progress / 100 * 250 / 200;
                });
                welc.inputEnabled = true;
                game.load.onLoadComplete.add(function () {
                    var startInfo = game.add.text(game.world.centerX, game.world.height * 0.7, 'Press anywhere to continue', {
                        fontSize: '30px',
                        //fontWeight: 'light',
                        fill: '#bbb',
                    });
                    startInfo.anchor.setTo(0.5);

                    welc.events.onInputDown.add(function () {
                        game.state.start('view');
                    });
                });
            }
        },

        view: function () {
            this.create = function () {
                game.add.image(0, 0, 'bg');
                roundTxt = game.add.text(20, 20, 'Round ', {
                    fontSize: '10px',
                    fontWeight: 'light',
                    fill: '#222'
                });
                var nextButton = game.add.button(740, 20, 'next', function () {
                    //alert('next');
                });
                var pauseButton = game.add.button(680, 20, 'pause', function () {
                    //alert('pause');
                    // if (isPlaying)
                    //     isPlaying = false;
                    // else {
                    //     isPlaying = true;
                    //     loadRound(currentRound);
                    // }
                });
                var preButton = game.add.button(620, 20, 'pre', function () {
                    //alert('pre');
                });
                //console.log(roundTxt);


                $.each(log.body, function (i, round) {
                    // setTimeout(function () {
                    //     roundTxt.text = "Round " + i;
                    //     //game.debug.text(roundTxt);
                    // }, totalOffset[i]);
                    roundDuration[i] = (i != 0) * frameDuration;//round.runDuration;
                    totalOffset[i + 1] = (i != 0) * frameDuration/*round.runDuration*/ + (i == 0 ? 0 : totalOffset[i]);
                    setTimeout(function() {
                        loadRound(i);
                    }, totalOffset[i]);
                });
                //loadRound(0, roundTxt);
                // for (var i = 0; i < log.body.length; i++) {
                //     while(isPlaying == false);
                //     setTimeout(function() {
                //         loadGame(i);
                //     }, frameDuration);
                // }
                // setTimeout(function () {
                //     game.state.start('result');
                // }, totalOffset[totalRounds - 1] + roundDuration[totalRounds - 1] + 5000);
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

    game.state.start('welcome');
}
