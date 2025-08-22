//no launch
/*(コンテ分解ライブラリ)
<jsx_00>
/	コンテ分解モジュールの為の各種拡張メソッド
	汎用性のたかそうなメソッドは後で乙女に引越
*/
var myDBG=new Array;
/*		Item.getItemsByName(name String)
	ItemColectionに名前アクセスを実装
	名前は完全一致のみ
	戻り値はItemの配列
	マッチアイテムが存在しない場合は長さ0の配列が戻る
*/
ItemCollection.prototype.getByName= function (targetName){
	var resultArray=new Array();
	for (var idx=0;idx<this.length;idx++){
		if(this[idx+1].name==targetName){
			resultArray.push(this[idx+1]);
		}
	}
	return resultArray;
}
/*
	properyクラスにキー移動メソッドを増設
	ターゲットキーを時間指定で移動する

		property.moveKey(index integer,time float)

	引数は ターゲットのキーIndexと 移動先の時間指定 時間指定省略は不可
	戻り値は移動後の新しいキーのIndex

	移動先が同じ時間ならば処理全体をパス(UNDOも積まない)
	移動先にキーが存在する場合はAEの仕様上「上書き」
	同じ時間上にキー複数は(当然)認められないようです
*/
Property.prototype.moveKey=function(myIndex,myTime){
//プロパティタイプがPROPERTYの際のみ実行
	if(this.propertyType!=PropertyType.PROPERTY){return false}
//不正引数を判別
	if((! myIndex)||(this.numKeys<myIndex)||isNaN(myTime)){return false;}
//移動先が同じなら処理自体をパス
	if(this.keyTime(myIndex)==myTime){return myIndex};
//元キーの属性をバッファ
	var mySelected	=this.keySelected(myIndex);//選択?

if(this.isInterpolationTypeValid(KeyframeInterpolationType.BEZIER))
{
	var myInInterpolationType	=this.keyInInterpolationType(myIndex)
	var myOutInterpolationType	=this.keyOutInterpolationType(myIndex);//補間タイプのコピー
	var myTemporalEaseIn	=this.keyInTemporalEase(myIndex);
	var myTemporalEaseOut	=this.keyOutTemporalEase(myIndex);
}
if(this.isSpatial){
	var myRoving	=this.keyRoving(myIndex);//ロービング
	var mySpatialAutoBezier	=this.keySpatialAutoBezier(myIndex);
	var mySpatialContinuous	=this.keySpatialContinuous(myIndex);
	var mySpatialInTangents	=this.keyInSpatialTangent(myIndex)
	var mySpatialOutTangents	=this.keyOutSpatialTangent(myIndex);//タンゼントのコピー
	var myTemporalAutoBezier	=this.keyTemporalAutoBezier(myIndex);
	var myTemporalContinuous	=this.keyTemporalContinuous(myIndex);
}
//ここからUndoGroup
//	app.beginUndoGroup("キーフレーム移動");
//myDBG.push("open キーフレーム移動")
//新しいキーを作成
	var oldKeyLength=this.numKeys;
	var newKeyIndex = this.addKey(myTime);
//古いキー この判定ではダメ インデックスが変わらない事もある
	var oldKeyIndex = myIndex;
	if((newKeyIndex<=myIndex)&&(this.numKeys>oldKeyLength)){ oldKeyIndex++}
//値の複写
	this.setValueAtKey(newKeyIndex,this.keyValue(oldKeyIndex));
//元キー消す
	this.removeKey(oldKeyIndex);
	if(oldKeyIndex<newKeyIndex){newKeyIndex--};//キー削除でインデックス変更
//値のコピーは、新キーを作成する前にバッファにとらないとキー作成の影響で変化するのでダメ
if(this.isSpatial){
	this.setTemporalContinuousAtKey(newKeyIndex,myTemporalContinuous);
	this.setTemporalAutoBezierAtKey(newKeyIndex,myTemporalAutoBezier);
	this.setSpatialTangentsAtKey(newKeyIndex,mySpatialInTangents,mySpatialOutTangents);//タンゼント
	this.setSpatialContinuousAtKey(newKeyIndex,mySpatialContinuous);
	this.setSpatialAutoBezierAtKey(newKeyIndex,mySpatialAutoBezier);
	this.setRovingAtKey(newKeyIndex,myRoving);//ロービング
}
if(this.isInterpolationTypeValid(KeyframeInterpolationType.BEZIER))
{
	this.setTemporalEaseAtKey(newKeyIndex,myTemporalEaseIn,myTemporalEaseOut);
	this.setInterpolationTypeAtKey(newKeyIndex,myInInterpolationType,myOutInterpolationType);//補間タイプ

}
	this.setSelectedAtKey(newKeyIndex,mySelected);//選択?
//グループ閉じる
//	app.endUndoGroup();
//myDBG.push("close キーフレーム移動")

//(移動後に変化する可能性があるので)新しいキーのIndexを返す
	return newKeyIndex;
}
/*
	上のメソッドをコールするヤドカリメソッド
	指定時間が相対時間になっている
	property.shiftKey(インデックス,ずらし時間)

 */
