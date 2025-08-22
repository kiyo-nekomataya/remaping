/*(照明効果設定)
 *	スクリプト名:lightEffects.jsx
 *
 *	選択レイヤに擬似照明効果を乗せます。
 *	プリコンポになりますので、プリコンポ側で調整してください
 *		2006/05/06 kiyo/Nekomataya
 */
//オブジェクト識別文字列生成 
var myFilename="lightEffects.jsx";
var myFilerevision="1.0";

/*	cvs/rcs使用の方は、下の2行をご使用ください	*/
//	var myFilename=("$RCSfile: -XXX-.jsx,v $").split(":")[1].split(",")[0];
//	var myFilerevision=("$Revision: 0.01 $").split(":")[1].split("$")[0];
//

var exFlag=true;
var moduleName="lightEffects";//識別用のモジュール名で置き換えてください。
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

if (app.project.activeItem.selectedLayers.length==0){
	alert("レイヤを選択してください。");//選択レイヤなし
}else{
//ターゲットレイヤをプリコンポーズしてターゲットレイヤを得る。
//	この効果は選択レイヤが一つであっても必ずプリコンポしてグループレイヤを取得する
	var newCompName=app.project.activeItem.name+"照明セル";
	newCompName=prompt("対象レイヤをプリコンポーズします。\nコンポの名前を指定してください。",newCompName);
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
//選択したレイヤに画像がなければ何もしないで終了…位置変えないとまずいかも
	if(targetLayer instanceof AVLayer){
//	undoブロック開始
	app.beginUndoGroup("擬似照明設定");



//	undoブロック終了
	app.endUndoGroup();
	}
}
		}
			}
//スクリプト終了
