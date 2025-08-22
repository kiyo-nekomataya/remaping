/*(tractorEdit)

トラクタ編集 スクリプト版
（簡易版である）

”トラクタ”はnasでは"camerawork"とも呼ばれるサイズをもたないタイムラインです。
AE上ではヌルオブジェクトを作成してそのエージェントとして利用とします。

このプロシジャの操作UIはダイアログにして他の編集をブロックする

このプロシジャは、トラクタ機能を自動追従エクスプレッションで行ないます。

１．起動時のアクティブアイテムがコンポでトラクタが選択されていればそのトラクタを操作対象にする
２．起動時のアクティブアイテムがコンポでトラクタ以外のレイヤが選択されていれば、レイヤに接続されたトラクタを検索する
	レイヤに接続されたトラクタが存在すればソレを選択して操作対象に設定
	レイヤに接続されたトラクタが存在しない場合新規のトラクタを作成してレイヤと接続するそのトラクタを選択
３．レイヤの選択がない場合は操作対象を作らないでメッセージを出して終了する
４．コンポがアクティブでない場合はメッセージを出して終了する

	トラクタの判定
レイヤはヌルである
transeform.positionプロパティに第一行目が以下の識別子であるエクスプレッションを持つ
//nas XPS tructor

*/
if(app.project.activeItem instanceof CompItem){
var myComp=app.project.activeItem;
//デフォルト値
	var doEdit=true;
	var myTargetLayer=null;
	var myLayerStack=new Array();
//レイヤは選択されているか？
	if(myComp.selectedLayers.length){
//選択あり
for(var lIdx=0;lIdx<myComp.selectedLayers.length;lIdx++){
	var myLinkRoot=myComp.selectedLayers[lIdx].getLinkRoot();//選択レイヤのリンクルートを取得
	if((myLinkRoot.nullLayer) && (myLinkRoot.position.expression.match(/^\/\/nas\ XPS\ tractor/))){
//選択範囲にトラクタがあればそのトラクタを選択
		myTargetLayer=myLinkRoot;delete myLayerStack;break;
	}else{
//後処理に使う可能性があるのでリンクルートを配列にとる
		myLayerStack.push(myLinkRoot);
	}
}
if(!(myTargetLayer)){
//ループ抜けてトラクタがない場合は選択したレイヤを束ねるトラクタを作成する
//乙女のキャッシュでトラクタ用のヌルを取得するアイテムは増えるかもしれんがこの際再利用にあまりこだわらない
		myTargetLayer=myComp.layers.addNullA();
		myTargetLayer.source.name="nas-tarctorBase";//名前もさほど気にしないけど付けとく
			var myExp="//nas%20XPS%20tractor%0Avar%20DefaultSpeed=0.0;%0Avar%20DefaultAngle=90;%0Avar%20DefaultResolution=144;%0Avar%20SlideFlag=false;%0AFollow=new%20Object();%0AFollow.step=1;%0A//%09%E8%A7%A3%E5%83%8F%E5%BA%A6%E5%8F%96%E5%BE%97%0Aif(this.name.match(/(%5B1-9%5D%5Cd*%5C.?%5Cd*%5D*)(dp%5Bic%5D)/))%7B%0A%09var%20Resolution=RegExp.$1%09;%0A%09var%20Resolution_unit=RegExp.$2%09;%0A%7D%20else%20%7B%0A%09var%20Resolution%20=%20144%09;%0A%09var%20Resolution_unit%20=%22dpi%22%09;%0A%7D%0A//%09%E5%BC%95%E3%81%8D%E9%80%9F%E5%BA%A6%E5%8F%96%E5%BE%97%0Aif(this.name.match(/(%5Cd+%5C.?%5Cd*)(%5Bmcip%5D%5Bmnx%5D)%5C/(%5B1-9%5D?%5Cd*)k/i))%7B%0A%0AFollow.spd=RegExp.$1%09;%09Follow.unit=RegExp.$2;%09Follow.step=(RegExp.$3)?RegExp.$3:1;%0A%7Delse%7B%0AFollow.spd=DefaultSpeed%09;%09Follow.unit=%22mm%22%09;%09Follow.step=1%09;%0A%7D%0A//%09%E5%BC%95%E3%81%8D%E6%96%B9%E5%90%91%E5%8F%96%E5%BE%97%0A%09%09Follow.angle%20=%20DefaultAngle;%0Aif(this.name.match(/(%5Cd+%5C.?%5Cd*)%5B%E5%BA%A6%C2%B0d%5D/i))%7B%0A%09Follow.angle%20=%20RegExp.$1;%0A%7Delse%7B%0A%09if(this.name.match(/(%5B%E2%86%92%E2%86%93%E2%86%91%E2%86%90%5D)/))%7B%0A%09%09switch(RegExp.$1)%7B%0Acase%09%22%E2%86%92%22:%09Follow.angle%20=%2090%09;break;%0Acase%09%22%E2%86%93%22:%09Follow.angle%20=%20180%09;break;%0Acase%09%22%E2%86%91%22:%09Follow.angle%20=%200%20%09;break;%0Acase%09%22%E2%86%90%22:%09Follow.angle%20=%20270%09;break;%0A%09%09%7D%0A%09%7D%0A%7D%0A//%09%E5%8F%B0%E3%83%95%E3%83%A9%E3%82%B0%E5%8F%96%E5%BE%97%0Aif(this.name.match(/(Slide)/i)%20%7C%7Cthis.name.match(/%E5%8F%B0/))%7BSlideFlag=true;%7D%0A//if(this.name.match(/(%E5%8F%B0%7CSlide)/i))%7BSlideFlag=true;%7D%0A%0A//%09%E8%A7%A3%E5%83%8F%E5%BA%A6%E3%82%92%E3%83%9F%E3%83%AA%E3%81%82%E3%81%9F%E3%82%8A%E3%81%AE%E5%80%A4%E3%81%AB%E7%9B%B4%E3%81%99%0Avar%20DPM=(Resolution_unit.toString().match(/dpi/))?%20Resolution/25.40%20:%20Resolution/10%20;%0A//%09%E9%80%9F%E5%BA%A6%E3%82%92mm%E3%81%AB%E5%A4%89%E6%8F%9B%0A%09switch(Follow.unit)%7B%0Acase%09%22mm%22:%09divider=1%20;%09break;%0Acase%09%22cm%22:%09divider=10%20;%09break;%0Acase%09%22in%22:%09divider=25.40%20;%09break;%0Adefault%09:%09divider=DPM;%09break;%0A%09%7D%0A//%09%E5%88%9D%E6%9C%9F%E3%82%AA%E3%83%95%E3%82%BB%E3%83%83%E3%83%88%E3%82%92%E3%82%BD%E3%83%BC%E3%82%B9%E3%81%AE%E4%B8%AD%E5%A4%AE%E3%81%AB%E8%A8%AD%E5%AE%9A%0Avar%20offsetX%20=%20width/2;var%20offsetY%20=%20height/2;%0A//%09%E6%96%B9%E5%90%91%E3%82%AA%E3%83%95%E3%82%BB%E3%83%83%E3%83%88%E3%82%92%E8%A8%AD%E5%AE%9A%EF%BC%88%E4%B8%89%E8%A7%92%E9%96%A2%E6%95%B0%E3%81%AF%EF%BC%93%E6%99%82%E6%96%B9%E5%90%91%E5%8F%8D%E6%99%82%E8%A8%88%E3%81%BE%E3%82%8F%E3%82%8A%EF%BC%89%0Avar%20_angle%20=%20Follow.angle%20-%2090;%0A//%09%E3%83%81%E3%82%A7%E3%83%83%E3%82%AF%E3%81%8C%E3%81%AF%E3%81%84%E3%81%A3%E3%81%A6%E3%81%84%E3%81%9F%E3%82%89%E6%96%B9%E5%90%91%E3%82%92%E5%8F%8D%E8%BB%A2%0Aif%20(!%20SlideFlag)%20%7B_angle%20+=%20180%7D%0A//%09%E5%8D%98%E4%BD%8D%E3%83%95%E3%83%AC%E3%83%BC%E3%83%A0%E3%81%82%E3%81%9F%E3%82%8A%E3%81%AE%E7%A7%BB%E5%8B%95%E8%B7%9D%E9%9B%A2%E3%82%92%E8%A8%88%E7%AE%97%0Avar%20followX%20=%20DPM*Follow.spd/divider%20*%20Math.cos(Math.PI%20*%20(_angle%20/%20180));%0Avar%20followY%20=%20DPM*Follow.spd/divider%20*%20Math.sin(Math.PI%20*%20(_angle%20/%20180));%0A//%09%E6%99%82%E9%96%93%E3%81%8B%E3%82%89%E4%BD%8D%E7%BD%AE%E3%82%92%E7%AE%97%E5%87%BA(%E6%99%82%E9%96%930%E3%81%AF%E4%BE%8B%E5%A4%96)%0Avar%20time_unit%20=%20Math.floor(((time-start_time)/this_comp.frame_duration)/Follow.step);%0Aif%20(time%20==%200)%20%7B%0A%09_X=offsetX;_Y=offsetY;%0A%7D%20else%20%7B%0A%09_X=%20offsetX%20+%20followX%20*%20time_unit;%0A%09_Y=%20offsetY%20+%20followY%20*%20time_unit;%0A%7D%0A%5B_X,_Y%5D%0A//nas%20XPS%20tractor%0Avar%20DefaultSpeed=0.0;%0Avar%20DefaultAngle=90;%0Avar%20DefaultResolution=144;%0Avar%20SlideFlag=false;%0AFollow=new%20Object();%0AFollow.step=1;%0A//%09%E8%A7%A3%E5%83%8F%E5%BA%A6%E5%8F%96%E5%BE%97%0Aif(this.name.match(/(%5B1-9%5D%5Cd*%5C.?%5Cd*%5D*)(dp%5Bic%5D)/))%7B%0A%09var%20Resolution=RegExp.$1%09;%0A%09var%20Resolution_unit=RegExp.$2%09;%0A%7D%20else%20%7B%0A%09var%20Resolution%20=%20144%09;%0A%09var%20Resolution_unit%20=%22dpi%22%09;%0A%7D%0A//%09%E5%BC%95%E3%81%8D%E9%80%9F%E5%BA%A6%E5%8F%96%E5%BE%97%0Aif(this.name.match(/(%5Cd+%5C.?%5Cd*)(%5Bmcip%5D%5Bmnx%5D)%5C/(%5B1-9%5D?%5Cd*)k/i))%7B%0A%0AFollow.spd=RegExp.$1%09;%09Follow.unit=RegExp.$2;%09Follow.step=(RegExp.$3)?RegExp.$3:1;%0A%7Delse%7B%0AFollow.spd=DefaultSpeed%09;%09Follow.unit=%22mm%22%09;%09Follow.step=1%09;%0A%7D%0A//%09%E5%BC%95%E3%81%8D%E6%96%B9%E5%90%91%E5%8F%96%E5%BE%97%0A%09%09Follow.angle%20=%20DefaultAngle;%0Aif(this.name.match(/(%5Cd+%5C.?%5Cd*)%5B%E5%BA%A6%C2%B0d%5D/i))%7B%0A%09Follow.angle%20=%20RegExp.$1;%0A%7Delse%7B%0A%09if(this.name.match(/(%5B%E2%86%92%E2%86%93%E2%86%91%E2%86%90%5D)/))%7B%0A%09%09switch(RegExp.$1)%7B%0Acase%09%22%E2%86%92%22:%09Follow.angle%20=%2090%09;break;%0Acase%09%22%E2%86%93%22:%09Follow.angle%20=%20180%09;break;%0Acase%09%22%E2%86%91%22:%09Follow.angle%20=%200%20%09;break;%0Acase%09%22%E2%86%90%22:%09Follow.angle%20=%20270%09;break;%0A%09%09%7D%0A%09%7D%0A%7D%0A//%09%E5%8F%B0%E3%83%95%E3%83%A9%E3%82%B0%E5%8F%96%E5%BE%97%0Aif(this.name.match(/(Slide)/i)%20%7C%7Cthis.name.match(/%E5%8F%B0/))%7BSlideFlag=true;%7D%0A//if(this.name.match(/(%E5%8F%B0%7CSlide)/i))%7BSlideFlag=true;%7D%0A%0A//%09%E8%A7%A3%E5%83%8F%E5%BA%A6%E3%82%92%E3%83%9F%E3%83%AA%E3%81%82%E3%81%9F%E3%82%8A%E3%81%AE%E5%80%A4%E3%81%AB%E7%9B%B4%E3%81%99%0Avar%20DPM=(Resolution_unit.toString().match(/dpi/))?%20Resolution/25.40%20:%20Resolution/10%20;%0A//%09%E9%80%9F%E5%BA%A6%E3%82%92mm%E3%81%AB%E5%A4%89%E6%8F%9B%0A%09switch(Follow.unit)%7B%0Acase%09%22mm%22:%09divider=1%20;%09break;%0Acase%09%22cm%22:%09divider=10%20;%09break;%0Acase%09%22in%22:%09divider=25.40%20;%09break;%0Adefault%09:%09divider=DPM;%09break;%0A%09%7D%0A//%09%E5%88%9D%E6%9C%9F%E3%82%AA%E3%83%95%E3%82%BB%E3%83%83%E3%83%88%E3%82%92%E3%82%BD%E3%83%BC%E3%82%B9%E3%81%AE%E4%B8%AD%E5%A4%AE%E3%81%AB%E8%A8%AD%E5%AE%9A%0Avar%20offsetX%20=%20width/2;var%20offsetY%20=%20height/2;%0A//%09%E6%96%B9%E5%90%91%E3%82%AA%E3%83%95%E3%82%BB%E3%83%83%E3%83%88%E3%82%92%E8%A8%AD%E5%AE%9A%EF%BC%88%E4%B8%89%E8%A7%92%E9%96%A2%E6%95%B0%E3%81%AF%EF%BC%93%E6%99%82%E6%96%B9%E5%90%91%E5%8F%8D%E6%99%82%E8%A8%88%E3%81%BE%E3%82%8F%E3%82%8A%EF%BC%89%0Avar%20_angle%20=%20Follow.angle%20-%2090;%0A//%09%E3%83%81%E3%82%A7%E3%83%83%E3%82%AF%E3%81%8C%E3%81%AF%E3%81%84%E3%81%A3%E3%81%A6%E3%81%84%E3%81%9F%E3%82%89%E6%96%B9%E5%90%91%E3%82%92%E5%8F%8D%E8%BB%A2%0Aif%20(!%20SlideFlag)%20%7B_angle%20+=%20180%7D%0A//%09%E5%8D%98%E4%BD%8D%E3%83%95%E3%83%AC%E3%83%BC%E3%83%A0%E3%81%82%E3%81%9F%E3%82%8A%E3%81%AE%E7%A7%BB%E5%8B%95%E8%B7%9D%E9%9B%A2%E3%82%92%E8%A8%88%E7%AE%97%0Avar%20followX%20=%20DPM*Follow.spd/divider%20*%20Math.cos(Math.PI%20*%20(_angle%20/%20180));%0Avar%20followY%20=%20DPM*Follow.spd/divider%20*%20Math.sin(Math.PI%20*%20(_angle%20/%20180));%0A//%09%E6%99%82%E9%96%93%E3%81%8B%E3%82%89%E4%BD%8D%E7%BD%AE%E3%82%92%E7%AE%97%E5%87%BA(%E6%99%82%E9%96%930%E3%81%AF%E4%BE%8B%E5%A4%96)%0Avar%20time_unit%20=%20Math.floor(((time-start_time)/this_comp.frame_duration)/Follow.step);%0Aif%20(time%20==%200)%20%7B%0A%09_X=offsetX;_Y=offsetY;%0A%7D%20else%20%7B%0A%09_X=%20offsetX%20+%20followX%20*%20time_unit;%0A%09_Y=%20offsetY%20+%20followY%20*%20time_unit;%0A%7D%0A%5B_X,_Y%5D%0A"
			myTargetLayer.position.expression=decodeURI(myExp);
//ループでリンクルートに親を付ける　すでに親があれば二重処理なのでスキップ
		for(var llidx in myLayerStack){if(!myLayerStack[llidx].parent){myLayerStack[llidx].parent=myTargetLayer}};
}
	}else{
		doEdit=false;
	}
if(myTargetLayer){
//初期値を再設定

var myResolution=150;
var mySlideCk=0;
var myFollow=new Object();
myFollow.step=1;
myFollow.angle=90;
myFollow.unit="mm";
myFollow.spd=0.0;
//	解像度取得
if(myTargetLayer.name.match(/([1-9]\d*\.?\d*]*)(dp[ic])/)){
	var Resolution=RegExp.$1	;
	var Resolution_unit=RegExp.$2	;
} else {
	var Resolution = 150	;
	var Resolution_unit ="dpi"	;
}
//	解像度をdpi値に直す
myResolution=(Resolution_unit.toString().match(/dpi/i))? Resolution*1: Resolution*2.54 ;
//	引き速度取得
if(myTargetLayer.name.match(/(\d+\.?\d*)([mcip][mnx])\/([1-9]?\d*)k/i)){

myFollow.spd=RegExp.$1*1	;	myFollow.unit=RegExp.$2;	myFollow.step=(RegExp.$3)?RegExp.$3*1:1;
}
//	引き方向取得
//		myFollow.angle = myAngle;
if(myTargetLayer.name.match(/(\d+\.?\d*)[度°d]/i)){
	myFollow.angle = RegExp.$1*1;
}else{
	if(myTargetLayer.name.match(/([→↓↑←])/)){
		switch(RegExp.$1){
case	"→":	myFollow.angle = 90	;break;
case	"↓":	myFollow.angle = 180	;break;
case	"↑":	myFollow.angle = 0 	;break;
case	"←":	myFollow.angle = 270	;break;
		}
	}
}
//	台フラグ取得
if(myTargetLayer.name.match(/(Slide)/i) ||myTargetLayer.name.match(/台/)){mySlideCk=1;}
//if(this.name.match(/(台|Slide)/i)){SlideFlag=true;}

//	解像度をミリあたりの値に直す
DPM=myResolution/25.40;
//	速度をmmに変換
	switch(myFollow.unit){
case	"mm":	divider=1 ;	break;
case	"cm":	divider=10 ;	break;
case	"in":	divider=25.40 ;	break;
default	:	divider=DPM;	break;
	}
myFollow.spd=myFollow.spd*divider;
}
if(doEdit){
//UI
var w=nas.GUI.newWindow("dialog","tractorEdit",6,10,100,100);

//w.addEventListener("click",function(evt){nas.otome.writeConsole(this.rollControl.value)},false)

//rollIcon
//w.rollControl=nas.GUI.addRotControl(w,"角度(°)",0,0,360,0,1,8,3,false);
//slider
//w.speedControl=nas.GUI.addSliderControl(w,"速度(mm/k)",0,-100,100,0,4,8,2,false);
//propertys
w.nameTrunk="";
w.oldName="["+myTargetLayer.index+"]"+myTargetLayer.name;
w.targetLayer=myTargetLayer;
//slider
w.layerName	=nas.GUI.addStaticText(w,w.oldName,0,0.5 ,6,1);

w.resolution	=nas.GUI.addMultiControl(w,"number",1, 0,1,6,1,true,"解像度(dpi)",myResolution,1,1000);
w.speed    	=nas.GUI.addMultiControl(w,"number",1, 0,3,6,1,true,"SPEED(mm/k)",myFollow.spd,-100,100);
w.angle     	=nas.GUI.addMultiControl(w,"angle",1, 0,5,6,1,false,"方向(°)",myFollow.angle);
w.slideCk  	=nas.GUI.addCheckBox(w,"(台) チェックすると動作が反転します", myFollow.slideCk,8,4,1);
//button
w.addButton=nas.GUI.addButton(w,"Reset",0,9,2,1);
w.delButton=nas.GUI.addButton(w,"remove",2,9,2,1);
w.canButton=nas.GUI.addButton(w,"OK/Close",4,9,2,1);
/*
オブジェクトの処理
*/
w.update=function(){
	var newName="";
	newName+=(this.slideCk.value)?"slide ":"follow ";
	newName+=this.speed.value+"mm/k ";
	newName+=this.angle.value+"d ";
	newName+=this.resolution.value+"dpi";
	newName=this.nameTrunk+" "+newName;
	var newText="["+this.targetLayer.index+"]"+newName;
	if(newName!=this.layerName.text){this.layerName.text=newName};
	return newName;
}
/*
w.okButton=nas.GUI.addButton(w,"OK",6,9,2,1);
w.okButton.onClick=function(){
	return;
}
*/
w.resolution.onChange=function(){this.parent.update()};
w.speed.onChange=function(){this.parent.update()};
w.angle.onChange=function(){this.parent.update()};
w.slideCk.onClick=function(){this.parent.update()};

w.addButton.onClick=function(){	this.parent.update();}
w.delButton.onClick=function(){this.parent.targetLayer.remove();this.parent.close();}
w.canButton.onClick=function(){
var newLayerName=this.parent.update();
if(nas.biteCount(newLayerName)>31){
var msg=nas.biteCount(newLayerName)+" :新規レイヤ名が３１バイトを越えました。名前を切り捨てます"+nas.GUI.LineFeed+"必要に従って編集してください"
alert(msg)
newLayerName=nas.biteClip(newLayerName);
}
	this.parent.targetLayer.name=newLayerName;
//新規名称の文字数を確認して31バイト超過するようならユーザに編集を促す
	this.parent.close();
}
//
w.show();
}else{
		var msg="ターゲットレイヤを選択してください";
		alert(msg);
}
	}else{
		var msg="コンポを選択した状態で実行してください";
		alert(msg);
	}
