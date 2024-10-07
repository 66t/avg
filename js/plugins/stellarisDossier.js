/*:
 * @target MZ
 * @plugindesc stellarisDossier
 * @author setchuka
 * -----------------------------------------------------------------------------
 */
Scene_Boot.prototype.startNormalGame = function() {
    this.checkPlayerLocation();
    DataManager.setupNewGame();
    SceneManager.goto(Scene_Map);
    Window_TitleCommand.initCommandPosition();
};

Scene_Menu.prototype.create = function() {
    Scene_MenuBase.prototype.create.call(this);
    new Lim_menuScenes(this)
};
Scene_Menu.prototype.start = function() {
    Scene_MenuBase.prototype.start.call(this);
};
Scene_Menu.prototype.terminate = function() {
    Scene_MenuBase.prototype.terminate.call(this);
    for(let obj of this.children) if(obj instanceof Weaver) obj.death()
}
function Lim_menuScenes(){this.initialize.apply(this, arguments);}
Lim_menuScenes.prototype = Object.create(Weaver.prototype);
Lim_menuScenes.prototype.constructor = Lim_menuScenes;
Lim_menuScenes.prototype.initialize = function(orgin) {
    Weaver.prototype.initialize.call(this,orgin)

}
Lim_menuScenes.prototype.install = function (){
    Weaver.prototype.install.call(this)
    this._window["dossier"]=new Lim_dossier(this)
    this._window["back"]=new Lim_dosBack(this)
    this._window["cogni"]=new Lim_dosCogni(this)
    this._window["secret"]=new Lim_dosSecret(this)
    this._window["menu"]=new Lim_dosMenu(this)
}
Lim_menuScenes.prototype.execute=function (){
    Weaver.prototype.execute.call(this)
    this.modify(1)
}
Lim_menuScenes.prototype.stateStore=function (){
    this._state={
        0:{"dossier":[0,0],"back":[0,0],"menu":[0,0],"cogni":[0,0],"secret":[0,0]},
        1:{"dossier":[1,1],"back":[0,0],"menu":[1,1],"cogni":[0,0],"secret":[0,0]},
        2:{"dossier":[0,0],"back":[1,1],"menu":[1,1],"cogni":[0,0],"secret":[0,0]},
        3:{"dossier":[0,0],"back":[0,0],"menu":[1,1],"cogni":[1,1],"secret":[0,0]},
        4:{"dossier":[0,0],"back":[0,0],"menu":[1,1],"cogni":[0,0],"secret":[1,1]},
    }
}


function Lim_dosMenu() {
    this.initialize.apply(this, arguments);
}
Lim_dosMenu.prototype = Object.create(Cotton.prototype);
Lim_dosMenu.prototype.constructor = Lim_dossier;
Lim_dosMenu.prototype.initialize = function (orgin) {
    Cotton.prototype.initialize.call(this,orgin)
    this.p=0
    this.mes=["资 料","背 景","认 知","秘 密"]
};
Lim_dosMenu.prototype.execute=function (){
    Cotton.prototype.execute.call(this)
    this.setInput(["escape","left","right"])
}
Lim_dosMenu.prototype.initAdorn=function (){
    for(let i=0;i<4;i++){
        let p=new Bitmap(150,65)
        this.addBit("p"+i,p)
        p.fontSize=24
        p.fontBold=true
        p.textColor="#87ffcf"
        p.fontFace="rmmz-mainfont"
        this.setAdorn("p"+i,"p"+i,"D",{index:i},"100%","100%",i*180+15,25,1,1,1)
    }
    this.drawMenu()
}
Lim_dosMenu.prototype.Repe_left_0=function () {
    if(this.p===0) this.p=3
    else this.p--
    this.drawMenu()
}
Lim_dosMenu.prototype.Repe_right_0=function () {
    if(this.p===3) this.p=0
    else this.p++
    this.drawMenu()
}
Lim_dosMenu.prototype.Trigger_escape_0=function (){
    SceneManager.pop()
    SoundManager.playCancel()
    Input._latestButton=""
}
Lim_dosMenu.prototype.Back_0=function (){
    TouchInput.clear()
    SceneManager.pop()
    SoundManager.playCancel()
}
Lim_dosMenu.prototype.drawMenu=function (){
    for(let i=0;i<4;i++) {
        let p= this.grabBit("p"+i)
        p.clear()
        p.strokeRoundedRect(0,0,150,this.p!==i?80:65,5,"#2A5C50",2)
        p.fillRoundedRect(2,2,146,this.p!==i?76:61,5,"#253932")
        p.drawText(this.mes[i],0,0,150,this.p!==i?40:60,"center")
        this.adorn.move("p"+i,{y:this.p!==i?25:5})
    }
    this._orgin.modify(this.p+1)
}
Lim_dosMenu.prototype.D_D=function(data,pos) {
    if(this.p!==data.index) {
        this.p = data.index
        this.drawMenu()
    }
}


