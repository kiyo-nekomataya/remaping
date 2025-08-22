/*(作品別スクリプト)
	このスクリプトは、NasMenu.jsx のサブスクリプトです。
	このスクリプトの名前を変更しないでください。

	このファイルのあるフォルダ自体をコマンドランチャーに表示したくない場合は、
//no launch
	上の行を一行目に記述して下さい。

	この行があるとランチャーはそのフォルダを無視します。

	このフォルダの中身がサブパレットに登録されます。
	それぞれのファイルは以下の様に処理されます。
	拡張子 .js .jsx のスクリプト(エイリアスでも良い)
		> 実行ボタンに登録。初期ディレクトリはこのフォルダ
	フォルダ
		> 特になにもない場合は、エクスプローラ(ファインダ)等で

	ボタンラベルはこのフォルダに対するボタンラベルと置き換えます。
	初期値のままの場合は、フォルダ名がボタンラベルとして登録されます。
 */
//
//	ボタンパレットのサイズ
//	列数はウインドウ表示の際に有効です、パレット表示の際は自動設定が行われます
	nas.ToolBox.buttonColumn=1;//ボタン列数
	nas.ToolBox.buttonWidth=2;//ボタン幅
	nas.ToolBox.buttonLineMax=20;//ボタン最大行数

/* ***********		ユーザ登録のアイテムは以下のエリアを書き直してください		********* */
//		サブパレット登録
//書式	Folder
//特定のフォルダをサブパレットのベースフォルダとして登録できます。
//サブパレットフォルダのファイルは検索されてサブパレットに登録されます。
//サブパレットにフォルダ外のスクリプトやアイテムを登録する場合は、
//サブフォルダ内に _subMenu.jsx をコピーして編集してください。
//引数は["サブパレットフォルダ"]
//サンプルは、デモスクリプトフォルダです。Folder.scrits は、nasライブラリをインストールすると使用できるプロパティです。
//ボタンタイトルはプロパティとして設定してください。設定のない場合はフォルダ名が使用されます。

//	nas.ToolBox.ItemList.push(Folder(Folder.scripts.path.toString()+"/Scripts/(demos)"));
//	nas.ToolBox.ItemList[nas.ToolBox.ItemList.length-1].btTitle="デモスクリプト";


//		任意位置のスクリプト登録
//このディレクトリ以外のスクリプトをサブパレットに登録できます
//書式	[buttonLabel,scriptDir,scriptName] or [Label,function] or [Folder]
/*
	[ボタンラベル,スクリプトのディレクトリ,スクリプト名]	スクリプトボタンを登録
	[ボタンラベル,ファンクションオブジェクト]	ファンクションボタンを登録
	[フォルダオブジェクト]	サブパレットにするフォルダを登録
*/
//			スクリプトをボタンに登録
//引数は配列 [buttonLabel,スクリプトのディレクトリ,スクリプトファイル名] / [ボタンラベル,関数オブジェクト]
//	nas.ToolBox.ItemList.push(["レイヤ順反転","/(demos)/","ReverseLayerOrder.jsx"]);
//	nas.ToolBox.ItemList.push(["デモパレット",myPath+"/","DemoPalette.jsx"]);

//関数を直接指定してコマンドボタンを登録
//引数は配列 [buttonLabel,function] / [ボタンラベル,関数オブジェクト]
//	nas.ToolBox.ItemList.push(["りまぴん",function(){uriOpen("http://www.nekomataya.info/tools/remaping/")}]);

//	nas.ToolBox.ItemList.push(["セル並び替え",function(){otomeCall("セル並び替え")}]);
//	nas.ToolBox.ItemList.push(["L/Oモード変更",function(){otomeCall("L/Oモード変更")}]);
//	nas.ToolBox.ItemList.push(["レイヤ名推測",function(){otomeCall("レイヤ名推測")}]);
//	nas.ToolBox.ItemList.push(["セルをゴニョ…",function(){otomeCall("セルをゴニョ…")}]);
//	nas.ToolBox.ItemList.push(["ねこまたや",function(){uriOpen("http://homepage2.nifty.com/Nekomata/")}]);
//	nas.ToolBox.ItemList.push(["バージョン",versionView]);
//	nas.ToolBox.ItemList.push(["close",windowClose]);//パレットを閉じるボタン

//	nas.ToolBox.ItemList.push(["カレントフォルダを開く",function(){systemOpen(Folder.current.fsName)}]);
//