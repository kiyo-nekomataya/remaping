//no launch
/*(血球光設定)
 *	スクリプト名:corpuscleEffects.jsx
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
//var myFilename="corpuscleEffects.jsx";//正式なファイル名と置き換えてください。
//var myFilerevision="0.01";//ファイルージョンはアバウトパネルで表示されます。

/*	cvs/rcs使用の方は、下の2行をご使用ください	*/
	var myFilename=("$RCSfile: corpuscleEffects.jsx,v $").split(":")[1].split(",")[0];
	var myFilerevision=("$Revision: 1.1.2.2 $").split(":")[1].split("$")[0];
//

var exFlag=true;
var moduleName="corpuscle";//識別用のモジュール名で置き換えてください。
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
//ターゲットのコンポにすでに「XXX効果」レイヤがある場合は処理スキップ
	if(app.project.activeItem.layers.byName("血球光")){alert("コンポに「XXX効果」レイヤがあります。\nすでに処理済みのようなので処理をスキップします。");
	}else{
if (app.project.activeItem.selectedLayers.length==0){
	alert("レイヤを選択してください。");//選択レイヤなし
}else{
//ターゲットレイヤが複数の場合は、プリコンポーズしてターゲットレイヤをひとつにする。
	if(app.project.activeItem.selectedLayers.length==1){
		targetLayer=app.project.activeItem.selectedLayers[0];
	}else{
		var newCompName=app.project.activeItem.name+"XXXプリコンポ";
		newCompName=prompt("複数レイヤをプリコンポーズします。\nコンポの名前を指定してください。",newCompName);
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
//	undoブロック開始
	app.beginUndoGroup("XXXの設定");



//	undoブロック終了
	app.endUndoGroup();
	}
}
	}
		}
			}
//スクリプト終了
