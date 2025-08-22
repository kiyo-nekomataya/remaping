/*(コンポリサイズ)
		選択したレイヤのサイズにコンポをリサイズする。
		レイヤのスケールを考慮
		現在のフレームのスケールになるので注意
*/
if((nas.otome)&&(app.project)&&(app.project.activeItem)&&(app.project.activeItem instanceof CompItem)&&(app.project.activeItem.selectedLayers.length))
{
	//元のコンポと後のコンポのオフセットを計算して全てのレイヤの位置を調整する
	//要するにクロップ
	var targetComp	=app.project.activeItem;
	var targetLayer	=app.project.activeItem.selectedLayers[0];
	var newWidth=Math.ceil(targetLayer.width *targetLayer.property("scale").value[0]/100);
	var newHeight=	Math.ceil(targetLayer.height*targetLayer.property("scale").value[1]/100);
	
		nas.otome.beginUndoGroup("コンポリサイズ");
	targetComp.width=newWidth;
	targetComp.height=newHeight;
var myLayers=new Array();
for(var idx=0;idx<targetComp.layers.length;idx++){myLayers.push(targetComp.layers[idx+1])}
var myTractor=targetComp.layers.addNull();
	myTractor.position.setValue(targetLayer.position.value);
//link copyed items to null　コピーしたレイヤをキャリアに連結

	var lockedLayers=new Array();
	for(var idx=0;idx<myLayers.length;idx++){
		if(myLayers[idx].locked){myLayers[idx].locked=false;lockedLayers.push(idx+1);};//レイヤがロックされていたら控えて解除
		if(myLayers[idx].parent==null){myLayers[idx].parent=myTractor};//すでにリンクのあるレイヤは無視（親に引っ張ってもらえるので）
	};
//キャリアを移動
	myTractor.position.setValue([targetLayer.anchorPoint.value[0]*targetLayer.scale.value[0]/100,targetLayer.anchorPoint.value[1]*targetLayer.scale.value[1]/100]);
//unlink & delete Carrier　キャリア連結解除(ヌル削除)
	for(var idx=0;idx<myLayers.length;idx++){if(myLayers[idx].parent==myTractor){myLayers[idx].parent=null}};
//あればロックされていたレイヤを復旧
	if(lockedLayers.length){for(var idx=0;idx<lockedLayers.length;idx++){myLayers[lockedLayers[idx]].locked=true;}};
	myTractor.source.remove();
		nas.otome.endUndoGroup();
}else{
	alert("ゴメン、それはできない");
}

