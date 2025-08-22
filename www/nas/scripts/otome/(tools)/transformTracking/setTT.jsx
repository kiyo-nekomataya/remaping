/*(適用)
単純にエクスプレッションとキーフレームを適用する。
6.5の場合は、独自のソースファイルを適用
7以降は、applyPresetAで適用
*/

	function doScript(myFile){

	var prevCurrentFolder=Folder.current;
	Folder.current = new Folder(myFile.path);
	var scriptFile = new File(myFile.fsName);
	scriptFile.open();
	result=eval(scriptFile.read());
	scriptFile.close();
	Folder.current = prevCurrentFolder;
	return result;
	}
//applyPresetのバグ回避代用メソッド
	AVLayer.prototype.applyPresetA=function(myFile){
	var myResult=false;
	if((myFile instanceof File) && (myFile.exists)){
		var mySelection=new Array();
		app.beginUndoGroup('myApplyPreset');
		for(var i=0;i<this.containingComp.layers.length;i++){
			mySelection.push(this.containingComp.layers[i+1].selected);
			this.containingComp.layers[i+1].selected=false;
		}

		this.selected=true;myResult=this.applyPreset(myFile);

		for(var i=0;i<this.containingComp.layers.length;i++){
			this.containingComp.layers[i+1].selected=mySelection[i];
		}
	app.endUndoGroup();	
	}else{
//		エラーメッセージが必要ならここをアクティブに 不要ならばブロックごと削除
//	alert("no File "+myFile.name);
	}
	return myResult;
	}
/*
+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
*/
	var myTtVersion="nas_tt ver0.1";//この変数で参照のこと 2008/10/10
	var doAction=false;
	var doRead=false;

//処理するオブジェクトがあればアクションフラグをあげる

if(app.project.activeItem.selectedLayers[0]){
	var targetComp=app.project.activeItem;
	var targetLayer=targetComp.selectedLayers[0];
	doAction=true;
}else{
	doAction=false;
}

if(false){
//	テンプレートファイルを読み込み(開発用)
	myTemplateFileLocation=Folder.scripts.path.toString()+"/Scripts/nas/(tools)/transformTrucking/transformTrucking.aep";
	myTemplateFile= new File(myTemplateFileLocation);
	app.open(myTemplateFile);
}else{
//現在のプロジェクトにテンプレートを読み込む(本番用)
	myTemplateFileLocation=Folder.scripts.path.toString()+"/Scripts/nas/(tools)/transformTrucking/transformTrucking.aep";
	myTemplateItem	=	new ImportOptions();
	myTemplateItem.file	=	new File(myTemplateFileLocation);
	myTemplateItem.importAs	=	ImportAsType.PROJECT;

//プロジェクトが無ければ作成
//	if(! app.project){app.newProject();}

//プロジェクト内に現行バージョンのパース支援テンプレートがあるか否か確認
	if(doAction){
/*
アイテムに"=transformTrucking="フォルダが存在せず、
かつそのバージョンが現在と一致している場合のみテンプレートを読み込む
それ以外は動作フラグを下げて、なにもしない
フォルダがあって、バージョンが整合しない場合もNOP
*/
	if(app.project.getItemByName("=transformTrucking=")){
		if(app.project.getItemByName("=transformTrucking=")[0].comment==myTtVersion){
//同バージョン読み込み済み
			doRead=false;
		}else{
//別バージョンセット済みなので動作停止
			doRead=false;	doAction=false;
		}
	}else{
//リソースが読み込まれていないので動作フラグセット
		doRead=true;
	}
	
	if(doRead){
			var myItem=app.project.importFile(myTemplateItem);
			myItem.name="=transformTrucking=";
			myItem.comment=myTtVersion;//バージョン埋め込み
	}
	}
}
//
//動作フラグがあれば、選択アイテムにコントローラを設定する
if(doAction){
		
//	選択されたアイテムがコンポ／レイヤでなければ終了
//	処理（セットアップ）済みでないか？
//レイヤコメントはAE7から使用可能 6.5では参照も不可 <注意
//	if((targetComp.layer("パースガイド"))&&(targetComp.layer("パースガイド").comment==myTtVersion)){}
	if((targetComp.layer("パースガイド"))&&(app.project.getItemByName("=transformTrucking=")[0].comment==myTtVersion)){
		//コントローラ設定済みなので処理中断
		alert("already Sett")
		doAction=false;
	}else{
//リソースを設定(アイテムを記録)
		//コントローラコンポを登録して、プリコンポ分解・種コンポを削除する
			var myStab=app.project.getItemByName("stab")[0];//種コンポセット
			var guideSet=targetComp.layers.add(myStab);//レイヤ登録
//展開スクリプトを実行
			for(var lid=1;lid<=targetComp.layers.length;lid++){targetComp.layer(lid).selected=false;}//セレクト解除
			guideSet.selected=true;//種コンポをセレクト
			doScript(new File(Folder.scripts.path.toString()+"/Scripts/nas/(tools)/transformTrucking/ExpandComp11plus.jsx"))
			targetLayer.selected=true//ターゲットレイヤ再セレクト
			guideSet.remove();//登録抹消
			targetComp.layer("メインコントローラ").effect("isScale").property(1).setValue(true);
//			targetComp.layer("パースガイド").comment=myTtVersion";//バージョン埋め込みこれは無用かレイヤソースコメントを使うべきか一考
			alert(targetComp.layer("パースガイド").name);

	}
}
if(doAction){
	//ターゲットレイヤにエクスプレッションが無ければテンプレートを適用
			if(! myPresets){var myPresets=new File();}
	var myTemplate=new File(Folder.scripts.path.toString()+"/Scripts/nas/(tools)/transformTrucking/resources/tt_client.ffx");
	//AE7以降applyPresetA()で処理
	targetLayer.applyPresetA(myTemplate);
	//AE6.5用偽テンプレート？
}