Property.prototype.shiftKey=function(myIndex,myShift)
{
//プロパティタイプがPROPERTYの際のみ実行
	if(this.propertyType!=PropertyType.PROPERTY){return false}
//不正引数を判別
	if((! myIndex)||(this.numKeys<myIndex)||isNaN(myShift)){return false;}
//移動先が同じなら処理自体をパス
	if(! myShift){return myIndex};
	return this.moveKey(myIndex,this.keyTime(myIndex)+myShift);
}
/*
	↑このあたりのメソッドは、nasオブジェクトの実装が進んだら直撃でなくnasオブジェクト経由に書き換え予定
	2008/03/21
*/

/*		印刷用(タップ・フレームつき)コンポ作成
	印刷用のコンポは以下の基準で作成される。
	1.ルートフォルダに1カラムあたり1コンポで作成
	2.サイズは余白付きで可変余白サイズおよびタップ位置フレームサイズなどはユーザ指定
	3.コンポ名規則
		00000_Title_S-C_scID(こんなもんか?)
			例: 00012_AY12_c010_01
			カラムコレクションID	12番	(通し番号=ユニークINDEX)
			タイトルコード	AY12	たぶん作品"AY"の12話
			カット番号	10
			サブカラムID	1
	4.ビルドの際に以前のコンポがあれば削除する。
コンポを作成せずにレンダーキューのみで作成することも可能
どっちが良いか考えてみよう

とりあえず、コンポを作った方がデータの見通しがよさそうなので作る! 05・25
*/
//カラムインデックスから当該カラムの情報を返すメソッド
//キー登録されていないindexに対しては nullを返す
nas.eStoryBoard.getColumnInformation=function(columnIndex){
if(! columnIndex){columnIndex=0};
if(columnIndex>this.columnPosition.numKeys){return null;};

	var myResult=new Object();
//カラムインデックスから各情報を返す
	myResult.width		=this.targetCC.layers.byName("ColumnInformation").scale.valueAtTime(columnIndex/this.frameRate,true)[0];
	myResult.height		=this.targetCC.layers.byName("ColumnInformation").scale.valueAtTime(columnIndex/this.frameRate,true)[1];
	myResult.position	=this.targetCC.layers.byName("ColumnInformation").position.valueAtTime(columnIndex/this.frameRate,true);

	myResult.pageIndex	=this.targetCC.layers.byName("ColumnInformation").effect.Page.property(1).valueAtTime(columnIndex/this.frameRate,true);
	myResult.pageColumnIndex=this.targetCC.layers.byName("ColumnInformation").effect.ColumnIndex.property(1).valueAtTime(columnIndex/this.frameRate,false);
	myResult.pageWidth	=this.targetCC.layers.byName("ColumnInformation").effect.PageWidth.property(1).valueAtTime(columnIndex/this.frameRate,false);
	myResult.scaleOption	=this.targetCC.layers.byName("ColumnInformation").effect.ScaleFitting.property(1).valueAtTime(columnIndex/this.frameRate,false);
	myResult.subColumnIndex	=this.targetCC.layers.byName("ColumnInformation").effect.subColumnIndex.property(1).valueAtTime(columnIndex/this.frameRate,false);

	myResult.cutNo		=this.targetCC.layers.byName("CUT No.").text.sourceText.valueAtTime(columnIndex/this.frameRate,true).toString();
	myResult.contentText =this.targetCC.layers.byName("Content").text.sourceText.valueAtTime(columnIndex/this.frameRate,false).toString();
	myResult.dialogText   =this.targetCC.layers.byName("Dialog").text.sourceText.valueAtTime(columnIndex/this.frameRate,false).toString();
	myResult.time	       =this.targetCC.layers.byName("Time").text.sourceText.valueAtTime(columnIndex/this.frameRate,false).toString();

	myResult.length		=this.targetCC.layers.byName("Time").effect.length.property(1).valueAtTime(columnIndex/this.frameRate,false);

	myResult.pageNo		=this.targetCC.layer("02ページコレクション").source.layers.byName("PageIndex").text.sourceText.valueAtTime(myResult.pageIndex/this.frameRate,true).toString();

return myResult;
}
/*	カラムIDを与えて出力用コンポをルートフォルダに作成する
	フレーム等は、そのうち共通リソースとして実装するが、
	今のところデータ決め打ちでローカルオブジェクトとして実装しておく。
*/

