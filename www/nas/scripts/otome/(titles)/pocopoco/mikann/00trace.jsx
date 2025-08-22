/*(00線画みかん)
	
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
//複製してカラー抜き黒線設定
var boldLayer=targetLayer.duplicate();
var myPreset=new File("mikannBold.ffx");//カレントフォルダのプリセットファイルを指定
		if(boldLayer.index != (targetLayer.index-1)) boldLayer.moveBefore(targetLayer);//上でなかったら上へ
		boldLayer.name="lineBold";
		if(! boldLayer.selected) boldLayer.selected=true;//選択されてなければ次のプリセットのため調整レイヤを選択
		boldLayer.applyPresetA(myPreset,"skipUndo");
		if(boldLayer.selected) boldLayer.selected=false;
			
//色線ボールド
var colorBoldLayer=(app.project.items.getByName("boldLine"))?this.layers.add(app.project.items.getByName("boldLine")):this.layers.addSolid([0.5,0.5,0.5],"boldLine",this.width,this.height,1);
//var colorBoldLayer=this.layers.addSolid([0.5,0.5,0.5],"boldLine",this.width,this.height,1);
myPreset=new File("colorBoldMikann.ffx");//カレントフォルダのプリセットファイルを指定
		if(colorBoldLayer.index != (boldLayer.index-1)) colorBoldLayer.moveBefore(boldLayer);//上でなかったら上へ
		colorBoldLayer.name="colorBold";
		if(! colorBoldLayer.selected) colorBoldLayer.selected=true;//選択されてなければ次のプリセットのため調整レイヤを選択
		colorBoldLayer.applyPresetA(myPreset,"skipUndo");
		if(colorBoldLayer.selected) colorBoldLayer.selected=false;
}
