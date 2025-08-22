/**
 *    @fileoverview lib_TDTS
 *        tdts(ToeianimationDigitalTimeSheet) format 及び　xdts(eXchangeDigitalTimeSheet)に関する
 *        機能ライブラリ
 *
 *        XDTSフォーマットはTDTSフォーマットのサブセットであり、現在XDTSを扱うメインのアプリケーションである
 *        CLIP STUDIO PAINTがXDTSの範囲を超えたデータを受け取っても問題なく動作するためXDTSとTDTSの扱いの差異は
 *        ヘッダ文字列のみで処理される
 ＊＊　暫定版コンバータ　手書きメモ等画像オブジェクトは現在両方向にコンバート不可
 *	2020.10拡張 tdts ver.7に暫定対応 xdtsは、ver.5で内容変わらず
 * 
 *   TDTS ver.7では複数(兼用)のタイムシートを持つためにtimeSheets構造が新規に導入されている
 *   配列構造で内部要素は、ver.5の構造を、versionプロパティ以外そのままキープしているように見える 
 * 	V5
 * 	{header:{},timeTables:[{},...],version:5}
 * 	V7
 * 	{timeSheets:[{header:{},timeTables:[{},...]},...],version:7}
 * 
 *	動画欄がfield4で場合により有効
 *
 *	2022更新 tdts ver.10に対応
 *	動画欄を拡張したtdtsに本格対応
 *	原画のみの(field4にデータが存在しない）場合は、従来の対応でActionフィールドの内容を読み出す
 *	両方にデーがある場合は、原画と動画の２本のxpstを取得してアプリ側で参照を組み立てる
 *	tdts出力時は、リファレンスxpstを原画欄に合成して出力する
 *	xdts出力時は、従来型の出力を行う
 */
'use strict';
/*=======================================*/
if((typeof window == 'undefined')&&(typeof app == 'undefined')){
    var nas = require('./xpsio');
};
/*
タイムシートドキュメントオブジェクト
	tdts(ToeianimationDigitalTimeSheet) format 及び　xdts(eXchangeDigitalTimeSheet)兼用
将来仕様が分かれた場合は、独立にXDTSを書き起こすこと
V5
Object Tdts{
	header     :Object DocumentHeader,
	timeTables :[Array of Object TimeTable],
	version    :{Number 5}
}
V7
Object Tdts{
	timeSheets:[
		header     :Object DocumentHeader,
		timeTables :[Array of Object TimeTable]
	],
	version    :{Number 7} 
}
*/
var TDTS = {};//ClassObject

function Tdts(){
	this.header = new TDTS.DocumentHeader()
	this.timeTables = [];//[Array of TimeTable]
	this.version = 5 ;
}
/*
function Tdts(){
	this.timeSheets =[];[Array of TimesheetDocument]
	this.version = 7 ;
}
*/
/*
	タイムシートドキュメントオブジェクト
	絵コンテの１カットに相当する情報単位
	ヘッダー、伝票類をこのユニットで持つ
*/
	TDTS.TimesheetDomument = function(){
		this.header = new TDTS.DocumentHeader()
		this.timeTables = [];//[Array of TimeTable]
	}
/*
ドキュメントヘッダ
	ドキュメントプロパティトレーラー

Object DocumentHeader{
	colors    		:[Array of 8bit3ch-colorValueArray x 3],
	cut       		:"cutIdfString",
	direction 		:"String",
	eipsode   		:"episodeString",
	scene     		:"sceneIdfString",
	showHeaderDummy :boolean　(ver 1.9で確認 アプリケーションのプロパティからドキュメントのプロパティへ移行したと思われる)
	workSlips		:{Object WorkSlips}(ver 1.9で確認　内容は不明　非コンバート対象)
}
*/
	TDTS.DocumentHeader = function(){
		this.colors    =[[255,255,255],[255,255,255],[255,255,255]];
		this.cut       ;
		this.direction ;
		this.eipsode   ;
		this.scene     ;
		this.showHeaderDummy ;
		this.workSlips ;
	};
/*
作業伝票コレクションオブジェクト
	作業伝票の構造が…固定フォーマットすぎるかも
	ひとまずオブジェクトは作成するが　対応は保留　xMap実装後に対応検討 2019 05.17
*/
	TDTS.WorkSlips = function (){
		this.memo 		;//{String}
		this.processes	;//{Array of TDTS.Process}
		this.works    	;//{Array of TDTS.Work}
	}
	TDTS.SlipProcess = function (){
		this.assistant	;//{String}
		this.chief		;//{String}
		this.director	;//{String}
		this.free		;//{String}
		this.freeRole	;//{String}
	}
	TDTS.SlipWork = function (){
		this.ebable		;//{boolean}
		this.tracks		;//{Array of TDTS.SlipTrack}
	}
	TDTS.SlipTrack = function(){
		this.artist			;//{String}
		this.numberOfSheets	;//{number}
	}
/*
タイムテーブルオブジェクト
	テーブルはタイムシート１セットに相当する単位
	ドキュメント内に複数のタイムシートセットが許容される
	xdts出力時は、タイムテーブルIDを指定する必要がある
	
Object TimeTabele{
	books               :[Array of Object TimeTableField],
	color               :Number colorID,
	duration            :Number,
	headerMemoImageData :"String encoded Image", // 存在しない場合はプロパティごと無い
	fields              :[Array of Object TimeTableField],
	name                :"String teimeTabele name",
	opratorName         :"String operator name",
	timeTableHeaders    :[Array of Object TimeTableHeader],
	whiteBoardImageData :"String encoded Image", // 存在しない場合はプロパティごと無い
}
*/
	TDTS.TimeTable = function (){
		this.books               ;//[Array of Object TimeTableField],
		this.color               ;//Number colorID,
		this.duration            ;//Number,
		this.headerMemoImageData ;//"String encoded Image", // 存在しない場合はプロパティごと無い
		this.fields              ;//[Array of Object TimeTableField],
		this.name                ;//"String teimeTabele name",
		this.opratorName         ;//"String operator name",
		this.timeTableHeaders    ;//[Array of Object TimeTableHeader],
		this.whiteBoardImageData ;//"String encoded Image", // 存在しない場合はプロパティごと無い
		
	}
