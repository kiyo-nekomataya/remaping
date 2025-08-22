/*(00-セルコンポ定型処理)
	このファイルは自動実行スクリプトのサンプルです
	オートビルダの自動実行ファイルは、コンポアイテムのメソッドして実行されます
	スクリプト内でthisプロパティはコンポアイテムを指します。
	
	ナンバリングされていないファイルは自動実行の対象にはなりません。
	同じフォルダにあるリソースを使用する場合は
	カレントがスクリプトのあるフォルダに移動しているのでご利用ください
	
	このスクリプトによる操作はシグネチャ付きにして
	二度目以降の操作は行なわない
*/
var exFlag=false;
if(this instanceof CompItem){exFlag=true}
	if(exFlag){
var mySig="##00cellGroup.jsx";
if(this.comment.match(new RegExp(mySig))){
var msg="セルグループ自動処理は適用済みです";
msg+=	nas.GUI.LineFeed;
msg+=	nas.GUI.LineFeed;
msg+=	"このコンポの名前は  ["+this.name+"]  です。";
msg+=	nas.GUI.LineFeed;
msg+=	"ここコンポの処理はスキップされます。";

nas.otome.writeConsole(msg);

//全てのレイヤの選択を解除しておく
if(this.layers.length)
{
	for(var idx=1;idx<=this.layers.length;idx++)
	{
		this.layers[idx].selected=false;
	}
}
	}else{
this.comment=this.comment+mySig+"\n";
var msg="セルグループ自動処理を実行します";
msg+=	nas.GUI.LineFeed;
msg+=	nas.GUI.LineFeed;
msg+=	"このコンポの名前は  ["+this.name+"]  です。";
msg+=	nas.GUI.LineFeed;
msg+=	"カレントフォルダは";
msg+=	nas.GUI.LineFeed;
msg+=	Folder.current.fsName;
msg+=	nas.GUI.LineFeed;
msg+=	" です。";

nas.otome.writeConsole(msg);

//全てのレイヤの選択を解除
if(this.layers.length)
{
	for(var idx=1;idx<=this.layers.length;idx++)
	{
		this.layers[idx].selected=false;
	}
}

//調整レイヤを作成してスムージングをかける　(ＯＬＭ)
var myLayer=this.layers.addSolid([0.5,0.5,0.5],"Smooth",this.width,this.height,1);
var mySmooth=new File("OlmSmooth.ffx");//カレントフォルダのプリセットファイルを指定
if(myLayer){
	myLayer.adjustmentLayer=true;//調整レイヤにする

	if(myLayer.index != 1)myLayer.moveToBeginning();//一番上でなかったら上へ
	if(! myLayer.selected)myLayer.selected=true;//選択されてなければ次のプリセットのため調整レイヤを選択
	myLayer.applyPresetA(mySmooth,"skipUndo");
}
//ここでスクリプト終了 次に自動で選択したレイヤにプリセットが適用される
}
	}