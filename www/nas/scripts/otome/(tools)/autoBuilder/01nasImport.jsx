/*(01-フッテージ読込)
	
 *	nasImporte
	指定フォルダ配下のファイルを再帰検索して素材らしきファイルを自動でインポートします。
	nas.importFilter を使用して必要と考えられる素材をピックアップしています。
	この変数を書き直すことで不要なファイルを除外したり、サイトに特有なファイルをインポートすることが可能です。
	編集は　nas/lib/nas_Otome_config.jsx　を直接書き換えてください。
*/
//オブジェクト識別文字列生成 
var myFilename=("$RCSfile: nasImport.jsx,v $").split(":")[1].split(",")[0];
var myFilerevision=("$Revision: 1.1.2.1 $").split(":")[1].split("$")[0];
var exFlag=true;
var moduleName="importX";//識別用のモジュール名
//二重初期化防止トラップ
try{
	if(nas.Version)
	{	nas.Version[moduleName]=moduleName+" :"+myFilename+" :"+myFilerevision;
	
		try{
if(nas[moduleName]){
//モジュールがオンメモリ(すでに初期化されている)

//	nas[moduleName].show();
/*
	この部分は再初期化コマンドで置き換えてください。上の行は例です。
 */
	exFlag=false;//本来の初期化コマンドを無効にします。
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
	alert("nasライブラリが必要です。\nnasStartup.jsx を実行してください。");	exFlag=false;
}

if (exFlag){
//初期化およびGUI設定
	//現在はセットアップするコントロールがない。そのうち作ります。2006/01/22
}
//	main

//読み込む素材のあるフォルダを尋ねる
if(appHost.version<7){
	Folder.current=nas.GUI.workBase.current();
	var targetFolder = folderGetDialog("カット素材のフォルダを指定してください。");
}else{
	var targetFolder = Folder.selectDialog("カット素材のフォルダを指定してください。",nas.GUI.workBase.current());
}
//戻り値は'フォルダ'または null
/*
??どうもフォルダ ダイアログで「マイ コンピュータ」を指定すると、アサインすべき実態ファイルが無いので必ずエラーになるようです。ウィンドウズだけの現象か? 要注意
	try/catch が効きません。
さらに変な現象
ドライブのルートを指定してfsNameをとると
	c:\N:
	c:\C:
などというたわけたレスポンスが帰ってくる。一応指定には使えるが、プラットフォーム
判定してただしい表示を調整しないとダメ ドライブレターのサポートはかなり変?。
 */
	nas.GUI.prevCurrentFolder = Folder.current;
	Folder.current = nas.GUI.currentFolder;

//	action
this.importCount = nas.otome.getFootage(targetFolder);
if(this.importCount)
{
//インポートした直後にインポートしたファイルを検査する
//コンポとして読み込んだ静止画フッテージのフレームレートと継続時間を調整しておく(レート一致/継続時間1フレーム（秒？）に)
 for(var ix=0;ix<app.project.items.length;ix++){
		if((app.project.items[ix+1].selected)&&(app.project.items[ix+1] instanceof CompItem)){
			app.project.items[ix+1].frameRate = nas.FRATE.rate;
			app.project.items[ix+1].duration  = 1/nas.FRATE.rate;
		}
 }
	alert(this.importCount +" 個のファイルをインポートしました。");
}else{
	alert("インポートするファイルがありませんでした。");
}
