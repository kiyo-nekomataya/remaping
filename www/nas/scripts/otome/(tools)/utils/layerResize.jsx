/*(レイヤマッチ)
		選択したソリッドレイヤのサイズをコンポにマッチさせて位置をリセットする。
		非選択状態では、すべてのレイヤが対象
		レイヤソースがソリッドでない場合は無視
		ヌルレイヤは無視
		個人的な処理で100x100のソリッドもパス	2007/07/22
		選択してある場合は100X100のソリッドも処理対象
*/
function layerResize(){
if(
	(app.project)&&
	(app.project.activeItem)&&
	(app.project.activeItem instanceof CompItem)&&
	(app.project.activeItem.layers.length)

){
//上の条件以外で動作の意味がなくなるので何もせずに復帰
	var targetLayers=app.project.activeItem.layers;IdOffset=1;
	var myWidth=app.project.activeItem.width;
	var myHeight=app.project.activeItem.height;
app.beginUndoGroup("ソリッドリサイズ");

	for(var targetID=0;targetID<targetLayers.length;targetID++){
		myTarget=targetLayers[targetID+IdOffset];
		if (
			(! myTarget.nullLayer)&&
			(myTarget.source.mainSource instanceof SolidSource)&&
			((myTarget.width!=100 && myTarget.height!=100)&&(! myTarget.selected))
		){
		
			if(myTarget.width !=myWidth ) {myTarget.source.width=myWidth};
			if(myTarget.height!=myHeight) {myTarget.source.height=myHeight};
		}
		if((myTarget.width ==myWidth )&&(myTarget.height==myHeight))
//	キーが無いとき　あるときは処理未定なのでパス
			if(myTarget.position.numKeys==0)
			{
				myTarget.position.setValue([myWidth/2,myHeight/2]);
			}
	}
app.endUndoGroup();
}else{return false;}
}

layerResize();