function Lim_dossier() {
    this.initialize.apply(this, arguments);
}
Lim_dossier.prototype = Object.create(Cotton.prototype);
Lim_dossier.prototype.constructor = Lim_dossier;
Lim_dossier.prototype.initialize = function (orgin) {
    Cotton.prototype.initialize.call(this,orgin)
};
Lim_dossier.prototype.execute=function (){
    Cotton.prototype.execute.call(this)
}
Lim_dossier.prototype.initImage = function() {
    this.img={
        "q":["pictures"]
    }
}
Lim_dossier.prototype.initAdorn=function (){
    this.drawCont()
    this.drawBack()
    this.drawHead()
    this.drawSecre()
    this.drawBox1()
    this.drawBox2()
    this.drawBox3()
    this.drawBox4()
}
Lim_dossier.prototype.drawCont=function () {
    let cont = new Bitmap(Graphics.width, Graphics.height);
    let colors = ["#22322C", "#1F2A27"];
    for (let i = 0; i < 11; i++) {
        for (let j = 0; j < 17; j++) {
            let colorIndex = (i + j) % 2;
            cont.fillRect(64 * i, 64 * j, 64, 64, colors[colorIndex]);
        }
    }
    this.addBit("cont",cont)
    this.setAdorn("cont","cont","",null,"100%","100%",0,0,1,5,1)
}
Lim_dossier.prototype.drawBack=function () {
    let back=new Bitmap(Graphics.width,Graphics.height)
    back.fillAll("#253932")
    back.clearRoundRect(20,20,Graphics.width-40,Graphics.height-40,80)
    this.addBit("back",back)
    this.setAdorn("back","back","",null,"100%","100%",0,0,1,5,1)
}
Lim_dossier.prototype.drawHead=function () {
    let q= this.grabBit("q")
    let head=new Bitmap(264,264)
    const c = "#253932"
    head.fillRoundedRect(0,0,264,264,20, "#2A5C50");
    head.clearRect(4,4,256,256);
    head.roundedBlt(q,20,0,0,256,256,4,4,256,256)
    this.addBit("head",head)
    this.setAdorn("head","head","",null,"100%","100%",60,60,1,7,1)
}
Lim_dossier.prototype.drawSecre=function () {
    let secre = new Bitmap(200, 80)
    secre.fontSize = 32
    secre.fontBold = true
    secre.outlineColor = "#CB8317"
    secre.fontFace = "rmmz-mainfont"
    secre.fillAll("#CB8317")
    secre.clearRect(4, 4, 192, 72)
    secre.fillRect(4, 4, 192, 72, "#382A0C")
    secre.drawText("TOP SECRE", 0, 0, 200, 80, "center")
    this.addBit("secre", secre)
    this.setAdorn("secre", "secre", "", null, "100%", "100%", -30, 30, 1, 7, 1, 315)
}
Lim_dossier.prototype.drawBox1=function () {
    let box1=new Bitmap(330,384)
    box1.fillRoundedRect(0,0,330,384,20, "#2A5C50");
    box1.clearRect(4,4,322,376);
    box1.fillRect(6,24,318,64,"#2A5C5055")
    box1.fillRect(6,114,318,64,"#2A5C5055")
    box1.fillRect(6,204,318,64,"#2A5C5055")
    box1.fillRect(6,294,318,64,"#2A5C5055")
    box1.fontSize=24
    box1.fontBold=true
    box1.textColor="#87ffcf"
    box1.fontFace="rmmz-mainfont"
    box1.drawText("序列号",0,24,159,64,"center")
    box1.drawText("标识符",0,114,159,64,"center")
    box1.drawText("引用名",0,204,159,64,"center")
    box1.drawText("级别",0,294,159,64,"center")
    box1.drawText("001",159,24,159,64,"center")
    box1.drawText("优雅贵族",159,114,159,64,"center")
    box1.drawText("天宫澄",159,204,159,64,"center")
    box1.drawText("S",159,294,159,64,"center")
    this.addBit("box1",box1)
    this.setAdorn("box1","box1","",null,"100%","100%",340,60,1,7,1)
}
Lim_dossier.prototype.drawBox2=function () {
    let box2=new Bitmap(264,400)
    box2.fillRoundedRect(0,0,264,400,20, "#2A5C50");
    box2.clearRect(4,4,256,392);

    box2.fillRect(6,24,264,45,"#2A5C5055")
    box2.fillRect(6,85,264,45,"#2A5C5055")
    box2.fillRect(6,146,264,45,"#2A5C5055")
    box2.fillRect(6,207,264,45,"#2A5C5055")
    box2.fillRect(6,268,264,45,"#2A5C5055")
    box2.fillRect(6,329,264,45,"#2A5C5055")

    box2.fontSize=24
    box2.fontBold=true
    box2.textColor="#87ffcf"
    box2.fontFace="rmmz-mainfont"
    box2.drawText("法术派系",0,24,264,45,"center")
    box2.drawText("力场",0,85,132,45,"center")
    box2.drawText("剥离",0,146,132,45,"center")
    box2.drawText("瓦解",0,207,132,45,"center")
    box2.drawText("干扰",0,268,132,45,"center")
    box2.drawText("抵拒",0,329,132,45,"center")

    box2.drawText("SS",132,85,132,45,"center")
    box2.drawText("S",132,146,132,45,"center")
    box2.drawText("S",132,207,132,45,"center")
    box2.drawText("A+",132,268,132,45,"center")
    box2.drawText("A",132,329,132,45,"center")
    this.addBit("box2",box2)
    this.setAdorn("box2","box2","",null,"100%","100%",60,340,1,7,1)
}
Lim_dossier.prototype.drawBox3=function () {
    let box3=new Bitmap(330,284)
    box3.fontSize=24
    box3.fontBold=true
    box3.textColor="#87ffcf"
    box3.fontFace="rmmz-mainfont"
    box3.fillRoundedRect(0,0,330,284,20, "#2A5C50");
    box3.clearRect(4,4,322,276);
    box3.fillRect(6,28,330,46,"#2A5C5055")
    box3.fillRect(6,89,330,46,"#2A5C5055")
    box3.fillRect(6,150,330,46,"#2A5C5055")
    box3.fillRect(6,211,330,46,"#2A5C5055")

    box3.drawText("身高",0,28,159,46,"center")
    box3.drawText("体重",0,89,159,46,"center")
    box3.drawText("种族",0,150,159,46,"center")
    box3.drawText("主武器",0,211,159,46,"center")

    box3.drawText("164",159,28,159,46,"center")
    box3.drawText("53",159,89,159,46,"center")
    box3.drawText("过拟合人",159,150,159,46,"center")
    box3.drawText("西洋剑",159,211,159,46,"center")
    this.addBit("box3",box3)
    this.setAdorn("box3","box3","",null,"100%","100%",340,456,1,7,1)
}
Lim_dossier.prototype.drawBox4=function () {
    let box4=new Bitmap(610,254)
    box4.fillRoundedRect(0,0,610,254,20, "#2A5C50");
    box4.clearRect(4,4,602,246);
    box4.fontSize=24
    box4.fontBold=true
    box4.textColor="#87ffcf"
    box4.fontFace="rmmz-mainfont"
    let mes=[
        "出生于贵族社会，精通礼节与剑技",
        "擅长利用法术保护同伴",
        "冷静从容，控制欲强并有些腹黑",
        "以优雅的姿态主宰全局"
    ]
    box4.fillRect(6,12,598,48,"#2A5C5055")
    box4.drawText("角色介绍",6,15,598,48,"center")
    box4.drawText(mes[0],30,80,610,32,"left")
    box4.drawText(mes[1],30,115,610,32,"left")
    box4.drawText(mes[2],30,150,610,32,"left")
    box4.drawText(mes[3],30,185,610,32,"left")

    this.addBit("box4",box4)
    this.setAdorn("box4","box4","",null,"100%","100%",60,-70,1,1,1)
}




