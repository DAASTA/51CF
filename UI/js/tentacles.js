/**
 * 12.14新增 by zrd
 * tentacle和BrokenTentacle构造函数新增_transRate参数，表示触手中能量传输速度
 * tentacle新增updateTransRate函数
 */

var Fragment = {
    createNew: function (_parentID, _fragNum, _isBroken) {
        var fragment = {};
        fragment.parentID = _parentID;
        fragment.fragNum = _fragNum;
        fragment.size = fragmentSize;
        fragment.isBroken = _isBroken;
        fragment.visible = false;
        if (_isBroken) {
            fragment.parent = brokenTentacles[_parentID];
        }
        else
            fragment.parent = tentacles[_parentID];

        fragment.pos = Point.createNew(fragment.parent.startPoint.x + fragmentSize * fragment.fragNum * fragment.parent.pointer.x,
            fragment.parent.startPoint.y + fragmentSize * fragment.fragNum * fragment.parent.pointer.y);

        //console.log(fragment);

        //fragment.draw();

        fragment.draw = function () {
            if (fragment.check() == true) {
                fragment.visible = true;
                fragment.sprite = game.add.sprite(fragment.pos.x, fragment.pos.y, 'fragment');
                fragment.sprite.scale.setTo(fragment.size / 200, fragment.size / 200);
                fragment.sprite.anchor.setTo(0.5, 0.5);
                fragment.sprite.angle = fragment.parent.angle;
                fragment.sprite.tint = colors[fragment.parent.team];
            }
        }

        fragment.check = function () {
            if (fragment != null && fragment != undefined) {
                //var posDist1, posDist2;
                if (fragment.isBroken) {
                    posDist2 = Math.sqrt((fragment.pos.x - fragment.parent.startCell.pos.x) * (fragment.pos.x - fragment.parent.startCell.pos.x)
                        + (fragment.pos.y - fragment.parent.startCell.pos.y) * (fragment.pos.y - fragment.parent.startCell.pos.y));
                    if (posDist2 < fragment.parent.startCell.size / sizeScale)
                        return false;
                    else
                        return true;
                }

                else {
                    posDist2 = Math.sqrt((fragment.pos.x - fragment.parent.endCell.pos.x) * (fragment.pos.x - fragment.parent.endCell.pos.x)
                        + (fragment.pos.y - fragment.parent.endCell.pos.y) * (fragment.pos.y - fragment.parent.endCell.pos.y));
                    posDist1 = Math.sqrt((fragment.pos.x - fragment.parent.startCell.pos.x) * (fragment.pos.x - fragment.parent.startCell.pos.x)
                        + (fragment.pos.y - fragment.parent.startCell.pos.y) * (fragment.pos.y - fragment.parent.startCell.pos.y));
                    //console.log({posDist1, posDist2});
                    if ((posDist2 < fragment.parent.endCell.size / sizeScale) || (posDist1 < fragment.parent.startCell.size / sizeScale))
                        return false;
                    else
                        return true;
                }
            }
        }

        fragment.shake = function () {

        }

        fragment.destroy = function () {
            if (fragment.visible == true)
                fragment.sprite.destroy();
            //fragment = null;
        }

        return fragment;
    }
}

