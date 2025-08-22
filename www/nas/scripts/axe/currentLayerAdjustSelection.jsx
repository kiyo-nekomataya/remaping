/*(現在のレイヤー位置合わせ)
currentLayerAdjustSelection.jsx

現在の選択範囲の中央にアクティブレイヤーの中央部を配置する
レイヤー位置合わせ操作
ターゲットレイヤーが背景レイヤー出会った場合は通常レイヤーに変更する
*/

var destinationBounds = app.activeDocument.selection.bounds;//スクリプト実行時の選択範囲を記録
var activeLayer = app.activeDocument.activeLayer;//アクティブレイヤを控える

var targetLayer = activeLayer;
if(targetLayer.isBackgroundLayer) targetLayer.isBackgroundLayer = false;

if((destinationBounds)&&(!(targetLayer.isbackgroundlayer))){
	app.activeDocument.selection.deselect();//解除
	var	targetBounds = targetLayer.bounds;
	targetLayer.translate(
		((destinationBounds[0]+destinationBounds[2]) / 2)-((targetBounds[0]+targetBounds[2]) / 2),
		((destinationBounds[1]+destinationBounds[3]) / 2)-((targetBounds[1]+targetBounds[3]) / 2)
	);
//	activeDocument.selection.select(destinationBounds);//復帰
};
/*
	依存Libraryなし　単独実行可能　Adobe Photoshop専用
*/