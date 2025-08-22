/*

簡易版トレース抽出

	手順
不透明度をチェック−１００％以外なら値を控えてリセット
HSLにコンバート
以下に割り付けられる
H → R
S → G
L → B
レイヤーを比較明で合成　
モノクロ化する				無彩色部分が残る

反転してモノクロ化する		有彩色部分が残る
不透明度を復帰
*/
if(app.documents.length){
var traceK	= function(){
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
// =======================================================モノクロ化しきい値 64/256 154/256
	app.activeDocument.activeLayer.threshold(64);
// ===　下のレイヤと結合(レイヤーマージ)
	app.activeDocument.activeLayer.merge();
// ===  彩度を下げる
app.activeDocument.activeLayer.mixChannels(
	[
		[21, 72, 7, 0],
		[21, 72, 7, 0],
		[21, 72, 7, 0]
	],
	false
);
// === opacity
if (opst < 100) app.activeDocument.activeLayer.opacity = opst;
}
var myAction = 'traceK();';
var myUndo = 'traceK';

var canStart = (app.activeDocument.mode==DocumentMode.RGB);
	if(canStart){

if(app.activeDocument.suspendHistory){app.activeDocument.suspendHistory(myUndo,myAction)}else{evel(myAction)}
	}else{
	alert(localize({en:"The document is not in RGB mode.",ja:"ドキュメントがRGBモードではありません。"}));
	}
}else{
    alert("this is no Document")
}