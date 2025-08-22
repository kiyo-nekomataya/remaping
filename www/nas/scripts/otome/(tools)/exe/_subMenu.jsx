/*(外部プログラム)
 *	このスクリプトは、NasMenu.jsx のサブスクリプトです。
 *	このスクリプトの名前を変更しないでください。
 *
 *	このファイルのあるフォルダをコマンドランチャーに登録したい場合は、
 *	一行目の /\/\/no\ launch$/ を削除してボタンラベルが第一行目になる様にしてください。
 *	この行があるとランチャーはそのフォルダを無視します。
 *
 *	ボタンラベルはこのフォルダに対するボタンラベルと置き換えます。
 *	初期値のまま(カラ)の場合は、フォルダ名がボタンラベルとして登録されます。

	***	このフォルダは、AEスクリプト環境以外のユーティリティーを配置するため
		作成したサンプルです。通常のアプリケーションなどを置いてください。
		アプリケーションのエイリアスやデータのショートカットなども有効です。
 */
//	ボタンパレットのサイズ

	nas.ToolBox.buttonColumn=1;//ボタン列数
	nas.ToolBox.buttonWidth=2.5;//ボタン幅

/*
		以下で設定されたアイテムはパレットの上方に並びます。
		参考書式にしたがってお好きなアイテムを登録してください。
		フォルダ内のファイルは自動で登録されます。
 */
/* ***********		ユーザ登録のファイルは以下のエリアを書き直してください		********* */
/*
 *	メニューアイテムを登録できます
 *	書式	[buttonLabel,scriptDir,scriptName] or [Label,function] or [Folder]
 *
 *	[ボタンラベル,スクリプトのディレクトリ,スクリプト名]	スクリプトボタンを登録
 *	[ボタンラベル,ファンクションオブジェクト]	ファンクションボタンを登録
 *	[フォルダオブジェクト]	サブパレットにするフォルダを登録
 *
 *
 *	特定のフォルダをサブパレットのベースフォルダとして登録できます。
 *	サブパレットフォルダのファイルは検索されてサブパレットに登録されます。
 *	サブパレットにフォルダ外のスクリプトやアイテムを登録する場合は、
 *	サブフォルダ内に .SubMenu.jsx をコピーして編集してください。
 *	引数は["サブパレットフォルダ"]
 *	サンプルは、デモスクリプトフォルダです。Folder.startupを使って指定します。
 *	ボタンタイトルはプロパティとして設定してください。設定のない場合はフォルダ名が使用されます。
*/
// nas.ToolBox.ItemList.push(Folder(Folder.startup.path.toString()+"/"+Folder.startup.name.toString()+"/Scripts/(demos)"));
// nas.ToolBox.ItemList[nas.ToolBox.ItemList.length-1].btTitle="デモスクリプト";

/*
 *			スクリプトをボタンに登録
 *	引数は配列 [buttonLabel,スクリプトのディレクトリ,スクリプトファイル名] / [ボタンラベル,関数オブジェクト]
 */
// nas.ToolBox.ItemList.push(["ほげほげ","/Users/hoge/myScripts/","ほげほげ.jsx"]);

/*
 *	関数を直接指定してコマンドボタンを登録
 *	引数は配列 [buttonLabel,function] / [ボタンラベル,関数オブジェクト]
 */

// nas.ToolBox.ItemList.push(["close",function(){this.parent.close();}]);//パレットを閉じるボタン

/*
 *
 *	アイテムは、書いた順にパレットの上から並びますので、順番のコントロールに使っても良いでしょう。
 *	サンプルは、WindowsとMacで別のロケーションを指す様に仕込んであります。
 */
	nas.ToolBox.ItemList.push(["りまぴん",function(){uriOpen("http://www.nekomataya.info/tools/remaping/")}]);

if(isWindows)
{
	nas.ToolBox.ItemList.push(["STS",function(){systemOpen("c:\\Program\ Files\\STS\\STS_ver2.0.exe");}]);//STS
	nas.ToolBox.ItemList.push(["AE-Remap",function(){systemOpen("c:\\Program\ Files\\AE_Remap\\AE_Remap.exe");}]);//AER
	nas.ToolBox.ItemList.push(["T-sheet",function(){systemOpen("c:\\Program\ Files\\da-tools\\Tsheet\\Tsheet16.exe");}]);//TSheet

//	nas.ToolBox.ItemList.push(["STS",function(){systemOpen("n:\\WinApps\\STS\\STS_ver2.0.exe");}]);//STS
//	nas.ToolBox.ItemList.push(["AE-Remap",function(){systemOpen("n:\\WinApps\\AE_Remap\\AE_Remap.exe");}]);//AER
//	nas.ToolBox.ItemList.push(["T-sheet",function(){systemOpen("n:\\WinApps\\da-tools\\Tsheet\\Tsheet16.exe");}]);//TSheet

nas.ToolBox.ItemList.push(["りまぴんAIR",function(){systemOpen("c://Program Files/nas(u)/remapingAIR/remapingAIR.exe");}]);
	nas.ToolBox.ItemList[nas.ToolBox.ItemList.length-1].btIcon=nas.GUI.systemIcons["xps"];
nas.ToolBox.ItemList.push(["メモ帳",function(){systemOpen(Folder.system.parent.fsName+"\\notepad.exe");}]);//Windows Notepad.exe

}else{
 nas.ToolBox.ItemList.push(["りまぴんAIR",function(){systemOpen("/Application/nas(u)/remapingAIR/remapingAIR.app");}]);
	nas.ToolBox.ItemList.push(["テキストエディット",function(){systemOpen("/Applications/TextEdit.app");}]);//Macintosh TextEdit.app
	nas.ToolBox.ItemList.push(["チェス",function(){systemOpen("/Applications/Chess.app");}]);//Macintosh textEdit.app
	
}
