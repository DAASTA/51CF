
var width = 800;
var height = 800;

var game;// = new Phaser.Game(width, height, Phaser.AUTO, '#game');
var totalRounds;
var totalPlayers;
var players = [];
var playerStages = [];
var rounds;
var frameDuration = 400;
var isPlaying = true;
var currentRound = 0;
var isReverselyPlaying = false;
var fragmentSize = 15;
var cellSize = 50;
var log;
var cells = [];
var brokenTentacles = [];
var tentacles = [];
var playerNames = ['Neutral', 'Player 1', 'Player 2', 'Player 3', 'Player 4'];
var stgs = ['normal', 'attack', 'defence', 'grow'];
var levels = ['lv1', 'lv1', 'lv2', 'lv3', 'lv4', 'lv4'];
var colors = [0x888888, 0x007fff, 0x66FF00, 0x8B00FF, 0x30D5C8, 0xCCCCFF];
var chartColors = ['#888888', '#007fff', '#66FF00', '#8B00FF', '#30D5C8', '#CCCCFF'];
var roundTxt;
var selectedCell = -1;
var prefix = '';

function loader() {
    if (isPlaying)
        loadRound(currentRound);
    setTimeout(loader, frameDuration);
}

function loadRound(roundNum) {
    var round = log.body[roundNum];
    roundTxt.text = "Round " + roundNum;
    $.each(round.playerAction, function (j, command) {
        //console.log(command);
        if (command.type == 1) {
            playerStages[command.id] = {};
            playerStages[command.id].defenceStage = command.dS;
            playerStages[command.id].extraControlStage = command.eCS;
            playerStages[command.id].regenerationSpeedStage = command.rSS;
            playerStages[command.id].speedStage = command.sS;
        }
    });
    $.each(round.cellActions, function (j, command) {
        //新增
        if (command.type == 1) {
            cells[command.id] = Cell.createNew(command.id, command.birthPosition, command.size, command.resources, command.techVal, command.team, command.level, command.strategy);
            cells[command.id].draw();
        }

        //大小/资源值改变
        else if (command.type == 2 && cells[command.id] != null && cells[command.id] != undefined) {
            cells[command.id].updateSize(command.newSize, command.newResource, command.newTechVal, command.srcTentacles, command.dstTentacles, command.dstTentaclesCut);
        }

        //等级改变
        else if (command.type == 3 && cells[command.id] != null && cells[command.id] != undefined) {
            cells[command.id].updateLevel(command.newLevel);
        }

        //策略改变
        else if (command.type == 4 && cells[command.id] != null && cells[command.id] != undefined) {
            cells[command.id].updateStg(command.newStg);
        }

        //派系改变
        else if (command.type == 5 && cells[command.id] != null && cells[command.id] != undefined) {
            cells[command.id].updateTeam(command.newTeam);
        }
    });

    $.each(round.tentacleActions, function (j, command) {
        //新增
        if (command.type == 1) {
            tentacles[command.id] = Tentacle.createNew(command.id, command.srcCell, command.dstCell, command.transRate);
            //tentacles[command.id].draw();
        }

        //伸长
        if (command.type == 2 && tentacles[command.id] != null && tentacles[command.id] != undefined) {
            setTimeout(function () {
                tentacles[command.id].strech(command.movement.dx, command.movement.dy);
            }, 20);
        }

        //缩短
        if (command.type == 3 && tentacles[command.id] != null && tentacles[command.id] != undefined) {
            setTimeout(function () {
                tentacles[command.id].shrink(command.movement.dx, command.movement.dy);
            }, 20);
        }

        //传输速度改变
        if (command.type == 4 && tentacles[command.id] != null && tentacles[command.id] != undefined) {
            tentacles[command.id].updateTransRate(command.newTransRate);
        }

        //切断
        if (command.type == 5 && tentacles[command.id] != null && tentacles[command.id] != undefined) {
            tentacles[command.id].cutOff(command.cutPosition.x, command.cutPosition.y);
        }

        //消失
        if (command.type == 6 && tentacles[command.id] != null && tentacles[command.id] != undefined) {
            tentacles[command.id].destroy();
        }
    });

    $.each(round.cutTentacleActions, function (j, command) {
        //新增
        if (command.type == 1) {
            brokenTentacles[command.id] = BrokenTentacle.createNew(command.id, command.birthPosition, command.dstCell, command.transRate, command.team);
        }
        //缩短
        if (command.type == 2) {
            setTimeout(function () {
                if (brokenTentacles[command.id] != null && brokenTentacles[command.id] != undefined)
                    brokenTentacles[command.id].shrink(command.movement.dx, command.movement.dy);
            }, 20);
        }
        //消失
        if (command.type == 3 && brokenTentacles[command.id] != null && brokenTentacles[command.id] != undefined) {
            brokenTentacles[command.id].destroy();
        }
    });

    revealInfo();
    currentRound = roundNum + 1;

}

