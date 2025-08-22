/*(dialogEdit_srt)



//超暫定版
テキストレイヤのキーを一覧編集 srt対応 2022.07.01
*/
var SrtUnit = function(ipt,opt,textValue){
	this.ip = ipt;
	this.op = opt;
	this.value = textValue;
};
SrtUnit.prototype.toString = function(){
	if(this.value)
	return [this.ip,' --> ',this.op].join('')+'\n'+this.value +'\n';
	return '\n';
}
Frm2Srt = function (frm,fct){
	return nas.Frm2FCT(nas.fr2ms(frm,fct),8,0,1000).replace(/\.|_$/,'');
}
var targetLayer = app.project.activeItem.selectedLayers[0];
var currentframeRate = 1/app.project.activeItem.frameDuration;
if(targetLayer instanceof TextLayer){
	var currentLayerName=targetLayer.name;//控えておく
	var w=nas.GUI.newWindow("dialog","Dialog-Edit",12,20,260,160);

		w.reload=function(){
			var myTexts = new Array();
			var dataIdx = 1;
			for(var kIdx=1;kIdx<=targetLayer.text.sourceText.numKeys;kIdx++){
				var inPoint = nas.ms2fr(targetLayer.text.sourceText.keyTime(kIdx)*1000,currentframeRate);
				var sectionEnd = ((kIdx+1)<= targetLayer.text.sourceText.numKeys)?
					nas.ms2fr(targetLayer.text.sourceText.keyTime(kIdx+1)*1000,currentframeRate):
					nas.ms2fr(app.project.activeItem.durarion*1000 - 1,currentframeRate);
				var unitText = targetLayer.text.sourceText.keyValue(kIdx).text;
				if(unitText.length){
					myTexts.push(dataIdx + '');
					dataIdx ++;
					myTexts.push(new SrtUnit(
						Frm2Srt(inPoint,currentframeRate),
						Frm2Srt(sectionEnd,currentframeRate),
						unitText
					));
				};
			};
			this.editBox.text=myTexts.join("\n");
		}
		w.update=function(){
			var myTexts = this.editBox.text.split("\n");
			var srtCollection = [];
			var cItm = null;
			for (var i = 0; i < myTexts.length; i++){
				if(myTexts[i] == '') continue;
				if(myTexts[i].match(/^[0-9]+$/)){
					cItem = new SrtUnit("","","");
					srtCollection.push(cItem);
				}else if(myTexts[i].match(/^([0-2][0-3]\:[0-5][0-9]\:[0-5][0-9]\,[0-9]{3})\s*\-\-\>\s*([0-2][0-3]\:[0-5][0-9]\:[0-5][0-9]\,[0-9]{3})/)){
					cItem.ip = RegExp.$1;
					cItem.op = RegExp.$2;
				}else{
					cItem.value += myTexts[i];
				};
			};
//
			var oldKeyCount = targetLayer.text.sourceText.numKeys;//現キー数
			var newKeyCount = (srtCollection.length * 2 + 1)-oldKeyCount;//キー数の差を取得(マイナスのケースあり)
//■□■□■□■□■□■□■□■□■ブランク区間用キーとアイテムキーが必要
			if(srtCollection.length){
//現キーをすべて削除
				if(oldKeyCount){
					for(var kIdx=oldKeyCount;kIdx>0;kIdx--){targetLayer.text.sourceText.removeKey(kIdx)};
				};
//新キーを設定
//第一区間のブランクキーを設定
				targetLayer.text.sourceText.setValueAtTime(0,new TextDocument(''));
//各値を設定
				srtCollection.forEach(function(e){
					var inPoint  = nas.FCT2ms(e.ip,1000)/1000;
					var outPoint = nas.FCT2ms(e.op,1000)/1000;
					targetLayer.text.sourceText.setValueAtTime(inPoint,new TextDocument(e.value));
					targetLayer.text.sourceText.setValueAtTime(outPoint,new TextDocument(''));
				});
			};
		};
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
