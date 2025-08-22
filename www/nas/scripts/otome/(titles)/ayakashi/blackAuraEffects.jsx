/*(黒オーラ設定)
 *	スクリプト名:blackAuraEffects.jsx
 *
 *		このファイルは、nas ライブラリを使用してエフェクト設定スクリプトを
 *		作成するためのテンプレートです。
 *
 *		このファイルの手続きが標準の処理ですが、処理内容によっては
 *		かなり冗長な内容になっています。
 *		あなたの用途にしたがって書き換えてご使用ください。
 *		2006/10/21 kiyo/Nekomataya
 */
//オブジェクト識別文字列生成 
//var myFilename="blackAuraEffects.jsx";//正式なファイル名と置き換えてください。
//var myFilerevision="0.01";//ファイルージョンはアバウトパネルで表示されます。

/*	cvs/rcs使用の方は、下の2行をご使用ください	*/
	var myFilename=("$RCSfile: blackAuraEffects.jsx,v $").split(":")[1].split(",")[0];
	var myFilerevision=("$Revision: 1.1.2.3 $").split(":")[1].split("$")[0];
//

var exFlag=true;
var moduleName="blackAura";//識別用のモジュール名で置き換えてください。
//二重初期化防止トラップ
try{
	if(nas.Version)
	{
		nas.Version[moduleName]=moduleName+" :"+myFilename+" :"+myFilerevision;
	//現在のモジュール名とバージョンを登録する
		try{
if(nas[moduleName]){
//モジュールがオンメモリ(すでに初期化されている)場合の処理
	exFlag=false;//常駐部分初期化コマンドを無効にします。
/*
	この部分は再初期化コマンドで置き換えてください。上の行は例です。
	すでに読み込み済みのモジュールを再度初期化することを防止するための処理です。
 */
}else{
//このスクリプトの識別モジュール名をnasサービスに登録します。
	nas[moduleName]=new Object();
}
		}catch(err){
//エラー時の処理をします。
//	nas[moduleName]=new Object();
//		強制的に初期化(モジュール名登録)して。実行
	alert("エラーです。モジュール登録に失敗しました");exFlag=false;
//		または終了
		}
	}
}catch(err){
//nas 環境自体がない(ライブラリがセットアップされていない)時の処理(終了)
	alert("nasライブラリが必要です。\nnasStartup.jsx を実行してください。");
	exFlag=false;
}
//初期化およびGUI設定
	/*----変数などの初期化を行ってください----*/

