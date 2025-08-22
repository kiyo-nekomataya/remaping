/*

簡易版トレース抽出

	手順
HSLにコンバート
以下に割り付けられる
H → R
S → G
L → B
レイヤーを比較明で合成　
モノクロ化する				無彩色部分が残る

反転してモノクロ化する		有彩色部分が残る
*/
if(app.documents.length){
var traceKC	= function(){
	var opst = app.activeDocument.activeLayer.opacity;
	if(opst < 100) app.activeDocument.activeLayer.opacity = 100;

	var duplicated_1 = app.activeDocument.activeLayer.duplicate();//
	var duplicated_2 = app.activeDocument.activeLayer.duplicate();//duplicate
	var duplicated_3 = app.activeDocument.activeLayer.duplicate();//duplicate

	app.activeDocument.activeLayer = duplicated_1;//activate_1
	duplicated_1.blendMode = BlendMode.LIGHTEN;//mode lighten
// =======================================================チャンネルコンバートフィルタ
	var idHsbP = charIDToTypeID( "HsbP" );
    	var descHsbP = new ActionDescriptor();
    	var idInpt = charIDToTypeID( "Inpt" );
    	var idClrS = charIDToTypeID( "ClrS" );
    	var idRGBC = charIDToTypeID( "RGBC" );
    	descHsbP.putEnumerated( idInpt, idClrS, idRGBC );
    	var idOtpt = charIDToTypeID( "Otpt" );
    	var idClrS = charIDToTypeID( "ClrS" );
    	var idHSLC = charIDToTypeID( "HSLC" );
    	descHsbP.putEnumerated( idOtpt, idClrS, idHSLC );
	executeAction( idHsbP, descHsbP, DialogModes.NO );
// =======================================================モノクロ化しきい値 64/256 154/256
	app.activeDocument.activeLayer.threshold(64);
// ===　下のレイヤと結合(レイヤーマージ)1>2
	app.activeDocument.activeLayer.merge();
	app.activeDocument.activeLayer.blendMode = BlendMode.DARKEN;//mode darken

	app.activeDocument.activeLayer = duplicated_3;//activate_3
	duplicated_3.blendMode = BlendMode.LIGHTEN;//mode lighten
// =======================================================チャンネルコンバートフィルタ
	var idHsbP = charIDToTypeID( "HsbP" );
    	var descHsbP = new ActionDescriptor();
    	var idInpt = charIDToTypeID( "Inpt" );
    	var idClrS = charIDToTypeID( "ClrS" );
    	var idRGBC = charIDToTypeID( "RGBC" );
    	descHsbP.putEnumerated( idInpt, idClrS, idRGBC );
    	var idOtpt = charIDToTypeID( "Otpt" );
    	var idClrS = charIDToTypeID( "ClrS" );
    	var idHSLC = charIDToTypeID( "HSLC" );
    	descHsbP.putEnumerated( idOtpt, idClrS, idHSLC );
	executeAction( idHsbP, descHsbP, DialogModes.NO );
// レイヤーの階調を反転
	app.activeDocument.activeLayer.adjustLevels(0,255,1,255,0);
// =======================================================モノクロ化しきい値 64/256 154/256
	app.activeDocument.activeLayer.threshold(64);
// ===　下のレイヤと結合(レイヤーマージ)3>org
	app.activeDocument.activeLayer.merge();

	app.activeDocument.activeLayer = duplicated_2;//activate_2
// ===　下のレイヤと結合(レイヤーマージ)2>org
	app.activeDocument.activeLayer.merge();
// === opacity
if (opst < 100) app.activeDocument.activeLayer.opacity = opst;
}
var myAction = 'traceKC();';
var myUndo = 'traceKC';

var canStart = (app.activeDocument.mode==DocumentMode.RGB);
	if(canStart){

if(app.activeDocument.suspendHistory){app.activeDocument.suspendHistory(myUndo,myAction)}else{evel(myAction)}
	}else{
	alert(localize({en:"The document is not in RGB mode.",ja:"ドキュメントがRGBモードではありません。"}));
	}
}else{
    alert("this is no Document")
}