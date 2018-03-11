/**
 * 12.14新增 by zrd
 * 新增updateTeam函数，表示Team改变
 */

//game.load.image('DA', 'img/DA.png');

function updatePlayerRes() {
    for (var i = 0; i < playerRes.length; i++)
        playerRes[i] = 0;
    $.each(cells, function(i, cell) {
        playerRes[cell.team] += cell.resources;
    });
    $.each(tentacles, function(i, tentacle) {
        if (tentacle != null && tentacle != undefined)
            playerRes[tentacle.startCell.team] += tentacle.length / 10;
    });
    $.each(brokenTentacles, function(i, tentacle) {
        if (tentacle != null && tentacle != undefined)
            playerRes[tentacle.team] += tentacle.length / 10;
    });
    drawCircle('chart', playerRes, chartColors, playerNames);
}

var Point = {
    createNew: function(_x, _y) {
        var point = {};
        point.x = _x;
        point.y = _y;

        //move the point, x += dx, y += dy
        point.update = function(dx, dy) {
            point.x += dx;
            point.y += dy;
            return point;
        }
        return point;
    }
}

var Cell = {
    createNew: function(_id, _pos, _size, _resources, _team, _level, _stg) {
        var cell = {};
        cell.ID = _id;
        cell.pos = _pos;
        cell.size = _size;
        cell.resources = _resources;
        cell.team = _team;
        cell.level = _level;
        cell.strategy = _stg;
        cell.image = stgs[cell.strategy] + '-' + levels[cell.level];
        if (cell.team == 0)
            cell.image = 'neutral';
        //cell.race = _race;

        cell.draw = function() {
            cell.sprite = game.add.sprite(cell.pos.x, cell.pos.y, cell.image);
            cell.sprite.anchor.setTo(0.5, 0.5);
            cell.sprite.scale.setTo(cell.size / cellSize, cell.size / cellSize);
            cell.sprite.tint = colors[cell.team];
            cell.resourceText = /*cell.sprite.addChild(*/game.add.text(cell.pos.x, cell.pos.y - cell.size/2, '', {
                fontSize: '50px',
                fontWeight: 'light',
                fill: '#444'
            });
            cell.resourceText.text = Math.round(cell.resources);
            cell.resourceText.anchor.setTo(0.5, 1);
            cell.resourceText.tint = colors[cell.team];
            cell.resourceText.scale.setTo(cell.size / 25);
            //console.log(cell.sprite);

            //show cell's resources
        }

        cell.updateSize = function(newSize, newResources, srcTantecles, dstTantecles, dstBrokenTantecles, roundNum) {

            //animation: expand/shrink to new size
            //

            // update all tantecles connecting to the cell
            //

            cell.size = newSize;
            cell.resources = newResources;
            cell.resourceText.text = Math.round(cell.resources);
            game.add.tween(cell.sprite.scale).to( { x: newSize / cellSize, y: newSize / cellSize}, roundDuration[roundNum], "Sine.easeInOut", true);
            game.add.tween(cell.resourceText.scale).to({x: cell.size / 25, y: cell.size / 25}, roundDuration[roundNum], "Sine.easeInOut", true);
            game.add.tween(cell.resourceText).to({y: cell.pos.y - cell.size/2}, roundDuration[roundNum], "Sine.easeInOut", true);

            $.each(srcTantecles, function(i, tantecleNum) {
                tentacles[tantecleNum].checkStartPos(newSize, roundNum);
            });
            $.each(dstTantecles, function(i, tantecleNum) {
                tentacles[tantecleNum].checkEndPos(newSize, roundNum);
            });
            updatePlayerRes();
            //cell.sprite.scale.setTo(newSize.x / 200, newSize.y / 200);

            // update cell's resources
            //
            
        }

        cell.updateStg = function(newStg, roundNum) {
            cell.strategy = newStg;
            cell.sprite.destroy();
            cell.sprite = game.add.sprite(cell.pos.x, cell.pos.y, stgs[cell.strategy] + '-' + levels[cell.level]);
            cell.sprite.anchor.setTo(0.5, 0.5);
            cell.sprite.scale.setTo(cell.size / cellSize, cell.size / cellSize);
            cell.sprite.tint = colors[cell.team];
            //cell.sprite.key = stgs[cell.strategy] + '-' + levels[cell.level];
        }


        cell.updateTeam = function(newTeam, roundNum) {
            //change color or image
            //

            cell.team = newTeam;
            cell.sprite.tint = colors[cell.team];
            cell.image = stgs[cell.strategy] + '-' + levels[cell.level];
            if (cell.team == 0) {
                cell.image = 'neutral';
                cell.sprite = game.add.sprite(cell.pos.x, cell.pos.y, cell.image);
            }
            updatePlayerRes();
        }

        cell.updateLevel = function(newLevel, roundNum) {
            //change size or image
            //

            cell.level = newLevel;
            cell.sprite.destroy();
            cell.sprite = game.add.sprite(cell.pos.x, cell.pos.y, stgs[cell.strategy] + '-' + levels[cell.level]);
            cell.sprite.anchor.setTo(0.5, 0.5);
            cell.sprite.scale.setTo(cell.size / cellSize, cell.size / cellSize);
            cell.sprite.tint = colors[cell.team];
            //cell.sprite.key = stgs[cell.strategy] + '-' + levels[cell.level];
        }

        cell.shake = function() {
            // cell's shaking (expanding and shrinking at an interval) effect
            //
        }

        //no destroy function - a cell will not be destroyed
        cells[cell.ID] = cell;
        return cell;
    }
}
