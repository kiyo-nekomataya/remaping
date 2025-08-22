/*(ボールド編集)
	ターゲットとして与えられたコンポのテキストレイヤの値を一括編集するUI
	主にボールド用である
	ターゲットがボールドでなかったら何もしない
	CompItemのメソッドとして起動することも可能
	その場合はターゲットは親のコンポ自身である
	ターゲットコンポの第一レイヤがボールドだった場合はそちらにターゲットを移す
*/
	var doAction=false;
	var myMode="palette";
//コンポのメソッドとして実行されているときはターゲットをそのコンポにする
//更に自動実行の可能性が強いのでダイアログに遷移する
	if((this)&&(this instanceof CompItem))
	{
		var targetComp=this;
		doAction=true;
		myMode="dialog";
	}else{
//処理するオブジェクトがあればアクションフラグをあげる
		if((app.project.activeItem)&&(app.project.activeItem instanceof CompItem))
		{
			var targetComp=app.project.activeItem;
			doAction=true;
		}else{
			doAction=false;
			alert("no selected Item");
		}
	}

//ターゲット自身がボールドでない場合はレイヤを検査してレイヤソースがボールドならターゲットを遷移する
		if((doAction)&&(!(targetComp.name.match(/_bold$/))))
		{
			doAction=false;		
			for(var lIdx=0;lIdx<targetComp.layers.length;lIdx++)
			{
				if(targetComp.layers[lIdx+1].source.name.match(/_bold$/))
				{
					targetComp=targetComp.layers[lIdx+1].source;
					doAction=true;		
					break;
				}
			}
		}

if((targetComp.layers.length)&&(doAction))
{
	var targetLayers=new Array();
	var addHeight=3;
	for(lIdx=0;lIdx<targetComp.layers.length;lIdx++)
	{
		if(
			(targetComp.layers[lIdx+1].name.match(/^##/))&&
			(targetComp.layers[lIdx+1] instanceof TextLayer)&&
			(targetComp.layers[lIdx+1].text.property(1).numKeys==0)
		){
			targetLayers.push(targetComp.layers[lIdx+1]);
			if(targetComp.layers[lIdx+1].name=="##MEMO"){addHeight+=4;}
		}
	}
	if(targetLayers.length==0){alert("このコンポはボールドではないようです");doAction=false};//置き換え対象のレイヤがない
}
if(doAction)
{
//ボールド編集UI
/*
レイヤ名が##で開始され　、かつテキストドキュメントにキーがないレイヤのみを対象として内容を編集する
UI
*/
var boldEdit=new Object;

boldEdit.confirm=nas.GUI.newWindow(myMode,"bold内容を編集してください",7,targetLayers.length+addHeight);// 7unitWidth:18lineHeight
var w=boldEdit.confirm;
var dpOffset=0;
for(xId=0;xId<targetLayers.length;xId++)
{
	if(targetLayers[xId].name=="##MEMO"){
		w["sTx"	+xId]=nas.GUI.addStaticText	(w,targetLayers[xId].name,0,dpOffset+xId+1,2,1);
		w["eTx"	+xId]=nas.GUI.addEditText	(w,targetLayers[xId].text.property(1).value.text,0,dpOffset+xId+2,7,4);
//		w["cBx"		+xId]=nas.GUI.addCheckBox	(w," ",6,dpOffset+xId+1,1,1);
		dpOffset+=4;
	}else{
		w["sTx"	+xId]=nas.GUI.addStaticText	(w,targetLayers[xId].name,0,dpOffset+xId+1,2,1);
		w["eTx"	+xId]=nas.GUI.addEditText	(w,targetLayers[xId].text.property(1).value.text,2,dpOffset+xId+1,4,1);

//		w["cBx"		+xId]=nas.GUI.addCheckBox	(w," ",6,dpOffset+xId+1,1,1);
//アイテムが特定のアイテムのときは入力支援ボタンを付ける
		if(targetLayers[xId].name.match(/neme|user/i)){
				w["sBtn"		+xId]=nas.GUI.addButton	(w,"ME",6,dpOffset+xId+1,1,1);
				w["sBtn"		+xId].index=xId;
				w["sBtn"		+xId].onClick=function(){
					if(this.parent["eTx"+this.index].text !=myName){
						this.parent["eTx"+this.index].text =myName;
					}
				}
		}
		if(targetLayers[xId].name.match(/date/i)){
				w["sBtn"		+xId]=nas.GUI.addButton	(w,"now",6,dpOffset+xId+1,1,1);
				w["sBtn"		+xId].index=xId;
				w["sBtn"		+xId].onClick=function(){
					if(this.parent["eTx"+this.index].text !=myName){
						this.parent["eTx"+this.index].text =new Date().toNASString();
					}
				}
		}
		if(targetLayers[xId].name.match(/take/i)){
				w["sBtn"		+xId]=nas.GUI.addButton	(w,"++",6,dpOffset+xId+1,1,1);
				w["sBtn"		+xId].index=xId;
				w["sBtn"		+xId].onClick=function(){
					if(this.parent["eTx"+this.index].text.match(/[^0-9]$/)){
						this.parent["eTx"+this.index].text =this.parent["eTx"+this.index].text+" take2";
					}else{
						this.parent["eTx"+this.index].text =nas.incrStr(this.parent["eTx"+this.index].text);
					}
				}
		}
	}
}

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
w.okBt=nas.GUI.addButton	(w,"OK",0,targetLayers.length+addHeight-1,2,1);
w.udBt=nas.GUI.addButton	(w,"Update",2,targetLayers.length+addHeight-1,2,1);
w.rstBt=nas.GUI.addButton	(w,"Reset",4,targetLayers.length+addHeight-1,1.5,1);
w.cnlBt=nas.GUI.addButton	(w,"Cancel",5.5,targetLayers.length+addHeight-1,1.5,1);
//---------------------------------------------------action
w.okBt.onClick=function(){
	nas.otome.beginUndoGroup("boldEdit");
	for(xId=0;xId<targetLayers.length;xId++)
	{
		var myText=this.parent["eTx"+xId].text;
		if(myText!=targetLayers[xId].text.property(1).value.text){
			var previewName=targetLayers[xId].name;
			targetLayers[xId].text.property(1).setValue(myText);
			if(targetLayers[xId].name!=previewName){targetLayers[xId].name=previewName;}
		};
	}
	nas.otome.endUndoGroup();
	this.parent.close();
}
w.udBt.onClick=function(){
	nas.otome.beginUndoGroup("boldEdit");
	for(xId=0;xId<targetLayers.length;xId++)
	{
		var myText=this.parent["eTx"+xId].text;
		if(myText!=targetLayers[xId].text.property(1).value.text){
			var previewName=targetLayers[xId].name;
			targetLayers[xId].text.property(1).setValue(myText);
			if(targetLayers[xId].name!=previewName){targetLayers[xId].name=previewName;}
		};
	}
	nas.otome.endUndoGroup();
	if(this.parent.type=="dialog"){this.parent.close()}
}
w.rstBt.onClick=function(){
	for(xId=0;xId<targetLayers.length;xId++)
	{
		var myText=this.parent["eTx"+xId].text;
		if(myText!=targetLayers[xId].text.property(1).value.text){this.parent["eTx"+xId].text=targetLayers[xId].text.property(1).value.text};
	}
}
w.cnlBt.onClick=function(){this.parent.close();}
if(boldEdit.confirm.type=="palette"){w.cnlBt.text="close"}
boldEdit.confirm.show();
}