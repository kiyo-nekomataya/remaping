//no launch
/*(扇)
 *	スクリプト名:renOugi.jsx
 *
 *		このファイルは、nas ライブラリを使用してGUI付きのAEスクリプトを
 *		作成するためのテンプレートです。パレット用
 *
 *		このファイルの手続きが標準の処理ですが、処理内容によっては
 *		かなり冗長な内容になっています。
 *		あなたの用途にしたがって書き換えてご使用ください。
 *		2006/05/10 kiyo/Nekomataya
 */
//オブジェクト識別文字列生成 
//var myFilename="renOugi.jsx";//正式なファイル名と置き換えてください。
//var myFilerevision="0.01";//ファイルージョンはアバウトパネルで表示されます。

/*	cvs/rcs使用の方は、下の2行をご使用ください	*/
	var myFilename=("$RCSfile: renOugi.jsx,v $").split(":")[1].split(",")[0];
	var myFilerevision=("$Revision: 1.1.2.3 $").split(":")[1].split("$")[0];
//

var exFlag=true;
var moduleName="renOugi";//識別用のモジュール名で置き換えてください。
//二重初期化防止トラップ
try{
	if(nas.Version)
	{
		nas.Version[moduleName]=moduleName+" :"+myFilename+" :"+myFilerevision;
	//現在のモジュール名とバージョンを登録する
		try{
if(nas[moduleName]){
//モジュールがオンメモリ(すでに初期化されている)場合の処理
	exFlag=true;//本来の初期化コマンドを無効にします。
//	nas[moduleName][myWindowName].show();
/*
	この部分は再初期化コマンドで置き換えてください。上の行は例です。
	現在のモジュール(ウインドウ)の表示メソッドを呼んでいます。
	すでに読み込み済みのモジュールを再度初期化することを防止するための処理です。
 */
}else{
//このスクリプトの識別モジュール名を登録します。
	nas[moduleName]=new Object();
}
		}catch(err){
//エラー時の処理をします。
	nas[moduleName]=new Object();
//		強制的に初期化(モジュール名登録)して。実行
//	alert("エラーです。モジュール登録に失敗しました");exFlag=false;
//		または終了
		}
	}
}catch(err){
//nas 環境自体がない(ライブラリがセットアップされていない)時の処理(終了)
	alert("nasライブラリが必要です。\nnasStartup.jsx を実行してください。");
	exFlag=false;
}
//初期化およびGUI設定
if(exFlag){
	/*----この下に初期化スクリプトを記述してください。----*/

//	各種プロパティ・メソッド等を初期

	if(! (app.project.activeItem instanceof CompItem)){
		alert("コンポを選択した状態で実行してください。");
	}else{
		var myComp=app.project.activeItem;
	}

// システム設定に置いたウィンドウのオフセットが必要な場合はこれで取得します。
// ウインドウを使用しない場合は削除してください。

	var myWindowName	="renOugi";//モジュール配下のウィンドウ名をできる限りユニークに
/*	他のプログラムのウィンドウ名とコンフリクトした場合はウィンドウ位置が共有されますので注意	*/

	var myDefaultLeft	=nas.GUI.dafaultOffset[0];//ウィンドウ位置初期値を設定したい場合は
	var myDefaultTop	=nas.GUI.dafaultOffset[1];//お好きな値で置き換えてください。

	myLeft=(nas.GUI.winOffset[myWindowName])?
	nas.GUI.winOffset[myWindowName][0] : myDefaultLeft;
	myTop=(nas.GUI.winOffset[myWindowName])?
	nas.GUI.winOffset[myWindowName][1] : myDefaultTop;

// ///////////// GUI 設定 /////////////
// ウインドウ初期化
	nas[moduleName][myWindowName]=nas.GUI.newWindow("palette","連扇",5,5,myLeft,myTop);
// ウィンドウにコントロールを配置

	/*----ここにコントロールを記述してください。----*/
//コンポセレクタ
	nas[moduleName][myWindowName].compSelector=nas.GUI.addSelectButton(nas.renOugi.renOugi,"<コンポ選択>",0,0,1,5,1);
	nas[moduleName][myWindowName].button01=nas.GUI.addButton(nas.renOugi.renOugi,"host設定",.5,2,4,1);

	nas[moduleName][myWindowName].button01=nas.GUI.addStaticText(nas.renOugi.renOugi,"client数",0,3,2,1).justify="right";
	nas[moduleName][myWindowName].button01=nas.GUI.addEditText(nas.renOugi.renOugi,"",2,3,1,1);

	nas[moduleName][myWindowName].button01=nas.GUI.addButton(nas.renOugi.renOugi,"client作成",0,4,2.5,1);
	nas[moduleName][myWindowName].button02=nas.GUI.addButton(nas.renOugi.renOugi,"client消去",2.5,4,2.5,1);
// コントロールのイベント設定

	/*----ここにコントロールの動作を記述してください。----*/

//	ウィンドウ最終位置を記録(不要ならば削除してください。)
	nas[moduleName].onMove=function(){
nas.GUI.winOffset[myWindowName] =[nas[moduleName][myWindowName].bounds[0],nas[moduleName][myWindowName].bounds[1]];
	}
// ///////////// GUI 設定 終り ウィンドウ表示 /////////////
	nas[moduleName][myWindowName].show();

};
	/*---- この下には初期化の必要ないコマンドを書くことが出来ます。----*/

//スクリプト終了
