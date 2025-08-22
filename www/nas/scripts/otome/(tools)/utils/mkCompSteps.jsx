/*(階段コンポを作成)
	
	各レイヤのIN/OUT点を１フレームごとに階段状に整列させる
	原撮コンポを整形するスクリプト
	レイヤ時系列は下から順に先行
	
*/
var myTargetComp=(this instanceof CompItem)? this:app.project.activeItem;
var stepStore=new Array;
if(myTargetComp instanceof CompItem)
{
	for (var lyIdx=myTargetComp.numLayers;lyIdx>0;lyIdx--){
		//ロックされていないファイルソースの静止画レイヤを継続時間1フレームにして階段スタックに積む
		if(
			(myTargetComp.layer(lyIdx).hasVideo) &&
			(! myTargetComp.layer(lyIdx).locked) &&
			(! myTargetComp.layer(lyIdx).shy) &&
			(	(myTargetComp.layer(lyIdx).source.mainSource instanceof FileSource) && 
				(myTargetComp.layer(lyIdx).source.mainSource.isStill)
			)
		){
			myTargetComp.layer(lyIdx).startTime=0;
			myTargetComp.layer(lyIdx).inPoint=0;
			myTargetComp.layer(lyIdx).outPoint=myTargetComp.frameDuration;
			stepStore.push(myTargetComp.layer(lyIdx));//スタックする
		}
	}
	var currentTime=0;//　整列ポインタ
	for (var lidx=0; lidx<stepStore.length ; lidx++)
	{
			var headOffset=stepStore[lidx].inPoint-stepStore[lidx].startTime;//レイヤ開始オフセット
	if(stepStore[lidx].startTime!=(currentTime-headOffset)){stepStore[lidx].startTime=currentTime-headOffset};
		currentTime=stepStore[lidx].outPoint;
	}
	if(myTargetComp.duration != currentTime){myTargetComp.duration=currentTime}
}