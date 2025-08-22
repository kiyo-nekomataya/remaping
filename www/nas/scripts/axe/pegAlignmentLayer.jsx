/*(回転アライメントX)
マーカーを参照して任意の中心点でターゲットのレイヤーを回転させる
中心点マーカーは /Frames/pegレイヤーの中心点
回転マーカーは /Frames/merker
ターゲットレイヤーは /Frames レイヤセットを除く最上位の表示レイヤ
pegAlignmentLayer
MacとWindowsでダイアログのボタン配置が逆なので判定して調整

ものさしツールとドキュメントの回転を連続して操作すると
同様の操作をPhotoshopの機能で行うことが可能。
ただし、その機能を使うと、水平補正と垂直補正が自動認識なので
45度を超える補正はできない。

レイヤセットの最上位にフォーカスが移る問題を調整
仮レイヤ削除のタイミングで自動的にフォーカスが移動してかつその後スクリプトからのアクセスができない様なので
削除前に先にアクティブであったレイヤの直上に移動するルーチンを追加 2011/12/03
*/
var isWindows=($.os.match(/windows/i))?true:false;

//AE ExpressionOtherMath 互換 角度<>ラジアン変換関数
//桁切らないほうが良いかも、運用してみて判断しましょう 2006/06/23
function degreesToRadians(degrees){
	return Math.floor((degrees/180.)*Math.PI*100000000)/100000000;
}
function radiansToDegrees(radians){
	return Math.floor(180. * (radians/Math.PI)* 100000)/100000;
}

//ターゲットドキュメントを選択
//Frames/ _*/以外のレイヤーセットを上位から検索して最初にヒットした表示されれている画像レイヤをアクティベートする
//レイヤーセットは対象外
var activateTargetVisibleLayer = function(prnt){

	var result = null;
	if(!(prnt.layers)) return result;
	for (var i = 0 ; i < prnt.layers.length ; i ++){
		if(prnt.layers[i] instanceof LayerSet){
			if((!(prnt.layers[i].visible))||
				(prnt.layers[i].name.match(/^_.*|frames/i))){
				continue;
			}else{
				result = activateTargetVisibleLayer(prnt.layers[i]);
				if(result) break;// return result;
			};
		}else if(prnt.layers[i] instanceof ArtLayer){
			if(prnt.layers[i].visible){
				activeDocument.activeLayer = prnt.layers[i];
				result = prnt.layers[i];
				break;
			};
		};
	};
	return result;
}
//回転中心座標 = ペグレイヤー(センターピン)の中心座標
//バウンディングボックスを取得してセンターを得る
var myPegLayer = app.activeDocument.layers.getByName('Frames').layers.getByName('peg');
//センタが得られない場合はドキュメントの中心を利用する?
if(! myPegLayer) myPegLayer = {bounds:[0,0,0,0]};
var center = [
	(myPegLayer.bounds[0]+myPegLayer.bounds[2])/2,
	(myPegLayer.bounds[1]+myPegLayer.bounds[3])/2
];
var markerLayer = app.activeDocument.layers.getByName('Frames').layers.getByName('marker');
//マーカーレイヤが得られない場合は、アクティブレイヤーの中心を利用する
if(! markerLayer) markerLayer = app.activeDocument.activeLayer;
var mark = [
	(markerLayer.bounds[0]+markerLayer.bounds[2])/2,
	(markerLayer.bounds[1]+markerLayer.bounds[3])/2
];

var anchorX = center[0].as('px');
var anchorY = center[1].as('px');
var markX   = mark[0].as('px');
var markY   = mark[1].as('px');

var myAngle = 180-radiansToDegrees(Math.atan2((anchorY-markY),(anchorX-markX)));
if(mark[0] < center[0]) myAngle += 180;
//alert(center.toString());
//alert(myAngle);

if(activateTargetVisibleLayer(activeDocument)){
var idTrnf = charIDToTypeID( "Trnf" );
    var desc17 = new ActionDescriptor();
    var idnull = charIDToTypeID( "null" );
        var ref9 = new ActionReference();
        var idLyr = charIDToTypeID( "Lyr " );
        var idOrdn = charIDToTypeID( "Ordn" );
        var idTrgt = charIDToTypeID( "Trgt" );
        ref9.putEnumerated( idLyr, idOrdn, idTrgt );
    desc17.putReference( idnull, ref9 );
    var idFTcs = charIDToTypeID( "FTcs" );
    var idQCSt = charIDToTypeID( "QCSt" );
    var idQcsi = charIDToTypeID( "Qcsi" );
    desc17.putEnumerated( idFTcs, idQCSt, idQcsi );
    var idPstn = charIDToTypeID( "Pstn" );
        var desc18 = new ActionDescriptor();
        var idHrzn = charIDToTypeID( "Hrzn" );
        var idPxl = charIDToTypeID( "#Pxl" );
        desc18.putUnitDouble( idHrzn, idPxl, anchorX);
        var idVrtc = charIDToTypeID( "Vrtc" );
        var idPxl = charIDToTypeID( "#Pxl" );
        desc18.putUnitDouble( idVrtc, idPxl, anchorY );
    var idPnt = charIDToTypeID( "Pnt " );
    desc17.putObject( idPstn, idPnt, desc18 );
    var idOfst = charIDToTypeID( "Ofst" );
        var desc19 = new ActionDescriptor();
        var idHrzn = charIDToTypeID( "Hrzn" );
        var idPxl = charIDToTypeID( "#Pxl" );
        desc19.putUnitDouble( idHrzn, idPxl, 0.000000 );
        var idVrtc = charIDToTypeID( "Vrtc" );
        var idPxl = charIDToTypeID( "#Pxl" );
        desc19.putUnitDouble( idVrtc, idPxl, 0.000000 );
    var idOfst = charIDToTypeID( "Ofst" );
    desc17.putObject( idOfst, idOfst, desc19 );
    var idAngl = charIDToTypeID( "Angl" );
    var idAng = charIDToTypeID( "#Ang" );
    desc17.putUnitDouble( idAngl, idAng, myAngle );
    var idIntr = charIDToTypeID( "Intr" );
    var idIntp = charIDToTypeID( "Intp" );
    var idBcbc = charIDToTypeID( "Bcbc" );
    desc17.putEnumerated( idIntr, idIntp, idBcbc );
executeAction( idTrnf, desc17, DialogModes.NO );
};