/*:
 * @target MZ
 * @plugindesc UI核心
 * @author Limpid
 * -----------------------------------------------------------------------------
 * @help
 * 使用 MIT 许可证发布。
 * 
 * ui系统依赖代码
 */
var LIM = LIM || {};
LIM.UTILS=LIM.UTILS||{};
((_)=>{
    _.sinNum=function(max,i){return Math.sin(Math.PI/2/max*i).toFixed(7)}
    _.lengthNum=function(num){
        try {
            if(isNaN(num))
            {
                if(num.split("w").length>1) {
                    let arr = num.split("w")
                    let a = parseFloat(arr[0]) * 0.01 * Graphics.width
                    let b = arr[1] ? parseFloat(arr[1]) : 0
                    return a + b
                }
                else if(num.split("h").length>1) {
                    let arr = num.split("h")
                    let a = parseFloat(arr[0]) * 0.01 * Graphics.height
                    let b = arr[1] ? parseFloat(arr[1]) : 0
                    return a + b
                }
                else return 0
            }
            else return parseFloat(num)
        }
        catch (e) {
            return 0
        }
    }
    _.rpgaReduce=function(r,g,b,a){
        return _.radixNum(Math.min(r,255),10,16)+
            _.radixNum(Math.min(g,255),10,16)+
            _.radixNum(Math.min(b,255),10,16)+
            _.radixNum(Math.min(a,255),10,16)
    }
    _.radixNum = function (num, m, n) {
        num=typeof(num)==='string' ?num:String(num)
        const _DEFAULT_={initNum:10}
        m=m===0?_DEFAULT_.initNum:m
        n=n===0?_DEFAULT_.initNum:n
        n=m&&!n?_DEFAULT_.initNum:n;
        return parseInt(num,m).toString(n)
    }
    _.atBit=function(num,bit){return num>>bit&1}
    _.setBit=function(num,bit,bool) {
        if (bool) return num | (1 << bit);
    }
    _.sortBy=function(property,desc){
        return function (v1,v2) {return (v2[property]>v1[property]?1:-1)*(desc?1:-1)}
    }
    _.union=function(arr1,arr2) {return [...new Set([...arr1, ...arr2])]}
    _.inter=function(arr1,arr2) {return new Set([...arr1].filter(x=>arr2.has(x)))}
    _.diff=function(arr1,arr2) {return new Set([...arr1].filter(x=>!arr2.has(x)))}
})(LIM.UTILS);
//三种新blt
Bitmap.prototype.roundedBlt = function(source,radius, sx, sy, sw, sh, dx, dy, dw, dh) {
    dw = dw || sw;
    dh = dh || sh;
    try {
        const image = source._canvas || source._image;
        this.context.save();
        this.context.beginPath();
        this.context.moveTo(dx + radius, dy);
        this.context.arcTo(dx + dw, dy, dx + dw, dy + dh, radius);
        this.context.arcTo(dx + dw, dy + dh, dx, dy + dh, radius);
        this.context.arcTo(dx, dy + dh, dx, dy, radius);
        this.context.arcTo(dx, dy, dx + dw, dy, radius);
        this.context.closePath();
        this.context.clip();
        this.context.globalCompositeOperation = "source-over";
        this.context.drawImage(image, sx, sy, sw, sh, dx, dy, dw, dh);
        this.context.restore();
        this._baseTexture.update();
    }
    catch (e) {

    }
};
Bitmap.prototype.circularBlt = function(source, sx, sy, sw, sh, dx, dy, dw, dh) {
    dw = dw || sw;
    dh = dh || sh;
    try {
        const image = source._canvas || source._image;
        this.context.save();
        this.context.beginPath();
        const radius = Math.min(dw, dh) / 2;
        const centerX = dx + dw / 2;
        const centerY = dy + dh / 2;
        this.context.arc(centerX, centerY, radius, 0, Math.PI * 2);
        this.context.closePath();
        this.context.clip();
        this.context.globalCompositeOperation = "source-over";
        this.context.drawImage(image, sx, sy, sw, sh, dx, dy, dw, dh);
        this.context.restore();
        this._baseTexture.update();
    }
    catch (e) {}
};
Bitmap.prototype.diamondBlt = function(source, sx, sy, sw, sh, dx, dy, dw, dh) {
    dw = dw || sw;
    dh = dh || sh;
    try {
        const image = source._canvas || source._image;
        this.context.beginPath();
        this.context.moveTo(dx + dw / 2, dy); 
        this.context.lineTo(dx + dw, dy + dh / 2); 
        this.context.lineTo(dx + dw / 2, dy + dh); 
        this.context.lineTo(dx, dy + dh / 2); 
        this.context.closePath();
        this.context.clip();
        this.context.globalCompositeOperation = "source-over";
        this.context.drawImage(image, sx, sy, sw, sh, dx, dy, dw, dh);
        this._baseTexture.update();
        this.context.restore();
    } catch (e) {}
};

