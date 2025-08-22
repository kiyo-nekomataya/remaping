/*(00線画りんご)
	
	ナンバリングされていないファイルは自動実行の対象にはなりません。
	同じフォルダにあるリソースを使用する場合は
	カレントがスクリプトのあるフォルダに移動しているのでご利用ください
*/
var exFlag=false;
if(this instanceof CompItem){exFlag=true}

/*
*/
if(exFlag){
//ターゲットレイヤを取得
//複数ターゲットの場合はフラグ下げ
var targetLayer=this.selectedLayers[0];
//全レイヤ選択解除
	if(this.layers.length)
	{
		for(var idx=1;idx<=this.layers.length;idx++)
		{
			this.layers[idx].selected=false;
		}
	}
	alert(this.name);
//ターゲット選択してキー抜き＋輪郭
	var myPreset=new File("rinngo01.ffx");//カレントフォルダのプリセットファイルを指定
		targetLayer.applyPresetA(myPreset,"skipUndo");

//調整レイヤを作成して
//色調整
	var myLayer=this.layers.addSolid([0.5,0.5,0.5],"filter",this.width,this.height,1);
	var myPreset=new File("rinngo02.ffx");//カレントフォルダのプリセットファイルを指定
	if(myLayer){
		myLayer.adjustmentLayer=true;//調整レイヤにする

		if(myLayer.index != (targetLayer.index-1)) myLayer.moveBefore(targetLayer);//上でなかったら上へ
		myLayer.name="Color";
		if(! myLayer.selected)myLayer.selected=true;//選択されてなければ次のプリセットのため調整レイヤを選択
		myLayer.applyPresetA(myPreset,"skipUndo");
		myLayer.blendingMode=BlendingMode.LUMINOSITY;
	}
	var mySource=myLayer.source;

	myLayer=this.layers.add(mySource);
//カーブレイヤ作成
	myPreset=new File("rinngo03.ffx");//カレントフォルダのプリセットファイルを指定
	if(myLayer){
		myLayer.adjustmentLayer=true;//調整レイヤにする

		if(myLayer.index != (targetLayer.index-1)) myLayer.moveBefore(targetLayer);//上でなかったら上へ
		myLayer.name="Adjust";
		if(! myLayer.selected)myLayer.selected=true;//選択されてなければ次のプリセットのため調整レイヤを選択
		myLayer.applyPresetA(myPreset,"skipUndo");
	}
//ターゲットレイヤを複製して上へ（2個複製）
	var maskLayer1=this.layers.add(targetLayer.source);
		if(maskLayer1.index != 1)maskLayer1.moveToBeginning();//一番上でなかったら上へ
	myPreset=new File("rinngo04.ffx");//カレントフォルダのプリセットファイルを指定
	maskLayer1.applyPresetA(myPreset,"skipUndo");
	
	var maskLayer2=maskLayer1.duplicate();
	
}