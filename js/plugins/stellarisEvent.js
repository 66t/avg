/*:
 * @target MZ
 * @plugindesc stellarisEvent
 * @author setchuka
 * -----------------------------------------------------------------------------
 */
class Expression {
    static evaluate(expression) {
        const regex = /\$\{([^}]+)\}/g;
        expression = expression.replace(regex, (match, capturedValue) => {
            return this.processValue(capturedValue);
        });
        const safeExpression = expression
            .replace(/=/g, '==')
            .replace(/&/g, '&&')
            .replace(/\|/g, '||')
        try { return eval(safeExpression);}
        catch (error) { return false;}
    }
    static processValue(value) {
        let type=value.substring(0,1)
        let num=parseInt(value.slice(1))
        switch (type){
            case "v": $gameVariables.value(num);break
                return
            case "s":
                return $gameSwitches.value(num);break
            case "p":
                const item = $dataItems[num];
                return $gameParty.numItems(item);break
            case "g":
                return $gameParty.gold();break
        }
    }
}

//数据
$dataEvent = null;
DataManager._databaseFiles = [
    { name: "$dataActors", src: "Actors.json" },
    { name: "$dataEvent", src: "Event.json" },
    { name: "$dataClasses", src: "Classes.json" },
    { name: "$dataSkills", src: "Skills.json" },
    { name: "$dataItems", src: "Items.json" },
    { name: "$dataWeapons", src: "Weapons.json" },
    { name: "$dataArmors", src: "Armors.json" },
    { name: "$dataEnemies", src: "Enemies.json" },
    { name: "$dataTroops", src: "Troops.json" },
    { name: "$dataStates", src: "States.json" },
    { name: "$dataAnimations", src: "Animations.json" },
    { name: "$dataTilesets", src: "Tilesets.json" },
    { name: "$dataCommonEvents", src: "CommonEvents.json" },
    { name: "$dataSystem", src: "System.json" },
    { name: "$dataMapInfos", src: "MapInfos.json" }
]

Scene_Map.prototype.update = function() {
    Scene_Message.prototype.update.call(this);
    this.updateDestination();
    this.updateMenuButton();
    this.updateMapNameWindow();
    this.updateMainMultiply();
    if (this.isSceneChangeOk()) {
        this.updateScene();
    } else if (SceneManager.isNextScene(Scene_Battle)) {
        this.updateEncounterEffect();
    }
    this.updateWaitCount();
    $gamePlayer.locate(0,0);
};

