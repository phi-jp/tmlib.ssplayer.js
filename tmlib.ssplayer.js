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
            var imageList = new SsImageList(d.images, this.imagesPath, true);
            var animation = new SsAnimation(d.animation, imageList);
            this.animations[i] = {
                animation: animation,
                name: d.name,
            };
        }, this);

        this.sprite = new SsSprite(this.animations[this.animationIndex].animation);
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










