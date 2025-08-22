/*(dialogEdit)



//超暫定版
テキストレイヤのキーを一覧編集
*/
var targetLayer=app.project.activeItem.selectedLayers[0];
if(targetLayer instanceof TextLayer){
	var currentLayerName=targetLayer.name;//控えておく
	var w=nas.GUI.newWindow("dialog","Dialog-Edit",12,20,260,160);

		w.reload=function(){
			var myTexts=new Array;
				for(var kIdx=1;kIdx<=targetLayer.text.sourceText.numKeys;kIdx++){
					myTexts.push(targetLayer.text.sourceText.keyValue(kIdx).text);
				};
				this.editBox.text=myTexts.join("\n");
			}
		w.update=function(){
		var myTexts=this.editBox.text.split("\n");
		var currentKidx=1;
		if(myTexts.length){
			var oldKeyCount=targetLayer.text.sourceText.numKeys;
			var newKeyCount=myTexts.length-oldKeyCount;//キー数の差を取得(マイナス許容)
			var myStartTime=(targetLayer.text.sourceText.numKeys)?targetLayer.text.sourceText.keyTime(targetLayer.text.sourceText.numKeys)+0.25:0.25;
			var restDuration=targetLayer.containingComp.duration-myStartTime;
				for(var eIdx=0;eIdx<myTexts.length;eIdx++)
				{
					if(eIdx<targetLayer.text.sourceText.numKeys)
					{
						currentKidx=eIdx+1;
						targetLayer.text.sourceText.setValueAtKey(currentKidx,new TextDocument(myTexts[eIdx]));
					}else{
						targetLayer.text.sourceText.setValueAtTime(myStartTime+((eIdx-oldKeyCount)*(restDuration/newKeyCount)),new TextDocument(myTexts[eIdx]));
					}
				}
				if(newKeyCount<0){
					for(var kIdx=oldKeyCount;kIdx>currentKidx;kIdx--){targetLayer.text.sourceText.removeKey(kIdx)}
				}
			}
		}
	w.editBox=nas.GUI.addEditText(w,"editWin",0,0,12,19);
	w.bt1=nas.GUI.addButton(w,"reload",0,19,2,1);
		w.bt1.onClick=function(){this.parent.reload()};
	w.bt2=nas.GUI.addButton(w,"update",2,19,2,1);
		w.bt2.onClick=function(){this.parent.update()};
	w.bt3=nas.GUI.addButton(w,"close",4,19,2,1);
		w.bt3.onClick=function(){
			if(targetLayer.name!=currentLayerName){targetLayer.name=currentLayerName}
			this.parent.close();
		}
	w.reload();//1回初期化実行する
	w.show();
}