LIM.Event={id:0}
//改指选择项
Game_Interpreter.prototype.setupChoices = function(params) {
    LIM.Event.choices = params[0].clone();
    LIM.Event.cancelType = params[1] <LIM.Event.choices.length ? params[1] : -2;
    LIM.Event.defaultType = params.length > 2 ? params[2] : 0;
};
Game_Message.prototype.add = function(text) {
    LIM.Event.mes=text
};
Game_Message.prototype.isBusy = function() {
    return (
        this.hasText() ||
        LIM.Event.choices ||
        LIM.Event.mes ||
        this.isNumberInput() ||
        this.isItemChoice()
    );
};
//取消玩家移动 并添加事件显示名称
Game_Player.prototype.getInputDirection = function() {return 0;};
Game_Player.prototype.executeMove = function() {
    this.locate($gameTemp.destinationX(),$gameTemp.destinationY()-1)
    this.moveStraight(2);
};
Sprite_Character.prototype.initialize = function(character) {
    Sprite.prototype.initialize.call(this);
    this.initMembers();
    this.setCharacter(character);

    if($dataMap.events[character._eventId]&&$dataMap.events[character._eventId].note) {
        const name=$dataMap.events[character._eventId].note
        this._spname = new Sprite(new Bitmap(450, 30));
        this._spname.bitmap.fontSize=24
        this._spname.bitmap.outlineColor="#14796c"
        this._spname.bitmap.fontFace="rmmz-mainfont"
        this._spname.bitmap.drawText(name,0,0,450,30,"left")
        this.addChild(this._spname);
    }
};
Scene_Map.prototype.createAllWindows = function() {
    this.createMapNameWindow();
    Scene_Message.prototype.createAllWindows.call(this);
    new Lim_mesScenes(this)
};
Scene_Map.prototype.terminate = function() {
    Scene_Message.prototype.terminate.call(this);
    if (!SceneManager.isNextScene(Scene_Battle)) {
        this._spriteset.update();
        this._mapNameWindow.hide();
        this.hideMenuButton();
        SceneManager.snapForBackground();
    }
    for(let obj of this.children) if(obj instanceof Weaver) obj.death()
}
function Lim_mesScenes(){this.initialize.apply(this, arguments);}
Lim_mesScenes.prototype = Object.create(Weaver.prototype);
Lim_mesScenes.prototype.constructor = Lim_mesScenes;
Lim_mesScenes.prototype.initialize = function(orgin) {
    Weaver.prototype.initialize.call(this,orgin)
    
}
Lim_mesScenes.prototype.loop=function (){
    if(this._mod===0&&LIM.Event.mes){
        this.modify(1)
    }
    else if(this._mod===1) {
        if(!LIM.Event.mes&&!this.hidemes) {
            this._window["message"].stop()
            LIM.Event.mes = []
            this.hidemes=true
            this._window["message"].alpha
            this.time=0
        }
        else if(this.hidemes){
            this.time++
            this._window["message"].alpha=1-this.time*0.04
            if(this.time===25) {
                this.hidemes=false
                LIM.Event.mes = null
                this._window["message"].alpha=1
                this.modify(0)
            }
        }
    }
    
    if(this._mod===0&&LIM.Event.choices){
        this.modify(2)
    }
    else if(this._mod===2){
        if(!LIM.Event.choices&&!this.hideChoices) {
            this._window["choice"].stop()
            LIM.Event.choices = []
            this.hideChoices=true
            this._window["choice"].filters=[new PIXI.filters.KawaseBlurFilter]
            this._window["choice"].alpha=1
            this._window["choice"].filters[0].quality=0
            this._window["choice"].filters[0].blur=0
            this._window["choice"].filters[0]._pixelSize.x=0
            this._window["choice"].filters[0]._pixelSize.y=0
            this.time=0
        }
        else if(this.hideChoices){
            this.time++
            this._window["choice"].filters[0].quality=0.4*this.time
            this._window["choice"].filters[0].blur=0.4*this.time
            this._window["choice"].filters[0]._pixelSize.x=-0.4*this.time
            this._window["choice"].filters[0]._pixelSize.y=-0.4*this.time
            this._window["choice"].alpha=1-(this.time*0.04)
            if(this.time===25) {
                this.hideChoices=false
                LIM.Event.choices = null
                this._window["choice"].filters=[]
                this.modify(0)
            }
        }
    }

}
Lim_mesScenes.prototype.install = function (){
    Weaver.prototype.install.call(this)
    this._window["choice"]=new Lim_choice(this)
    this._window["message"]=new Lim_Message(this)
   
}
Lim_mesScenes.prototype.execute=function (){
    Weaver.prototype.execute.call(this)
    this.modify(0)
}
Lim_mesScenes.prototype.stateStore=function (){
    this._state={
        0:{"choice":[0,0],  "message":[0,0]},
        1:{"choice":[0,0],  "message":[1,1]},
        2:{"choice":[1,1],  "message":[0,0]},
    }
}
Lim_mesScenes.prototype.drawTxt = function (cont, eve, sw = 0) {
    const LINE_HEIGHT = 22;
    const MAX_WIDTH = 428 + sw;
    const ICON_SIZE = 20;
    const TEXT_COLORS = {
        "T": "#C51a2a", "t": "#C51a2a",
        "O": "#fbaa29", "o": "#fbaa29",
        "Y": "#f7fc34", "y": "#f7fc34",
        "W": "#fff", "w": "#fff",
        "G": "#29e126", "g": "#29e126",
        "R": "#fc5646", "r": "#fc5646",
        "B": "#2986e1", "b": "#2986e1",
        "P": "#d291ff", "p": "#d291ff",
        "F": "#ffbbcc", "f": "#ffbbcc",
        "C": "#09e6e1", "c": "#09e6e1",
        "Z": "#c1328e", "z": "#c1328e",
        "D": "#888", "d": "#888",
        "~": "#87ffcf"
    };
    let h = 30;
    let x = 32, y = 12;
    let po = false, mode = 0, pw = 0;
    let px = 0, py = 0;
    const pb = new Bitmap(1000, 25);
    cont.clear();
    cont.fontSize = 18;
    cont.fontBold = false;
    cont.outlineColor = "#0008";
    cont.textColor = "#87ffcf";
    for (let mes of eve) {
        mes = this.replacePlaceholders(mes);
        let buffer = '';
        let isCommand = false;
        for (let i = 0; i < mes.length; i++) {
            let char = mes[i];
            if (char === "|" && mes[i + 1] === ")") {
                isCommand = true;
                i++;
                buffer = '';
            } 
            else if (isCommand) {
                if (char === "(") {
                    isCommand = false;
                    executeCommand(buffer);
                } 
                else {buffer += char;}
            } 
            else {
                renderTextChar(char);
            }
        }
        finalizeLine();
        y += LINE_HEIGHT;
        h += LINE_HEIGHT;
        x = 32;
    }
    return h - 7;
    function executeCommand(command) {
        if (command.length === 1) {
            switch (command) {
                case "$":
                    po = !po;
                    if (po) {
                        pw = 0;
                        pb.clear();
                        mode = 0;
                    } else {
                        cont.blt(pb, 0, 0, 1000, 25, (cont.width - pw) / 2, y, 1000, 25);
                        pw = 0;
                        pb.clear();
                        mode = 0;
                    }
                    break;
                case "+":
                    mode = 1; break;
                case "-":
                    mode = 2; break;
                case "*":
                    mode = 3; break;
                case "/":
                    mode = 4; break;
                case "&":
                    if (mode === 4) {
                        highlightText();
                    }
                    mode = 0; break;
                case "x":
                case "X":
                    if (!po) {
                        if (mode === 4) highlightText();
                        y += LINE_HEIGHT;
                        h += LINE_HEIGHT;
                        x = 14;
                    }
                    break;
                case "#":
                    x = -4; break;
                case "!":
                    cont.fontBold = true; break;
                case "~":
                    resetFormatting(); break;
                default:
                    if (TEXT_COLORS[command]) {
                        cont.textColor = TEXT_COLORS[command];
                        cont.fontBold = (command.toUpperCase() === command);
                    }
            }
        } else {
            const [cmd, arg] = command.split("-");
            if (cmd === "i") {
                renderIcon(arg);
            }
        }
    }
    function renderTextChar(char) {
        let charWidth = cont.measureTextWidth(char);

        if (po) {
            renderPlaceholderText(char, charWidth);
        } else {
            if (x > MAX_WIDTH && !["：", "。", "，", "？"].includes(char)) {
                if (mode === 4) highlightText();
                y += LINE_HEIGHT;
                h += LINE_HEIGHT;
                x = 14;
            }
            cont.drawText(char, x, y, 50, LINE_HEIGHT, "left");
            drawFormatting(charWidth);
            x += charWidth;
        }
    }
    function renderPlaceholderText(char, charWidth) {
        pb.textColor = cont.textColor;
        pb.fontSize = cont.fontSize;
        pb.fontBold = cont.fontBold;
        pb.outlineColor = cont.outlineColor;
        pb.drawText(char, pw, 0, 50, LINE_HEIGHT, "left");
        pw += charWidth;
    }
    function highlightText() {
        cont.fillRect(px, py, x - px, 20, "#87ffcf88");
        px = 0;
        py = 0;
    }
    function drawFormatting(charWidth) {
        if (x <= MAX_WIDTH) {
            switch (mode) {
                case 1:
                    cont.fillRect(x, y + 21, charWidth, 1, "#87ffcf"); break;
                case 2:
                    cont.fillRect(x, y + 11, charWidth, 2, "#87ffcfbb"); break;
                case 3:
                    cont.clearRect(x + Math.randomInt(charWidth / 1.5), y + Math.randomInt(15), charWidth / 4, 5);
                    cont.clearRect(x + Math.randomInt(charWidth / 1.33), y + Math.randomInt(13), charWidth / 3, 7);
                    break;
                case 4:
                    if (!px && !py) {
                        px = x;
                        py = y;
                    }
                    break;
            }
        }
    }
    function renderIcon(index) {
        if (x > MAX_WIDTH) {
            y += LINE_HEIGHT;
            h += LINE_HEIGHT;
            x = 14;
        }
        const bitmap = ImageManager.loadSystem("IconSet");
        const pw = ImageManager.iconWidth;
        const ph = ImageManager.iconHeight;
        const sx = (index % 16) * pw;
        const sy = Math.floor(index / 16) * ph;
        x += 8;
        cont.blt(bitmap, sx, sy, pw, ph, x, y + 1, ICON_SIZE, ICON_SIZE);
        x += ICON_SIZE + 4;
    }
    function finalizeLine() {
        if (mode === 4) highlightText();
        if (po) {
            po = false;
            cont.blt(pb, 0, 0, 1000, 25, (cont.width - pw) / 2, y, 1000, 25);
            pw = 0;
            pb.clear();
            mode = 0;
        }
    }
    function resetFormatting() {
        cont.textColor = "#87ffcf";
        cont.fontBold = false;
    }
};

