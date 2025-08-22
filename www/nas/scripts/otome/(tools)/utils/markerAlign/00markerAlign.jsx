target=(this instanceof CompItem)? this : app.project.activeItem;
/*
ターゲットコンポの第一レイヤにレイヤマーカーがあった場合、
マーカーの数だけレイヤを複製してマーカー位置をコンポの第一フレームになるようスタート時を調整します。
複製の際にマーカーの名前をレイヤ名にします。

*/
if(target instanceof CompItem)
{
	var targetLayer=target.layer(1);
   var markerProp=targetLayer.property("Marker");//マーカー取得
　if(markerProp.numKeys>0){
 //  targetLayer.startTime=targetLayer.startTime-markerProp.keyTime(1);

   for(var ix=0;ix<markerProp.numKeys;ix++){
		var myLayer=(ix==0)?targetLayer:targetLayer.duplicate();
//		myLayer.name="["+("ABCDEFGHIJKLMNOPQRSTUVWXYZ").charAt(ix)+"]";
		myLayer.name="["+myLayer.property("Marker").keyValue(ix+1).comment+"]";
		myLayer.startTime=myLayer.startTime-myLayer.property("Marker").keyTime(ix+1);
		myLayer.moveToBeginning()
   }
  }
}
