/**
 * 12.14新增 by zrd
 * 新增updateTeam函数，表示Team改变
 */

//game.load.image('DA', 'img/DA.png');

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
    createNew: function(_id, _pos, _size, _resources, _team, _level) {
        var cell = {};
        cell.ID = _id;
        cell.pos = _pos;
        cell.size = _size;
        cell.resources = _resources;
        cell.team = _team;
        cell.level = _level;
        //cell.race = _race;

        cell.draw = function() {
            cell.sprite = game.add.sprite(cell.pos.x, cell.pos.y, 'DA');
            cell.sprite.anchor.setTo(0.5, 0.5);
            cell.sprite.scale.setTo(cell.size / 200, cell.size / 200);
            cell.sprite.tint = colors[cell.team];

            //show cell's resources
        }

        cell.updateSize = function(newSize, newResources, srcTantecles, dstTantecles, dstBrokenTantecles, roundNum) {

            //animation: expand/shrink to new size
            //

            // update all tantecles connecting to the cell
            //

            cell.size = newSize;
            cell.resources = newResources;
            game.add.tween(cell.sprite.scale).to( { x: newSize / 200, y: newSize / 200}, roundDuration[roundNum], "Sine.easeInOut", true);

            $.each(srcTantecles, function(i, tantecleNum) {
                tentacles[tantecleNum].checkStartPos(newSize, roundNum);
            });
            $.each(dstTantecles, function(i, tantecleNum) {
                tentacles[tantecleNum].checkEndPos(newSize, roundNum);
            });
            //cell.sprite.scale.setTo(newSize.x / 200, newSize.y / 200);

            // update cell's resources
            //
            
        }

        cell.updateStg = function(newStg, roundNum) {}


        cell.updateTeam = function(newTeam, roundNum) {
            //change color or image
            //

            cell.team = newTeam;
            cell.sprite.tint = colors[cell.team];
        }

        cell.updateLevel = function(newLevel, roundNum) {
            //change size or image
            //

            cell.level = newLevel;
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
