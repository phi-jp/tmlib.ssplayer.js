/*
 *
 */


tm.define("tm.ssplayer.Element", {
    superClass: "tm.display.Sprite",

    init: function(data, imagesPath) {
        this.superInit();

        this._reset(data, imagesPath);


        this.on("enterframe", function(e) {
            var app = e.app;

            this.frame+=app.deltaTime;


            // this.sprite.x = this.x;
            // this.sprite.y = this.y;
            // this.sprite.scaleX = this.scaleX;
            // this.sprite.scaleY = this.scaleY;
        });
    },

    _reset: function(data, imagesPath) {
        if (typeof data == 'string') {
            json = tm.asset.Manager.get(data);
        }

        this.json = json;
        this.imagesPath = imagesPath;
        this.frame = 0;

        this.animations = [];
        this.animationIndex = 0;
        this._setup();
    },

    _setup: function() {
        var data = this.json.data;

        if (!(data instanceof Array)) {
            data = [data];
        }

        data.each(function(d, i) {
            var images = this._loadImages(this.imagesPath, d.images);

            var animation = new SsAnimation(d.animation, images);
            this.animations[i] = {
                animation: animation,
                name: d.name,
            };
        }, this);

        this.sprite = new SsSprite(this.animations[this.animationIndex].animation);
        this.setLoop(false);
        this.sprite.setEndCallBack(function() {
            this.flare("finish");
        }.bind(this));
    },

    _loadImages: function(path, images) {
        var assets = {};
        var newImages = [];

        images.each(function(imagename, i) {
            var path = newImages[i] = this.imagesPath + imagename;
            if (tm.asset.Manager.contains(path)) {
                return ;
            }
            
            assets[path] = path;
        }, this);

        // if (Object.keys(assets).length <= 0) {
        //     console.log("hoge");
        //     return ;
        // }

        if (Object.keys(assets).length > 0) {
            var loader = tm.asset.Loader();
            loader.load(assets);
        }
        // loader.onload = function() {
        //     console.log("finish!");
        // };

        return newImages;
    },

    setLoop: function(flag) {
        if (flag == true) {
            this.sprite.setLoop(0);
        }
        else {
            this.sprite.setLoop(1);
        }
    },

    setAnimation: function(i) {
        this.animationIndex = i;
        var animation = this.animations.at(this.animationIndex);

        if (animation) {
            this.sprite.setAnimation(animation.animation);
        }
    },

    setNextAnimation: function() {
        this.setAnimation(this.animationIndex+1);
    },

    setAnimationByName: function(name) {
        var target = null;
        this.animations.some(function(animation, i) {
            if (animation.name === name) {
                debugger;
                this.setAnimation(i);
                return true;
            }
        }, this);
    },

    draw :function(canvas) {
        this.sprite.draw(canvas.context, this.frame);
    },
});



