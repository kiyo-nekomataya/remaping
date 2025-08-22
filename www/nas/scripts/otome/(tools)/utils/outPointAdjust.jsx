/*(アウトポイント後送)
 *	スクリプト名:outPointAdjust.jsx
 *		選択レイヤのアウトポイントをコンポの終端にマッチさせます。
 *		レイヤが選択されていない場合は、選択コンポ内のすべてのレイヤが対象
 *		できる限り後ろへ送りますが、レイヤの長さが足りないときは無理。
 *		レイヤの後端がコンポの終点よりも後ろの場合はコンポ終端にマッチ
 *		2007/05/06 kiyo/Nekomataya
 */
//オブジェクト識別文字列生成 
var myFilename="outPointAdjust.jsx";//正式なファイル名と置き換えてください。
var myFilerevision="1.00";//ファイルージョンはアバウトパネルで表示されます。

/*	cvs/rcs使用の方は、下の2行をご使用ください	*/
//	var myFilename=("$RCSfile: -XXX-.jsx,v $").split(":")[1].split(",")[0];
//	var myFilerevision=("$Revision: 0.01 $").split(":")[1].split("$")[0];
//

var exFlag=true;
var moduleName="outPointAdjust";//識別用のモジュール名で置き換えてください。
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
//アクティブレイヤなし
	var targetLayers=app.project.activeItem.layers;//全部選択
	var myOffset=1;
}else{
//ターゲットレイヤセット。
	var targetLayers=app.project.activeItem.selectedLayers;//
	var myOffset=0;
}
//	undoブロック開始
	nas.otome.beginUndoGroup("アウトポイント後送");
		for(idx=0;idx<targetLayers.length;idx++){
			var targetLayer=targetLayers[idx+myOffset];
			targetLayer.outPoint=app.project.activeItem.duration;
		}
//	undoブロック終了
	nas.otome.endUndoGroup();
}
		}
//スクリプト終了
