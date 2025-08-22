/*(カット番号パネル)
 *	スクリプト名:cutName.jsx
 *
 	07/02/25
 */
//オブジェクト識別文字列生成 
//var myFilename="cutName.js";//正式なファイル名と置き換えてください。
//var myFilerevision="0.1";//ファイルージョンはアバウトパネルで表示されます。

/*	cvs/rcs使用の方は、下の2行をご使用ください	*/
	var myFilename=("$RCSfile: cutName.jsx,v $").split(":")[1].split(",")[0];
	var myFilerevision=("$Revision: 1.1.2.15 $").split(":")[1].split("$")[0];
//

var exFlag=true;
var moduleName="eStoryBoard";//識別用のモジュール名で置き換えてください。
//二重初期化防止トラップ
try{
	if(nas.Version)
	{
		nas.Version[moduleName]=moduleName+" :"+myFilename+" :"+myFilerevision;
	//現在のモジュール名とバージョンを登録する
		try{
if(nas[moduleName]){
//モジュールがオンメモリ(すでに初期化されている)場合の処理
	exFlag=true;//debug
//	nas[moduleName][myWindowName].show();
/*
	この部分は再初期化コマンドで置き換えてください。上の行は例です。
	現在のモジュール(ウインドウ)の表示メソッドを呼んでいます。
	すでに読み込み済みのモジュールを再度初期化することを防止するための処理です。
 */
}else{
//このスクリプトの識別モジュール名を登録します。
	nas[moduleName]=new Object();
}
		}catch(err){
//エラー時の処理をします。
	nas[moduleName]=new Object();
//		強制的に初期化(モジュール名登録)して。実行
//	alert("エラーです。モジュール登録に失敗しました");exFlag=false;
//		または終了
		}
	}
}catch(err){
//nas 環境自体がない(ライブラリがセットアップされていない)時の処理(終了)
	alert("nasライブラリが必要です。\nnasStartup.jsx を実行してください。");
	exFlag=false;
}
//このプログラムは、プロジェクトに一定の環境を必要とします。環境のチェック


