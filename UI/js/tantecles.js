var Tantecle = {
    //construction
    createNew = function (id, source, target, _transRate) {
        var tantecle = {};
        tantecle.ID = id;
        tantecle.transRate = _transRate;
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

        tantecle.shrink = function(dx, dy) {
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
    createNew: function(_id, _startPoint, endCell, _transRate) {
        var brokenTantecle = {};
        brokenTantecle.startPoint = _startPoint;
        brokenTantecle.ID = _id;
        brokenTantecle.transRate = _transRate;
        var target = cells[endCell];
        deltaX = - target.pos.x + _startPoint.x;
        deltaY = - target.pos.y + _startPoint.y;
        l = sqrt(deltaX * deltaX + deltaY * deltaY);
        dx = target.size * deltaX / l;
        dy = target.size * deltaY / l;
        brokenTantecle.endPoint = Point.createNew(target.pos.x + dx, target.pos.y + dy);
        
        brokenTantecle.length = sqrt((tantecle.endPoint.x - tantecle.startPoint.x)
                                * (tantecle.endPoint.x - tantecle.startPoint.x)
                              + (tantecle.endPoint.y - tantecle.startPoint.y)
                                * (tantecle.endPoint.y - tantecle.startPoint.y));
        
        brokenTantecle.draw = function() {
            // draw this brokenTantecle, nearly same as tantecle
            //


        }

        brokenTantecle.expand = function() {
            // expand the endPoint to the target cell, called when size of the target cell changes
            //
        }

        brokenTantecle.shrink = function(dx, dy) {
            //shrink, reset the startPoint of the brokenTantecle
            //
        }
        
        brokenTantecle.destroy = function() {
            brokenTantecles[brokenTantecle.ID] = null;
        }

        brokenTantecles[brokenTantecle.ID] = brokenTantecle;
        return brokenTantecle;
   }
}  
