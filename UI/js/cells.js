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
    createNew: function(_id, _pos, _size, _resources, _category, _house) {
        var cell = {};
        cell.ID = _id;
        cell.pos = _pos;
        cell.size = _size;
        cell.resources = _resources;
        cell.category = _category;
        cell.house = _house;

        cell.draw = function() {
            cell.sprite = game.add.sprite(cell.pos.x, cell.pos.y, cell.category + ".png");
            //change cell's color according to its house
            //

            //show cell's resources
        }

        cell.update = function(newResources, newSize, newCategory, newHouse) {

            //animation: expand/shrink to new size
            //

            cell.size = newSize;
            cell.resources = newResources;

            // update cell's resources
            //
            
            if (cell.category != newCategory) {
                //change image
                //
                cell.category = newCategory;
            }

            if (cell.house != newHouse) {
                // change color
                //
                cell.house = newHouse;
            }
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
