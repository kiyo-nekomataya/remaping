/*	複合コントロールComboBox
 *
 * addComboBox = function (親,オプション,選択状態,X,Y,幅,高さ)
 *	親 : 
 *	オプション : 
 *	選択ID または 初期値:
 *	X,Y :
 *	幅,高さ :
 */
nas.GUI.addComboBox = function (Parent,Options,Selected,left,top,width,height)
{
//コンボボックスの配列数は自由・表示エレメント数は height
	if(!(Options instanceof Array)) {
		Options=[Options];
	}
	if(Selected instanceof Array) 
	{
		Selected=Selected[0];
	}
		//コンボボックスは必ずシングルセレクトなので配列が与えられたら最初の要素を値にとる。
		if(isNaN(Selected) || Selected==null ||Selected >= Options.length || Selected < 0){var noSelect=true;}

//親パネル設定
	var myCB =nas.GUI.addPanel(Parent,"",left,top,width,height+0.4);//必ずtextは""で初期化
		//オブジェクトプロパティ
			myCB.options=Options;
			myCB.value=(noSelect)? Selected:Options[Selected];//テキスト
			myCB.selected=(noSelect)?null:Selected;//選択ID(ユーザ入力時はnull)
//ラベルテキスト
			myCB.labelText =nas.GUI.addEditText(myCB,myCB.value,0,0,width-0.6,height);
			myCB.labelText .bounds=[0,0,myCB.bounds.width-(nas.GUI.colUnit*0.35),myCB.bounds.height];//adjust
//セレクトボタン
			myCB.selectButton =nas.GUI.addButton(myCB, "▼",width-0.4,.1,0.7,height);
			myCB.selectButton.bounds=[myCB.bounds.width-(nas.GUI.colUnit*0.35),0,myCB.bounds.width-4,myCB.bounds.height-4];//adjust
			
//セレクトボタンのクリックメソッド
		myCB.selectButton.onClick=function()
		{
			var myLocation=nas.GUI.screenLocation(this.parent)
			
			var mySelect=nas.GUI.selectOptions(
				this.parent.options,
				this.parent.selected,
				myLocation[0],myLocation[1],this.parent.bounds.width/nas.GUI.colUnit,this.parent.options.length
			);
			if(mySelect>=0){
				this.parent.selected=mySelect;
				this.parent.labelText.text=this.parent.options[mySelect];
			}
		}
//エディットボックス変更
		myCB.labelText.onChange=function()
		{
			this.parent.value=this.text;//値を更新
			var noSelect=true;
			for(var idx=0;idx<this.parent.options.length;idx++)
			{
				if(this.parent.options[idx]==this.text)
				{
					noSelect=false;
					this.parent.selected=idx;
					break;
				}
			}
			if(noSelect){this.parent.selected=null;}
			this.parent.onChange();
		}
//コンボボックスにonChangeを作成(何もしない。ユーザ側でオーバライドする)
	myCB.onChange=function(){return;};

//設定したコンボボックスを返す
return myCB;
}