Lim_mesScenes.prototype.replacePlaceholders=function (text) {
    const regex = /\$\{([^}]+)\}/g;
    return text.replace(regex, (match, capturedValue) => {return this.processValue(capturedValue);});
}
Lim_mesScenes.prototype.processValue=function (value) {
    let type=value.substring(0,1)
    let num=value.slice(1)
    switch (type){
        //O  对话
        //W  基础概念
        case "i":
            return ` |)W(${$dataItems[num].name}|)~( `
        //R  事件概念
        case "w":
            return ` |)R(${$dataWeapons[num].name}|)~( `
        //Y  抽象概念
        case "e":
            return ` |)Y(${$dataArmors[num].name}|)~( `
        //G  设定概念
        case "s":
            return ` |)G(${$dataSkills[num].name}|)~( `
        //B  角色   
        case "p":
            return ` |)B(${$dataActors[num].name}|)~( `
        case "q":
            return ` |)B(${$dataActors[num].nickname}|)~( `
        //n  能力  
        case "n":
            return ` |)P(${$dataStates[num].name}|)~( `

        //Z  典籍
        case "z":
            return ` |)Z(${$dataSystem.equipTypes[num]}|)~( `
        //C  地点   
        case "c":
            return ` |)C(${$dataSystem.weaponTypes[num]}|)~( `
        //F  道具 材料
        case "f":
            return ` |)F(${$dataSystem.armorTypes[num]}|)~( `
        //  俚语
        case "d":
            return ` |)D(${$dataSystem.skillTypes[num]}|)~( `
        //  咒语
        case "b":
            return ` |)T(${$dataSystem.elements[num]}|)~( `
        //!  突出数值
        case "v":
            return ` |)!(${$gameVariables.value(num)||0}|)~( `
        //D
    }
}