function loadGame() {
    if (game != undefined && game != null)
        game.destroy();
    cells = [];
    brokenTentacles = [];
    tentacles = [];
    currentRound = 0;
    game = new Phaser.Game(width, height, Phaser.AUTO, '#game');
    var states = {
        welcome: function () {
            this.preload = function () {
                game.load.image('welcome', prefix + 'img/welcome.png');
                game.load.image('rect', prefix + 'img/rect.png');
                game.load.onLoadComplete.add(function () {
                    game.state.start('loading');
                });
            }
        },
        loading: function () {
            this.preload = function () {
                var welc = game.add.sprite(0, 0, 'welcome');
                log = jsonData;
                totalRounds = log.head.totalRounds;
                totalPlayers = log.head.totalPlayers;
                $.each(log.head.playerInfo, function (i, thisPlayer) {
                    playerNames[thisPlayer.team] = thisPlayer.name;
                });
                game.load.image('bg', prefix + 'img/bg1.jpg');

                game.load.image('over', prefix + 'img/over.png');
                game.load.image('rank', prefix + 'img/rank.png');
                game.load.image('pause', prefix + 'img/pause.png');
                game.load.image('resume', prefix + 'img/resume.png');
                game.load.image('pre', prefix + 'img/pre.png');
                game.load.image('next', prefix + 'img/next.png');

                game.load.image('neutral', prefix + 'img/neutral.png');
                game.load.image('official', prefix + 'img/official.png');
                for (var i = 0; i < 4; i += 1)
                    for (var j = 0; j < 6; j += 1)
                        game.load.image(stgs[i] + '-' + levels[j], prefix + 'img/' + stgs[i] + '-' + levels[j] + '.png');


                game.load.image('circle', prefix + 'img/circle.png');
                game.load.image('slash', prefix + 'img/slash.png');
                game.load.image('DA', prefix + 'img/DA.png');

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
                var pauseButton, resumeButton;
                var nextButton = game.add.button(740, 20, 'next', function () {
                    isPlaying = true;
                    setTimeout(function () {
                        isPlaying = false;
                    }, frameDuration);
                });
                pauseButton = game.add.button(680, 20, 'pause', function () {
                    isPlaying = false;
                    pauseButton.visible = false;
                    resumeButton.visible = true;
                });
                //console.log(pauseButton);
                resumeButton = game.add.button(680, 20, 'resume', function () {
                    isPlaying = true;
                    pauseButton.visible = true;
                    resumeButton.visible = false;
                });
                resumeButton.visible = false;
                //console.log(roundTxt);

                loader();
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

function revealInfo() {
    var sumRes = 0, sumCells = 0, sumTentacles = 0;
    players = new Array(totalPlayers + 1)
    for (var i = 0; i < players.length; i++) {
        players[i] = {};
        players[i].ID = i;
        players[i].cellNum = 0;
        players[i].tentacleNum = 0;
        players[i].res = 0;
        players[i].name = playerNames[i];
        players[i].color = chartColors[i];
        if (playerStages[i] != null && playerStages[i] != undefined && playerStages[i].defenceStage != null && playerStages[i].defenceStage != undefined) {
            players[i].defenceStage = playerStages[i].defenceStage;
            players[i].extraControlStage = playerStages[i].extraControlStage;
            players[i].regenerationSpeedStage = playerStages[i].regenerationSpeedStage;
            players[i].speedStage = playerStages[i].speedStage;
        }
    }
    $.each(cells, function (i, cell) {
        players[cell.team].res += cell.resources;
        players[cell.team].cellNum++;
        sumRes += cell.resources;
        sumCells++;
    });
    $.each(tentacles, function (i, tentacle) {
        if (tentacle != null && tentacle != undefined && tentacle.length > 1) {
            players[tentacle.startCell.team].res += tentacle.length / 10;
            sumRes += tentacle.length / 10;
            players[tentacle.startCell.team].tentacleNum++;
            sumTentacles++;
        }
    });
    $.each(brokenTentacles, function (i, tentacle) {
        if (tentacle != null && tentacle != undefined && tentacle.length > 1) {
            players[tentacle.team].res += tentacle.length / 10;
            sumRes += tentacle.length / 10;
            players[tentacle.team].tentacleNum++;
            sumTentacles++;
        }
    });
    //console.log({ "sum": sumTentacles, "length": tentacles.length + brokenTentacles.length });
    var data_arr = new Array(players.length);
    $.each(data_arr, function (i, num) {
        data_arr[i] = players[i].res / sumRes;
    });
    var c = document.getElementById('info-board');
    var ctx = c.getContext("2d");
    c.height = c.height;

    var radius = 130; //半径  
    var ox = radius + 20 + 50, oy = radius + 20 + 50; //圆心  

    var width = 50, height = 10; //图例宽和高  
    var posX = ox * 2 + 20, posY = 80;   //  
    var textX = posX + width + 5, textY = posY + 10;

    var startAngle = 0; //起始弧度  
    var endAngle = 0;   //结束弧度  
    for (var i = 0; i < data_arr.length; i++) {
        //绘制饼图  
        endAngle = endAngle + data_arr[i] * Math.PI * 2; //结束弧度  
        ctx.fillStyle = players[i].color;
        ctx.beginPath();
        ctx.moveTo(ox, oy); //移动到到圆心  
        ctx.arc(ox, oy, radius, startAngle, endAngle, false);
        ctx.closePath();
        ctx.fill();
        startAngle = endAngle; //设置起始弧度  

        //绘制比例图及文字  
        ctx.fillStyle = players[i].color;
        ctx.fillRect(posX, posY + 20 * i, width, height);
        ctx.moveTo(posX, posY + 20 * i);
        ctx.font = 'bold 12px 微软雅黑';    //斜体 30像素 微软雅黑字体  
        ctx.fillStyle = players[i].color; //"#000000";  
        var percent = players[i].name + "：" + Math.round(data_arr[i] * 10000) / 100 + "%";
        ctx.fillText(percent, textX, textY + 20 * i);
    }

    if (selectedCell >= 0) {
        var cell = cells[selectedCell];
        var cellImg = new Image();
        cellImg.src = prefix + 'img/' + cell.image + '.png';
        var col1Offset = 100;
        var col2Offset = 280;
        var col3Offset = 460;
        var rowOffset2 = 650;
        ctx.drawImage(cellImg, col1Offset, rowOffset2 - 20);

        ctx.fillStyle = "#000000";
        ctx.font = 'bold 20px sans';
        ctx.fillText('Details of Selected Tower', 210, rowOffset2 - 40);
        ctx.font = 'normal 15px sans';
        ctx.fillText("Team:", col2Offset, rowOffset2); ctx.fillText(cell.team, col3Offset + 40, rowOffset2);
        ctx.fillText("Player:", col2Offset, rowOffset2 + 25); ctx.fillText(playerNames[cell.team], col3Offset, rowOffset2 + 25);
        ctx.fillText("Resources:", col2Offset, rowOffset2 + 25 * 2); ctx.fillText(Math.round(cell.resources), col3Offset, rowOffset2 + 25 * 2);
        ctx.fillText("Tech Value:", col2Offset, rowOffset2 + 25 * 3); ctx.fillText(Math.round(cell.techVal * 1000) / 1000, col3Offset, rowOffset2 + 25 * 3);
        ctx.fillText("Level:", col2Offset, rowOffset2 + 25 * 4); ctx.fillText(cell.level, col3Offset, rowOffset2 + 25 * 4);
        ctx.fillText("Strategy:", col2Offset, rowOffset2 + 25 * 5); ctx.fillText(stgs[cell.strategy], col3Offset, rowOffset2 + 25 * 5);
        ctx.fillText("Tower ID: " + cell.ID, col1Offset, rowOffset2 + 90);
        ctx.fillText("Position: (" + cell.pos.x + ", " + cell.pos.y + ")", col1Offset - 25, rowOffset2 + 25 * 5);
        ctx.fillStyle = chartColors[cell.team];
        ctx.fillRect(col3Offset, rowOffset2 - 15, 30, 18);
    }
    else {
        var noticeTextX = 150;
        var noticeTextY = 685;
        ctx.fillStyle = "#000000";
        ctx.font = 'normal 20px sans';
        ctx.fillText("Press a tower to reveal its details...", noticeTextX, noticeTextY);
    }

    var playersSorted = new Array(players.length);
    for (var i = 0; i < players.length; i++)
        for (var j = i + 1; j < players.length; j++) {
            if (players[i].res < players[j].res) {
                var tmp = Object.assign({}, players[i]);
                players[i] = Object.assign({}, players[j]);
                players[j] = Object.assign({}, tmp);
            }
        }

    var rowOffset1 = 340;
    var colOffset1 = 20;
    var colOffset2 = 110;
    var colOffset3 = 220;
    var colOffset4 = 290;
    var colOffset5 = 350;
    var colOffset6 = 490;
    ctx.fillStyle = "#000000";
    ctx.font = 'bold 25px sans';
    ctx.fillText('Real-time Ranking', 190, 40);
    ctx.font = 'bold 15px sans';
    ctx.fillText('Rank', colOffset1, rowOffset1 + 40);
    ctx.fillText('Player', colOffset2, rowOffset1 + 40);
    ctx.fillText('Towers', colOffset3, rowOffset1 + 40);
    ctx.fillText('Lines', colOffset4, rowOffset1 + 40);
    ctx.fillText('RSS/SS/DS/ECS', colOffset5, rowOffset1 + 40);
    ctx.fillText('Resources', colOffset6, rowOffset1 + 40);
    ctx.font = 'normal 15px sans';
    for (var i = 0; i < players.length; i++) {
        ctx.fillText(i + 1, colOffset1 + 10, rowOffset1 + 70 + 30 * i);
        ctx.fillText(players[i].name, colOffset2 + 15, rowOffset1 + 70 + 30 * i);
        ctx.fillText(players[i].cellNum, colOffset3 + 20, rowOffset1 + 70 + 30 * i);
        ctx.fillText(players[i].tentacleNum, colOffset4 + 15, rowOffset1 + 70 + 30 * i);
        if (players[i].regenerationSpeedStage != null && players[i].regenerationSpeedStage != undefined)
            ctx.fillText(players[i].regenerationSpeedStage + '/' + players[i].speedStage + '/' + players[i].defenceStage + '/' + players[i].extraControlStage, colOffset5 + 20, rowOffset1 + 70 + 30 * i);
        ctx.fillText(Math.round(players[i].res), colOffset6 + 20, rowOffset1 + 70 + 30 * i);
        ctx.fillStyle = players[i].color;
        ctx.fillRect(colOffset2 - 35, rowOffset1 + 55 + 30 * i, 30, 18);
        ctx.fillStyle = "#000000";
    }
    ctx.font = 'bold 15px sans';
    ctx.fillText('Total', colOffset2 + 5, rowOffset1 + 70 + 30 * players.length);
    ctx.fillText(sumCells, colOffset3 + 20, rowOffset1 + 70 + 30 * players.length);
    ctx.fillText(sumTentacles, colOffset4 + 15, rowOffset1 + 70 + 30 * players.length);
    ctx.fillText(Math.round(sumRes), colOffset6 + 20, rowOffset1 + 70 + 30 * players.length);
    //console.log(players);
} 