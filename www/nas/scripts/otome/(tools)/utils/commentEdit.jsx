/*(コメントエディタ2)
<test>
コメントエディタUI充実版
*/
//ウインドウ
var myDialog=nas.GUI.newWindow("dialog","コメントエディタ",8,9,480,320);

myDialog.slt=nas.GUI.addSelectButton(myDialog,[0,1,2],0,0,0,8,1);

myDialog.etx=nas.GUI.addEditText(myDialog,"",0,1,8,3);
myDialog.lb0=nas.GUI.addListBox(myDialog,[0,1],0,0,4,4,3);
myDialog.lb1=nas.GUI.addListBox(myDialog,[0,1],0,4,4,4,3);
myDialog.okbt=nas.GUI.addButton(myDialog,"OK",3,8,3,1);
myDialog.ngbt=nas.GUI.addButton(myDialog,"Clear",0,8,3,1);

myDialog.okbt.onClick=function(){this.parent.close();}
myDialog.ngbt.onClick=function(){this.parent.close();}

myDialog.show();

