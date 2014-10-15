

tm.define("tm.ssplayer.Element", {
    superClass: "tm.display.Sprite",

    init: function(data, imagesPath) {
        this.superInit();

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
        this.sprite.setAnimation(this.animations[this.animationIndex].animation);
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

    update :function(app) {
        this.frame+=33;

        this.sprite.x = this.x;
        this.sprite.y = this.y;
    },

    draw :function(canvas) {
        canvas.save();
        canvas.translate(this.x, this.y);
        this.sprite.draw(canvas.context, this.frame);
        canvas.restore();
    },
});