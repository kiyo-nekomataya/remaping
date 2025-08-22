//  TimeSheet_AE CC ver 1.3   2014/05/04
//
//  TimeSheet_forMac(Win)をjavascriptのみで構成したタイムシートスクリプト
//  TimeSheet_forMac(Win)を使用したレイヤーであればシート編集可能
//  CS6にも対応(Win & Mac)
//
//  ※Mac版でのCommand Key 使用のショートカットを排除(CS6 対応の為)
//
//  ※未対応  2014/0318
//  ・タイムシート書き出し＆読み込み
//
//
//
//  ＝動作確認＝
//  windows7 Enterprise sp1  &   MacOS 10.8
//  AfterEffects CC & CS6
//
//
//
//  著作権は私(curry_egg)にありますが、利用に関しましては商業も含めてフリーとさせていただきます。
//  ただしこのプログラムに関する使用、改変、または配布など全ての障害に対しましては、一切その責任を負いません。
//  自己責任でご利用ください。
//
//  email:   curry_eggs@yahoo.co.jp
//  blog:   http://curryegg.blog.shinobi.jp/
//  twitter account:   curry_eggs


(function()
{
    timesheetAE_CC(this);

    function timesheetAE_CC(thisObj)
    {
        function runScr()
        {
            //オブジェクト
            this.cellLys = new Array();
            this.cell = new Array();
            this.cellName = new Array();
            this.cellFr = new Array();
            this.cellInfo = new Array();
            this.helpDlg = null;
            this.doObj = new Array();   //UNDO & REDO Obj
            this.doObj.cellData = new Array();  //UNDO & REDO Obj
            this.doObj.pageVal = new Array();   //UNDO & REDO Obj
            this.doObj.curCell = new Array();   //UNDO & REDO Obj
            this.doObj.selCell = new Array();   //UNDO & REDO Obj
            this.doObj.cellVis = new Array();    //UNDO & REDO Obj
            this.doObj.Dur = new Array();    //UNDO & REDO Obj
            this.doObj.DurFr = new Array();    //UNDO & REDO Obj
            this.doLV = 0;  //UNDO & REDO Level
            this.doVal = false; //UNDO & REDO 判定

            //Smooth Plug-In
            this.smPlugIn = "OLMSmoother.aex";
            this.smName = "OLM Smoother";
            this.smVal = false; //Smooth PlugIn の有無判別

            //データ
            this.winPos = new Array();  //前回のウインドウ位置
            this.pageVal = 1;   //現在のページ
            this.selCell = new Array(); //選択中のセル
            this.valCurFr = null;   //選択セルの1番目
            this.selNum = "";   //選択セル数指定用
            this.valSLP = new Array();  //スライダーアイコンの位置情報
            this.impCell = null;    //入力データ(数字)
            this.cellData = new Array();    //シートデータ(数字)
            this.opData = new Array();  //入力時のオプションデータ
            this.copyData = new Array();    //コピペ用データ
            this.lastSTR = "";  //入力欄の最後の数字
            this.valLastClick = new Array();    //最後にクリックしたフレーム(shift + alt + click用)

            //バリュー
            this.setupVal = false; //タイムシート起動判定
            this.valLoc = false; //ウインドウ位置の記憶判定
            this.valBIG = false; //ウインドウ固定判定
            this.valBIGG = false;   //ウインドウ絶対固定判定
            this.valCKey = false;   //ColorKey の適用判定
            this.valSM = false; //OLM Smoother の適用判定
            this.valSMRange = 6; //Smoother Range のデフォルト値
            this.valSMCKey = false; //Smoother ColorKey の適用判定
            this.applyVal = true;  //AEに適用後、シートを閉じるか判別
            this.valSL = false; //ウインドウ切り替え判定
            this.valCN = true;  //セル通し番号切り替え判定
            this.selRenVal = true;  //選択セルの連続判定
            this.valMD = false; //マウスクリック判定
            this.curCell = null; //現在選択中のセルタイトル
            this.shiftVal = false;  //shiftKey
            this.altVal = false;    //altKey
            this.valHelp = false;   //helpダイアログのON/OFF
            this.valE = false;  //エラー判定

            this.clVal = 0; //入力基準値
            this.plVal = false; //plus キー判定
            this.miVal = false; //minus キー判定
            this.enterVal = false; //enter キー判別
        }

        runScr.prototype =
        {
            //アプリバージョン確認・エラーコメント
            strErr: "****** CS6 以上じゃないですよっと ******",

            //OS判別
            osChk: function()
            {
                //AE CS バージョン取得
                this.verVal = parseInt(app.version.split(".")[0]) - 5;

                //改行コード用(Win & Mac 両対応)
                if(File.fs == "Windows"){
                    //64bit OSかどうか
                    if(app.version.indexOf("9") == 0 && $.os.indexOf("64") != -1){
                        //AE CS4 Scriptsフォルダパス<64bit OS>
                        this.aePath = "C:/Program Files (x86)/Adobe/Adobe After Effects CS" + this.verVal + "/Support Files/";
                    }else{
                        //AE Scriptsフォルダパス
                        //CS5の場合、小数点あり
                        if(this.verVal == 5){
                            this.verVal = Number(app.version.split("x")[0]) - 5;
                            this.aePath = "C:/Program Files/Adobe/Adobe After Effects CS" + this.verVal + "/Support Files/";
                        //CS6
                        }else if(this.verVal == 6){
                            this.aePath = "C:/Program Files/Adobe/Adobe After Effects CS" + this.verVal + "/Support Files/";
                        //CC
                        }else if(this.verVal == 7){
                            this.aePath = "C:/Program Files/Adobe/Adobe After Effects CC" + "/Support Files/";
                        }
                    }

                    //Windows
                    this.OS = "Win";
                    //改行コード
                    this.CF = "\r\n";
                    //パスのバックスラッシュ
                    this.cN = "\\";
                }else if(File.fs == "Macintosh"){
                    //AE Scriptsフォルダパス
                    //CS5の場合、小数点あり
                    if(this.verVal == 5){
                        this.verVal = Number(app.version.split("x")[0]) - 5;
                        this.aePath = "/Applications/Adobe After Effects CS" + this.verVal + "/";
                    //CS6
                    }else if(this.verVal == 6){
                        this.aePath = "/Applications/Adobe After Effects CS" + this.verVal + "/";
                    //CC
                    }else if(this.verVal == 7){
                        this.aePath = "/Applications/Adobe After Effects CC" + "/";
                    }

                    //Mac
                    this.OS = "Mac";
                    //改行コード
                    this.CF = "\r";
                    //パスのバックスラッシュ
                    this.cN = "/";
                }

                //Scriptsフォルダパス
                this.scFol = this.aePath + "Scripts/";
                //timesheet_AEフォルダパス
                this.tsFol = this.scFol + "TimeSheet_AE/";
                //PlugInフォルダパス
                this.plFol = this.aePath + "Plug-ins/";

                //tab space
                this.tabS = "\t";

                //alert(this.aePath);
            },

            //
            importLib: function()
            {
                //_ts_Lib 読み込み
                //#includepath this.tsFol
                //#include "_ts_Lib.jsx"
            },

            moniChk: function()
            {
                //モニター解像度 チェック
                var chkVal = new Array();
                chkVal = $.screens;
                this.moniSize = [Math.floor(String(chkVal[0]).split(":")[1].split("-")[1]), Math.floor(String(chkVal[0]).split(":")[2])];

                //環境設定を読み込み
                var prefLoad = new Array();
                prefLoad = this.loadPref();

                for(var i=1;i<prefLoad.length;i++){
                    if(i == 1){
                        this.winPos = prefLoad[1];
                    }else if(i == 2){
                        this.valLoc = prefLoad[2];
                    }else if(i == 3){
                        this.valBIG = prefLoad[3];
                        if(this.valBIG){ this.valSL = true; }
                    }else if(i == 4){
                        this.applyVal = prefLoad[4];
                    }else if(i == 5){
                        this.setupVal = prefLoad[5];
                    }
                }

                //モニター解像度が低い場合は強制的に小モード(タスクバー分も考慮 1200→1100)
                if(this.moniSize[1] < 1100){
                    this.valBIG = true;
                    this.valBIGG = true;
                }
            },

            cellChk: function()
            {
                this.actComp = app.project.activeItem;
                if(this.actComp != null){
                    this.FrRate = this.actComp.frameRate;

                    //フレームレート24 or 30 or 60限定
                    if(this.FrRate == 24 || this.FrRate == 30 || this.FrRate == 60){
                        this.Dur = this.actComp.duration;
                        this.DurFr = Math.floor(Number(this.Dur) * Number(this.FrRate));
                        this.DurTime = String(Math.floor(this.Dur)) +" s + "+ String(this.DurFr % this.FrRate) +" k";
                        //alert(this.Dur +"_"+ this.DurFr +"_"+ this.FrRate);
                        var selLys = this.actComp.selectedLayers;
                        for each(var oLy in selLys){
                            //元がコンポとファイル以外のものを排除
                            if(oLy instanceof AVLayer && oLy.source.mainSource != "[object SolidSource]"){
                                this.cellLys.push(oLy);
                            }
                        }
                        //レイヤーのインデックスでソート(降順)
                        if(this.cellLys.length < 1){
                            alert("******有効なセルが選択されていません******");
                            this.valE = true;
                        }else{
                            this.cellLys.sort(this.downIndex);

                            //セル数表示制限
                            if(this.cellLys.length <7){
                                this.cellNum = 6;
                            }else{
                                var maxCell = Math.ceil((this.moniSize[0] - 73) / 120) - 2;
                                if(this.cellLys.length < maxCell){
                                    this.cellNum = this.cellLys.length;
                                }else{
                                    alert("******表示制限 "+ maxCell +"レイヤーを超えています******");
                                    this.valE = true;
                                }
                            }
                        }
                    }else{
                        alert("******コンポのフレームレートは 24 or 30 or 60のみです******");
                        this.valE = true;
                    }
                }else{
                    alert("******コンポ内のレイヤーを選択してください。******");
                    this.valE = true;
                }

                //alert(this.cellLys.length);
            },

            //レイヤーのインデックスでソート(降順)
            downIndex: function(a,b)
            {
                 return (a.index < b.index) ? 1 : -1 ;
            },

            //undo & redo(10回制限)
            doFunc: function(bSelf,oID)
            {
                //UNDO or REDO じゃない場合
                if(oID == "MEMO"){
                    //UNDO の途中で更新した場合
                    if(bSelf.doVal && bSelf.doLV < bSelf.doObj.pageVal.length){
                        var rNum = bSelf.doObj.pageVal.length - bSelf.doLV;
                        //配列を反転
                        bSelf.doObj.pageVal.reverse();
                        bSelf.doObj.cellData.reverse();
                        bSelf.doObj.curCell.reverse();
                        bSelf.doObj.selCell.reverse();
                        bSelf.doObj.cellVis.reverse();
                        bSelf.doObj.Dur.reverse();
                        bSelf.doObj.DurFr.reverse();
                        //履歴を削除
                        for(var r=0;r<rNum;r++){
                            bSelf.doObj.pageVal.shift();
                            bSelf.doObj.cellData.shift();
                            bSelf.doObj.curCell.shift();
                            bSelf.doObj.selCell.shift();
                            bSelf.doObj.cellVis.shift();
                            bSelf.doObj.Dur.shift();
                            bSelf.doObj.DurFr.shift();
                        }
                        //元に戻す
                        bSelf.doObj.pageVal.reverse();
                        bSelf.doObj.cellData.reverse();
                        bSelf.doObj.curCell.reverse();
                        bSelf.doObj.selCell.reverse();
                        bSelf.doObj.cellVis.reverse();
                        bSelf.doObj.Dur.reverse();
                        bSelf.doObj.DurFr.reverse();
                    }
                    bSelf.doVal = false;
                }

                //連続してUNDO or REDO じゃない場合
                if(! bSelf.doVal){
                    //履歴が10つある場合、１つ削除
                    if(bSelf.doLV == 10){
                        bSelf.doObj.pageVal.shift();
                        bSelf.doObj.cellData.shift();
                        bSelf.doObj.curCell.shift();
                        bSelf.doObj.selCell.shift();
                        bSelf.doObj.cellVis.shift();
                        bSelf.doObj.Dur.shift();
                        bSelf.doObj.DurFr.shift();
                        bSelf.doLV = 9;
                    }
                    //最新の履歴を追加
                    bSelf.doObj.pageVal.push(bSelf.pageVal);
                    bSelf.doObj.curCell.push(bSelf.curCell);
                    bSelf.doObj.Dur.push(bSelf.Dur);
                    bSelf.doObj.DurFr.push(bSelf.DurFr);
                    bSelf.doLV = bSelf.doObj.pageVal.length;

                    bSelf.doObj.selCell[bSelf.doLV] = new Array();
                    bSelf.doObj.cellData[bSelf.doLV] = new Array();
                    bSelf.doObj.cellVis[bSelf.doLV] = new Array();
                    //bSelf.doObj.cellData[bSelf.doLV] = bSelf.cellData;
                    bSelf.doObj.selCell[bSelf.doLV] = bSelf.selCell;

                    for(var d=0;d<bSelf.FrRate * 6;d++){
                        bSelf.doObj.cellVis[bSelf.doLV][d] = bSelf.cellFr[bSelf.curCell][d].visible;
                    }
                    for(var dd=0;dd<bSelf.cellData.length;dd++){
                        bSelf.doObj.cellData[bSelf.doLV][dd] = new Array();
                        for(var d=0;d<bSelf.cellData[dd].length;d++){
                            bSelf.doObj.cellData[bSelf.doLV][dd][d] = bSelf.cellData[dd][d];
                        }
                    }
                }

                //UNDO
                if(oID == "UNDO"){
                    if(1 < bSelf.doLV){
                        bSelf.doLV--;
                    }
                    bSelf.doVal = true;
                //REDO
                }else if(oID == "REDO"){
                    if(bSelf.doLV < bSelf.doObj.pageVal.length-1){
                        bSelf.doLV++;
                    }
                    bSelf.doVal = true;
                }

                //UNDO or REDO
                if(bSelf.doVal){
                    //現在の選択を全解除
                    bSelf.allDeSelect(bSelf,bSelf.curCell,false);

                    bSelf.curCell = bSelf.doObj.curCell[bSelf.doLV];
                    bSelf.pageVal = bSelf.doObj.pageVal[bSelf.doLV];
                    bSelf.Dur = bSelf.doObj.Dur[bSelf.doLV];
                    bSelf.DurFr = bSelf.doObj.DurFr[bSelf.doLV];
                    bSelf.numPage = Math.ceil(bSelf.DurFr / (bSelf.FrRate * 6));
                    bSelf.DurTime = String(Math.floor(bSelf.Dur)) +" s + "+ String(bSelf.DurFr % bSelf.FrRate) +" k";
                    bSelf.compFr.text = bSelf.DurFr;
                    bSelf.compTime.text = bSelf.DurTime;
                    bSelf.cellData = new Array();
                    bSelf.cellData = bSelf.doObj.cellData[bSelf.doLV];
                    bSelf.selCell = bSelf.doObj.selCell[bSelf.doLV];

                    for(var d=0;d<bSelf.FrRate * 6;d++){
                        bSelf.cellFr[bSelf.curCell][d].visible = bSelf.doObj.cellVis[bSelf.doLV][d];
                    }

                    bSelf.pageNo.text = bSelf.pageVal + " / " + bSelf.numPage;
                    bSelf.TS_rePage(bSelf, bSelf.DurFr);
                    bSelf.toggleCellNo(bSelf, bSelf.valCN);
                    bSelf.chgSec(bSelf, bSelf.pageVal);
                    bSelf.showSel(bSelf, bSelf.curCell, bSelf.selCell);

                    //ログ
                    bSelf.logInfo.text = oID +"_"+ String(bSelf.doLV) +"__"+ bSelf.doObj.pageVal.length;
                    bSelf.UI_fgColor255(bSelf.logInfo, [255,190,90]);
                }

            },

            //タイムシート ビルド
            PB_Bld: function(pbSelf){
                pbSelf.setUp(true);
                if(! pbSelf.valE){
                    pbSelf.chkFX(pbSelf);
                    pbSelf.getSLKey(pbSelf);
                    var newTS = pbSelf.bldUI(pbSelf);
                    pbSelf.TS_rePage(pbSelf, pbSelf.DurFr);
                    if(newTS != null){
                        if(newTS instanceof Window){
                            //タイムシートを表示
                            //ウインドウ位置を記憶がtrueなら前回の位置
                            if(pbSelf.valLoc){
                                newTS.location = pbSelf.winPos;
                            }
                            newTS.show();

                            if(newTS.location[0] < 10){
                                newTS.center();
                            }
                        }
                    }
                }
            },

            //タイムシートセットアップ
            setUp:function(valRe)
            {
                //フレームレート判別(モニター縦サイズで分岐)
                if(this.moniSize[1] < 1400){
                    switch(this.FrRate)
                    {
                        case 24: this.fSize = 9; this.numPage = Math.ceil(this.DurFr / 144); break;
                        case 30: this.fSize = 8; this.numPage = Math.ceil(this.DurFr / 180); break;
                        case 60: this.fSize = 8; this.numPage = Math.ceil(this.DurFr / 360); this.valBIGG = true; break;
                    }
                }else{
                    switch(this.FrRate)
                    {
                        case 24: this.fSize = 12; this.numPage = Math.ceil(this.DurFr / 144); break;
                        case 30: this.fSize = 11; this.numPage = Math.ceil(this.DurFr / 180); break;
                        case 60: this.fSize = 11; this.numPage = Math.ceil(this.DurFr / 360); this.valBIGG = true; break;
                    }
                }

                //ウインドウサイズ設定
                var locR = 73 + (60 * this.cellNum);
                var ffVal = Number(this.FrRate) * 3 / 6;
                this.slLocY = 115 + ((Number(this.FrRate) * 3) * (this.fSize + 3)) + ffVal;
                var upSize = 700;

                //ウインドウ内セル表示数
                this.UIcellNO = Math.floor(upSize / 15);
                //尺がウインドウ内セル表示数以下だったら、拡大シートにする
                if(this.DurFr <= this.UIcellNO){
                    this.valSL = true;
                }

                //ウインドウサイズ [L, R]
                //拡大シート
                if(this.valBIGG || this.valBIG || this.valSL){
                    this.fSize = 12;
                    this.sheetSize = [
                                        [10,115,locR,115 + upSize],
                                        [locR + 14,115,locR + 14 + 64 + (60 * this.cellNum),115 + upSize]
                                     ]
                    this.valSL = true;
                //６秒シート
                }else{
                    this.sheetSize = [
                                        [10,115,locR,this.slLocY],
                                        [locR + 14,115,locR + 14 +  64 +(60 * this.cellNum),this.slLocY]
                                     ]
                }

                //新規なら選択レイヤー & セルデータ初期化
                if(valRe){
                    for(var ii=0;ii<this.cellLys.length;ii++){
                        this.cellData[ii] = new Array();
                        for(var i=0;i<this.DurFr;i++){
                            if(ii == 0){
                                this.selCell[i] = false;
                            }
                            this.cellData[ii][i] = 0;
                        }
                    }
                }
            },

            //TSエフェクトチェック
            chkFX: function(fSelf)
            {
                //TSエフェクトチェック
                fSelf.lyFx = new Array();
                for(var ii=0;ii<fSelf.cellLys.length;ii++){
                    var curLy = fSelf.cellLys[ii];
                    var tsFxVal = false;
                    if(curLy.property("Effects").numProperties > 0){
                        for(var i=1;i<=curLy.property("Effects").numProperties;i++){
                            switch(curLy.property("Effects")(i).name)
                            {
                                case "TS_スライダ制御": tsFxVal = true; break;   //under CS4
                                case "TS_スライダー制御": tsFxVal = true; break;  //over CS5
                                case "TS_Slider Control":  tsFxVal = true; break;
                            }
                        }
                    }
                    fSelf.lyFx[ii] = tsFxVal;
                }
            },

            //TSエフェクト適用
            setFX: function(fSelf)
            {
                //TSエフェクトチェック
                for(var ii=0;ii<fSelf.cellLys.length;ii++){
                    var curLy = fSelf.cellLys[ii];
                    var tsFxflag = [0,0,0,0];
                    if(curLy.property("Effects").numProperties > 0){
                        for(var i=1;i<=curLy.property("Effects").numProperties;i++){
                            switch(curLy.property("Effects")(i).name)
                            {
                                case "TS_スライダ制御": tsFxflag[0] = 1; break;   //under CS4
                                case "TS_スライダー制御": tsFxflag[0] = 1; break;  //over CS5
                                case "TS_Slider Control":  tsFxflag[0] = 1; break;
                                case "TS_トランスフォーム": tsFxflag[1] = 1; break;
                                case "TS_Geometry2":    tsFxflag[1] = 1; break;
                                case "TS_カラーキー":    tsFxflag[2] = 1; break;
                                case "TS_Color Key":    tsFxflag[2] = 1; break;
                                case "TS_OLMSmoother":  tsFxflag[3] = 1; break;
                                case "TS_" + fSelf.smName:  tsFxflag[3] = 1; break;
                            }
                        }
                    }

                    //Exp
                    var tsTransformExp = "if ( effect("+"\""+"TS_Slider Control"+"\""+")("+"\""+"ADBE Slider Control-0001"+"\""+") == 0 ) { 0 } else { 100 }";
                    var tsTimeRimapExp = "( effect("+"\""+"TS_Slider Control"+"\""+")("+"\""+"ADBE Slider Control-0001"+"\""+") - 1 ) * ( this_comp.frame_duration )";

                    //TimeRemap check
                    if ( curLy.canSetTimeRemapEnabled == true )
                    {
                        if ( curLy.timeRemapEnabled != true )
                        {
                            curLy.timeRemapEnabled = true;
                            curLy.timeRemap.removeKey(2);
                            curLy.startTime = 0;
                            curLy.outPoint = fSelf.Dur;
                        }
                    }else{
                        curLy.startTime = 0;
                        curLy.outPoint = fSelf.Dur;
                    }

                    //TSエフェクト適用
                    if(tsFxflag[0] == 0){   //Slider
                        var curFx = curLy.property("ADBE Effect Parade").addProperty("ADBE Slider Control");
                        curFx.name = "TS_Slider Control";
                        curFx(1).addKey(0);
                        curFx.moveTo(1);
                        if ( tsFxflag[1] != 0 && curLy.property("ADBE Effect Parade")("TS_Geometry2")(9).expression.indexOf("TS_Slider Control") != -1 )
                        {
                            curLy.property("ADBE Effect Parade")("TS_Geometry2")(9).expressionEnabled = true;
                        }
                    }
                    if(tsFxflag[1] == 0){   //Transform
                        var curFx = curLy.property("ADBE Effect Parade").addProperty("ADBE Geometry2");
                        curFx.name = "TS_Geometry2";
                        curFx(9).expression = tsTransformExp;
                        curFx.moveTo(curLy.property("ADBE Effect Parade")("TS_Slider Control").propertyIndex+1);
                    }
                    if(tsFxflag[2] == 0){   //ColorKey
                        if(fSelf.valCKey){
                            var curFx = curLy.property("ADBE Effect Parade").addProperty("ADBE Color Key");
                            curFx.name = "TS_Color Key";
                            curFx(1).setValue([1,1,1,1]);
                            curFx.moveTo(curLy.property("ADBE Effect Parade")("TS_Geometry2").propertyIndex+1);
                        }
                    }
                    if(tsFxflag[3] == 0){   //Smooth plugIn
                        if(fSelf.smVal && fSelf.valSM){
                            var curFx = curLy.property("ADBE Effect Parade").addProperty(fSelf.smName);
                            curFx.name = "TS_" + fSelf.smName;
                            curFx(1).setValue(fSelf.valSMCKey);
                            curFx(3).setValue(fSelf.valSMRange);
                            if(curLy.property("Effects").numProperties == 3){
                                curFx.moveTo(curLy.property("ADBE Effect Parade")("TS_Geometry2").propertyIndex+1);
                            }else if(curLy.property("Effects").numProperties == 4){
                                curFx.moveTo(curLy.property("ADBE Effect Parade")("ADBE Color Key").propertyIndex+1);
                            }
                        }
                    }

                    if(curLy.canSetTimeRemapEnabled == true && curLy.timeRemap.expressionEnabled != true){
                        curLy.timeRemap.expression = tsTimeRimapExp;
                    }
                }
            },

            //TS_Slider Control のキーを取得
            getSLKey: function(slSelf)
            {
                for(var i=0;i<slSelf.cellLys.length;i++){
                    //TSスライダーがある場合
                    if(slSelf.lyFx[i]){
                        var curLy = slSelf.cellLys[i];
                        //キーの数を取得
                        var chkNum = curLy.effect("TS_Slider Control")["ADBE Slider Control-0001"].numKeys;
                        //alert(chkNum);

                        //キーがある場合
                        if(chkNum > 0)
                        {
                            //現在のキー番号
                             var nk=1;
                            for(var iRow=0;iRow<slSelf.DurFr;iRow++)
                            {
                            //各キーのフレーム番号を取得
                               //現在のキーがキーの総数以内の場合
                                if(nk <= chkNum){
                                    //現在のキーのフレームＮｏ
                                    var numD = Math.floor(curLy.effect("TS_Slider Control")["ADBE Slider Control-0001"].keyTime(nk) * slSelf.actComp.frameRate);
                              //現在のキーがキーの総数を越えた場合
                                }else{
                                    var numD = slSelf.DurFr;
                                }
                            //ここからキー情報
                                //１フレーム目
                                if(iRow == 0){
                                    slSelf.cellData[i][0] = curLy.effect("TS_Slider Control")["ADBE Slider Control-0001"].keyValue(nk);
                                    nk++;
                                //２フレーム目以降
                                }else{
                                    //iRowが現在のキーのフレーム番号より小さい場合
                                    if(iRow < numD){
                                        //現在のキーがキーの総数以内の場合
                                        if(nk <= chkNum){
                                            slSelf.cellData[i][iRow] = curLy.effect("TS_Slider Control")["ADBE Slider Control-0001"].keyValue(nk-1);
                                        //現在のキーがキーの総数を１越えた場合
                                        }else{
                                            slSelf.cellData[i][iRow] = curLy.effect("TS_Slider Control")["ADBE Slider Control-0001"].keyValue(nk-1);
                                        }
                                    //iRowが現在のキーのフレーム番号と同じ場合
                                    }else if(iRow == numD){
                                        slSelf.cellData[i][iRow] = curLy.effect("TS_Slider Control")["ADBE Slider Control-0001"].keyValue(nk);
                                        //現在のキーが総数に満たない場合は、繰上げ
                                        if(nk <= chkNum){
                                            nk++;
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            },

            //各レイヤーにキーをセット
            setSLKey: function(slSelf){
                app.beginUndoGroup("TimeSheetAE_CC");
                //TSエフェクト適用
                slSelf.setFX(slSelf);

                //コンポ尺を更新
                if(slSelf.actComp.duration != slSelf.cellData[0].length / slSelf.FrRate){
                    slSelf.actComp.duration = slSelf.cellData[0].length / slSelf.FrRate;
                }

                //各コンポレイヤーに入力
                for(var ii=0;ii<slSelf.cellLys.length;ii++){
                    var curLy = slSelf.cellLys[ii];
                    curLy.timeRemap.expressionEnabled = false;
                    curLy.property("ADBE Effect Parade")("TS_Geometry2")(9).expressionEnabled = false;
                    //スライダーのキー番号
                    var nKey = 1;
                    for(var i=0;i<slSelf.cellData[ii].length;i++){
                        var curFr = i / slSelf.FrRate;
                        //1フレーム目の場合
                        if(i == 0){
                            //２つ以上キーがあったら削除
                            var rKey = curLy.effect("TS_Slider Control")["ADBE Slider Control-0001"].numKeys;
                            if(rKey > 1){
                                for(var nn=1;nn<rKey;nn++){
                                    curLy.effect("TS_Slider Control")["ADBE Slider Control-0001"].removeKey(2);
                                }
                            }

                            //レイヤーの[インポイント]からキーを打つ
                            curLy.effect("TS_Slider Control")["ADBE Slider Control-0001"].setValueAtTime(curLy.inPoint + curFr,slSelf.cellData[ii][i]);
                            //キーをホールド
                            curLy.effect("TS_Slider Control")["ADBE Slider Control-0001"].setInterpolationTypeAtKey(nKey,KeyframeInterpolationType.HOLD);
                            nKey++;

                        //2フレーム目以降の場合
                        }else{
                            //前フレームと違うセルならキーを打つ
                            if(slSelf.cellData[ii][i] != slSelf.cellData[ii][i-1]){
                                curLy.effect("TS_Slider Control")["ADBE Slider Control-0001"].setValueAtTime(curLy.inPoint + curFr,slSelf.cellData[ii][i]);
                                //キーをホールド
                                curLy.effect("TS_Slider Control")["ADBE Slider Control-0001"].setInterpolationTypeAtKey(nKey,KeyframeInterpolationType.HOLD);
                                nKey++;
                             }
                        }
                    }
                 }

                 for(var ii=0;ii<slSelf.cellLys.length;ii++){
                     var curLy = slSelf.cellLys[ii];
                     curLy.timeRemap.expressionEnabled = true;
                     curLy.property("ADBE Effect Parade")("TS_Geometry2")(9).expressionEnabled = true;
                 }
                 app.endUndoGroup();
                 //slSelf.setFX(slSelf);
                 //app.endUndoGroup();
            },

            //build
            bldUI:function(thisObj)
            {
                bSelf = this;

                var hSheet = 3*Number(this.FrRate);

                timesheetDLG = (thisObj instanceof Window) ? thisObj : new Window("dialog", " timesheetAE_CC", [ 0, 0, this.sheetSize[1][2] + 31, 33 + this.sheetSize[1][3] ], {minimizeButton:false,maximizeButton:false});
                timesheetDLG.nameID = "DLG";
                this.UI_bgColor255(timesheetDLG, [40,40,40]);
                timesheetDLG.addEventListener('mousemove', this.mvFunc1);
                timesheetDLG.addEventListener('keydown',this.kdFunc1);

                //Menu
                this.menuGrp = new Array();
                this.menuBtn = new Array();
                this.menuInfo = new Array();
                var menuVal = [["edit", "EDIT"],["imputTS", "imput TimeSheet"],["outputTS", "output TimeSheet"],["options", "OPTIONNS"],["settings", "SETTINGS"],["help", "HELP"]];
                for(var i=0;i<menuVal.length;i++){
                    this.menuGrp[i] = timesheetDLG.add( "group" , [2 + (130*i),1,(130*(i+1)),25]);
                    this.UI_bgColor255(this.menuGrp[i], [60,60,60]);

                    this.menuBtn[i] = this.menuGrp[i].add( "group" , [2,1,126,23]);
                    this.UI_bgColor255(this.menuBtn[i], [60,60,60]);
                    this.menuBtn[i].nameID = "MENU";
                    this.menuBtn[i].ID = menuVal[i][0];
                    this.menuBtn[i].numID = i;
                    this.menuBtn[i].addEventListener('mousedown',this.mdFunc1, true);
                    this.menuBtn[i].addEventListener('mouseover',this.moFunc1, true);
                    this.menuBtn[i].addEventListener('mouseout',this.motFunc1, true);

                    this.menuInfo[i] = this.menuBtn[i].add( "statictext" , [0,3,124,22] , menuVal[i][1] ); this.menuInfo[i].justify="center";
                    this.UI_fgColor255(this.menuInfo[i], [255,190,90]);
                    this.UI_font(this.menuInfo[i], "Arial","ITALIC", 14);
                }

                //info
                var compNameCaption = timesheetDLG.add( "statictext" , [16,30,100,44] , "Comp Name :" ); compNameCaption.justify="left";
                this.UI_fgColor255(compNameCaption, [240,240,240]);
                this.UI_font(compNameCaption, "Arial","BOLD", 12);
                var compName = timesheetDLG.add( "statictext" , [110,30,300,44] , this.actComp.name ); compName.justify="left";
                this.UI_fgColor255(compName, [240,240,240]);
                this.UI_font(compName, "Arial","BOLD", 12);

                var compFrCaption = timesheetDLG.add( "statictext" , [320,30,380,44] , "duration :" ); compFrCaption.justify="right";
                this.UI_fgColor255(compFrCaption, [240,240,240]);
                this.UI_font(compFrCaption, "Arial","BOLD", 12);
                this.compFr = timesheetDLG.add( "statictext" , [385,30,430,44] , this.DurFr +"Fr"); this.compFr.justify="right";
                this.UI_fgColor255(this.compFr, [240,240,240]);
                this.UI_font(this.compFr, "Arial","BOLD", 12);
                this.compTime = timesheetDLG.add( "statictext" , [435,30,510,44] , this.DurTime); this.compTime.justify="right";
                this.UI_fgColor255(this.compTime, [240,240,240]);
                this.UI_font(this.compTime, "Arial","BOLD", 12);

                var compFrRateCaption = timesheetDLG.add( "statictext" , [535,30,605,44] , "FrameRate :" ); compFrRateCaption.justify="right";
                this.UI_fgColor255(compFrRateCaption, [240,240,240]);
                this.UI_font(compFrRateCaption, "Arial","BOLD", 12);
                var compFrRate = timesheetDLG.add( "statictext" , [610,30,640,44] , this.FrRate); compFrRate.justify="right";
                this.UI_fgColor255(compFrRate, [240,240,240]);
                this.UI_font(compFrRate, "Arial","BOLD", 12);

                var pageCaption = timesheetDLG.add( "statictext" , [timesheetDLG.size[0] - 180,30,timesheetDLG.size[0] - 130,44] , "Page :" ); pageCaption.justify="right";
                this.UI_fgColor255(pageCaption, [240,240,240]);
                this.UI_font(pageCaption, "Arial","BOLD", 12);
                this.pageNo = timesheetDLG.add( "statictext" , [timesheetDLG.size[0] - 125,30,timesheetDLG.size[0] - 85,44] , this.pageVal + " / " + this.numPage); this.pageNo.justify="right";
                this.UI_fgColor255(this.pageNo, [240,240,240]);
                this.UI_font(this.pageNo, "Arial","BOLD", 12);

                this.reBtn = timesheetDLG.add("button", [timesheetDLG.size[0] - 70,29,timesheetDLG.size[0] - 50,50],"<");
                this.UI_font(this.reBtn, "Arial","BOLD", 12);
                this.reBtn.onClick = function()
                                                {
                                                    if(bSelf.pageVal > 1){
                                                        bSelf.pageVal--;
                                                    }
                                                    bSelf.pageNo.text = bSelf.pageVal + " / " + bSelf.numPage;
                                                    bSelf.TS_rePage(bSelf, bSelf.DurFr);
                                                    bSelf.toggleCellNo(bSelf, bSelf.valCN);
                                                    bSelf.chgSec(bSelf, bSelf.pageVal);
                                                    bSelf.showSel(bSelf, bSelf.curCell, bSelf.selCell);
                                                }

                this.prBtn = timesheetDLG.add("button", [timesheetDLG.size[0] - 40,29,timesheetDLG.size[0] - 20,50],">");
                this.UI_font(this.prBtn, "Arial","BOLD", 12);
                this.prBtn.onClick = function()
                                                {
                                                    if(bSelf.pageVal < bSelf.numPage){
                                                        bSelf.pageVal++;
                                                    }
                                                    bSelf.pageNo.text = bSelf.pageVal + " / " + bSelf.numPage;
                                                    bSelf.TS_rePage(bSelf, bSelf.DurFr);
                                                    bSelf.toggleCellNo(bSelf, bSelf.valCN);
                                                    bSelf.chgSec(bSelf, bSelf.pageVal);
                                                    bSelf.showSel(bSelf, bSelf.curCell, bSelf.selCell);
                                                }

                //入力欄
                this.edBtn = timesheetDLG.add("button", [50,55,100,85], "");
                this.UI_font(this.edBtn, "Arial","BOLD", 16);
                this.stTxt = timesheetDLG.add("statictext", [120,55,200,85],""); this.stTxt.justify = "left";
                this.UI_font(this.stTxt, "Arial","BOLD", 16);

                //白透過
                this.clCHK = timesheetDLG.add("checkbox", [timesheetDLG.size[0] - 400,60,timesheetDLG.size[0] - 250,85],"白透過を適用(Color Key)");
                this.clCHK.value = false;
                this.clCHK.onClick = function()
                                                {
                                                    if(this.value){
                                                        bSelf.valCKey = true;
                                                    }else{
                                                        bSelf.valCKey = false;
                                                    }
                                                }


                //AEに適用
                this.applyGrp = timesheetDLG.add("group", [timesheetDLG.size[0] - 200,55,timesheetDLG.size[0] - 20,85 ]);
                this.UI_bgColor255(this.applyGrp, [60,60,60]);
                this.applyBtn = this.applyGrp.add("group", [2,1,178,29]);
                this.UI_bgColor255(this.applyBtn, [60,60,60]);
                this.applyGrp.helpTip = "AfterEffects の各レイヤーにタイムシートを適用";
                this.applyGrp.nameID = "APPLY";
                this.applyGrp.addEventListener('mousedown',this.mdFunc1, true);
                this.applyGrp.addEventListener('mouseover',this.moFunc1, true);
                this.applyGrp.addEventListener('mouseout',this.motFunc1, true);

                this.applyInfo = this.applyBtn.add("statictext", [0,4,176,28], "apply to AE"); this.applyInfo.justify = "center";
                this.UI_fgColor255(this.applyInfo, [240,240,240]);
                this.UI_font(this.applyInfo, "Arial","BOLDITALIC", 16);


                this.cellUI = new Array();
                this.noUI = new Array();
                this.noInfo = new Array();
                this.cellH = new Array();
                this.sheetUI = new Array();
                this.sheetSL = new Array();
                this.secInfo = new Array();
                this.secTxt = new Array();
                var secC = 1;

                //左・右
                for(var ii=0;ii<2;ii++){
                    //cell Name
                    this.cellUI[ii] = timesheetDLG.add("group", [64 + this.sheetSize[ii][0],95,this.sheetSize[ii][2],115]);
                    this.UI_bgColor255(this.cellUI[ii], [60,60,60]);
                    this.cell[ii] = new Array();
                    this.cellName[ii] = new Array();
                    this.sheetSL[ii] = new Array();
                    this.secInfo[ii] = new Array();
                    this.secTxt[ii] = new Array();

                    //sheet
                    this.sheetUI[ii] = timesheetDLG.add("group", this.sheetSize[ii]);
                    this.UI_bgColor255(this.sheetUI[ii], [0,0,0]);
                    var fVal = 0;
                    //1秒ごとに作成
                    for(var iii=0;iii<3;iii++){
                        this.secTxt[ii][iii] = new Array();
                        this.sheetSL[ii][iii] = this.sheetUI[ii].add("group", [0,0,this.sheetUI[ii].size[0],this.slLocY]);
                        this.UI_bgColor255(this.sheetSL[ii][iii], [30,30,30]);
                        this.sheetSL[ii][iii].nameID = "stUI";
                        this.sheetSL[ii][iii].addEventListener('mouseup',this.muFunc1);
                        this.sheetSL[ii][iii].addEventListener('mouseover',this.moFunc1);
                        this.sheetSL[ii][iii].addEventListener('mouseout',this.motFunc1);

                        //cell NO.
                        for(var i=0;i<this.FrRate;i++){
                            //3秒分の通しナンバー
                            var numC = i + (this.FrRate * iii);
                            if(i > 0 && i % 6 == 0){
                                fVal++;
                            }

                            //1秒分のセルの[上辺,下辺]
                            if(ii == 0 && iii == 0){
                                this.cellH[i] = [1 + (i * (this.fSize + 3)) + fVal,((i + 1) * (this.fSize + 3)) + fVal];
                            }

                            this.noUI[numC + (hSheet * ii)] = this.sheetSL[ii][iii].add("group", [27,this.cellH[i][0],61,this.cellH[i][1]]);
                            this.UI_bgColor255(this.noUI[numC + (hSheet * ii)], [50,50,50]);

                            var infoNum = numC + 1 + (hSheet * ii);
                            if(infoNum > this.DurFr){
                                infoNum = "";
                            }
                            this.noInfo[numC + (hSheet * ii)] = this.noUI[numC + (hSheet * ii)].add("statictext", [0,0,this.noUI[numC + (hSheet * ii)].size[0],this.noUI[numC + (hSheet * ii)].size[1]], infoNum);
                            this.noInfo[numC + (hSheet * ii)].justify="right";
                            this.UI_fgColor255(this.noInfo[numC + (hSheet * ii)], [240,240,240]);
                            this.UI_font(this.noInfo[numC + (hSheet * ii)], "Arial","REGULAR", this.fSize);
                        }
                        //サイズ調整
                        this.sheetSL[ii][iii].size = [this.sheetSL[ii][iii].size[0], this.cellH[this.cellH.length - 1][1] + 1];
                        //位置調整
                        this.sheetSL[ii][iii].location = [this.sheetSL[ii][iii].location[0], this.sheetSL[ii][iii].size[1] * iii];

                        //秒数
                        this.secInfo[ii][iii] = this.sheetSL[ii][iii].add("group", [1,1,26,this.cellH[this.FrRate - 1][1]]);
                        if(secC % 2 == 1){
                            this.UI_bgColor255(this.secInfo[ii][iii], [60,60,60]);
                        }else{
                            this.UI_bgColor255(this.secInfo[ii][iii], [50,50,50]);
                        }
                        //上側表示
                        this.secTxt[ii][iii][0] = this.secInfo[ii][iii].add("statictext", [0,0,this.secInfo[ii][iii].size[0],19], secC); this.secTxt[ii][iii][0].justify="center";
                        this.UI_fgColor255(this.secTxt[ii][iii][0], [180,180,180]);
                        this.UI_font(this.secTxt[ii][iii][0], "Arial","BOLD", 14);
                        //下側表示
                        this.secTxt[ii][iii][1] = this.secInfo[ii][iii].add("statictext", [0,this.secInfo[ii][iii].size[1] - 19,this.secInfo[ii][iii].size[0],this.secInfo[ii][iii].size[1]], secC); this.secTxt[ii][iii][1].justify="center";
                        this.UI_fgColor255(this.secTxt[ii][iii][1], [180,180,180]);
                        this.UI_font(this.secTxt[ii][iii][1], "Arial","BOLD", 14);
                        secC++;

                    }
                }

                //シート作成
                this.TS_Bld(this, this.sheetSL, this.DurFr, hSheet, this.FrRate);


                //スライダー
                this.scrBar = timesheetDLG.add("scrollbar",[this.sheetSize[1][2] + 1, this.sheetSize[1][1], this.sheetSize[1][2] + 21, this.sheetSize[1][1] + this.sheetUI[1].size[1]],0,0,100);
                this.scrBar.stepdelta = 5;
                this.scrBar.visible = this.valSL;
                this.scrBar.onChanging = function()
                                                {
                                                    var slVal = ((bSelf.sheetSL[0][0].size[1] + bSelf.sheetSL[0][1].size[1] + bSelf.sheetSL[0][2].size[1]) - bSelf.sheetUI[1].size[1]) / 100;
                                                    for(var i=0;i<3;i++){
                                                        bSelf.sheetSL[0][i].location[1] = (this.value * slVal * -1) + (bSelf.sheetSL[0][0].size[1] * i);
                                                        bSelf.sheetSL[1][i].location[1] = (this.value * slVal * -1) + (bSelf.sheetSL[0][0].size[1] * i);
                                                    }
                                                }

                this.scrBar.onChange = function()
                                                {
                                                    var slVal = ((bSelf.sheetSL[0][0].size[1] + bSelf.sheetSL[0][1].size[1] + bSelf.sheetSL[0][2].size[1]) - bSelf.sheetUI[1].size[1]) / 100;
                                                    for(var i=0;i<3;i++){
                                                        bSelf.sheetSL[0][i].location[1] = (this.value * slVal * -1) + (bSelf.sheetSL[0][0].size[1] * i);
                                                        bSelf.sheetSL[1][i].location[1] = (this.value * slVal * -1) + (bSelf.sheetSL[0][0].size[1] * i);
                                                    }
                                                }

                this.edBtn.active = true;
                timesheetDLG.center();


                //ログ
                var logTxt = "monitor size: " + this.moniSize[0] + " x " + this.moniSize[1]+ "  /  外枠縦サイズ: " + timesheetDLG.frameSize[1]+ "  /  内枠縦サイズ: " + timesheetDLG.size[1]+ "  /  外枠上座標: " + timesheetDLG.frameBounds[1]
                            + "  /  内枠上座標: " + timesheetDLG.bounds[1]+ "  /  外枠下座標: " + timesheetDLG.frameBounds[3]+ "  /  内枠下座標: " + timesheetDLG.bounds[3];
                this.logInfo = timesheetDLG.add("statictext", [5,timesheetDLG.size[1] - 25, this.sheetSize[1][2],timesheetDLG.size[1] - 5], logTxt); this.logInfo.justify="center";
                this.UI_font(this.logInfo, "Arial","BOLD", 12);
                this.UI_fgColor255(this.logInfo, [240,240,240]);

                timesheetDLG.onClose = function()
                                            {
                                                //環境設定に書き込み
                                                bSelf.setupVal = false;
                                                bSelf.savePref(bSelf.moniSize, timesheetDLG.location, bSelf.valLoc, bSelf.valBIG, bSelf.applyVal, bSelf.setupVal);

                                                if(bSelf.valED){bSelf.edDlg.close();}
                                                if(bSelf.valOP){bSelf.opDlg.close();}
                                                if(bSelf.valSet){bSelf.setDlg.close();}
                                                if(bSelf.valHelp){bSelf.helpDlg.close();}

                                                /*
                                                //全てのオブジェクトを削除\
                                                bSelf.TS_reMove(bSelf, timesheetDLG);
                                                */
                                                //alert(timesheetDLG.children.length);
                                            }

                //最初の３コマのみ選択中にする
                this.selCell[0] = true;
                this.selCell[1] = true;
                this.selCell[2] = true;
                this.curCell = 0;
                this.showSel(bSelf, bSelf.curCell, bSelf.selCell);
                //DO処理
                this.doFunc(bSelf,"MEMO");

                return timesheetDLG;

                //環境設定に書き込み
                this.setupVal = true;
                this.savePref(bSelf.moniSize, timesheetDLG.location, bSelf.valLoc, bSelf.valBIG, bSelf.applyVal, bSelf.setupVal);
            },

            //TimeSheet ビルド
            TS_Bld: function(bSelf, sObj, valDur, hSheet, valFr)
            {
                //セル数
                for(var i=0;i<bSelf.cellLys.length;i++){
                    bSelf.cellFr[i] = new Array();
                    bSelf.cellInfo[i] = new Array();
                    //左右
                    for(var ii=0;ii<2;ii++){
                        //セル タイトル
                        bSelf.cell[ii][i] = bSelf.cellUI[ii].add("group", [i*60,0,59 + (i*60),19]);
                        bSelf.UI_bgColor255(bSelf.cell[ii][i],[80,80,80]);
                        bSelf.cell[ii][i].addEventListener('mousedown',this.mdFunc1);

                        bSelf.cellName[ii][i] = bSelf.cell[ii][i].add("statictext", [0,0,bSelf.cell[ii][i].size[0], bSelf.cell[ii][i].size[1]], "# " + String(bSelf.cellLys[i].index));
                        bSelf.cellName[ii][i].helpTip = bSelf.cellLys[i].name;
                        bSelf.cellName[ii][i].nameID = "cNAME";
                        bSelf.cellName[ii][i].idLR = ii;
                        bSelf.cellName[ii][i].cellID = i;
                        bSelf.cellName[ii][i].justify="center";
                        bSelf.UI_fgColor255(bSelf.cellName[ii][i], [240,240,240]);
                        bSelf.cellName[ii][i].addEventListener('mousedown',this.mdFunc1);

                        //スライドオブジェクト数
                        for(var iii=0;iii<3;iii++){
                            //1秒分
                            for(var iiii=0;iiii<valFr;iiii++){
                                //6秒分の通しナンバー
                                var cellC = iiii + (iii * valFr) + (hSheet * ii);

                                //セルアイコン
                                bSelf.cellFr[i][cellC] = bSelf.sheetSL[ii][iii].add("group", [64 + (i*60),bSelf.cellH[iiii][0],123 + (i*60),bSelf.cellH[iiii][1]]);
                                bSelf.cellFr[i][cellC].slObj = [ii, iii];
                                bSelf.cellFr[i][cellC].posY = [bSelf.cellFr[i][cellC].location[1], bSelf.cellH[iiii][1]];
                                //セルの背景色(1秒ごとに色変え)
                                if(Math.ceil((cellC + 1) / bSelf.FrRate) % 2 == 0){
                                    bSelf.UI_bgColor255(bSelf.cellFr[i][cellC], [50,50,50]);
                                }else{
                                    bSelf.UI_bgColor255(bSelf.cellFr[i][cellC], [60,60,60]);
                                }
                                bSelf.cellFr[i][cellC].helpTip = null;
                                bSelf.cellFr[i][cellC].nameID = "CELL";
                                bSelf.cellFr[i][cellC].cellID = i;
                                bSelf.cellFr[i][cellC].cellIndex = cellC;
                                bSelf.cellFr[i][cellC].selVal = false;
                                bSelf.cellFr[i][cellC].addEventListener('mousemove', this.mvFunc1);
                                bSelf.cellFr[i][cellC].addEventListener('mousedown',this.mdFunc1);
                                bSelf.cellFr[i][cellC].addEventListener('mouseup',this.muFunc1);
                                bSelf.cellFr[i][cellC].addEventListener('mouseover',this.moFunc1);
                                bSelf.cellFr[i][cellC].addEventListener('mouseout',this.motFunc1);
                                bSelf.cellFr[i][cellC].addEventListener('keydown',this.kdFunc1);

                                //セル表示
                                var curSize = bSelf.cellFr[i][cellC].size;
                                bSelf.cellInfo[i][cellC] = bSelf.cellFr[i][cellC].add("statictext", [0,0,curSize[0], curSize[1]], " "); bSelf.cellInfo[i][cellC].justify="center";
                                bSelf.UI_fgColor255(bSelf.cellInfo[i][cellC], [240,240,240]);
                                bSelf.UI_font(bSelf.cellInfo[i][cellC], "Arial","REGULAR", bSelf.fSize);


                                //尺より多い場合は非表示
                                if(cellC >= valDur){
                                    bSelf.cellFr[i][cellC].visible = false;
                                }
                            }
                        }
                    }
                }

                //スライダーアイコン用位置情報
                //1秒目の位置
                var secSL1 = Math.ceil((bSelf.sheetUI[1].size[1] - 61) / (bSelf.sheetSL[0][0].size[1] * 2 + (bSelf.sheetSL[0][0].size[1] - bSelf.sheetUI[0].size[1])) * bSelf.sheetSL[0][0].size[1]);
                //2秒目の位置
                var secSL2 = Math.ceil((bSelf.sheetUI[1].size[1] - 61) / (bSelf.sheetSL[0][0].size[1] * 2 + (bSelf.sheetSL[0][0].size[1] - bSelf.sheetUI[0].size[1])) * (bSelf.sheetSL[0][0].size[1] * 2));
                bSelf.valSLP = [0, secSL1, secSL2, bSelf.sheetUI[1].size[1] - 61];
            },

            //TimeSheet ウインドウサイズ切り替え
            TS_reBld: function(bSelf)
            {
                //設定更新
                if(bSelf.valBIGG || bSelf.valBIG){
                    bSelf.valSL = true;
                    bSelf.setUp(false);
                }else if(bSelf.valSL){
                    bSelf.valSL = false;
                    bSelf.setUp(false);
                }else{
                    bSelf.valSL = true;
                    bSelf.setUp(false);
                }

                //再構築
                timesheetDLG.size = [timesheetDLG.size[0], 33 + bSelf.sheetSize[1][3]];

                //初期化
                bSelf.cellH = new Array();
                var hSheet = 3*Number(bSelf.FrRate);
                //LR
                for(var ii=0;ii<2;ii++){
                    bSelf.sheetUI[ii].size = [bSelf.sheetUI[ii].size[0], bSelf.sheetSize[ii][3] - 115];
                    var fVal = 0;
                    //1秒ごとに作成
                    for(var iii=0;iii<3;iii++){
                        //cell NO.
                        for(var i=0;i<bSelf.FrRate;i++){
                            //3秒分の通しナンバー
                            var numC = i + (bSelf.FrRate * iii);
                            //6秒分の通しナンバー
                            var cellC = numC + (hSheet * ii);
                            if(i > 0 && i % 6 == 0){
                                fVal++;
                            }

                            //1秒分のセルの[上辺,下辺]
                            if(ii == 0 && iii == 0){
                               bSelf.cellH[i] = [1 + (i * (bSelf.fSize + 3)) + fVal,((i + 1) * (bSelf.fSize + 3)) + fVal];
                            }

                            bSelf.noUI[cellC].location = [21, bSelf.cellH[i][0]];
                            bSelf.noUI[cellC].size = [40, bSelf.cellH[i][1] - bSelf.cellH[i][0]];
                            bSelf.noInfo[cellC].size = bSelf.noUI[cellC].size;

                            //セル数
                            for(var iiii=0;iiii<bSelf.cellLys.length;iiii++){
                                //セルアイコン
                                bSelf.cellFr[iiii][cellC].location = [bSelf.cellFr[iiii][cellC].location[0], bSelf.cellH[i][0]];
                                bSelf.cellFr[iiii][cellC].size = [bSelf.cellFr[iiii][cellC].size[0], bSelf.cellH[i][1] - bSelf.cellH[i][0]];
                                //セル表示
                                bSelf.cellInfo[iiii][cellC].size = bSelf.cellFr[iiii][cellC].size;
                            }
                        }

                        //サイズ調整
                        //スライドオブジェクト
                        bSelf.sheetSL[ii][iii].size = [bSelf.sheetSL[ii][iii].size[0], bSelf.cellH[bSelf.cellH.length - 1][1] + 1];
                        //秒数
                        bSelf.secInfo[ii][iii].size = [bSelf.secInfo[ii][iii].size[0], bSelf.sheetSL[ii][iii].size[1]];
                        //上側表示
                        bSelf.secTxt[ii][iii][1].location = [0, bSelf.secInfo[ii][iii].size[1] - 19];
                        //位置調整
                        bSelf.sheetSL[ii][iii].location = [bSelf.sheetSL[ii][iii].location[0], bSelf.sheetSL[ii][iii].size[1] * iii];
                    }

                }

                //スライダーアイコン用位置情報
                //1秒目の位置
                var secSL1 = Math.ceil((bSelf.sheetUI[1].size[1] - 61) / (bSelf.sheetSL[0][0].size[1] * 2 + (bSelf.sheetSL[0][0].size[1] - bSelf.sheetUI[0].size[1])) * bSelf.sheetSL[0][0].size[1]);
                //2秒目の位置
                var secSL2 = Math.ceil((bSelf.sheetUI[1].size[1] - 61) / (bSelf.sheetSL[0][0].size[1] * 2 + (bSelf.sheetSL[0][0].size[1] - bSelf.sheetUI[0].size[1])) * (bSelf.sheetSL[0][0].size[1] * 2));
                bSelf.valSLP = [0, secSL1, secSL2, bSelf.sheetUI[1].size[1] - 61];

                //スライダー
                bSelf.scrBar.size = [bSelf.scrBar.size[0], bSelf.sheetUI[1].size[1]];
                bSelf.scrBar.visible = bSelf.valSL;

                //ログテキスト位置
                bSelf.logInfo.location = [bSelf.logInfo.location[0], timesheetDLG.size[1] - 25];
            },

            //TimeSheet ページ切り替え
            TS_rePage: function(bSelf, valDur)
            {
                var fSheet = 6*Number(bSelf.FrRate);
                var curDur = valDur - ((bSelf.pageVal - 1) * fSheet);
                var pVal = (bSelf.pageVal - 1) * fSheet;
                //cell
                for(var i=0;i<bSelf.cellLys.length;i++){
                    for(var ii=0;ii<fSheet;ii++){
                        //尺以内だったら表示
                        if(ii + pVal < valDur){
                            if(! bSelf.cellFr[i][ii].visible){
                                bSelf.cellFr[i][ii].visible = true;
                            }
                        //尺以上だったら非表示
                        }else{
                            if(bSelf.cellFr[i][ii].visible){
                                bSelf.cellFr[i][ii].visible = false;
                            }
                        }
                        bSelf.imputCell(bSelf, i, ii + pVal)
                    }
                }
            },

            //TimeSheet 削除
            TS_reMove: function(bSelf, tsObj)
            {
                while (tsObj.children.length > 0)
                {
                    if(tsObj.children[0].children.length > 0){
                        bSelf.TS_reMove(bSelf, tsObj.children[0]);
                    }else{
                        tsObj.remove(0);
                    }
                }
            },

            //cell No 変更
            toggleCellNo: function(bSelf, valSix)
            {
                //cell No 6秒
                if(! valSix){
                    var pVal = (bSelf.pageVal - 1) * (bSelf.FrRate * 6);
                    for(var i=0;i<bSelf.noInfo.length;i++){
                        if(i < bSelf.DurFr - pVal){
                            bSelf.noInfo[i].text = i + 1;
                            bSelf.UI_fgColor255(bSelf.noInfo[i], [255,190,90]);
                        }else{
                            bSelf.noInfo[i].text = "";
                        }
                    }
                //cell No 通し番号
                }else{
                    var stNo = (bSelf.pageVal - 1) * bSelf.noInfo.length + 1;
                    for(var i=0;i<bSelf.noInfo.length;i++){
                        if(stNo > bSelf.DurFr){
                            bSelf.noInfo[i].text = "";
                        }else{
                            bSelf.noInfo[i].text = stNo;
                            bSelf.UI_fgColor255(bSelf.noInfo[i], [240,240,240]);
                            stNo++;
                        }
                    }
                }
            },

            //ページ秒数切り替え
            chgSec: function(bSelf, curPG)
            {
                var chgPG = (curPG - 1) * 6 + 1;
                for(var i=0;i<2;i++){
                    for(var ii=0;ii<3;ii++){
                        bSelf.secTxt[i][ii][0].text = chgPG;
                        bSelf.secTxt[i][ii][1].text = chgPG;
                        chgPG++;
                    }
                }
            },

            //TimeSheet 用ファンクション******************************************************
            //セル入力
            imputCell: function(tSelf, cellNO, cellCC)
            {
                if(cellNO != null){
                    var pVal = (tSelf.pageVal - 1) * (tSelf.FrRate * 6);
                    //表示フレーム内
                    if(0 <= cellCC - pVal && cellCC - pVal < tSelf.FrRate * 6){
                        var cellVal = tSelf.cellData[cellNO][cellCC];
                        //値が0の場合、表示なし
                        if(cellVal == 0){
                            tSelf.cellInfo[cellNO][cellCC - pVal].text = " ";
                            tSelf.cellFr[cellNO][cellCC - pVal].helpTip = null;
                        //フレームが0の場合、入力
                        }else if(cellCC == 0){
                            tSelf.cellInfo[cellNO][cellCC - pVal].text = cellVal;
                            tSelf.cellFr[cellNO][cellCC - pVal].helpTip = cellVal;
                        //フレームが0より大きい場合
                        }else{
                            //値が1つ前のフレームと同じ場合、-
                            if(cellVal == tSelf.cellData[cellNO][cellCC - 1]){
                                tSelf.cellInfo[cellNO][cellCC - pVal].text = "-";
                                tSelf.cellFr[cellNO][cellCC - pVal].helpTip = cellVal;
                            //違う場合、入力
                            }else{
                                tSelf.cellInfo[cellNO][cellCC - pVal].text = cellVal;
                                tSelf.cellFr[cellNO][cellCC - pVal].helpTip = cellVal;
                            }
                        }

                        //1フレーム後の表示
                        //表示フレームより１つ以上小さい場合
                        if(1 + cellCC - pVal < tSelf.FrRate * 6){
                            var cellVal2 = tSelf.cellData[cellNO][cellCC + 1];

                            //値が1つ後のフレームと同じ場合、後のフレームを -
                            if(cellVal == cellVal2){
                                //0以上の場合
                                if(cellVal2 > 0){
                                    tSelf.cellInfo[cellNO][1 + cellCC - pVal].text = "-";
                                    tSelf.cellFr[cellNO][1 + cellCC - pVal].helpTip = cellVal2;
                                }
                            //違う場合、値を表示
                            }else{
                                if(cellVal2 > 0){
                                    tSelf.cellInfo[cellNO][1 + cellCC - pVal].text = cellVal2;
                                    tSelf.cellFr[cellNO][1 + cellCC - pVal].helpTip = cellVal2;
                                }
                            }
                        }
                    }
                }
            },

            //選択セル表示
            showSel: function(tSelf, cellNO, selObj)
            {
                //tSelf.logInfo.text = tSelf.getSelVal(tSelf);
                if(cellNO != null){
                    var pVal = (tSelf.pageVal - 1) * (tSelf.FrRate * 6);
                    for(var i=0;i<tSelf.cellFr[cellNO].length;i++){
                        //選択対象判別
                        if(selObj[i + pVal]){
                            //選択されていなかったら選択
                            if(! tSelf.cellFr[cellNO][i].selVal){
                                tSelf.UI_bgColor255(tSelf.cellFr[cellNO][i],[120,120,240]);
                                tSelf.cellFr[cellNO][i].selVal = true;
                            }
                        }else{
                            //選択されていたら選択解除
                            if(tSelf.cellFr[cellNO][i].selVal){
                                //セルの背景色(1秒ごとに色変え)
                                if(Math.ceil((i + 1) / tSelf.FrRate) % 2 == 0){
                                    tSelf.UI_bgColor255(tSelf.cellFr[cellNO][i], [50,50,50]);
                                }else{
                                    tSelf.UI_bgColor255(tSelf.cellFr[cellNO][i], [60,60,60]);
                                }
                                tSelf.cellFr[cellNO][i].selVal = false;
                            }
                        }
                    }
                    tSelf.curCell = cellNO;
                }
                //tSelf.logInfo.text = tSelf.getSelVal(tSelf);
            },

            //全セル選択
            allSelect: function(tSelf, cellNO)
            {
                if(cellNO != null){
                    for(var i=0;i<tSelf.DurFr;i++){
                        //選択セル判定取得
                        tSelf.selCell[i] = true;
                    }
                    tSelf.curCell = cellNO;

                    //選択セル表示
                    tSelf.showSel(tSelf, cellNO, tSelf.selCell);
                    //ログ
                    tSelf.logInfo.text = "全ページ選択中";
                    tSelf.UI_fgColor255(tSelf.logInfo, [255,190,90]);
                }
                //tSelf.logInfo.text = tSelf.curCell;
            },

            //片側セル選択
            halfSelect: function(tSelf, cellNO, valLR)
            {
                if(cellNO != null){
                    var pVal = (tSelf.pageVal - 1) * (tSelf.FrRate * 6);
                    var hNum = tSelf.FrRate * 3;
                    for(var i=0;i<hNum;i++){
                        //尺内の場合
                        if(i + (hNum * valLR) + pVal < tSelf.DurFr){
                            //選択されていなかったら選択
                            if(! tSelf.cellFr[cellNO][i + (hNum * valLR)].selVal){
                                tSelf.UI_bgColor255(tSelf.cellFr[cellNO][i + (hNum * valLR)],[120,120,240]);
                                tSelf.cellFr[cellNO][i + (hNum * valLR)].selVal = true;
                            }

                            //選択セル判定取得
                            tSelf.selCell[i + (hNum * valLR) + pVal] = true;
                        }
                    }
                    tSelf.curCell = cellNO;
                }
                //デバック用表示
                //tSelf.logInfo.text = tSelf.curCell;
            },

            //全セル選択解除
            allDeSelect: function(tSelf, cellNO, reset)
            {
                if(cellNO != null){
                    for(var i=0;i<tSelf.DurFr;i++){
                        tSelf.selCell[i] = false;
                    }

                    //選択セル表示
                    tSelf.showSel(tSelf, cellNO, tSelf.selCell);

                    //reset = true 初期化
                    if(reset){
                        tSelf.curCell = null;
                    }
                    tSelf.selRenVal = true;
                    tSelf.valLastClick = new Array();
                }
                //デバック用表示
                //tSelf.logInfo.text = tSelf.curCell;
            },

            //選択セル 歯抜け選択
            setRenSel: function(tSelf,cellNO, valLast)
            {
                //選択範囲を取得
                var renArr = tSelf.getSelRen(tSelf);
                if(cellNO != null && valLast.length == 2 && valLast[0] != valLast[1]){
                    var lastClick = new Array();
                    if(valLast[0] < valLast[1]){
                        lastClick = [valLast[0], valLast[1], valLast[0] + 1, valLast[1] + 1];
                    }else if(valLast[0] > valLast[1]){
                        lastClick = [valLast[1], valLast[0], valLast[1], valLast[0]];
                    }
                    for(var i=lastClick[2];i<lastClick[3];i++){
                        //選択セル判定取得
                        if(! tSelf.selCell[i]){
                            tSelf.selCell[i] = true;
                        }else{
                            tSelf.selCell[i] = false;
                        }
                    }
                    //選択セル表示
                    tSelf.showSel(tSelf, cellNO, tSelf.selCell);
                }else{
                    //エラーログ
                    tSelf.logInfo.text = "セルが選択されていません";
                    tSelf.UI_fgColor255(tSelf.logInfo, [240,50,50]);
                    alert(valLast);
                }
            },

            //連続選択セル取得
            getSelRen: function(tSelf)
            {
                tSelf.selRenVal = true;
                var renCell = new Array();
                tSelf.valCurFr = null;
                for(var i=0;i<tSelf.DurFr;i++){
                    //選択されていたら取得
                    if(tSelf.selCell[i]){
                        if(renCell.length > 0){
                            //セル番号が連続していなければ、false
                            if(renCell[renCell.length - 1] < i - 1){
                                tSelf.selRenVal = false;
                            }
                        }
                        renCell.push(i);
                        if(renCell.length == 1){
                            tSelf.valCurFr = renCell[0];
                        }
                    }
                }

                if(renCell.length == 0){
                    renCell = null;
                }
                return renCell;
            },

            //選択セル数字指定
            setSelNum: function(tSelf,cellNO,valSel)
            {
                //選択範囲を取得
                var renArr = tSelf.getSelRen(tSelf);
                //現ページの最初のフレーム
                var pVal = (tSelf.pageVal - 1) * (tSelf.FrRate * 6);
                //現ページのラストフレーム
                var ppVal = tSelf.pageVal * (tSelf.FrRate * 6);
                //ラストページだった場合のラストフレーム
                if(tSelf.pageVal == tSelf.numPage){
                    ppVal = bSelf.DurFr;
                }
                if(cellNO != null && renArr != null){
                    //選択範囲に歯抜けがない場合
                    if(tSelf.selRenVal){
                        if(renArr.length < valSel){
                            for(var s=renArr[0];s<renArr[0] + valSel;s++){
                                tSelf.selCell[s] = true;
                            }
                        }else{
                            for(var s=renArr[renArr.length-1];s>renArr[0] + valSel - 1;s--){
                                tSelf.selCell[s] = false;
                            }
                            var pNum = Math.floor(renArr[0] / (tSelf.FrRate * 6)) + 1;
                            if(pNum < tSelf.pageVal){
                                tSelf.pageVal = pNum;
                            }
                        }

                        //ページを更新
                        tSelf.pageNo.text = tSelf.pageVal + " / " + tSelf.numPage;
                        tSelf.TS_rePage(tSelf, tSelf.DurFr);
                        tSelf.toggleCellNo(tSelf, tSelf.valCN);
                        tSelf.chgSec(tSelf, tSelf.pageVal);

                        tSelf.showSel(tSelf, tSelf.curCell, tSelf.selCell);
                    }
                }
            },

            //選択セルを指定フレームに移動
            setSelMove: function(tSelf,cellNO,valSel)
            {
                //選択範囲を取得
                var renArr = tSelf.getSelRen(tSelf);
                //現ページの最初のフレーム
                var pVal = (tSelf.pageVal - 1) * (tSelf.FrRate * 6);
                //現ページのラストフレーム
                var ppVal = tSelf.pageVal * (tSelf.FrRate * 6);
                //ラストページだった場合のラストフレーム
                if(tSelf.pageVal == tSelf.numPage){
                    ppVal = bSelf.DurFr;
                }
                if(cellNO != null && renArr != null){
                    //選択範囲に歯抜けがない場合
                    if(tSelf.selRenVal){
                        //選択範囲を解除
                        for(var s=0;s<tSelf.cellFr.length;s++){
                            tSelf.allDeSelect(tSelf,s,false);
                        }
                        tSelf.curCell = cellNO;

                        if(valSel == "ALT"){
                            //指定フレーム
                            var sVal = renArr[0] - renArr.length;
                            if(0 <= sVal){
                                tSelf.valCurFr = sVal;
                            }else{
                                tSelf.valCurFr = 0;
                            }
                        }else if(valSel == "SHIFT"){
                            //指定フレーム
                            var sVal = renArr[renArr.length-1] + 1;
                            if(sVal < bSelf.DurFr){
                                tSelf.valCurFr = sVal;
                            }else{
                                tSelf.valCurFr = bSelf.DurFr - 1;
                            }
                        }else if(valSel == "RIGHT"){
                            //指定フレーム
                            var sVal = renArr[0];
                            if(cellNO < tSelf.cellFr.length - 1){
                                cellNO++;
                                tSelf.curCell = cellNO;
                                tSelf.valCurFr = sVal;
                            }else{
                                if(sVal + (tSelf.FrRate * 3) < ppVal){
                                    cellNO = 0;
                                    tSelf.curCell = cellNO;
                                    tSelf.valCurFr = sVal + (tSelf.FrRate * 3);
                                }else{
                                    if(tSelf.pageVal < tSelf.numPage){
                                        cellNO = 0;
                                        tSelf.curCell = cellNO;
                                        tSelf.valCurFr = sVal + (tSelf.FrRate * 3);
                                    }
                                }
                            }
                        }else if(valSel == "LEFT"){
                            //指定フレーム
                            var sVal = renArr[0]
                            if(0 < cellNO){
                                cellNO--;
                                tSelf.curCell = cellNO;
                                tSelf.valCurFr = sVal;
                            }else{
                                if(pVal <= sVal - (tSelf.FrRate * 3)){
                                    cellNO = tSelf.cellFr.length - 1;
                                    tSelf.curCell = cellNO;
                                    tSelf.valCurFr = sVal - (tSelf.FrRate * 3);
                                }else{
                                    if(1 < Math.floor(renArr[0] / (tSelf.FrRate * 6))+1){
                                        cellNO = tSelf.cellFr.length - 1;
                                        tSelf.curCell = cellNO;
                                        tSelf.valCurFr = sVal - (tSelf.FrRate * 3);
                                    }
                                }
                            }
                        }else{
                            //指定フレーム
                            tSelf.valCurFr = valSel;
                        }

                        //指定フレームから選択
                        for(var s=tSelf.valCurFr;s<tSelf.valCurFr + renArr.length;s++){
                            tSelf.selCell[s] = true;
                        }

                        //現在のページ
                        var pNum = Math.floor(tSelf.valCurFr / (tSelf.FrRate * 6)) + 1;
                        if(pNum != tSelf.pageVal){
                            tSelf.pageVal = pNum;
                        }


                        //拡大モードの場合、シートの移動
                        if(tSelf.valSL && valSel != "LEFT" && valSel != "RIGHT"){
                            var pVal2 = (tSelf.pageVal - 1) * (tSelf.FrRate * 6);
                            //逆送り時
                            if(valSel == "ALT"){
                                //移動後の選択フレームの1番目(逆送り時)
                                var sFr = (renArr[0] - renArr.length) - pVal2;
                            //順送り時
                            }else if(valSel == "SHIFT" || valSel == "NON"){
                                //移動後の選択フレームの1番目(順送り時)
                                var sFr = 1 + renArr[renArr.length - 1] - pVal2;
                            }

                            //位置情報を取得
                            var selS = tSelf.cellFr[cellNO][sFr].posY[0];

                            //対象の選択フレームが乗ってるオブジェクト
                            var slY = tSelf.cellFr[cellNO][sFr].slObj;

                            //[1番目シート枠内Y座標, 1番目ローカル]
                            var curCellY = [selS + tSelf.sheetSL[0][slY[1]].location[1], tSelf.cellFr[cellNO][sFr].posY[0]];

                            //タイムシート移動
                            tSelf.moveTS(tSelf, slY, sFr, curCellY, pVal2);
                        }

                        //ページを更新
                            tSelf.pageNo.text = tSelf.pageVal + " / " + tSelf.numPage;
                            tSelf.TS_rePage(tSelf, tSelf.DurFr);
                            tSelf.toggleCellNo(tSelf, tSelf.valCN);
                            tSelf.chgSec(tSelf, tSelf.pageVal);
                            tSelf.showSel(tSelf, tSelf.curCell, tSelf.selCell);
                    }
                }
            },

            //連続選択増減
            chgSelRen: function(tSelf, cellNO, chgVal)
            {
                //選択範囲を取得
                var renArr = tSelf.getSelRen(tSelf);
                if(cellNO != null && renArr != null){
                    var pVal = (tSelf.pageVal - 1) * (tSelf.FrRate * 6);
                    var ppVal = tSelf.pageVal * (tSelf.FrRate * 6);

                    if(tSelf.valCurFr != null){
                        var valPE = false;
                        //現在のページか判定
                        if(pVal <= tSelf.valCurFr && tSelf.valCurFr < ppVal){
                            valPE = true;
                        }else if(pVal <= renArr[renArr.length - 1] && renArr[renArr.length - 1] < ppVal){
                            valPE = true;
                        }
                        if(valPE){
                            //選択範囲に歯抜けがない場合
                            if(tSelf.selRenVal){
                                var valRePage = false;
                                var pVal = (tSelf.pageVal - 1) * (tSelf.FrRate * 6);
                                var ppVal = tSelf.pageVal * (tSelf.FrRate * 6);

                                var curNum = renArr[renArr.length - 1];
                                if(chgVal == "+"){
                                    curNum = curNum + 1;
                                    if(curNum < ppVal){
                                        if(curNum < tSelf.DurFr){
                                            tSelf.setSelCell(tSelf, cellNO, curNum - pVal);
                                        }
                                    }else{
                                        if(tSelf.pageVal < tSelf.numPage){
                                            valRePage = true;
                                            tSelf.pageVal++;
                                        }
                                        tSelf.selCell[curNum] = true;
                                    }
                                }else if(chgVal == "-"){
                                    var curNum = curNum - 1;
                                    if(curNum >= pVal){
                                        if(renArr.length > 1){
                                            tSelf.setDeSelCell(tSelf, cellNO, curNum + 1 - pVal);
                                        }
                                    }else{
                                        if(curNum > 0){
                                            if(tSelf.pageVal > 1){
                                                valRePage = true;
                                                tSelf.pageVal--;
                                            }
                                            tSelf.selCell[curNum + 1] = false;
                                        }
                                    }
                                }

                                //ページを更新
                                if(valRePage){
                                    tSelf.pageNo.text = tSelf.pageVal + " / " + tSelf.numPage;
                                    tSelf.TS_rePage(tSelf, tSelf.DurFr);
                                    tSelf.toggleCellNo(tSelf, tSelf.valCN);
                                    tSelf.chgSec(tSelf, tSelf.pageVal);

                                    tSelf.showSel(tSelf, tSelf.curCell, tSelf.selCell);
                                }
                                //初期化
                                valRePage = false;
                            }
                        }
                    }
                }
            },

            //連続選択セル 入力 ＆ 移動
            moveSelRen: function(tSelf, cellNO, valKEY, valMove)
            {
                //選択範囲を取得
                var renArr = tSelf.getSelRen(tSelf);
                if(cellNO != null && renArr != null){
                    //現ページの最初のフレーム
                    var pVal = (tSelf.pageVal - 1) * (tSelf.FrRate * 6);
                    //現ページのラストフレーム
                    var ppVal = tSelf.pageVal * (tSelf.FrRate * 6);
                    //ラストページだった場合のラストフレーム
                    if(tSelf.pageVal == tSelf.numPage){
                        ppVal = bSelf.DurFr;
                    }

                    if(tSelf.valCurFr != null){
                        var valPE = false;
                        //現在のページか判定 (選択範囲の先頭かラストが現ページにあるかどうか)
                        //altKey がONの場合 選択範囲移動のみ
                        if(valKEY == "ALT"  && tSelf.impCell == null){
                            if(0 <= renArr[0] - renArr.length){
                                valPE = true;
                            }
                        }else{
                            if(pVal <= tSelf.valCurFr && tSelf.valCurFr < ppVal){
                                valPE = true;
                            }else if(pVal <= renArr[renArr.length - 1] && renArr[renArr.length - 1] < ppVal){
                                valPE = true;
                            }
                        }

                        //処理
                        if(valPE){
                            //入力データ
                            var curImp = null;
                            //数字入力がある場合はその値を使用
                            if(tSelf.impCell != null){
                                curImp = Number(tSelf.impCell);
                            }

                            //選択範囲の移動＆入力
                            //選択範囲に歯抜けがない場合
                            if(tSelf.selRenVal){
                                var valT = false;
                                //移動後の選択セルが尺内の場合(順送り)
                                if(valKEY != "ALT" && renArr[renArr.length - 1] + 1 < tSelf.DurFr){
                                    valT = true;
                                //移動後の選択セルが0以上の場合(逆送り)
                                }else if(valKEY == "ALT" && 0 <= renArr[0] - 1){
                                    valT = true;
                                }

                                //選択範囲が移動可の場合
                                if(valT){
                                    //選択解除 & 入力
                                    for(var i=0;i<renArr.length;i++){
                                        //altKey がONの場合 逆送り(未入力時のみ)
                                        if(valKEY == "ALT" && tSelf.impCell == null){
                                            if(pVal <= renArr[0] - renArr.length && renArr[i] - pVal < tSelf.FrRate * 6){
                                                tSelf.setDeSelCell(tSelf, cellNO, renArr[i] - pVal);
                                            }else if(renArr[i] >= 0){
                                                tSelf.selCell[renArr[i]] = false;
                                            }
                                        //順送り
                                        }else{
                                           if(0 <= renArr[i] - pVal && renArr[i] < ppVal){
                                                tSelf.setDeSelCell(tSelf, cellNO, renArr[i] - pVal);
                                            }else{
                                                tSelf.selCell[renArr[i]] = false;
                                            }
                                        }
                                        //セル番号入力がある場合は、セル入力(shift & alt = false)
                                        if(valMove){
                                            if(valKEY == "NON" && curImp != null){
                                                tSelf.cellData[cellNO][renArr[i]] = curImp;
                                                tSelf.imputCell(tSelf, cellNO, renArr[i]);
                                            }
                                        }
                                    }

                                    //更新
                                    var valRePage = false;
                                    for(var i=0;i<renArr.length;i++){
                                        //altKey がONなら逆送り
                                        if(valKEY == "ALT"){
                                            var curNum = renArr[0] - (i + 1);
                                            if(pVal <= renArr[0] - renArr.length){
                                                tSelf.setSelCell(tSelf, cellNO, curNum - pVal);
                                            }else{
                                                if(! valRePage && 1 < tSelf.pageVal && 0 <= curNum){
                                                    valRePage = true;
                                                    tSelf.pageVal--;
                                                }
                                                if(curNum >= 0){
                                                    tSelf.selCell[curNum] = true;
                                                }
                                            }
                                        }else if(valKEY == "SHIFT" || valKEY == "NON"){
                                            var curNum = i + 1 + renArr[renArr.length - 1];
                                            if(curNum < ppVal){
                                                if(curNum < tSelf.DurFr){
                                                    tSelf.setSelCell(tSelf, cellNO, curNum - pVal);
                                                }
                                            }else{
                                                if(tSelf.pageVal < tSelf.numPage && i == 0){
                                                    valRePage = true;
                                                    tSelf.pageVal++;
                                                }
                                                if(curNum < tSelf.DurFr){
                                                    tSelf.selCell[curNum] = true;
                                                }
                                            }
                                        }else if(valKEY == "RIGHT"){
                                            //セル数より小さい場合
                                            if(cellNO < tSelf.cellFr.length - 1){
                                                var curNum = renArr[i];
                                                tSelf.setSelCell(tSelf, cellNO + 1, curNum - pVal);
                                                tSelf.curCell = cellNO + 1;
                                            //最後のセルの場合
                                            }else{
                                                var curNum = renArr[i];
                                                //移動後がページ or 尺内の場合
                                                if(curNum + (tSelf.FrRate * 3) < ppVal){
                                                    //尺より小さい場合右側に移動
                                                    if(curNum + (tSelf.FrRate * 3) < tSelf.DurFr){
                                                        tSelf.setSelCell(tSelf, 0, curNum + (tSelf.FrRate * 3) - pVal);
                                                        tSelf.curCell = 0;
                                                    //尺より大きい場合そのまま
                                                    }else{
                                                        tSelf.setSelCell(tSelf, cellNO, curNum - pVal);
                                                    }
                                                //移動後がページ or 尺外の場合
                                                }else{
                                                    //ラストページでない場合、次ページ
                                                    if(tSelf.pageVal < tSelf.numPage && i == 0){
                                                        valRePage = true;
                                                        tSelf.pageVal++;
                                                    }

                                                    //現選択が尺より小さい場合右側に移動
                                                    if(curNum < tSelf.DurFr){
                                                        //次ページの場合
                                                        if(valRePage){
                                                            tSelf.setSelCell(tSelf, 0, curNum - (tSelf.FrRate * 3) - pVal);
                                                        //ラストページだった場合そのまま
                                                        }else{
                                                            tSelf.setSelCell(tSelf, cellNO, curNum - pVal);
                                                        }
                                                    //尺より大きい場合そのまま
                                                    }else{
                                                        //alert(cellNO +"_"+ curNum - pVal);
                                                        tSelf.setSelCell(tSelf, cellNO, curNum - pVal);
                                                    }
                                                }
                                            }
                                        }else if(valKEY == "LEFT"){
                                            //セル数より大きい場合
                                            if(0 < cellNO){
                                                var curNum = renArr[i];
                                                tSelf.setSelCell(tSelf, cellNO - 1, curNum - pVal);
                                                tSelf.curCell = cellNO - 1;
                                            //最初のセルの場合
                                            }else{
                                                var curNum = renArr[i];
                                                //ページ内の場合左側に移動
                                                if(pVal <= curNum - (tSelf.FrRate * 3)){
                                                    tSelf.setSelCell(tSelf, tSelf.cellFr.length - 1, curNum - (tSelf.FrRate * 3) - pVal);
                                                    tSelf.curCell = tSelf.cellFr.length - 1;
                                                //ページ外の場合
                                                }else{
                                                    //最初のページでなければ前へ
                                                    if(! valRePage && 1 < tSelf.pageVal && 0 <= curNum){
                                                        valRePage = true;
                                                        tSelf.pageVal--;
                                                    }

                                                    if(0 <= curNum - (tSelf.FrRate * 3)){
                                                        tSelf.setSelCell(tSelf, tSelf.cellFr.length - 1, curNum + (tSelf.FrRate * 3) - pVal);
                                                    }else{
                                                        tSelf.setSelCell(tSelf, 0, curNum - pVal);
                                                    }
                                                }
                                            }
                                        }
                                    }

                                    //拡大モードの場合、シートの移動
                                    if(tSelf.valSL && valKEY != "LEFT" && valKEY != "RIGHT"){
                                        var pVal2 = (tSelf.pageVal - 1) * (tSelf.FrRate * 6);
                                        //逆送り時
                                        if(valKEY == "ALT"){
                                            //移動後の選択フレームの1番目(逆送り時)
                                            var sFr = (renArr[0] - renArr.length) - pVal2;
                                        //順送り時
                                        }else if(valKEY == "SHIFT" || valKEY == "NON"){
                                            //移動後の選択フレームの1番目(順送り時)
                                            var sFr = 1 + renArr[renArr.length - 1] - pVal2;
                                        }

                                        //位置情報を取得
                                        var selS = tSelf.cellFr[cellNO][sFr].posY[0];

                                        //対象の選択フレームが乗ってるオブジェクト
                                        var slY = tSelf.cellFr[cellNO][sFr].slObj;

                                        //[1番目シート枠内Y座標, 1番目ローカル]
                                        var curCellY = [selS + tSelf.sheetSL[0][slY[1]].location[1], tSelf.cellFr[cellNO][sFr].posY[0]];

                                        //タイムシート移動
                                        tSelf.moveTS(tSelf, slY, sFr, curCellY, pVal2);
                                    }

                                    //ページを更新
                                    if(valRePage){
                                        tSelf.pageNo.text = tSelf.pageVal + " / " + tSelf.numPage;
                                        tSelf.TS_rePage(tSelf, tSelf.DurFr);
                                        tSelf.toggleCellNo(tSelf, tSelf.valCN);
                                        tSelf.chgSec(tSelf, tSelf.pageVal);

                                        tSelf.showSel(tSelf, tSelf.curCell, tSelf.selCell);
                                    }
                                    //初期化
                                    valRePage = false;
                                //選択範囲が移動できない場合、入力のみ
                                }else{
                                    for(var i=0;i<renArr.length;i++){
                                        //セル入力(shift & alt = false)
                                        if(valKEY == "NON" && curImp != null){
                                            tSelf.cellData[cellNO][renArr[i]] = curImp;
                                            tSelf.imputCell(tSelf, cellNO, renArr[i]);
                                        }
                                    }
                                }
                            //選択範囲が歯抜けだった場合、入力のみ
                            }else{
                                for(var i=0;i<renArr.length;i++){
                                    //セル入力(shift & alt = false)
                                    if(valKEY == "NON" && curImp != null){
                                        tSelf.cellData[cellNO][renArr[i]] = curImp;
                                        tSelf.imputCell(tSelf, cellNO, renArr[i]);
                                    }
                                }
                            }
                        //選択範囲の先頭とラストが現ページにない場合
                        }else{
                            var valSEL = false;
                            //現ページに選択範囲があるかどうか
                            for(var i=0;i<renArr.length;i++){
                                if(pVal < renArr[i] && renArr[i] < ppVal){
                                    valSEL = true;
                                    break;
                                }
                            }

                            //現ページに選択範囲がある場合は入力のみ
                            if(valSEL){
                                //入力データ
                                var curImp = null;
                                //数字入力がある場合はその値を使用
                                if(tSelf.impCell != null){
                                    curImp = Number(tSelf.impCell);
                                }
                                for(var i=0;i<renArr.length;i++){
                                    //セル入力(shift & alt = false)
                                    if(valKEY == "NON" && curImp != null){
                                        tSelf.cellData[cellNO][renArr[i]] = curImp;
                                        tSelf.imputCell(tSelf, cellNO, renArr[i]);
                                    }
                                }
                                //ログ
                                tSelf.logInfo.text = curImp;
                                tSelf.UI_fgColor255(tSelf.logInfo, [240,240,240]);
                            }
                        }
                    }

                    tSelf.edBtn.focus = true;

                    //デバック用表示
                    //tSelf.logInfo.text = tSelf.selRenVal;
                }else{
                    //エラーログ
                    tSelf.logInfo.text = "セルが選択されていません";
                    tSelf.UI_fgColor255(tSelf.logInfo, [240,50,50]);
                }
            },

            //連番入力[スタートセル番号,フレーム数,+ or -]
            setRENBAN: function(tSelf, cellNO, valData)
            {
                //選択範囲を取得
                var renArr = tSelf.getSelRen(tSelf);
                if(cellNO != null && renArr != null){
                    //入力オプションが正しい場合
                    if(valData[2] == "+" || valData[2] == "-"){
                        //選択範囲に歯抜けがない場合
                        if(tSelf.selRenVal){
                            var curCellNum = valData[0];
                            var valCT = 1;
                            for(var i=0;i<renArr.length;i++){
                                //セル入力
                                if(0 < curCellNum){
                                    tSelf.cellData[cellNO][renArr[i]] = curCellNum;
                                    tSelf.imputCell(tSelf, cellNO, renArr[i]);
                                    //フレーム数制御
                                    if(valCT < valData[1]){
                                        valCT++;
                                    }else{
                                        valCT = 1;
                                        if(valData[2] == "+"){
                                            curCellNum++;
                                        }else if(valData[2] == "-"){
                                            curCellNum--;
                                        }
                                    }
                                }
                            }
                        }
                        //ログ
                        tSelf.logInfo.text = valData;
                        tSelf.UI_fgColor255(tSelf.logInfo, [240,240,240]);
                    }else{
                        //エラーログ
                        tSelf.logInfo.text = "入力が間違っています。連番入力は[ スタートセル番号, フレーム数, + or - ]";
                        tSelf.UI_fgColor255(tSelf.logInfo, [240,50,50]);
                    }
                }else{
                    //エラーログ
                    tSelf.logInfo.text = "セルが選択されていません";
                    tSelf.UI_fgColor255(tSelf.logInfo, [240,50,50]);
                }
            },

            //リピート、逆シート入力[スタートセル番号,ラストセル番号,フレーム数,R(リピート) or G(逆シート)]
            setREPEAT: function(tSelf, cellNO, valData)
            {
                //選択範囲を取得
                var renArr = tSelf.getSelRen(tSelf);
                if(cellNO != null && renArr != null){
                    //入力オプションが正しい場合
                    if(valData[3] == "R" || valData[3] == "G"){
                        //選択範囲に歯抜けがない場合
                        if(tSelf.selRenVal){
                            var curCellNum = valData[0];
                            var valCT = 1;
                            var valRev = false;
                            for(var i=0;i<renArr.length;i++){
                                //セル入力
                                if(0 < curCellNum){
                                    tSelf.cellData[cellNO][renArr[i]] = curCellNum;
                                    tSelf.imputCell(tSelf, cellNO, renArr[i]);
                                    //フレーム数制御
                                    if(valCT < valData[2]){
                                        valCT++;
                                    }else{
                                        valCT = 1;
                                        //リピート処理
                                        if(valData[3] == "R"){
                                            //スタートFrがラストFrより小さい場合(+)
                                            if(valData[0] < valData[1]){
                                                if(curCellNum < valData[1]){
                                                    curCellNum++;
                                                }else{
                                                    curCellNum = valData[0];
                                                }
                                            //スタートFrがラストFrより大きい場合(-)
                                            }else{
                                                if(curCellNum > valData[1]){
                                                    curCellNum--;
                                                }else{
                                                    curCellNum = valData[0];
                                                }
                                            }
                                        //逆シート処理
                                        }else if(valData[3] == "G"){
                                            //スタートFrがラストFrより小さい場合(+)
                                            if(valData[0] < valData[1]){
                                                if(! valRev){
                                                    curCellNum++;
                                                }else{
                                                    curCellNum--;
                                                }

                                                //折り返し判定
                                                if(curCellNum == valData[1]){
                                                    valRev = true;
                                                }else if(curCellNum == valData[0]){
                                                    valRev = false;
                                                }
                                            //スタートFrがラストFrより大きい場合(-)
                                            }else{
                                                if(! valRev){
                                                    curCellNum--;
                                                }else{
                                                    curCellNum++;
                                                }

                                                //折り返し判定
                                                if(curCellNum == valData[1]){
                                                    valRev = true;
                                                }else if(curCellNum == valData[0]){
                                                    valRev = false;
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                        //ログ
                        tSelf.logInfo.text = valData;
                        tSelf.UI_fgColor255(tSelf.logInfo, [240,240,240]);
                    }else{
                        //エラーログ
                        tSelf.logInfo.text = "入力が間違っています。リピート・逆シート入力は[ スタートセル番号, ラストセル番号, フレーム数, R(リピート) or G(逆シート) ]";
                        tSelf.UI_fgColor255(tSelf.logInfo, [240,50,50]);
                    }
                }else{
                    //エラーログ
                    tSelf.logInfo.text = "セルが選択されていません";
                    tSelf.UI_fgColor255(tSelf.logInfo, [240,50,50]);
                }
            },

            //飛び石入力[スタートセル番号,フレーム数,間のセルのフレーム数(0 = 空セル) or F(止メ)]
            setOFFON: function(tSelf, cellNO, valData)
            {
                //選択範囲を取得
                var renArr = tSelf.getSelRen(tSelf);
                if(cellNO != null && renArr != null){
                    var flag = /[0-9]/.test(valData[2]);
                    //入力オプションが正しい場合
                    if(valData[2] == "F" || flag){
                        //選択範囲に歯抜けがある場合
                        if(! tSelf.selRenVal){
                            var curCellNum = valData[0];
                            var stFr = renArr[0];
                            var lastFr = renArr[renArr.length-1];
                            var valCT = 1;
                            //セル入力
                            for(var i=stFr;i<=lastFr;i++){
                                //選択されている場合
                                if(tSelf.selCell[i]){
                                    tSelf.cellData[cellNO][i] = curCellNum;
                                    tSelf.imputCell(tSelf, cellNO, i);
                                    //フレーム数制御
                                    if(valCT < valData[1]){
                                        valCT++;
                                    }else{
                                        valCT = 1;
                                        curCellNum++;
                                    }
                                //間のセル
                                }else{
                                    //オプションが止メの場合
                                    if(valData[2] == "F"){
                                        tSelf.cellData[cellNO][i] = curCellNum;
                                        tSelf.imputCell(tSelf, cellNO, i);
                                        //次のセルが選択されている場合
                                        if(i < lastFr && tSelf.selCell[i + 1]){
                                            curCellNum++;
                                        }
                                    //空セルの場合
                                    }else if(valData[2] == 0){
                                        tSelf.cellData[cellNO][i] = 0;
                                        tSelf.imputCell(tSelf, cellNO, i);
                                    //フレーム数の場合
                                    }else{
                                        tSelf.cellData[cellNO][i] = curCellNum;
                                        tSelf.imputCell(tSelf, cellNO, i);
                                        //フレーム数制御
                                        if(valCT < valData[2]){
                                            valCT++;
                                        }else{
                                            valCT = 1;
                                            curCellNum++;
                                        }
                                    }
                                }
                            }
                            //ログ
                            tSelf.logInfo.text = valData;
                            tSelf.UI_fgColor255(tSelf.logInfo, [240,240,240]);
                        }else{
                            //エラーログ
                            tSelf.logInfo.text = "選択範囲にヌケ(非選択部分)が必要です";
                            tSelf.UI_fgColor255(tSelf.logInfo, [240,50,50]);
                        }
                    }else{
                        //エラーログ
                        tSelf.logInfo.text = "入力が間違っています。飛び石入力は[ スタートセル番号, フレーム数, 間のセルのフレーム数(0 = 空セル) or F(止メ)]";
                        tSelf.UI_fgColor255(tSelf.logInfo, [240,50,50]);
                    }
                }else{
                    //エラーログ
                    tSelf.logInfo.text = "セルが選択されていません";
                    tSelf.UI_fgColor255(tSelf.logInfo, [240,50,50]);
                }
            },

            //コピー
            copyCell: function(tSelf, cellNO)
            {
                //選択範囲を取得
                var renArr = tSelf.getSelRen(tSelf);
                if(cellNO != null && renArr != null){
                    //選択範囲に歯抜けがない場合
                    if(tSelf.selRenVal){
                        tSelf.copyData = new Array();
                        for(var i=0;i<renArr.length;i++){
                            tSelf.copyData.push(tSelf.cellData[cellNO][renArr[i]]);
                        }
                        //ログ
                        tSelf.logInfo.text = "Cell: [ "+ tSelf.cellName[0][cellNO].text +" ]  "+ (renArr[0]+1) +" Fr ～ "+ (renArr[renArr.length-1]+1) +" Fr までコピー";
                        tSelf.UI_fgColor255(tSelf.logInfo, [255,190,90]);
                    }else{
                        //エラーログ
                        tSelf.logInfo.text = "連続したセルを選択してください";
                        tSelf.UI_fgColor255(tSelf.logInfo, [240,50,50]);
                    }
                }
            },

            //ペースト
            pasteCell: function(tSelf, cellNO){
                //選択範囲を取得
                var renArr = tSelf.getSelRen(tSelf);
                if(cellNO != null && renArr != null && tSelf.copyData.length > 0){
                    var pVal = (tSelf.pageVal - 1) * (tSelf.FrRate * 6);
                    var ppVal = tSelf.pageVal * (tSelf.FrRate * 6);
                    //ラストページだった場合のラストフレーム
                    if(tSelf.pageVal == tSelf.numPage){
                        ppVal = tSelf.DurFr;
                    }
                    var ii = tSelf.valCurFr;
                    for(var i=0;i<tSelf.copyData.length;i++){
                        //尺内だったらペースト
                        if(ii < tSelf.DurFr){
                            tSelf.cellData[cellNO][ii] = tSelf.copyData[i];
                            tSelf.imputCell(tSelf, cellNO, ii);
                            ii++;
                        }else{
                            break;
                        }
                    }
                    //全選択解除
                    tSelf.allDeSelect(tSelf, cellNO, false);
                    //次のFrを選択
                    //次のフレームがページ内の場合
                    if(ii < ppVal){
                        tSelf.setSelCell(tSelf, cellNO, (ii - pVal));
                    //次のフレームがページ外の場合
                    }else{
                        var valRePage = false;
                        //尺より大きい場合、最初のフレーム
                        if(ii == tSelf.DurFr){
                            tSelf.selCell[tSelf.valCurFr] = true;
                            valRePage = true;
                        //尺以内の場合、ページ外の次のフレーム
                        }else{
                            tSelf.selCell[ii] = true;
                            tSelf.valCurFr = ii;
                            valRePage = true;
                        }

                        var pNum = Math.floor(tSelf.valCurFr / (tSelf.FrRate * 6)) + 1;
                        if(pNum != tSelf.pageVal){
                            tSelf.pageVal = pNum;
                            valRePage = true;
                        }
                        //ページを進める
                        if(valRePage){
                            tSelf.pageNo.text = tSelf.pageVal + " / " + tSelf.numPage;
                            tSelf.TS_rePage(tSelf, tSelf.DurFr);
                            tSelf.toggleCellNo(tSelf, tSelf.valCN);
                            tSelf.chgSec(tSelf, tSelf.pageVal);
                            tSelf.showSel(tSelf, tSelf.curCell, tSelf.selCell);
                        }
                    }

                    //ログ
                    tSelf.logInfo.text = "Cell: [ "+ tSelf.cellName[0][cellNO].text +" ]  "+ (tSelf.valCurFr + 1) +" Fr ～ "+ ii +" Fr までペースト";
                    tSelf.UI_fgColor255(tSelf.logInfo, [255,190,90]);
                }
            },

            //選択セル判別
            getSelVal: function(tSelf)
            {
                var selVal2 = false;
                for(var i=0;i<tSelf.selCell.length;i++){
                    if(tSelf.selCell[i]){
                        selVal2 = true;
                        break;
                    }
                }
                return selVal2;
            },

            //セル選択
            setSelCell: function(tSelf, cellNO, frNO)
            {
                if(cellNO != null){
                    var pVal = (tSelf.pageVal - 1) * (tSelf.FrRate * 6);
                    //選択されていなかったら選択
                    if(! tSelf.cellFr[cellNO][frNO].selVal){
                        tSelf.UI_bgColor255(tSelf.cellFr[cellNO][frNO],[120,120,240]);
                        tSelf.cellFr[cellNO][frNO].selVal = true;
                        //選択セル判定取得
                        tSelf.selCell[frNO + pVal] = true;
                    }
                    tSelf.curCell = cellNO;
                }

                //デバック用表示
                //tSelf.logInfo.text = tSelf.curCell;
            },

            //セル選択解除
            setDeSelCell: function(tSelf, cellNO, frNO)
            {
                if(cellNO != null){
                    var pVal = (tSelf.pageVal - 1) * (tSelf.FrRate * 6);
                    //選択されていたら選択解除
                    if(tSelf.cellFr[cellNO][frNO].selVal){
                        //セルの背景色(1秒ごとに色変え)
                        if(Math.ceil((frNO + 1) / tSelf.FrRate) % 2 == 0){
                            tSelf.UI_bgColor255(tSelf.cellFr[cellNO][frNO], [50,50,50]);
                        }else{
                            tSelf.UI_bgColor255(tSelf.cellFr[cellNO][frNO], [60,60,60]);
                        }
                        tSelf.cellFr[cellNO][frNO].selVal = false;
                        //選択セル判定取得
                        tSelf.selCell[frNO + pVal] = false;
                    }
                    tSelf.curCell = cellNO;
                }
                //デバック用表示
                //tSelf.logInfo.text = tSelf.curCell;
            },

            //セルWClick(現在のセル以降を選択)
            setSelCellWCick: function(tSelf, cellNO, cellCC, valKey)
            {
                if(cellNO != null){
                    var pVal = (tSelf.pageVal - 1) * (tSelf.FrRate * 6);
                    var ppVal = tSelf.pageVal * (tSelf.FrRate * 6);
                    var curNum = cellCC + pVal;
                    for(var i=curNum;i<tSelf.DurFr;i++){
                        //選択セル判定
                        if(valKey == "ALT"){
                            tSelf.selCell[i] = false;
                        }else{
                            tSelf.selCell[i] = true;
                        }
                    }
                    tSelf.curCell = cellNO;

                    //選択セル表示
                    tSelf.showSel(tSelf, cellNO, tSelf.selCell);
                }
            },

            //タイムシート移動
            moveTS: function(tSelf, valObj, sFr, selY, pVal)
            {
                if(tSelf.valSL){
                    //3つ目のSLオブジェクトのラスト位置
                    var maxY = tSelf.sheetSL[0][1].size[1] - tSelf.sheetUI[0].size[1];
                    var moveY = null;
                    var slO = valObj[1];
                    //選択フレーム1番目のフレームNO.
                    var curFr = sFr - (tSelf.FrRate * 3 * valObj[0]);

                    //選択フレーム1番目が3秒以内の場合
                    if(curFr < tSelf.FrRate * 3){
                        //スタート位置しばり
                        if(curFr < tSelf.UIcellNO){
                            moveY = 0;
                            slO = 0;
                        //スライド最大フレームより小さい場合
                        }else if(curFr <= (tSelf.FrRate * 3) - (tSelf.UIcellNO - 1)){
                            //シート枠から選択フレーム1番目が出た場合
                            if(selY[0] >= tSelf.sheetUI[0].size[1]){
                                moveY = selY[1];
                            }
                        //スライド最大フレーム以上の場合、ラスト位置
                        }else{
                            moveY = maxY;
                            slO = 2;
                        }
                    }

                    if(moveY != null){
                        tSelf.sheetSL[0][slO].location = [tSelf.sheetSL[0][slO].location[0], moveY * -1];
                        tSelf.sheetSL[1][slO].location = [tSelf.sheetSL[1][slO].location[0], moveY * -1];

                        for(var i=0;i<2;i++){
                            switch(slO)
                            {
                                case 0: tSelf.sheetSL[i][1].location = [tSelf.sheetSL[i][1].location[0], tSelf.sheetSL[i][0].location[1] + tSelf.sheetSL[i][0].size[1]];
                                        tSelf.sheetSL[i][2].location = [tSelf.sheetSL[i][2].location[0], tSelf.sheetSL[i][1].location[1] + tSelf.sheetSL[i][1].size[1]];
                                        break;
                                case 1: tSelf.sheetSL[i][0].location = [tSelf.sheetSL[i][0].location[0], tSelf.sheetSL[i][1].location[1] - tSelf.sheetSL[i][0].size[1]];
                                        tSelf.sheetSL[i][2].location = [tSelf.sheetSL[i][2].location[0], tSelf.sheetSL[i][1].location[1] + tSelf.sheetSL[i][2].size[1]];
                                        break;
                                case 2: tSelf.sheetSL[i][1].location = [tSelf.sheetSL[i][1].location[0], tSelf.sheetSL[i][2].location[1] - tSelf.sheetSL[i][1].size[1]];
                                        tSelf.sheetSL[i][0].location = [tSelf.sheetSL[i][0].location[0], tSelf.sheetSL[i][1].location[1] - tSelf.sheetSL[i][0].size[1]];
                                        break;
                            }
                        }

                        //スライダーも合わせて移動
                        var valSLI = Math.ceil(tSelf.valSLP[3] / (tSelf.sheetSL[0][0].size[1] * 2 + maxY) * (tSelf.sheetSL[0][0].location[1] * -1));
                        //最大値を超えたらラスト位置
                        if(valSLI > tSelf.valSLP[3]){
                            valSLI = tSelf.valSLP[3];
                        }
                        tSelf.scrBar.value = Math.round((100 / tSelf.valSLP[3]) * valSLI);

                        //デバック用表示
                        //tSelf.logInfo.text = String(selY) +"_"+ slO +"_"+ curFr +"_"+ String(valSLI);
                    }
                }
            },

            //MENU Click
            menuClick: function(mSelf, valMenu)
            {
                //EDIT
                if(valMenu == "edit"){
                    if(mSelf.valED){
                        mSelf.edDlg.close();
                    }else{
                        mSelf.edDlg_Bld(mSelf);
                    }
                //タイムシート読み込み
                }else if(valMenu == "imput TimeSheet"){

                //タイムシート書き込み
                }else if(valMenu == "output TimeSheet"){

                //入力オプション
                }else if(valMenu == "options"){
                    if(mSelf.valOP){
                        mSelf.opDlg.close();
                    }else{
                        mSelf.opDlg_Bld(mSelf);
                    }
                //セッティングメニュー
                }else if(valMenu == "settings"){
                    if(mSelf.valSet){
                        mSelf.setDlg.close();
                    }else{
                        mSelf.setDlg = new Window("dialog", " SETTINGS MENU", [0, 0, 520, 190]);
                        mSelf.UI_bgColor255(mSelf.setDlg, [40,40,40]);
                        mSelf.UI_fgColor255(mSelf.setDlg, [255,190,90]);

                        mSelf.setDlg.chkWin = mSelf.setDlg.add("checkbox", [20,30,510,50], "Window の位置を記憶する"); mSelf.setDlg.chkWin.justify = "left";
                        mSelf.UI_font(mSelf.setDlg.chkWin, "Arial","ITALIC", 15);
                        mSelf.setDlg.chkWin.value = mSelf.valLoc;

                        mSelf.setDlg.chkSize = mSelf.setDlg.add("checkbox", [20,70,510,90], "常に拡大モードで開く"); mSelf.setDlg.chkSize.justify = "left";
                        mSelf.UI_font(mSelf.setDlg.chkSize, "Arial","ITALIC", 15);
                        mSelf.setDlg.chkSize.value = mSelf.valBIG;
                        var sizeInfo = mSelf.setDlg.add("statictext", [40,95,510,120], "※モニター縦サイズが 1100 以下や 60fps 時は強制的に拡大モードになります"); sizeInfo.justify = "left";
                        mSelf.UI_font(sizeInfo, "Arial","ITALIC", 14);

                        mSelf.setDlg.chkClose = mSelf.setDlg.add("checkbox", [20,160,360,180], "AE へ適用した時に、ウインドウを閉じる"); mSelf.setDlg.chkClose.justify = "left";
                        mSelf.setDlg.chkClose.value = mSelf.applyVal
                        mSelf.UI_font(mSelf.setDlg.chkClose, "Arial","ITALIC", 15);

                        var mmSelf = mSelf;
                        mSelf.setDlg.onClose = function()
                                                    {
                                                        mmSelf.valLoc = mmSelf.setDlg.chkWin.value;
                                                        mmSelf.applyVal = mmSelf.setDlg.chkClose.value;
                                                        mmSelf.valBIG = mmSelf.setDlg.chkSize.value;
                                                        if(mmSelf.valBIG){
                                                            mmSelf.valSL = true;
                                                            mmSelf.TS_reBld(mmSelf);
                                                        }

                                                        //全てのセッティングメニューオブジェクトを削除
                                                        //mmSelf.TS_reMove(mmSelf,mmSelf.setDlg);

                                                        //mmSelf.valSet = false;
                                                    }

                        mSelf.setDlg.center();
                        mSelf.setDlg.location = [mSelf.setDlg.location[0], 150];
                        mSelf.setDlg.show();
                        //mSelf.valSet = true;
                    }
                //ヘルプメニュー
                }else if(valMenu == "help"){
                    if(mSelf.valHelp){
                        mSelf.helpDlg.close();
                    }else{
                        var helpW = new Array();
                        if(bSelf.OS == "Win"){
                            helpW = [700,310];
                        }else if(bSelf.OS == "Mac"){
                            helpW = [640,280];
                        }
                        mSelf.helpDlg = new Window("window", " HELP MENU", [0, 0, helpW[0], 860]);
                        mSelf.UI_bgColor255(mSelf.helpDlg, [240,240,240]);

                        var helpSTR = new Array();
                        //[項目,注釈,Win,Mac]
                        helpSTR =
                                [
                                    ["ウインドウ位置をリセット(センターへ移動)","","・・・Shift + Home","・・・Shift + Home"],
                                    ["ウインドウサイズ切り替え"," ※モニター縦1100以下 または 60fps時は拡大モードで固定","・・・W","・・・W"],
                                    ["Fr表示切替(２ページ目以降)","","・・・N","・・・N"],
                                    ["ページ切り替え","","・・・PageDown(Ctrl + Shift + Alt + －) or PageUp(Ctrl + Shift + Alt + ＋)","・・・Shift + Option + , or Shift + Option + ."],
                                    ["アンドゥ(10回まで記憶)","","・・・Ctrl + Z","・・・Z"],
                                    ["リドゥ","","・・・Ctrl + Shift + Z or Ctrl + X","・・・X"],
                                    ["最初 or 最後のページに移動","","・・・Home or End","・・・Home or End"],
                                    ["片側３秒分を選択(現ページのみ)","","・・・#番号 Click","・・・#番号 Click"],
                                    ["全フレーム選択(全ページ)","","・・・#番号 W Click  or Ctrl + A","・・・#番号 W Click  or A"],
                                    ["選択範囲を全解除","","・・・Ctrl + D","・・・D"],
                                    ["選択範囲を追加","","・・・Shift + Alt + Click","・・・Shift + Option + Click"],
                                    ["選択範囲を解除","","・・・Alt + Click","・・・Option + Click"],
                                    ["選択範囲の間を追加＆解除"," ※1度左Clickした後 [Shift or Alt(Option)後でも可]","・・・右Click or Shift + Click","・・・右Click or Shift + Click"],
                                    ["選択範囲を増減","","・・・Shift + ↓(＋) or ↑(－)","・・・Shift + . or ,"],
                                    ["選択範囲を移動","","・・・↓(Alt + ＋) or ↑(Alt + －) or ←(Ctrl + －) or →(Ctrl + ＋)","・・・Option + . or Option + , or Ctrl + , or Ctrl + ."],
                                    ["選択セルをコピー","","・・・Ctrl + C","・・・C"],
                                    ["選択セルをペースト(選択は1FrのみでOK)","","・・・Ctrl + V","・・・V"],
                                    ["数値入力時、１文字削除","","・・・Backspace","・・・Backspace"],
                                    ["数値入力時、全文字削除","","・・・Delete","・・・Delete"],
                                    ["ヘルプメニューを開閉","","・・・Ctrl + H","・・・H"],
                                    ["AEに適用しないで閉じる(Winのみ)","","・・・Ctrl + W","non"]
                                ]

                        var helpSTR1 = "";
                        var helpSTR2 = "";
                        for(var s=0;s<helpSTR.length;s++){
                            if(s==0){
                                helpSTR1 = helpSTR[0][0];

                                if(bSelf.OS == "Win"){
                                    helpSTR2 = helpSTR[0][2];
                                }else if(bSelf.OS == "Mac"){
                                    helpSTR2 = helpSTR[0][3];
                                }
                            }else{
                                helpSTR1 += mSelf.CF + helpSTR[s][0]
                                if(bSelf.OS == "Win"){
                                    helpSTR2 += mSelf.CF + helpSTR[s][2];
                                }else if(bSelf.OS == "Mac"){
                                    helpSTR2 += mSelf.CF + helpSTR[s][3];
                                }
                                helpSTR1 += mSelf.CF + helpSTR[s][1];
                                helpSTR2 += mSelf.CF;
                            }
                        }

                        var helpSTR3 = "○連番入力( / で区切って３回入力)"+mSelf.CF+mSelf.tabS+"スタートセル番号 / Fr数  + or - (Mac . or ,) [Fr数と+ or - の間には / 無し]"+mSelf.CF+mSelf.tabS+"※セル1番目から３ｋで繰り上がり時の入力例：  1/3+(Mac .)"+mSelf.CF+mSelf.CF+
                                        "○リピート＆逆シート入力( / で区切って４回入力)"+mSelf.CF+mSelf.tabS+"スタートセル番号 / ラストセル番号 / Fr数  R (リピート) or G (逆シート) [Fr数とR or G の間には / 無し]"+mSelf.CF+mSelf.tabS+
                                        "※セル1番目から10番目を３ｋで逆シート時の入力例：  1/10/3G"+mSelf.CF+mSelf.CF+
                                        "○飛び石入力( / で区切って３回入力)"+mSelf.CF+mSelf.tabS+"スタートセル番号 / 選択部分のFr数 / 未選択部分のFr数 + F (Fのみ = 止メ、0F = 空セル)"+mSelf.CF+mSelf.tabS+
                                        "※セル1番目から選択部分を３ｋで未選択部分を２ｋ時の入力例：  1/3/2F"+mSelf.CF+mSelf.CF+mSelf.CF+mSelf.CF+
                                        "※Mac での 不具合"+mSelf.CF+" ＋キー、矢印キー、PageUp・PageDownキー、Enterキー(以上CC)、修飾キー(CS6) etc...が取得不可"+mSelf.CF+" Mac用代価キー ＋(Plus) → .(Period) / －(Minus) → ,(Comma) ";

                        mSelf.helpInfo = mSelf.helpDlg.add("statictext", [10,5,helpW[1],35], "＝ Key Reference ＝", {readonly:true}); mSelf.helpInfo.justify = "left";
                        mSelf.UI_font(mSelf.helpInfo, "Arial","BOLD", 20);
                        var helpInfo1 = mSelf.helpDlg.add("statictext", [10,40,helpW[1],590], helpSTR1, {multiline:true,readonly:true}); helpInfo1.justify = "left";
                        mSelf.UI_fgColor255(helpInfo1, [40,40,40]);
                        mSelf.UI_font(helpInfo1, "Arial","BOLD", 11);
                        var helpInfo2 = mSelf.helpDlg.add("statictext", [helpW[1] + 5,40,690,590], helpSTR2, {multiline:true,readonly:true}); helpInfo2.justify = "left";
                        mSelf.UI_fgColor255(helpInfo2, [40,40,40]);
                        mSelf.UI_font(helpInfo2, "Arial","BOLD", 11);
                        var helpInfo3 = mSelf.helpDlg.add("statictext", [10,600,640,850], helpSTR3, {multiline:true,readonly:true}); helpInfo3.justify = "left";
                        mSelf.UI_fgColor255(helpInfo3, [40,40,40]);
                        mSelf.UI_font(helpInfo3, "Arial","BOLD", 11);

                        var mmSelf = mSelf;
                        mSelf.helpDlg.onClose = function()
                                                        {
                                                            //全てのヘルプメニューオブジェクトを削除
                                                            mmSelf.TS_reMove(mmSelf, mmSelf.helpDlg);
                                                            mmSelf.valHelp = false;
                                                        }

                        mSelf.helpDlg.location = [20,75];
                        mSelf.helpDlg.show();
                        mSelf.valHelp = true;
                    }
                }
            },

            //エディットダイアログ
            edDlg_Bld: function(eSelf)
            {
                var eeSelf = eSelf;
                var logChk = "現在の総尺: " + eSelf.DurFr + "Fr    " + eSelf.DurTime;
                eSelf.edDlg = new Window("dialog", " EDIT", [0, 0, 370, 180]);
                eSelf.UI_bgColor255(eSelf.edDlg, [40,40,40]);
                eSelf.UI_fgColor255(eSelf.edDlg, [255,190,90]);

                var tsChk = eSelf.edDlg.add("checkbox",[10,10,150,30],"シートの内容を残す");
                tsChk.value = true;

                var valChk = 0;
                var chkGrp = eSelf.edDlg.add("panel",[5,40,365,75], "", {borderStyle:"black"});
                var chkBtnA = chkGrp.add("radiobutton",[5,5,120,30],"総尺を変更");
                chkBtnA.value = true;
                chkBtnA.onClick = function()
                                            {
                                                if(this.value){
                                                    chkInfoA1.text = "変更後の総尺";
                                                    chkInfoA2.text = "Fr";
                                                    chkGpB.visible = false;
                                                    valChk = 0;

                                                    chkEDA.text = "";
                                                    chkEDB.text = "";
                                                    chkLogInfo.text = logChk;
                                                    eeSelf.UI_fgColor255(chkLogInfo, [255,190,90]);
                                                }
                                            }
                var chkBtnB = chkGrp.add("radiobutton",[125,5,240,30],"フレームを挿入");
                chkBtnB.onClick = function()
                                            {
                                                if(this.value){
                                                    chkInfoA1.text = "挿入するFr";
                                                    chkInfoA2.text = "Fr 目";
                                                    chkInfoB1.text = "挿入フレーム数";
                                                    chkInfoB2.text = "Fr";
                                                    chkGpB.visible = true;
                                                    valChk = 1;

                                                    chkEDA.text = "";
                                                    chkEDB.text = "";
                                                    chkLogInfo.text = logChk;
                                                    eeSelf.UI_fgColor255(chkLogInfo, [255,190,90]);
                                                }
                                            }
                var chkBtnC = chkGrp.add("radiobutton",[245,5,360,30],"フレームを削除");
                chkBtnC.onClick = function()
                                            {
                                                if(this.value){
                                                    chkInfoA1.text = "削除するFr";
                                                    chkInfoA2.text = "Fr 目";
                                                    chkInfoB1.text = "削除フレーム数";
                                                    chkInfoB2.text = "Fr";
                                                    chkGpB.visible = true;
                                                    valChk = 2;

                                                    chkEDA.text = "";
                                                    chkEDB.text = "";
                                                    chkLogInfo.text = logChk;
                                                    eeSelf.UI_fgColor255(chkLogInfo, [255,190,90]);
                                                }
                                            }

                var chkGpA = eSelf.edDlg.add("panel",[10,80,100,140], "", {borderStyle:"black"});
                var chkInfoA1 = chkGpA.add("statictext",[5,3,85,23],"変更後の総尺"); chkInfoA1.justify = "left";
                eSelf.UI_fgColor255(chkInfoA1, [255,190,90]);
                var chkEDA = chkGpA.add("edittext",[5,25,50,50]);
                var chkInfoA2 = chkGpA.add("statictext",[55,30,85,50],"Fr"); chkInfoA2.justify = "left";
                eSelf.UI_fgColor255(chkInfoA2, [255,190,90]);

                var chkGpB = eSelf.edDlg.add("panel",[110,80,200,140], "", {borderStyle:"black"});
                var chkInfoB1 = chkGpB.add("statictext",[5,3,85,23],"挿入フレーム数"); chkInfoB1.justify = "left";
                eSelf.UI_fgColor255(chkInfoB1, [255,190,90]);
                var chkEDB = chkGpB.add("edittext",[5,25,50,50]);
                var chkInfoB2 = chkGpB.add("statictext",[55,30,85,50],"Fr"); chkInfoB2.justify = "left";
                eSelf.UI_fgColor255(chkInfoB2, [255,190,90]);
                chkGpB.visible = false;

                var chkLogInfo = eSelf.edDlg.add("statictext",[10,150,365,170],logChk); chkLogInfo.justify = "left";
                eSelf.UI_fgColor255(chkLogInfo, [255,190,90]);

                chkOKBtn = eSelf.edDlg.add("button",[290,90,365,140],"OK",{name:"ok"});
                chkOKBtn.onClick = function()
                                            {
                                                if(chkEDA.text != "" && /[0-9]/.test(Number(chkEDA.text))){
                                                    //do処理
                                                    eeSelf.doFunc(eeSelf,"MEMO");
                                                    editTS(eeSelf,valChk,chkEDA.text,chkEDB.text,tsChk.value);
                                                    eeSelf.edBtn.active = true;
                                                    //do処理
                                                    eeSelf.doFunc(eeSelf,"MEMO");
                                                }else{
                                                    //ログ
                                                    chkLogInfo.text = "数字が入力されていません";
                                                    eeSelf.UI_fgColor255(chkLogInfo, [240,50,50]);
                                                }
                                            }

                eSelf.edDlg.onClose = function()
                                                {
                                                    //全てのセッティングメニューオブジェクトを削除
                                                    eeSelf.TS_reMove(eeSelf,eeSelf.edDlg);

                                                    eeSelf.valED = false;
                                                }

                eSelf.edDlg.center();
                eSelf.edDlg.location = [eSelf.edDlg.location[0], 150];
                eSelf.edDlg.show();
                eSelf.valED = true;

                function editTS(tsSelf,chkNO,valA,valB,tsVal)
                {
                    var newDir = new Array();
                    var oldDir = tsSelf.DurFr;
                    tsSelf.pageVal = 1;
                    var logSTR = "";
                    switch(chkNO)
                    {
                        case 0:     tsSelf.DurFr = Number(valA);
                                    var stNum = oldDir;
                                    var enNum = Number(valA);
                                    logSTR = "総尺を変更しました___総尺: " + tsSelf.DurFr +"Fr   ";
                                    break;
                        case 1:     if(/[0-9]/.test(Number(valB))){
                                        tsSelf.DurFr = Number(oldDir) + Number(valB);
                                        var stNum = Number(valA) - 1;
                                        var enNum = stNum + Number(valB);
                                        logSTR = "フレームを挿入しました___" + valA + "Fr目から" + valB + "Frを挿入___総尺: " + tsSelf.DurFr +"Fr   ";
                                    }
                                    break;
                        case 2:     if(/[0-9]/.test(Number(valB))){
                                        tsSelf.DurFr = Number(oldDir) - Number(valB);
                                        var stNum = Number(valA) - 1;
                                        var enNum = stNum + Number(valB);
                                        logSTR = "フレームを削除しました___" + valA + "Fr目から" + valB + "Frを削除___総尺: " + tsSelf.DurFr +"Fr   ";
                                    }
                                    break;
                    }

                    if(logSTR != ""){
                        //シートの内容を残す場合
                        if(tsVal){
                            var newData = new Array();
                            newData = tsSelf.cellData;
                            tsSelf.cellData = new Array();
                            for(var ii=0;ii<tsSelf.cellLys.length;ii++){
                                tsSelf.cellData[ii] = new Array();
                                for(var i=0;i<tsSelf.DurFr;i++){
                                    if(ii == 0){
                                        tsSelf.selCell[i] = false;
                                    }
                                    if(stNum <= i){
                                        if(chkNO < 2){
                                            if(i < enNum){
                                                tsSelf.cellData[ii][i] = 0;
                                            }else{
                                                if(i - enNum < newData[ii].length){
                                                    tsSelf.cellData[ii][i] = newData[ii][i - Number(valB)];
                                                }else{
                                                    tsSelf.cellData[ii][i] = 0;
                                                }
                                            }
                                        }else{
                                            tsSelf.cellData[ii][i] = newData[ii][i + Number(valB)];
                                        }
                                    }else{
                                        tsSelf.cellData[ii][i] = newData[ii][i];
                                    }
                                }
                            }
                        //シートの内容をクリア
                        }else{
                            tsSelf.cellData = new Array();
                            for(var ii=0;ii<tsSelf.cellLys.length;ii++){
                                tsSelf.cellData[ii] = new Array();
                                for(var i=0;i<tsSelf.DurFr;i++){
                                    if(ii == 0){
                                        tsSelf.selCell[i] = false;
                                    }
                                    tsSelf.cellData[ii][i] = 0;
                                }
                            }
                        }
                        tsSelf.Dur = tsSelf.DurFr / tsSelf.FrRate;
                        tsSelf.Dur.toPrecision(15);
                        tsSelf.numPage = Math.ceil(tsSelf.DurFr / (tsSelf.FrRate * 6));
                        tsSelf.DurTime = String(Math.floor(tsSelf.Dur)) +" s + "+ String(tsSelf.DurFr % tsSelf.FrRate) +" k";
                        tsSelf.compFr.text = tsSelf.DurFr;
                        tsSelf.compTime.text = tsSelf.DurTime;
                        tsSelf.pageNo.text = tsSelf.pageVal + " / " + tsSelf.numPage;
                        tsSelf.TS_rePage(tsSelf, tsSelf.DurFr);
                        tsSelf.toggleCellNo(tsSelf, tsSelf.valCN);
                        tsSelf.chgSec(tsSelf, tsSelf.pageVal);
                        tsSelf.showSel(tsSelf, tsSelf.curCell, tsSelf.selCell);
                        //ログ
                        tsSelf.logInfo.text = logSTR + tsSelf.DurTime;
                        tsSelf.UI_fgColor255(tsSelf.logInfo, [255,190,90]);
                        tsSelf.edDlg.close();
                    }else{
                        //ログ
                        chkLogInfo.text = "数字が入力されていません";
                        tsSelf.UI_fgColor255(chkLogInfo, [240,50,50]);
                    }
                }
            },

            //入力オプションダイアログ
            opDlg_Bld: function(oSelf)
            {
                var ooSelf = oSelf;
                oSelf.opDlg = new Window("dialog", " OPTIONS", [0, 0, 460, 170]);
                oSelf.UI_bgColor255(oSelf.opDlg, [40,40,40]);
                oSelf.UI_fgColor255(oSelf.opDlg, [255,190,90]);

                var opInfo = oSelf.opDlg.add("statictext", [20,5,150,35], "入力オプション");

                var rbGrp = oSelf.opDlg.add("group",[10,35,310,65]);
                var valBtn = 0;
                var rbBtnA = rbGrp.add("radiobutton",[5,6,80,26],"連番入力");
                rbBtnA.value = true;
                rbBtnA.onClick = function()
                                            {
                                                if(this.value){
                                                    valBtn = 0;
                                                    infoChg(valBtn);
                                                }
                                            }
                var rbBtnB = rbGrp.add("radiobutton",[85,6,200,26],"リピート or 逆シート");
                rbBtnB.onClick = function()
                                            {
                                                if(this.value){
                                                    valBtn = 1;
                                                    infoChg(valBtn);
                                                }
                                            }
                var rbBtnC = rbGrp.add("radiobutton",[205,6,290,26],"飛び石入力");
                rbBtnC.onClick = function()
                                            {
                                                if(this.value){
                                                    valBtn = 2;
                                                    infoChg(valBtn);
                                                }
                                            }

                var edGrp = oSelf.opDlg.add("panel",[10,70,320,160], "", {borderStyle:"black"});
                var edSTR = new Array();
                edSTR = [
                            ["開始セル番号","Fr数","+ (増幅) / - (減少)"],
                            ["開始セル番号","ラストセル番号","Fr数"],
                            ["開始セル番号","Fr数(選択部分)","Fr数(未選択部分)"]
                        ];
                var edInfo = new Array();
                edInfo[0] = edGrp.add("statictext",[5,5,100,22],"開始セル番号"); edInfo[0].justify = "left";
                edInfo[1] = edGrp.add("statictext",[105,5,200,22],"Fr数"); edInfo[1].justify = "left";
                edInfo[2] = edGrp.add("statictext",[205,5,315,22],"+ (増幅) / - (減少)"); edInfo[2].justify = "left"

                var edObj = new Array();
                edObj[0] = edGrp.add("edittext",[5,25,60,50],"");
                edObj[0].active = true;
                edObj[1] = edGrp.add("edittext",[105,25,160,50],"");
                edObj[2] = edGrp.add("edittext",[205,25,260,50],"");
                edObj[2].visible = false;

                var pmVal = "+";
                var pmGrp = edGrp.add("group",[110,55,300,85]);
                var rdBtnD = pmGrp.add("radiobutton",[5,5,100,25],"+ (増幅)");
                rdBtnD.value = true;
                rdBtnD.onClick = function()
                                            {
                                                if(this.value){
                                                    if(valBtn == 0){
                                                        pmVal = "+";
                                                    }else if(valBtn == 1){
                                                        pmVal = "R";
                                                    }
                                                }
                                            }
                var rdBtnE = pmGrp.add("radiobutton",[105,5,200,25],"- (減少)");
                rdBtnE.onClick = function()
                                            {
                                                if(this.value){
                                                    if(valBtn == 0){
                                                        pmVal = "-";
                                                    }else if(valBtn == 1){
                                                        pmVal = "G";
                                                    }
                                                }
                                            }

                var pmInfo = edGrp.add("statictext",[5,55,300,85],"※ \"Fr数(未選択部分)\" には、空セル = 0 , 止メ = F と入力"); pmInfo.justify = "left";
                pmInfo.visible = false;

                oSelf.opDlg.onClose = function()
                                                {
                                                    //全ての入力オプションメニューオブジェクトを削除
                                                    ooSelf.TS_reMove(ooSelf,ooSelf.opDlg);

                                                    ooSelf.valOP = false;
                                                }

                var okBtn = oSelf.opDlg.add("button",[325,110,450,160],"OK",{name:"ok"});
                okBtn.onClick = function()
                                        {
                                            if(valBtn == 0){
                                                ooSelf.clVal = 0;
                                                ooSelf.edBtn.text = "";

                                                //初期化
                                                ooSelf.impCell = null;
                                                var strVal = new Array();
                                                strVal = [edObj[0].text,edObj[1].text];

                                                if(strVal.length == 2){
                                                    ooSelf.stTxt.text = strVal.join("/");
                                                    ooSelf.opData = new Array();
                                                    ooSelf.opData = strVal;
                                                    ooSelf.opData.push(pmVal);
                                                    ooSelf.setRENBAN(ooSelf, ooSelf.curCell, ooSelf.opData);
                                                    //do処理
                                                    ooSelf.doFunc(ooSelf,"MEMO");

                                                    //ログ
                                                    ooSelf.logInfo.text = "連番入力(" + pmVal + ")を適用しました___" + ooSelf.stTxt.text + pmVal;
                                                    ooSelf.UI_fgColor255(ooSelf.logInfo, [255,190,90]);
                                                    ooSelf.stTxt.text = "";
                                                //エラーログ
                                                }else{
                                                    ooSelf.logInfo.text = "入力が間違っています(3)___" + ooSelf.stTxt.text + pmVal;
                                                    ooSelf.UI_fgColor255(ooSelf.logInfo, [240,50,50]);
                                                    ooSelf.stTxt.text = "";
                                                }
                                            }else if(valBtn == 1){
                                                //初期化
                                                ooSelf.impCell = null;
                                                ooSelf.clVal = 0;
                                                ooSelf.edBtn.text = "";
                                                ooSelf.plVal = false;
                                                ooSelf.miVal = false;

                                                var strVal = new Array();
                                                strVal = [edObj[0].text,edObj[1].text,edObj[2].text];
                                                if(strVal.length == 3){
                                                    ooSelf.stTxt.text = strVal.join("/");
                                                    ooSelf.opData = new Array();
                                                    ooSelf.opData = strVal;
                                                    ooSelf.opData.push(pmVal);
                                                    ooSelf.setREPEAT(ooSelf, ooSelf.curCell, ooSelf.opData);
                                                    //do処理
                                                    ooSelf.doFunc(ooSelf,"MEMO");

                                                    //ログ
                                                    if(pmVal == "R"){
                                                        ooSelf.logInfo.text = "リピート入力を適用しました___" + ooSelf.stTxt.text + pmVal;
                                                    }else if(pmVal == "G"){
                                                        ooSelf.logInfo.text = "逆シート入力を適用しました___" + ooSelf.stTxt.text + pmVal;
                                                    }
                                                    ooSelf.UI_fgColor255(ooSelf.logInfo, [255,190,90]);
                                                    ooSelf.stTxt.text = "";
                                                //エラーログ
                                                }else{
                                                    ooSelf.logInfo.text = "入力が間違っています(4)___" + ooSelf.stTxt.text + pmVal;
                                                    ooSelf.UI_fgColor255(ooSelf.logInfo, [240,50,50]);
                                                    ooSelf.stTxt.text = "";
                                                }
                                            }else if(valBtn == 2){
                                                //初期化
                                                ooSelf.impCell = null;
                                                ooSelf.clVal = 0;
                                                ooSelf.edBtn.text = "";
                                                ooSelf.plVal = false;
                                                ooSelf.miVal = false;

                                                var strVal = new Array();
                                                if(edObj[2].text == "F" || edObj[2].text == "f"){
                                                    strVal = [edObj[0].text,edObj[1].text,""];
                                                }else{
                                                    strVal = [edObj[0].text,edObj[1].text,edObj[2].text];
                                                }

                                                //飛び石入力
                                                if(strVal.length == 3){
                                                    ooSelf.stTxt.text = strVal.join("/");
                                                    //未選択部分が止メの場合
                                                    if(strVal[2] == ""){
                                                        strVal[2] = "F";
                                                    }
                                                    ooSelf.opData = new Array();
                                                    ooSelf.opData = strVal;
                                                    ooSelf.setOFFON(ooSelf, ooSelf.curCell, ooSelf.opData);
                                                    //do処理
                                                    ooSelf.doFunc(ooSelf,"MEMO");

                                                    //ログ
                                                    ooSelf.logInfo.text = "飛び石入力を適用しました___" + ooSelf.stTxt.text + "F";
                                                    ooSelf.UI_fgColor255(ooSelf.logInfo, [255,190,90]);
                                                    ooSelf.stTxt.text = "";

                                                //エラーログ
                                                }else{
                                                    ooSelf.logInfo.text = "入力が間違っています(3)___" + ooSelf.stTxt.text + "F";
                                                    ooSelf.UI_fgColor255(ooSelf.logInfo, [240,50,50]);
                                                    ooSelf.stTxt.text = "";
                                                }
                                            }
                                            ooSelf.selNum = "";
                                            ooSelf.opDlg.close();
                                            ooSelf.edBtn.active = true;
                                        }

                oSelf.opDlg.center();
                oSelf.opDlg.location = [oSelf.opDlg.location[0], 150];
                oSelf.opDlg.show();
                oSelf.valOP = true;

                //表示切替
                function infoChg(edVal)
                {
                    for(var i=0;i<3;i++){
                        edInfo[i].text = edSTR[edVal][i];
                    }
                    if(edVal == 0){
                        rdBtnD.text = "+ (増幅)";
                        rdBtnE.text = "- (減少)";
                        pmInfo.visible = false;
                        edObj[2].visible = false;
                        pmGrp.visible = true;
                        if(rdBtnD.value){
                            pmVal = "+";
                        }else{
                            pmVal = "-";
                        }
                    }else if(edVal == 1){
                        rdBtnD.text = "リピート";
                        rdBtnE.text = "逆シート";
                        pmInfo.visible = false;
                        edObj[2].visible = true;
                        pmGrp.visible = true;
                        if(rdBtnD.value){
                            pmVal = "R";
                        }else{
                            pmVal = "G";
                        }
                    }else if(edVal == 2){
                        pmGrp.visible = false;
                        edObj[2].visible = true;
                        pmInfo.visible = true;
                    }
                }
            },

            //loadPref
            loadPref: function()
            {
                var strC = "TimeSheet_AE_CC pref";
                var strD = ["Monitor Size", "Window Position", "save Window Position", "Sheet Size", "close TimeSheet", "setup Value"];

                var prefVal = new Array();
                var reVal = new Array();
                for(var i=0;i<strD.length;i++){
                    if(i < 2){
                        //環境設定があるか判定
                        if(app.preferences.havePref(strC, strD[i])){
                            //環境設定を読み込み
                            var mVal = app.preferences.getPrefAsString(strC, strD[i]);
                            prefVal[i] = new Array();
                            prefVal[i] = mVal.split(",");
                            reVal.push(prefVal[i]);
                        }
                    }else{
                        //環境設定があるか判定
                        if(app.preferences.havePref(strC, strD[i])){
                            //環境設定を読み込み
                            prefVal[i] = app.preferences.getPrefAsString(strC, strD[i]);
                            if(i == 2){
                                prefVal[i] == "true" ? reVal[i] = true : reVal[i] = false;
                            }else if(i == 3){
                                prefVal[i] == "true" ? reVal[i] = true : reVal[i] = false;
                            }else if(i == 4){
                                prefVal[i] == "true" ? reVal[i] = true : reVal[i] = false;
                            }else if(i == 5){
                                prefVal[i] == "true" ? reVal[i] = true : reVal[i] = false;
                            }
                        }
                    }
                }

                return reVal;
            },

            //save Pref
            savePref: function(mSize, wPos, valWin, valSize, valClose, valSetUp)
            {
                //環境設定に書き込み
                var strA = "TimeSheet_AE_CC pref";
                var strB = [    ["Monitor Size", String(mSize)],
                                ["Window Position", String(wPos)],
                                ["save Window Position", String(valWin)],
                                ["Sheet Size", String(valSize)],
                                ["close TimeSheet", String(valClose)],
                                ["setup Value", String(valSetUp)]
                            ]
                for(var i=0;i<strB.length;i++){
                    app.preferences.savePrefAsString(strA, strB[i][0], strB[i][1]);
                }
                app.preferences.saveToDisk();
                app.preferences.reload();
            },

            //mouse Event 用ファンクション****************************************************
            //mousemove
            mvFunc1: function(mm)
            {
                //セル選択
                if(bSelf.valMD){
                    switch(this.nameID)
                   {
                       case "CELL":    //cell
                                        //altKey
                                        if(bSelf.altVal){
                                            //同じセルだったら選択解除
                                            if(bSelf.curCell == this.cellID){
                                                bSelf.setDeSelCell(bSelf, this.cellID, this.cellIndex);
                                            }
                                        }else{
                                            //同じセルだったら選択
                                            if(bSelf.curCell == this.cellID){
                                                bSelf.setSelCell(bSelf, this.cellID, this.cellIndex);
                                            }
                                        }
                                        //初期化
                                        bSelf.valLastClick = new Array();
                                        this.active = false;
                                        break;
                   }
                }
            },

            //mousedown
            mdFunc1: function(md)
            {
                //選択セル判別
                var selVal3 = bSelf.getSelVal(bSelf);

                //左クリック
                if(md.button == 0){
                    //シングルクリック
                    if(md.detail == 1){
                        switch(this.nameID)
                        {
                            case "cNAME":   bSelf.valMD = true;
                                            //ShiftKey
                                            if(md.shiftKey){
                                                //同じセルだったら追加
                                                if(bSelf.curCell == this.cellID){
                                                    //片側選択
                                                    bSelf.halfSelect(bSelf, this.cellID, this.idLR);
                                                }
                                            }else{
                                                //選択セルがある場合
                                                if(selVal3){
                                                    //すでに選択されている場合は全選択解除
                                                    bSelf.allDeSelect(bSelf, bSelf.curCell, true);
                                                }

                                                //片側選択
                                                bSelf.halfSelect(bSelf, this.cellID, this.idLR);
                                            }
                                            this.active = false;
                                            bSelf.shiftVal = false;
                                            bSelf.altVal = false;
                                            bSelf.valMDSL = false;
                                            bSelf.valMD = false;
                                            //ログ
                                            bSelf.logInfo.text = "";
                                            bSelf.UI_fgColor255(bSelf.logInfo, [240,240,240]);
                                            break;
                            case "CELL":    var pVal = (bSelf.pageVal - 1) * (bSelf.FrRate * 6);
                                            bSelf.valMD = true;
                                            //選択セルがなければセルタイトルを取得
                                            //ShiftKey + Alt(Option)Key
                                            if(md.shiftKey && md.altKey){
                                                //同じセルだったら選択追加
                                                if(bSelf.curCell == this.cellID){
                                                    bSelf.setSelCell(bSelf, this.cellID, this.cellIndex);
                                                    if(bSelf.valLastClick.length < 2){
                                                        bSelf.valLastClick.push(this.cellIndex + pVal);
                                                    }else{
                                                        bSelf.valLastClick.shift();
                                                        bSelf.valLastClick.push(this.cellIndex + pVal);
                                                    }
                                                    bSelf.shiftVal = true;
                                                    bSelf.altVal = false;
                                                }
                                            //ShiftKey
                                            }else if(md.shiftKey){
                                                //同じセルだったら間を選択追加 or 解除
                                                if(bSelf.curCell == this.cellID){
                                                    bSelf.valLastClick = new Array();
                                                    //現在のセルから直前の選択セルを取得
                                                    for(var i=this.cellIndex + pVal;0<i;i--){
                                                        if(bSelf.selCell[this.cellIndex + pVal]){
                                                            if(! bSelf.selCell[i]){
                                                                bSelf.valLastClick.push(i);
                                                                break;
                                                            }
                                                        }else{
                                                            if(bSelf.selCell[i]){
                                                                bSelf.valLastClick.push(i);
                                                                break;
                                                            }
                                                        }
                                                    }
                                                    if(0 < bSelf.valLastClick.length){
                                                        bSelf.valLastClick.push(this.cellIndex + pVal);
                                                        bSelf.setRenSel(bSelf, this.cellID, bSelf.valLastClick);
                                                    }else{
                                                        //エラーログ
                                                        bSelf.logInfo.text = "セルが選択されていません";
                                                        bSelf.UI_fgColor255(bSelf.logInfo, [240,50,50]);
                                                    }
                                                }
                                            //altKey
                                            }else if(md.altKey){
                                                //同じセルだったら選択解除
                                                if(bSelf.curCell == this.cellID){
                                                    bSelf.setDeSelCell(bSelf, this.cellID, this.cellIndex);
                                                    if(bSelf.valLastClick.length < 2){
                                                        bSelf.valLastClick.push(this.cellIndex + pVal);
                                                    }else{
                                                        bSelf.valLastClick.shift();
                                                        bSelf.valLastClick.push(this.cellIndex + pVal);
                                                    }
                                                    bSelf.shiftVal = false;
                                                    bSelf.altVal = true;
                                                }
                                            }else{
                                                //選択セルがある場合
                                                if(selVal3){
                                                    //すでに選択されている場合は全選択解除
                                                    bSelf.allDeSelect(bSelf, bSelf.curCell, true);
                                                }

                                                //再選択
                                                bSelf.setSelCell(bSelf, this.cellID, this.cellIndex);
                                                bSelf.valLastClick = new Array();
                                                bSelf.valLastClick.push(this.cellIndex + pVal);
                                                bSelf.shiftVal = false;
                                                bSelf.altVal = false;
                                            }
                                            this.active = false;
                                            //ログ
                                            bSelf.logInfo.text = "";
                                            bSelf.UI_fgColor255(bSelf.logInfo, [240,240,240]);
                                            break;
                            case "MENU":    //menu
                                            bSelf.UI_bgColor255(bSelf.menuBtn[this.numID], [120,120,240]);
                                            bSelf.menuClick(bSelf, this.ID);
                                            break;
                            case "APPLY":   //apply to AE
                                            //環境設定に書き込み
                                            bSelf.setupVal = true;
                                            bSelf.savePref(bSelf.moniSize, timesheetDLG.location, bSelf.valLoc, bSelf.valBIG, bSelf.applyVal, bSelf.setupVal);

                                            //ログ
                                            bSelf.UI_bgColor255(bSelf.applyBtn, [120,120,240]);
                                            bSelf.setSLKey(bSelf);
                                            bSelf.logInfo.text = "AEに適用しました";
                                            bSelf.UI_fgColor255(bSelf.logInfo, [255,190,90]);

                                            if(bSelf.applyVal){
                                                //bSelf.winCLOSE(bSelf, timesheetDLG);

                                                timesheetDLG.close();
                                            }
                                            break;
                        }
                    //ダブルクリック
                    }else if(md.detail == 2){
                        bSelf.valMD = false;
                        switch(this.nameID)
                        {
                            case "cNAME":   //セルタイトル
                                            //選択セルがある場合
                                            if(selVal3){
                                                //すでに選択されている場合は全選択解除
                                                bSelf.allDeSelect(bSelf, bSelf.curCell, true);
                                            }

                                            //全選択
                                            bSelf.allSelect(bSelf, this.cellID);
                                            this.active = false;
                                            //ログ
                                            bSelf.logInfo.text = "全ページ選択中";
                                            bSelf.UI_fgColor255(bSelf.logInfo, [255,190,90]);
                                            break;
                            case "CELL":    //現在のセル以降を選択
                                            if(bSelf.curCell == this.cellID){
                                                if(md.shiftKey){
                                                    var valKey = "SHIFT";
                                                }else if(md.altKey){
                                                    var valKey = "ALT";
                                                }else{
                                                    var valKey = "NON";
                                                }
                                                bSelf.setSelCellWCick(bSelf,this.cellID, this.cellIndex, valKey);
                                                //ログ
                                                bSelf.logInfo.text = "現在のセル以降を全ページ選択中";
                                                bSelf.UI_fgColor255(bSelf.logInfo, [255,190,90]);
                                                //初期化
                                                bSelf.valLastClick = new Array();
                                                this.active = false;
                                            }
                                            break;
                        }
                    }
                //右クリック
                }else if(md.button == 2){
                    switch(this.nameID)
                    {
                        case "CELL":    //同じセルだったら間を選択追加 or 解除
                                        var pVal = (bSelf.pageVal - 1) * (bSelf.FrRate * 6);
                                        if(bSelf.curCell == this.cellID){
                                            /*
                                            if(bSelf.valLastClick.length < 2){
                                                bSelf.valLastClick.push(this.cellIndex + pVal);
                                            }else{
                                                bSelf.valLastClick.shift();
                                                bSelf.valLastClick.push(this.cellIndex + pVal);
                                            }

                                            bSelf.setRenSel(bSelf, this.cellID, bSelf.valLastClick);
                                            bSelf.valLastClick = new Array();
                                            */
                                            bSelf.valLastClick = new Array();
                                            //現在のセルから直前の選択セルを取得
                                            for(var i=this.cellIndex + pVal;0<i;i--){
                                                if(bSelf.selCell[this.cellIndex + pVal]){
                                                    if(! bSelf.selCell[i]){
                                                        bSelf.valLastClick.push(i);
                                                        break;
                                                    }
                                                }else{
                                                    if(bSelf.selCell[i]){
                                                        bSelf.valLastClick.push(i);
                                                        break;
                                                    }
                                                }
                                            }
                                            if(0 < bSelf.valLastClick.length){
                                                bSelf.valLastClick.push(this.cellIndex + pVal);
                                                bSelf.setRenSel(bSelf, this.cellID, bSelf.valLastClick);
                                            }else{
                                                //エラーログ
                                                bSelf.logInfo.text = "セルが選択されていません";
                                                bSelf.UI_fgColor255(bSelf.logInfo, [240,50,50]);
                                            }
                                        }
                                        break;
                    }
                }
            },

            //mouseup
            muFunc1: function(mu)
            {
                bSelf.valMD = false;
                bSelf.edBtn.active = true;
            },

            //mouseover
            moFunc1: function(mo)
            {
                switch(this.nameID)
                {
                    case "stUI":    //シートオブジェクト
                                    if(bSelf.valMD){
                                        bSelf.valMD = true;
                                    }
                                    break;
                    case "CELL":    if(bSelf.valMD){
                                        //altKey
                                        if(bSelf.altVal){
                                            //同じセルだったら選択解除
                                            if(bSelf.curCell == this.cellID){
                                                bSelf.setDeSelCell(bSelf, this.cellID, this.cellIndex);
                                            }
                                        }else{
                                            //同じセルだったら選択
                                            if(bSelf.curCell == this.cellID){
                                                bSelf.setSelCell(bSelf, this.cellID, this.cellIndex);
                                            }
                                        }
                                        //初期化
                                        bSelf.valLastClick = new Array();
                                        this.active = false;
                                    }
                                    break;
                    case "MENU":    //menu
                                    bSelf.UI_bgColor255(bSelf.menuGrp[this.numID], [120,120,240]);
                                    break;
                    case "APPLY":   //apply to AE
                                    bSelf.UI_bgColor255(bSelf.applyGrp, [120,120,240]);
                                    break;
                    default :       bSelf.valMD = false; break;
                }
            },

            //mouseout
            motFunc1: function(mot)
            {
                switch(this.nameID)
                {
                    case "stUI":    //シートオブジェクト
                                    if(bSelf.valMD){
                                        bSelf.valMD = true;
                                    }
                                    break;
                    case "CELL":    if(bSelf.valMD){
                                        //altKey
                                        if(bSelf.altVal){
                                            //同じセルだったら選択解除
                                            if(bSelf.curCell == this.cellID){
                                                bSelf.setDeSelCell(bSelf, this.cellID, this.cellIndex);
                                            }
                                        }else{
                                            //同じセルだったら選択
                                            if(bSelf.curCell == this.cellID){
                                                bSelf.setSelCell(bSelf, this.cellID, this.cellIndex);
                                            }
                                        }
                                        //初期化
                                        bSelf.valLastClick = new Array();
                                        this.active = false;
                                    }
                                    break;
                    case "MENU":    //menu
                                    bSelf.UI_bgColor255(bSelf.menuGrp[this.numID], [60,60,60]);
                                    bSelf.UI_bgColor255(bSelf.menuBtn[this.numID], [60,60,60]);
                                    break;
                    case "APPLY":   //apply to AE
                                    bSelf.UI_bgColor255(bSelf.applyGrp, [60,60,60]);
                                    bSelf.UI_bgColor255(bSelf.applyBtn, [60,60,60]);
                                    break;
                }
            },

            //keyBoad Event 用ファンクション****************************************************
            //keydown
            kdFunc1: function(kd1)
            {
                var flag3 = false;
                //数字かどうかの判定
                var flag = /[0-9]/.test(Number(bSelf.stTxt.text));
                //alert(flag);

                if(kd1.ctrlKey){
                    if(kd1.shiftKey && kd1.altKey){
                        var valKEY = "ALL";
                    }else{
                        var valKEY = "CTRL";
                    }
                }else if(kd1.shiftKey){
                    var valKEY = "SHIFT";
                }else if(kd1.altKey){
                    var valKEY = "ALT";
                }else{
                    var valKEY = "NON";
                }
                switch (kd1.keyName){
                    case "Plus":    //セル番号入力(Win)
                                    if(flag){
                                        //自動繰上げ入力
                                        if(bSelf.edBtn.text != "" && 0 <= Number(bSelf.edBtn.text)){
                                            if(! bSelf.miVal){
                                                bSelf.clVal = Number(bSelf.edBtn.text);

                                                bSelf.impCell = Number(bSelf.clVal);

                                                //選択セル移動
                                                switch(valKEY){
                                                    case "ALL":   //ページを進める
                                                                                if(bSelf.pageVal < bSelf.numPage){
                                                                                    bSelf.pageVal++;
                                                                                }
                                                                                bSelf.pageNo.text = bSelf.pageVal + " / " + bSelf.numPage;
                                                                                bSelf.TS_rePage(bSelf, bSelf.DurFr);
                                                                                bSelf.toggleCellNo(bSelf, bSelf.valCN);
                                                                                bSelf.chgSec(bSelf, bSelf.pageVal);
                                                                                bSelf.showSel(bSelf, bSelf.curCell, bSelf.selCell);
                                                                                break;
                                                    case "CTRL":    //選択セルを右に移動
                                                                    bSelf.setSelMove(bSelf,bSelf.curCell,"RIGHT");
                                                                    break;
                                                    case "SHIFT":   //選択セルを増やす
                                                                    bSelf.chgSelRen(bSelf, bSelf.curCell, "+");
                                                                    break;
                                                    case "ALT":   //選択セルを下に移動
                                                                    bSelf.setSelMove(bSelf,bSelf.curCell,"SHIFT");
                                                                    break;
                                                    case "NON":   //選択セルを移動
                                                                    bSelf.moveSelRen(bSelf, bSelf.curCell, valKEY, true);
                                                                    break;
                                                }

                                                if(valKEY == "NON"){
                                                    bSelf.stTxt.text = Number(bSelf.edBtn.text);
                                                    bSelf.edBtn.text = Number(bSelf.edBtn.text) + 1;
                                                }

                                            }else{
                                                bSelf.impCell = Number(bSelf.clVal + 1);
                                                //選択セル移動
                                                switch(valKEY){
                                                    case "ALL":   //ページを進める
                                                                                if(bSelf.pageVal < bSelf.numPage){
                                                                                    bSelf.pageVal++;
                                                                                }
                                                                                bSelf.pageNo.text = bSelf.pageVal + " / " + bSelf.numPage;
                                                                                bSelf.TS_rePage(bSelf, bSelf.DurFr);
                                                                                bSelf.toggleCellNo(bSelf, bSelf.valCN);
                                                                                bSelf.chgSec(bSelf, bSelf.pageVal);
                                                                                bSelf.showSel(bSelf, bSelf.curCell, bSelf.selCell);
                                                                                break;
                                                    case "CTRL":    //選択セルを右に移動
                                                                    bSelf.setSelMove(bSelf,bSelf.curCell,"RIGHT");
                                                                    break;
                                                    case "SHIFT":   //選択セルを増やす
                                                                    bSelf.chgSelRen(bSelf, bSelf.curCell, "+");
                                                                    break;
                                                    case "ALT":   //選択セルを下に移動
                                                                    bSelf.setSelMove(bSelf,bSelf.curCell,"SHIFT");
                                                                    break;
                                                    case "NON":   //選択セルを移動
                                                                    bSelf.moveSelRen(bSelf, bSelf.curCell, valKEY, true);
                                                                    break;
                                                }

                                                if(valKEY == "NON"){
                                                    bSelf.stTxt.text = bSelf.clVal;
                                                    bSelf.clVal++;
                                                    bSelf.edBtn.text = bSelf.clVal + 1;
                                                }

                                            }
                                            bSelf.plVal = true;
                                            bSelf.miVal = false;
                                        }else{
                                            if(valKEY == "NON"){
                                                bSelf.logInfo.text = "入力が間違っています  *数字以外が含まれています";
                                                bSelf.UI_fgColor255(bSelf.logInfo, [240,50,50]);
                                            }else{
                                                //選択セル移動
                                                switch(valKEY){
                                                    case "ALL":   //ページを進める
                                                                                if(bSelf.pageVal < bSelf.numPage){
                                                                                    bSelf.pageVal++;
                                                                                }
                                                                                bSelf.pageNo.text = bSelf.pageVal + " / " + bSelf.numPage;
                                                                                bSelf.TS_rePage(bSelf, bSelf.DurFr);
                                                                                bSelf.toggleCellNo(bSelf, bSelf.valCN);
                                                                                bSelf.chgSec(bSelf, bSelf.pageVal);
                                                                                bSelf.showSel(bSelf, bSelf.curCell, bSelf.selCell);
                                                                                break;
                                                    case "CTRL":    //選択セルを右に移動
                                                                    bSelf.setSelMove(bSelf,bSelf.curCell,"RIGHT");
                                                                    break;
                                                    case "SHIFT":   //選択セルを増やす
                                                                    bSelf.chgSelRen(bSelf, bSelf.curCell, "+");
                                                                    break;
                                                    case "ALT":   //選択セルを下に移動
                                                                    bSelf.setSelMove(bSelf,bSelf.curCell,"SHIFT");
                                                                    break;
                                                }
                                            }
                                        }
                                        //do処理
                                        bSelf.doFunc(bSelf,"MEMO");
                                        bSelf.lastSTR = bSelf.edBtn.text;
                                    //入力オプション
                                    //連番入力+
                                    }else{
                                        bSelf.clVal = 0;
                                        //bSelf.stTxt.text = bSelf.stTxt.text + "+";
                                        bSelf.edBtn.text = "";

                                        //初期化
                                        bSelf.impCell = null;
                                        var strVal = new Array();
                                        strVal = bSelf.stTxt.text.split("/");

                                        if(strVal.length == 2){
                                            bSelf.opData = new Array();
                                            bSelf.opData = strVal;
                                            bSelf.opData.push("+");
                                            bSelf.setRENBAN(bSelf, bSelf.curCell, bSelf.opData);
                                            //do処理
                                            bSelf.doFunc(bSelf,"MEMO");

                                            //ログ
                                            bSelf.logInfo.text = "連番入力(+)を適用しました___" + bSelf.stTxt.text + "+";
                                            bSelf.UI_fgColor255(bSelf.logInfo, [255,190,90]);
                                            bSelf.stTxt.text = "";
                                        //エラーログ
                                        }else{
                                            bSelf.logInfo.text = "入力が間違っています(3)___" + bSelf.stTxt.text + "+";
                                            bSelf.UI_fgColor255(bSelf.logInfo, [240,50,50]);
                                            bSelf.stTxt.text = "";
                                        }
                                    }
                                    bSelf.selNum = "";
                                    break;
                    case "Period":   //セル番号入力(Mac)
                                        if(bSelf.OS == "Mac"){
                                            if(flag){
                                                //自動繰上げ入力
                                                if(bSelf.edBtn.text != "" && 0 <= Number(bSelf.edBtn.text)){
                                                    if(! bSelf.miVal){
                                                        bSelf.clVal = Number(bSelf.edBtn.text);

                                                        bSelf.impCell = Number(bSelf.clVal);
                                                        //選択セル移動
                                                        switch(valKEY){
                                                            case "ALL":   //ページを進める
                                                                                if(bSelf.pageVal < bSelf.numPage){
                                                                                    bSelf.pageVal++;
                                                                                }
                                                                                bSelf.pageNo.text = bSelf.pageVal + " / " + bSelf.numPage;
                                                                                bSelf.TS_rePage(bSelf, bSelf.DurFr);
                                                                                bSelf.toggleCellNo(bSelf, bSelf.valCN);
                                                                                bSelf.chgSec(bSelf, bSelf.pageVal);
                                                                                bSelf.showSel(bSelf, bSelf.curCell, bSelf.selCell);
                                                                                break;
                                                            case "CTRL":    //選択セルを右に移動
                                                                            bSelf.setSelMove(bSelf,bSelf.curCell,"RIGHT");
                                                                            break;
                                                            case "SHIFT":   //選択セルを増やす
                                                                            bSelf.chgSelRen(bSelf, bSelf.curCell, "+");
                                                                            break;
                                                            case "ALT":   //選択セルを下に移動
                                                                            bSelf.setSelMove(bSelf,bSelf.curCell,"SHIFT");
                                                                            break;
                                                            case "NON":   //選択セルを移動
                                                                            bSelf.moveSelRen(bSelf, bSelf.curCell, valKEY, true);
                                                                            break;
                                                        }

                                                        if(valKEY == "NON"){
                                                            bSelf.stTxt.text = Number(bSelf.edBtn.text);
                                                            bSelf.edBtn.text = Number(bSelf.edBtn.text) + 1;
                                                        }

                                                    }else{
                                                        bSelf.impCell = Number(bSelf.clVal + 1);
                                                        //選択セル移動
                                                        switch(valKEY){
                                                            case "ALL":   //ページを進める
                                                                                if(bSelf.pageVal < bSelf.numPage){
                                                                                    bSelf.pageVal++;
                                                                                }
                                                                                bSelf.pageNo.text = bSelf.pageVal + " / " + bSelf.numPage;
                                                                                bSelf.TS_rePage(bSelf, bSelf.DurFr);
                                                                                bSelf.toggleCellNo(bSelf, bSelf.valCN);
                                                                                bSelf.chgSec(bSelf, bSelf.pageVal);
                                                                                bSelf.showSel(bSelf, bSelf.curCell, bSelf.selCell);
                                                                                break;
                                                            case "CTRL":    //選択セルを右に移動
                                                                            bSelf.setSelMove(bSelf,bSelf.curCell,"RIGHT");
                                                                            break;
                                                            case "SHIFT":   //選択セルを増やす
                                                                            bSelf.chgSelRen(bSelf, bSelf.curCell, "+");
                                                                            break;
                                                            case "ALT":   //選択セルを下に移動
                                                                            bSelf.setSelMove(bSelf,bSelf.curCell,"SHIFT");
                                                                            break;
                                                            case "NON":   //選択セルを移動
                                                                            bSelf.moveSelRen(bSelf, bSelf.curCell, valKEY, true);
                                                                            break;
                                                        }

                                                        if(valKEY == "NON"){
                                                            bSelf.stTxt.text = bSelf.clVal;
                                                            bSelf.clVal++;
                                                            bSelf.edBtn.text = bSelf.clVal + 1;
                                                        }

                                                    }
                                                    bSelf.plVal = true;
                                                    bSelf.miVal = false;
                                                }else{
                                                    if(valKEY == "NON"){
                                                        bSelf.logInfo.text = "入力が間違っています  *数字以外が含まれています";
                                                        bSelf.UI_fgColor255(bSelf.logInfo, [240,50,50]);
                                                    }else{
                                                        //選択セル移動
                                                        switch(valKEY){
                                                            case "ALL":   //ページを進める
                                                                                        if(bSelf.pageVal < bSelf.numPage){
                                                                                            bSelf.pageVal++;
                                                                                        }
                                                                                        bSelf.pageNo.text = bSelf.pageVal + " / " + bSelf.numPage;
                                                                                        bSelf.TS_rePage(bSelf, bSelf.DurFr);
                                                                                        bSelf.toggleCellNo(bSelf, bSelf.valCN);
                                                                                        bSelf.chgSec(bSelf, bSelf.pageVal);
                                                                                        bSelf.showSel(bSelf, bSelf.curCell, bSelf.selCell);
                                                                                        break;
                                                            case "CTRL":    //選択セルを右に移動
                                                                            bSelf.setSelMove(bSelf,bSelf.curCell,"RIGHT");
                                                                            break;
                                                            case "SHIFT":   //選択セルを増やす
                                                                            bSelf.chgSelRen(bSelf, bSelf.curCell, "+");
                                                                            break;
                                                            case "ALT":   //選択セルを下に移動
                                                                            bSelf.setSelMove(bSelf,bSelf.curCell,"SHIFT");
                                                                            break;
                                                        }
                                                    }
                                                }
                                                //do処理
                                                bSelf.doFunc(bSelf,"MEMO");
                                                bSelf.lastSTR = bSelf.edBtn.text;
                                            //入力オプション
                                            //連番入力+
                                            }else{
                                                bSelf.clVal = 0;
                                                //bSelf.stTxt.text = bSelf.stTxt.text + "+";
                                                bSelf.edBtn.text = "";

                                                //初期化
                                                bSelf.impCell = null;
                                                var strVal = new Array();
                                                strVal = bSelf.stTxt.text.split("/");

                                                if(strVal.length == 2){
                                                    bSelf.opData = new Array();
                                                    bSelf.opData = strVal;
                                                    bSelf.opData.push("+");
                                                    bSelf.setRENBAN(bSelf, bSelf.curCell, bSelf.opData);
                                                    //do処理
                                                    bSelf.doFunc(bSelf,"MEMO");

                                                    //ログ
                                                    bSelf.logInfo.text = "連番入力(+)を適用しました___" + bSelf.stTxt.text + "+";
                                                    bSelf.UI_fgColor255(bSelf.logInfo, [255,190,90]);
                                                    bSelf.stTxt.text = "";
                                                //エラーログ
                                                }else{
                                                    bSelf.logInfo.text = "入力が間違っています(3)___" + bSelf.stTxt.text + "+";
                                                    bSelf.UI_fgColor255(bSelf.logInfo, [240,50,50]);
                                                    bSelf.stTxt.text = "";
                                                }
                                            }
                                        }
                                        bSelf.selNum = "";
                                        break;
                    case "Equal":   //セル番号入力(Win CS6)
                                        if(bSelf.OS == "Win" && bSelf.verVal == 6){
                                            if(flag){
                                                //自動繰上げ入力
                                                if(bSelf.edBtn.text != "" && 0 <= Number(bSelf.edBtn.text)){
                                                    if(! bSelf.miVal){
                                                        bSelf.clVal = Number(bSelf.edBtn.text);

                                                        bSelf.impCell = Number(bSelf.clVal);
                                                        //選択セル移動
                                                        switch(valKEY){
                                                            case "ALL":   //ページを進める
                                                                                if(bSelf.pageVal < bSelf.numPage){
                                                                                    bSelf.pageVal++;
                                                                                }
                                                                                bSelf.pageNo.text = bSelf.pageVal + " / " + bSelf.numPage;
                                                                                bSelf.TS_rePage(bSelf, bSelf.DurFr);
                                                                                bSelf.toggleCellNo(bSelf, bSelf.valCN);
                                                                                bSelf.chgSec(bSelf, bSelf.pageVal);
                                                                                bSelf.showSel(bSelf, bSelf.curCell, bSelf.selCell);
                                                                                break;
                                                            case "CTRL":    //選択セルを右に移動
                                                                            bSelf.setSelMove(bSelf,bSelf.curCell,"RIGHT");
                                                                            break;
                                                            case "SHIFT":   //選択セルを増やす
                                                                            bSelf.chgSelRen(bSelf, bSelf.curCell, "+");
                                                                            break;
                                                            case "ALT":   //選択セルを下に移動
                                                                            bSelf.setSelMove(bSelf,bSelf.curCell,"SHIFT");
                                                                            break;
                                                            case "NON":   //選択セルを移動
                                                                            bSelf.moveSelRen(bSelf, bSelf.curCell, valKEY, true);
                                                                            break;
                                                        }

                                                        if(valKEY == "NON"){
                                                            bSelf.stTxt.text = Number(bSelf.edBtn.text);
                                                            bSelf.edBtn.text = Number(bSelf.edBtn.text) + 1;
                                                        }

                                                    }else{
                                                        bSelf.impCell = Number(bSelf.clVal + 1);
                                                        //選択セル移動
                                                        switch(valKEY){
                                                            case "ALL":   //ページを進める
                                                                                if(bSelf.pageVal < bSelf.numPage){
                                                                                    bSelf.pageVal++;
                                                                                }
                                                                                bSelf.pageNo.text = bSelf.pageVal + " / " + bSelf.numPage;
                                                                                bSelf.TS_rePage(bSelf, bSelf.DurFr);
                                                                                bSelf.toggleCellNo(bSelf, bSelf.valCN);
                                                                                bSelf.chgSec(bSelf, bSelf.pageVal);
                                                                                bSelf.showSel(bSelf, bSelf.curCell, bSelf.selCell);
                                                                                break;
                                                            case "CTRL":    //選択セルを右に移動
                                                                            bSelf.setSelMove(bSelf,bSelf.curCell,"RIGHT");
                                                                            break;
                                                            case "SHIFT":   //選択セルを増やす
                                                                            bSelf.chgSelRen(bSelf, bSelf.curCell, "+");
                                                                            break;
                                                            case "ALT":   //選択セルを下に移動
                                                                            bSelf.setSelMove(bSelf,bSelf.curCell,"SHIFT");
                                                                            break;
                                                            case "NON":   //選択セルを移動
                                                                            bSelf.moveSelRen(bSelf, bSelf.curCell, valKEY, true);
                                                                            break;
                                                        }

                                                        if(valKEY == "NON"){
                                                            bSelf.stTxt.text = bSelf.clVal;
                                                            bSelf.clVal++;
                                                            bSelf.edBtn.text = bSelf.clVal + 1;
                                                        }

                                                    }
                                                    bSelf.plVal = true;
                                                    bSelf.miVal = false;
                                                }else{
                                                    if(valKEY == "NON"){
                                                        bSelf.logInfo.text = "入力が間違っています  *数字以外が含まれています";
                                                        bSelf.UI_fgColor255(bSelf.logInfo, [240,50,50]);
                                                    }else{
                                                        //選択セル移動
                                                        switch(valKEY){
                                                            case "ALL":   //ページを進める
                                                                                        if(bSelf.pageVal < bSelf.numPage){
                                                                                            bSelf.pageVal++;
                                                                                        }
                                                                                        bSelf.pageNo.text = bSelf.pageVal + " / " + bSelf.numPage;
                                                                                        bSelf.TS_rePage(bSelf, bSelf.DurFr);
                                                                                        bSelf.toggleCellNo(bSelf, bSelf.valCN);
                                                                                        bSelf.chgSec(bSelf, bSelf.pageVal);
                                                                                        bSelf.showSel(bSelf, bSelf.curCell, bSelf.selCell);
                                                                                        break;
                                                            case "CTRL":    //選択セルを右に移動
                                                                            bSelf.setSelMove(bSelf,bSelf.curCell,"RIGHT");
                                                                            break;
                                                            case "SHIFT":   //選択セルを増やす
                                                                            bSelf.chgSelRen(bSelf, bSelf.curCell, "+");
                                                                            break;
                                                            case "ALT":   //選択セルを下に移動
                                                                            bSelf.setSelMove(bSelf,bSelf.curCell,"SHIFT");
                                                                            break;
                                                        }
                                                    }
                                                }
                                                //do処理
                                                bSelf.doFunc(bSelf,"MEMO");
                                                bSelf.lastSTR = bSelf.edBtn.text;
                                            //入力オプション
                                            //連番入力+
                                            }else{
                                                bSelf.clVal = 0;
                                                //bSelf.stTxt.text = bSelf.stTxt.text + "+";
                                                bSelf.edBtn.text = "";

                                                //初期化
                                                bSelf.impCell = null;
                                                var strVal = new Array();
                                                strVal = bSelf.stTxt.text.split("/");

                                                if(strVal.length == 2){
                                                    bSelf.opData = new Array();
                                                    bSelf.opData = strVal;
                                                    bSelf.opData.push("+");
                                                    bSelf.setRENBAN(bSelf, bSelf.curCell, bSelf.opData);
                                                    //do処理
                                                    bSelf.doFunc(bSelf,"MEMO");

                                                    //ログ
                                                    bSelf.logInfo.text = "連番入力(+)を適用しました___" + bSelf.stTxt.text + "+";
                                                    bSelf.UI_fgColor255(bSelf.logInfo, [255,190,90]);
                                                    bSelf.stTxt.text = "";
                                                //エラーログ
                                                }else{
                                                    bSelf.logInfo.text = "入力が間違っています(3)___" + bSelf.stTxt.text + "+";
                                                    bSelf.UI_fgColor255(bSelf.logInfo, [240,50,50]);
                                                    bSelf.stTxt.text = "";
                                                }
                                            }
                                        }
                                        bSelf.selNum = "";
                                        break;
                    case "Minus":   //セル番号入力
                                    if(flag){
                                        //自動繰下げ入力
                                        if(bSelf.edBtn.text != "" && flag){
                                            if(! bSelf.plVal){
                                                if(0 < Number(bSelf.edBtn.text)){
                                                    bSelf.clVal = Number(bSelf.edBtn.text);

                                                    bSelf.impCell = Number(bSelf.clVal);
                                                    //選択セル移動
                                                    switch(valKEY){
                                                        case "ALL":   //ページを戻す
                                                                            if(bSelf.pageVal > 1){
                                                                                bSelf.pageVal--;
                                                                                bSelf.pageNo.text = bSelf.pageVal + " / " + bSelf.numPage;
                                                                                bSelf.TS_rePage(bSelf, bSelf.DurFr);
                                                                                bSelf.toggleCellNo(bSelf, bSelf.valCN);
                                                                                bSelf.chgSec(bSelf, bSelf.pageVal);
                                                                                bSelf.showSel(bSelf, bSelf.curCell, bSelf.selCell);
                                                                            }
                                                                            break;
                                                        case "CTRL":    //選択セルを左に移動
                                                                        bSelf.setSelMove(bSelf,bSelf.curCell,"LEFT");
                                                                        break;
                                                        case "SHIFT":   //選択セルを減らす
                                                                        bSelf.chgSelRen(bSelf, bSelf.curCell, "-");
                                                                        break;
                                                        case "ALT":   //選択セルを上に移動
                                                                        bSelf.setSelMove(bSelf,bSelf.curCell,"ALT");
                                                                        break;
                                                        case "NON":   //選択セルを移動
                                                                        bSelf.moveSelRen(bSelf, bSelf.curCell, valKEY, true);
                                                                        break;
                                                    }

                                                    if(valKEY == "NON"){
                                                        bSelf.stTxt.text = Number(bSelf.edBtn.text);
                                                        bSelf.edBtn.text = Number(bSelf.edBtn.text) - 1;
                                                    }

                                                }else{
                                                    bSelf.clVal = 0;
                                                    bSelf.impCell = Number(bSelf.clVal);
                                                    //選択セル移動
                                                    switch(valKEY){
                                                        case "ALL":   //ページを戻す
                                                                            if(bSelf.pageVal > 1){
                                                                                bSelf.pageVal--;
                                                                                bSelf.pageNo.text = bSelf.pageVal + " / " + bSelf.numPage;
                                                                                bSelf.TS_rePage(bSelf, bSelf.DurFr);
                                                                                bSelf.toggleCellNo(bSelf, bSelf.valCN);
                                                                                bSelf.chgSec(bSelf, bSelf.pageVal);
                                                                                bSelf.showSel(bSelf, bSelf.curCell, bSelf.selCell);
                                                                            }
                                                                            break;
                                                        case "CTRL":    //選択セルを左に移動
                                                                        bSelf.setSelMove(bSelf,bSelf.curCell,"LEFT");
                                                                        break;
                                                        case "SHIFT":   //選択セルを減らす
                                                                        bSelf.chgSelRen(bSelf, bSelf.curCell, "-");
                                                                        break;
                                                        case "ALT":   //選択セルを上に移動
                                                                        bSelf.setSelMove(bSelf,bSelf.curCell,"ALT");
                                                                        break;
                                                        case "NON":   //選択セルを移動
                                                                        bSelf.moveSelRen(bSelf, bSelf.curCell, valKEY, true);
                                                                        break;
                                                    }

                                                    bSelf.edBtn.text = "0";
                                                    bSelf.stTxt.text = "0";

                                                }
                                            }else{
                                                bSelf.impCell = Number(bSelf.clVal - 1);
                                                //選択セル移動
                                                switch(valKEY){
                                                    case "ALL":   //ページを戻す
                                                                            if(bSelf.pageVal > 1){
                                                                                bSelf.pageVal--;
                                                                                bSelf.pageNo.text = bSelf.pageVal + " / " + bSelf.numPage;
                                                                                bSelf.TS_rePage(bSelf, bSelf.DurFr);
                                                                                bSelf.toggleCellNo(bSelf, bSelf.valCN);
                                                                                bSelf.chgSec(bSelf, bSelf.pageVal);
                                                                                bSelf.showSel(bSelf, bSelf.curCell, bSelf.selCell);
                                                                            }
                                                                            break;
                                                    case "CTRL":    //選択セルを左に移動
                                                                        bSelf.setSelMove(bSelf,bSelf.curCell,"LEFT");
                                                                        break;
                                                    case "SHIFT":   //選択セルを減らす
                                                                    bSelf.chgSelRen(bSelf, bSelf.curCell, "-");
                                                                    break;
                                                    case "ALT":   //選択セルを上に移動
                                                                    bSelf.setSelMove(bSelf,bSelf.curCell,"ALT");
                                                                    break;
                                                    case "NON":   //選択セルを移動
                                                                    bSelf.moveSelRen(bSelf, bSelf.curCell, valKEY, true);
                                                                    break;
                                                }

                                                if(valKEY == "NON"){
                                                    bSelf.stTxt.text = bSelf.clVal;
                                                    bSelf.clVal--;
                                                    bSelf.edBtn.text = bSelf.clVal - 1;
                                                }

                                            }
                                            bSelf.miVal = true;
                                            bSelf.plVal = false;
                                        }else{
                                            if(valKEY == "NON"){
                                                bSelf.logInfo.text = "入力が間違っています  *数字以外が含まれています";
                                                bSelf.UI_fgColor255(bSelf.logInfo, [240,50,50]);
                                            }else{
                                                //選択セル移動
                                                switch(valKEY){
                                                    case "ALL":   //ページを戻す
                                                                            if(bSelf.pageVal > 1){
                                                                                bSelf.pageVal--;
                                                                                bSelf.pageNo.text = bSelf.pageVal + " / " + bSelf.numPage;
                                                                                bSelf.TS_rePage(bSelf, bSelf.DurFr);
                                                                                bSelf.toggleCellNo(bSelf, bSelf.valCN);
                                                                                bSelf.chgSec(bSelf, bSelf.pageVal);
                                                                                bSelf.showSel(bSelf, bSelf.curCell, bSelf.selCell);
                                                                            }
                                                                            break;
                                                    case "CTRL":    //選択セルを左に移動
                                                                        bSelf.setSelMove(bSelf,bSelf.curCell,"LEFT");
                                                                        //bSelf.moveSelRen(bSelf, bSelf.curCell, "LEFT", false);
                                                                        break;
                                                    case "SHIFT":   //選択セルを減らす
                                                                    bSelf.chgSelRen(bSelf, bSelf.curCell, "-");
                                                                    break;
                                                    case "ALT":   //選択セルを上に移動
                                                                    bSelf.setSelMove(bSelf,bSelf.curCell,"ALT");
                                                                    break;
                                                }
                                            }
                                        }
                                        //do処理
                                        bSelf.doFunc(bSelf,"MEMO");
                                        bSelf.lastSTR = bSelf.edBtn.text;
                                    //入力オプション
                                    //連番入力-
                                    }else{
                                        bSelf.clVal = 0;
                                        //bSelf.stTxt.text = bSelf.stTxt.text + "-";
                                        bSelf.edBtn.text = "";

                                        //初期化
                                        bSelf.impCell = null;
                                        var strVal = new Array();
                                        strVal = bSelf.stTxt.text.split("/");

                                        if(strVal.length == 2){
                                            bSelf.opData = new Array();
                                            bSelf.opData = strVal;
                                            bSelf.opData.push("-");
                                            bSelf.setRENBAN(bSelf, bSelf.curCell, bSelf.opData);
                                            //do処理
                                            bSelf.doFunc(bSelf,"MEMO");

                                            //ログ
                                            bSelf.logInfo.text = "連番入力(-)を適用しました___" + bSelf.stTxt.text + "-";
                                            bSelf.UI_fgColor255(bSelf.logInfo, [255,190,90]);
                                            bSelf.stTxt.text = "";
                                        //エラーログ
                                        }else{
                                            bSelf.logInfo.text = "入力が間違っています(3)___" + bSelf.stTxt.text + "-";
                                            bSelf.UI_fgColor255(bSelf.logInfo, [240,50,50]);
                                            bSelf.stTxt.text = "";
                                        }
                                    }
                                    bSelf.selNum = "";
                                    break;
                    case "Comma":   //セル番号入力(Mac)
                                    if(bSelf.OS == "Mac"){
                                        if(flag){
                                            //自動繰下げ入力
                                            if(bSelf.edBtn.text != "" && flag){
                                                if(! bSelf.plVal){
                                                    if(0 < Number(bSelf.edBtn.text)){
                                                        bSelf.clVal = Number(bSelf.edBtn.text);

                                                        bSelf.impCell = Number(bSelf.clVal);
                                                        //選択セル移動
                                                        switch(valKEY){
                                                            case "CTRL/SHIFT":   //ページを戻す
                                                                            if(bSelf.pageVal > 1){
                                                                                bSelf.pageVal--;
                                                                                bSelf.pageNo.text = bSelf.pageVal + " / " + bSelf.numPage;
                                                                                bSelf.TS_rePage(bSelf, bSelf.DurFr);
                                                                                bSelf.toggleCellNo(bSelf, bSelf.valCN);
                                                                                bSelf.chgSec(bSelf, bSelf.pageVal);
                                                                                bSelf.showSel(bSelf, bSelf.curCell, bSelf.selCell);
                                                                            }
                                                                            break;
                                                            case "CTRL":    //選択セルを左に移動
                                                                        bSelf.setSelMove(bSelf,bSelf.curCell,"LEFT");
                                                                        break;
                                                            case "SHIFT":   //選択セルを減らす
                                                                            bSelf.chgSelRen(bSelf, bSelf.curCell, "-");
                                                                            break;
                                                            case "ALT":   //選択セルを上に移動
                                                                            bSelf.setSelMove(bSelf,bSelf.curCell,"ALT");
                                                                            break;
                                                            case "NON":   //選択セルを移動
                                                                            bSelf.moveSelRen(bSelf, bSelf.curCell, valKEY, true);
                                                                            break;
                                                        }

                                                        if(valKEY == "NON"){
                                                            bSelf.stTxt.text = Number(bSelf.edBtn.text);
                                                            bSelf.edBtn.text = Number(bSelf.edBtn.text) - 1;
                                                        }

                                                    }else{
                                                        bSelf.clVal = 0;
                                                        bSelf.impCell = Number(bSelf.clVal);
                                                        //選択セル移動
                                                        switch(valKEY){
                                                            case "CTRL/SHIFT":   //ページを戻す
                                                                            if(bSelf.pageVal > 1){
                                                                                bSelf.pageVal--;
                                                                                bSelf.pageNo.text = bSelf.pageVal + " / " + bSelf.numPage;
                                                                                bSelf.TS_rePage(bSelf, bSelf.DurFr);
                                                                                bSelf.toggleCellNo(bSelf, bSelf.valCN);
                                                                                bSelf.chgSec(bSelf, bSelf.pageVal);
                                                                                bSelf.showSel(bSelf, bSelf.curCell, bSelf.selCell);
                                                                            }
                                                                            break;
                                                            case "CTRL":    //選択セルを左に移動
                                                                        bSelf.setSelMove(bSelf,bSelf.curCell,"LEFT");
                                                                        break;
                                                            case "SHIFT":   //選択セルを減らす
                                                                            bSelf.chgSelRen(bSelf, bSelf.curCell, "-");
                                                                            break;
                                                            case "ALT":   //選択セルを上に移動
                                                                            bSelf.setSelMove(bSelf,bSelf.curCell,"ALT");
                                                                            break;
                                                            case "NON":   //選択セルを移動
                                                                            bSelf.moveSelRen(bSelf, bSelf.curCell, valKEY, true);
                                                                            break;
                                                        }
                                                        bSelf.edBtn.text = "0";
                                                        bSelf.stTxt.text = "0";

                                                    }
                                                }else{
                                                    bSelf.impCell = Number(bSelf.clVal - 1);
                                                    //選択セル移動
                                                    switch(valKEY){
                                                        case "CTRL/SHIFT":   //ページを戻す
                                                                            if(bSelf.pageVal > 1){
                                                                                bSelf.pageVal--;
                                                                                bSelf.pageNo.text = bSelf.pageVal + " / " + bSelf.numPage;
                                                                                bSelf.TS_rePage(bSelf, bSelf.DurFr);
                                                                                bSelf.toggleCellNo(bSelf, bSelf.valCN);
                                                                                bSelf.chgSec(bSelf, bSelf.pageVal);
                                                                                bSelf.showSel(bSelf, bSelf.curCell, bSelf.selCell);
                                                                            }
                                                                            break;
                                                        case "CTRL":    //選択セルを左に移動
                                                                        bSelf.setSelMove(bSelf,bSelf.curCell,"LEFT");
                                                                        break;
                                                        case "SHIFT":   //選択セルを減らす
                                                                        bSelf.chgSelRen(bSelf, bSelf.curCell, "-");
                                                                        break;
                                                        case "ALT":   //選択セルを上に移動
                                                                        bSelf.setSelMove(bSelf,bSelf.curCell,"ALT");
                                                                        break;
                                                        case "NON":   //選択セルを移動
                                                                        bSelf.moveSelRen(bSelf, bSelf.curCell, valKEY, true);
                                                                        break;
                                                    }

                                                    if(valKEY == "NON"){
                                                        bSelf.stTxt.text = bSelf.clVal;
                                                        bSelf.clVal--;
                                                        bSelf.edBtn.text = bSelf.clVal - 1;
                                                    }

                                                }
                                                bSelf.miVal = true;
                                                bSelf.plVal = false;
                                            }else{
                                                if(valKEY == "NON"){
                                                    bSelf.logInfo.text = "入力が間違っています  *数字以外が含まれています";
                                                    bSelf.UI_fgColor255(bSelf.logInfo, [240,50,50]);
                                                }else{
                                                    //選択セル移動
                                                    switch(valKEY){
                                                        case "ALL":   //ページを戻す
                                                                                if(bSelf.pageVal > 1){
                                                                                    bSelf.pageVal--;
                                                                                    bSelf.pageNo.text = bSelf.pageVal + " / " + bSelf.numPage;
                                                                                    bSelf.TS_rePage(bSelf, bSelf.DurFr);
                                                                                    bSelf.toggleCellNo(bSelf, bSelf.valCN);
                                                                                    bSelf.chgSec(bSelf, bSelf.pageVal);
                                                                                    bSelf.showSel(bSelf, bSelf.curCell, bSelf.selCell);
                                                                                }
                                                                                break;
                                                        case "CTRL":    //選択セルを左に移動
                                                                            bSelf.setSelMove(bSelf,bSelf.curCell,"LEFT");
                                                                            break;
                                                        case "SHIFT":   //選択セルを減らす
                                                                        bSelf.chgSelRen(bSelf, bSelf.curCell, "-");
                                                                        break;
                                                        case "ALT":   //選択セルを上に移動
                                                                        bSelf.setSelMove(bSelf,bSelf.curCell,"ALT");
                                                                        break;
                                                    }
                                                }
                                            }
                                            //do処理
                                            bSelf.doFunc(bSelf,"MEMO");
                                            bSelf.lastSTR = bSelf.edBtn.text;
                                        //入力オプション
                                        //連番入力-
                                        }else{
                                            bSelf.clVal = 0;
                                            //bSelf.stTxt.text = bSelf.stTxt.text + "-";
                                            bSelf.edBtn.text = "";

                                            //初期化
                                            bSelf.impCell = null;
                                            var strVal = new Array();
                                            strVal = bSelf.stTxt.text.split("/");

                                            if(strVal.length == 2){
                                                bSelf.opData = new Array();
                                                bSelf.opData = strVal;
                                                bSelf.opData.push("-");
                                                bSelf.setRENBAN(bSelf, bSelf.curCell, bSelf.opData);
                                                //do処理
                                                bSelf.doFunc(bSelf,"MEMO");

                                                //ログ
                                                bSelf.logInfo.text = "連番入力(-)を適用しました___" + bSelf.stTxt.text + "-";
                                                bSelf.UI_fgColor255(bSelf.logInfo, [255,190,90]);
                                                bSelf.stTxt.text = "";
                                            //エラーログ
                                            }else{
                                                bSelf.logInfo.text = "入力が間違っています(3)___" + bSelf.stTxt.text + "-";
                                                bSelf.UI_fgColor255(bSelf.logInfo, [240,50,50]);
                                                bSelf.stTxt.text = "";
                                            }
                                        }
                                    }
                                    bSelf.selNum = "";
                                    break;
                    case "Up":      //Win
                                    if(bSelf.OS == "Win"){
                                        if(valKEY == "SHIFT"){
                                            //選択セルを減らす
                                            bSelf.chgSelRen(bSelf, bSelf.curCell, "-");
                                        }else{
                                            //選択セルを上に移動
                                            bSelf.setSelMove(bSelf,bSelf.curCell,"ALT");
                                        }
                                        //do処理
                                        bSelf.doFunc(bSelf,"MEMO");
                                    }
                                    bSelf.selNum = "";
                                    break;
                    case "Down":    //Win
                                    if(bSelf.OS == "Win"){
                                        if(valKEY == "SHIFT"){
                                            //選択セルを増やす
                                            bSelf.chgSelRen(bSelf, bSelf.curCell, "+");
                                        }else{
                                            //選択セルを下に移動
                                            bSelf.setSelMove(bSelf,bSelf.curCell,"SHIFT");
                                        }
                                        //do処理
                                        bSelf.doFunc(bSelf,"MEMO");
                                    }
                                    bSelf.selNum = "";
                                    break;
                    case "Right":   //Win
                                    if(bSelf.OS == "Win"){
                                        //選択セルを右に移動
                                        bSelf.setSelMove(bSelf,bSelf.curCell,"RIGHT");
                                        //do処理
                                        bSelf.doFunc(bSelf,"MEMO");
                                    }
                                    bSelf.selNum = "";
                                    break;
                    case "Left":    //Win
                                    if(bSelf.OS == "Win"){
                                        //選択セルを左に移動
                                        bSelf.setSelMove(bSelf,bSelf.curCell,"LEFT");
                                        //do処理
                                        bSelf.doFunc(bSelf,"MEMO");
                                    }
                                    bSelf.selNum = "";
                                    break;
                    case "Enter":   //Enter
                                    if(flag){
                                        bSelf.clVal = Number(bSelf.edBtn.text);
                                        bSelf.impCell = Number(bSelf.clVal);
                                        //選択セル移動
                                        bSelf.moveSelRen(bSelf, bSelf.curCell, valKEY, true);
                                        //do処理
                                        bSelf.doFunc(bSelf,"MEMO");
                                    }
                                    bSelf.edBtn.text = "";
                                    bSelf.enterVal = true;
                                    bSelf.selNum = "";
                                    break;
                    case "Divide":  //入力オプション(Slash と同じ)
                                    if(bSelf.enterVal){
                                        bSelf.stTxt.text = "";
                                    }
                                    //初期化
                                    bSelf.impCell = null;
                                    bSelf.clVal = 0;
                                    bSelf.stTxt.text = bSelf.stTxt.text + "/";
                                    bSelf.edBtn.text = "";
                                    bSelf.selNum = "";
                                    break;
                    case "Slash":   //入力オプション(Divide と同じ)
                                    if(bSelf.enterVal){
                                        bSelf.stTxt.text = "";
                                    }
                                    //初期化
                                    bSelf.impCell = null;
                                    bSelf.clVal = 0;
                                    bSelf.stTxt.text = bSelf.stTxt.text + "/";
                                    bSelf.edBtn.text = "";
                                    bSelf.selNum = "";
                                    break;
                    case "Delete":      //数値消去
                                        bSelf.edBtn.text = "";
                                        bSelf.stTxt.text = "";
                                        bSelf.selNum = "";
                                        break;
                    case "Backspace":   //1文字削除
                                        if(bSelf.edBtn.text != ""){
                                            if(bSelf.edBtn.text.length > 0){
                                                var curTxt = bSelf.edBtn.text.slice(0,bSelf.edBtn.text.length - 1);
                                                if(curTxt.length == 0){
                                                    bSelf.edBtn.text = "";
                                                }else{
                                                    bSelf.clVal = curTxt;
                                                    bSelf.edBtn.text = curTxt;
                                                }
                                                //ログ
                                                if(bSelf.edBtn.text == ""){
                                                    bSelf.stTxt.text = "";
                                                }else{
                                                    bSelf.stTxt.text = bSelf.edBtn.text;
                                                }
                                            }
                                        }else if(bSelf.stTxt.text != ""){
                                            if(bSelf.stTxt.text.length > 0){
                                                var curTxt = bSelf.stTxt.text.slice(0,bSelf.stTxt.text.length - 1);
                                                if(curTxt.length == 0){
                                                    bSelf.stTxt.text = "";
                                                }else{
                                                    bSelf.stTxt.text = curTxt;
                                                }
                                            }
                                        }
                                        bSelf.selNum = "";
                                        break;
                    case "PageUp":  //Win
                                    if(bSelf.OS == "Win"){
                                        //ページを進める
                                        if(bSelf.pageVal < bSelf.numPage){
                                            bSelf.pageVal++;
                                        }
                                        bSelf.pageNo.text = bSelf.pageVal + " / " + bSelf.numPage;
                                        bSelf.TS_rePage(bSelf, bSelf.DurFr);
                                        bSelf.toggleCellNo(bSelf, bSelf.valCN);
                                        bSelf.chgSec(bSelf, bSelf.pageVal);
                                        bSelf.showSel(bSelf, bSelf.curCell, bSelf.selCell);
                                        //do処理
                                        bSelf.doFunc(bSelf,"MEMO");
                                    }
                                    bSelf.selNum = "";
                                    break;
                    case "PageDown"://Win
                                    if(bSelf.OS == "Win"){
                                        //ページを戻す
                                        if(bSelf.pageVal > 1){
                                            bSelf.pageVal--;
                                            bSelf.pageNo.text = bSelf.pageVal + " / " + bSelf.numPage;
                                            bSelf.TS_rePage(bSelf, bSelf.DurFr);
                                            bSelf.toggleCellNo(bSelf, bSelf.valCN);
                                            bSelf.chgSec(bSelf, bSelf.pageVal);
                                            bSelf.showSel(bSelf, bSelf.curCell, bSelf.selCell);
                                        }
                                        //do処理
                                        bSelf.doFunc(bSelf,"MEMO");
                                    }
                                    bSelf.selNum = "";
                                    break;
                    case "Home":    //センターに移動(SHIFT)
                                    if(kd1.shiftKey){
                                        timesheetDLG.center();
                                    //最初のページへ移動
                                    }else{
                                        bSelf.pageVal = 1;
                                        bSelf.pageNo.text = bSelf.pageVal + " / " + bSelf.numPage;
                                        bSelf.TS_rePage(bSelf, bSelf.DurFr);
                                        bSelf.toggleCellNo(bSelf, bSelf.valCN);
                                        bSelf.chgSec(bSelf, bSelf.pageVal);
                                        bSelf.showSel(bSelf, bSelf.curCell, bSelf.selCell);
                                    }
                                    //do処理
                                    bSelf.doFunc(bSelf,"MEMO");
                                    bSelf.selNum = "";
                                    break;
                    case "End":     //最後のページへ移動
                                    bSelf.pageVal = bSelf.numPage;
                                    bSelf.pageNo.text = bSelf.pageVal + " / " + bSelf.numPage;
                                    bSelf.TS_rePage(bSelf, bSelf.DurFr);
                                    bSelf.toggleCellNo(bSelf, bSelf.valCN);
                                    bSelf.chgSec(bSelf, bSelf.pageVal);
                                    bSelf.showSel(bSelf, bSelf.curCell, bSelf.selCell);
                                    //do処理
                                    bSelf.doFunc(bSelf,"MEMO");
                                    bSelf.selNum = "";
                                    break;
                    case "S":       //選択範囲を数字で指定
                                    if(flag){
                                        bSelf.selNum = bSelf.stTxt.text;
                                        var sNum = parseInt(bSelf.selNum);
                                        if(0 < sNum){
                                            //選択範囲を数字で指定
                                            bSelf.setSelNum(bSelf,bSelf.curCell,sNum);
                                            //do処理
                                            bSelf.doFunc(bSelf,"MEMO");
                                            bSelf.selNum = "";
                                        }else{
                                            bSelf.selNum = "";
                                        }
                                        bSelf.edBtn.text = "";
                                        bSelf.stTxt.text = "";
                                    }
                                    break;
                    case "Q":       //選択範囲を指定フレームに移動
                                    if(flag){
                                        bSelf.selNum = bSelf.stTxt.text;
                                        var sNum = parseInt(bSelf.selNum);
                                        if(0 < sNum){
                                            //選択範囲を指定フレームに移動
                                            bSelf.setSelMove(bSelf,bSelf.curCell,sNum - 1);
                                            //do処理
                                            bSelf.doFunc(bSelf,"MEMO");
                                            bSelf.selNum = "";
                                        }else{
                                            bSelf.selNum = "";
                                        }
                                        bSelf.edBtn.text = "";
                                        bSelf.stTxt.text = "";
                                    }
                                    break;
                    case "F":       //入力オプション
                                    if(! flag){
                                        //初期化
                                        bSelf.impCell = null;
                                        bSelf.clVal = 0;
                                        //bSelf.stTxt.text = bSelf.stTxt.text + "F";
                                        bSelf.edBtn.text = "";
                                        bSelf.plVal = false;
                                        bSelf.miVal = false;

                                        var strVal = new Array();
                                        strVal = bSelf.stTxt.text.split("/");

                                        //飛び石入力
                                        if(strVal.length == 3){
                                            //未選択部分が止メの場合
                                            if(strVal[2] == ""){
                                                strVal[2] = "F";
                                            }
                                            bSelf.opData = new Array();
                                            bSelf.opData = strVal;
                                            bSelf.setOFFON(bSelf, bSelf.curCell, bSelf.opData);
                                            //do処理
                                            bSelf.doFunc(bSelf,"MEMO");

                                            //ログ
                                            bSelf.logInfo.text = "飛び石入力を適用しました___" + bSelf.stTxt.text + "F";
                                            bSelf.UI_fgColor255(bSelf.logInfo, [255,190,90]);
                                            bSelf.stTxt.text = "";

                                        //エラーログ
                                        }else{
                                            bSelf.logInfo.text = "入力が間違っています(3)___" + bSelf.stTxt.text + "F";
                                            bSelf.UI_fgColor255(bSelf.logInfo, [240,50,50]);
                                            bSelf.stTxt.text = "";
                                        }
                                    }
                                    bSelf.selNum = "";
                                    break;
                    case "R":       //入力オプション
                                    if(! flag){
                                        //初期化
                                        bSelf.impCell = null;
                                        bSelf.clVal = 0;
                                        //bSelf.stTxt.text = bSelf.stTxt.text + "R";
                                        bSelf.edBtn.text = "";
                                        bSelf.plVal = false;
                                        bSelf.miVal = false;

                                        var strVal = new Array();
                                        strVal = bSelf.stTxt.text.split("/");
                                        if(strVal.length == 3){
                                            bSelf.opData = new Array();
                                            bSelf.opData = strVal;
                                            bSelf.opData.push("R");
                                            bSelf.setREPEAT(bSelf, bSelf.curCell, bSelf.opData);
                                            //do処理
                                            bSelf.doFunc(bSelf,"MEMO");

                                            //ログ
                                            bSelf.logInfo.text = "リピート入力を適用しました___" + bSelf.stTxt.text + "R";
                                            bSelf.UI_fgColor255(bSelf.logInfo, [255,190,90]);
                                            bSelf.stTxt.text = "";
                                        //エラーログ
                                        }else{
                                            bSelf.logInfo.text = "入力が間違っています(4)___" + bSelf.stTxt.text + "R";
                                            bSelf.UI_fgColor255(bSelf.logInfo, [240,50,50]);
                                            bSelf.stTxt.text = "";
                                        }
                                    }
                                    bSelf.selNum = "";
                                    break;
                    case "G":       //入力オプション
                                    if(! flag){
                                        //初期化
                                        bSelf.impCell = null;
                                        bSelf.clVal = 0;
                                        //bSelf.stTxt.text = bSelf.stTxt.text + "G";
                                        bSelf.edBtn.text = "";
                                        bSelf.plVal = false;
                                        bSelf.miVal = false;

                                        var strVal = new Array();
                                        strVal = bSelf.stTxt.text.split("/");
                                        if(strVal.length == 3){
                                            bSelf.opData = new Array();
                                            bSelf.opData = strVal;
                                            bSelf.opData.push("G");
                                            bSelf.setREPEAT(bSelf, bSelf.curCell, bSelf.opData);
                                            //do処理
                                            bSelf.doFunc(bSelf,"MEMO");

                                            //ログ
                                            bSelf.logInfo.text = "逆シート入力を適用しました___" + bSelf.stTxt.text + "G";
                                            bSelf.UI_fgColor255(bSelf.logInfo, [255,190,90]);
                                            bSelf.stTxt.text = "";
                                        //エラーログ
                                        }else{
                                            bSelf.logInfo.text = "入力が間違っています(4)___" + bSelf.stTxt.text + "G";
                                            bSelf.UI_fgColor255(bSelf.logInfo, [240,50,50]);
                                            bSelf.stTxt.text = "";
                                        }
                                    }
                                    bSelf.selNum = "";
                                    break;
                    case "A":       //全選択
                                    //Win
                                    if(bSelf.OS == "Win"){
                                        if(kd1.ctrlKey){
                                            //選択セル判別
                                            var selVal4 = bSelf.getSelVal(bSelf);
                                            //選択セルがある場合
                                            if(selVal4){
                                                //すでに選択されている場合は全選択解除
                                                bSelf.allDeSelect(bSelf, bSelf.curCell, false);
                                            }

                                            //全選択
                                            bSelf.allSelect(bSelf, bSelf.curCell);
                                            //do処理
                                            bSelf.doFunc(bSelf,"MEMO");
                                        }
                                    //Mac
                                    }else if(bSelf.OS == "Mac"){
                                        //選択セル判別
                                        var selVal4 = bSelf.getSelVal(bSelf);
                                        //選択セルがある場合
                                        if(selVal4){
                                            //すでに選択されている場合は全選択解除
                                            bSelf.allDeSelect(bSelf, bSelf.curCell, false);
                                        }

                                        //全選択
                                        bSelf.allSelect(bSelf, bSelf.curCell);
                                        //do処理
                                        bSelf.doFunc(bSelf,"MEMO");
                                    }
                                    bSelf.selNum = "";
                                    break;
                    case "D":       //全選択解除
                                    //Win
                                    if(bSelf.OS == "Win"){
                                        if(kd1.ctrlKey){
                                            bSelf.allDeSelect(bSelf, bSelf.curCell, true);
                                            //do処理
                                            bSelf.doFunc(bSelf,"MEMO");
                                        }
                                    //Mac
                                    }else if(bSelf.OS == "Mac"){
                                        bSelf.allDeSelect(bSelf, bSelf.curCell, true);
                                        //do処理
                                        bSelf.doFunc(bSelf,"MEMO");
                                    }
                                    bSelf.selNum = "";
                                    break;
                    case "C":       //コピー
                                    //Win
                                    if(bSelf.OS == "Win"){
                                        if(kd1.ctrlKey){
                                            bSelf.copyCell(bSelf, bSelf.curCell);
                                        }
                                    //Mac
                                    }else if(bSelf.OS == "Mac"){
                                        bSelf.copyCell(bSelf, bSelf.curCell);
                                    }
                                    bSelf.selNum = "";
                                    break;
                    case "V":       //ペースト
                                    //Win
                                    if(bSelf.OS == "Win"){
                                        if(kd1.ctrlKey){
                                            bSelf.pasteCell(bSelf, bSelf.curCell);
                                            //do処理
                                            bSelf.doFunc(bSelf,"MEMO");
                                        }
                                    //Mac
                                    }else if(bSelf.OS == "Mac"){
                                        bSelf.pasteCell(bSelf, bSelf.curCell);
                                        //do処理
                                        bSelf.doFunc(bSelf,"MEMO");
                                    }
                                    bSelf.selNum = "";
                                    break;
                    case "N":       //セルNO切り替え
                                    if(bSelf.valCN){
                                        bSelf.valCN = false;
                                    }else{
                                        bSelf.valCN = true;
                                    }
                                    bSelf.toggleCellNo(bSelf, bSelf.valCN);
                                    bSelf.showSel(bSelf, bSelf.curCell, bSelf.selCell);
                                    bSelf.selNum = "";
                                    break;
                    case "H":       //ヘルプメニュー
                                    //Win
                                    if(bSelf.OS == "Win"){
                                        if(kd1.ctrlKey){
                                            bSelf.menuClick(bSelf, "help");
                                        }
                                    //Mac
                                    }else if(bSelf.OS == "Mac"){
                                        bSelf.menuClick(bSelf, "help");
                                    }
                                    bSelf.selNum = "";
                                    break;
                    case "W":       //Win
                                    if(bSelf.OS == "Win"){
                                        if(kd1.ctrlKey){
                                            if(this.nameID == "DLG"){
                                                //AEに適用せずに終了するか確認
                                                flag3 = confirm("AE に適用せずに閉じますか？");
                                                if(flag3){
                                                    //環境設定に書き込み
                                                    bSelf.setupVal = true;
                                                    bSelf.savePref(bSelf.moniSize, timesheetDLG.location, bSelf.valLoc, bSelf.valBIG, bSelf.applyVal, bSelf.setupVal);

                                                    timesheetDLG.close();
                                                }
                                            }
                                        }else{
                                            //ウインドウ切り替え
                                            bSelf.TS_reBld(bSelf);
                                        }
                                    //Mac ※AEに[適用せずに終了]は無し
                                    }else if(bSelf.OS == "Mac"){
                                        //ウインドウ切り替え
                                        bSelf.TS_reBld(bSelf);
                                    }
                                    bSelf.selNum = "";
                                    break;
                    case "X":       //REDO
                                    //Win
                                    if(bSelf.OS == "Win"){
                                        if(kd1.ctrlKey){
                                            //do処理
                                            bSelf.doFunc(bSelf,"REDO");
                                        }
                                    //Mac
                                    }else if(bSelf.OS == "Mac"){
                                        //do処理
                                        bSelf.doFunc(bSelf,"REDO");
                                    }
                                    bSelf.selNum = "";
                                    break;
                    case "Z":       //UNDO & REDO
                                    //Win
                                    if(bSelf.OS == "Win"){
                                        if(kd1.ctrlKey && kd1.shiftKey){
                                            //do処理
                                            bSelf.doFunc(bSelf,"REDO");
                                        }else if(kd1.ctrlKey){
                                            //do処理
                                            bSelf.doFunc(bSelf,"UNDO");
                                        }
                                    //Mac
                                    }else if(bSelf.OS == "Mac"){
                                        //do処理
                                        bSelf.doFunc(bSelf,"UNDO");
                                    }
                                    bSelf.selNum = "";
                                    break;
                    default:        //キー入力が数字
                                    if(/[0-9]/.test(Number(kd1.keyName))){
                                        //選択範囲を数字で指定
                                        if(kd1.ctrlKey){
                                            bSelf.selNum = kd1.keyName;
                                            var sNum = parseInt(bSelf.selNum);
                                            if(0 < sNum){
                                                //do処理
                                                bSelf.doFunc(bSelf,"MEMO");
                                                //選択範囲を数字で指定
                                                bSelf.setSelNum(bSelf,bSelf.curCell,sNum);
                                                bSelf.selNum = "";
                                            }else{
                                                bSelf.selNum = "";
                                            }
                                            bSelf.edBtn.text = "";
                                            bSelf.stTxt.text = "";
                                        //デフォルト(数字入力)
                                        }else{
                                            bSelf.clVal = 0;
                                            if(bSelf.plVal || bSelf.miVal){
                                                bSelf.edBtn.text = kd1.keyName;
                                                bSelf.stTxt.text = kd1.keyName;
                                            }else{
                                                if(bSelf.enterVal){
                                                    bSelf.edBtn.text = kd1.keyName;
                                                    bSelf.stTxt.text = kd1.keyName;

                                                    bSelf.enterVal = false;

                                                }else{
                                                    bSelf.edBtn.text = bSelf.edBtn.text + kd1.keyName;
                                                    bSelf.stTxt.text = bSelf.stTxt.text + kd1.keyName;
                                                }
                                            }
                                            bSelf.selNum = "";
                                        }
                                    }
                                    bSelf.plVal = false;
                                    bSelf.miVal = false;
                                    bSelf.logInfo.text = "";
                                    bSelf.UI_fgColor255(bSelf.logInfo, [240,240,240]);
                                    //alert(kd1.keyIdentifier);
                                    break;
                }

                if(! flag3){
                    bSelf.edBtn.active = true;
                }

                //デバック用
                //bSelf.logInfo.text = kd1.keyName;
                //bSelf.UI_fgColor255(bSelf.logInfo, [50,240,120]);
            },

            //scriptUI graphics 用ファンクション****************************************************
            //get backgroundColor255
            getUI_bgColor255: function(uiObj)
            {
                var curColor = uiObj.graphics.backgroundColor.color;
                var bgColor = new Array();
                for(var i=0;i<3;i++){
                    bgColor[i] = Math.round(curColor[i] * 255);
                }

                return bgColor;
            },

            //backgroundColor(0～255)
            UI_bgColor255: function(uiObj, uiColor)
            {
                var gColor = new Array();
                for(var i=0;i<3;i++){
                    gColor[i] = 1/255*Math.round(uiColor[i]);
                    //alert(gColor[i]);
                }
                var gUI = uiObj.graphics;
                var uiBrush = gUI.newBrush(gUI.BrushType.SOLID_COLOR, [gColor[0], gColor[1], gColor[2], 1]);
                gUI.backgroundColor = uiBrush;
            },

            //foregroundColor(0～255)
            UI_fgColor255: function(uiObj, uiColor)
            {
                var gColor = new Array();
                for(var i=0;i<3;i++){
                    gColor[i] = 1/255*Math.round(uiColor[i]);
                    //alert(gColor[i]);
                }
                var gUI = uiObj.graphics;
                var uiPen = gUI.newPen(gUI.PenType.SOLID_COLOR, [gColor[0], gColor[1], gColor[2], 1], 1);
                gUI.foregroundColor = uiPen;
            },

            //font
            UI_font: function(uiObj, uiFont, uiFontStyle, uiFontSize)
            {
                var fontStyle = eval("ScriptUI.FontStyle." + uiFontStyle);
                var gFont = ScriptUI.newFont (uiFont, fontStyle, uiFontSize);
                uiObj.graphics.font = gFont;
            },

            runFunc: function(thisObj)
            {
                    this.osChk();
                    this.moniChk();
                    this.cellChk();
                    if(! this.valE){
                        this.PB_Bld(this);
                    }
            }
        }

        // sub main
        var TS = new runScr(thisObj);

        //アプリのバージョン確認 (CS6 over)
        if (parseFloat(app.version) < 11)
        {
            alert(TS.strErr);
            return;
        }else{
            TS.runFunc(thisObj);
        }
    }
})();