function Lim_dosBack() {
    this.initialize.apply(this, arguments);
}
Lim_dosBack.prototype = Object.create(Cotton.prototype);
Lim_dosBack.prototype.constructor = Lim_dosBack;
Lim_dosBack.prototype.initialize = function (orgin) {
    Cotton.prototype.initialize.call(this,orgin)
};
Lim_dosBack.prototype.initAdorn=function (){
    this.drawCont()
    this.drawBack()
    this.drawBox1()
    this.drawBox2()
    this.drawBox3()
}
Lim_dosBack.prototype.drawCont=function () {
    let cont = new Bitmap(Graphics.width, Graphics.height);
    let colors = ["#22322C", "#1F2A27"];
    for (let i = 0; i < 12; i++) {
        for (let j = 0; j < 17; j++) {
            let colorIndex = (i + j) % 2;
            cont.fillRect(64 * i, 64 * j, 64, 64, colors[colorIndex]);
        }
    }
    this.addBit("cont",cont)
    this.setAdorn("cont","cont","",null,"100%","100%",0,0,1,5,1)
}
Lim_dosBack.prototype.drawBack=function () {
    let back=new Bitmap(Graphics.width,Graphics.height)
    back.fillAll("#253932")
    back.clearRoundRect(20,20,Graphics.width-40,Graphics.height-40,80)
    this.addBit("back",back)
    this.setAdorn("back","back","",null,"100%","100%",0,0,1,5,1)
}
Lim_dosBack.prototype.drawBox1=function () {
    let box1=new Bitmap(610,300)
    box1.fontSize=24
    box1.fontBold=true
    box1.textColor="#87ffcf"
    box1.fontFace="rmmz-mainfont"
    box1.fillRoundedRect(0,0,610,300,20, "#2A5C50");
    box1.clearRect(4,4,602,292);
    box1.fillRect(6,12,598,48,"#2A5C5055")
    box1.drawText("故事",6,15,598,48,"center")
    this.addBit("box1",box1)
    this.setAdorn("box1","box1","",null,"100%","100%",60,60,1,7,1)
}
Lim_dosBack.prototype.drawBox2=function () {
    let box2=new Bitmap(610,300)
    box2.fontSize=24
    box2.fontBold=true
    box2.textColor="#87ffcf"
    box2.fontFace="rmmz-mainfont"
    box2.fillRoundedRect(0,0,610,300,20, "#2A5C50");
    box2.clearRect(4,4,602,292);
    box2.fillRect(6,12,598,48,"#2A5C5055")
    box2.drawText("能力",6,15,598,48,"center")
    this.addBit("box2",box2)
    this.setAdorn("box2","box2","",null,"100%","100%",60,385,1,7,1)
}
Lim_dosBack.prototype.drawBox3=function () {
    let box3=new Bitmap(610,300)
    box3.fontSize=24
    box3.fontBold=true
    box3.textColor="#87ffcf"
    box3.fontFace="rmmz-mainfont"
    box3.fillRoundedRect(0,0,610,300,20, "#2A5C50");
    box3.clearRect(4,4,602,292);
    box3.fillRect(6,12,598,48,"#2A5C5055")
    box3.drawText("动机",6,15,598,48,"center")
    this.addBit("box3",box3)
    this.setAdorn("box3","box3","",null,"100%","100%",60,710,1,7,1)
}