/*
タイムテーブルフィールド
	フィールドは、トラック種別ごとの集合
	画面上の配置は固定で左から順に 0,3,5
	
	fieldID
0:	replacement(CELL)
1:	<unknown>
2:	<unknown>
3:	sound(dialogue)
4:	<unknown>
5:	camarawork(effect and others)



Object TimeTableField{
	fieldId     :Number fieldID,
	tracks      :[Array of TimelineTrack]
}
*/
	TDTS.TimeTableField = function(fieldId){
		this.fieldId = fieldId ;//Number fieldID,
		this.tracks	 = []      ;//[Array of Object TimeTableTrack]
	}

/*
Object TimeTableTrack{
	frames	:[Array of Object framaData]
	trackNo	:Number trackID
}
*/
	TDTS.TimeTableTrack = function(trackNo){
		this.frames = []  		;//[Array of Object FramaEntry]
		this.trackNo = trackNo	;//Number trackID,
	}
/*
トラックエントリオブジェクト
	データ（プロパティ）を保持して
	エントリポイントのフレームを与えるレイヤ
	
Object TimeTableFrameEntry{
	data	:[Array of Object FramaData]
	frame	:Number of frame
}
*/
	TDTS.TimeTableFrameEntry = function(frame){
		this.data 				;//[Array of Object FramaData]
		this.texts              ;//[Array of "String bookName"],
		this.frame = frame	    ;//Number of frame
	}
/*
トラックデータオブジェクト
	attention　 注意喚起フラグ　falseの際はエントリの出力不要　true にするとコマの背景色が注意喚起色でハイライトされる
	cellReplace 「セル置き換え」フラグ falseの際はエントリの出力不要 true　にすると指定フレーム終端で当該トラックの上から下への置き換え指示線が表示される。トラック内で１回のみ記述が許されている…らしい
	memoは手書きメモがアタッチされている場合のみ存在するプロパティ
	values　は配列だが　通常は要素一つのみでトラックに記載されている値テキストまたはプリセット文字列（列挙子？）

Object TimeTableFrameData{
	id			:Number 
	attention	:boolean
	cellReplace	:boolean
	memo		:Object FrameMemo
	values		:[Array of Text frameValue]
}
*/
	TDTS.TimeTableFrameData = function(valueString){
		this.id				= 0				;//Number of DataID 0 fix 
		this.attention						;//boolean
		this.cellReplace					;//boolean
		this.memo							;//Object FrameMemo
		this.values =(typeof valueString == 'undefined')?[]:[valueString];//[Array of Text frameValue]
	}

/*
Object TimeTableFrameMemo{
	"color"		:Number colorID 
	"imageData"	: String of BASE64 encoded PNG image
	"offsetX"	: Number memoImage offsetX
	"offsetY"	: Number memoImege offsetY
                      }
*/
	TDTS.TimeTableFrameMemo = function(col,imgSrring,offsetArray){
		this.color = col				;//Number colorID 
		this.imageData = imgSrring		;//String of BASE64 encoded PNG image
		this.offsetX = offsetArray[0]	;//Number memoImage offsetX
		this.offsetY = offsetArray[1]	;//Number memoImege offsetY
	}

/*
タイムテーブルヘッダ
	フィールドラベルを保持するオブジェクト
Object TimeTableHeader{
	fieldId     :Number fieldID,
	names	:[Array of String field name]
}
*/
	TDTS.TimeTableHeader = function(fieldId){
		this.fieldId = fieldId ;//Number fieldID,
		this.names	 = []      ;//[Array of String field name]
	}
/*
タイムライントラックは二種作るべきかもしれない
	frames	トラックエントリの配列。通常のトラックが持つデータトレーラ
	texts	トラックの持つ値（文字列）BOOKトラックが持つ
	trackNo	フィールド内でのトラックID BOOKトラックの場合は親トラックを示す

Object TimelineTrack{
	frames        :[Array of TrackEntry],
	texts         :[Array of "String bookName"],
	trackNo       :Number trackID
}
*/
	TDTS.TimelineTrack = function(trackNo){
		this.frames            ;//[Array of TrackEntry],
		this.texts             ;//[Array of "String bookName"],
		this.trackNo = trackNo ;//Number trackID
	}


/*
トラックデータにアタッチするイメージデータオブジェクト
	color     シートセルの背景色で、セルに登録された画像メモが存在することを示している。　attentionカラーと混色	
	imageDate base64エンコーディングされたPNG
	offsetX,Y 画像のオフセット

Object MemoImage{
	color      : Number backgroundColorID,
	imageData  : "String encoded Image",
	offsetX    : Number image Offset X,
	offsetY    : Number image Offset Y
}
*/
	TDTS.MemoImage = function(){
		this.color      ;// Number backgroundColorID,
		this.imageData  ;// "String encoded Image",
		this.offsetX    ;// Number image Offset X,
		this.offsetY    ;// Number image Offset Y
	}

/*
	dataSYMBOLDB
	
*/
	TDTS.dataSymbol={
		"SYMBOL_TICK_1":"○",
		"SYMBOL_TICK_2":"●",
		"SYMBOL_NULL_CELL":"×",
		"SYMBOL_HYPHEN":"|"
	};