var Slash = {
    createNew: function (cutPosition, tentacleAngle) {
        var slash = {};
        slash.draw = function () {
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
        slash.wipe = function () {
            slash.draw();
            slash.mask = game.add.graphics(0, 0);
            slash.mask.beginFill(0xffffff);
            var circle = slash.mask.drawCircle(slash.startPoint.x, slash.startPoint.y, 100);
            //console.log(slash.startPoint);
            //console.log(slash.endPoint);
            slash.sprite.mask = slash.mask;
            game.add.tween(circle).to({ x: slash.endPoint.x - slash.startPoint.x, y: slash.endPoint.y - slash.startPoint.y }, frameDuration / 2, Phaser.Easing.Linear.Out, true);
            setTimeout(slash.destroy, frameDuration / 2 + 20);
        }

        slash.destroy = function () {
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
        dstTentacles[tentacle.endCell.ID].push(tentacle.ID);

        deltaX = tentacle.endCell.pos.x - tentacle.startCell.pos.x;
        deltaY = tentacle.endCell.pos.y - tentacle.startCell.pos.y;
        l = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
        tentacle.pointer = Point.createNew(deltaX / l, deltaY / l);
        tentacle.angle = Math.atan2(deltaY, deltaX) * 180 / Math.PI;

        tentacle.startPoint = Point.createNew(tentacle.startCell.pos.x, tentacle.startCell.pos.y);
        // tentacle.startPoint.x += tentacle.startCell.size * Math.cos(tentacle.angle * Math.PI / 180) / 2;
        // tentacle.startPoint.y += tentacle.startCell.size * Math.sin(tentacle.angle * Math.PI / 180) / 2;
        tentacle.endPoint = Point.createNew(tentacle.startPoint.x, tentacle.startPoint.y);

        //tentacle.endPoint = tentacle.startPoint;
        tentacle.length = 0;
        tentacle.sprite = game.add.sprite(tentacle.startPoint.x, tentacle.startPoint.y, 'line');
        tentacle.sprite.anchor.setTo(0, 0.5);
        tentacle.sprite.tint = colors[tentacle.startCell.team];
        tentacle.sprite.angle = tentacle.angle;
        tentacle.sprite.scale.setTo(0, 4 / 37);

        tentacle.checkStartPos = function (newStartSize) {
            deltaX = tentacle.endCell.pos.x - tentacle.startCell.pos.x;
            deltaY = tentacle.endCell.pos.y - tentacle.startCell.pos.y;
            l = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
            dx = newStartSize * deltaX / l;
            dy = newStartSize * deltaY / l;

            tentacle.startPoint.x = tentacle.startCell.pos.x + dx / sizeScale;
            tentacle.startPoint.y = tentacle.startCell.pos.y + dy / sizeScale;

            tentacle.length = Math.sqrt((tentacle.endPoint.x - tentacle.startPoint.x)
                * (tentacle.endPoint.x - tentacle.startPoint.x)
                + (tentacle.endPoint.y - tentacle.startPoint.y)
                * (tentacle.endPoint.y - tentacle.startPoint.y));
            
            tentacle.sprite.position.x = tentacle.startPoint.x;
            tentacle.sprite.position.y = tentacle.startPoint.y;
            tentacle.sprite.scale.setTo(tentacle.length / 626, 4 / 37);

            // console.log(newStartSize);
            // console.log({ dx, dy });

            // game.add.tween(tentacle.sprite.position).to({ x: tentacle.startPoint.x, y: tentacle.startPoint.y }, frameDuration, Phaser.Easing.Linear.Out, true);
            // game.add.tween(tentacle.sprite.scale).to({ x: tentacle.length / 626 }, frameDuration, Phaser.Easing.Linear.Out, true);
        }

        tentacle.checkEndPos = function (newEndSize) {
            deltaX = - tentacle.endCell.pos.x + tentacle.startCell.pos.x;
            deltaY = - tentacle.endCell.pos.y + tentacle.startCell.pos.y;
            dx = newEndSize * deltaX / l;
            dy = newEndSize * deltaY / l;

            var endDist = Math.sqrt((tentacle.endCell.pos.x - tentacle.endPoint.x) * (tentacle.endCell.pos.x - tentacle.endPoint.x)
                + (tentacle.endCell.pos.y - tentacle.endPoint.y) * (tentacle.endCell.pos.y - tentacle.endPoint.y));
            if (endDist < newEndSize / sizeScale) {
                tentacle.endPoint.x = tentacle.endCell.pos.x + dx / sizeScale;
                tentacle.endPoint.y = tentacle.endCell.pos.y + dy / sizeScale;
            }
            console.log(tentacle.length);

            tentacle.length = Math.sqrt((tentacle.endPoint.x - tentacle.startPoint.x)
                * (tentacle.endPoint.x - tentacle.startPoint.x)
                + (tentacle.endPoint.y - tentacle.startPoint.y)
                * (tentacle.endPoint.y - tentacle.startPoint.y));
            //166 文件服务器
            //阿里云 wiki 
            //console.log(tentacle.length);

            tentacle.sprite.scale.setTo(tentacle.length / 626, 4 / 37);
            //game.add.tween(tentacle.sprite.position).to({ x: tentacle.startPoint.x, y:tentacle.startPoint.y }, frameDuration, Phaser.Easing.Linear.Out, true);
            //game.add.tween(tentacle.sprite.scale).to({ x: tentacle.length / 626 }, frameDuration, Phaser.Easing.Linear.Out, true);
        }

        tentacle.strech = function (dx, dy) {
            //var oldFragNum = tentacle.fragmentNum;
            tentacle.endPoint.x += dx;
            tentacle.endPoint.y += dy;
            //tentacle.checkEndPos();

            if (Math.sqrt((tentacle.endPoint.x - tentacle.endCell.pos.x) * (tentacle.endPoint.x - tentacle.endCell.pos.x)
                + (tentacle.endPoint.y - tentacle.endCell.pos.y) * (tentacle.endPoint.y - tentacle.endCell.pos.y)) < tentacle.endCell.size / sizeScale) {
                tentacle.endPoint.x = tentacle.endCell.pos.x - tentacle.endCell.size * Math.cos(tentacle.angle * Math.PI / 180) / 2;
                tentacle.endPoint.y = tentacle.endCell.pos.y - tentacle.endCell.size * Math.sin(tentacle.angle * Math.PI / 180) / 2;
            }
            tentacle.length = Math.sqrt((tentacle.endPoint.x - tentacle.startPoint.x)
                * (tentacle.endPoint.x - tentacle.startPoint.x)
                + (tentacle.endPoint.y - tentacle.startPoint.y)
                * (tentacle.endPoint.y - tentacle.startPoint.y));
            game.add.tween(tentacle.sprite.scale).to({ x: tentacle.length / 626 }, frameDuration - 20, Phaser.Easing.Linear.Out, true);

        }

        tentacle.shrink = function (dx, dy) {
            //var oldFragNum = tentacle.fragmentNum;
            tentacle.endPoint.x += dx;
            tentacle.endPoint.y += dy;
            if (Math.sqrt((tentacle.endPoint.x - tentacle.startCell.pos.x) * (tentacle.endPoint.x - tentacle.startCell.pos.x)
                + (tentacle.endPoint.y - tentacle.startCell.pos.y) * (tentacle.endPoint.y - tentacle.startCell.pos.y)) < tentacle.startCell.size / sizeScale) {
                tentacle.endPoint.x = tentacle.startCell.pos.x + tentacle.startCell.size * Math.cos(tentacle.angle * Math.PI / 180) / 2;
                tentacle.endPoint.y = tentacle.startCell.pos.y + tentacle.startCell.size * Math.sin(tentacle.angle * Math.PI / 180) / 2;
            }
            tentacle.length = Math.sqrt((tentacle.endPoint.x - tentacle.startPoint.x)
                * (tentacle.endPoint.x - tentacle.startPoint.x)
                + (tentacle.endPoint.y - tentacle.startPoint.y)
                * (tentacle.endPoint.y - tentacle.startPoint.y));
            game.add.tween(tentacle.sprite.scale).to({ x: tentacle.length / 626 }, frameDuration - 20, Phaser.Easing.Linear.Out, true);

        }

        tentacle.updateTransRate = function (newTransRate) {
            //draw this tentacle
            //

            tentacle.transRate = newTransRate;
            game.add.tween(tentacle.sprite.scale).to({ y: 4 / 37 }, frameDuration, Phaser.Easing.Linear.Out, true);
        }

        tentacle.cutOff = function (posX, posY) {
            // setTimeout(function() {
            //     var slash = Slash.createNew(Point.createNew(posX, posY), tentacle.angle);
            //     slash.wipe();
            // }, frameDuration / 2);

            // setTimeout(function() {
            //     tentacle.endPoint = Point.createNew(posX, posY);
            //     tentacle.length = Math.sqrt((tentacle.endPoint.x - tentacle.startPoint.x)
            //         * (tentacle.endPoint.x - tentacle.startPoint.x)
            //         + (tentacle.endPoint.y - tentacle.startPoint.y)
            //         * (tentacle.endPoint.y - tentacle.startPoint.y));
            //     tentacle.sprite.scale.x = tentacle.length / 626;
            // }, 20);

            //draw this tentacle
        }

        tentacle.destroy = function () {
            setTimeout(function () {
                tentacle.length = 0;
                tentacle.sprite.destroy();
                tentacle[id] = null;
            }, frameDuration);
        }

        return tentacle;
    }
}

var BrokenTentacle = {
    createNew: function (_id, _startPoint, endCell, _transRate, _team) {
        var brokenTentacle = {};
        brokenTentacles[_id] = brokenTentacle;
        brokenTentacle.endPoint = Point.createNew(_startPoint.x, _startPoint.y);
        brokenTentacle.ID = _id;
        brokenTentacle.team = _team;
        brokenTentacle.transRate = _transRate;
        brokenTentacle.startCell = cells[endCell];
        deltaX = - brokenTentacle.startCell.pos.x + _startPoint.x;
        deltaY = - brokenTentacle.startCell.pos.y + _startPoint.y;
        l = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
        brokenTentacle.pointer = Point.createNew(deltaX / l, deltaY / l);
        brokenTentacle.angle = Math.atan2(deltaY, deltaX) * 180 / Math.PI;
        brokenTentacle.startPoint = Point.createNew(brokenTentacle.startCell.pos.x, brokenTentacle.startCell.pos.y);
        //console.log(brokenTentacle.endPoint);

        brokenTentacle.length = Math.sqrt((brokenTentacle.endPoint.x - brokenTentacle.startPoint.x)
            * (brokenTentacle.endPoint.x - brokenTentacle.startPoint.x)
            + (brokenTentacle.endPoint.y - brokenTentacle.startPoint.y)
            * (brokenTentacle.endPoint.y - brokenTentacle.startPoint.y));


        brokenTentacle.sprite = game.add.sprite(brokenTentacle.startPoint.x, brokenTentacle.startPoint.y, 'line');
        brokenTentacle.sprite.anchor.setTo(0, 0.5);
        brokenTentacle.sprite.tint = colors[brokenTentacle.team];
        brokenTentacle.sprite.angle = brokenTentacle.angle;
        brokenTentacle.sprite.scale.setTo(brokenTentacle.length / 626, 5.2 / 37);

        brokenTentacle.draw = function () {
            // draw this brokenTentacle, nearly same as tentacle
            //

        }

        brokenTentacle.expand = function () {
            // expand the endPoint to the target cell, called when size of the target cell changes
            //
        }

        brokenTentacle.shrink = function (dx, dy) {
            brokenTentacle.endPoint.x += dx;
            brokenTentacle.endPoint.y += dy;
            if (Math.sqrt((brokenTentacle.endPoint.x - brokenTentacle.startCell.pos.x) * (brokenTentacle.endPoint.x - brokenTentacle.startCell.pos.x)
                + (brokenTentacle.endPoint.y - brokenTentacle.startCell.pos.y) * (brokenTentacle.endPoint.y - brokenTentacle.startCell.pos.y)) < brokenTentacle.startCell.size / sizeScale) {
                brokenTentacle.endPoint.x = brokenTentacle.startCell.pos.x + brokenTentacle.startCell.size * Math.cos(brokenTentacle.angle * Math.PI / 180) / 2;
                brokenTentacle.endPoint.y = brokenTentacle.startCell.pos.y + brokenTentacle.startCell.size * Math.sin(brokenTentacle.angle * Math.PI / 180) / 2;
            }
            brokenTentacle.length = Math.sqrt((brokenTentacle.endPoint.x - brokenTentacle.startPoint.x)
                * (brokenTentacle.endPoint.x - brokenTentacle.startPoint.x)
                + (brokenTentacle.endPoint.y - brokenTentacle.startPoint.y)
                * (brokenTentacle.endPoint.y - brokenTentacle.startPoint.y));

            game.add.tween(brokenTentacle.sprite.scale).to({ x: brokenTentacle.length / 626 }, frameDuration - 20, Phaser.Easing.Linear.Out, true);
        }

        brokenTentacle.destroy = function () {
            setTimeout(function () {
                brokenTentacle.length = 0;
                brokenTentacle.sprite.destroy();
                brokenTentacles[brokenTentacle.ID] = null;
            }, frameDuration);
        }

        return brokenTentacle;
    }
}  