nas.eStoryBoard.addComp4Column=function(cIdx){
	if(isNaN(cIdx)||(cIdx<0)||(cIdx>this.columnPosition.numKeys)){return false;};
	myColumn=this.getColumnInformation(cIdx);//呼び出し側でデータの処理をするなら呼び先では不要

	var myPPM=2.8346456692913385;//1mm あたりのポイント数 この機能では72dpi 固定で処理
    var myFrame=new Object();

		myFrame.width	=nas.inputMedias.selectedRecord[1]*myPPM	;//フレームサイズ dtp point
		myFrame.aspect	=eval(nas.inputMedias.selectedRecord[2])		;//メディアアスペクト 横/縦

		myFrame.height	=myFrame.width/myFrame.aspect		;//フレームサイズ 縦

		myFrame.pegType	=0	;//0:standerd	1:角あわせ	2:ダブルホール
		myFrame.pegAlignment	=[0,nas.inputMedias.selectedRecord[7]*myPPM,0]	;//フレーム中心を原点とするタップ位置
								;//[x座標,y座標,回転角]
		myFrame.margin	=[57,113]	;//mul([20,40],[myDPM,myDPM])
//						;//[left,top(,right,bottom)]

	var myPrintFrame=new Object();
//印刷用紙のスペックを定義 外部ファイルにしたいがどうかね?

/*	A3タテ
		myPrintFrame.width=810	;	//point(A3タテ)
		myPrintFrame.height=1160;	//point(A3タテ)
*/

		myPrintFrame.width=790	;	//point(A4ヨコ)
		myPrintFrame.height=560;	//point(A4ヨコ)

		
		myPrintFrame.margin=.1;	//marginRate
		myPrintFrame.rate=(1-myPrintFrame.margin);	//(1-marginRate)

//	このあたりはさらに基本オブジェクト化する予定なので注意
//	各値は文字列の予定だが、暫定的にポイントで数値化して格納しておく

	var myFormat=new Object();
		myFormat.title	=this.targetPS.layers.byName("TITLE").text.sourceText.value.toString();//タイトル
		myFormat.outputResolution	=72/2.54	;//dpcで(nas標準)
		myFormat.drawingFrame	=myFrame	;//フレームを登録
//		myFormat.pictureRate	=.94	;//スタンダードフレームに対するコンテ画面の占有率(80フレームで94%)
		myFormat.pictureRate	=1.0	;//スタンダードフレームに対するコンテ画面の占有率(80フレームで94%)

		myFormat.outputMode	=this.outputMode?this.outputMode:"printout";// "printout" or "fileonly" default "printout"

//当座はこのくらいで情報的には足りるはず
//	ファイル出力用のフラグを増設 2008/01/12

/*	コンポ名を作る	*/
if(myColumn.subColumnIndex==1 && this.getColumnInformation(cIdx+1).subColumnIndex<2){
	var myName=myFormat.title+"_"+myColumn.cutNo;
}else{
	var myName=myFormat.title+"_"+myColumn.cutNo+"_"+myColumn.subColumnIndex;
}
/*	フィットスケールのアルゴリズム
	フィットスケールオプションがカラムについている場合は、以下の手順でスケールを決定する。
	指定画面の縦横比を計算する > 横長の場合は縦幅を、縦長の場合は横幅を基準にスケールを出す。
	このため個々の自由なスケール指定はできない、大判カットはスタンダードでコンテ上に作画されていることを
	期待されている。

	このアルゴリズムは暫定なので見直しの対象です。その際はコンポ上のエクスプレッションとマッチさせる必要あり
	2007/05/27
*/

if(myColumn.scaleOption){

	var baseAspect=	this.targetPS.layers.byName("画像エリア").effect("フレーム縦横比").property("ADBE Slider Control-0001").value;
	var myAspect=	myColumn.width/myColumn.height;
	var fitScale=(myAspect<=baseAspect)?
	(myFormat.drawingFrame.width *myFormat.pictureRate)/myColumn.width:
	(myFormat.drawingFrame.height*myFormat.pictureRate)/myColumn.height;

var activeScale=fitScale;

}else{

var activeScale=(myFormat.drawingFrame.width*myFormat.pictureRate)/this.pictureArea.property("scale").value[0];//標準スケール時
}
	var myWidth=Math.ceil((myColumn.width/myFormat.pictureRate)*activeScale+(myFormat.drawingFrame.margin[0]*2));
		//コンポ横幅(ポイント計算) (カラム幅÷占有率)×スケール＋(横マージン×2)
	var myHeight=Math.ceil((myColumn.height/myFormat.pictureRate)*activeScale+(myFormat.drawingFrame.margin[1]*2));
		//コンポ高サ(ポイント計算) (カラム高÷占有率)×スケール＋(縦マージン×2)

//			//マージンにはタップの寸法が折り込み済みとする。整数化しておく。
/*
	ここで算出するコンポのサイズは、画像にタップを加え、フレームギリギリのサイズ(枚数計算のベースサイズ)
 */

//alert(myName+":"+myWidth+":"+myHeight);
//	取得したコンポサイズを出力フレームで分解する。
	//横位置1枚で収まるなら横１(分割なし)
	//縦位置1枚で収まるなら縦１(分割なし)
	//横長か縦長か...>フレームが横長か縦長は無視する
//横位置と縦位置で両方計算してラスト1枚の残面積の少ないほうをピックアップする
//（この位単純でよかろう）
//			横位置計算
var locW=new Object();
{
	locW.divWParam=((myWidth-myFormat.drawingFrame.margin[0]) -(myPrintFrame.height*myPrintFrame.margin))/(myPrintFrame.height*myPrintFrame.rate);//横占有レート
	locW.divHParam=((myHeight-myFormat.drawingFrame.margin[1])-(myPrintFrame.width *myPrintFrame.margin))/(myPrintFrame.width *myPrintFrame.rate);//縦占有レート
	locW.divLotW=Math.ceil(locW.divWParam);//横枚数
	locW.divLotH=Math.ceil(locW.divHParam);//縦枚数
}
var locF=new Object();
{
	locF.divWParam=((myWidth-myFormat.drawingFrame.margin[0]) -(myPrintFrame.width *myPrintFrame.margin))/(myPrintFrame.width *myPrintFrame.rate);//横占有レート
	locF.divHParam=((myHeight-myFormat.drawingFrame.margin[1])-(myPrintFrame.height*myPrintFrame.margin))/(myPrintFrame.height*myPrintFrame.rate);//縦占有レート
	locF.divLotW=Math.ceil(locF.divWParam);//横枚数
	locF.divLotH=Math.ceil(locF.divHParam);//縦枚数
}
//ファイルのみの出力用の仮オブジェクト(分割をしないので固定数値を与える)
var locS=new Object();
{
	locS.divWParam=1;//横占有レート
	locS.divHParam=1;//縦占有レート
	locS.divLotW=1;//横枚数
	locS.divLotH=1;//縦枚数
}
//	比較する
if(
(myPrintFrame.height*(locW.divWParam-Math.floor(locW.divWParam)))*(myPrintFrame.width*(locW.divHParam-Math.floor(locW.divHParam)))<
(myPrintFrame.width*(locF.divWParam-Math.floor(locF.divWParam)))*(myPrintFrame.height*(locW.divHParam-Math.floor(locF.divHParam)))
){
		var myLocation=locF;
			myLocation.width	=myPrintFrame.width;
			myLocation.height	=myPrintFrame.height;
	var namePrefix="_";
}else{
		var myLocation=locW;
			myLocation.width	=myPrintFrame.height;
			myLocation.height	=myPrintFrame.width;
	var namePrefix="";
}
//縦横計算のあとでファイルのみなら上書きしてしまう…野蛮
if(myFormat.outputMode!="printout"){
		var myLocation=locS;
			myLocation.width	=myWidth+144;//左右1インチずつ追加
			myLocation.height	=myHeight+72;//下側1インチ追加
	var namePrefix="";
}

//==============================================用紙位置と分割を出す。
//alert(myLocation.divWParam +": "+ myLocation.divHParam)
/*	ループしてコンポ作成	*/

var myComps=new Array();

for(var myLine=0;myLine<myLocation.divLotH;myLine++){
	for(var myCol=0;myCol<myLocation.divLotW;myCol++){

if(myLocation.divLotH==1 && myLocation.divLotW==1){var namePostfix="";}else{
	var namePostfix="["+"abcdefghijklmnopqrstuvwxyz".charAt(myLine%26)+
			"ABCDEFGHIJKLMNOPQRSTUVWXYZ".charAt(myCol%26)+"]";
//分割指標を角カッコで括る
};

targetComps=app.project.items.getByName(myName+namePostfix);

if(targetComps.length){for(var idx=targetComps.length;idx>0;idx--){targetComps[idx-1].remove();}};//あったら消しておく

//var w=(myWidth <myLocation.width	)? myWidth :myLocation.width;
//var h=(myHeight<myLocation.height	)? myHeight:myLocation.height;
	var w=myLocation.width;
	var h=myLocation.height;

	var myComp=app.project.items.addComp(namePrefix+myName+namePostfix,w,h,1,1,1);//テスト用に毎秒1コマで1フレームのコンポ
	var myOB=myComp.layers.add(this.targetOB);
		myOB.property("Anchor Point").setValue([
			Math.ceil(myCol*(myLocation.width*myPrintFrame.rate)),
			Math.ceil(myLine*(myLocation.height*myPrintFrame.rate))
		]);
		myOB.property("Position").setValue([0,0]);
		myOB.timeRemapEnabled=true;
		kid=myOB.property("Time Remap").addKey(0);//冒頭にキーはあるはずだけど、念のため
		myOB.property("Time Remap").setValueAtKey(kid,cIdx/24);//決め打ちいやなカンジ
		myOB.property("Time Remap").setInterpolationTypeAtKey(kid,KeyframeInterpolationType.HOLD);//一応

	myComps.push(myComp);//リザルトを積む
	}
}
return myComps;
}


