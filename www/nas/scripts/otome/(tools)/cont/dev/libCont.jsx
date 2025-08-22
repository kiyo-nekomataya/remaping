/*(forCont)
	コンテ分解モジュールの為の各種拡張メソッド
	汎用性のたかそうなメソッドは後で乙女に引越
*/
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
	myResult.width		=this.targetCC.layers.byName("ColumnInformation").scale.valueAtTime(columnIndex/24,true)[0];
	myResult.height		=this.targetCC.layers.byName("ColumnInformation").scale.valueAtTime(columnIndex/24,true)[1];
	myResult.position	=this.targetCC.layers.byName("ColumnInformation").position.valueAtTime(columnIndex/24,true);

	myResult.pageIndex	=this.targetCC.layers.byName("ColumnInformation").effect.Page.property(1).valueAtTime(columnIndex/24,true);
	myResult.pageColumnIndex=this.targetCC.layers.byName("ColumnInformation").effect.ColumnIndex.property(1).valueAtTime(columnIndex/24,false);
	myResult.pageWidth	=this.targetCC.layers.byName("ColumnInformation").effect.PageWidth.property(1).valueAtTime(columnIndex/24,false);
	myResult.scaleOption	=this.targetCC.layers.byName("ColumnInformation").effect.ScaleFitting.property(1).valueAtTime(columnIndex/24,false);
	myResult.subColumnIndex	=this.targetCC.layers.byName("ColumnInformation").effect.subColumnIndex.property(1).valueAtTime(columnIndex/24,false);

	myResult.cutNo		=this.targetCC.layers.byName("CUT No.").text.sourceText.valueAtTime(columnIndex/24,true).toString();
	myResult.time		=this.targetCC.layers.byName("Time").text.sourceText.valueAtTime(myResult.pageIndex/24,true).toString();

	myResult.pageNo		=this.targetPC.layers.byName("PageIndex").text.sourceText.valueAtTime(myResult.pageIndex/24,true).toString();

return myResult;
}
/*	カラムIDを与えて出力用コンポをルートフォルダに作成する
	フレーム等は、そのうち共通リソースとして実装するが、
	今のところデータ決め打ちでローカルオブジェクトとして実装しておく。
*/

nas.eStoryBoard.addComp4Column=function(cIdx){
	if(isNaN(cIdx)||(cIdx<0)||(cIdx>this.columnPosition.numKeys)){return false;};
	myColumn=this.getColumnInformation(cIdx);//呼び出し側でデータの処理をするなら呼び先では不要

	var myDPM=2.8346456692913385;//1mm あたりのポイント数
	var myFrame=new Object();
		myFrame.width	=225*myDPM	;//フレームサイズ dtp point
		myFrame.aspect	=4/3		;//メディアアスペクト 横/縦
		myFrame.height	=myFrame.width/myFrame.aspect		;//フレームサイズ 縦

		myFrame.pegType	=0	;//0:standerd	1:角あわせ	2:ダブルホール
		myFrame.pegAlignment	=[0,120*myDPM,0]	;//フレーム中心を原点とするタップ位置
								;//[x座標,y座標,回転角]
		myFrame.margin	=[57,113]	;//mul([20,40],[myDPM,myDPM])
//						;//[left,top(,right,bottom)]

	var myPrintFrame=new Object();
		myPrintFrame.width=810	;	//point
		myPrintFrame.height=1160;	//point
		
		myPrintFrame.margin=.1;	//marginRate
		myPrintFrame.rate=(1-myPrintFrame.margin);	//(1-marginRate)

//	このあたりはさらに基本オブジェクト化する予定なので注意
//	各値は文字列の予定だが、暫定的にポイントで数値化して格納しておく

	var myFormat=new Object();
		myFormat.title	=this.targetPS.layers.byName("TITLE").text.sourceText.value.toString();//タイトル
		myFormat.outputResolution	=72/2.54	;//dpcで(nas標準)
		myFormat.drawingFrame	=myFrame	;//フレームを登録
		myFormat.pictureRate	=.94	;//スタンダードフレームに対するコンテ画面の占有率(80フレームで94%)


//当座はこのくらいで情報的には足りるはず
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

	var baseAspect=	this.targetPS.layers.byName("画像エリア").effect("フレーム縦横比").property("スライダ").value;
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
//==============================================用紙位置と分割を出す。
//alert(myLocation.divWParam +": "+ myLocation.divHParam)
/*	ループしてコンポ作成	*/

var myComps=new Array();

for(var myLine=0;myLine<myLocation.divLotH;myLine++){
	for(var myCol=0;myCol<myLocation.divLotW;myCol++){

if(myLocation.divLotH==1 && myLocation.divLotW==1){var namePostfix="";}else{
	var namePostfix="abcdefghijklmnopqrstuvwxyz".charAt(myLine%26)+
			"ABCDEFGHIJKLMNOPQRSTUVWXYZ".charAt(myCol%26);
};

targetComps=app.project.items.getByName(myName+namePostfix);

if(targetComps.length){for(var idx=targetComps.length;idx>0;idx--){targetComps[idx-1].remove();}};//あったら消しておく

//var w=(myWidth <myLocation.width	)? myWidth :myLocation.width;
//var h=(myHeight<myLocation.height	)? myHeight:myLocation.height;
	var w=myLocation.width;
	var h=myLocation.height;

	var myComp=app.project.items.addComp(namePrefix+myName+namePostfix,w,h,1,1,1);//テスト用に毎秒1コマで1フレームのコンポ
	var myOB=myComp.layers.add(this.targetOB);
		myOB.property("anchorPoint").setValue([
			Math.ceil(myCol*(myLocation.width*myPrintFrame.rate)),
			Math.ceil(myLine*(myLocation.height*myPrintFrame.rate))
		]);
		myOB.property("position").setValue([0,0]);
		myOB.timeRemapEnabled=true;
		kid=myOB.property("timeRemap").addKey(0);//冒頭にキーはあるはずだけど、念のため
		myOB.property("timeRemap").setValueAtKey(kid,cIdx/24);//決め打ちいやなカンジ
		myOB.property("timeRemap").setInterpolationTypeAtKey(kid,KeyframeInterpolationType.HOLD);//一応

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
var lrOMtemplate="Photoshop 32-ビット";
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