function Lim_choice() {
    this.initialize.apply(this, arguments);
}
Lim_choice.prototype = Object.create(Cotton.prototype);
Lim_choice.prototype.constructor = Lim_choice;
Lim_choice.prototype.initialize = function (orgin) {
    Cotton.prototype.initialize.call(this,orgin)
};

Lim_choice.prototype.initImage = function() {
    this.img={
        "Event_top":["ui"],
        "IconSet":["system"]
    }
}
Lim_choice.prototype.initWork=function () {
    this._work = {}
    this.setRun("加载", "initLoad", "condLoad", "endLoad")
    this.setRun("进入动画", "", "condAnime1", "endAnime1")
}
Lim_choice.prototype.initAdorn=function (){
    this.bit_img=new Bitmap(450,150)
    
    this.bit_titleText=new Bitmap(450,30)
    this.bit_titleText.fontSize=24
    this.bit_titleText.fontBold=true
    this.bit_titleText.outlineColor="#14796c"
    this.bit_titleText.fontFace="rmmz-mainfont"

    this.bit_contBor=new Bitmap(465,20)
    this.bit_contTxt=new Bitmap(465,1000)
    this.bit_body=new Bitmap(490,30)

    this.bit_selectRect=new Bitmap(458,40)
    const c1 = "#16ff8f"
    const c2 = "#54eee4"
    this.bit_selectRect.gradientRoundedRect(0,0,458,40,5, c1, c2, true);
    
    this.addBit("select",this.bit_selectRect)
    this.addBit("body",this.bit_body)
    this.addBit("img",this.bit_img)
    this.addBit("title",this.bit_titleText)
    this.addBit("contbor",this.bit_contBor)
    this.addBit("conttxt",this.bit_contTxt)
    this.setAdorn("img","img","",null,"100%","100%",0,55,1,8,1)
    this.setAdorn("top","Event_top","",null,"100%","100%",0,0,1,8,1)
    this.setAdorn("body","body","",null,"100%","100%",0,225,1,8,1)
    this.setAdorn("contbor","contbor","",null,"100%","100%",0,235,1,8,1)
    this.setAdorn("conttxt","conttxt","",null,"100%","100%",0,235,1,8,1)
    this.setAdorn("title","title","",null,"100%","100%",0,5,1,8,1)
    this.setAdorn("select","select","",null,"100%","100%",4,0,1,8,0.33)
    this.setAnime("select",["alpha"],[-11],14)
}