//初期化およびGUI設定
if(exFlag){
/* ライブラリ導入 */
//@include "./libCont.jsx"
/*------	nas一般メソッド新しいやつ暫定試験	------*/
/*	nas.numInc([string 旧番号]);
	戻り値:新番号
カット版番号を文字列で与えて最初に現れる数値部分を1増加させて後置部分を切り捨てて戻す。
数値を含まない文字列を与えるとそれを前置部分として"001"を付けて戻す。
引数無しの場合は開始番号の"001"を戻す。
*/
nas.numInc =function(oldNumber){
var currentValue="001";
	if(oldNumber){currentValue=oldNumber};

	if (currentValue.match(/^([^0-9]*)([0-9]+)(.*)/)){
		preFix=RegExp.$1;numValue=RegExp.$2;postFix=RegExp.$3;
	}else{
		preFix=currentValue;numValue="001";postFix="";
	}
//桁あわせの文字数取得
	var myOrder=numValue.length;
//ポストフィックスがある場合は、無条件で廃棄
//プレフィックスは無条件で保持
	return preFix+nas.Zf(numValue*1+1,myOrder);
}

// nas.numInc("C");//
	/*----この下に初期化スクリプトを記述してください。----*/
//	モジュール対応設定
	nas[moduleName].targetSD=app.project.items.getByName("00スタビライズ")[0];
	nas[moduleName].targetPS=app.project.items.getByName("01用紙登録")[0];
	nas[moduleName].targetPC=app.project.items.getByName("02ページコレクション")[0];
	nas[moduleName].targetCC=app.project.items.getByName("03カラムコレクション")[0];
	nas[moduleName].targetOB=app.project.items.getByName("04出力バッファ")[0];


//	各種プロパティ・メソッド等を初期化
	nas[moduleName].pictureArea	=nas[moduleName].targetPS.layers.byName("画像エリア");
	nas[moduleName].timeText	=nas[moduleName].targetCC.layers.byName("Time").text.sourceText;
	nas[moduleName].cutNumber	=nas[moduleName].targetCC.layers.byName("CUT No.").text.sourceText;
	nas[moduleName].pageIndex	=nas[moduleName].targetCC.layers.byName("ColumnInformation").effect("Page").property(1);
	nas[moduleName].pageName	=nas[moduleName].targetPC.layers.byName("PageIndex").text.sourceText;
	nas[moduleName].columnIndex	=nas[moduleName].targetCC.layers.byName("ColumnInformation").effect("ColumnIndex").property(1);
	nas[moduleName].columnPosition	=nas[moduleName].targetCC.layers.byName("ColumnInformation").property("position");
	nas[moduleName].columnScale	=nas[moduleName].targetCC.layers.byName("ColumnInformation").property("scale");
	nas[moduleName].scaleFit	=nas[moduleName].targetCC.layers.byName("ColumnInformation").effect("scaleFitting").property(1);
//	nas[moduleName].columnPosition	=nas[moduleName].targetCC.layers.byName("カラムセレクタ").property("position");

	nas[moduleName].frameRate	=Math.round(1/nas[moduleName].targetCC.frameDuration);
//			フレームレートは、カラムコレクションのフレームレートをそのまま使用。(24で固定になってる部分に注意?!)


	nas[moduleName].keyInit=function(){
app.beginUndoGroup("キーフレーム初期化");
if(nas["eStoryBoard"].targetCC.time!=0){nas["eStoryBoard"].targetCC.time=0};//カラムコレクションのカーソルを開始フレームへ
var targetProps=[
	"pageIndex","columnPosition","columnScale"
];
//"timeText","cutNumber",
for(idx=0;idx<targetProps.length;idx++){
	var targetProp=targetProps[idx];var defValue=nas["eStoryBoard"][targetProp].value;
	if(nas["eStoryBoard"][targetProp].numKeys==0){	
		nas["eStoryBoard"][targetProp].setValueAtTime(0,defValue);
		nas["eStoryBoard"][targetProp].setInterpolationTypeAtKey(1,KeyframeInterpolationType.HOLD);
//		nas["eStoryBoard"][targetProp].setInterpolationTypeAtKey(nas["eStoryBoard"][targetProp].nearestKeyIndex(nas["eStoryBoard"].targetCC.time),KeyframeInterpolationType.HOLD);
	}
}
//
	if(nas["eStoryBoard"].cutNumber.numKeys==0){	
		nas["eStoryBoard"].cutNumber.setValueAtTime(0,"001");
		nas["eStoryBoard"].timeText.setValueAtTime(0,"1 + 00");
	}
app.endUndoGroup();
};


// システム設定に置いたウィンドウのオフセットが必要な場合はこれで取得します。
// ウインドウを使用しない場合は削除してください。

	var myWindowName	="nameDialog";//モジュール配下のウィンドウ名をできる限りユニークに
/*	他のプログラムのウィンドウ名とコンフリクトした場合はウィンドウ位置が共有されますので注意	*/

	var myDefaultLeft	=nas.GUI.dafaultOffset[0];//ウィンドウ位置初期値を設定したい場合は
	var myDefaultTop	=nas.GUI.dafaultOffset[1];//お好きな値で置き換えてください。

	myLeft=(nas.GUI.winOffset[myWindowName])?
	nas.GUI.winOffset[myWindowName][0] : myDefaultLeft;
	myTop=(nas.GUI.winOffset[myWindowName])?
	nas.GUI.winOffset[myWindowName][1] : myDefaultTop;

// ///////////// GUI 設定 /////////////
// ウインドウ初期化
//	nas[moduleName][myWindowName]=nas.GUI.newWindow("dialog","急造カット番号つけ",6,7,myLeft,myTop);
	nas[moduleName][myWindowName]=nas.GUI.newWindow("pallete","急造カット番号つけ",6,8,myLeft,myTop);

//ウィンドウターゲットをプロパティに控える
	nas[moduleName].targetCC=app.project.items.getByName("03カラムコレクション")[0]

// ウィンドウにコントロールを配置

	/*----ここにコントロールを記述してください。----*/
//	ラベル
	nas[moduleName][myWindowName].pgLb	=nas.GUI.addStaticText    (nas[moduleName][myWindowName],"page",2 ,1.4 ,1 ,1);
	nas[moduleName][myWindowName].pgLb.justify="right";
	nas[moduleName][myWindowName].clLb	=nas.GUI.addStaticText    (nas[moduleName][myWindowName],"column",4 ,1.4 ,1 ,1);
	nas[moduleName][myWindowName].clLb.justify="right";
	nas[moduleName][myWindowName].ctLb	=nas.GUI.addStaticText    (nas[moduleName][myWindowName],"CUT#",.5 ,2.4 ,2 ,1);
	nas[moduleName][myWindowName].ctLb.justify="right";
	nas[moduleName][myWindowName].tmLb	=nas.GUI.addStaticText    (nas[moduleName][myWindowName],"TIME",3 ,2.4 ,2 ,1);
	nas[moduleName][myWindowName].tmLb.justify="right";
	nas[moduleName][myWindowName].ftLb	=nas.GUI.addStaticText    (nas[moduleName][myWindowName],"autoScale",5 ,2.4 ,1 ,1);
	nas[moduleName][myWindowName].ftLb.justify="right";
//	テキスト
	nas[moduleName][myWindowName].pgNm	=nas.GUI.addEditText    (nas[moduleName][myWindowName],"-",3 ,1 ,1 ,1);
	nas[moduleName][myWindowName].pgNm.justify="center";
	nas[moduleName][myWindowName].clId	=nas.GUI.addEditText    (nas[moduleName][myWindowName],"-",5 ,1 ,1 ,1);
	nas[moduleName][myWindowName].clId.justify="center";
	nas[moduleName][myWindowName].clId.enabled=false;

	nas[moduleName][myWindowName].ctNm	=nas.GUI.addEditText    (nas[moduleName][myWindowName],"-",.5 ,3 ,2 ,1);
	nas[moduleName][myWindowName].ctNm.justify="center";
//	nas[moduleName][myWindowName].ctNm.targetProp=nas[moduleName].cutNumber;
	nas[moduleName][myWindowName].ctTm	=nas.GUI.addEditText    (nas[moduleName][myWindowName],"-",3 ,3 ,2 ,1);
	nas[moduleName][myWindowName].ctTm.justify="center";
//	nas[moduleName][myWindowName].ctTm.targetProp=nas[muduleName].timeText;
	nas[moduleName][myWindowName].clmIndex	=nas.GUI.addEditText    (nas[moduleName][myWindowName],"-",4 ,4 ,2 ,1);
	nas[moduleName][myWindowName].clmIndex.justify="center";

//	チェックボックス
	nas[moduleName][myWindowName].cbFt  =nas.GUI.addCheckBox    (nas[moduleName][myWindowName] ,"-" ,5.5 ,3 ,.5 ,1);

	nas[moduleName][myWindowName].cbCt  =nas.GUI.addCheckBox    (nas[moduleName][myWindowName] ,"-" ,0 ,3 ,.5 ,1);
	nas[moduleName][myWindowName].cbCt.pairText=nas[moduleName][myWindowName].ctNm;
	nas[moduleName][myWindowName].cbTm  =nas.GUI.addCheckBox    (nas[moduleName][myWindowName] ,"-" ,2.5 ,3 ,.5 ,1);
	nas[moduleName][myWindowName].cbTm.pairText=nas[moduleName][myWindowName].ctTm;
//	スライダ
var maxIndex=nas["eStoryBoard"].columnPosition.numKeys;
var minIndex=0;
var currentIndex=Math.floor(nas["eStoryBoard"].targetCC.time/nas["eStoryBoard"].targetCC.frameDuration);
	nas[moduleName][myWindowName].sldTm  =nas.GUI.addSlider      (nas[moduleName][myWindowName] ,currentIndex ,minIndex ,maxIndex ,0 ,4 ,4 ,"top");

//	ボタンエレメント
	nas[moduleName][myWindowName].btnRld  =nas.GUI.addButton      (nas[moduleName][myWindowName] ,"reload" ,0 ,1 ,2 ,1);

	nas[moduleName][myWindowName].btnUp  =nas.GUI.addButton      (nas[moduleName][myWindowName] ,"△" ,0 ,6 ,1 ,1);
	nas[moduleName][myWindowName].btnDn  =nas.GUI.addButton      (nas[moduleName][myWindowName] ,"▽" ,1 ,6 ,1 ,1);
	nas[moduleName][myWindowName].btnPg  =nas.GUI.addButton      (nas[moduleName][myWindowName] ,"+ PAGE" ,2 ,6 ,2 ,1);
	nas[moduleName][myWindowName].btnClm  =nas.GUI.addButton      (nas[moduleName][myWindowName] ,"+ COLUMN" ,4 ,6 ,2 ,1);

	nas[moduleName][myWindowName].btnClose  =nas.GUI.addButton      (nas[moduleName][myWindowName] ,"close" ,0 ,7 ,2 ,1);
	nas[moduleName][myWindowName].btnInc  =nas.GUI.addButton      (nas[moduleName][myWindowName] ,"NEXT" ,2 ,7 ,4 ,1);

// コントロールのイベント設定


	/*----ここにコントロールの動作を記述してください。----*/
//チェックボックスのキー操作
//	クリアすると現存のキーを削除	チェックすると現在値でキー作成

function checkKey(targetProp){
//alert(this.value);
	if (! targetProp){return null;};
	if (! this.value){
if((nas["eStoryBoard"][targetProp].keyTime(nas["eStoryBoard"][targetProp].nearestKeyIndex(nas["eStoryBoard"].targetCC.time))==nas["eStoryBoard"].targetCC.time )&&(nas["eStoryBoard"][targetProp].numKeys>1)){
		app.beginUndoGroup("キー削除");
		nas["eStoryBoard"][targetProp].removeKey(nas["eStoryBoard"][targetProp].nearestKeyIndex(nas["eStoryBoard"].targetCC.time));
		app.endUndoGroup();
}
	}else{
		app.beginUndoGroup("キー作成");
		nas["eStoryBoard"][targetProp].setValueAtTime(nas["eStoryBoard"].targetCC.time,this.pairText.text);
		app.endUndoGroup();
	}
}
//チェックボックス割付

nas["eStoryBoard"][myWindowName].cbFt.onClick= function(){
//先にトグル動作して結果を表示するように変更
//	if (nas["eStoryBoard"].scaleFit.nearestKey(nas["eStoryBoard"].targetCC.time).time==nas["eStoryBoard"].targetCC.time){alert("test")};
	if (nas["eStoryBoard"].scaleFit.value){
		app.beginUndoGroup("キー削除");
		nas["eStoryBoard"].scaleFit.removeKey(nas["eStoryBoard"].scaleFit.nearestKeyIndex(nas["eStoryBoard"].targetCC.time));
		if(nas["eStoryBoard"].scaleFit.numKeys==0){nas["eStoryBoard"].scaleFit.setValue(false);}

		app.endUndoGroup();
	}else{
		app.beginUndoGroup("キー作成");
			nas["eStoryBoard"].scaleFit.setValueAtTime(nas["eStoryBoard"].targetCC.time,true);
		app.endUndoGroup();
	}
	this.value=nas["eStoryBoard"].scaleFit.valueAtTime(nas["eStoryBoard"].targetCC.time,false);
/*
	if (! this.value){

if((nas["eStoryBoard"].scaleFit.keyTime(nas["eStoryBoard"].scaleFit.nearestKeyIndex(nas["eStoryBoard"].targetCC.time))==nas["eStoryBoard"].targetCC.time )&&(nas["eStoryBoard"].scaleFit.numKeys>1)){
		app.beginUndoGroup("キー削除");
		nas["eStoryBoard"].scaleFit.removeKey(nas["eStoryBoard"].scaleFit.nearestKeyIndex(nas["eStoryBoard"].targetCC.time));
		app.endUndoGroup();
}
	}else{
		app.beginUndoGroup("キー作成");
		if(nas["eStoryBoard"].scaleFit.numKeys==0){
			nas["eStoryBoard"].scaleFit.setValueAtTime(nas["eStoryBoard"].targetCC.time,true);
		}else{
			nas["eStoryBoard"].scaleFit.setValueAtTime(nas["eStoryBoard"].targetCC.time,true);
		}
		app.endUndoGroup();
	}
*/
};

nas["eStoryBoard"][myWindowName].cbCt.onClick= function(){checkKey("cutNumber");};
nas["eStoryBoard"][myWindowName].cbTm.onClick= function(){checkKey("timeText");};

//カラム追加
nas["eStoryBoard"].addColumn= function(){

	if(nas["eStoryBoard"].columnPosition.keyTime(nas["eStoryBoard"].columnPosition.nearestKeyIndex(nas["eStoryBoard"].targetCC.time))==nas["eStoryBoard"].targetCC.time){
//現在の時間位置にキーが存在している場合はなにもしない
//	alert("ON Key");
	}else{
//	if(nas["eStoryBoard"].columnIndex.value<=4){}
//判定条件をキーインデックスでなくフレーム位置に変更;
//フレームの下端位置が画像エリアの下側 1/カラム数 以下だった場合に次ページへ移動
var fixPoint=sub(
	nas["eStoryBoard"].targetPS.layers.byName("画像エリア").position.value,
	sub(
	nas["eStoryBoard"].targetPS.layers.byName("00スタビライズ").position.value,
	nas["eStoryBoard"].targetPS.layers.byName("00スタビライズ").anchorPoint.value
	)
);
	if(nas["eStoryBoard"].columnPosition.value[1]<=(fixPoint[1]+nas["eStoryBoard"].pictureArea.height*nas["eStoryBoard"].pictureArea.scale.value[1]*3.8/500)){
//undoブロック設置
		app.beginUndoGroup("カラム追加");
		var	myHeight=nas["eStoryBoard"].columnScale.value[1];//現在のカラムの左下に変更
		var	myLeft	=nas["eStoryBoard"].columnPosition.value[0];
		var	myTop	=nas["eStoryBoard"].columnPosition.value[1]+myHeight;
		nas["eStoryBoard"].columnPosition.setValueAtTime(nas["eStoryBoard"].targetCC.time,[myLeft,myTop]);
		nas["eStoryBoard"].columnPosition.setInterpolationTypeAtKey(nas["eStoryBoard"].columnPosition.nearestKeyIndex(nas["eStoryBoard"].targetCC.time),KeyframeInterpolationType.HOLD);
		var	myScale	=nas["eStoryBoard"].targetPS.layers.byName("最上段フレーム").scale.value;
		nas["eStoryBoard"].columnScale.setValueAtTime(nas["eStoryBoard"].targetCC.time,myScale);
		nas["eStoryBoard"].columnScale.setInterpolationTypeAtKey(nas["eStoryBoard"].columnScale.nearestKeyIndex(nas["eStoryBoard"].targetCC.time),KeyframeInterpolationType.HOLD);
		app.endUndoGroup();
	}else{
		nas["eStoryBoard"].addPage();
	}
//	nas["eStoryBoard"].reDiaplay();
	}

//	nas["eStoryBoard"].targetCC.layers.byName("カラムセレクタ").position
}

//ページ追加
nas["eStoryBoard"].addPage= function(){
//	if()
	var nextPage=nas["eStoryBoard"].pageIndex.value+1;
var fixPoint=sub(
	nas["eStoryBoard"].targetPS.layers.byName("画像エリア").position.value,
	sub(
	nas["eStoryBoard"].targetPS.layers.byName("00スタビライズ").position.value,
	nas["eStoryBoard"].targetPS.layers.byName("00スタビライズ").anchorPoint.value
	)
);
		app.beginUndoGroup("ページ追加");

	nas["eStoryBoard"].pageIndex.setValueAtTime(nas["eStoryBoard"].targetCC.time,nextPage);
	nas["eStoryBoard"].pageIndex.setInterpolationTypeAtKey(nas["eStoryBoard"].pageIndex.nearestKeyIndex(nas["eStoryBoard"].targetCC.time),KeyframeInterpolationType.HOLD);
	nas["eStoryBoard"].columnPosition.setValueAtTime(nas["eStoryBoard"].targetCC.time,fixPoint);
	nas["eStoryBoard"].columnPosition.setInterpolationTypeAtKey(nas["eStoryBoard"].columnPosition.nearestKeyIndex(nas["eStoryBoard"].targetCC.time),KeyframeInterpolationType.HOLD);
	var	myScale	=nas["eStoryBoard"].targetPS.layers.byName("最上段フレーム").scale.value;
	nas["eStoryBoard"].columnScale.setValueAtTime(nas["eStoryBoard"].targetCC.time,myScale);
	nas["eStoryBoard"].columnScale.setInterpolationTypeAtKey(nas["eStoryBoard"].columnScale.nearestKeyIndex(nas["eStoryBoard"].targetCC.time),KeyframeInterpolationType.HOLD);
		app.endUndoGroup();
//	nas["eStoryBoard"].reDiaplay();
}

//移動
nas["eStoryBoard"][myWindowName].go=function(stat){
var newTime=0;
var maxTime=nas["eStoryBoard"].columnPosition.numKeys*nas["eStoryBoard"].targetCC.frameDuration;

	if(! stat){stat=nas["eStoryBoard"].targetCC.time}
		if(isNaN(stat)){
	switch(stat){
case	"next":;
	newTime=nas["eStoryBoard"].targetCC.time+nas["eStoryBoard"].targetCC.frameDuration;
	if(newTime>=maxTime)newTime=maxTime;
//	maxTime+=+nas["eStoryBoard"].targetCC.frameDuration;
break;
case	"prev":;
	newTime=nas["eStoryBoard"].targetCC.time-nas["eStoryBoard"].targetCC.frameDuration;
	if(newTime<0){newTime=0;};
break;
case	"start":;
	newTime=0;
break;
case	"end":;
//	newTime=nas["eStoryBoard"]["nameDialog"].sldTm.maxvalue*nas["eStoryBoard"].targetCC.frameDuration;
	newTime=maxTime;
break;
default:
			newTime=nas["eStoryBoard"].targetCC.time
	}
		}else{
			newTime=stat*nas["eStoryBoard"].targetCC.frameDuration;
			if(newTime>=nas["eStoryBoard"].targetCC.duration){newTime=nas["eStoryBoard"].targetCC.duration};
			if(newTime<0){newTime=0};
		}
//alert(newTime +"; " +maxTime +"  /   "+newTime%maxTime);

	nas["eStoryBoard"].targetCC.time=newTime;
}
//ボタン割付

	nas[moduleName][myWindowName].btnUp.onClick=function(){this.parent.go("prev");nas["eStoryBoard"].reDisplay();}

	nas[moduleName][myWindowName].btnDn.onClick=function(){
		this.parent.go("next");
//		nas["eStoryBoard"].addColumn();
		nas["eStoryBoard"].reDisplay();
	}
//	カット追加
	nas[moduleName][myWindowName].btnInc.onClick=function(){
		this.parent.go("next");
		nas["eStoryBoard"].addColumn();
		nas["eStoryBoard"].reDisplay();
		var oldNum=nas["eStoryBoard"]["cutNumber"].valueAtTime(nas["eStoryBoard"].targetCC.time,true).toString();
		this.parent.ctNm.text=nas.numInc(oldNum);//最後のキーの値に変更すべし
		this.parent.ctNm.onChange();
		this.parent.ctTm.text="";
//		this.parent.ctTm.onChange();
	}
//	カラム追加
	nas[moduleName][myWindowName].btnClm.onClick=function(){
		this.parent.go("next");
		nas["eStoryBoard"].addColumn();
		nas["eStoryBoard"].reDisplay();
	}

	nas[moduleName][myWindowName].btnPg.onClick=function(){
		this.parent.go("next");
		nas["eStoryBoard"].addPage();
		nas["eStoryBoard"].reDisplay();
	}
//		スライダ
	nas[moduleName][myWindowName].sldTm.onChange=function(){
		this.parent.go(this.value);
		nas["eStoryBoard"].reDisplay();
	}
//キー作成
	nas[moduleName][myWindowName].ctNm.onChange=function(){

		var myValue=this.text;
		if(myValue.match(/^[1-9][0-9]?$/)){this.text=nas.Zf(myValue*1,3)};

		if(this.parent.cbCt.value){
			app.beginUndoGroup("カット番号変更");
			nas["eStoryBoard"].cutNumber.setValueAtKey(nas["eStoryBoard"].cutNumber.nearestKeyIndex(nas["eStoryBoard"].targetCC.time),this.text);
			app.endUndoGroup();
		}else{
			app.beginUndoGroup("新規カット番号");
			nas["eStoryBoard"].cutNumber.setValueAtTime(nas["eStoryBoard"].targetCC.time,this.text);
			app.endUndoGroup();
		}
		nas["eStoryBoard"].reDisplay();
	}
	nas[moduleName][myWindowName].ctTm.onChange=function(){

		var myValue=this.text;
//alert(myValue);
		if(myValue.match(/^[1-9][0-9]*$/)){
			this.text=nas.Frm2FCT(myValue*1/nas["eStoryBoard"].targetCC.frameDuration,3,0,1/nas["eStoryBoard"].targetCC.frameDuration);
		}else{
		if(myValue.match(/^([0-9]+)([\-\.\+\ \:])([0-9]+)$/)){
			this.text=RegExp.$1+"+"+RegExp.$3;
		};
}
		if(this.parent.cbTm.value){
			app.beginUndoGroup("秒数変更");
			nas["eStoryBoard"].timeText.setValueAtKey(nas["eStoryBoard"].timeText.nearestKeyIndex(nas["eStoryBoard"].targetCC.time),this.text);
//			nas["eStoryBoard"].timeText.setValueAtKey(nas["eStoryBoard"].timeText.nearestKeyIndex(nas["eStoryBoard"].targetCC.time),myValue);
			app.endUndoGroup();
		}else{
			app.beginUndoGroup("新規秒数");
			nas["eStoryBoard"].timeText.setValueAtTime(nas["eStoryBoard"].targetCC.time,this.text);
			app.endUndoGroup();
		}
		nas["eStoryBoard"].reDisplay();
	}

//ページ番号変更
	nas[moduleName][myWindowName].pgNm.onChange=function(){
		var myValue	=this.text;
		var myTime	=nas["eStoryBoard"].pageIndex.value*nas["eStoryBoard"].targetCC.frameDuration;
		if(myValue==""){
//				値がヌルの場合はキー削除モードに
//				キーが無い(オート処理)場合は何もしないで復帰
			var myNearestKeyIndex=nas["eStoryBoard"].pageName.nearestKeyIndex(myTime);
			if(nas["eStoryBoard"].pageName.keyTime(myNearestKeyIndex)==myTime){
				nas["eStoryBoard"].pageName.removeKey(myNearestKeyIndex);
			}
				nas["eStoryBoard"].reDisplay();return;
		};
		var oldValue=nas["eStoryBoard"].pageName.valueAtTime(myTime,false);
		if (myValue!=oldValue){
			nas["eStoryBoard"].pageName.setValueAtTime(myTime,myValue);
		}
	}

//コントロールの更新
	nas[moduleName][myWindowName].btnRld.onClick=	function(){nas["eStoryBoard"].reDisplay();}

nas["eStoryBoard"].reDisplay =function (){
	if(nas["eStoryBoard"].columnPosition.numKeys==0){nas["eStoryBoard"].keyInit();}
//	テキスト
//	nas["eStoryBoard"]["nameDialog"].pgNm.text	=nas["eStoryBoard"].pageIndex.value.toString();
	nas["eStoryBoard"]["nameDialog"].pgNm.text	=nas["eStoryBoard"].targetCC.layers.byName("02ページコレクション").source.layers.byName("PageIndex").text.sourceText.valueAtTime(nas["eStoryBoard"].pageIndex.value*nas["eStoryBoard"].targetCC.frameDuration,false);

	nas["eStoryBoard"]["nameDialog"].clId.text	=nas["eStoryBoard"].columnIndex.value.toString();
	nas["eStoryBoard"]["nameDialog"].ctNm.text	=nas["eStoryBoard"].cutNumber.value.toString();
	nas["eStoryBoard"]["nameDialog"].ctTm.text	=nas["eStoryBoard"].timeText.value.toString();

//	チェックボックス

//if(nas["eStoryBoard"].scaleFit.keyTime(nas["eStoryBoard"].scaleFit.nearestKeyIndex(nas["eStoryBoard"].targetCC.time))==nas["eStoryBoard"].targetCC.time){}
if(nas["eStoryBoard"].scaleFit.value){
	nas["eStoryBoard"]["nameDialog"].cbFt.value  =true;
}else{
	nas["eStoryBoard"]["nameDialog"].cbFt.value  =false;
};
if(nas["eStoryBoard"].cutNumber.keyTime(nas["eStoryBoard"].cutNumber.nearestKeyIndex(nas["eStoryBoard"].targetCC.time))==nas["eStoryBoard"].targetCC.time){
	nas["eStoryBoard"]["nameDialog"].cbCt.value  =true;
}else{
	nas["eStoryBoard"]["nameDialog"].cbCt.value  =false;
};
if(nas["eStoryBoard"].timeText.keyTime(nas["eStoryBoard"].timeText.nearestKeyIndex(nas["eStoryBoard"].targetCC.time))==nas["eStoryBoard"].targetCC.time){
	nas["eStoryBoard"]["nameDialog"].cbTm.value  =true;
}else{
	nas["eStoryBoard"]["nameDialog"].cbTm.value  =false;
};

//	スライダ
var maxIndex=nas["eStoryBoard"].columnPosition.numKeys;
var minIndex=0;
var currentIndex=Math.floor(nas["eStoryBoard"].targetCC.time/nas["eStoryBoard"].targetCC.frameDuration);
	nas["eStoryBoard"]["nameDialog"].sldTm.minvalue  =minIndex;
	nas["eStoryBoard"]["nameDialog"].sldTm.maxvalue  =maxIndex;
	nas["eStoryBoard"]["nameDialog"].sldTm.value  =currentIndex;

	nas["eStoryBoard"]["nameDialog"].clmIndex.text	=currentIndex +" / "+maxIndex;
}

	nas["eStoryBoard"]["nameDialog"].btnClose.onClick=function(){this.parent.close();};


//	ウィンドウ最終位置を記録(不要ならば削除してください。)
	nas[moduleName].onMove=function(){
nas.GUI.winOffset["nameDialog"] =[nas[moduleName]["nameDialog"].bounds[0],nas["eStoryBoard"]["nameDialog"].bounds[1]];
	}
// ///////////// GUI 設定 終り ウィンドウ表示 /////////////
	nas["eStoryBoard"].reDisplay();
	nas["eStoryBoard"]["nameDialog"].show();
};
	/*---- この下には初期化の必要ないコマンドを書くことが出来ます。----*/
	if(nas["eStoryBoard"].columnPosition.numKeys==0){nas["eStoryBoard"].keyInit();}
//スクリプト終了

