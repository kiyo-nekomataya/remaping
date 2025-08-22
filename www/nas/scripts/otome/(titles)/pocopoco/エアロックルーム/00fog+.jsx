/*(00-パラとフォギー)
	
	ナンバリングされていないファイルは自動実行の対象にはなりません。
	同じフォルダにあるリソースを使用する場合は
	カレントがスクリプトのあるフォルダに移動しているのでご利用ください
*/
var exFlag=false;
if(this instanceof CompItem){exFlag=true}

/*
*/
if(exFlag){
//全てのレイヤの選択を解除
if(this.layers.length)
{
	for(var idx=1;idx<=this.layers.length;idx++)
	{
		this.layers[idx].selected=false;
	}
}

//調整レイヤを作成して
//カーブレイヤ作成
var myLayer=this.layers.addSolid([0.5,0.5,0.5],"filter",this.width,this.height,1);
var myPreset=new File("pocoCurve.ffx");//カレントフォルダのプリセットファイルを指定
	if(myLayer){
		myLayer.adjustmentLayer=true;//調整レイヤにする

		if(myLayer.index != 1)myLayer.moveToBeginning();//一番上でなかったら上へ
		this.layer(1).name="パラ";
		if(! myLayer.selected)myLayer.selected=true;//選択されてなければ次のプリセットのため調整レイヤを選択
		myLayer.applyPresetA(myPreset,"skipUndo");
	}
	var mySource=myLayer.source;

	myLayer=this.layers.add(mySource);
	myPreset=new File("pocoCurve2.ffx");//カレントフォルダのプリセットファイルを指定
	if(myLayer){
		myLayer.adjustmentLayer=true;//調整レイヤにする

		if(myLayer.index != 1)myLayer.moveToBeginning();//一番上でなかったら上へ
		this.layer(1).name="パラカーブ";
		if(! myLayer.selected)myLayer.selected=true;//選択されてなければ次のプリセットのため調整レイヤを選択
		myLayer.applyPresetA(myPreset,"skipUndo");
		this.layer(2).trackMatteType=TrackMatteType.LUMA_INVERTED;
	}

	myLayer=this.layers.add(mySource);
	myPreset=new File("fog.ffx");//カレントフォルダのプリセットファイルを指定
	if(myLayer){
		myLayer.adjustmentLayer=true;//調整レイヤにする

		if(myLayer.index != 1)myLayer.moveToBeginning();//一番上でなかったら上へ
		this.layer(1).name="フォギー";
		if(! myLayer.selected)myLayer.selected=true;//選択されてなければ次のプリセットのため調整レイヤを選択
		myLayer.applyPresetA(myPreset,"skipUndo");
		this.layer(1).blendingMode=BlendingMode.LIGHTEN;
	}
}
