/*
解像度設定
ドキュメントの解像度設定を行うボタンパネル
リサイズは行わず設定された解像度の変更のみを行う
2020/12/31
最期に設定された解像度は nas.RESOLUTIONとして保存される(nas.UnitResolution)
*/
	var exFlag=true;
//そもそもドキュメントがなければ終了
	if(app.documents.length==0){exFlag=false;}
if(exFlag){

//Photoshop用ライブラリ読み込み
if(typeof app.nas =="undefined"){
   var myLibLoader=new File(Folder.userData.fullName+"/nas/lib/Photoshop_Startup.jsx");
   $.evalFile(myLibLoader);
}else{
   nas=app.nas;
}
//+++++++++++++++++++++++++++++++++ここまで共用
	nas.readPrefarence('nas.RESOLUTION');
var currentResolution = app.activeDocument.resolution;

var buttonValues = [
	400,350,300,288,200,192,150,144
];
var setAll       = false;
/*
if((currentResolution != 72)||(currentResolution != 96)||(app.activeDocument.width.as('px') > 1500)){
	var msg = nas.localize({en:"",ja:"データの解像度を設定します"})
	confirm()
	
};// */

function setResolution(){
		var res;
	if(nas.RESOLUTION.as){
		res = nas.RESOLUTION.as('dpi');
	}else{
		res = nas.RESOLUTION * 2.54;
	}
//alert(res);
	if(setAll){
		var currentDoc = app.activeDocument;
		for(var ix=0 ;ix <app.documents.length;ix ++){
			app.activeDocument = app.documents[ix];
			app.activeDocument.resizeImage(null,null,res,ResampleMethod.NONE);
		}
		app.activeDocument = currentDoc;
	}else{
		app.activeDocument.resizeImage(null,null,res,ResampleMethod.NONE);
	}
}

function setValue(res){
		nas.RESOLUTION = new nas.UnitResolution(res+"dpi");
//UNDO設定
	var myUndo = 'setResolution';
	var myAction = "setResolution();";
	if(app.activeDocument.suspendHistory){
		app.activeDocument.suspendHistory(myUndo,myAction)
	}else{
		eval(myAction)
	}
	if(nas.RESOLUTION.as) nas.RESOLUTION.convert('dpc');
	nas.writePrefarence("nas.RESOLUTION")
	w.close();
}
/*
	GUI初期化
ボタン数 ボタン値変数+1
テキスト 

*/
//入力を数値に限定
clipNum=function(){
	if(isNaN(this.text)){this.text=this.baseValue.toString()}else{
		this.text=(this.text*1).toString();
	}
};
//入力を整数に限定
clipInt=function(){
	if(isNaN(this.text)){this.text=this.baseValue.toString()}else{
		this.text=Math.floor(this.text*1).toString();
	}
};
	var btms = buttonValues.length;
	var reso = (nas.RESOLUTION.as)? nas.RESOLUTION.as('dpi'):nas.RESOLUTION * 2.54;
//	Window
var w=nas.GUI.newWindow("dialog",nas.localize({en:"set resolution",ja:"解像度設定"}),3, buttonValues.length + 3);
//	TEXT
 w.tx1	=nas.GUI.addEditText(
 	w,reso,0,buttonValues.length+1,3,1
 	);
 w.tx1.justify = 'center';
 w.tx1.onChange = clipNum;
 w.cb1 =nas.GUI.addCheckBox (w,nas.localize({en:"set all documents",ja:"すべて設定"}),.5,0,2,1);
	w.cb1.value=setAll;
	w.cb1.onClick=function(){
		setAll=this.value;
	}
 for(var b = 0; b < buttonValues.length ; b ++){
 	w["bt"+(b+2)]=nas.GUI.addButton(w,buttonValues[b],0,1+b,3,1);
 	w["bt"+(b+2)].onClick = function(){setValue(this.text);};
 }

 w.bt1	=nas.GUI.addButton(w,"OK",0,buttonValues.length + 2,3,1);

w.bt1.onClick=function(){
	setValue(this.parent.tx1.text);
}
w.tx1.active=true;
w.show();
}
