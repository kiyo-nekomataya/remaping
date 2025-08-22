/*(コンポのプロパティをみる)
<jsx_04>

レンダー乙女サンプルプログラム
*/
//ウインドウ作成
	var w = nas.GUI.newWindow("dialog","コンポプロパティ",4,10,320,240);
//GUI部品
	w.myLabel=nas.GUI.addStaticText(w,"コンポを選択してください",0,0,4,2);
	w.myLB=nas.GUI.addListBox(w,"",null,0,1,4,6);
	w.myBt1=nas.GUI.addButton(w,"View",0,9,2,1);
	w.myBt2=nas.GUI.addButton(w,"Close",2,9,2,1);
//GUIイベント
	w.myBt1.onClick=function(){return;};
	w.myBt2.onClick=function(){this.parent.close()};
//表示
	w.show();