Lim_choice.prototype.execute=function (){
    Cotton.prototype.execute.call(this)
    this.setHandler()
    this.setInput(["down","up","ok"])
}
Lim_choice.prototype.setHandler = function() {
    this.spHandler("conttxt", "D")
    this.touchAdorn("conttxt",true)
}
Lim_choice.prototype.start=function (){
    this._stop=false
    this.data_event=$dataEvent[LIM.Event.id]
    let f=new PIXI.filters.KawaseBlurFilter
    this.filters=[f]
    f.quality=10
    f.blur=10
    f._pixelSize.x=10
    f._pixelSize.y=10
    this.work("加载")
}
Lim_choice.prototype.condAnime1= function(){
    if(this.run.time > 30) return true
    let a=1-LIM.UTILS.sinNum(30, this.run.time)
    let f=this.filters[0]
    f.quality=a*10
    f.blur=a*10
    f._pixelSize.x=3+a*7
    f._pixelSize.y=3+a*7
}
Lim_choice.prototype.endAnime1= function(){
    this.filters=[]
}

Lim_choice.prototype.initLoad=function (){
    this.loadimg=false
    this.alpha=0
    let img=ImageManager.loadBitmap(`img/event/`, this.data_event.img)
    img.addLoadListener(() => {
        this.loadimg=true
        this.bit_img.blt(img,(img.width-450)/2+(this.data_event.sx||0),(img.height-150)/2+(this.data_event.sy||0),450,150,0,0,450,150)
        this.drawTitle()
        this.drawCont()
    })
}
Lim_choice.prototype.condLoad=function (){
    return this.loadimg
}
Lim_choice.prototype.endLoad=function (){
    this.work("进入动画")
    this.alpha=1
}
Lim_choice.prototype.itemRect=function () {
}
Lim_choice.prototype.drawTitle=function () {
    this.bit_titleText.clear()
    this.bit_titleText.drawText(this.data_event.title,0,0,250,30,"left")
}
Lim_choice.prototype.drawCont=function () {
    let h=this._orgin.drawTxt(this.bit_contTxt,this.data_event.cont)
    this.bit_contBor.resize(465,h)
    this.adorn.move("contbor",{w:465,h:this.bit_contBor.height})
    this.bit_contBor.fillRect(0,0,this.bit_contBor.width,this.bit_contBor.height,"#14796c")
    this.bit_contBor.clearRect(2,2,this.bit_contBor.width-4,this.bit_contBor.height-4)
    this.bit_contBor.fillRect(2,2,this.bit_contBor.width-4,this.bit_contBor.height-4,"#29373280")
    this.data_index=LIM.Event.defaultType
    this.data_oldindex=[]
    this.data_esc=LIM.Event.cancelType
    if(this.data_index<0) this.adorn.move("select",{alpha:-1})
    h=this.drawSelect(this.bit_contTxt,h)
    let body=this.grabBit("Event_body")
    this.bit_body.resize(490,h+20)
    this.bit_body.fillAll("#121916")
    const sh=225+h+20
    this.data_sy=(Graphics.height-sh)/2
    this.adorn.move("top",{y:this.data_sy})
    this.adorn.move("body",{w:490,h:h+20,y:this.data_sy+225})
    this.adorn.move("img",{y:this.data_sy+55})
    this.adorn.move("title",{y:this.data_sy+3})
    this.adorn.move("contbor",{y:this.data_sy+235})
    this.adorn.move("conttxt",{y:this.data_sy+235})
    this.selectIndex(this.data_index)
}
Lim_choice.prototype.drawSelect=function (cont,h) {
    let num=0
    let dis=true
    let ena=true
    let hid=true
    let vis=true
    const choose=this.data_event.choose
    let text,mes,ico,color
    this.data_select=[]
  
    for (let i=0;i<LIM.Event.choices.length;i++) {
        if(choose[i]) {
            dis = choose[i].disable.length ? Expression.evaluate(choose[i].disable) : true
            ena = choose[i].enabled.length ? Expression.evaluate(choose[i].enabled) : true
            hid = choose[i].hidden.length ? Expression.evaluate(choose[i].hidden) : true
            vis = choose[i].visible.length ? Expression.evaluate(choose[i].visible) : true
            if (hid && vis) {
                text = choose[i] ? choose[i].text : text
                mes = choose[i] ? choose[i].mes : mes
                ico = choose[i] ? choose[i].ico : ico
                color = choose[i] ? choose[i].color :color
                this.data_select.push({text,mes,num,bool:ena&&dis,ico,color})
                num++
            }
        }
        else if(hid&&vis&&text) {
            this.data_select.push({text,mes,num,bool:ena&&dis,ico,color})
            num++
        }
    }
    cont.fontSize=20
    cont.fontBold=false
    cont.textColor="#fff"
    h+=20
    for(const s of this.data_select){
        cont.outlineColor=s.bool?"#14796c":"#14796c66"
        cont.textColor=s.bool?"#fff":"#fff6"
        let rect={x:9,y:h,w:458,h:40}
        if(s.color) cont.outlineColor=("#"+s.color)+(!s.bool?"44":"")
        else cont.outlineColor="#14796c"+(!s.bool?"44":"")
        cont.textColor=s.bool?"#fff":"#fff4"
        const c1 = ColorManager.itemBackColor1();
        const c2 = ColorManager.itemBackColor2();
        const text= this._orgin.replacePlaceholders(s.text)
        const w= cont.measureTextWidth(text)
        cont.gradientRoundedRect(rect.x, rect.y, rect.w, rect.h,5, c2, c1, true);
        let sqx=0
        if(s.ico){
            const bitmap = this.grabBit("IconSet")
            const pw = ImageManager.iconWidth;
            const ph = ImageManager.iconHeight;
            const sx = (s.ico % 16) * pw;
            const sy = Math.floor(s.ico / 16) * ph;
            const x1=60
            sqx+=40
            cont.blt(bitmap, sx, sy, pw, ph, rect.x+(rect.w-w+sqx)/2-40,rect.y+4);
        }
        
        cont.drawText(s.text,rect.x+(rect.w-w+sqx)/2,rect.y,rect.w,rect.h,"left")
        h+=45
        s.rect=rect
    }
    return h
}
Lim_choice.prototype.selectIndex=function (index){
    this.data_index=index
    this.adorn.move("select",{y:this.data_sy+235+(this.data_select[0].rect.y-1)+45*this.data_index})
}
Lim_choice.prototype.selectOk=function (index){
    if(this.data_select[this.data_index].bool){
        SoundManager.playOk()
        LIM.Event={id:LIM.Event.id}
        $gameMessage.add(this._orgin.replacePlaceholders( this.data_select[this.data_index].mes.join("|)x(")));
        $gameMap._interpreter._branch[$gameMap._interpreter._indent]=this.data_index
    }
    else SoundManager.playBuzzer()
}
Lim_choice.prototype.D_E=function(data){
    this.evokeAdorn("conttxt",true)
}
Lim_choice.prototype.D_Q=function(data){
    this.evokeAdorn("conttxt",false)
}
Lim_choice.prototype.D_D=function(data,pos){
    let bool=false
    for(let i=0;i<this.data_select.length;i++){
        let rect=this.data_select[i].rect
        if(pos[0]>rect.x&&
            pos[0]<rect.x+rect.w&&
            pos[1]>rect.y&&
            pos[1]<rect.y+rect.h){
            bool=true
        }
    }
    if(this.data_index>-1&&bool){this.selectOk(this.data_index)}
}
Lim_choice.prototype.D_T=function(data,pos){
    for(let i=0;i<this.data_select.length;i++){
        let rect=this.data_select[i].rect
        if(pos[0]>rect.x&&
           pos[0]<rect.x+rect.w&& 
           pos[1]>rect.y&&
           pos[1]<rect.y+rect.h){
             if((this.data_index!==i&&!this.data_oldindex.includes(i))||this.sindex!==i) {
                 this.data_oldindex=[]
                 this.sindex=this.data_index
                 this.selectIndex(i)
                 return 
             }
        }
    }
}
Lim_choice.prototype.D_N=function(data,pos){
    this.D_T(data,pos)
}
Lim_choice.prototype.Repe_up_0=function (){
    this.data_oldindex.push(this.data_index)
    this.selectIndex(this.data_index>0?(this.data_index-1):(this.data_select.length-1))
    SoundManager.playCursor()
}
Lim_choice.prototype.Repe_down_0=function (){
    this.data_oldindex.push(this.data_index)
    this.selectIndex(this.data_index<this.data_select.length-1?(this.data_index+1):(0))
    SoundManager.playCursor()
}
Lim_choice.prototype.Trigger_ok_0=function (){
    this.selectOk(this.data_index)
}