/* push outputComp to RenderQueue
	レンダーキューへ指定されたコンポを送る。コンポの指定はコンポオブジェクト直指定
	nas.eStoryBoard.pushRQ(CompItem)
*/
nas.eStoryBoard.pushRQ=function(myComp){
var lrRQtemplate="現在の設定";
var lrOMtemplate=(app.version.match(/^6\.5\./))?"Photoshop 32-ビット":"Photoshop";
	myRQ=app.project.renderQueue.items.add(myComp);
	myRQ.applyTemplate(lrRQtemplate);
	myRQ.outputModule(1).applyTemplate(lrOMtemplate);
//	myRQ.outputModule(1).file.name="test";//ファイル名は今回は放置かも
}

//	makeAll

nas.eStoryBoard.makeAll=function(){
	for (var idx=0;idx<this.columnPosition.numKeys;idx++){
		var addedComps=this.addComp4Column(idx);

		for(var idc=0;idc<addedComps.length;idc++){
			this.pushRQ(addedComps[idc]);
		}
	}
}

//ルートフォルダのコンポを全削除
nas.eStoryBoard.clearAll=function(){
	for(var idx=app.project.item(1).parentFolder.items.length;idx>0;idx--){
		if(app.project.item(1).parentFolder.items[idx] instanceof CompItem){
			app.project.item(1).parentFolder.items[idx].remove();
		}
	}
}
// 
if(false){
nas.eStoryBoard.toString=function(myMode){
	if(! myMode) myMode="cTotal";
	var myResult="";
	var previewPageIndex=0;
	var previewCutNo="";

	switch(myMode){
case	"normal":
default	:
		for (var idx=0;idx<this.columnPosition.numKeys;idx++){
			myColumnInfo=this.getColumnInformation(idx)
			if(myColumnInfo.pageIndex!=previewPageIndex){
				myResult +="\#"+nas.GUI.LineFeed;
			}
			if(myColumnInfo.cutNo!=previewCutNo){
				myTime=myColumnInfo.time;
			}else{
				myTime="";
			}
			myResult += nas.Zf(idx,3)
				+"\t"+myColumnInfo.pageIndex
				+"\t"+myColumnInfo.pageColumnIndex
				+"\tC\#"+myColumnInfo.cutNo
				+"\t\("+myTime+"\)"
				+nas.GUI.LineFeed;
			previewPageIndex=myColumnInfo.pageIndex;
			previewCutNo=myColumnInfo.cutNo;
		}
	}
return myResult;
}
}