;(function() {


////////////////////////////////////////////////////////////
// SsPartState
////////////////////////////////////////////////////////////

function SsPartState(name) {

    // パーツ名
    // Parts name.
    this.name = name;
    // 現在の描画Xポジション
    // Current x position at drawing.
    this.x = 0;
    // 現在の描画Yポジション
    // Current x position at drawing.
    this.y = 0;
}


////////////////////////////////////////////////////////////
// SsAnimation
////////////////////////////////////////////////////////////

var SsAnimation = window.SsAnimation = function(ssaData, images) {

    this.ssaData = ssaData;
    this.images = images;

    this.partsMap = new Array();
    this.parts = ssaData.parts;
    for (var i = 0; i < this.parts.length; i++) {
        this.partsMap[this.parts[i]] = i;
    }
}

// このアニメーションのFPS
// This animation FPS.
SsAnimation.prototype.getFPS = function () {
    return this.ssaData.fps;
}

// トータルフレーム数を返す
// Get total frame count.
SsAnimation.prototype.getFrameCount = function () {
    return this.ssaData.ssa.length;
}

// パーツリストを返す
// Get parts list.
SsAnimation.prototype.getParts = function () {
    return this.ssaData.parts;
}

// パーツ名からNoを取得するマップを返す
// Return the map, to get the parts from number.
SsAnimation.prototype.getPartsMap = function () {
    return this.partsMap;
}

// 描画メソッド
// Draw method.
SsAnimation.prototype.drawFunc = function (ctx, frameNo, x, y, flipH, flipV, partStates, scale) {

    var iPartNo = 0;
    var iImageNo = 1;
    var iSouX = 2;
    var iSouY = 3;
    var iSouW = 4;
    var iSouH = 5;
    var iDstX = 6;
    var iDstY = 7;
    var iDstAngle = 8;
    var iDstScaleX = 9;
    var iDstScaleY = 10;
    var iOrgX = 11;
    var iOrgY = 12;
    var iFlipH = 13;
    var iFlipV = 14;
    var iAlpha = 15;
    var iBlend = 16;

    var blendOperations = new Array(
        "source-over",
        "source-over",
        "lighter",
        "source-over"
    );

    var frameData = this.ssaData.ssa[frameNo];

    for (var refNo = 0; refNo < frameData.length; refNo++) {

        var partData = frameData[refNo];
        var partDataLen = partData.length;

        var partNo = partData[iPartNo];
        var imageName = this.images[partData[iImageNo]];
        var img = tm.asset.Manager.get(imageName);
        var sx = partData[iSouX];
        var sy = partData[iSouY];
        var sw = partData[iSouW];
        var sh = partData[iSouH];
        var dx = partData[iDstX];
        var dy = partData[iDstY];

        var vdw = sw;
        var vdh = sh;

        // dx += x;
        // dy += y;

        if (sw > 0 && sh > 0) {

            var dang = partData[iDstAngle];
            var scaleX = partData[iDstScaleX];
            var scaleY = partData[iDstScaleY];

            var ox = (partDataLen > iOrgX) ? partData[iOrgX] : 0;
            var oy = (partDataLen > iOrgY) ? partData[iOrgY] : 0;
            var fh = (partDataLen > iFlipH) ? (partData[iFlipH] != 0 ? -1 : 1) : (1);
            var fv = (partDataLen > iFlipV) ? (partData[iFlipV] != 0 ? -1 : 1) : (1);
            var alpha = (partDataLen > iAlpha) ? partData[iAlpha] : 1.0;
            var blend = (partDataLen > iBlend) ? partData[iBlend] : 0;

            ctx.globalCompositeOperation = blendOperations[blend];
            ctx.globalAlpha = alpha;

            ctx.save();

            ctx.translate(dx, dy);

            ctx.rotate(-dang);
            ctx.scale(scaleX, scaleY);
            ctx.translate(-ox + vdw / 2, -oy + vdh / 2);    // パーツの原点へ. To the origin of the parts.
            ctx.scale(fh, fv);                              // パーツの中心点でフリップ. Flip at the center point of the parts.

            // check
            //
            //      console.log(sx, sy, sw, sh);
            //      sw = (sx + sw < img.width) ? sw : img.width - sx;
            //      sh = (sy + sh < img.height) ? sh : img.height - sy;
            //      sw = (sw < 0) ? 0 : sw;
            //      sh = (sh < 0) ? 0 : sh;
            //      sx = (sx < 0) ? 0 : sx;
            //      sy = (sy < 0) ? 0 : sy;
            //      console.log(sx, sy, sw, sh);

            ctx.drawImage(img.element, sx, sy, sw, sh, -vdw / 2, -vdh / 2, vdw, vdh);
            ctx.restore();
        }

        var state = partStates[partNo];
        state.x = dx;
        state.y = dy;
    }
}


////////////////////////////////////////////////////////////
// SsSprite
////////////////////////////////////////////////////////////

var SsSprite = window.SsSprite = function(animation) {

    // プライベート変数
    // Private variables.
    this.inner = {
        animation: animation,
        playingFrame: 0,
        prevDrawnTime: 0,
        step: 1,
        loop: 0,
        loopCount: 0,
        endCallBack: null,    // draw end callback

        partStates: null,
        initPartStates: function () {
            this.partStates = null;
            if (this.animation != null) {
                var parts = this.animation.getParts();
                var states = new Array();
                for (var i = 0; i < parts.length; i++) {
                    states.push(new SsPartState(parts[i]));
                }
                this.partStates = states;
            }
        }
    };

    this.inner.initPartStates();
}

// 描画Xポジション
// X position at drawing.
SsSprite.prototype.x = 0;

// 描画Yポジション
// Y position at drawing
SsSprite.prototype.y = 0;

// ※未実装
// *Not implemented.
SsSprite.prototype.flipH = false;
SsSprite.prototype.flipV = false;

// scale
SsSprite.prototype.scale = 1.0;

// アニメーションの設定
// Set animation.
SsSprite.prototype.setAnimation = function (animation) {
    this.inner.animation = animation;
    this.inner.initPartStates();
    this.inner.playingFrame = 0;
    this.inner.prevDrawnTime = 0;
    this.clearLoopCount();
}

// アニメーションの取得
// Get animation.
SsSprite.prototype.getAnimation = function () {
    return this.inner.animation;
}

// 再生フレームNoを設定
// Set frame no of playing.
SsSprite.prototype.setFrameNo = function (frameNo) {
    this.inner.playingFrame = frameNo;
    this.inner.prevDrawnTime = 0;
}

// 再生フレームNoを取得
// Get frame no of playing.
SsSprite.prototype.getFrameNo = function () {
    return this.inner.playingFrame >> 0;
}

// 再生スピードを設定 (1:標準)
// Set speed to play. (1:normal speed)
SsSprite.prototype.setStep = function (step) {
    this.inner.step = step;
}

// 再生スピードを取得
// Get speed to play. (1:normal speed)
SsSprite.prototype.getStep = function () {
    return this.inner.step;
}

// ループ回数の設定 (0:無限)
// Set a playback loop count.  (0:infinite)
SsSprite.prototype.setLoop = function (loop) {
    if (loop < 0) return;
    this.inner.loop = loop;
}

// ループ回数の設定を取得
// Get a playback loop count of specified. (0:infinite)
SsSprite.prototype.getLoop = function () {
    return this.inner.loop;
}

// 現在の再生回数を取得
// Get repeat count a playback.
SsSprite.prototype.getLoopCount = function () {
    return this.inner.loopCount;
}

// 現在の再生回数をクリア
// Clear repeat count a playback.
SsSprite.prototype.clearLoopCount = function () {
    this.inner.loopCount = 0;
}

// アニメーション終了時のコールバックを設定
// Set the call back at the end of animation.
SsSprite.prototype.setEndCallBack = function (func) {
    this.inner.endCallBack = func;
}

// パーツの状態（現在のX,Y座標など）を取得
// Gets the state of the parts. (Current x and y positions)
SsSprite.prototype.getPartState = function (name) {
    if (this.inner.partStates == null) return null;

    var partsMap = this.inner.animation.getPartsMap();
    var partNo = partsMap[name];
    if (partNo == null) return null;
    return this.inner.partStates[partNo];
}

// 描画実行
// Drawing method.
SsSprite.prototype.draw = function (ctx, currentTime) {

    if (this.inner.animation == null) return;

    if (this.inner.loop == 0 || this.inner.loop > this.inner.loopCount) {
        // フレームを進める
        // To next frame.
        if (this.inner.prevDrawnTime > 0) {

            var s = (currentTime - this.inner.prevDrawnTime) / (1000 / this.inner.animation.getFPS());
            this.inner.playingFrame += s * this.inner.step;

            var c = (this.inner.playingFrame / this.inner.animation.getFrameCount()) >> 0;

            if (this.inner.step >= 0) {
                if (this.inner.playingFrame >= this.inner.animation.getFrameCount()) {
                    // ループ回数更新
                    // Update repeat count.
                    this.inner.loopCount += c;
                    if (this.inner.loop == 0 || this.inner.loopCount < this.inner.loop) {
                        // フレーム番号更新、再生を続ける
                        // Update frame no, and playing.
                        this.inner.playingFrame %= this.inner.animation.getFrameCount();
                    }
                    else {
                        // 再生停止、最終フレームへ
                        // Stop animation, to last frame.
                        this.inner.playingFrame = this.inner.animation.getFrameCount() - 1;
                        // 停止時コールバック呼び出し
                        // Call finished callback.
                        if (this.inner.endCallBack != null) {
                            this.inner.endCallBack();
                        }
                    }
                }
            }
            else {
                if (this.inner.playingFrame < 0) {
                    // ループ回数更新
                    // Update repeat count.
                    this.inner.loopCount += 1 + -c;
                    if (this.inner.loop == 0 || this.inner.loopCount < this.inner.loop) {
                        // フレーム番号更新、再生を続ける
                        // Update frame no, and playing.
                        this.inner.playingFrame %= this.inner.animation.getFrameCount();
                        if (this.inner.playingFrame < 0) this.inner.playingFrame += this.inner.animation.getFrameCount();
                    }
                    else {
                        // 再生停止、先頭フレームへ
                        // Stop animation, to first frame.
                        this.inner.playingFrame = 0;
                        // 停止時コールバック呼び出し
                        // Call finished callback.
                        if (this.inner.endCallBack != null) {
                            this.inner.endCallBack();
                        }
                    }
                }
            }

        }
    }
    //else {
    //  // 再生停止
    //  // Stop animation.
    //  this.inner.playingFrame = 0;
    //}

    this.inner.prevDrawnTime = currentTime;

    this.inner.animation.drawFunc(ctx, this.getFrameNo(), this.x, this.y, this.flipH, this.flipV, this.inner.partStates, this.scale);
}


})();






