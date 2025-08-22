/*(マーカー追加)


選択レイヤの現在時にマーカーを打つ
選択位置にマーカーがあれば確認パネルを出して編集可能
削除
移動
コメント / チャプタ / url / frameTarget の編集

等を行なうことができる
*/
var exFlag=false;
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
	//ターゲットタイムラインにキーがない場合は、以降の操作でエラーが発生するので現在位置にあらかじめキーをひとつ打つ
	if(myTargetTimeline.numKeys==0){myTargetTimeline.addKey(myTargetComp.time)};
};

if(exFlag)
{
	if(myTargetComp.time!=myTargetTimeline.keyTime(myTargetTimeline.nearestKeyIndex(myTargetComp.time)))
	{
		//キーがヘッド位置に無いので、ここでデフォルトでキーを作成
		var myKeyIndex=myTargetTimeline.addKey(myTargetComp.time);
	}else{
		var myKeyIndex=myTargetTimeline.nearestKeyIndex(myTargetComp.time)
	}
var myValue=new MarkerValue(myTargetTimeline.keyValue(myKeyIndex).comment,myTargetTimeline.keyValue(myKeyIndex).chapter,myTargetTimeline.keyValue(myKeyIndex).url,myTargetTimeline.keyValue(myKeyIndex).frameTarget)
//myTargetTimeline.removeKey(myTargetTimeline.nearestKeyIndex(myTargetComp.time));//最寄キーを削除
//UI
var markerEdit=new Object;
	markerEdit.w=nas.GUI.newWindow("dialog","マーカー編集",6,8);
//コントロール
markerEdit.w.tx0=nas.GUI.addStaticText(markerEdit.w,myTargetComp.name+"  :[ "+myTargetComp.selectedLayers[0].index+" ]"+myTargetComp.selectedLayers[0].name+" :MARKER: [ "+myKeyIndex+" ] "+nas.ms2FCT(myTargetComp.time*1000,3), 0,0,6,1);
markerEdit.w.tx1=nas.GUI.addStaticText(markerEdit.w,"comment", 0,1,1,1);
	markerEdit.w.cmt=nas.GUI.addEditText(markerEdit.w,myValue.comment, 1,1,5,3);
markerEdit.w.tx2=nas.GUI.addStaticText(markerEdit.w,"chapter", 0,4,1,1);
	markerEdit.w.cpt=nas.GUI.addEditText(markerEdit.w,myValue.chapter, 1,4,5,1);
markerEdit.w.tx3=nas.GUI.addStaticText(markerEdit.w,"frameTarget", 0,5,1,1);
	markerEdit.w.ftg=nas.GUI.addEditText(markerEdit.w,myValue.frameTarget, 1,5,5,1);
markerEdit.w.tx4=nas.GUI.addStaticText(markerEdit.w,"url", 0,6,1,1);
	markerEdit.w.url=nas.GUI.addEditText(markerEdit.w,myValue.url, 1,6,5,1);

markerEdit.w.rmbt=nas.GUI.addButton(markerEdit.w,"remove",0,7,2,1);
markerEdit.w.canbt=nas.GUI.addButton(markerEdit.w,"cancel",2,7,2,1);
markerEdit.w.okbt=nas.GUI.addButton(markerEdit.w,"O K",4,7,2,1);
//ファンクション	
	markerEdit.w.cpt.onChange=function(){if(this.text != myValue.chapter){myValue.chapter=this.text}};
	markerEdit.w.cmt.onChange=function(){if(this.text != myValue.comment){myValue.comment=this.text}};
	markerEdit.w.ftg.onChange=function(){if(this.text != myValue.frameTarget){myValue.frameTarget=this.text}};
	markerEdit.w.url.onChange=function(){if(this.text != myValue.url){myValue.url=this.text}};
	
	markerEdit.w.rmbt.onClick=function(){myTargetTimeline.removeKey(myTargetTimeline.nearestKeyIndex(myTargetComp.time));this.parent.close()};
	markerEdit.w.canbt.onClick=function(){this.parent.close();};
	markerEdit.w.okbt.onClick=function(){myTargetTimeline.setValueAtKey(myKeyIndex,myValue);this.parent.close();};
	
//表示
	markerEdit.w.show();
};//コンポが無ければ何もしない
