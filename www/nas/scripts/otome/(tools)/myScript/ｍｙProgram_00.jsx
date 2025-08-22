/*(コンポのプロパティをみる)
<nasu>

レンダー乙女サンプルプログラム
*/
///データ初期化
var myComps=app.project.pickItems("composition");
if(! (myComps instanceof Array)){myComps=[]};

var nameList=new Array();
for(var idx=0; idx<myComps.length; idx++){nameList.push(myComps[idx].index+":"+myComps[idx].name)};//表示用の名前を配列にする


//ウインドウ作成
var w = nas.GUI.newWindow("dialog","コンポプロパティ",4,10,320,240);
//GUI部品
w.myLabel=nas.GUI.addStaticText(w,"コンポを選択してください",0,0,4,1);
w.myLB=nas.GUI.addListBox(w,nameList,null,0,1,4,6,"multiselect");
w.myBt1=nas.GUI.addButton(w,"View",0,9,2,1);
w.myBt2=nas.GUI.addButton(w,"Close",2,9,2,1);
//GUIイベント
	w.myBt1.onClick=function()
	{
	  if(this.parent.myLB.selected.length){
		var msg="";
		for(var idx=0;idx<this.parent.myLB.selected.length;idx++)
		{
			msg+=" index :"	+myComps[idx].index	+nas.GUI.LineFeed;
			msg+="------------------------------------"	+nas.GUI.LineFeed;
			msg+="name :"	+myComps[idx].name	+nas.GUI.LineFeed;
			msg+="width :"	+myComps[idx].width	+" / ";
			msg+="height :"	+myComps[idx].height	+nas.GUI.LineFeed;
			msg+="aspect :"	+myComps[idx].pixelAspect	+nas.GUI.LineFeed;
			msg+=nas.GUI.LineFeed;
		}
		alert(msg);
	  }else{
		alert("コンポが選択されていません");
	  }
	};
	w.myBt2.onClick=function(){this.parent.close()};

//表示
w.show();
