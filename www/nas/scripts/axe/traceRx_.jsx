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
var traceRx	= function(){
	var opst = app.activeDocument.activeLayer.opacity;
	if(opst < 100) app.activeDocument.activeLayer.opacity = 100;
	var duplicated = app.activeDocument.activeLayer.duplicate();//duplicate
	duplicated.name = 'duplicated';//rename
	app.activeDocument.activeLayer = duplicated;//activate
	duplicated.blendMode = BlendMode.LIGHTEN;//mode lighten
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
	app.activeDocument.activeLayer.threshold(128);
// ===　下のレイヤと結合(レイヤーマージ)
	app.activeDocument.activeLayer.merge();
// === opacity
	if (opst < 100) app.activeDocument.activeLayer.opacity = opst;
}
var myAction = 'traceRx();';
var myUndo = 'traceRx';

var canStart = (app.activeDocument.mode==DocumentMode.RGB);
	if(canStart){

if(app.activeDocument.suspendHistory){app.activeDocument.suspendHistory(myUndo,myAction)}else{evel(myAction)}
	}else{
	alert(localize({en:"The document is not in RGB mode.",ja:"ドキュメントがRGBモードではありません。"}));
	}
}else{
    alert("this is no Document")
}