/**
 * 12.14新增 by zrd
 * tentacle和BrokenTentacle构造函数新增_transRate参数，表示触手中能量传输速度
 * tentacle新增updateTransRate函数
 */

var Fragment = {
    createNew: function (_parentID, _fragNum, isBroken) {
        var fragment = {};
        fragment.parentID = _parentID;
        fragment.fragNum = _fragNum;
        fragment.size = fragmentSize;
        if (isBroken) {
            fragment.parent = brokenTentacles[_parentID];
        }
        else
            fragment.parent = tentacles[_parentID];
        fragment.pos = Point.createNew(fragment.parent.startPoint.x + fragmentSize * fragment.fragNum * fragment.parent.pointer.x,
                                       fragment.parent.startPoint.y + fragmentSize * fragment.fragNum * fragment.parent.pointer.y);
        fragment.draw = function () {
            fragment.sprite = game.add.sprite(fragment.pos.x, fragment.pos.y, 'fragment');
            fragment.sprite.scale.setTo(fragment.size / 200, fragment.size / 200);
            fragment.sprite.anchor.setTo(0.5, 0.5);
            fragment.sprite.angle = fragment.parent.angle;
            fragment.sprite.tint = colors[fragment.parent.team];
        }

        fragment.shake = function () {

        }

        fragment.destroy = function () {
            fragment.sprite.destroy();
            fragment = null;
        }

        return fragment;
    }
}

var Slash = {
    createNew: function (cutPosition, tentacleAngle) {
        var slash = {};
        slash.draw = function() {
            slash.sprite = game.add.sprite(cutPosition.x, cutPosition.y, 'slash');
            //console.log(cutPosition);
            //setTimeout(function() {
                slash.sprite.anchor.setTo(0.5, 0.5);
                slash.sprite.scale.setTo(100 / 600);
                
            //}, 1000);
            var slashAngle = tentacleAngle - 90;
            if (slashAngle <= -360)
                slashAngle += 360;
            slash.sprite.angle = slashAngle;
            //console.log(Math.sin(30));
            slash.startPoint = Point.createNew(cutPosition.x - 150 * Math.cos(slashAngle * Math.PI / 180.0), cutPosition.y - 150 * Math.sin(slashAngle * Math.PI / 180.0));
            slash.endPoint = Point.createNew(cutPosition.x + 150 * Math.cos(slashAngle * Math.PI / 180.0), cutPosition.y + 150 * Math.sin(slashAngle * Math.PI / 180.0));
        }
        slash.wipe = function() {
            slash.draw();
            slash.mask = game.add.graphics(0, 0);
            slash.mask.beginFill(0xffffff);
            var circle = slash.mask.drawCircle(slash.startPoint.x, slash.startPoint.y, 100);
            console.log(slash.startPoint);
            console.log(slash.endPoint);
            slash.sprite.mask = slash.mask;
            game.add.tween(circle).to({x: slash.endPoint.x - slash.startPoint.x, y: slash.endPoint.y - slash.startPoint.y}, 1500, "Sine.easeInOut", true);
            setTimeout(slash.destroy, 1800);
        }

        slash.destroy = function() {
            slash.sprite.destroy();
            slash.mask.destroy();
            slash = null;
        }

        return slash;
    }
}

