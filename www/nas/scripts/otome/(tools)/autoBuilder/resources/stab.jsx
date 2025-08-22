/*(00-stab)
	このファイルは自動実行スクリプトのサンプルです
	オートビルダの自動実行ファイルは、コンポアイテムのメソッドして実行されます
	スクリプト内でthisプロパティはコンポアイテムを指します。
	
	実行時にコンポアイテムの判定を行なうと動作を切り分けることができます。
	
	ナンバリングされていないファイルは自動実行の対象にはなりません。
	同じフォルダにあるリソースを使用する場合は
	実行時点でカレントがスクリプトのあるフォルダにをさしているので
	Folder.current オブジェクトをご利用ください。
*/
var exFlag=false;
if(this instanceof CompItem){exFlag=true};//コンポのメソッドであった場合フラグを立てる
if(exFlag){
var msg="";
msg+=	nas.GUI.LineFeed;
msg+=	nas.GUI.LineFeed;
msg+=	"このコンポの名前は  ["+this.name+"]  です。";
msg+=	nas.GUI.LineFeed;
msg+=	"カレントフォルダは";
msg+=	nas.GUI.LineFeed;
msg+=	Folder.current.fsName;
msg+=	nas.GUI.LineFeed;
msg+=	" です。";

alert(msg);
/*
	以下サンプルコードです
*/
//　このアクションフォルダ内のアニメーションテンプレートをコンポの特定の名前のレイヤに適用する
var mytargetLayer=this.layer("レイヤ名");//レイヤのメソッドで取得する
//取得に成功すると変数にレイヤオブジェクトが入るので実行
	if(mytargetLayer instanceof AVLayer){
	var myTargetFFX=new File("ファイル名.ffx");//同じフォルダ内のファイルは名前だけでアクセス可能です
		if(myTargetFFX.exists)
		{
//			念のためにファイルの存在を確認したほうが良いと思いますが、省略も可能です
			mytargetLayer.applyPresetA(myTargetFFX,"skipUndo");
/*	nasライブラリが動く状態なら　Layer.applyPresetA()メソッドが使えます

	ファイルの後にfalse以外のパラメータを加えておくとundoGroupを設定しません。
	アクションフォルダ全体にundoGroupが設定されるのでスクリプトの内部で
	アニメーションテンプレートを適用するときはこのオプションを推奨します。
*/
		}
	}
//このコンポに新しい調整レイヤを付ける
	//調整レイヤは普通の平面です　色は見えなくなっちゃうので何でもかまいません
	var myLayer=this.layers.addSolid([0.5,0.5,0.5],"調整レイヤ",this.width,this.height,1);
	myLayer.adjustmentLayer=true;//このプロパティで調整レイヤにします
	if(myLayer.index != 1)myLayer.moveToBeginning();//ここで必要な位置へ移動しておくのが良いでしょう

//特定の名前のコンポをこのコンポのレイヤに取り込む
	var myExtComp=app.project.items.getByName("コンポ名"); 
/*	nasライブラリが動く状態なら　ItemColection.getByName()メソッドが使えます

	items　に含まれるアイテムの中で同じ名前のアイテムを返します。
	同名前のアイテムがある場合はプロジェクトの上にある方を返します。
	（つまり並べ替えると返り値がかわるかも）
	ないときはFalseを戻します。この返り値は必ず検査したほうが良いです
*/
	if((myExtComp)&&(myExtComp instanceof CompItem)){
		var myNewLayer=this.layers.add(myExtComp);//正常な場合のレイヤとして登録
	}

}else{
//	こちらには通常起動された場合の処理を書いてください
alert("このスクリプトはアクションファイルとして呼び出してください。");
}