function Lim_Message() {
    this.initialize.apply(this, arguments);
}
Lim_Message.prototype = Object.create(Cotton.prototype);
Lim_Message.prototype.constructor = Lim_choice;
Lim_Message.prototype.initialize = function (orgin) {
    Cotton.prototype.initialize.call(this,orgin)
};

Lim_Message.prototype.initAdorn=function (){
    this.bit_contBor=new Bitmap(660,20)
    this.bit_contTxt=new Bitmap(660,1000)
    this.bit_contshow=new Bitmap(660,1000)
    this.addBit("contbor",this.bit_contBor)
    this.addBit("conttxt",this.bit_contTxt)
    this.addBit("contshow",this.bit_contshow)
    this.setAdorn("contbor","contbor","",null,"100%","100%",0,1000,1,2,1)
    this.setAdorn("conttxt","conttxt","",null,"100%","100%",0,1000,1,2,1)
    this.setAdorn("contshow","contshow","",null,"100%","100%",0,0,1,8,1)
}
Lim_Message.prototype.start=function (){
    this._stop=false
    this.work("进入动画")
    this.drawCont()
}

Lim_Message.prototype.initWork=function () {
    this._work = {}
    this.setRun("进入动画", "initAnime1", "condAnime1", "endAnime1")
}
Lim_Message.prototype.initAnime1= function(){
    let f=new PIXI.filters.PixelateFilter
    this.filters=[f]
    f.size.x=16
    f.size.y=16
    
}
Lim_Message.prototype.condAnime1= function(){
    if(this.run.time > 25) return true
    let a=1-LIM.UTILS.sinNum(25, this.run.time)
    let f=this.filters[0]
    f.size.x = 15 * a + 1;
    f.size.y = 15 * a + 1;
    this.bit_contshow.clear();
    let h = this.ph / 10;
    let w = h;
    let x = Math.ceil(660 / h);
    let noiseFactor = 300 * a; 
    let timeStep = Date.now() % 10000;
    for (let i = 0; i < x * 10; i++) {
        let row = parseInt(i / x);
        let col = i % x;
        let randomShiftX = (Math.random() - 0.5) * noiseFactor * Math.random();
        let randomShiftY = (Math.random() - 0.5) * noiseFactor * Math.random();
        let glitchY = row * h + (Math.random() < 0.1 ? (Math.random() - 0.5) * 400 * a : 0); 
        let glitchX = col * w + (Math.random() < 0.05 ? (Math.random() - 0.5) * 500 * a : 0);
        let xOffset = randomShiftX * Math.sin(timeStep + i);
        let yOffset = randomShiftY * Math.cos(timeStep + i);
        this.bit_contshow.blt(this.bit_contBor, col * w, row * h, w, h, glitchX + xOffset, glitchY + yOffset);
        this.bit_contshow.blt(this.bit_contTxt, col * w, row * h, w, h, glitchX + xOffset, glitchY + yOffset);
    }
    this.adorn.move("conttxt",{alpha:1-a})
}
Lim_Message.prototype.endAnime1= function(){
    this.filters=[]
}