/*
	バルクのXPSを作成するスクリプト
*/

//xpsio.jsが必要 

//ファイル操作があるのでAE等のAdobeScript環境必須

//面倒臭いので一時処理版にする。コンテデータプロジェクトから実行の事

//この関数の一部で良さそう?
nas.eStoryBoard.toString=function(myArg){
	if(! myArg){var myMode="csv"};
	if((! myArg)||(myArg.match(/csv|cTotal/i))) {
		myMode="csv";//引数ない時は cTotal互換で全カットを一覧
	}else{
		myMode="XPS";//それ以外は、引数をカット番号(名)とみなしてXPSデータを書き出す。
		var myCutNo=myArg.toString();//文字列化しておく。
	};

	var myResult="";
	var previewPageIndex=0;
	var previewCutNo="";

	switch(myMode){
case	"XPS":
//XPSモードの時はカット番号(名)で指定したカットのみを返す仕様。
//1カットごとにこの関数をコールする。
	var buildXPS	=false;//処理フラグ
	var myAbort	=false;//処理終了フラグ
		for (var idx=0;idx<this.columnPosition.numKeys;idx++){
var currentCutNo =this.targetCC.layers.byName("CUT No.").text.sourceText.valueAtTime(idx/this.frameRate,true).toString();
			if((! buildXPS)&&(currentCutNo==myCutNo)){
//					カット番号がマッチした時に処理開始
//			同一カットナンバーがあった場合にマージされないように
//			先に1カット処理した時点で終了フラグ立てる。
			myColumnInfo=this.getColumnInformation(idx);//取得
				buildXPS=true;
				var myLength=myColumnInfo.length;//カット尺取得(整数値コマ数)
				var myLayers=1;//コンテ撮なので重ね枚数は1固定
				var columnCount=0;//
			}
			if(buildXPS){
//処理フラグが立っている場合のみ情報を収集
				if(currentCutNo==myCutNo){
//終了判定
					columnCount++;//カラム数(画像枚数)を集計
				}else{
					break;
				}
			}
		};
		//収集した情報でXPSを初期化してリザルトを作る;
		var myXps=new Xps(myLayers,myLength);
//				clearOutput();
//				writeLn(myLayers+":"+myLength);//
			myXps.init(myLayers,myLength);//

//			myXps.opus="";
			myXps.title=this.targetPS.layers.byName("TITLE").text.sourceText.value.toString();
//			myXps.subtitle="";
//			myXps.scene="";
			myXps.cut=myCutNo;
//			myXps.trin=;
//			myXps.trout=;
			myXps.framerate=this.frameRate;
			myXps.memo=columnCount.toString();
		myResult=myXps.toString();
	break;
case    "csv":
 	myResult +='"index","pageIndex","pageColumnIndex","cutIndex","cutNo.","pictureIndex","contentText","dialogText","timeText"'+nas.GUI.LineFeed;
      var cutIndex=0;
        for (var idx=0;idx<this.columnPosition.numKeys;idx++){
			myColumnInfo=this.getColumnInformation(idx)
			if(myColumnInfo.cutNo!=previewCutNo){	cutIndex++	}
			
/*			if(myColumnInfo.cutNo!=previewCutNo){
				myTime=myColumnInfo.time;
			}else{
				myTime="";
			}*/
				myTime=myColumnInfo.time;

			myResult += '"'+nas.Zf(idx,3) +'",';//keyIndex
			myResult += '"'+myColumnInfo.pageIndex+'",';//pageIndex
			myResult += '"'+myColumnInfo.pageColumnIndex+'",';//pageColumnIndex
			myResult += '"'+cutIndex+'",';//cutIndex
			myResult += '"'+myColumnInfo.cutNo+'",';//cutNo.
              myResult += '"'+nas.Zf(myColumnInfo.pageIndex,3)+"_"+nas.Zf(myColumnInfo.pageColumnIndex,2)+"_"+myColumnInfo.cutNo+"_"+myColumnInfo.subColumnIndex+"_"+nas.Zf(idx,3)+'",';//pictureIndex
//              myResult += '"'+(myColumnInfo.contentText)+'",';//contentText
//              myResult += '"'+(myColumnInfo.dialogText)+'",';//dialogText
              myResult += '"'+encodeURI(myColumnInfo.contentText)+'",';//contentText URIencoded
              myResult += '"'+encodeURI(myColumnInfo.dialogText)+'",';//dialogText URIencoded
			myResult += '"'+myTime+'"';
			myResult += nas.GUI.LineFeed;
			previewPageIndex=myColumnInfo.pageIndex;
			previewCutNo=myColumnInfo.cutNo;
		}
    break;
case	"normal":
case	"cTotal":
default	:
		for (var idx=0;idx<this.columnPosition.numKeys;idx++){
			myColumnInfo=this.getColumnInformation(idx)
			if(myColumnInfo.pageIndex!=previewPageIndex){
				myResult +="\#"+nas.GUI.LineFeed;
			}
			
/*			if(myColumnInfo.cutNo!=previewCutNo){
				myTime=myColumnInfo.time;
			}else{
				myTime="";
			}*/
				myTime=myColumnInfo.time;

			myResult += nas.Zf(idx,3)
				+"\t"+myColumnInfo.pageIndex
				+"\t"+myColumnInfo.pageColumnIndex
				+"\tC\#"+myColumnInfo.cutNo
				+"\t\("+myTime+"\)"
				+nas.GUI.LineFeed;
			previewPageIndex=myColumnInfo.pageIndex;
			previewCutNo=myColumnInfo.cutNo;
		}
	}
return myResult;
}

