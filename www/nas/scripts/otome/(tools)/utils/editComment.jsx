/*(コメントエディタ)

	アイテムコメントを編集する
	選択アイテムのコメントをバッファにとって表示
	書き換えた内容をアップデートすることができるUI
*/
var exFlag=false;
var myTargetItem=app.project.activeItem;
var myTarget=myTargetItem;
var targetId=0;//　0はアイテム自身　ターゲットがコンポの場合のみ　1から先はレイヤID
var targetClass="";
if(app.project.activeItem){
	exFlag=true;
	targetClass=myTargetItem.typeName;
	}
if(app.project.activeItem instanceof CompItem)
{
	if(myTargetItem.selectedLayers.length){
		targetClass="Layer";
		targetId=myTargetItem.selectedLayers[0].index;
		myTarget=myTargetItem.layer(targetId);
	}
}
if(exFlag)
{
var w=nas.GUI.newWindow("dialog","------");
w.editBox=nas.GUI.addEditText(w,myTarget.comment,0,0,6,6);
w.changeUpBt=nas.GUI.addButton(w,"▲",6,0,2,1);
		w.changeUpBt.enabled=false;
		w.changeUpBt.onClick=function(){this.parent.chgTarg((targetId+myTargetItem.numLayers)%(myTargetItem.numLayers+1))};
w.changeDownBt=nas.GUI.addButton(w,"▼",6,1,2,1);
		w.changeDownBt.enabled=false;
		w.changeDownBt.onClick=function(){this.parent.chgTarg((targetId+1)%(myTargetItem.numLayers+1))};
w.clearBt=nas.GUI.addButton(w,"clear",6,4,2,1);
	w.clearBt.onClick=function(){myTarget.comment="";this.parent.editBox.text=myTarget.comment;}
w.closeBt=nas.GUI.addButton(w,"close",6,5,2,1);
	w.closeBt.onClick=function(){this.parent.close()};
//
	w.onClose=function(){
		this.commentUpdate();
	}
	w.commentUpdate=function(){
		var newComment=this.editBox.text;
		if((newComment)&&(newComment !=myTarget.comment)){myTarget.comment=newComment}
	}
;
//
	w.chgTarg=function(ix)
	{
		this.commentUpdate();
//		if((isNaN(ix))||(ix>myTargetItem.items.length)||(ix<0)||(targetId==ix)){return}
		targetId=ix;
		if(targetId==0){
			targetClass=myTargetItem.typeName;
			myTarget=myTargetItem;
			this.text="edit comment for "+targetClass+" [ "+myTarget.id+" ] "+myTarget.name;
		}else{
		//レイヤ変更可能なのはコンポのみなのでコンポ以外はreturn
			if(! (myTargetItem instanceof CompItem)){return}
			targetClass="Layer";
			myTarget=myTargetItem.layer(targetId);
			this.text="edit comment for "+targetClass+" [ "+myTarget.index+" ] "+myTarget.name;
		}
			this.editBox.text=myTarget.comment;
	}
//ターゲットがコンポならボタンを有効に
	if(myTargetItem instanceof CompItem){
		w.changeUpBt.enabled=true;
		w.changeDownBt.enabled=true;
	}
	w.chgTarg(targetId);
	w.show();
}