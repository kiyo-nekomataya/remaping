/*(00-タイムシートビルド)

 *	連続関数実行スクリプト(サンプル)
一括ビルドスクリプト
	手順参考です。
	実行するとフォルダを指定するダイアログが開きます。
	カット素材のあるフォルダを指定するとインポートおよびタイムシートがあればシートに従ったビルドが自動的に行われます。

	自動処理であるため処理開始時点でプロジェクト内にデータが存在すると重複処理が多いので初期化時点でプロジェクトのクリアを行なうように変更　2010/01/29
 */

//オブジェクト識別文字列生成 
var myFilename=("$RCSfile: 00buildXPS.jsx,v $").split(":")[1].split(",")[0];
var myFilerevision=("$Revision: 1.1.2.1 $").split(":")[1].split("$")[0];
var exFlag=true;
var moduleName="buildXPS";//識別用のモジュール名
//二重初期化防止トラップ
try{
	if(nas.Version)
	{	nas.Version[moduleName]=moduleName+" :"+myFilename+" :"+myFilerevision;
	
		try{
if(nas[moduleName]){
//モジュールがオンメモリ(すでに初期化されている)
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
//プロジェクト内にデータがあれば保存するか否か確認して新規プロジェクトを作成
if (app.project.items.length)
{
	exFlag=confirm("プロジェクトにデータがあります。自動処理の前にプロジェクトを初期化しても良いですか");
	if(exFlag)
	{
		app.newProject();//新規プロジェクトメソッドが保存の問い合わせはしてくれる
	}else{
	exFlag=confirm("自動処理を継続しますか？");
	}
}
if (exFlag){
//初期化およびGUI設定
	//現在はセットアップするコントロールがない。そのうち作ります。2006/01/22
}
//	main
//========================================================ファイルを読み込む
function getStartFolder()
{
//読み込む素材のあるフォルダを尋ねる
if(appHost.version<7){
	Folder.current=new Folder(nas.GUI.workBase.current());
	var targetFolder = Folder.selectDialog("カット素材のフォルダを指定してください。",nas.GUI.workBase.current());
//	var targetFolder = folderGetDialog("カット素材のフォルダを指定してください。");
}else{
	var targetFolder = Folder.selectDialog("カット素材のフォルダを指定してください。",nas.GUI.workBase.current());
}
if((targetFolder)&&(targetFolder.fsName==new Folder(nas.GUI.workBase.current()).fsName)){return null}else{return targetFolder}
//戻り値は'フォルダ'または nul
//戻り値が初期フォルダだった場合は入力ミスなのでキャンセル扱いにする
}
var targetFolder=getStartFolder();
//	action
if (targetFolder)
{
	this.importCount = nas.otome.getFootage(targetFolder)

	if(this.importCount)
	{
		nas.otome.writeConsole(this.importCount +" 個のファイルをインポートしました。");
	}else{
		alert("インポートするファイルがありませんでした。");
	}
}else{nas.otome.writeConsole("フッテージ読み込みをスキップしました")}

//読み込みキャンセルでも現状のプロジェクトに対して処理続行
//========================================================アイテムを振り分ける
//全てのアイテムの選択を解除してルートフォルダの（未分類と思われる）アイテムを振り分け
for(var idx=0;idx<app.project.items.length;idx++){app.project.items[idx+1].selected=false};//なんかこれよく使いそう

nas.otome.writeConsole(nas.otome.divideFootageItems() +"個のアイテムを移動しました");

//========================================================カレントフォルダからタイムシート検索読み込み
if (targetFolder){
	nas.otome.writeConsole(nas.otome.getXPSheets(targetFolder)+"点のシートを読み込みました");
};
//========================================================シート情報でMAPビルド
nas.otome.buildMAP();
//========================================================シート切り替えながらステージビルド
	nas.otome.writeConsole("ビルドしてみるです");
for(var idx=0;idx<nas.XPSStore.getLength();idx++)
{
	var stgIndex=nas.XPSStore.select(idx+1);//シートをセレクト
	nas.otome.writeConsole("シート選択　:"+(idx+1))
	var myStage=XPS.mkStage();//バッファメソッドをよび出してステージ作成
}
//情報パネルが開いていたら更新する
if(nas.otomeFEP){nas.otomeFEP.uiPanel.reloadInfo();}
//========================================================