/*
CAMERAWORK_ITME={"29":"BL K",
"47":"BOKEH L",
"46":"BOKEH M",
"45":"BOKEH S",
"69":"Bar",
"65":"Blur1",
"66":"Blur2",
"67":"Blur3",
"7":"CAM SHAKE L",
"6":"CAM SHAKE M",
"5":"CAM SHAKE S",
"18":"CD",
"17":"CU",
"64":"CutIN",
"39":"DF1",
"40":"DF2",
"41":"DF3",
"19":"DOLLY",
"0":"FI",
"48":"FIX",
"1":"FO",
"16":"FOLLOW",
"21":"Fairing",
"55":"Focus IN",
"56":"Focus Out",
"42":"Fog1",
"43":"Fog2",
"44":"Fog3",
"51":"FollowPan",
"33":"HI CON",
"28":"Handy L",
"27":"Handy M",
"26":"Handy S",
"63":"Insert",
"61":"IrisIN",
"62":"IrisOut",
"38":"JumpSL",
"20":"MULTI",
"4":"OL",
"35":"OverEX",
"12":"PAN",
"14":"PAN DOWN",
"50":"PAN TB",
"49":"PAN TU",
"13":"PAN UP",
"37":"ParsSL",
"54":"Q TB",
"53":"Q TU",
"34":"Rack Focus",
"52":"Rolling",
"25":"Rotate TB",
"24":"Rotate TU",
"22":"SL",
"31":"SUBLINA",
"70":"Strobo1",
"71":"Strobo2",
"9":"TB",
"32":"TFlash",
"15":"TILT",
"8":"TU",
"36":"UnderEX",
"30":"W K",
"2":"WI",
"3":"WO",
"59":"WaveGlass L",
"58":"WaveGlass M",
"57":"WaveGlass S",
"60":"Wipe",
"68":"WipeIN",
"10":"ZI",
"11":"ZO"};



 var CAMERAWORK_ITEMS=["FI",
"FO",
"WI",
"WO",
"OL",
"CAM SHAKE S",
"CAM SHAKE M",
"CAM SHAKE L",
"TU",
"TB",
"ZI",
"ZO",
"PAN",
"PAN UP",
"PAN DOWN",
"TILT",
"FOLLOW",
"CU",
"CD",
"DOLLY",
"MULTI",
"Fairing",
"SL",
"Rotate TU",
"Rotate TB",
"Handy S",
"Handy M",
"Handy L",
"BL K",
"W K",
"SUBLINA",
"TFlash",
"HI CON",
"Rack Focus",
"OverEX",
"UnderEX",
"ParsSL",
"JumpSL",
"DF1",
"DF2",
"DF3",
"Fog1",
"Fog2",
"Fog3",
"BOKEH S",
"BOKEH M",
"BOKEH L",
"FIX",
"PAN TU",
"PAN TB",
"FollowPan",
"Rolling",
"Q TU",
"Q TB",
"Focus IN",
"Focus Out",
"WaveGlass S",
"WaveGlass M",
"WaveGlass L",
"Wipe",
"IrisIN",
"IrisOut",
"Insert",
"CutIN",
"Blur1",
"Blur2",
"Blur3",
"WipeIN",
"Bar",
"Strobo1",
"Strobo2"
,"",""]

0:TDTS/XDTS アイテム文字列
1:トラック種別　c: camerawork, e:effect, g:geometry
2:UAT置き換え対照配列　[区間文字列,開始ノード,終端ノード]
3:UAT対応アイテムID
*/
TDTS.SectionItemTable = {
 0: ["FI","c",["|","▲"],"fadeIn"],
 1: ["FO","c",["|","▼"],"fadeOut"],
 2: ["WI","c",["|","△"],"whiteIn"],
 3: ["WO","c",["|","▽"],"whiteOut"],
 4: ["OL","c",["|","]OL["],"overlap"],
 5: ["CAM SHAKE S","c",["/"],"cameraShakeS"],
 6: ["CAM SHAKE M","c",["//"],"cameraShake"],
 7: ["CAM SHAKE L","c",["///"],"cameraShakeL"],
 8: ["TU","c",["|","▽","△"],"trackUp"],
 9: ["TB","c",["|","▽","△"],"trackBack"],
 10: ["ZI","c",["|","▽","△"],"zoomIn"],
 11: ["ZO","c",["|","▽","△"],"zoomOut"],
 12: ["PAN","c",["|","▽","△"],"pan"],
 13: ["PAN UP","c",["|","▽","△"],"panUp"],
 14: ["PAN DOWN","c",["|","▽","△"],"panDown"],
 15: ["TILT","c",["|","▽","△"],"tilt"],
 16: ["FOLLOW","c",["┃","┳","┻"],"followSlide"],
 17: ["CU","c",["┃","┳","┻"],"craneUp"],
 18: ["CD","c",["｜","┬","┴"],"caraneDown"],
 19: ["DOLLY","c",["｜","┬","┴"],"dolly"],
 20: ["MULTI","c",["｜","┬","┴"],"multi"],
 21: ["Fairing","c",["｜","⇑","⇓"],"fairing"],
 22: ["SL","c",["|","▽","△"],"slide"],
 23: ["Strobo","c",["|","]STROBO["],"strobo"],
 24: ["Rotate TU","c",["|","▽","△"],"rotateTU"],
 25: ["Rotate TB","c",["|","▽","△"],"rotateTB"],
 26: ["Handy S","c",[":"],"handShakeS"],
 27: ["Handy M","c",["::"],"handShake"],
 28: ["Handy L","c",[":::"],"handShakeL"],
 29: ["BL K","c",["■"],"kurokoma"],
 30: ["W K","c",["□"],"shirokoma"],
 31: ["SUBLINA","c",["＜SUBLINA"],"sublina"],
 32: ["TFlash","c",["|","┬","┴"],"backlight"],
 33: ["HI CON","c",["|","┬","┴"],"highContrast"],
 34: ["Rack Focus","c",["|","┬","┴"],"rackFocus"],
 35: ["OverEX","c",["｜","┬","┴"],"overExposure"],
 36: ["UnderEX","c",["｜","┬","┴"],"underExposure"],
 37: ["ParsSL","c",["┃","┳","┻"],"perspectiveTransform"],
 38: ["JumpSL","c",["｜","┬","┴"],"jumpSlide"],
 39: ["DF1","c",["｜","┬","┴"],"diffusionFilter"],
 40: ["DF2","c",["｜","┬","┴"],"diffusionFilter"],
 41: ["DF3","c",["｜","┬","┴"],"diffusionFilter"],
 42: ["Fog1","c",["｜","┬","┴"],"foggyFilter"],
 43: ["Fog2","c",["｜","┬","┴"],"foggyFilter"],
 44: ["Fog3","c",["｜","┬","┴"],"foggyFilter"],
 45: ["BOKEH S","c",["｜","┬","┴"],"bokeh"],
 46: ["BOKEH M","c",["｜","┬","┴"],"bokeh"],
 47: ["BOKEH L","c",["｜","┬","┴"],"bokeh"],
 48: ["FIX","c",["｜","┬","┴"],"fix"],
 49: ["PAN TU","c",["|","▽","△"],"panTU"],
 50: ["PAN TB","c",["|","▽","△"],"panTB"],
 51: ["FollowPan","c",["|","▽","△"],"followTracking"],
 52: ["Rolling","c",["｜","┬","┴"],"rolling"],
 53: ["Q TU","c",["|","▽","△"],"quickTU"],
 54: ["Q TB","c",["|","▽","△"],"quickTB"],
 55: ["Focus IN","c",["|","▲"],"focusIn"],
 56: ["Focus Out","c",["|","▼"],"focusOut"],
 57: ["WaveGlass S","c",["!"],"waveGlassS"],
 58: ["WaveGlass M","c",["!!"],"waveGlass"],
 59: ["WaveGlass L","c",["!!!"],"waveGlassL"],
 60: ["Wipe","c",["|","]WIPE["],"wipe"],
 61: ["IrisIN","c",["|","]○["],"irisIn"],
 62: ["IrisOut","c",["|","]●["],"irisOut"],
 63: ["Insert","c",["＜INSERT"],"insert"],
 64: ["CutIN","c",["＜CUTIN"],"cutIn"],
 65: ["Blur1","c",["┃","┳","┻"],"blur"],
 66: ["Blur2","c",["┃","┳","┻"],"blur"],
 67: ["Blur3","c",["┃","┳","┻"],"blur"],
 68: ["WipeIN","c",["|","]▲["],"wipeIn"],
 69: ["Bar","c",["‖"],"bar"],
 70: ["Strobo1","c",["|","▼▲"],"strobo1"],
 71: ["Strobo2","c",["|","▲▼"],"strobo2"]
 };
 TDTS.SectionItemTable.length = 72;
 TDTS.SectionItemTable.indexOf = function(item){
 	for (var ix = 0;ix < this.length; ix ++){
 		if(this[ix][0] == item) return ix;
 		if(this[ix][3] == item) return ix;
 	}
 	return -1;
 }

