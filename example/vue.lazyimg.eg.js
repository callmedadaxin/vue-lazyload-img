/**
 * Vue lazyload img plugin
 * especially optimized for mobile browsers
 * support umd(https://github.com/umdjs/umd)
 * capable of require.js, sea.js, CommonJS
 * @author: JALBAA
 * @email: 116682877@qq.com
 */
(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(['exports', 'Vue'], factory);
    } else if (typeof exports === 'object' && typeof exports.nodeName !== 'string') {
        // CommonJS
        factory(exports, require('Vue'));
    } else {
        // Browser globals
        factory(({}), root.Vue);
    }
}(this, function (exports, Vue) {

    Vue.lazyimg ={
        install: function(Vue,options){
            //custom scrollEnd event
            if(options.speed){
                var cntr = 0
                var lastCntr = 0
                var diff = 0
                var scrollEnd = document.createEvent('HTMLEvents');
                scrollEnd.initEvent('scrollEnd')
                scrollEnd.eventType = 'message'
                function enterFrame(){
                    if(cntr != lastCntr){
                        diff++
                        if(diff == 5){
                            window.dispatchEvent(scrollEnd)
                            cntr = lastCntr
                        }
                    }
                    requestAnimationFrame(enterFrame);
                }
                window.requestAnimationFrame(enterFrame)
                document.addEventListener('scroll',function(){
                    lastCntr = cntr
                    diff = 0
                    cntr++
                },true)
            }
            //compute scroll speed
            var lastPosY = document.children[0].getBoundingClientRect().top
            var lastPosX = document.children[0].getBoundingClientRect().left
            var lastSpeeds = []
            var aveSpeed = 0
            function getSpeed(el){
                var curPosY = el.getBoundingClientRect().top
                var curPosX = el.getBoundingClientRect().left
                var speedY = lastPosY - curPosY
                var speedX = lastPosX - curPosX
                if(lastSpeeds.length<10){
                    lastSpeeds.push((speedY+speedX)/2)
                }else{
                    lastSpeeds.shift()
                    lastSpeeds.push((speedY+speedX)/2)
                }
                var sumSpeed = 0
                lastSpeeds.forEach(function(speed){
                    sumSpeed += speed
                })
                aveSpeed = Math.abs(sumSpeed/lastSpeeds.length)
                lastPosY = curPosY
                lastPosX = curPosX
            }
            document.addEventListener('scroll',function(e){
                if(options.speed)
                    getSpeed(e.target.children[0])
            },true)

            //vue directive update
            function update(value){
                var isFadeIn = this.modifiers.fadein || options.fadein
                var isNoHori = this.modifiers.nohori || options.nohori
                if(isFadeIn){
                    this.el.style.opacity = 0;
                    this.el.style.transition = 'opacity .3s';
                    this.el.style.webkitTransition = 'opacity .3s';
                }
                var compute = function(){
                    var rect = this.el.getBoundingClientRect();
                    var vpWidth = document.children[0].clientWidth
                    var vpHeight = document.children[0].clientHeight
                    var loadImg = function(){
                        var self = this
                        setTimeout(function(){
                            self.el.src = value
                            self.el.addEventListener('load',onloadEnd)
                            window.removeEventListener('scrollEnd',compute,true)
                            window.removeEventListener('scroll',computeBySpeed,true)
                            lastSpeeds = []
                        },1000)
                    }.bind(this)
                    if(this.el.src == value)return
                    if(isNoHori){
                        if(rect.bottom >=0 && rect.top <= vpHeight){
                            loadImg()
                        }
                    }else if(rect.bottom >=0 && rect.top <= vpHeight
                            && rect.right >= 0 && rect.left <= vpWidth){
                        loadImg()
                    }
                }.bind(this)
                var computeBySpeed = function(){
                    if(options.speed && aveSpeed > options.speed)return
                    compute()
                }.bind(this)
                var onload = function(){
                    compute();
                    this.el.removeEventListener('load',onload)
                    window.addEventListener('scrollEnd',compute,true)
                    window.addEventListener('scroll',computeBySpeed,true)
                }.bind(this)
                var onloadEnd = function(){
                    if(isFadeIn)
                        this.el.style.opacity = 1;
                    this.el.removeEventListener('load',onloadEnd)
                }.bind(this)
                this.el.addEventListener('load',onload)
            }
            Vue.directive('lazyload',update)
        }
    }
}));
