/*(レイヤ整列x)


	スーパー邪道スクリプト　その２
	原版レイヤを編集ワークのin/out点と一致させて結整列させる
	AEで編集するときの補助用　原版組み
	下側のレイヤが時系列では先
	AEで編集するな！
	規定のトランジションを検知するとそのタイミング分だけイン点を先行する
	トランジションの解決は全て上側（後方）のレイヤで行なう
*/
var myTargetComp=(this instanceof CompItem)? this:app.project.activeItem;
var masterComp=myTargetComp.layer(1).source;//マスターは必ず第一レイヤに置くこと

if(myTargetComp instanceof CompItem)
{
	var currentTime=0;//　整列ポインタ
	for (var lidx=myTargetComp.layers.length ; lidx>0 ; lidx--)
	{
//		//選択レイヤがあって選択されてなければスキップ
//		if((myTargetComp.selectedLayers.length) &&(!(myTargetComp.layers[lidx].selected))){continue}
//		//シャイ　ロックレイヤがあればスキップ
		if((myTargetComp.layers[lidx].shy)||(myTargetComp.layers[lidx].locked)){continue};//SKIP
//　ターゲットレイヤの親をマスターのソース内に求めて、存在するならIN/OUT点を一致させる
var myMasterLayer=masterComp.layer(myTargetComp.layers[lidx].name);
if(myMasterLayer)
{
	myTargetComp.layers[lidx].inPoint=myTargetComp.layers[lidx].startTime+(myMasterLayer.inPoint-myMasterLayer.startTime);
	myTargetComp.layers[lidx].outPoint=myTargetComp.layers[lidx].startTime+(myMasterLayer.outPoint-myMasterLayer.startTime);
}	
//レイヤに指定のトランジションが存在する場合はそのトランジションの最後のキーの位置をin点のかわりに使用すること
if(
	(myTargetComp.layers[lidx].effect.numProperties)&&(
	(myTargetComp.layers[lidx].effect.property(1).matchName=="ADBE Linear Wipe")||
	(myTargetComp.layers[lidx].effect.property(1).matchName=="ADBE Block Dissolve"))&&
	(myTargetComp.layers[lidx].effect.property(1).property(1).numKeys==2)
)
{
	var headOffset=myTargetComp.layers[lidx].effect.property(1).property(1).keyTime(2)-myTargetComp.layers[lidx].startTime;//レイヤ開始オフセットはトランジションの2番目のキー位置
}else{
	var headOffset=myTargetComp.layers[lidx].inPoint-myTargetComp.layers[lidx].startTime;//レイヤ開始オフセット
}
	if(myTargetComp.layers[lidx].startTime!=(currentTime-headOffset)){myTargetComp.layers[lidx].startTime=currentTime-headOffset};
		currentTime=myTargetComp.layers[lidx].outPoint;
	}
	if(myTargetComp.duration<currentTime){myTargetComp.duration=currentTime}
}