/*
	カラムコレクションのカラム削除

	eStoryBoard.deleteColumn(columnIndex integer,length integer,compLength bool)
	指定カラムインデックスから後方へlength分の登録を削除
	指定省略時はタイムマーカーのあるIndex
	length省略時は 1カラム消去
	compLength オプションで操作分のフレームをコンポの継続時間から削除 デフォルトはtrue
 */
//当該時間にカラムの登録があれば削除して 後方のカラムをすべて前方へ移動
//カラムコレクションの継続時間を1フレーム分詰める
//
//カラム登録があるか否かは ColumnInformation の position タイムラインのキーで判別
/*
操作対象となるタイムライン一覧
	ローテーションは対象にしたくないのでエクスプレッションで固定
ColumnInformation
	Page	nas.eStoryBoard.pageIndex
	ScaleFitting	nas.eStoryBoard.scaleFit
	position	nas.eStoryBoard.columnPosition	(カラム登録の本体キー)
	scale	nas.eStoryBoard.columnScale
Time
	text.sourceText	nas.eStoryBoard.timeText
CUT No.
	text.sourceText	nas.eStoryBoard.cutNumber
Content
	text.sourceText	nas.eStoryBoard.contentText
Dialog
	text.sourceText nas.eStoryBoard.soundText
 */