/**
簡易コンバータ
	@params	{Object TDTD|String}	myTDTS
		引数はTDTS/XTDSオブジェクトまたは、データストリーム
	@params	{number}	sheetID
		ソース変換するシートID　未指定の場合は最後のタイムシート
	@params	{number}	fieldTarget
		ソース変換するシートのフィールドID 0:原画 4:動画 未指定の場合は 0 それ以外は 4
		tdtsでのみ有効
	@params	{number}	targetTimesheet
		ソース変換する兼用カットのID 未指定時は０(最初のカット)
		tdtsでのみ有効
	@returns	{String}
		XPS互換ソース文字列を返す
 */
function TDTS2XPS(myTDTS,sheetID,fieldTarget,targetTimesheet) {
	var dataForm = 'XDTS';
	var cloped = false;//暫定変数　変換時のデータ切り捨てフラグ
    /**
     * 引数の第一行目を確認してJSON部分を分離
     */
    if ((typeof myTDTS == 'string')&&(myTDTS.match(/^((toei|exchange)DigitalTimeSheet Save Data\n)/))){
    	myTDTS=myTDTS.slice((RegExp.$1).length);
    	dataForm = (RegExp.$2 == 'toei')? 'TDTS':'XDTS';
        /**
         * JSONオブジェクトあればトライ　失敗したらEvalで更にトライ
         */
console.log(myTDTS);
        if (JSON) {
            try {
                myTDTS = JSON.parse(myTDTS);
            } catch (err) {
                myTDTS = false;
            }
        }
        if (!myTDTS) {
            try {
                myTDTS = eval(myTDTS);
            } catch (err) {
                myTDTS = false;
            }
        }
    }
console.log(myTDTS);

    if (!(
            (myTDTS instanceof Object)&&
            (
                (myTDTS.timeTables)&&(myTDTS.version==5)
            )||(
                (myTDTS.timeSheets)&&(myTDTS.version==7)
            )||(
                (myTDTS.timeSheets)&&(myTDTS.version==10)
            )
        )){
        myTDTS=false;
    }
    if (!myTDTS) return myTDTS;

console.log(myTDTS);
//ver.7読み出しに暫定対応 ver.7&&未指定の場合最初のシートを対象にする
	var timesheetDocument = myTDTS;
	if((myTDTS.timeSheets)&&(myTDTS.version >= 7)){
		if(myTDTS.timeSheets[targetTimesheet]){
			timesheetDocument = myTDTS.timeSheets[targetTimesheet];
		}else{
			timesheetDocument = myTDTS.timeSheets[0];
		}
	}
//　変換対象のタイムシートを決定　指定があれば設定　dataForm == XDTSの場合、または指定のない場合は最後のタイムシート
//　XDTSの場合は一つしかシートがないので常に0番
	if ((typeof sheetID == 'undefined')||(dataForm == 'XDTS')) sheetID = timesheetDocument.timeTables.length - 1;
	if (sheetID >= timesheetDocument.timeTables.length) sheetID = timesheetDocument.timeTables.length - 1;//トレーラー内のシート数を超過していたら最後のシートに
//読み出しターゲットを設定　原画|動画
	if((fieldTarget)&&(dataForm == 'TDTS')){
		fieldTarget = 4;
	}else{
		fieldTarget = 0;
	}
// タイムテーブルの継続時間　tdtsはトランジションの概念を内包しないのでそのままTIMEに割り付ける
    var myFrames = timesheetDocument.timeTables[sheetID].duration;    
// タイムライントラックの必要数を算出
	var soundTracks       = [];
	var replacementTracks = [];
	var cameraworkTracks  = [];
	var stillTracks = [];
	if (timesheetDocument.timeTables[sheetID].books){
		stillTracks = timesheetDocument.timeTables[sheetID].books[0].tracks;

/*	コンバート対象のシートからプロパティを転記
	timeTable.name タイムシート名　該当するプロパティなし　強いてあげるならステージ・ジョブ識別子に相当
	opratorName	 > upadeUser
*/
	};	
//通常トラックラベルをヘッダーから収集する
	if (timesheetDocument.timeTables[sheetID].timeTableHeaders){
		for (var hx = 0 ; hx < timesheetDocument.timeTables[sheetID].timeTableHeaders.length ; hx++ ){
			switch (timesheetDocument.timeTables[sheetID].timeTableHeaders[hx].fieldId){
			case 0:	;
//かならず一旦は原画のトラック名を取得する
				replacementTracks = timesheetDocument.timeTables[sheetID].timeTableHeaders[hx].names.slice();
			break;
			case 1: ;
			case 2:	;
			break;
			case 3:	;
				soundTracks = timesheetDocument.timeTables[sheetID].timeTableHeaders[hx].names.slice();
			break;
			case 4:	;
				if((fieldTarget)&&(yTDTS.timeTables[sheetID].timeTableHeaders[hx].names.length)){
//ターゲットが動画でかつトラックが存在すれば上書き
					replacementTracks = timesheetDocument.timeTables[sheetID].timeTableHeaders[hx].names.slice();
				}
			break;
			case 5:	;
				cameraworkTracks = timesheetDocument.timeTables[sheetID].timeTableHeaders[hx].names.slice();
			break;
			}
		}
	};
console.log( soundTracks);
console.log( replacementTracks);
console.log( cameraworkTracks);

console.log( stillTracks);
console.log([["dialog",soundTracks.length],["timing",replacementTracks.length],["camera",cameraworkTracks.length]])
    var myXps = new nas.Xps(
    	[["dialog",soundTracks.length],["timing",replacementTracks.length],["camera",cameraworkTracks.length]],
    	parseInt(myFrames),
    	24
    );
//new nas.Xps([['sound',4],['timing',4],['camera',4]],120,30);
console.log(myXps);
//ドキュメント情報転記
	if(timesheetDocument.header){
    	if (timesheetDocument.header.cut)      { myXps.cut   = timesheetDocument.header.cut     };
    	if (timesheetDocument.header.scene)    { myXps.scene = timesheetDocument.header.scene   };
    	if (timesheetDocument.header.episode)  { myXps.opus  = timesheetDocument.header.episode };
    	if (timesheetDocument.header.direction){ myXps.xpsTracks.noteText = timesheetDocument.header.direction };
	};

//ラベルを初期化すると同時にトラックの内容を転記？
/*
	シートの初期化時点ではBG,BOOK類の挿入を行わず、ラベル初期化の際に該当位置へ挿入を行う
*/
	var insertStill = true;
	var trackOffset = (soundTracks.length)? 0:1;
//ダイアログラベル転記
//xdtsでサウンドトラックがない場合は、バルクのトラックを一つ追加する
	if(soundTracks.length == 0){
		myXps.xpsTracks[0].id = 'N.';
	}else{
		for (var ix = 0 ; ix < soundTracks.length ;ix ++){
			myXps.xpsTracks[ix].id = soundTracks[ix];
		}
	}
	trackOffset += soundTracks.length;
//タイミングラベル転記
	for (var ix = 0 ; ix < replacementTracks.length ;ix ++){
console.log(trackOffset+ix);
		myXps.xpsTracks[trackOffset+ix].id = replacementTracks[ix];
	}
	trackOffset += replacementTracks.length;
//カメラワークラベル転記
	for (var ix = 0 ; ix < cameraworkTracks.length ;ix ++){
		myXps.xpsTracks[trackOffset+ix].id = cameraworkTracks[ix];
	}
//	trackOffset = soundTracks.length+replacementTracks.length;


/* フィールドスキャン
トラックから記述(入力ストリーム)を組み立て putメソッドで流し込む
フィールド種別ごとに別処理
*/
	if (timesheetDocument.timeTables[sheetID].fields){
		for (var fx = 0 ; fx < timesheetDocument.timeTables[sheetID].fields.length ; fx++ ){
			if((fieldTarget)&&(fx == 0)) continue;
//ターゲットが動画の場合フィールドIDをスキップ
			var fieldKind = timesheetDocument.timeTables[sheetID].fields[fx].fieldId;//フィールドID取得
			var trackOption = (["timing",'','','sound','timing','camerawork'])[fieldKind];//相当するxpsTrackOptionに割当
			for (var tx = 0 ; tx< timesheetDocument.timeTables[sheetID].fields[fx].tracks.length ; tx++){
				var trackId = tx;
				if(soundTracks.length == 0) trackId ++;//
				if (fieldKind == 0){
					trackId += soundTracks.length;
				} else if (fieldKind == 5){
					trackId += soundTracks.length + replacementTracks.length;
				}
//フィールドID3,5のトラックはセクション長を取得して、次セクションの冒頭及びトラックの終端で解決する
				var inputStream   = "";//入力はコンマ区切りストリーム
				var sectionStart  = 0 ;
				var sectionLength = 0 ;
				for (var ex = 0 ; ex< timesheetDocument.timeTables[sheetID].fields[fx].tracks[tx].frames.length ; ex++){
					var myEntry = timesheetDocument.timeTables[sheetID].fields[fx].tracks[tx].frames[ex];
// myEntry.frameプロパティが負数、またはdurationを超過した場合はクロップが発生する
					if((! cloped)&&((myEntry.frame < 0)||(myEntry.frame >= myFrames))) cloped = true;
					var targetFrame = myEntry.frame ;
					if(myEntry.data[0].memo){
						console.log('detect memo image');
						console.log(myEntry.data[0].memo);
					}
					if(myEntry.data[0].attention){
						console.log('detect attention property');
						console.log(myEntry.data);
					}
					if(! myEntry.data[0].values) continue;
					var inputValue = myEntry.data[0].values[0];
					if ((fieldKind == 0)||(fieldKind == 4)){
//replacement
console.log(myEntry.data[0].values[0])
						if(myEntry.data[0].values[0].match(/^SYMBOL_/)){
							inputValue = TDTS.dataSymbol[myEntry.data[0].values[0]]
						}
console.log({'setAddress':[trackId,targetFrame],'inputValue':inputValue});
						myXps.put([trackId,targetFrame],inputValue);
						continue;
//置換えトラック
					} else if (fieldKind == 3){
//sound
						if(myEntry.data[0].values[0].match(/^SYMBOL_HYPHEN$/)){
							sectionLength ++;
							continue;
						}else{
//継続サイン以外（サウンドデータ）がある
							if((inputStream)&&(sectionLength)){
//未解決のデータが存在すれば解決してプロパティをリセットする
								var headMargin =((inputStream.name)? 1 : 0) + inputStream.attributes.length + 1;
								myXps.put([trackId,sectionStart-headMargin],inputStream.getStream(sectionLength));
//								myXps.put([trackId,sectionStart],inputStream.toString(sectionLength));
								sectionLength = 0;
							}else{
								console.log([inputStream,sectionLength]);
							}
//遅延解決して次のセクションの値をオブジェクトでセット（ビルドは遅延解決）
							sectionStart  = targetFrame;
							sectionLength = 1;
							inputStream = new nas.AnimationDialog();
							var dialogString = (myEntry.data[0].values[1].match(/.*「[^」]*」/)) ?
								myEntry.data[0].values.join(''):
								([myEntry.data[0].values[0],"「",myEntry.data[0].values[1],"」"]).join('');
console.log(dialogString);
							inputStream.parseContent(dialogString);
							continue;
						}
//サウンドトラック処理
					} else if (fieldKind == 5){
//camerawork
						if(myEntry.data[0].values[0].match(/^SYMBOL_HYPHEN$/)){
//継続サイン検出
							sectionLength ++;
							continue;
						}
//継続サインでない場合はカメラワーク指定
							var itmid = TDTS.SectionItemTable.indexOf(inputStream);
//事前処理中のアイテムが合えば遅延解決してセクション長をクリア
							if (inputStream){
								if(inputStream.match(/^\d+$/)) itmid = inputStream ;
							if(itmid >= 0){
								var currentWork = TDTS.SectionItemTable[itmid];
							}else {
								var currentWork = [inputStream,"c",["┃","┳","┻"]];//カメラワークに限定
							}
								var sectionStream=[];
								var sectionSign = (currentWork[2].length > 2)?currentWork[2][1]:inputStream;
								//if(sectionSign.indexOf('*')>=0)	sectionSign = sectionSign.replace(/\*/,currentWork[0]);
								for (var ct = 0 ; ct < sectionLength ; ct ++){
									if((currentWork[2].length > 1)&&(ct == 0)){
										sectionStream.push(currentWork[2][1]);
									}else if(ct == (sectionLength-1)){
										sectionStream.push(currentWork[2][currentWork[2].length-1]);
									}else{
										sectionStream.push(currentWork[2][0]);
									}
								}
								if(currentWork[2].length > 1) sectionStream.splice((Math.floor((sectionStream.length-1)/2)),1,"<"+currentWork[0]+">");
//							if((currentWork[1]=='e')) {myXps.xpsTracks[trackId].option = 'effect';}	
//							if((currentWork[1]=='g')) {myXps.xpsTracks[trackId].option = 'geometry';}	
								myXps.put([trackId,sectionStart],sectionStream.join(','));
								inputStream = '';
							}
//遅延解決して次のセクションの値を設定（未オブジェクト化）
							sectionStart  = targetFrame;
							sectionLength = 1;
							inputStream = myEntry.data[0].values[0];
							if(targetFrame == 0){
								if(inputStream.match(/^\d+$/)){
									if((TDTS.SectionItemTable[inputStream])&&(TDTS.SectionItemTable[inputStream][1]=='e')) myXps.xpsTracks[trackId].option = 'composite';
									if((TDTS.SectionItemTable[inputStream])&&(TDTS.SectionItemTable[inputStream][1]=='g')) myXps.xpsTracks[trackId].option = 'geomtry';
								}else{
									var itmId = TDTS.SectionItemTable.indexOf(inputStream);
									if ((itmid >= 0)&&(TDTS.SectionItemTable[itmid][1]=='e')) myXps.xpsTracks[trackId].option = 'effect';
									if ((itmid >= 0)&&(TDTS.SectionItemTable[itmid][1]=='g')) myXps.xpsTracks[trackId].option = 'geometry';
								}
								// if(inputStream.match())ここで文字列の場合の判定を入れる
							}
							continue;
//カメラワークトラック処理
					}
				}
//トラック毎の終了処理
				if(fieldKind == 5){
//カメラワーク
					if (inputStream){
						var currentWork = TDTS.SectionItemTable[inputStream];
						if(! currentWork){
							var itmId=TDTS.SectionItemTable.indexOf(inputStream);
							currentWork = ( itmId >= 0 )? TDTS.SectionItemTable[itmId]:[inputStream,"e",["┃","┳","┻"]];
//							currentWork = ( itmId >= 0 )? TDTS.SectionItemTable[itmId]:[inputStream,"e",["┃","<"+inputStream+">","┻"]];
						}
						var sectionStream=[];
						var sectionSign = (currentWork[2].length > 2)?currentWork[2][1]:inputStream;
						//if(sectionSign.indexOf('*')>=0)	sectionSign = sectionSign.replace(/\*/,currentWork[0]);
						for (var ct = 0 ; ct < sectionLength ; ct ++){
									if((currentWork[2].length > 1)&&(ct == 0)){
										sectionStream.push(currentWork[2][1]);
									}else if(ct == (sectionLength-1)){
										sectionStream.push(currentWork[2][currentWork[2].length-1]);
									}else{
										sectionStream.push(currentWork[2][0]);
									}
						}
						if(currentWork[2].length > 1) sectionStream.splice((Math.floor((sectionStream.length-1)/2)),1,"<"+currentWork[0]+">");
//console.log({ID:[trackId,sectionStart],data:sectionStream.join(',')});
						myXps.put([trackId,sectionStart],sectionStream.join(','));
						inputStream = '';
					}
				}else if(fieldKind == 3){
//サウンド
					if(inputStream){
						var headMargin =((inputStream.name)? 1 : 0) + inputStream.attributes.length + 1;
						myXps.put([trackId,sectionStart-headMargin],inputStream.getStream(sectionLength));
					}
				}
			}
		};//トラック終端処理
	};//トラックループ

//フラグが立っている場合はIDを確認して後方から静止画トラックの挿入
	if(insertStill){
		for (var ix = stillTracks.length -1 ; ix >= 0 ; ix --){
			var insertPoint = stillTracks[ix].trackNo + soundTracks.length;
			var insertTracks = [];
			for (var tx = stillTracks[ix].texts.length -1  ; tx >= 0 ; tx -- ){
				insertTracks.push(
					new nas.Xps.XpsTimelineTrack(
						stillTracks[ix].texts[tx],
						"still",
						myXps.xpsTracks,
						parseInt(myFrames)
					)
				)
			}
			myXps.xpsTracks.insertTrack(insertPoint,insertTracks);
		}
	}
//データクロップが発生した場合はクロップ済みであることをノートテキストに追加する

	if(cloped) myXps.xpsTracks.noteText += '\n'+(
		(typeof localize == 'undefined')?
			'**(Some information was truncated when converting data from TDTS|XDTS. Please check the content.)':localize({
				en:'**(Some information was truncated when converting data from TDTS|XDTS. Please check the content.)',
				ja:'**(TDTS|XDTSからのデータ変換の際に、一部の情報を切り捨てました。内容を確認してください)'
		})
	);
	return myXps.toString();
}
/**
TDTS/XDTSデータを引数にしてTdtsオブジェクトを返す
引数が空の場合は、東映タイムシートツールと同仕様のxdtsブランクドキュメント(ver.5)を返す
*/
TDTS.parseTdts = function(dataStream){
	if((typeof dataStream != 'undefined') || (String(dataStream).match(/^((toei|exchange)DigitalTimeSheet Save Data\n)/))){
		return JSON.parse(dataStream.slice((RegExp.$1).length));
	} else {
		return JSON.parse('{"header":{"colors":[[255,255,255],[255,255,255],[255,255,255]],"direction":"","episode":"","scene":"","cut":""},"timeTables":[{"color":0,"duration":144,"name":"sheet1","operatorName":"","timeTableHeaders":[{"fieldId":0,"names":["A","B","C","D","E","F","G"]},{"fieldId":1,"names":[""]},{"fieldId":2,"names":[""]},{"fieldId":3,"names":["S1","S2"]},{"fieldId":4,"names":[]},{"fieldId":5,"names":["1","2"]}]}],"version":5}');
	}
}

