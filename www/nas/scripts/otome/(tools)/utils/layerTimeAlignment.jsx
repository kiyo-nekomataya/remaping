/*(レイヤ整列)


	スーパー邪道スクリプト
	全レイヤをin/out点で連結整列させる
	AEで編集するときの補助用
	下側のレイヤが時系列では先
	AEで編集するな！
	規定のトランジションを検知するとそのタイミング分だけイン点を先行する
	トランジションの解決は全て上側（後方）のレイヤで行なう
*/
var myTargetComp=(this instanceof CompItem)? this:app.project.activeItem;

if(myTargetComp instanceof CompItem)
{
	var currentTime=0;//　整列ポインタ
	for (var lidx=myTargetComp.layers.length ; lidx>0 ; lidx--)
	{
//		//選択レイヤがあって選択されてなければスキップ
//		if((myTargetComp.selectedLayers.length) &&(!(myTargetComp.layers[lidx].selected))){continue}
//		//シャイ　ロックレイヤがあればスキップ
		if((myTargetComp.layers[lidx].shy)||(myTargetComp.layers[lidx].locked)){continue};//SKIP
		
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