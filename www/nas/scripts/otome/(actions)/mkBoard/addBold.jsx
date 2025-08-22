/*(ボールドセット)
	コンポにボールドを挿入します
ボールドのテンプレートは、このスクリプトと同じフォルダのテンプレートを書きかえるとよいと思うであります

*/

var myTemplate=new File("satab.aep");
if(myTemplate.exists){alert("FInd")}

//ボールド編集UI
/*
	ターゲットとして与えられたコンポのテキストレイヤの値を一括編集するUI
	主にボールド用である
*/
nas.boldEdit=new Object;

nas.boldEdit.confirm=nas.GUI.newWindow("palette","bold内容を編集してください",7,18);// 7unitWidth:18lineHeight
var w=nas.boldEdit.confirm;
//
w.sTx01=nas.GUI.addStaticText	(w,"##TITLE",0,1,2,1);
w.eTx01=nas.GUI.addEditText	(w,XPS.title,2,1,4,1);
w.cBx01=nas.GUI.addCheckBox	(w,"",6,1,1,1);

w.sTx02=nas.GUI.addStaticText	(w,"##SUB_TITLE",0,2,2,1);
w.eTx02=nas.GUI.addEditText	(w,XPS.subtitle,2,2,4,1);
w.cBx02=nas.GUI.addCheckBox	(w,"",6,2,1,1);

w.sTx03=nas.GUI.addStaticText	(w,"##OPUS",0,3,2,1);
w.eTx03=nas.GUI.addEditText	(w,XPS.opus,2,3,4,1);
w.cBx03=nas.GUI.addCheckBox	(w,"",6,3,1,1);

w.sTx04=nas.GUI.addStaticText	(w,"##SCENE",0,4,2,1);
w.eTx04=nas.GUI.addEditText	(w,XPS.scene,2,4,4,1);
w.cBx04=nas.GUI.addCheckBox	(w,"",6,4,1,1);

w.sTx05=nas.GUI.addStaticText	(w,"##CUT",0,5,2,1);
w.eTx05=nas.GUI.addEditText	(w,XPS.cut,2,5,4,1);
w.cBx05=nas.GUI.addCheckBox	(w,"",6,5,1,1);

w.sTx06=nas.GUI.addStaticText	(w,"##TIME",0,6,2,1);
w.eTx06=nas.GUI.addEditText	(w,nas.Frm2FCT(XPS.duration(),3,0),2,6,4,1);
w.cBx06=nas.GUI.addCheckBox	(w,"",6,6,1,1);

w.sTx07=nas.GUI.addStaticText	(w,"##FPS",0,7,2,1);
w.eTx07=nas.GUI.addEditText	(w,XPS.framerate.rate,2,7,4,1);
w.cBx07=nas.GUI.addCheckBox	(w,"",6,7,1,1);

w.sTx08=nas.GUI.addStaticText	(w,"##DATE",0,8,2,1);
w.eTx08=nas.GUI.addEditText	(w,XPS.create_time,2,8,4,1);
w.cBx08=nas.GUI.addCheckBox	(w,"",6,8,1,1);

w.sTx0=nas.GUI.addStaticText	(w,"##CREATE_USER",0,9,2,1);
w.eTx0=nas.GUI.addEditText	(w,XPS.create_user.toString(true),2,9,4,1);
w.cBx0=nas.GUI.addCheckBox	(w,"",6,9,1,1);

w.sTx0=nas.GUI.addStaticText	(w,"##UPDATE_USER",0,10,2,1);
w.eTx0=nas.GUI.addEditText	(w,XPS.update_user.toString(true),2,10,4,1);
w.cBx0=nas.GUI.addCheckBox	(w,"",6,10,1,1);

w.sTx0=nas.GUI.addStaticText	(w,"##TAKE",0,11,2,1);
w.eTx0=nas.GUI.addEditText	(w,"",2,11,4,1);
w.cBx0=nas.GUI.addCheckBox	(w,"",6,11,1,1);

w.sTx0=nas.GUI.addStaticText	(w,"##MEMO",0,12,2,1);
w.eTx0=nas.GUI.addEditText	(w,XPS.getNoteText(),0,13,7,4);
w.cBx0=nas.GUI.addCheckBox	(w,"",6,12,1,1);
/*
w.sTx0=nas.GUI.addStaticText	(w,"##",0,13,2,1);
w.eTx0=nas.GUI.addEditText	(w,XPS.subtitle,2,13,4,1);
w.cBx0=nas.GUI.addCheckBox	(w,"",6,13,1,1);

w.sTx0=nas.GUI.addStaticText	(w,"##",0,14,2,1);
w.eTx0=nas.GUI.addEditText	(w,XPS.subtitle,2,14,4,1);
w.cBx0=nas.GUI.addCheckBox	(w,"",6,14,1,1);

w.sTx0=nas.GUI.addStaticText	(w,"##",0,15,2,1);
w.eTx0=nas.GUI.addEditText	(w,XPS.subtitle,2,15,4,1);
w.cBx0=nas.GUI.addCheckBox	(w,"",6,15,1,1);

w.sTx0=nas.GUI.addStaticText	(w,"##",0,16,2,1);
w.eTx0=nas.GUI.addEditText	(w,XPS.subtitle,2,16,4,1);
w.cBx0=nas.GUI.addCheckBox	(w,"",6,16,1,1);

w.sTx0=nas.GUI.addStaticText	(w,"##",0,,2,1);
w.eTx0=nas.GUI.addEditText	(w,XPS.subtitle,2,,4,1);
w.cBx0=nas.GUI.addCheckBox	(w,"",6,,1,1);
*/
w.okBt=nas.GUI.addButton	(w,"OK",0,17,3,1);
w.rstBt=nas.GUI.addButton	(w,"Reset",3,17,2,1);
w.cnlBt=nas.GUI.addButton	(w,"Cancel",5,17,2,1);

nas.boldEdit.confirm.show();