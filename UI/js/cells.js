/**
 * 12.14新增 by zrd
 * 新增updateTeam函数，表示Team改变
 */

//game.load.image('DA', 'img/DA.png');

var Point = {
    createNew: function (_x, _y) {
        var point = {};
        point.x = _x;
        point.y = _y;

        //move the point, x += dx, y += dy
        point.update = function (dx, dy) {
            point.x += dx;
            point.y += dy;
            return point;
        }
        return point;
    }
}

var Cell = {
    createNew: function (_id, _pos, _size, _resources, _techVal, _team, _level, _stg) {
        var cell = {};
        cell.ID = _id;
        cell.pos = _pos;
        cell.size = _size;
        cell.resources = _resources;
        cell.techVal = _techVal;
        cell.team = _team;
        cell.level = _level;
        cell.strategy = _stg;
        cell.image = stgs[cell.strategy] + '-' + levels[cell.level];
        srcTentacles[cell.ID] = new Array();
        if (cell.team == 0)
            cell.image = 'neutral';

        cell.draw = function () {
            cell.sprite = game.add.sprite(cell.pos.x, cell.pos.y, cell.image);
            cell.sprite.anchor.setTo(0.5, 0.5);
            cell.sprite.scale.setTo(cell.size / cellSize, cell.size / cellSize);
            cell.sprite.tint = colors[cell.team];
            cell.resourceText = game.add.text(cell.pos.x + cell.size / shiftX[cell.strategy], cell.pos.y + cell.size / shiftY[cell.strategy], '', {
                font: '40px Comic Sans MS',
                //fontWeight: 'light',
                fill: '#888'//chartColors[cell.team]
            });
            if (cell.team == 0) {
                cell.resourceText.x = cell.pos.x + cell.size / shiftXNeutral;
                cell.resourceText.y = cell.pos.y + cell.size / shiftYNeutral;
            }
            cell.resourceText.text = Math.round(cell.resources);
            cell.resourceText.anchor.setTo(0.5, 1);
            cell.resourceText.tint = colors[cell.team];
            cell.resourceText.scale.setTo(cell.size / 100 / (1 + 0.15 * (cell.resources >= 100)));
            //cell.resourceText.
            cell.sprite.inputEnabled = true;
            cell.sprite.events.onInputDown.add(function () {
                selectedCell = cell.ID;
                revealInfo();
            });
        }

        cell.updateSize = function (newSize, newResources, newTechVal, srcTantecles, dstBrokenTantecles) {
            setTimeout(function() {
                if (newSize < 10)
                    newSize = 10;
                if (newResources < 0)
                    newResources = 0;
                cell.size = newSize;
                cell.resources = newResources;
                cell.techVal = newTechVal;
                cell.resourceText.text = Math.round(cell.resources);
                game.add.tween(cell.sprite.scale).to({ x: newSize / cellSize, y: newSize / cellSize }, frameDuration, "Sine.easeInOut", true);
                game.add.tween(cell.resourceText.scale).to({ x: cell.size / 100 / (1 + 0.15 * (cell.resources >= 100)), y: cell.size / 100 / (1 + 0.15 * (cell.resources >= 100)) }, frameDuration, "Sine.easeInOut", true);
                // cell.resourceText.position.setTo(cell.pos.x + cell.size / shiftX[cell.strategy],
                //     cell.pos.y + cell.size / shiftY[cell.strategy]);
                cell.tweenHandle = game.add.tween(cell.resourceText).to({ x: cell.pos.x + cell.size / shiftX[cell.strategy], y: cell.pos.y + cell.size / shiftY[cell.strategy] }, frameDuration, "Sine.easeInOut", true);

                // $.each(srcTantecles, function (i, tantecleNum) {
                //     // console.log(tantecleNum);
                //     // console.log(tentacles);
                //     //tentacles[tantecleNum].checkStartPos(newSize);
                // });
                // $.each(dstTentacles[cell.ID], function (i, tantecleNum) {
                //     // if (tentacles[tantecleNum] != null && tentacles[tantecleNum] != undefined)
                //     //     tentacles[tantecleNum].checkEndPos(newSize);
                // });
            }, 10);
        }

        cell.updateStg = function (newStg) {
            cell.strategy = newStg;
            cell.sprite.destroy();
            cell.image = stgs[cell.strategy] + '-' + levels[cell.level];
            cell.sprite = game.add.sprite(cell.pos.x, cell.pos.y, cell.image);
            cell.sprite.anchor.setTo(0.5, 0.5);
            cell.sprite.scale.setTo(cell.size / cellSize, cell.size / cellSize);
            //if (cell.tweenHandle != undefined)cell.tweenHandle.pause();
            cell.resourceText.position.setTo(cell.pos.x + cell.size / shiftX[cell.strategy],
                cell.pos.y + cell.size / shiftY[cell.strategy]);
            cell.sprite.tint = colors[cell.team];
            cell.sprite.inputEnabled = true;
            cell.sprite.events.onInputDown.add(function () {
                selectedCell = cell.ID;
                revealInfo();
            });
        }


        cell.updateTeam = function (newTeam) {
            $.each(srcTentacles[cell.ID], function(i, orphan) {
                if (tentacles[orphan] != null && tentacles[orphan] != undefined) {
                    tentacles[orphan].sprite.tint = colors[newTeam];
                }
            });
            cell.team = newTeam;
            cell.image = stgs[cell.strategy] + '-' + levels[cell.level];
            cell.resourceText.position.setTo(cell.pos.x + cell.size / shiftX[cell.strategy],
                cell.pos.y + cell.size / shiftY[cell.strategy]);
            cell.resourceText.tint = colors[cell.team];
            if (cell.team == 0) {
                cell.image = 'neutral';
                cell.resourceText.x = cell.pos.x + cell.size / shiftXNeutral;
                cell.resourceText.y = cell.pos.y + cell.size / shiftYNeutral;
            }
            cell.sprite.destroy();
            cell.sprite = game.add.sprite(cell.pos.x, cell.pos.y, cell.image);
            cell.sprite.anchor.setTo(0.5, 0.5);
            cell.sprite.scale.setTo(cell.size / cellSize, cell.size / cellSize);
            cell.sprite.tint = colors[cell.team];
            cell.sprite.inputEnabled = true;
            cell.sprite.events.onInputDown.add(function () {
                selectedCell = cell.ID;
                revealInfo();
            });
        }

        cell.updateLevel = function (newLevel) {
            cell.level = newLevel;
            cell.image = stgs[cell.strategy] + '-' + levels[cell.level];
            cell.resourceText.position.setTo(cell.pos.x + cell.size / shiftX[cell.strategy],
                cell.pos.y + cell.size / shiftY[cell.strategy]);
            cell.sprite.destroy();
            cell.sprite = game.add.sprite(cell.pos.x, cell.pos.y, cell.image);
            cell.sprite.anchor.setTo(0.5, 0.5);
            cell.sprite.scale.setTo(cell.size / cellSize, cell.size / cellSize);
            cell.sprite.tint = colors[cell.team];
            cell.sprite.inputEnabled = true;
            cell.sprite.events.onInputDown.add(function () {
                selectedCell = cell.ID;
                revealInfo();
            });
        }

        cell.shake = function () {
            // cell's shaking (expanding and shrinking at an interval) effect
            //
        }

        //no destroy function - a cell will not be destroyed
        cells[cell.ID] = cell;
        return cell;
    }
}
