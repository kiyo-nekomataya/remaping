/*(マーカーで切り出し)


選択レイヤのマーカーを集計する
書き出しはCSV
要素は
id,frame,comment でいいや
同時に切り出しコンポ作成する
*/


//アクションフォルダ対応
if(this instanceof CompItem){
	var myTargetComp=this;
}else{
	var myTargetComp=app.project.activeItem;
}
if((myTargetComp instanceof CompItem)&&(myTargetComp.selectedLayers.length))
{
	//選択されているレイヤの最も上のひとつだけ
	var myTargetTimeline=myTargetComp.selectedLayers[0].property(1);//マーカータイムライン参照
	var exFlag=true
};

if(exFlag)
{
	var myOutput=new Array();
	for(var mIdx=1;mIdx<=myTargetTimeline.numKeys;mIdx++)
	{
		var myStartTime=myTargetTimeline.keyTime(mIdx);
		var myEndTime=(mIdx==myTargetTimeline.numKeys)?myTargetComp.duration:myTargetTimeline.keyTime(mIdx+1);
		var myComment=myTargetTimeline.keyValue(mIdx).comment;
		myOutput.push([mIdx,nas.ms2FCT(myStartTime*1000,0),myComment]);
		if(true)
		{
			var myNewComp=app.project.items.addComp(
				nas.biteClip(nas.Zf(mIdx,3)+myComment),
				myTargetComp.width,
				myTargetComp.height,
				myTargetComp.pixelAspect,
				myEndTime-myStartTime,
				myTargetComp.frameRate
				);
				myNewComp.comment=myComment;
				var myLayer=myNewComp.layers.add(myTargetComp);
				myLayer.startTime=-myStartTime;
		}
	}
	nas.otome.writeConsole(myOutput.join("\n"));
}