//清空圆角矩形
Bitmap.prototype.clearRoundRect = function(x, y, width, height, radius) {
    const context = this.context;
    const x0 = x;
    const y0 = y;
    const x1 = x + width;
    const y1 = y + height;
    context.beginPath();
    context.moveTo(x0 + radius, y0);
    context.arcTo(x1, y0, x1, y1, radius);
    context.arcTo(x1, y1, x0, y1, radius);
    context.arcTo(x0, y1, x0, y0, radius);
    context.arcTo(x0, y0, x1, y0, radius);
    context.closePath();
    context.save();
    context.clip();
    context.clearRect(x, y, width, height);
    context.restore();
};
Bitmap.prototype.clearCircle = function(x, y, radius) {
    const context = this.context;
    context.save();
    context.beginPath();
    context.arc(x, y, radius, 0, Math.PI * 2, true);
    context.clip();
    context.clearRect(x - radius, y - radius, radius * 2, radius * 2);
    context.restore();
};
Bitmap.prototype.clearOutsideCircles = function(circles) {
    this.context.save();
    this.context.beginPath();
    circles.forEach(circle => {
        const { x, y, radius } = circle;
        this.context.arc(x, y, radius, 0, Math.PI * 2, true);
    });
    this.context.rect(0, 0, this.width, this.height);
    this.context.clip("evenodd");
    this.context.clearRect(0, 0, this.width, this.height);
    this.context.restore();
};
//画线
Bitmap.prototype.drawLine=function (x1, y1, x2, y2, color, lineWidth) {

    const context = this.context;
    context.save();
    context.strokeStyle = color;
    context.lineWidth = lineWidth;
    context.beginPath();
    context.moveTo(x1, y1);
    context.lineTo(x2, y2);
    context.stroke();
    context.restore();
}
Bitmap.prototype.drawArc=function (x1, y1, x2, y2, color, lineWidth) {

    const context = this.context;
    context.save();
    context.strokeStyle = color;
    context.lineWidth = lineWidth;
    context.beginPath();
    const centerX = (x1 + x2) / 2;
    const centerY = (y1 + y2) / 2;
    const radius = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2)) / 2;
    const startAngle = Math.atan2(y1 - centerY, x1 - centerX);
    const endAngle = Math.atan2(y2 - centerY, x2 - centerX);
    context.arc(centerX, centerY, radius, startAngle, endAngle);
    context.stroke();
    context.restore();
}
Bitmap.prototype.drawCurve=function (x1,y1,x2,y2, color, lineWidth) {

    const context = this.context;
    context.save();
    context.strokeStyle = color;
    context.lineWidth = lineWidth;
    context.beginPath();
    context.moveTo(x1, y1);
    context.quadraticCurveTo(x1 + (x2 - x1) / 2, y1, x2, y2);
    context.stroke();
    context.restore();
}

Bitmap.prototype.fillRoundedRect = function(x, y, width, height, radius,color) {
    const context = this.context;
    const cornerRadius = Math.min(Math.min(width, height) / 2, radius);
    context.save();
    context.fillStyle = color;
    context.beginPath();
    context.moveTo(x + cornerRadius, y);
    context.lineTo(x + width - cornerRadius, y);
    context.arcTo(x + width, y, x + width, y + cornerRadius, cornerRadius);
    context.lineTo(x + width, y + height - cornerRadius);
    context.arcTo(x + width, y + height, x + width - cornerRadius, y + height, cornerRadius);
    context.lineTo(x + cornerRadius, y + height);
    context.arcTo(x, y + height, x, y + height - cornerRadius, cornerRadius);
    context.lineTo(x, y + cornerRadius);
    context.arcTo(x, y, x + cornerRadius, y, cornerRadius);
    context.closePath();
    context.fill();
    context.restore();
    this._baseTexture.update();
};
Bitmap.prototype.strokeRoundedRect = function(x, y, width, height, radius, color, lineWidth) {
    this.fillRoundedRect(x, y, width, height, radius, color)
    this.clearRoundRect(lineWidth,lineWidth,width-lineWidth*2,height-lineWidth*2,radius)
};
Bitmap.prototype.gradientRoundedRect = function(x, y, width, height, radius, color1, color2, vertical) {
    const context = this.context;
    const cornerRadius = Math.min(Math.min(width, height) / 2, radius);
    const grad = context.createLinearGradient(x, y, x + (vertical ? 0 : width), y + (vertical ? height : 0));
    grad.addColorStop(0, color1);
    grad.addColorStop(1, color2);
    context.save();
    context.fillStyle = grad;
    context.beginPath();
    context.moveTo(x + cornerRadius, y);
    context.lineTo(x + width - cornerRadius, y);
    context.arcTo(x + width, y, x + width, y + cornerRadius, cornerRadius);
    context.lineTo(x + width, y + height - cornerRadius);
    context.arcTo(x + width, y + height, x + width - cornerRadius, y + height, cornerRadius);
    context.lineTo(x + cornerRadius, y + height);
    context.arcTo(x, y + height, x, y + height - cornerRadius, cornerRadius);
    context.lineTo(x, y + cornerRadius);
    context.arcTo(x, y, x + cornerRadius, y, cornerRadius);
    context.closePath();
    context.fill();
    context.restore();
    this._baseTexture.update();
};