var Tentacle = {
    //construction
    createNew: function (id, source, target, _transRate) {
        var tentacle = {};
        tentacles[id] = tentacle;
        tentacle.ID = id;
        tentacle.transRate = _transRate;
        tentacle.team = cells[source].team;
        tentacle.startCell = cells[source];
        tentacle.endCell = cells[target];
        deltaX = tentacle.endCell.pos.x - tentacle.startCell.pos.x;
        deltaY = tentacle.endCell.pos.y - tentacle.startCell.pos.y;
        l = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
        tentacle.pointer = Point.createNew(deltaX / l, deltaY / l);
        tentacle.angle = Math.atan2(deltaY, deltaX) * 180 / Math.PI;
        //console.log(tentacle.angle);
        dx = tentacle.startCell.size * deltaX / l;
        dy = tentacle.startCell.size * deltaY / l;
        tentacle.startPoint = Point.createNew(tentacle.startCell.pos.x, tentacle.startCell.pos.y);
        tentacle.startPoint.x += dx/2;
        tentacle.startPoint.y += dy/2;

        console.log([dx, dy]);

        tentacle.endPoint = Point.createNew(tentacle.startPoint.x, tentacle.startPoint.y);
        //tentacle.endPoint = tentacle.startPoint;
        tentacle.length = 0;
        tentacle.fragmentNum = tentacle.length / fragmentSize;
        tentacle.fragments = new Array();

        tentacle.draw = function() {
            $.each(tentacle.fragments, function(i, frag) {
                frag = Fragment.createNew(tentacle.ID, i, false);
                //$.oneTime(100, frag.draw);
                //setTimeout()
            });
        }

        tentacle.strech = function(dx, dy, roundNum) {
            var oldFragNum = tentacle.fragmentNum;
            tentacle.endPoint.x += dx;
            tentacle.endPoint.y += dy;
            tentacle.length = Math.sqrt((tentacle.endPoint.x - tentacle.startPoint.x)
                                      * (tentacle.endPoint.x - tentacle.startPoint.x)
                                      + (tentacle.endPoint.y - tentacle.startPoint.y)
                                      * (tentacle.endPoint.y - tentacle.startPoint.y));


            //draw this tentacle
            tentacle.fragmentNum = Math.round(tentacle.length / fragmentSize);
            for (var i = oldFragNum; i < tentacle.fragmentNum; i = i + 1) {
                tentacle.fragments[i] = Fragment.createNew(tentacle.ID, i, false);
                //$('body').oneTime(100, tentacle.fragments[i].draw);
                setTimeout(tentacle.fragments[i].draw, 1000 * totalOffset[roundNum] + 1000 * roundDuration[roundNum] / (tentacle.fragmentNum - oldFragNum) * (i - oldFragNum));
            }
        }

        tentacle.shrink = function(dx, dy, roundNum) {
            var oldFragNum = tentacle.fragmentNum;
            tentacle.endPoint.update(dx, dy);
            tentacle.length = Math.sqrt((tentacle.endPoint.x - tentacle.startPoint.x)
                                      * (tentacle.endPoint.x - tentacle.startPoint.x)
                                      + (tentacle.endPoint.y - tentacle.startPoint.y)
                                      * (tentacle.endPoint.y - tentacle.startPoint.y));
            
            //draw this tentacle
            tentacle.fragmentNum = Math.round(tentacle.length / fragmentSize);
            for (var i = oldFragNum - 1; i >= tentacle.fragmentNum; i -= 1) {
                setTimeout(tentacle.fragments[i].destroy, 1000 * totalOffset[roundNum] + 1000 * roundDuration[roundNum] / ( - tentacle.fragmentNum + oldFragNum) * (oldFragNum - 1 - i));
            }
            tentacle.fragments.splice(tentacle.fragmentNum, oldFragNum - tentacle.fragmentNum);
        }

        tentacle.updateTransRate = function(newTransRate, roundNum) {
            //draw this tentacle
            //
            
            tentacle.transRate = newTransRate;
        }

        tentacle.cutOff = function(posX, posY, roundNum) {
            var oldFragNum = tentacle.fragmentNum;
            tentacle.endPoint = Point.createNew(posX, posY);
            tentacle.length = Math.sqrt((tentacle.endPoint.x - tentacle.startPoint.x)
                                      * (tentacle.endPoint.x - tentacle.startPoint.x)
                                      + (tentacle.endPoint.y - tentacle.startPoint.y)
                                      * (tentacle.endPoint.y - tentacle.startPoint.y));
            
            tentacle.fragmentNum = Math.round(tentacle.length / fragmentSize);
            for (var i = oldFragNum - 1; i >= tentacle.fragmentNum; i -= 1) {
                //console.log(tentacle.fragments[i]);
                setTimeout(tentacle.fragments[i].destroy, 1000 * totalOffset[roundNum]);
            }
            //tentacle.fragments.splice(tentacle.fragmentNum, oldFragNum - tentacle.fragmentNum);
            
            //draw this tentacle
        }

        tentacle.destroy = function(roundNum) {
            $.each(tentacle.fragments, function(i, frag) {
                setTimeout(frag.destroy, 1000 * totalOffset[roundNum]);
            });
            tentacle.fragments = [];
            tentacle[id] = null;
        }

        return tentacle;
    }
}

