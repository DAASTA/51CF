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
    createNew: function(_id, _pos, _size, _resources, _team, _level, _race) {
        var cell = {};
        cell.ID = _id;
        cell.pos = _pos;
        cell.size = _size;
        cell.resources = _resources;
        cell.team = _team;
        cell.level = _level;
        cell.race = _race;

        cell.draw = function() {
            cell.sprite = game.add.sprite(cell.pos.x, cell.pos.y, cell.level + ".png");
            //change cell's color according to its race
            //

            //show cell's resources
        }

        cell.updateSize = function(newSize, newResources, srcTantecles, dstTantecles, dstBrokenTantecles) {

            //animation: expand/shrink to new size
            //

            // update all tantecles connecting to the cell
            //

            cell.size = newSize;
            cell.resources = newResources;

            // update cell's resources
            //
            
        }

        cell.updateRace = function(newRace) {
            //change color or image
            //

            cell.race = newRace;
        }

        cell.updateLevel = function(newLevel) {
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
