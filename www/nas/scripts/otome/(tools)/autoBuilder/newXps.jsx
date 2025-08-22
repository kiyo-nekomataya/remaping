/*(タイムシート新規作成)
	タイムシート新規作成パネル
	ダイアログで作成
*/
	var w=nas.GUI.newWindow("dialog","新規タイムシート",8,17);
//
	w.lb=nas.GUI.addStaticText(w,"新規タイムシートを作成します",0,0,8,1);
// hederTools
	w.tbt1=nas.GUI.addButton(w,"保存",0,1,2,1);
	w.tbt2=nas.GUI.addButton(w,"別名保存",2,1,2,1);
	w.tbt3=nas.GUI.addButton(w,"書き出し",4,1,2,1);
	w.tbt4=nas.GUI.addButton(w,"編集",6,1,2,1);
// xMapData
	w.mpLb=nas.GUI.addStaticText(w,"xMapData",0,2,2,1);
	w.mpEt=nas.GUI.addEditText(w,"----現在マップデータの編集機能はありません----",2,2,6,1);
	w.mpEt.enabled=false;
// title	
	w.OTLb=nas.GUI.addStaticText(w,"Title",0,3,2,1);
	w.tlEt=nas.GUI.addComboBox(w,nas.workTitles.names(0),nas.workTitles.selected,2,3,6,1);
// subtitle
	w.stLb=nas.GUI.addStaticText(w,"sub-Title",0,4,2,1);
	w.stEt=nas.GUI.addComboBox(w,["sub-TITLE"],0,2,4,6,1);
// Opus	
	w.opLb=nas.GUI.addStaticText(w,"OPUS",0,5,2,1);
	w.opEt=nas.GUI.addEditText(w,"OPUS",2,5,2,1);
// scenr/cut
	w.scLb=nas.GUI.addStaticText(w,"S-C",0,6,2,1);
	w.scEt=nas.GUI.addEditText(w,"SCENE",2,6,3,1);
	w.cnEt=nas.GUI.addEditText(w,"CUT",5,6,3,1);
// layers
	w.lyLb=nas.GUI.addStaticText(w,"sheet Layers",0,7,2,1);
	w.lyLot=nas.GUI.addEditText(w,"4",2,7,1,1);
	w.lyLbls=nas.GUI.addEditText(w,"A,B,C,D",3,7,5,1);
// time framerate trin trout
	w.tmLb=nas.GUI.addStaticText(w,"time/framrate",0,8,2,1);

	w.tlEt=nas.GUI.addEditText(w,"6 + 0 .",2,8,2,1);
	w.frEt=nas.GUI.addEditText(w,"24",4,8,1,1);
	w.frDl=nas.GUI.addDropDownList(w,["FILM(24)","NTSC(29.97)","NTSC(30)","PAL(25)","WEB(15)"],0,5,8,3,1);
// trin/trout
	w.tiLb=nas.GUI.addStaticText(w,"trin",2,9,3,1);
	w.toLb=nas.GUI.addStaticText(w,"trout",5,9,3,1);

	w.trLb=nas.GUI.addEditText(w,"tr-in",2,10,1.5,1);
	w.trEt=nas.GUI.addEditText(w,"0 + 0 .",3.5,10,1.5,1);

	w.toLb=nas.GUI.addEditText(w,"tr-out",5,10,1.5,1);
	w.toEt=nas.GUI.addEditText(w,"0 + 0 .",6.5,10,1.5,1);

// acount/user
	w.cuLb=nas.GUI.addStaticText(w,"createUser",0,11,2,1);
	w.cutmEt=nas.GUI.addStaticText(w,new Date().toNASString(),2,11,2,1);
	w.cunmEt=nas.GUI.addEditText(w,system.userName,4,11,4,1);
// acount/user
	w.uuLb=nas.GUI.addStaticText(w,"updateUser",0,12,2,1);
	w.uutmEt=nas.GUI.addStaticText(w,new Date().toNASString(),2,12,2,1);
	w.uunmEt=nas.GUI.addEditText(w,system.userName,4,12,4,1);
// memo
	w.mmLb=nas.GUI.addStaticText(w,"MEMO.",0,13,2,1);
	w.mmEt=nas.GUI.addEditText(w,"(memo)",2,13,6,2.5);

//OK/キャンセル
w.okbt=nas.GUI.addButton(w,"OK",2,16,3,1);
w.cnbt=nas.GUI.addButton(w,"Cancel",5,16,3,1);

w.show();

//var myXps=new Xps();