Bitmap.prototype.drawTriangle = function(x1, y1, x2, y2, x3, y3, color) {
    
    const context = this.context;
    context.save();
    context.fillStyle = color;
    context.beginPath();
    context.moveTo(x1, y1);
    context.lineTo(x2, y2);
    context.lineTo(x3, y3);
    context.closePath();
    context.fill();
    context.restore();
    this._baseTexture.update();
};
Bitmap.prototype.drawCircle = function(x, y, radius, color,borderColor,lineWidth) {
    
    const context = this.context;
    context.save();
    context.fillStyle = color;
    context.lineWidth = lineWidth||0;
    context.strokeStyle = borderColor || color;
    context.beginPath();
    context.arc(x, y, radius, 0, Math.PI * 2, false);
    context.fill();
    if(lineWidth) context.stroke();
    context.restore();
    this._baseTexture.update();
};
Bitmap.prototype.drawSector = function(x, y, radius, startAngleDegree, endAngleDegree, color, borderColor, lineWidth) {
    
    const context = this.context;
    context.save();
    context.fillStyle = color;
    context.lineWidth = lineWidth || 0;
    context.strokeStyle = borderColor || color;
    context.beginPath();
    const startAngle = startAngleDegree * Math.PI / 180;
    const endAngle = (startAngleDegree+endAngleDegree) * Math.PI / 180;
    context.moveTo(x, y);
    context.arc(x, y, radius, startAngle, endAngle, false);
    context.lineTo(x, y);
    context.fill();
    if (lineWidth) context.stroke();
    context.restore();
    this._baseTexture.update();
};
Bitmap.prototype.drawPolygon = function(points, color, borderColor, lineWidth) {
    
    const context = this.context;
    context.save();
    context.fillStyle = color;
    context.lineWidth = lineWidth || 0;
    context.strokeStyle = borderColor || color;
    context.beginPath();
    context.moveTo(points[0][0], points[0][1]);
    for (let i = 1; i < points.length; i++) {
        context.lineTo(points[i][0], points[i][1]);
    }
    context.closePath();
    context.fill();
    if (lineWidth) context.stroke();
    context.restore();
    this._baseTexture.update();
};
Bitmap.prototype.drawRegularPolygon = function(x, y,side, size, color,borderColor,lineWidth) {
    
    const context = this.context;
    context.save();
    context.fillStyle = color;
    context.lineWidth = lineWidth||0;
    context.strokeStyle = borderColor || color;
    context.beginPath();
    for (let i = 0; i < side; i++) {
        const angleRad = Math.PI /(side/2) * i+22.5;
        const xx = x + size * Math.cos(angleRad);
        const yy = y + size * Math.sin(angleRad);
        if (i === 0) {
            context.moveTo(xx, yy);
        } else {
            context.lineTo(xx, yy);
        }
    }
    context.closePath();
    if(lineWidth) context.stroke();
    context.fill();
    context.restore();
    this._baseTexture.update();
};
Bitmap.prototype.drawStar = function(x, y,side, size,color,borderColor,lineWidth) {
    
    const context = this.context;
    const innerRadius = size / 2;
    const outerRadius = size;
    const numPoints = side;
    const angle = Math.PI / numPoints;
    context.save();
    context.beginPath();
    context.translate(x, y);
    context.moveTo(0, -outerRadius);
    for (let i = 0; i < numPoints * 2; i++) {
        const radius = i % 2 === 0 ? outerRadius : innerRadius;
        const currentAngle = angle * i;
        const xCoordinate = radius * Math.sin(currentAngle);
        const yCoordinate = radius * -Math.cos(currentAngle);
        context.lineTo(xCoordinate, yCoordinate);
    }
    context.closePath();
    context.fillStyle = color;
    context.lineWidth = lineWidth||0;
    context.strokeStyle = borderColor || color;
    if(lineWidth) context.stroke();
    context.fill();
    context.restore();
    this._baseTexture.update();
};
Bitmap.prototype.drawRing = function(x, y, innerRadius, outerRadius, color, borderColor, lineWidth) {
    
    const context = this.context;
    context.save();
    context.fillStyle = color;
    context.strokeStyle = borderColor || color;
    context.lineWidth = lineWidth || 0;
    context.beginPath();
    context.arc(x, y, outerRadius, 0, Math.PI * 2, false);
    context.arc(x, y, innerRadius, 0, Math.PI * 2, true); // 内部圆弧
    context.closePath();
    if (lineWidth) context.stroke();
    context.fill(); // 填充颜色
    context.restore();
    this._baseTexture.update();
};


Sprite.prototype.getTotalValue = function(propertyName) {
    let total = this[propertyName];
    for (let current = this; current && current.parent && current.parent[propertyName]; current = current.parent) {
        total += current.parent[propertyName];
    }
    return total;
}
Sprite.prototype.getX = function() {return this.getTotalValue('x')}
Sprite.prototype.getY = function() {return this.getTotalValue('y')}
function Weaver() {
    this.initialize.apply(this, arguments);
}
Weaver.prototype = Object.create(Sprite.prototype);
Weaver.prototype.constructor = Weaver;
Weaver.prototype.initialize = function (orgin) {
    Sprite.prototype.initialize.call(this)
    this.alpha =0
    this._orgin=orgin
    this._load = 0
    this._mod = -1
    this._stack = []
    this._mode = 0
    this.install()
    this.hatch()
    this.stateStore()
}
Weaver.prototype.install = function (){
    this._window={}
}
Weaver.prototype.stateStore=function (){
    this._state={}
}
Weaver.prototype.modify=function (mode,bool){
    if(this._state[mode]&&this._mod!==mode){
        if(!bool) this._stack.push(this._mod)
        this._mod=mode
        for(let name of Object.keys(this._state[mode])){
            if(this._state[mode][name][0]) this._window[name].start()
            else this._window[name].stop()
            if(this._state[mode][name][1]) this._window[name].show()
            else this._window[name].hide()
        }
    }
}
Weaver.prototype.update=function (){
    if(this._load) return
    switch (this._mode){
        case 0: this.execute();break
        case 1:
            this.loop()
            for (const child of this.children) {
                if (child.update) {
                    child.update();
                }
            }
    }
}
Weaver.prototype.loop=function () {}
Weaver.prototype.execute = function() {
    this._mode =1
    this.alpha=1
    for(let key in this._window)
        this._window[key].execute()
}
Weaver.prototype.hatch=function (){
    for (let key in this._window){
        let item=this._window[key]
        for(let img in item.img)
            item.loadBit(img,item.img[img])
    }
    this._orgin.addChild(this)
}
Weaver.prototype.death=function (){
    const children=this._orgin.children
    for(let i=0;i<children.length;i++){
        if(children[i]===this){
            children.splice(i,1)
            break
        }
    }
    for(let key of Object.keys(this._window)) this._window[key].destroy()
    this.removeChildren()
    this.destroy()
}
Weaver.prototype.prevMod=function (){
    if(this._stack.length) {
        return this._stack.pop()
    }
    else
        return -1
}
////
function Cotton() {
    this.initialize.apply(this, arguments);
}
Cotton.prototype = Object.create(Sprite.prototype);
Cotton.prototype.constructor = Cotton;
Cotton.prototype.initialize = function (orgin) {
    Sprite.prototype.initialize.call(this)
    this._orgin=orgin
    this._bit = {"n":new Bitmap(1,1)}
    this._delay = 0
    this._wheelTime = 0
    this._wheelInter= 25
    this._stop = true
    this._input=[]
    this._animationSprites = [];
    this.initImage()
};
Cotton.prototype.execute = function () {
    this.threshold = 20
    this._page = 0
    this._note = {}
    this._sprite= []
    this._expel= new Set()
    this.run = new Runflow(this)
    this.adorn = new Adorn(this)
    this.initWork()
    this.initAdorn()
    this.drawAdorn()
    this.initHandler()
    this._orgin.addChild(this)
}

