/*(ボタンラベル)
 *	スクリプト名:stub_simple.jsx
 *
 *		このファイルは、nas ライブラリを使用してAEスクリプトを
 *		作成するためのテンプレートです。Windowなし
 *
 *		このファイルの手続きが標準の処理ですが、処理内容によっては
 *		かなり冗長な内容になっています。
 *		あなたの用途にしたがって書き換えてご使用ください。
 *		2006/10/20 kiyo/Nekomataya
 */
//オブジェクト識別文字列生成 
//var myFilename="stub_simple.jsx";//正式なファイル名と置き換えてください。
//var myFilerevision="0.01";//ファイルージョンはアバウトパネルで表示されます。

/*	cvs/rcs使用の方は、下の2行をご使用ください	*/
	var myFilename=("$RCSfile: stub_simple.jsx,v $").split(":")[1].split(",")[0];
	var myFilerevision=("$Revision: 1.1.2.2 $").split(":")[1].split("$")[0];
//

var exFlag=true;
var moduleName="stub_simple";//識別用のモジュール名で置き換えてください。
//二重初期化防止トラップ
try{
	if(nas.Version)
	{
		nas.Version[moduleName]=moduleName+" :"+myFilename+" :"+myFilerevision;
	//現在のモジュール名とバージョンを登録する
		try{
if(nas[moduleName]){
//モジュールがオンメモリ(すでに初期化されている)場合の処理
	exFlag=false;//本来の初期化コマンドを無効にします。
/*
	この部分は再初期化コマンドで置き換えてください。上の行は例です。
	すでに読み込み済みのモジュールを再度初期化することを防止するための処理です。
	再初期化した方が良いプログラムはこのブロック自体が不要です。
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


};
	/*---- この下には初期化の必要ないコマンドを書きます。----*/
//	main

//スクリプト終了
