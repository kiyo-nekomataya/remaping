//shiftLyersB.jsx レイヤセットのメンバーを下方向シフトする
	//選択レイヤ取得
if(app.documents.length){
var myUndo=localize({en:"Shift downward",ja:"下シフト"});varmyAction="";
/*
	ターゲットになるセットを確定
	選択レイヤが第一階層でかつレイヤセットだった場合はフォールダウンして操作対象を一階層下げる
	フォールダウンの条件は
	第一階層直下
	レイヤセット
	名称が /^Frames?|^_|^\d/i 以外
*/
var myDocLayers=(
 (app.activeDocument.activeLayer.parent.typename=="Document") &&
 (app.activeDocument.activeLayer.typename=="LayerSet")&&
 (!(app.activeDocument.activeLayer.name.match(/^Frames?|^_|^\d/i)))
 )? app.activeDocument.activeLayer:app.activeDocument.activeLayer.parent;
/*
	操作対象エントリは 
	ターゲット内の上から排除エントリを取得して最上位挿入位置を得る
*/ 
var xLinks=(myDocLayers.xLinks)? myDocLayers.xLinks:[];//プロパティがない場合は初期値で
 var subMotionLayers=new Array();
 if((myDocLayers.typename!="Document")&&(xLinks.length)){
	for(var ix=0;ix<xLinks.length;ix++){if(app.activeDocument.layers[xLinks[ix]]===myDocLayers){continue}
		subMotionLayers.push(app.activeDocument.layers[xLinks[ix]])
	}
}
//選択レイヤが第一階層でかつレイヤセットだった場合はフォールダウンして操作対象を一階層下げる（この操作ミスは良くするのでトラップしておく）　フォールダウンが入ってレイヤ数0のトレーラーを操作する可能性が出たのでさらにトラップ
myAction="if(myDocLayers.layers.length>1){var mxId=myDocLayers.layers.length-1; app.activeDocument.activeLayer=myDocLayers.layers[mxId];myDocLayers.layers[mxId].move(myDocLayers.layers[0],ElementPlacement.PLACEBEFORE);if(subMotionLayers.length){for(var lx=0;lx<subMotionLayers.length;lx++){if(subMotionLayers[lx].layers.length){subMotionLayers[lx].layers[subMotionLayers[lx].layers.length-1].move(subMotionLayers[lx].layers[0],ElementPlacement.PLACEBEFORE);}}}}";
if(app.activeDocument.suspendHistory){app.activeDocument.suspendHistory(myUndo,myAction)}else{eval(myAction)}
}