Cotton.prototype.initImage = function() {this.img={}}
Cotton.prototype.delay=function (val){this._delay=val}
Cotton.prototype.stop=function (){this._stop=true}
Cotton.prototype.start=function (){this._stop=false}

Cotton.prototype.initHandler=function (){}
Cotton.prototype.setInput=function (arr){this._input = this._input.concat(arr);}

Cotton.prototype.initWork=function (){}
Cotton.prototype.setRun=function (key,init,cond,done){this.run.set(key,init,cond,done)}
Cotton.prototype.work=function (work){this.run.install(work)}
Cotton.prototype.initAdorn=function (){}
Cotton.prototype.setAdorn=function (key,bit,handler,data,w,h,x,y,cover,adso,alpha,rota){
    this.adorn.set(key,bit,handler,data,w,h,x,y,cover,adso,alpha,rota)
}
Cotton.prototype.setData=function (key,k,v){this.adorn.setData(key,k,v)}
Cotton.prototype.delAdorn=function (key){this.adorn.delete(key)}
Cotton.prototype.refAdorn=function (key){this.adorn.ref(key)}
Cotton.prototype.swapAdorn=function (key1,key2){this.adorn.swap(key1,key2)}
Cotton.prototype.evokeAdorn=function (key,bool){
    if(this.adorn) {
        if (bool) this.adorn.on(key)
        else this.adorn.off(key)
    }
}
Cotton.prototype.touchAdorn=function (key,bool){this.adorn.setTouch(key,bool)}
Cotton.prototype.bitAdorn=function (bit,key){if(this.adorn) this.adorn.setBit(bit,key)}
Cotton.prototype.drawAdorn=function (){
    if(this.adorn) this.adorn.draw()
}
Cotton.prototype.update = function () {
    if(this._stop) return
    else if(this.run.active) this.run.update()
    else {
        if(this._delay===0) {
            this.processTouch()
            if(this.processKey()||this.processWheel()){this._delay=Math.max(this._delay,4)}
        }
        else this._delay--
        this.innerListen()
    }
    this.adorn.update()
    for (const sprite of this._animationSprites) {
        sprite.update()
        if (!sprite.isPlaying()) {this.removeAnimation(sprite);}
    }
    this.outerListen()
}
Cotton.prototype.removeAnimation = function(sprite) {
    this._animationSprites.remove(sprite);
    this.removeChild(sprite);
    sprite.destroy();
};
Cotton.prototype.createAnimationSprite = function(targets1, animation, mirror, delay,targets2) {
    const sprite = new Sprite_Animation();
    const baseDelay = 8
    const previous = null;
    sprite.targetObjects = [targets1];
    sprite.setup([targets1], animation, mirror, delay,null,targets2);
    this.addChild(sprite);
    this._animationSprites.push(sprite);
};
Cotton.prototype.playAnimation=function (name,animationId,mirror){
    const animation = $dataAnimations[animationId];
    const targets1=this.getsp(name)
    const targets2=this.getsp("re_"+name)
    this.createAnimationSprite(targets1, animation,mirror,0,targets2);
}
Cotton.prototype.setAnime =function (sp,key,val,time,cycle,num,mode,lossNir,out) {
    this.adorn.setAnime(sp,key,val,time,cycle,num,mode,lossNir,out)
}
Cotton.prototype.stopAnime =function (sp,key,del) {
    this.adorn.stopAnime(sp,key,del)
}
Cotton.prototype.spHandler=function (key,handler){this.adorn.spHandler(key,handler)}
Cotton.prototype.delHandler=function (key){this.adorn.delHandler(key)}
Cotton.prototype.getsp=function (key){
    return this.adorn.sp[key]
}
Cotton.prototype.loadBit = function (key, val) {
    this._orgin._load++
    this._bit[key] = ImageManager.loadBitmap(`img/${val[0]}/`, val[1]||key)
    this._bit[key].addLoadListener(() => { this._orgin._load-- })
}
Cotton.prototype.setNineTile=function (key,source,w,h,color1,color2){
    if(this._bit[source]){
        const bit=new Bitmap(w,h)
        const pic =this.getBit(source)
        const sw=pic.width
        const sh=pic.height
        if(color1&&color2){
            bit.fillStripedRoundedRect(0, 0,w,h,0,2,color1,color2)
        }
        else if(color1) bit.fillAll(color1)
        for(let uw=sw/3;uw<w-sw/3;uw+=sw/3){
            bit.blt(pic,sw/3,0,sw/3,sh/3,uw,0,sw/3,sh/3)
            bit.blt(pic,sw/3,sh/3*2,sw/3,sh/3,uw,h-sh/3,sw/3,sh/3)
        }
        for(let uh=sh/3;uh<h-sh/3;uh+=sh/3){
            bit.blt(pic,0,sh/3,sw/3,sh/3,0,uh,         sw/3,sh/3)
            bit.blt(pic,sw/3*2,sh/3,sw/3,sh/3,w-sw/3,uh,sw/3,sh/3)
        }
        bit.blt(pic,0,0,sw/3,sh/3,0,0,sw/3,sh/3)
        bit.blt(pic,sw-sw/3,0,sw/3,sw/3,w-sw/3,0,sw/3,sh/3)
        bit.blt(pic,sw-sw/3,sh-sh/3,sw/3,sw/3,w-sw/3,h-sh/3,sw/3,sh/3)
        bit.blt(pic,0,sh-sh/3,sw/3,sw/3,0,h-sh/3,sw/3,sh/3)
        this.addBit(key,bit)
    }
}