//カラムの消去
nas.eStoryBoard.removeColumn=function(myIndex)
{
//エントリーインデックスで指定された時間位置にキーが存在する場合のみそのキーを削除する
	var targetTime=myIndex*this.targetCC.frameDuration;
//これが指定時間 ただしAEの計算誤差があるので一致判定は注意
//一致判定は keyTime()で得た時間をフレームに再評価してから操作すること
	var targetProps=["columnPosition","columnScale","pageIndex","scaleFit","timeText","cutNumber","contentText","soundText"]
	for (var idx=0;idx<targetProps.length;idx++){
		var targetProp=this[targetProps[idx]];
if(targetProp.numKeys){
		var targetKeyIndex=targetProp.nearestKeyIndex(targetTime);//最も近接したキーのインデックス
//	alert(myIndex +":"+targetKeyIndex +":"+ targetProp.keyTime(targetKeyIndex));
		if(Math.round(targetProp.keyTime(targetKeyIndex)/nas.eStoryBoard.targetCC.frameDuration)==myIndex)
		{
			targetProp.removeKey(targetKeyIndex);
		}
};//プロパティにキーがなければスキップ
	}
}

//尺変更を含むカラム削除
nas.eStoryBoard.deleteColumn=function(myIndex,myLength,compOption)
{
	if(! myIndex){myIndex=Math.round(this.targetCC.time/this.targetCC.frameDuration);};
	if(! myLength){myLength=1;};
	if(compOption==undefined){compOption=true}

//	app.beginUndoGroup("カラム削除")
//myDBG.push("open カラム削除")

	for(var idx=0;idx<myLength;idx++)
	{
//				指定分のキーを削除
		this.removeColumn(myIndex+idx);
	}
var targetProps=["columnPosition","columnScale","pageIndex","scaleFit","timeText","cutNumber","contentText","soundText"]
var targetTime=myIndex*this.targetCC.frameDuration;
//	ターゲットプロパティの後方キーをすべて移動(前から順)
	for(var idx=0;idx<targetProps.length;idx++)
	{
		var targetProp=this[targetProps[idx]];
//ターゲットタイムラインのキーを前方から総当たりで 時間より大きければ前方へ移動
if(targetProp.numKeys){
		for(var kidx=1;kidx<=targetProp.numKeys;kidx++){
			if(targetProp.keyTime(kidx)>targetTime)
			{
//				alert(kidx);
				targetProp.shiftKey(kidx,-1*myLength*this.targetCC.frameDuration);
			}
		}
};//キーがないプロパティは、関係ないので無視
	}
//フラグが立っていたらコンポの尺を変更
	if(compOption){this.targetCC.setFrames(Math.round(this.targetCC.duration/this.targetCC.frameDuration)-myLength);};

//	app.endUndoGroup();
//myDBG.push("close カラム削除")
}
/*	カラム挿入操作
	eStoryBoard.insertColumn(columnIndex integer,length integer,compLength bool)
	指定カラムインデックスの後方へlength分のカラ登録を追加(指定カラムの登録が伸展)
	columnIndex省略時はタイムマーカーのあるIndex
	length省略時は 1カラム挿入
	compLength オプションで操作分のフレームをコンポの継続時間に追加 デフォルトはtrue
 */
