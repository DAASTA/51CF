var Tantecle = {
    //construction
    createNew = function (id, source, target) {
        var tantecle = {};
        tantecle.ID = id;
        tantecle.startCell = cells[source];
        deltaX = target.pos.x - source.pos.x;
        deltaY = target.pos.y - source.pos.y;
        l = sqrt(deltaX * deltaX + deltaY * deltaY);
        dx = source.size * deltaX / l;
        dy = source.size * deltaY / l;
        tantecle.startPoint = tantecle.startCell.pos.update(dx, dy);
        tantecle.endPoint = tantecle.startPoint;
        tantecle.length = 0;

        tantecle.strech = function(dx, dy) {
            tantecle.endPoint.update(dx, dy);
            tantecle.length = sqrt((tantecle.endPoint.x - tantecle.startPoint.x)
                                    * (tantecle.endPoint.x - tantecle.startPoint.x)
                                  + (tantecle.endPoint.y - tantecle.startPoint.y)
                                    * (tantecle.endPoint.y - tantecle.startPoint.y));


            //draw this tantecle
        }

        tantecle.shorten = function(dx, dy) {
            tantecle.endPoint.update(dx, dy);
            tantecle.length = sqrt((tantecle.endPoint.x - tantecle.startPoint.x)
                                    * (tantecle.endPoint.x - tantecle.startPoint.x)
                                  + (tantecle.endPoint.y - tantecle.startPoint.y)
                                    * (tantecle.endPoint.y - tantecle.startPoint.y));
            
            //draw this tantecle
        }

        tantecle.cutOff = function(posX, posY) {
            tantecle.endPoint = Point.createNew(posX, posY);
            tantecle.length = sqrt((tantecle.endPoint.x - tantecle.startPoint.x)
                                    * (tantecle.endPoint.x - tantecle.startPoint.x)
                                  + (tantecle.endPoint.y - tantecle.startPoint.y)
                                    * (tantecle.endPoint.y - tantecle.startPoint.y));
            
            //draw this tantecle
        }

        tantecle.destroy = function() {
            tantecle[id] = null;
        }

        tantecles[id] = tantecle;
        return tantecle;
    }
}

var BrokenTantecle = {
    createNew: function(_id, _startPoint, endCell) {
        var brokenTantecle = {};
        brokenTantecle.startPoint = _startPoint;
        brokenTantecle.endPoint = 
           }
}