Cotton.prototype.getNote = function (key) {
    return this._note[key]
}
Cotton.prototype.setNote = function (key, val) {
    this._note[key] = val
}
Cotton.prototype.addExpel=function (handler){this._expel.add(handler)}
Cotton.prototype.delExpel=function (handler){this._expel.delete(handler)}
Cotton.prototype.setExpel=function (arr){
    this._expel=new Set()
    for(let item of arr) this._expel.add(item)
}
Cotton.prototype.addBit = function (key,bit) {
    if(this.adorn) {
        this._bit[key] = bit
        this.adorn.refBit(key)
    }
}
Cotton.prototype.getBit = function (key) {
    if (this._bit[key]) {
        let bit = new Bitmap(this._bit[key].width, this._bit[key].height)
        bit.blt(this._bit[key], 0, 0, this._bit[key].width, this._bit[key].height, 0, 0, this._bit[key].width, this._bit[key].height)
        return bit
    }
    return new Bitmap(1,1)
}
Cotton.prototype.grabBit = function (key) {
    if (this._bit[key]) return this._bit[key]
    return new Bitmap(1,1)
}
Cotton.prototype.processTouch = function () {
    const cancelled=TouchInput.isCancelled()
    const pressed =TouchInput.isPressed()

    if(cancelled&&this.cancelled()) return
    const x= TouchInput.x
    const y= TouchInput.y
    for (let key of this.adorn.list.slice().reverse()) {
        const item = this.adorn.sp[key];
        const data = this.adorn.data[key];
        const bound= this.adorn.handler[key]
        if(bound) {
            const handler =bound.handler
            const res=bound.update(x,y,cancelled,pressed,item,this._expel)
            const pos=[res.touch[0],res.touch[1],res.touch[4]-res.touch[2],res.touch[5]-res.touch[3]]
            const bool =res.data
            let region=0
            if (bool[0] === bool[1]) {region = 2;}
            else if (bool[1] > bool[2]) {region = 1;}
            else if (bool[0] === bool[2]) {region = 3;}
            if(bool[6]===2&&data.touch){
                if (region===1&&this.triggerHandler(handler,"K",data.data,pos)) return
            }
            if(region===1&&data.touch){
                if (bool[0]===bool[5]&&this.triggerHandler(handler,"R",data.data,pos)) return
                if (bool[0]===bool[3]&&this.triggerHandler(handler,"L",data.data,pos)) return
            }
            if(bool[0]===bool[4]){
                if(bool[6]===2) {
                    if (this.triggerHandler(handler,"G",data.data,pos)) return
                    if (region===1&&this.triggerHandler(handler,"F",data.data,pos)) return
                    if (region!==1&&this.triggerHandler(handler,"H",data.data,pos)) return
                }
                if((region===1||region===2)) {
                    if (this.triggerHandler(handler,"D",data.data,pos)) return
                }
            }
     
            else if(bool[3]>bool[4]){
                if(data.touch&&bool[6]===1) if (this.triggerHandler(handler,"C",data.data,pos)) return
                if(region===0) {if (this.triggerHandler(handler,"P",data.data,pos)) return}
                else if(region===1) {if (this.triggerHandler(handler,"N",data.data,pos)) return}
                else if(region===2) {if (this.triggerHandler(handler, "E", data.data, pos)) return}
                else if(region===3) {if (this.triggerHandler(handler, "Q", data.data, pos)) return}
            }
            else {
                if(region===0) {if (this.triggerHandler(handler,"U",data.data,pos)) return}
                else if(region===2) {if (this.triggerHandler(handler,"E",data.data,pos)) return}
                else if(region===3) {if (this.triggerHandler(handler, "Q", data.data, pos)) return}
                else if(data.touch&&region===1) {
                    if (this.triggerHandler(handler,"T",data.data,pos)) return
                }
            }
        }
    }
}
Cotton.prototype.processWheel = function() {
    if(performance.now()-this._wheelTime>this._wheelInter){
        if (this[`WheelDown_${this._page}`]&&TouchInput.wheelY >= this.threshold) {
            this[`WheelDown_${this._page}`]()
            return true
        }
        if (this[`WheelUp_${this._page}`]&&TouchInput.wheelY <= -this.threshold) {
            this[`WheelUp_${this._page}`]()
            return true
        }
        this._wheelTime=performance.now()
    }
    return false
}
Cotton.prototype.processKey = function () {
    for(let key of this._input) {
        if (this[`Trigger_${key}_${this._page}`] && Input.isTriggered(key)) {
            this[`Trigger_${key}_${this._page}`]()
            return true
        }
        else if (this[`Key_${key}_${this._page}`] && Input.isPressed(key)) {
            this[`Key_${key}_${this._page}`]()
            return true
        }
        else if (this[`Repe_${key}_${this._page}`] && Input.isRepeated(key)) {
            this[`Repe_${key}_${this._page}`]()
            return true
        }
        else if (this[`Longkey_${key}_${this._page}`] && Input.isLongPressed(key)) {
            this[`Longkey_${key}_${this._page}`]()
            return true
        }
    }
    return  false
}
Cotton.prototype.triggerHandler = function (handler,name,data,pos) {
    if(this[handler+"_"+name]) return this[handler+"_"+name](data,pos)
    return false;
};
Cotton.prototype.cancelled = function () {
    if(this[`Back_${this._page}`]) return this[`Back_${this._page}`]()
    return false;
};
Cotton.prototype.innerListen =function (){}
Cotton.prototype.outerListen =function (){}

