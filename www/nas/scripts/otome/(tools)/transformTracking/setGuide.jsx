/*(コントローラ配置)
リソースのバージョン確認
リソースが見込まれていなければ、新規に読み込み
選択されたレイヤがあれば、そのレイヤにパースガイドの情報を参照するプリセットを適用して
テンプレートプロジェクトを開きます。(開発およびカスタマイズ用)
上書き保存すると、テンプレートが上書きされます。
*/
/*
コンポ展開ルーチンを乙女ライブラリに組み込むこと
ロック状態の解除と復帰を組み込むこと
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
/*	乙女に移動済み
//applyPresetのバグ回避代用メソッド 代用メソッドは機会を作って　バージョン監視のルーチンつけてスタートアップに組み込む
	AVLayer.prototype.applyPresetA=function(myFile){
	var myResult=false;
	if((myFile instanceof File) && (myFile.exists)){
		var mySelection=new Array();
		nas.otome.beginUndoGroup('myApplyPreset');
		for(var i=0;i<this.containingComp.layers.length;i++){
			mySelection.push(this.containingComp.layers[i+1].selected);
			this.containingComp.layers[i+1].selected=false;
		}

		this.selected=true;myResult=this.applyPreset(myFile);

		for(var i=0;i<this.containingComp.layers.length;i++){
			this.containingComp.layers[i+1].selected=mySelection[i];
		}
	nas.otome.endUndoGroup();	
	}else{
//		エラーメッセージが必要ならここをアクティブに 不要ならばブロックごと削除
//	alert("no File "+myFile.name);
	}
	return myResult;
	}
*/

/*
+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
*/
	var myTtVersion="nas_tt ver0.1";//この変数で参照のこと 2008/10/10
	var doAction=false;
	var doRead=false;
	var isScale=false;//
//処理するオブジェクトがあればアクションフラグをあげる

if(app.project.activeItem.selectedLayers[0]){
	var targetComp=app.project.activeItem;
	var targetLayer=targetComp.selectedLayers[0];
	doAction=true;
}else{
	doAction=false;
	alert("no selected layer");
}

if(true){
//現在のプロジェクトにテンプレートを読み込む
	if((app.version.split(".")[0]*1)<8)
	{
		myTemplateFileLocation=Folder.scripts.path.toString()+"/Scripts/nas/(tools)/transformTrucking/transformTrucking.aep";
	}else{
		myTemplateFileLocation=Folder.scripts.path.toString()+"/Scripts/nas/(tools)/transformTrucking/transformTrucking_cs3.aep";
	}
	myTemplateItem	=	new ImportOptions();
	myTemplateItem.file	=	new File(myTemplateFileLocation);
	myTemplateItem.importAs	=	ImportAsType.PROJECT;

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
//undoセット
nas.otome.beginUndoGroup("load TT resource");
			var myItem=app.project.importFile(myTemplateItem);
			myItem.name="=transformTrucking=";
			myItem.comment=myTtVersion;//バージョン埋め込み
			myItem.selected=false;//アクティベート解除
nas.otome.endUndoGroup();
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
	
nas.otome.beginUndoGroup("set TT Controler-A");
{
//リソースを設定(アイテムを記録)
//コントローラコンポを登録して、プリコンポ分解・種コンポを削除する
//			alert(app.project.getItemByName("stab").length);//種コンポセット
			var myStab=app.project.getItemByName("stab")[0];//種コンポセット
			var guideSet=targetComp.layers.add(myStab);//レイヤ登録

//展開スクリプトを実行
//alert(targetComp.name)
			for(var lid=1;lid<=targetComp.layers.length;lid++){targetComp.layer(lid).selected=false;};//セレクト解除
			guideSet.moveBefore(targetLayer);//レイヤをターゲットの直上に移動
			targetComp.selected=true;
			guideSet.selected=true;//種コンポをセレクト
}
nas.otome.endUndoGroup();
var myExpandScript=new File(Folder.scripts.path.toString()+"/Scripts/nas/(tools)/transformTrucking/ExpandComp11plus.jsx");
			doScript(myExpandScript);
nas.otome.beginUndoGroup("set TT Controler2")
{
			guideSet.remove();//登録抹消
//adjust in/out points
			var myLayers=[
				"ガイドポイント",
				"パースガイド",
				"消失点参考",
				"消失点コントローラ",
				"メインコントローラ",
				"クリップマット",
				"パースガイド"
			];
			for (var idx in myLayers){
				var wasLocked=false;
				if(targetComp.layer(myLayers[idx]).locked){targetComp.layer(myLayers[idx]).locked=false;wasLocked=true;}
				targetComp.layer(myLayers[idx]).inPoint=0;
				targetComp.layer(myLayers[idx]).outPoint=targetComp.duration;		
				if(wasLocked){targetComp.layer(myLayers[idx]).locked=wasLocked};
			}
//ここでスケールとスキューを切り替え
//ガイドレイヤ、参考レイヤをロックする
			targetComp.layer("パースガイド").locked=true;
if(isScale){			targetComp.layer("消失点参考").locked=true;
//スケールモードなのでクリップマット削除
			targetComp.layer("メインコントローラ").effect("isScale").property(1).setValue(true);//スケール
			targetComp.layer("クリップマット").remove();
}else{
//スキューモードなのでターゲットを複製してクリップマットの下へ移動　ペアレントを設定してロック クリップマットの位置をリセット
			targetComp.layer("メインコントローラ").effect("isScale").property(1).setValue(false);//スキュー
			targetComp.layer("クリップマット").position.setValue([0,0]);
			//targetComp.layer("クリップマット").rocked=true;//非表示なので選択操作回避の為のロックは不要
			var ovlLayer=targetLayer.duplicate();
			ovlLayer.moveAfter(targetComp.layer("クリップマット"));
			ovlLayer.trackMatteType=TrackMatteType.ALPHA;
			ovlLayer.parent=targetLayer;

			ovlLayer.locked=true;
};
			targetLayer.selected=true;//ターゲットレイヤ再セレクト
}

	nas.otome.endUndoGroup();
	// app.endUndoGroup();
};

///////-
};

//以下はメソッド内部でundoGroupが存在するので別処理
if((doAction)&&(appHost.version>=7)){
//	nas.otome.beginUndoGroup("set TT expression");
	//ターゲットレイヤにエクスプレッションが無ければテンプレートを適用(未判定なので注意)
			if(! myPresets){var myPresets=new File();}
	var myTemplate=new File(Folder.scripts.path.toString()+"/Scripts/nas/(tools)/transformTrucking/resources/tt_client.ffx");
	//AE7以降applyPresetA()で処理
	targetLayer.applyPresetA(myTemplate);
	//AE6.5用偽テンプレート？
	if(! isScale){
				if(! myPresets){var myPresets=new File();}
		var myTemplate2=new File(Folder.scripts.path.toString()+"/Scripts/nas/(tools)/transformTrucking/resources/tt_client_noDeform.ffx");
		//AE7以降applyPresetA()で処理
		if(ovlLayer.locked){ovlLayer.locked=false;}
		ovlLayer.applyPresetA(myTemplate2);
		if(! (ovlLayer.locked)){ovlLayer.locked=true;}
	}

}