/**
	@params {Object Xps}  myXps
	@params {String}      targetFormat
	@params {Object TDTS} career
XPSオブジェクトを引数にしてXDTS/TDTSフォーマットで出力
暫定的にXDTSと互換のある　1ドキュメント/1タイムシートの形式でコンバート
オプション指定で xdts/tdts を切り替え
デフォルトは xdts
拡張時マルチドキュメントに対応

引数:
	myXps			Object nas.Xps
	targetFormat 	String tdts/xtds dafault xdts
	career			Object TDTS
*/
function XPS2TDTS(myXps,targetFormat,career){
	if((typeof targetFormat == "undefined")||(targetFormat != 'tdts')) targetFormat = 'xdts';
	if(typeof career != Object) career = TDTS.parseTdts(career);
console.log(career);

	var headerString = (targetFormat == 'tdts')? 'toeiDigitalTimeSheet Save Data':'exchangeDigitalTimeSheet Save Data';

//キャリアオブジェクトにnas.Xps情報を転記
	if ((myXps.opus)||(myXps.subtitle))
		career.header.episode = myXps.getIdentifier('episode');
	if (myXps.scene)
		career.header.scene = myXps.scene;
	if (myXps.cut)
		career.header.cut = myXps.cut;
	if (myXps.xpsTracks.noteText)
		career.header.direction = myXps.xpsTracks.noteText;
	if (myXps.update_user)
		career.timeTables[0].opratorName = myXps.update_user.handle;

//nas.Xpsトラックに合わせて	TDTSのトラックを編集
	career.timeTables[0].duration = myXps.xpsTracks.duration;
//	xpsTracksを順にサーチして、振り分け
	var bookTrackNames   =[];
	var bookIdx		    ;
	var soundTracks  =[];
	var timingTracks =[];
	var cameraTracks =[];
	for (var tx = 0 ;tx < myXps.xpsTracks.length;tx ++ ){
		switch (myXps.xpsTracks[tx].option){
		case "still":
			bookIdx = timingTracks.length;
			if(!(bookTrackNames[bookIdx])) bookTrackNames[bookIdx]=[];
			bookTrackNames[bookIdx].push(myXps.xpsTracks[tx].id);
		break;
		case "dialog":
		case "sound":
			soundTracks.push(myXps.xpsTracks[tx]);
		break;
		case "cell":
		case "timing":
		case "replacement":
			timingTracks.push(myXps.xpsTracks[tx]);
		break;
		case "camera":
		case "camerawork":
			cameraTracks.push(myXps.xpsTracks[tx]);
		break;
		case "geometry":
		case "composite":
		case "effect":
		case "sfx":
		default :
			;//NOP 詳細情報トラックは　コンバート不可
			continue;
		}
	}
//振り分けたトラックを処理
//置き換え（セル）トラック
	career.timeTables[0].timeTableHeaders[0] = new TDTS.TimeTableHeader(0);
	career.timeTables[0].fields = [ new TDTS.TimeTableField(0) ];
	for (var tx=0;tx<timingTracks.length;tx++){
//トラック名を転記
		career.timeTables[0].timeTableHeaders[0].names.push(timingTracks[tx].id);
//セクションごとにデータを転記
		var currentTrack = new TDTS.TimeTableTrack(tx);		
		for (var six=0;six<timingTracks[tx].sections.length;six++){
			if(timingTracks[tx].sections[six].subSections){
//			補完区間
				for(var ssx = 0 ; ssx < timingTracks[tx].sections[six].subSections.length ; ssx ++){
					var valueString = (timingTracks[tx].sections[six].subSections[ssx].value)?
						timingTracks[tx].sections[six].subSections[ssx].getStream(1)[0] : "○";
					valueString = (valueString.match( /^[\-·・○]$/ ))? "SYMBOL_TICK_1" : "SYMBOL_TICK_2";//二種にふりわけ
					var currentFrameEntry  =  new TDTS.TimeTableFrameEntry(
						timingTracks[tx].sections[six].startOffset()+timingTracks[tx].sections[six].subSections[ssx].startOffset()
					);
					currentFrameEntry.data = [];
					currentFrameEntry.data.push(new TDTS.TimeTableFrameData( valueString ));
					if(false) currentFrameEntry.data[0].attention = false;
					if(false) currentFrameEntry.data[0].cellReplace = false;
					if(false) currentFrameEntry.data[0].memo = new TDTS.TimeTableFrameMemo()
					currentTrack.frames.push(currentFrameEntry);
				}
				continue;	
			}
//			var valueString = (timingTracks[tx].sections[six].value)? timingTracks[tx].sections[six].value.name : "×";
			var valueString = (timingTracks[tx].sections[six].value)? timingTracks[tx].sections[six].getContent()[0]: "×";
			if((! valueString)||( valueString == "×")||(valueString == "blank-cell")) valueString = "SYMBOL_NULL_CELL";
			var currentFrameEntry  =  new TDTS.TimeTableFrameEntry(timingTracks[tx].sections[six].startOffset());
			currentFrameEntry.data = [];
			currentFrameEntry.data.push(new TDTS.TimeTableFrameData( valueString ));
			if(false) currentFrameEntry.data[0].attention = false;
			if(false) currentFrameEntry.data[0].cellReplace = false;
			if(false) currentFrameEntry.data[0].memo = new TDTS.TimeTableFrameMemo()
			currentTrack.frames.push(currentFrameEntry);
		}
		career.timeTables[0].fields[0].tracks.push(currentTrack);
	}
		
//音響（セリフ）トラック
	career.timeTables[0].timeTableHeaders[3] = new TDTS.TimeTableHeader(3);
	career.timeTables[0].fields[1] = new TDTS.TimeTableField(3);
	for (var tx=0;tx<soundTracks.length;tx++){
//トラック名を転記
		career.timeTables[0].timeTableHeaders[3].names.push(soundTracks[tx].id);
//セクションごとにデータを転記
		var currentTrack = new TDTS.TimeTableTrack(tx);		
		for (var six=0;six<soundTracks[tx].sections.length;six++){
			if(!(soundTracks[tx].sections[six].value)) continue;
			var startFrame = soundTracks[tx].sections[six].startOffset();
			var currentFrameEntry  =  new TDTS.TimeTableFrameEntry(startFrame);
			currentFrameEntry.data = [];
			currentFrameEntry.data.push(new TDTS.TimeTableFrameData());
			if(false) currentFrameEntry.data[0].attention = false;
			if(false) currentFrameEntry.data[0].cellReplace = false;
			if(false) currentFrameEntry.data[0].memo = new TDTS.TimeTableFrameMemo()
console.log(soundTracks[tx].sections[six]);
console.log([
					([soundTracks[tx].sections[six].value.name]).concat(soundTracks[tx].sections[six].value.attributes).join('\\n'),
					soundTracks[tx].sections[six].value.bodyText
			]);
			currentFrameEntry.data[0].values = [
					([soundTracks[tx].sections[six].value.name]).concat(soundTracks[tx].sections[six].value.attributes).join('\\n'),
					soundTracks[tx].sections[six].value.bodyText
			];
			currentTrack.frames.push(currentFrameEntry);
			for(var frms = 1 ; frms < soundTracks[tx].sections[six].duration; frms++){
				var currentHyphexEntry  = new TDTS.TimeTableFrameEntry(startFrame+frms);
				currentHyphexEntry.data = [];
				currentHyphexEntry.data.push(new TDTS.TimeTableFrameData("SYMBOL_HYPHEN"));
				if(false) currentHyphexEntry.data[0].attention = false;
				if(false) currentHyphexEntry.data[0].cellReplace = false;
				if(false) currentHyphexEntry.data[0].memo = new TDTS.TimeTableFrameMemo()
				currentTrack.frames.push(currentHyphexEntry);
			}
		}
		career.timeTables[0].fields[1].tracks.push(currentTrack);
	}

//論理的撮影指定（カメラワーク）トラック
	career.timeTables[0].timeTableHeaders[5] = new TDTS.TimeTableHeader(5);
	career.timeTables[0].fields[2] = new TDTS.TimeTableField(5);
	for (var tx=0;tx<cameraTracks.length;tx++){
//トラック名を転記
		career.timeTables[0].timeTableHeaders[5].names.push(cameraTracks[tx].id);
//セクションごとにデータを転記
		var currentTrack = new TDTS.TimeTableTrack(tx);		
		for (var six=0;six<cameraTracks[tx].sections.length;six++){
			if(!(cameraTracks[tx].sections[six].value)) continue;
			var startFrame = cameraTracks[tx].sections[six].startOffset();
			var cameraWorkID = TDTS.SectionItemTable.indexOf(cameraTracks[tx].sections[six].value.type[1]);
			if (cameraWorkID < 0) continue;//スキップ
			var cameraString = TDTS.SectionItemTable[cameraWorkID][0];
			var currentFrameEntry  =  new TDTS.TimeTableFrameEntry(startFrame);
			currentFrameEntry.data = [];
			if( targetFormat == 'xdts'){
				currentFrameEntry.data.push(new TDTS.TimeTableFrameData(cameraString));
			}else{
				currentFrameEntry.data.push(new TDTS.TimeTableFrameData(String(cameraWorkID)));
			}
			if(false) currentFrameEntry.data[0].attention = false;
			if(false) currentFrameEntry.data[0].cellReplace = false;
			if(false) currentFrameEntry.data[0].memo = new TDTS.TimeTableFrameMemo()
			currentTrack.frames.push(currentFrameEntry);
			for(var frms = 1 ; frms < cameraTracks[tx].sections[six].duration; frms++){
				var currentHyphexEntry  = new TDTS.TimeTableFrameEntry(startFrame+frms);
				currentHyphexEntry.data = [];
				currentHyphexEntry.data.push(new TDTS.TimeTableFrameData("SYMBOL_HYPHEN"));
				if(false) currentHyphexEntry.data[0].attention = false;
				if(false) currentHyphexEntry.data[0].cellReplace = false;
				if(false) currentHyphexEntry.data[0].memo = new TDTS.TimeTableFrameMemo()
				currentTrack.frames.push(currentHyphexEntry);
			}
		}
		career.timeTables[0].fields[2].tracks.push(currentTrack);
	}
	
//静止画（BOOK）トラック
/*
	TDTSは挿入点指定のみしか扱わないので注意
	ターゲットがTDTSの場合のみ処理
*/

	if((bookTrackNames.length > 0)&&(targetFormat=='tdts')){
		career.timeTables[0].books = [ new TDTS.TimeTableField(0) ];
		for (var tx=0;tx<bookTrackNames.length;tx++){
			if((!(bookTrackNames[tx]))||(bookTrackNames[tx].length==0)) continue;
			var currentTrack=new TDTS.TimeTableTrack(tx);
			currentTrack.texts=bookTrackNames[tx];
			career.timeTables[0].books[0].tracks.push(currentTrack);
		}
	}
console.log(career);
	return headerString+'\n'+JSON.stringify(career);
}
/*
XPSオブジェクトを引数にしてXDTSフォーマットで出力 エイリアス
*/
var XPS2XDTS = XPS2TDTS;

/*=======================================*/
if((typeof window == 'undefined')&&(typeof app == 'undefined')){
    exports.TDTS2XPS = TDTS2XPS;
    exports.XPS2TDTS = XPS2TDTS;
    exports.XPS2XDTS = XPS2XDTS;
}
/*  eg. for import
    const { TDTS2XPS , XPS2TDTS , XPS2XDTS } = require('./lib_TDTS.js');

*/