//常駐部分の初期化
if(exFlag){
	/*----この下に常駐部分の初期化スクリプトを記述してください。----*/


//	各種プロパティ・メソッド等を初期化


};

	/*---- この下には非常駐部分のコマンドを置きます。main----*/
			if(!( app.project)){
//	プロジェクトがないのでもう何もしません。
			}else{
		if(!(app.project.activeItem instanceof CompItem)){
			alert("アクティブコンポがありません。")	
		}else{
//ターゲットのコンポにすでに「黒オーラ効果」レイヤがある場合は処理スキップ
	if(app.project.activeItem.layers.byName("黒オーラ効果(下地)")){alert("コンポに「黒オーラ効果」レイヤがあります。\nすでに処理済みのようなので処理をスキップします。");
	}else{
if (app.project.activeItem.selectedLayers.length==0){
	alert("レイヤを選択してください。");//選択レイヤなし
}else{
//ターゲットレイヤを、プリコンポーズしてひとつにまとめる。
	if(app.project.activeItem.selectedLayers.length==1){
		targetLayer=app.project.activeItem.selectedLayers[0];
	}else{
		var newCompName=app.project.activeItem.name+"黒オーラマスク";
		newCompName=prompt("複数レイヤをプリコンポーズします。\nコンポの名前を指定してください。",newCompName);
		while(nas.biteCount(newCompName)>31){
			newCompName=prompt("名前が長すぎるような気がする。\n短くしてほしい。",newCompName);
		};
		if(newCompName){
			var myLayers=new Array();
			for (idx=app.project.activeItem.selectedLayers.length-1; idx>=0; idx--){
				myLayers.push(app.project.activeItem.selectedLayers[idx].index);
			};
			app.project.activeItem.layers.precompose(myLayers,newCompName,true);
			targetLayer=app.project.activeItem.selectedLayers[0];
		}else{
			targetLayer=null;
		}
	}
	if(targetLayer instanceof AVLayer){
	targetComp=app.project.activeItem;//控えておく
//	ターゲットレイヤ事前処理

//事前処理プリコンポ作成
		var newCompName=app.project.activeItem.name+"黒オーラ事前処理";
		newCompName=prompt("事前処理します。\nコンポの名前を指定してください。",newCompName);
		while(nas.biteCount(newCompName)>31){
			newCompName=prompt("名前が長すぎるような気がする。\n短くしてほしい。",newCompName);
		};
			if(newCompName){

//	undoブロック開始
	app.beginUndoGroup("黒オーラ事前処理");			var myLayers=new Array();
			for (idx=app.project.activeItem.selectedLayers.length-1; idx>=0; idx--){
				myLayers.push(app.project.activeItem.selectedLayers[idx].index);
			};
			myPrecomp=app.project.activeItem.layers.precompose(myLayers,newCompName,true);
			targetLayer=app.project.activeItem.selectedLayers[0];//新ターゲットレイヤ控え
//	事前処理
		myPrecomp.layer(1);
//	レイヤのエフェクトをすべて削除
		if(myPrecomp.layer(1).property("Effects").numProperties>0){
			effectsCount=myPrecomp.layer(1).property("effect").numProperties;
			for(idx=1;idx<=effectsCount;idx++){myPrecomp.layer(1).property("effect").property(idx).remove();}
		}
//	センタトラッカー設置（null）
		ctrLayer=myPrecomp.layers.addNull();
			ctrLayer.name="センタトラッカー";
			ctrLayer.anchorPoint.expression="[50,50]";
			ctrLayer.scale.setValue([1000,1000]);
//	調整レイヤを作ってぼかし反転（直接かけてもよいが入れ替え時のハンドリングのために調整レイヤ）
		myAdjustmentLayer=myPrecomp.layers.addSolid([1,1,1],"反転・ぼかし",myPrecomp.width,myPrecomp.height,myPrecomp.pixelAspect,myPrecomp.duration);
			myAdjustmentLayer.adjustmentLayer=true;
			myAdjustmentLayer.property("Effects").addProperty("反転");
			myAdjustmentLayer.property("Effects").addProperty("ブラー(滑らか)");
			myAdjustmentLayer.effect.property("ブラー(滑らか)").property(1).setValue(200);
			myAdjustmentLayer.effect.property("ブラー(滑らか)").property(1).expression=decodeURI("50+150*((thisComp.layer(%22%E3%82%BB%E3%83%B3%E3%82%BF%E3%83%88%E3%83%A9%E3%83%83%E3%82%AB%E3%83%BC%22).scale%5B0%5D-100)/900)");
			myAdjustmentLayer.effect.property("ブラー(滑らか)").property(3).setValue(true);
//	マチエル設定
		textureLayer=myPrecomp.layers.addSolid([1,1,1],"オーラテクスチャ",myPrecomp.width,myPrecomp.height,myPrecomp.pixelAspect,myPrecomp.duration);
			textureLayer.property("Effects").addProperty("カラーカーブ");//カラーカーブ
			textureLayer.effect.property("カラーカーブ").property(1).expression=decodeURI("thisComp.layer(%22%E3%82%BB%E3%83%B3%E3%82%BF%E3%83%88%E3%83%A9%E3%83%83%E3%82%AB%E3%83%BC%22).position");//
			textureLayer.effect.property("カラーカーブ").property(2).setValue([1,1,1,1]);//白
			textureLayer.effect.property("カラーカーブ").property(3).expression=decodeURI("myWidth%09=thisComp.layer(%22%E3%82%BB%E3%83%B3%E3%82%BF%E3%83%88%E3%83%A9%E3%83%83%E3%82%AB%E3%83%BC%22).width*thisComp.layer(%22%E3%82%BB%E3%83%B3%E3%82%BF%E3%83%88%E3%83%A9%E3%83%83%E3%82%AB%E3%83%BC%22).scale%5B0%5D/200;%0DmyHeight=thisComp.layer(%22%E3%82%BB%E3%83%B3%E3%82%BF%E3%83%88%E3%83%A9%E3%83%83%E3%82%AB%E3%83%BC%22).height*thisComp.layer(%22%E3%82%BB%E3%83%B3%E3%82%BF%E3%83%88%E3%83%A9%E3%83%83%E3%82%AB%E3%83%BC%22).scale%5B1%5D/200;%0Dadd(thisComp.layer(%22%E3%82%BB%E3%83%B3%E3%82%BF%E3%83%88%E3%83%A9%E3%83%83%E3%82%AB%E3%83%BC%22).position,%5BmyWidth,myHeight%5D);%0D");//
			textureLayer.effect.property("カラーカーブ").property(4).setValue([0,0,0,1]);//黒
			textureLayer.effect.property("カラーカーブ").property(5).setValue(2);//放射カーブ
			textureLayer.effect.property("カラーカーブ").property(6).setValue(20);//拡散


			textureLayer.property("Effects").addProperty("フラクタルノイズ");//フラクタルノイズ
			textureLayer.effect.property("フラクタルノイズ").property(16).setValue(6);//複雑度エクスプレッション?
			textureLayer.effect.property("フラクタルノイズ").property(24).expression=decodeURI("6*(time/thisComp.frameDuration)%25360;");//展開エクスプレッション
			textureLayer.effect.property("フラクタルノイズ").property(26).setValue(true);//展開サイクル
			textureLayer.effect.property("フラクタルノイズ").property(31).setValue(5);//乗算

			textureLayer.property("Effects").addProperty("レベル").name="レベル1";//レベル
			textureLayer.effect.property("レベル1").property("白を入力").setValue(128/255);
			textureLayer.effect.property("レベル1").property("ガンマ").setValue(.3);

			textureLayer.property("Effects").addProperty("レベル").name="レベル2";//レベル
			textureLayer.effect.property("レベル2").property("ガンマ").setValue(2.5);

			textureLayer.property("Effects").addProperty("ブラー(放射状)");//ブラー(放射状)
			textureLayer.effect.property("ブラー(放射状)").property(3).expression=decodeURI("thisComp.layer(%22%E3%82%BB%E3%83%B3%E3%82%BF%E3%83%88%E3%83%A9%E3%83%83%E3%82%AB%E3%83%BC%22).position");
			textureLayer.effect.property("ブラー(放射状)").property(4).setValue(1);//スピン

			textureLayer.property("Effects").addProperty("CC Vector Blur");//CC Vector Blur
			textureLayer.effect.property("CC Vector Blur").property(2).expression=decodeURI("10+10*((thisComp.layer(%22%E3%82%BB%E3%83%B3%E3%82%BF%E3%83%88%E3%83%A9%E3%83%83%E3%82%AB%E3%83%BC%22).scale%5B0%5D-100)/900)");//

			textureLayer.blendingMode=BlendingMode.MULTIPLY;//乗算100%
//
			ctrLayer.moveBefore(textureLayer);//入れ替え
//
//	undoブロック終了
	app.endUndoGroup();

//	undoブロック開始
	app.beginUndoGroup("黒オーラ設定");
//	上から順
//	元コンポのターゲットレイヤを複製してモード変更差分合成１００％
	diffLayer=targetLayer.duplicate();
		diffLayer.blendingMode=BlendingMode.DIFFERENCE;
		diffLayer.name="黒オーラ効果(差合成)";
//	ターゲットレイヤを複製して非表示（ルミナンスマット）
	maskLayer=targetLayer.duplicate();
		maskLayer.visibel=false;
//	調整レイヤを作成　カーブ設定　モード変更覆い焼き50%
	myAdjustmentLayer=targetComp.layers.addSolid([1,1,1],"色調整",targetComp.width,targetComp.height,targetComp.pixelAspect,targetComp.duration);
			myAdjustmentLayer.adjustmentLayer=true;
			myAdjustmentLayer.property("Effects").addProperty("レベル (個々の制御)");

			myAdjustmentLayer.effect.property("レベル (個々の制御)").property("赤から黒を出力").setValue(128/255);
			myAdjustmentLayer.effect.property("レベル (個々の制御)").property("緑から黒を出力").setValue(128/255);
			myAdjustmentLayer.effect.property("レベル (個々の制御)").property("青から白を出力").setValue(128/255);
			myAdjustmentLayer.effect.property("レベル (個々の制御)").property("ガンマ").setValue(.5);
			myAdjustmentLayer.opacity.setValue(50);
			myAdjustmentLayer.moveAfter(maskLayer);
			myAdjustmentLayer.trackMatteType=TrackMatteType.LUMA;
			myAdjustmentLayer.blendingMode=BlendingMode.LINEAR_DODGE;
			myAdjustmentLayer.name="黒オーラ効果(色付け)";
//	ターゲットレイヤをモード変更スクリーン50%
	targetLayer.blendingMode=BlendingMode.SCREEN;
	targetLayer.opacity.setValue(50);
	targetLayer.name="黒オーラ効果(下地)";
//	

//	undoブロック終了
	app.endUndoGroup();
		}
	}
}
	}
		}
			}
//スクリプト終了