//当該時間以降のカラム登録が存在する場合は すべて後方へ1フレームずつ移動
nas.eStoryBoard.insertColumn=function(myIndex,myLength,compOption)
{
	if(! myIndex){myIndex=Math.round(this.targetCC.time/this.targetCC.frameDuration);};
	if(! myLength){myLength=1;};
	if(compOption==undefined){compOption=true}
//Undo立ち上げ
	app.beginUndoGroup("空白カラム挿入");
myDBG.push("open 空白カラム挿入ins");
//フラグが立っていたらコンポの尺を変更
	if(compOption){this.targetCC.setFrames(Math.round(this.targetCC.duration/this.targetCC.frameDuration)+myLength);};
var targetProps=["columnPosition","columnScale","pageIndex","scaleFit","timeText","cutNumber","contentText","soundText"]
var targetTime=myIndex*this.targetCC.frameDuration;
//	ターゲットプロパティの後方キーをすべて移動(うしろから順)
	for(var idx=0;idx<targetProps.length;idx++)
	{
		var targetProp=this[targetProps[idx]];
if(targetProp.numKeys){
//ターゲットタイムラインのキーを前方から総当たりで 時間より大きければ後方へ移動
		for(var kidx=targetProp.numKeys;kidx>0;kidx--){
			if(targetProp.keyTime(kidx)>targetTime){targetProp.shiftKey(kidx,myLength*this.targetCC.frameDuration);};
		}
};//キーがなければ処理不要
	}
//フラグがあればアウトポイントをコンポの終了点に合わせる(トライか?)
	if(compOption){
		var targetLayers=["ColumnInformation","Time","CUT No.","Content","Dialog","ColumnIndex","カラムセレクタ","02ページコレクション"]
		for(var lidx=0;lidx<targetLayers.length;lidx++){
			var myLocked=this.targetCC.layer(targetLayers[lidx]).locked;
			if(myLocked){this.targetCC.layer(targetLayers[lidx]).locked=false;};//ターゲットがロックされていたら解除
			this.targetCC.layer(targetLayers[lidx]).outPoint=this.targetCC.duration;//こんなもんか?
		;//ターゲットのロック状態を復帰
			this.targetCC.layer(targetLayers[lidx]).locked=myLocked;
		}
	}
	app.endUndoGroup();
myDBG.push("close 空白カラム挿入ins");
}

