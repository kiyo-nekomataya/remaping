/*(プリコンポ展開)
************************************************

    ---- Expand Compsiotion ver.1.1+ ----

      Expands PreComp (+ undo)
		  for AfterFx Ver.6.5 
                       by dA-tools  July.12 / 2006

上記バージョンをベースに以下を調整

エラー回避を追加

プリコンポと親コンポの条件によって配置がずれる現象を回避して
キーフレームアニメーションの保持可能な方式に変更
 by kiyo/Nekomataya(2007/09/02)

ユーザ選択をスキップしてコンポのジオメトリで配置するように調整
スクリプト組み込みのためundo機能停止／GUIスキップ= 版
(2008/10/13)
***************************************************/

//-----GUI----------------------------------------
if ((app.project.activeItem)&&(app.project.activeItem instanceof CompItem)&&(app.project.activeItem.selectedLayers.length))
{
	if(false){
var dlg= new Window('dialog',"ExpandComp",ve2ae(200,100,224-4, 157-30));
	pnlSet = dlg.add("panel",ve2ae(5,5,206,56),"Transform");
		rbtnOrg = pnlSet.add("radiobutton",ve2ae(17,24,71,21),"Original");
		rbtnPreComp = pnlSet.add("radiobutton",ve2ae(118,24,71,21),"PreComp");
	btnOK=dlg.add('button',ve2ae(120,80,81,26),'OK');
	btnCancel = dlg.add('button',ve2ae(20,80,81,26),'Cancel');
	
	rbtnPreComp.value=true;
var ret=dlg.show();
	}
var rbtnPreComp=new Object;
	rbtnPreComp.value=true;
var ret=true;
}else{
	writeLn("have no item");
var ret=false;
}
//----------------------------------------------------
if(ret==1)
{ //OK button && exists activeCompItem and selectedLayers
//app.beginUndoGroup("Expand Comp");

function FindItemNo(str){ //serch target composition
	var num=0;
	for (var i=1; i<=app.project.items.length ; i++){
		if (app.project.item(i).name == str ) num = i;
	}
	return num;
}

	var activeItem = app.project.activeItem;
	var baseComp=activeItem.selectedLayers[0];

if (baseComp == null){ //AA
	alert("Select compo!");
} else {
	if (FindItemNo(baseComp.name)) { //BB
		var nn= FindItemNo(baseComp.name); 
		var preComp = app.project.item(nn);
		if (preComp instanceof CompItem) {
			for (var i=1 ; i<=preComp.numLayers ; i++){
			preComp.layer(i).copyToComp(activeItem);
		}
		if (rbtnPreComp.value) {
var myLayers=new Array();
for(var j=(baseComp.index-preComp.numLayers); j<baseComp.index; j++) {
	myLayers.push(app.project.activeItem.layer(j));
}
//make CarrierNull キャリア用のヌルオブジェクトを作成
	var myCarrier=app.project.activeItem.layers.addNull();
	myCarrier.position.setValue([preComp.width/2,preComp.height/2,0]);
//link copyed items to null　コピーしたレイヤをキャリアに連結
	var lockedLayers=new Array();
	for(var idx=0;idx<myLayers.length;idx++){
		if(myLayers[idx].locked){myLayers[idx].locked=false;lockedLayers.push(idx);};//レイヤがロックされていたら控えて解除
		myLayers[idx].parent=myCarrier;
	};

//キャリアを親コンポの位置へ移動してスケーリング・回転
	var myOffset=sub(baseComp.anchorPoint.value,[baseComp.width/2,baseComp.height/2,0]);

	myCarrier.anchorPoint.setValue(add(myCarrier.anchorPoint.value,myOffset));
	myCarrier.position.setValue(baseComp.position.value);
	myCarrier.rotation.setValue(baseComp.rotation.value);
	myCarrier.scale.setValue(baseComp.scale.value);
	

//unlink & delete Carrier　キャリア連結解除(ヌル削除)
	for(var idx=0;idx<myLayers.length;idx++){myLayers[idx].parent=null;};
//あればロックされていたレイヤを復旧
	if(lockedLayers.length){for(var idx=0;idx<lockedLayers.length;idx++){myLayers[lockedLayers[idx]].locked=true;}};
	myCarrier.source.remove();
		}
		baseComp.enabled = false;
	} else {
		alert("It's not Composition!");}
	} //BB
} //AA


//app.endUndoGroup();
}
 function ve2ae(left,top,width,height) {
 	var right=width+left;
 	var buttom=top+height;
 	return [left,top,right,buttom]
 }