////
function Runflow() {
    this.initialize.apply(this, arguments);
}
Runflow.prototype = Object.create(Runflow.prototype);
Runflow.prototype.constructor = Runflow;
Runflow.prototype.initialize = function (orgin) {
    this._orgin=orgin
    this.active=false
    this.time=0
    this.arr=[]
    this.work={}
    this.init=""
    this.cond=""
    this.done=""
}

Runflow.prototype.set=function (key,init,cond,done){
    this.work[key] = {init: init || "",cond: cond || "", done: done || "",}
}
Runflow.prototype.install = function (work) {
    if (this.work[work]) {
        if(!this.active) {
            this.time=0
            this.active=true
            this.init=this.work[work].init
            this.cond=this.work[work].cond
            this.done=this.work[work].done
            return true
        }
        else {
            this.arr.push(work)
            return true
        }
    }
    return false
}
Runflow.prototype.update=function (){
    if (this.time === 0) {
        this.time++;
        if (this.init && this._orgin[this.init]) this._orgin[this.init](); // 执行初始化方法
    }
    else {
        if (!this.cond||(this._orgin[this.cond]&&this._orgin[this.cond]())){
            this.active = false;
            if(this.done&&this._orgin[this.done]){
                this._orgin[this.done]()
                let bool=true
                while (bool&&this.arr.length) {
                    if (this.install(this.arr.shift())) {
                        bool = false
                    }
                }
            }
            
        }
        else {
            this.time++
        }
    }
}

////
function Adorn() {
    this.initialize.apply(this, arguments);
}
Adorn.prototype = Object.create(Adorn.prototype);
Adorn.prototype.constructor = Adorn;
Adorn.prototype.initialize = function (orgin) {
    this._orgin=orgin
    this.data={}
    this.list=[]
    this.map={}
    this.sp={}
    this.anime={}
    this.handler={}
}

Adorn.prototype.set=function (key,bit,handler,data,w,h,x,y,cover,adso,alpha,rota){
    this.data[key]={
        bit:bit,
        data:data||{},
        w:w||0,
        h:h||0,
        x:x||0,
        y:y||0,
        cover: cover||0,
        adso: adso!==undefined?adso:7,
        alpha: alpha!==undefined?alpha:1,
        hide:0,
        rota: rota || 0,
        ox:1, 
        oy:1,
        sx:0,
        sy:0,
        ex:0,
        ey:0,
        fx:0,
        fy:0,
        fw:100,
        fh:100,
        touch:false,
        trans:true,
        refresh:true
    }
    this.connectBit(bit,key)
    if(handler) this.spHandler(key,handler)
    this.list.push(key)
}
Adorn.prototype.setData=function (key,k,v){
    if(this.data[key])
        this.data[key].data[k]=v
}
Adorn.prototype.delete =function (key){
    if(this.data[key]){
        delete this.data[key]
        if(this.list.indexOf(key)>-1)
            this.list.splice(this.list.indexOf(key),1)
        this.draw()
    }
}

Adorn.prototype.ref=function (key){if(this.data[key]) this.data[key].refresh=true}
Adorn.prototype.update=function (){
    for(let item in this.anime)
        for(let key of Object.keys(this.anime[item]))
            if(this.anime[item][key].update()) {
                delete this.anime[item][key]
            }
    
    for (let key of this.list)
        if (this.anime[key]||this.data[key].trans)
            this.trans(key)
}
Adorn.prototype.swap=function (v1,v2){
    const i1 = this.list.indexOf(v1);
    const i2 = this.list.indexOf(v2);
    if (i1 === -1 || i2 === -1) return
    this.list.splice(i1, 1);
    this.list.splice(i2, 0, v1);
}
Adorn.prototype.off=function (key){if(this.data[key]) this.data[key].touch=false}
Adorn.prototype.on=function (key) {if(this.data[key]) this.data[key].touch=true }
Adorn.prototype.setBit=function (bit,key){
    if(this.data[key]) {
        if (this.data[key].bit) {
            let index = this.map[this.data[key].bit].indexOf(key)
            if (index > -1) this.map[this.data[key].bit].splice(index, 1)
        }
        this.data[key].bit = bit
        this.connectBit(bit, key)
        this.data[key].refresh = true
    }
}
Adorn.prototype.connectBit=function (bit,key){
    if(this.map[bit]) this.map[bit].push(key)
    else  this.map[bit]=[key]
}
Adorn.prototype.refBit=function (bit){
    if(this.map[bit])
        for(let key of this.map[bit])
            if(this.data[key]) this.data[key].refresh=true
}

