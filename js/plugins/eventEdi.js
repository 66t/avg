var Edishow=false


Graphics._onKeyDown = function(event) {
    if (!event.ctrlKey && !event.altKey) {
        switch (event.keyCode) {
            case 113: // F2
                event.preventDefault();
                this._switchFPSCounter();
                break;
            case 114: // F3
                event.preventDefault();
                this._switchStretchMode();
                break;
            case 115: // F4
                event.preventDefault();
                this._switchFullScreen();
                break;
            case 27: // F7
            case 118: // F7
                Edishow=!Edishow
                document.getElementById("edi").style.display=Edishow?"block":"none"
                break;
        }
    }
};
SceneManager.update = function(deltaTime) {
    if(!Edishow)
      try {
        const n = this.determineRepeatNumber(deltaTime);
        for (let i = 0; i < n; i++) {
            this.updateMain();
        }
    } 
      catch (e) {
        this.catchException(e);
    }
};


var vue
function initVue(){
   vue= new Vue({
        el: "#edi",
        data:{
          select:0,
          eventImg:StorageManager.eventImg(),
          data:$dataEvent[0],  
          imgshow:false,
          choose:0,
          bool:false  
        },
        methods: {
            setSelectedEvent() {
                $gameVariables.setValue(1, this.select);
                Edishow=!Edishow
                document.getElementById("edi").style.display=Edishow?"block":"none"
            },
            loadEventData() {
                this.data = $dataEvent[this.select];
                this.choose = 0
                this.bool=false
            },
            toggleImageVisibility(isVisible) {
                this.imgshow = isVisible;
            },
            assignEventIds() {
                for (let i = 0; i < $dataEvent.length; i++) {
                    $dataEvent[i].id = i;
                    $dataEvent[i].sx = parseInt($dataEvent[i].sx);
                    $dataEvent[i].sy = parseInt($dataEvent[i].sy);
                }
                this.$forceUpdate();
            },
            deleteEvent() {
                $dataEvent.splice(this.select, 1);
                this.assignEventIds();
                if (this.select >= $dataEvent.length) this.select--;
                this.loadEventData()
            },
            addNewEvent() {
                $dataEvent.push(JSON.parse(JSON.stringify($dataEvent[this.select])));
                this.assignEventIds();
            },
            initializeEventStorage() {
                StorageManager.saveEvent(JSON.stringify($dataEvent, null, 2), true);
            },
            saveEventData() {
                this.assignEventIds();
                StorageManager.saveEvent(JSON.stringify($dataEvent, null, 2));
            },
            showImagePicker() {
                this.toggleImageVisibility(true);
            },
            addContentEntry() {
                $dataEvent[this.select].cont.push("");
            },
            setEventImage(image) {
                image = image.split(".")[0];
                $dataEvent[this.select].img = image;
            },
            handleInputChange(event) {
                this.$forceUpdate();
                const value = event.target.value;
            },
            deleteContentEntry(index) {
                $dataEvent[this.select].cont.splice(index, 1);
                this.$forceUpdate();
            },
            copyToClipboard(text) {
                navigator.clipboard.writeText(text).then(() => {
                }).catch(err => {
                });
            },
            selectChoose(index) {
                this.choose = index
            },
            addChooses() {
                this.data.choose.push( {
                    "text": "",
                    "mes": [],
                    "disable": "",
                    "hidden": "",
                    "visible": "",
                    "enabled": ""
                })
                this.$forceUpdate();
            },
            delChoose() {
                this.data.choose.splice(this.choose, 1);
                if (this.choose >= this.data.choose.length) this.choose--;
                this.$forceUpdate();
            },
            deleteChoose(index){
                this.data.choose[this.choose].mes.splice(index, 1);
                this.$forceUpdate();
            },
            addChoose(){
                this.data.choose[this.choose].mes.push("")
                this.$forceUpdate();
            },
            handleKeydown(data,v,event) {
                if (event.key === 'Backspace') {
                    const input = event.target; 
                    const start = input.selectionStart; 
                    const end = input.selectionEnd;
                    // 如果没有选中内容，删除光标前的字符
                    if (start === end) {
                        // 只在光标前删除一个字符
                        data[v] = data[v].slice(0, start - 1) + data[v].slice(end);
                        setTimeout(()=>{  input.setSelectionRange(start - 1, start - 1);},10)
                      
                    } else {
                        // 如果有选中内容，直接删除选中的内容
                        data[v] = data[v].slice(0, start) + data[v].slice(end);
                        setTimeout(()=>{  input.setSelectionRange(start, start);},10)
                    }
                    this.$forceUpdate(); // 强制更新视图
                }
            }
        },
        created: function () {
            this.initializeEventStorage()
        }
    })
}



Scene_Boot.prototype.start = function() {
    Scene_Base.prototype.start.call(this);
    SoundManager.preloadImportantSounds();
    if (DataManager.isBattleTest()) {
        DataManager.setupBattleTest();
        SceneManager.goto(Scene_Battle);
    } 
    else if (DataManager.isEventTest()) {
        DataManager.setupEventTest();
        SceneManager.goto(Scene_Map);
    } 
    else if (DataManager.isTitleSkip()) {
        this.checkPlayerLocation();
        DataManager.setupNewGame();
        SceneManager.goto(Scene_Map);
    } 
    else {
        this.startNormalGame();
    }
    this.resizeScreen();
    this.updateDocumentTitle();
    vue=initVue()
};

StorageManager.fileDataPath = function() {
    const path = require("path");
    const base = path.dirname(process.mainModule.filename);
    return path.join(base, "data/");
};
StorageManager.saveEvent = function(text,bool) {
    const dirPath = this.fileDataPath();
    const filePath = dirPath+"Event"+(bool?"_backup":"")+".json"
    const backupFilePath = filePath + "_";
    return new Promise((resolve, reject) => {
        this.fsMkdir(dirPath);
        this.fsUnlink(backupFilePath);
        this.fsRename(filePath, backupFilePath);
        try {
            this.fsWriteFile(filePath, text);
            this.fsUnlink(backupFilePath);
            resolve();
        } catch (e) {
            try {
                this.fsUnlink(filePath);
                this.fsRename(backupFilePath, filePath);
            } catch (e2) {}
            reject(e);
        }
    });
};
StorageManager.eventImg = function() {
    const path = require("path");
    const base = path.dirname(process.mainModule.filename)+"img/event";
    const fs = require('fs');
    const arr=[]
    fs.readdir(base, (err, files) => {
        files.forEach(file => {arr.push(file)});
    });
    return arr
    
}

    