function Lim_dosCogni() {
    this.initialize.apply(this, arguments);
}
Lim_dosCogni.prototype = Object.create(Cotton.prototype);
Lim_dosCogni.prototype.constructor = Lim_dosCogni;
Lim_dosCogni.prototype.initialize = function (orgin) {
    Cotton.prototype.initialize.call(this,orgin)
};
Lim_dosCogni.prototype.initAdorn=function (){
    this.drawCont()
    this.drawBack()
    this.drawTitle()
    this.drawBox1()
    this.drawBox2()
    this.drawBox3()
}
Lim_dosCogni.prototype.drawCont=function () {
    let cont = new Bitmap(Graphics.width, Graphics.height);
    let colors = ["#22322C", "#1F2A27"];
    for (let i = 0; i < 12; i++) {
        for (let j = 0; j < 17; j++) {
            let colorIndex = (i + j) % 2;
            cont.fillRect(64 * i, 64 * j, 64, 64, colors[colorIndex]);
        }
    }
    this.addBit("cont",cont)
    this.setAdorn("cont","cont","",null,"100%","100%",0,0,1,5,1)
}
Lim_dosCogni.prototype.drawBack=function () {
    let back=new Bitmap(Graphics.width,Graphics.height)
    back.fillAll("#253932")
    back.clearRoundRect(20,20,Graphics.width-40,Graphics.height-40,80)
    this.addBit("back",back)
    this.setAdorn("back","back","",null,"100%","100%",0,0,1,5,1)
}
Lim_dosCogni.prototype.drawTitle=function () {
    let q=new Bitmap(610,200)
    q.fontSize=24
    q.fontBold=true
    q.textColor="#87ffcf"
    q.fontFace="rmmz-mainfont"
    q.fillRoundedRect(16,0,578,129,20, "#2A5C50");
    q.clearRect(20,4,570,121);
    q.fillRect(24,12,562,48,"#2A5C5055")
    q.fillRect(24,71,562,48,"#2A5C5055")
  
    q.drawText("逻辑:",2,12,150,48,"center")
    q.drawText("+++",155,12,150,48,"left")
    
    q.drawText("运算:",2,71,150,48,"center")
    q.drawText("+++",155,71,150,48,"left")
    
    q.drawText("驱动:",307,12,150,48,"center")
    q.drawText("+++",460,12,150,48,"left")
    
    this.addBit("q",q)
    this.setAdorn("q","q","",null,"100%","100%",60,76,1,7,1)
}
Lim_dosCogni.prototype.drawBox1=function () {
    let box1=new Bitmap(610,250)
    box1.fontSize=24
    box1.fontBold=true
    box1.textColor="#87ffcf"
    box1.fontFace="rmmz-mainfont"
    box1.fillRoundedRect(0,0,610,250,20, "#2A5C50");
    box1.clearRect(4,4,602,242);
    box1.fillRect(6,12,598,48,"#2A5C5055")
    box1.drawText("人格模板",6,15,598,48,"center")
    this.addBit("box1",box1)
    this.setAdorn("box1","box1","",null,"100%","100%",60,240,1,7,1)
}
Lim_dosCogni.prototype.drawBox2=function () {
    let box2=new Bitmap(610,250)
    box2.fontSize=24
    box2.fontBold=true
    box2.textColor="#87ffcf"
    box2.fontFace="rmmz-mainfont"
    box2.fillRoundedRect(0,0,610,250,20, "#2A5C50");
    box2.clearRect(4,4,602,242);
    box2.fillRect(6,12,598,48,"#2A5C5055")
    box2.drawText("意识循环",6,15,598,48,"center")
    this.addBit("box2",box2)
    this.setAdorn("box2","box2","",null,"100%","100%",60,500,1,7,1)
}
Lim_dosCogni.prototype.drawBox3=function () {
    let box3=new Bitmap(610,250)
    box3.fontSize=24
    box3.fontBold=true
    box3.textColor="#87ffcf"
    box3.fontFace="rmmz-mainfont"
    box3.fillRoundedRect(0,0,610,250,20, "#2A5C50");
    box3.clearRect(4,4,602,242);
    box3.fillRect(6,12,598,48,"#2A5C5055")
    box3.drawText("响应策略",6,15,598,48,"center")
    this.addBit("box3",box3)
    this.setAdorn("box3","box3","",null,"100%","100%",60,760,1,7,1)
}