Adorn.prototype.setAnime =function (sp,key,val,time,cycle,num,mode,lossNir,out) {
    if (this.data[sp]) {
        if (!this.anime[sp]) {
            this.anime[sp] = {}
        }
        let data = this.anime[sp]
        for (let i = 0; i < key.length; i++) {
            data[key[i]] =  new Rhythm(val[i],time,cycle,num,mode,lossNir,out)
        }
    }
}
Adorn.prototype.stopAnime=function (sp,key,del){
    if(this.anime[sp]) {
        for (let i = 0; i < key.length; i++) {
            if (this.anime[sp][key[i]]) {
                if(del) delete this.anime[sp][key[i]]
                else  this.anime[sp][key[i]].run = false
            }
        }
    }
}
Adorn.prototype.getAnime=function (sp){
    const correct={}
    if(this.anime[sp]) {
        const item = this.anime[sp]
        for (let key in item) {
            correct[key]=item[key].getVal()
        }
    }
    return correct
}

Adorn.prototype.getRef = function() {
    return this.list.filter(function(key) {return this.data[key].refresh;}, this);
};
Adorn.prototype.getLapse = function() {
    let spKeys = Object.keys(this.sp);
    let dataKeys = Object.keys(this.data);
    return spKeys.filter(function(key) { return !dataKeys.includes(key);}, this);
};
Adorn.prototype.draw = function () {
    const ref=LIM.UTILS.union(this.getRef(),this.getLapse())
    for(let i=0;i<this._orgin.children.length;i++){
        if (this._orgin.children[i].adorn){
            const adorn= this._orgin.children[i].adorn
            if(ref.indexOf(adorn)>-1&&this.sp[adorn]){
                this._orgin.children.splice(i--, 1)
                this.sp[adorn].destroy()
                delete this.sp[adorn]
            }
        }
    }
    this._orgin.children=[]
    for (let key of this.list) {
        if (this.data[key]){
            if(this.data[key].refresh){
                this.data[key].refresh=false
                const bit = this._orgin.grabBit(this.data[key].bit);
                if(bit){
                    const sp = new Sprite(bit);
                    sp._colorFilter = new ColorFilter();
                    if (!sp.filters) {sp.filters = [];}
                    sp.filters.push(sp._colorFilter);
                    sp._colorFilter.setHue(sp._hue);
                    sp._colorFilter.setBlendColor(sp._blendColor);
                    sp._colorFilter.setColorTone(sp._colorTone);
                    sp.adorn=key
                    this.sp[key]=sp
                    this.trans(key)

                }
            }
            this._orgin.addChild(this.sp[key])
        }
    }
}

Adorn.prototype.trans =function (key) {
    this.data[key].trans=false
    if(this.data[key]&&this.sp[key]) {
        let correct = this.getAnime(key)
        const sp = this.sp[key]
        const data = this.data[key]
        sp.anchor.set(0.5, 0.5);
        //隐藏
        if (data.hide) {
            sp.hide()
            return
        }
        sp.show()
        //缩放
        let w = 1
        let h = 1
        if (String(data.w).indexOf("%") > -1) w = parseFloat(data.w.replace('%', '')) / 100 || 1
        else w = LIM.UTILS.lengthNum(data.w) / sp.bitmap.width

        if (String(data.h).indexOf("%") > -1) h = parseFloat(data.h.replace('%', '')) / 100 || 1
        else h = LIM.UTILS.lengthNum(data.h) / sp.bitmap.height
        switch (data.cover) {
            case 1:
                sp.scale.x = Math.max(w, h)
                sp.scale.y = sp.scale.x
                break
            case 2:
                sp.scale.x = Math.min(w, h)
                sp.scale.y = sp.scale.x
                break
            default:
                sp.scale.x = w
                sp.scale.y = h
                break
        }
        let fx = data.fx + (correct.fx || 0)
        let fy = data.fy + (correct.fy || 0)
        let fw = data.fw + (correct.fw || 0)
        let fh = data.fh + (correct.fh || 0)
        //定位
        let qx = sp.scale.x
        let qy = sp.scale.y
        w = sp.bitmap.width
        h = sp.bitmap.height
        let sx = data.adso % 3 === 1 ? (w*fw/100) * qx * 0.5 :
            data.adso % 3 === 2 ? Graphics.width * 0.5 :
                Graphics.width - (w*fw/100) * qx * 0.5;
        let sy = data.adso > 6 ? (h*fh/100) * qy * 0.5 :
            data.adso < 4 ? Graphics.height - (h*fh/100) * qy * 0.5 :
                Graphics.height * 0.5;
        //裁剪
        sp.setFrame(w * fx / 100, h * fy / 100, w * fw / 100, h * fh / 100)
        //设定值
        sp.rx = (typeof data.x === 'string' && data.x.includes("%")) ? (parseFloat(data.x) / 100) * sp.bitmap.width : LIM.UTILS.lengthNum(data.x);
        sp.x = sp.rx + sx - (correct.x || 0)*-1;
        sp.ry = (typeof data.y === 'string' && data.y.includes("%")) ? (parseFloat(data.y) / 100) * sp.bitmap.height : LIM.UTILS.lengthNum(data.y);
        sp.y = sp.ry + sy - (correct.y || 0)*-1;
        sp.alpha = data.alpha + (correct.alpha || 0) / 100;
        sp.rotation = ((data.rota + (correct.rota || 0)) / 180) * Math.PI;
        sp.scale.x *= data.ox + (correct.ox || 0) / 100
        sp.scale.y *= data.oy + (correct.oy || 0) / 100
        sp.scale.x+=(correct.sx || 0) / 100
        sp.scale.y+=(correct.sy || 0) / 100
        sp.skew.x=((data.ex||0+(correct.ex || 0))/ 180) * Math.PI;
        sp.skew.y=((data.ey||0+(correct.ey || 0))/ 180) * Math.PI;
        //颜色
        sp._hue = data.hue || 0
        sp._blendColor = [data.br || 0, data.bg || 0, data.bb || 0, data.ba || 0]
        sp._colorTone = [data.cr || 0, data.cg || 0, data.cb || 0, data.ca || 0]
        sp._colorFilter.setHue(sp._hue);
        sp._colorFilter.setBlendColor(sp._blendColor);
        sp._colorFilter.setColorTone(sp._colorTone);
    }
}
Adorn.prototype.move=function (key,data){
    if(this.data[key]) {
        for (let k of Object.keys(data)) this.data[key][k] = data[k]
        this.data[key].trans = true
    }
}
Adorn.prototype.setTouch =function (key,bool){
    if(this.handler[key]) this.handler[key].alpha=bool||false
}
Adorn.prototype.spHandler=function (key,handler){
    this.delHandler(key)
    if(this.data[key]) this.handler[key]=new Handler(this,handler)
}
Adorn.prototype.delHandler=function (key){
    if(this.handler[key]) delete this.handler[key]
}