var BrokenTentacle = {
    createNew: function(_id, _startPoint, endCell, _transRate, _team, roundNum) {
        var brokenTentacle = {};
        brokenTentacles[_id] = brokenTentacle;
        brokenTentacle.endPoint = Point.createNew(_startPoint.x, _startPoint.y);
        brokenTentacle.ID = _id;
        brokenTentacle.team = _team;
        brokenTentacle.transRate = _transRate;
        var target = cells[endCell];
        deltaX = - target.pos.x + _startPoint.x;
        deltaY = - target.pos.y + _startPoint.y;
        l = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
        brokenTentacle.pointer = Point.createNew(deltaX / l, deltaY / l);
        brokenTentacle.angle = Math.atan2(-deltaY, -deltaX) * 180 / Math.PI;
        dx = target.size * deltaX / l;
        dy = target.size * deltaY / l;
        brokenTentacle.startPoint = Point.createNew(target.pos.x + dx/2, target.pos.y + dy/2);
        //console.log(brokenTentacle.endPoint);
        
        brokenTentacle.length = Math.sqrt((brokenTentacle.endPoint.x - brokenTentacle.startPoint.x)
                                        * (brokenTentacle.endPoint.x - brokenTentacle.startPoint.x)
                                        + (brokenTentacle.endPoint.y - brokenTentacle.startPoint.y)
                                        * (brokenTentacle.endPoint.y - brokenTentacle.startPoint.y));
        brokenTentacle.fragmentNum = Math.round(brokenTentacle.length / fragmentSize);
        brokenTentacle.fragments = [];
        console.log(brokenTentacle);

        setTimeout(function() {
            var slash = Slash.createNew(_startPoint, brokenTentacle.angle);
            slash.wipe();
        }, 1000 * totalOffset[roundNum] - 1000);
        
        for (var i = 0; i < brokenTentacle.fragmentNum; i += 1) {
            brokenTentacle.fragments[i] = Fragment.createNew(brokenTentacle.ID, i, true);
            setTimeout(brokenTentacle.fragments[i].draw, 1000 * totalOffset[roundNum]);
        }
        
        brokenTentacle.draw = function() {
            // draw this brokenTentacle, nearly same as tentacle
            //

        }

        brokenTentacle.expand = function() {
            // expand the endPoint to the target cell, called when size of the target cell changes
            //
        }

        brokenTentacle.shrink = function(dx, dy, roundNum) {
            //shrink, reset the startPoint of the brokenTentacle
            //
            var oldFragNum = brokenTentacle.fragmentNum;
            brokenTentacle.endPoint.x += dx;
            brokenTentacle.endPoint.y += dy;
            brokenTentacle.length = Math.sqrt((brokenTentacle.endPoint.x - brokenTentacle.startPoint.x)
                                            * (brokenTentacle.endPoint.x - brokenTentacle.startPoint.x)
                                            + (brokenTentacle.endPoint.y - brokenTentacle.startPoint.y)
                                            * (brokenTentacle.endPoint.y - brokenTentacle.startPoint.y));
            
            //draw this tentacle
            brokenTentacle.fragmentNum = Math.round(brokenTentacle.length / fragmentSize);
            //console.log(brokenTentacle);
            for (var i = oldFragNum - 1; i >= brokenTentacle.fragmentNum; i -= 1) {
                setTimeout(brokenTentacle.fragments[i].destroy, 1000 * totalOffset[roundNum] + 1000 * roundDuration[roundNum] / ( - brokenTentacle.fragmentNum + oldFragNum) * (oldFragNum - 1 - i));
            }
            brokenTentacle.fragments.splice(brokenTentacle.fragmentNum, oldFragNum - brokenTentacle.fragmentNum);
            // for (var i = 0, j = 0; j < oldFragNum - brokenTentacle.fragmentNum; i += 1) {
            //     setTimeout(function() {
            //         if (brokenTentacle.fragments[i] != null) {
            //             j += 1;
            //             brokenTentacle.fragments[i].destroy();
            //         }
            //     }, 1000 * totalOffset[roundNum] + 1000 * roundDuration[roundNum] / ( - brokenTentacle.fragmentNum + oldFragNum) * (oldFragNum - 1 - j));
            // }
            // brokenTentacle.fragments.splice(brokenTentacle.fragmentNum, oldFragNum - brokenTentacle.fragmentNum);
        }
        
        brokenTentacle.destroy = function(roundNum) {
            $.each(brokenTentacle.fragments, function(i, frag) {
                setTimeout(frag.destroy, 1000 * totalOffset[roundNum]);
            });
            brokenTentacle.fragments = [];
            brokenTentacles[brokenTentacle.ID] = null;
        }

        return brokenTentacle;
   }
}  
