/*
		Photoshop　テキスト編集パネル
	アクティブなテキストレイヤのテキストを編集だー
*/
// enable double clicking from the Macintosh Finder or the Windows Explorer
// #target photoshop
	var exFlag=true;
//そもそもドキュメントがなければ終了
//アクティブレイヤがテキストでない場合も終了
	if((app.documents.length==0)||(app.activeDocument.activeLayer.kind!==LayerKind.TEXT)){
		exFlag=false;
	}
	if(exFlag){
//Photoshop用ライブラリ読み込み
if(typeof app.nas == "undefined"){
	var myLibLoader=new File(Folder.userData.fullName+"/nas/lib/Photoshop_Startup.jsx");
	if(!(myLibLoader.exists))
	myLibLoader=new File(new File($.fileName).parent.parent.parent.fullName + "/lib/Photoshop_Startup.jsx");
	if(myLibLoader.exists) $.evalFile(myLibLoader);
}else{
	nas = app.nas;
};
	if (typeof app.nas != "undefined"){
//+++++++++++++++++++++++++++++++++ここまで共用

//初期化
var currentLayer=app.activeDocument.activeLayer;
//	GUI初期化
w=nas.GUI.newWindow("dialog","editSourceText",8,8,320,240);
w.countBuf=1;
w.onOpen=true;

w.textArea=nas.GUI.addEditText(w,currentLayer.textItem.contents,0,0,8,4);

//w.btL2=nas.GUI.addButton(w,">>",2  ,3,0.7,1);
   w.selectSw=nas.GUI.addCheckBox(w,"ManipurateFirst", 0,5,3,1)
   w.numInc= nas.GUI.addButton(w,"+ incr",4,5,2,1);

   w.numDec= nas.GUI.addButton(w,"- decr",6,5,2,1);


   w.secInc= nas.GUI.addButton(w,"+1",4 ,6,1,1);

   w.secDec= nas.GUI.addButton(w,"-1",5 ,6,1,1);

   w.frmInc= nas.GUI.addButton(w,"+6",6 ,6,1,1);

   w.frmDec= nas.GUI.addButton(w,"-6",7 ,6,1,1);



//w.bt3=nas.GUI.addButton(w,"△goFWD△",2.5,2,2.5,1);
//w.bt4=nas.GUI.addButton(w,"▼goBWD▼",2.5,3,2.5,1);
w.bt7=nas.GUI.addButton(w,"cancel",.5,7,2.5,1);
w.bt6=nas.GUI.addButton(w,"reset",3,7,2.5,1);
w.bt5=nas.GUI.addButton(w,"OK",5.5,7,2.5,1);




//w.btL2.onClick=function(){myShift(-1);}
//値上下ボタン

w.numInc.onClick=function(){this.parent.textArea.text=nas.RZf(nas.incrStr(this.parent.textArea.text),3)};

w.numDec.onClick=function(){this.parent.textArea.text=nas.RZf(nas.incrStr(this.parent.textArea.text,-1),3)};



w.secInc.onClick=function(){this.parent.textArea.text="\( "+nas.Frm2FCT(nas.FCT2Frm(this.parent.textArea.text.match(/[0-9]+\s?\+\s?[0-9]+\s?\.?/))+nas.FRATE.rate,3)+" )";};

w.secDec.onClick=function(){this.parent.textArea.text="\( "+nas.Frm2FCT(nas.FCT2Frm(this.parent.textArea.text.match(/[0-9]+\s?\+\s?[0-9]+\s?\.?/))-nas.FRATE.rate,3)+" )";};

w.frmInc.onClick=function(){this.parent.textArea.text="\( "+nas.Frm2FCT(nas.FCT2Frm(this.parent.textArea.text.match(/[0-9]+\s?\+\s?[0-9]+\s?\.?/))+6,3)+" )";};

w.frmDec.onClick=function(){this.parent.textArea.text="\( "+nas.Frm2FCT(nas.FCT2Frm(this.parent.textArea.text.match(/[0-9]+\s?\+\s?[0-9]+\s?\.?/))-6,3)+" )";};

function manipurateNumber(myString){
    //少数点なし数値　TC　TC（；混在）　TC(s+k)
    var manipurateTarget=new RegExp("([0-9]+|([0-9]+(:[0-9][0-9]){1,3})|([0-9]+(:[0-9][0-9]){1,2}(;[0-9][0-9]))|([0-9]+\+[0-9]+))")
}

//w.namePad.onChange=function(){myEasyFlip.flip("FWD");w.onOpen=false;this.active=true;};
//w.bt3.onClick=function(){myEasyFlip.flip("FWD");w.onOpen=false;this.parent.namePad.active=true;};
//w.bt4.onClick=function(){myEasyFlip.flip("BWD");w.onOpen=false;this.parent.namePad.active=true;};
w.bt7.onClick=function(){
	this.parent.onOpen=false;
	this.parent.close();
};
w.bt6.onClick=function(){
//	this.parent.onOpen=false;
if(currentLayer.textItem.contents!=this.parent.textArea.text){this.parent.textArea.text=currentLayer.textItem.contents}
};
w.bt5.onClick=function(){
//	this.parent.onOpen=false;
if(currentLayer.textItem.contents!=this.parent.textArea.text){currentLayer.textItem.contents=this.parent.textArea.text}
	this.parent.close();

};

//============================================================== 
w.show();

//w.watch("onOpen",function(){alert(w.onOpen);w.unwatch("onOpen");});

//whle(true){}
//+++++++++++++++++++++++++++++++++ここから共用
	}else{
		alert("必要なライブラリをロードできませんでした。")
	};
	}else{
 		alert(nas.localize(nas.uiMsg.noTarget));//"対象アイテムがありません"
	}