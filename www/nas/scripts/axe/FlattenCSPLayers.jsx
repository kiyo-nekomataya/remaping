// enable double clicking from the Macintosh Finder or the Windows Explorer
// #target photoshop
/*
 *	選択したフォルダ配下のレイヤーセットを結合
 *	透明部分を白で塗りつぶすスクリプト
 *	クリスタのレイヤーを書き出しのためにpsAxeタイプのレイヤーに変換
 *	処理する目的レイヤーをアクティブにした状態で実行すると
 *	現在のアクティブレイヤーの親のアイテムすべてに対して実行
 */
var tgtSet = activeDocument.activeLayer.parent;
var myLayers = [];
for (var i = 0 ; i < tgtSet.layers.length ; i ++){
	if((tgtSet.layers[i].typename == 'ArtLayer')||(tgtSet.layers[i].typename == 'LayerSet')) myLayers.push(tgtSet.layers[i]);
};
//個別処理メソッド 統合と塗りつぶしを行う
var myExecute = "for(var ix=0;ix<myLayers.length;ix ++){app.activeDocument.activeLayer=myLayers[ix];if(app.activeDocument.activeLayer.typename =='LayerSet')app.activeDocument.activeLayer.merge();app.activeDocument.selection.selectAll();RGBColor=new SolidColor();RGBColor.red=255;RGBColor.green=255;RGBColor.blue=255;app.activeDocument.selection.fill(RGBColor,ColorBlendMode.DARKEN,100,false);}";
//実行
	activeDocument.suspendHistory("クリスタの原稿を平坦化",myEexcute);