Lim_Message.prototype.drawCont=function () {
    let h=this._orgin.drawTxt(this.bit_contTxt,[LIM.Event.mes],210)
    this.bit_contBor.resize(660,h)
  
    this.adorn.move("contbor",{w:660,h:this.bit_contBor.height})
    this.bit_contBor.fillRect(0,0,this.bit_contBor.width,this.bit_contBor.height,"#14796c")
    this.bit_contBor.clearRect(2,2,this.bit_contBor.width-4,this.bit_contBor.height-4)
    this.bit_contBor.fillRect(2,2,this.bit_contBor.width-4,this.bit_contBor.height-4,"#293732")
    const sh=h+20
    this.data_sy=(Graphics.height-sh)/2
    this.adorn.move("contshow",{y:this.data_sy})
    this.ph=sh 
}
Lim_Message.prototype.execute=function (){
    Cotton.prototype.execute.call(this)
    this.setInput(["escape","ok"])
}
Lim_Message.prototype.Trigger_ok_0=function (){
   this.off()
}
Lim_Message.prototype.Trigger_escape_0=function (){
    this.off()
    Input._latestButton=""
}
Lim_Message.prototype.outerListen =function (){
    if(TouchInput.isCancelled()||TouchInput.isTriggered()) {
        this.off()
        TouchInput.clear()
    }
}
Lim_Message.prototype.off=function (){
    LIM.Event.mes=null
    SoundManager.playCancel()
}