/////
function Handler() {
    this.initialize.apply(this, arguments);
}
Handler.prototype = Object.create(Handler.prototype);
Handler.prototype.constructor = Handler;
Handler.prototype.initialize = function (orgin,handler) {
    this._orgin=orgin
    this.handler=handler
    this.create()
}
Handler.prototype.create=function (){
    this.alpha=false    //是否判断颜色
    this.touch=[-1,-1,-1,-1,-1,-1]
    this.data=[0,-1,0,-1,0,-1,0]
    this.activa=true
}
Handler.prototype.update=function (x,y,cancelled,pressed,item,expel) {
    if (this.activa) {
        const itemWidth = item.width*item.scale.x;
        const itemHeight = item.height*item.scale.y;
        const itemX = item.getX()
        const itemY = item.getY()
        const px=(x - (itemX - itemWidth * 0.5))/item.scale.x
        const py=(y - (itemY - itemHeight * 0.5))/item.scale.y
        let alphaPixel = this.alpha||item.bitmap.getAlphaPixel(px,py);
        this.touch = [
            x - (itemX - itemWidth * 0.5),
            y - (itemY - itemHeight * 0.5),
            this.touch[2] > -1 ? this.touch[4] : x,
            this.touch[3] > -1 ? this.touch[5] : y,
            x,
            y
        ];
        if (expel.has(this.handler)) {
            this.create();
        }
        else {
            if (cancelled) {
                this.data[5] = this.data[0]+1;
            }
            let insideItem = alphaPixel > 0 && this.touch[0] >= 0 && this.touch[0] <= itemWidth && this.touch[1] >= 0 && this.touch[1] <= itemHeight;
            if (pressed) {
                if(this.data[4]>this.data[3]) {
                    this.data[3] = this.data[0] + 1
                    if(insideItem){this.data[6]=1}
                }
            }
            else {
                if(this.data[3]>this.data[4]) {this.data[4]=this.data[0]+1}
                if(this.data[6]) this.data[6]=this.data[6]===1?2:0
            }
            if (insideItem) {
                if(this.data[2]>this.data[1]){this.data[1]=this.data[0]+1}
            }
            else {
                if(this.data[1]>this.data[2]){this.data[2]=this.data[0]+1}
            }
        }
        this.data[0]++;  // 更新时间
        return {data:this.data,touch:this.touch}
    }
    else if (!expel.has(this.handler)) {
        this.activa = true
        return this.update(x,y,cancelled,pressed,item,expel)
    }
}
/////
function Rhythm(){
    this.initialize.apply(this, arguments);
}
Rhythm.prototype = Object.create(Rhythm.prototype);
Rhythm.prototype.constructor = Rhythm;
Rhythm.prototype.initialize = function (val,time,cycle,num,mode,lossNir,out) {
    this.val=val
    this.run=true
    this.count=0
    this.out=out
    this.time=time||0
    this.cycle=cycle||1
    this.num=num||-1
    this.mode=mode||"sin"
    this.lossNir=lossNir||0
}
Rhythm.prototype.update=function (){
    if(this.run){
        if(this.num<0||this.count<(this.num*this.time)) this.count++
        else if(this.out) this.run=false
    }
    else {
        if(this.count%this.time>0) {
            this.count--
        }
        else return true
    }
}
Rhythm.prototype.getVal=function (){
    let v=0
    let c=this.time/this.cycle
    let num = 0
    switch (this.mode){
        case "line":
            num=((this.count%(c*4))/c);
            if(num>=3&&this.lossNir<2) {v=(this.count%(c))/-c*-1-1}
            else if(num>=2) v=(this.count%(c))/-c
            else if(num>=1&&this.lossNir<2) v=1-(this.count%(c))/c
            else v=(this.count%(c))/c
            break
        case "sin":
            num = this.lossNir>1?(this.count%c):this.count
            v=(LIM.UTILS.sinNum(c,num))
            break
    }
    return ((this.lossNir%2===1?Math.abs(v):v)*this.val).toFixed(5);
}

Spriteset_Base.prototype.createPictures = function() {
    const rect = this.pictureContainerRect();
    this._pictureContainer = new Sprite();
    this._pictureContainer.setFrame(rect.x, rect.y, rect.width, rect.height);
    for (let i = 1; i <= $gameScreen.maxPictures(); i++) {
        this._pictureContainer.addChild(new Sprite_Picture(i));
    }
    this.addChildAt(this._pictureContainer,1);
};