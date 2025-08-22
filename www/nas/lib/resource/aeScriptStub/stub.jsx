/*(GUIサンプル)
<アイコン指定>

 *	スクリプト名:stub.js
 *
 *		このファイルは、nas ライブラリを使用してGUI付きのAEスクリプトを
 *		作成するためのテンプレートです。パレット/UIパレット兼用
 *
 *		このファイルの手続きが標準の処理ですが、処理内容によっては
 *		かなり冗長な内容になっています。
 *		あなたの用途にしたがって書き換えてご使用ください。
 *		2010/03/13 kiyo/Nekomataya
 */
//オブジェクト識別文字列生成 
var myFilename="stub.js";//正式なファイル名と置き換えてください。
var myFilerevision="0.01";//ファイルージョンはアバウトパネルで表示されます。

/*	cvs/rcs使用の方は、下の2行をご使用ください	*/
//	var myFilename=("$RCSfile: stub.js,v $").split(":")[1].split(",")[0];
//	var myFilerevision=("$Revision: 1.1.4.3 $").split(":")[1].split("$")[0];
//

var exFlag=true;
var moduleName="PaletteOrPanelStub";//識別用のモジュール名で置き換えてください。
var myWindowName	="StubWindow";//モジュール配下のメインウィンドウ名をできる限りユニークに
/*	他のプログラムのウィンドウ名とコンフリクトした場合はウィンドウ位置が共有されますので注意	*/

//二重初期化防止トラップ
try{
	if(nas.Version)
	{
		nas.Version[moduleName]=moduleName+" :"+myFilename+" :"+myFilerevision;
	//現在のモジュール名とバージョンをnasモジュールに登録する
		try{
if(nas[moduleName]){
//モジュールがオンメモリ(すでに初期化されている)場合の処理
	exFlag=false;//初期化コマンドを無効にします。
	
	if((this)&&(this instanceof Panel)){
//パネルの場合は無条件で初期化停止
//ドッキングパネルコンフリクト　実際はこの動作はほとんどない　違うファイル名で同じモジュールを立ち上げようとした場合が主なパターン
//ウインドウ起動済みのモジュールをUIパネルで立ち上げようとした場合もプログラムの起動を停止できないので
//アラート表示して　初期化処理停止　実行キャンセル		
	
	var msg="すでにモジュールが起動されています。"+nas.GUI.LineFeed;
	msg+="リソースの衝突防止のため二重起動は禁止されています。"+nas.GUI.LineFeed;
	msg+="初期化はスキップされます。"+nas.GUI.LineFeed;
	msg+="ウインドウを閉じて起動しなおしてください。"+nas.GUI.LineFeed;
	alert(msg);
	}else{
	//パネル以外場合の再初期化コマンドをここに
		if(nas[moduleName].isDockingPanel)
		{
//ドッキングパネルで起動されているモジュールの場合はアラートを表示して全ての動作をスキップ
	var msg="すでにモジュールがドッキングパネルで起動されています。"+nas.GUI.LineFeed;
	msg+="リソースの衝突防止のため二重起動は禁止されています。"+nas.GUI.LineFeed;
	msg+="初期化はスキップされます。"+nas.GUI.LineFeed;
	alert(msg);
		}else{
//ウィンドウ起動の場合は、実行処理をスキップして既存のオブジェクトにフォーカスをうつす
		nas[moduleName][myWindowName].show();
		}
	}
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
	nas[moduleName].isDockingPanel=(this instanceof Panel)?true:false;
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

//	各種プロパティ・メソッド等を初期化

// システム設定に置いたウィンドウのオフセットが必要な場合はこれで取得します。
// ウインドウを使用しない場合は削除してください。


	var myDefaultLeft	=nas.GUI.dafaultOffset[0];//ウィンドウ位置初期値を設定したい場合は
	var myDefaultTop	=nas.GUI.dafaultOffset[1];//お好きな値で置き換えてください。

	myLeft=(nas.GUI.winOffset[myWindowName])?
	nas.GUI.winOffset[myWindowName][0] : myDefaultLeft;
	myTop=(nas.GUI.winOffset[myWindowName])?
	nas.GUI.winOffset[myWindowName][1] : myDefaultTop;

// ///////////// GUI 設定 /////////////
// ウインドウ初期化
	if((this)&&(this instanceof Panel)){
		nas[moduleName][myWindowName]=this;//パネルの参照
	}else{
		nas[moduleName][myWindowName]=nas.GUI.newWindow("palette","テンプレートウインドウ",5,5,myLeft,myTop);
	}
// ウィンドウにコントロールを配置

	/*----ここにコントロールを記述してください。----*/

// コントロールのイベント設定

	/*----ここにコントロールの動作を記述してください。----*/

//	ウィンドウ最終位置を記録(不要ならば削除してください。)
	nas[moduleName].onMove=function(){
nas.GUI.winOffset[myWindowName] =[nas[moduleName][myWindowName].bounds[0],nas[moduleName][myWindowName].bounds[1]];
	}
// ///////////// GUI 設定 終り ウィンドウ表示 /////////////
	if((this)&&(this instanceof Panel)){
		//パネル動作時はshow()メソッドはエラーになる
	}else{
		nas[moduleName][myWindowName].show();//パレット
	}
};
	/*---- この下には初期化の必要ないコマンドを書くことが出来ます。----*/

//スクリプト終了
