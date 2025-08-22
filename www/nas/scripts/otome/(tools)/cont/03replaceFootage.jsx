/*(フッテージ置き替え)
<jsx_03>
	コンテ分解プロジェクトのサブスクリプトです
テンプレートプロジェクト内の絵コンテフッテージを置き替えます


ファイルを指定して
そのファイルが置き替え可能であればインポートして置き替え
さらに必要な作業をうながす
*/
	var eXFlag=false;
	if(app.project.items.getByName("=絵コンテ解析=")[0].comment=="nas_stroryboard ver0.2d"){eXFlag=true};
	if(eXFlag){
if(true){

//簡易版 下が出来るまでのつなぎ(なにも判定とかしてない エラーなど知らん)
//シーケンス固定 jpg固定
//交換用シーケンス指定
//	var myFile=fileGetDialog("置き替えファイルを指定してください(シーケンスのみ)","*");
    var myFile=File.openDialog("置き替えファイルを指定してください(シーケンスのみ)","*");
	if(myFile){
//置き替え
		app.project.items.getByName("00スタビライズ")[0].layer(1).source.replaceWithSequence(myFile,false);
//ターゲットセット
	var myComp=app.project.items.getByName("00スタビライズ")[0];
	var myLayer=app.project.items.getByName("00スタビライズ")[0].layer(1);
//スタビライズ削除 削除速度が追いつかないので番号の大きな順に消す
	for(var idx=myLayer.property(3).numProperties;idx>0;idx--){
		myLayer.property(3).property(1).remove();
	}
//キーがあれば削除
	var props=["anchorPoint","position","rotation","scale","opacity"];
	for(var idx=0;idx<props.length;idx++){
		if (myLayer[props[idx]].numKeys){
			for(kidx=myLayer[props[idx]].numKeys;kidx>0;kidx--){
				myLayer[props[idx]].removeKey(kidx);
			}
		}
	}
//コンポサイズ/位置 調整
	myComp.width=myLayer.width;myComp.height=myLayer.height;
	myLayer.anchorPoint.setValue([myLayer.width/2,myLayer.height/2,0]);
	myLayer.position.setValue([myLayer.width/2,myLayer.height/2,0]);
	myLayer.rotation.setValue(0);
	myLayer.scale.setValue([100,100,100]);
	myLayer.opacity.setValue(100);
//コンポ継続時間/時間位置/InOut点 調整

	myLayer.inPoint=0;
	myLayer.startTime=0
	myLayer.outPoint=myLayer.source.duration;
	myComp.duration=myLayer.source.duration;

//用紙設定コンポのサイズ/位置/継続時間/InOut点 調整
	var ppComp  = app.project.items.getByName("01用紙登録")[0];
	var ppLayer = ppComp.layer("00スタビライズ");
	ppLayer.locked = false;
	ppComp.width   = ppLayer.width;ppComp.height=ppLayer.height;
	ppLayer.anchorPoint.setValue([ppLayer.width/2,ppLayer.height/2,0]);
	ppLayer.position.setValue([ppLayer.width/2,ppLayer.height/2,0]);
	ppLayer.rotation.setValue(0);
	ppLayer.scale.setValue([100,100,100]);
	ppLayer.opacity.setValue(100);
	ppLayer.inPoint   = 0;
	ppLayer.startTime = 0;
	ppLayer.locked    = true;

//ページコレクションコンポのサイズ/位置/継続時間/InOut点 調整
	var pgComp=app.project.items.getByName("02ページコレクション")[0];
	var pgLayer=pgComp.layer("00スタビライズ");
	pgComp.width=pgLayer.width;pgComp.height=pgLayer.height;
	pgLayer.anchorPoint.setValue([pgLayer.width/2,pgLayer.height/2,0]);
	pgLayer.position.setValue([pgLayer.width/2,pgLayer.height/2,0]);
	pgLayer.rotation.setValue(0);
	pgLayer.scale.setValue([100,100,100]);
	pgLayer.opacity.setValue(100);
	pgLayer.inPoint=0;
	pgLayer.startTime=0;
	pgLayer.outPoint=pgLayer.source.duration;
	pgComp.duration=pgLayer.source.duration;

//カラムコレクションコンポのサイズ/位置/継続時間/InOut点 調整
	var clComp=app.project.items.getByName("03カラムコレクション")[0];
	var pgCompLayer=clComp.layer("02ページコレクション");
	var pgReference=clComp.layer("01用紙登録");
	clComp.width=pgCompLayer.width;clComp.height=pgCompLayer.height;
	pgCompLayer.anchorPoint.setValue([pgCompLayer.width/2,pgCompLayer.height/2,0]);
	pgCompLayer.position.setValue([pgCompLayer.width/2,pgCompLayer.height/2,0]);
	pgCompLayer.rotation.setValue(0);
	pgCompLayer.scale.setValue([100,100,100]);
	pgCompLayer.opacity.setValue(100);
	pgCompLayer.inPoint=0;
	pgCompLayer.startTime=0;
	pgReference.locked = false;
	pgReference.anchorPoint.setValue([pgCompLayer.width/2,pgCompLayer.height/2,0]);
	pgReference.position.setValue([pgCompLayer.width/2,pgCompLayer.height/2,0]);
	pgReference.locked = true;

	}
}else{
//プロジェクトが絵コンテ分解プロジェクトであるか否か確認
	alert(app.project.items.comment)
//差し換え用画像の取得
	myStoryBoardFootageFile	=fileGetDialog("絵コンテの画像データを指定してください","*.*");

//ファイルオブジェクトがある/ファイルが実在する?/ファイルがシーケンスとしてインポート可能

	if(myStoryBoardFootageFile)
	{
		if((myStoryBoardFootageFile.name.match(/\.(psd|jpe?g|tiff?|tga)/i)))
//canInportWithSeq(file)
		if(myStoryBoardFootageFile.name.match(/\.(mov|avi)/i))
	myStoryBoardFootageItem.importAs	=	ImportAsType.FOOTAGE;

//シーケンスで入れ替え
	app.project.items.getByName("00スタビライズ")[0].layer(1).source.replaceWithSequence(myStoryBoardFootageFile,false);
//ムービーで入れ替え(スチルはダメ)
	app.project.items.getByName("00スタビライズ")[0].layer(1).source.replace(myStoryBoardFootageFile);
	
	}
}

//ファイルがシーケンス命名規則に乗っているか否かを返す関数 ライブラリか?
function canImportWithSeq(myFile){
	if (myFile.name.macth(/^(.*[^0-9])?([0-9]+)\.([^\.]+)$/)){
		//シーケンス名規則に乗っているか?
		//マッチしたら、同階層の同シーケンスファイルが複数あるか否かを見る
		var myPrefix	=RegExp.$1;
		var myNumCoount	=RegExp.$2.length;
		var myPostfix	=RegExp.$3;
			
		var myTargetFolder= new Folder(myFile.path)
		myFiles=myTragetFolder.getFiles();
		for (var fidx=0;fidx<myFiles.length;fidx++){
			myFiles[fidx].name.match
		}
	}
}

//対象オブジェクトがなければ何もしない
	if(!(nas["eStoryBoard"])){
//	プロジェクトが無い
//	doScript(new File(Folder.scripts.path.toString()+"/Scripts/nas/(tools)/cont/010storyBoard.jsx"));
}else{
//オブジェクトがあるのでクローズ/再読み込みで 初期化
//	nas["eStoryBoard"].nameDialog.close();
//	doScript(new File(Folder.scripts.path.toString()+"/Scripts/nas/(tools)/cont/010storyBoard.jsx"));
}
	}