function Lim_dosSecret() {
    this.initialize.apply(this, arguments);
}
Lim_dosSecret.prototype = Object.create(Cotton.prototype);
Lim_dosSecret.prototype.constructor = Lim_dosSecret;
Lim_dosSecret.prototype.initialize = function (orgin) {
    Cotton.prototype.initialize.call(this,orgin)
};
Lim_dosSecret.prototype.initAdorn=function (){
    this.drawCont()
    this.drawBack()
    this.drawBox1()
}
Lim_dosSecret.prototype.drawCont=function () {
    let cont = new Bitmap(Graphics.width, Graphics.height);
    let colors = ["#22322C", "#1F2A27"];
    for (let i = 0; i < 12; i++) {
        for (let j = 0; j < 17; j++) {
            let colorIndex = (i + j) % 2;
            cont.fillRect(64 * i, 64 * j, 64, 64, colors[colorIndex]);
        }
    }
    this.addBit("cont",cont)
    this.setAdorn("cont","cont","",null,"100%","100%",0,0,1,5,1)
}
Lim_dosSecret.prototype.drawBack=function () {
    let back=new Bitmap(Graphics.width,Graphics.height)
    back.fillAll("#253932")
    back.clearRoundRect(20,20,Graphics.width-40,Graphics.height-40,80)
    this.addBit("back",back)
    this.setAdorn("back","back","",null,"100%","100%",0,0,1,5,1)
}
Lim_dosSecret.prototype.drawBox1=function () {
    let box1=new Bitmap(300,570)
    box1.fillRoundedRect(0,0,300,570,20, "#2A5C50");
    box1.clearRect(4,4,292,562);
    this.addBit("box1",box1)
    this.setAdorn("box1","box1","",null,"100%","100%",45,75,1,7,1)

    let box2=new Bitmap(300,570)
    box2.fillRoundedRect(0,0,300,570,20, "#2A5C50");
    box2.clearRect(4,4,292,562);
    this.addBit("box2",box2)
    this.setAdorn("box2","box2","",null,"100%","100%",-45,75,1,9,1)
    
    let box3=new Bitmap(630,350)
    box3.fillRoundedRect(0,0,630,350,20, "#2A5C50");
    box3.clearRect(4,4,622,342);
    this.addBit("box3",box3)
    this.setAdorn("box3","box3","",null,"100%","100%",45,660,1,7,1)
    
}