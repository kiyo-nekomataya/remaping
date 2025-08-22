/*(コマンドランチャー)
//no launch
	このスクリプトは、NasMenu.jsx/NasMenuII.jsx のサブスクリプトです。
	このスクリプトの名前を変更しないでください。

	このファイルのあるフォルダをコマンドランチャーに登録したい場合は、
	一行目の /\/\/no\ launch$/ を削除してボタンラベルが第一行目になる様にしてください。
//no launch
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
if(nas.ToolBoxII)
	{nas.ToolBoxII.isIcon=true};//アイコンモードにする この数値は/nasフォルダの設定のみが有効

if(true){
	
	nas.ToolBox.buttonColumn=2;//ボタン列数は自動処理に変更 この数値は上限数値に変更
	nas.ToolBox.buttonWidth=2;//ボタン幅
	nas.ToolBox.buttonLineMax=20;//ボタン最大行数パネル使用時は無効

//alert("_sunM: "+Folder.current.toString())
/* ***********		ユーザ登録のアイテムは以下のエリアを書き直してください		********* */
//特定のフォルダをサブパレットのベースフォルダとして登録できます。
//サブパレットフォルダのファイルは検索されてサブパレットに登録されます。
//サブパレットにフォルダ外のスクリプトやアイテムを登録する場合は、
//サブフォルダ内に _subMenu.jsx をコピーして編集してください。
//引数は["サブパレットフォルダ"]
//サンプルは、デモスクリプトフォルダです。Folder.scrits は、nasライブラリをインストールすると使用できるプロパティです。
//ボタンタイトルはプロパティとして設定してください。設定のない場合はフォルダ名が使用されます。

//	nas.ToolBox.ItemList.push(Folder(Folder.scripts.path.toString()+"/Scripts/(demos)"));
//	nas.ToolBox.ItemList[nas.ToolBox.ItemList.length-1].btTitle="デモスクリプト";

//	nas.ToolBox.ItemList.push(Folder("./\(tools\)"));//(tools)フォルダをサブフォルダ登録
//	nas.ToolBox.ItemList.push(Folder("../HsScripts"));//任意のフォルダをサブフォルダ登録可能
//	nas.ToolBox.ItemList.push(Folder("../da-tools"));//任意のフォルダをサブフォルダ登録可能

//nasディレクトリ以外のスクリプトはここに登録できます
//書式	[buttonLabel,scriptDir,scriptName] or [Label,function] or [Folder]
/*
	[ボタンラベル,スクリプトのディレクトリ,スクリプト名]	スクリプトボタンを登録
	[ボタンラベル,ファンクションオブジェクト]	ファンクションボタンを登録
	[フォルダオブジェクト]	サブパレットにするフォルダを登録
*/
//nas.ToolBox.isIcon=false;
myPath=Folder.nas.path;//Folder.nas は 起動時のnasフォルダの位置を示しています


//	nas.ToolBox.ItemList.push(Folder(Folder.scripts.path.toString()+"/Scripts/nas/(sys)"));
	nas.ToolBox.ItemList.push(Folder(myPath+"/nas/scripts/otome/(sys)"));
	nas.ToolBox.ItemList[nas.ToolBox.ItemList.length-1].btTitle="コントロールパネル";
	nas.ToolBox.ItemList[nas.ToolBox.ItemList.length-1].btIcon=nas.GUI.systemIcons["tools_f"];

//			スクリプトをボタンに登録
//引数は配列 [buttonLabel,スクリプトのディレクトリ,スクリプトファイル名] / [ボタンラベル,関数オブジェクト]
//	nas.ToolBox.ItemList.push(["仮設版XPSリンカ",myPath+"/nas/scripts/otome/(tools)/autoBuilder/","easyXPSLink.jsx"]);
	nas.ToolBox.ItemList.push(["検索して読込",myPath+"/nas/scripts/otome/(tools)/autoBuilder/","01nasImport.jsx"]);
	nas.ToolBox.ItemList.push(["フッテージ振分",myPath+"/nas/scripts/otome/(tools)/autoBuilder/","02divideItems.jsx"]);
	nas.ToolBox.ItemList.push(["シート読込",myPath+"/nas/scripts/otome/(tools)/autoBuilder/","03loadXPS.jsx"]);
	nas.ToolBox.ItemList.push(["マッピング",myPath+"/nas/scripts/otome/(tools)/autoBuilder/","04buildMAPs.jsx"]);
	nas.ToolBox.ItemList.push(["ステージ作成",myPath+"/nas/scripts/otome/(tools)/autoBuilder/","05mkStage.jsx"]);
	nas.ToolBox.ItemList.push(["カメラターゲット",myPath+"/nas/scripts/otome/(tools)/autoBuilder/","06addCamera.jsx"]);
	nas.ToolBox.ItemList.push(["クリップコンポ",myPath+"/nas/scripts/otome/(tools)/autoBuilder/","07mkClipWindow.jsx"]);
	nas.ToolBox.ItemList.push(["出力コンポ",myPath+"/nas/scripts/otome/(tools)/autoBuilder/","08mkOutput.jsx"]);
	nas.ToolBox.ItemList.push(["レンダーキュー",myPath+"/nas/scripts/otome/(tools)/autoBuilder/","09addRQ.jsx"]);
	nas.ToolBox.ItemList.push(["ボールド編集",myPath+"/nas/scripts/otome/(tools)/utils/","boldEdit.jsx"]);
//	nas.ToolBox.ItemList.push(["ボールド作成",function(){var myTargetFolder=new Folder(myPath+"/nas/scripts/otome/(actions)/mkBoard");alert(myTargetFolder);Folder.current=myTargetFolder;app.project.activeItem.executeAction(myTargetFolder);}]);
//	nas.ToolBox.ItemList[nas.ToolBox.ItemList.length-1].btIcon=nas.GUI.systemIcons["action_f"];

//	nas.ToolBox.ItemList.push(["レイヤ順反転",myPath+"/(demos)/","ReverseLayerOrder.jsx"]);
//	nas.ToolBox.ItemList.push(["デモパレット",myPath+"/","Demo Palette.jsx"]);
//	nas.ToolBox.ItemList[nas.ToolBox.ItemList.length-1].btIcon=nas.GUI.systemIcons["default"];

//関数を直接指定してコマンドボタンを登録できます
//引数は配列 [buttonLabel,function] / [ボタンラベル,関数オブジェクト]

//	nas.ToolBox.ItemList.push(["セル並び替え",function(){otomeCall("セル並び替え")}]);
//	nas.ToolBox.ItemList.push(["L/Oモード変更",function(){otomeCall("L/Oモード変更")}]);
//	nas.ToolBox.ItemList.push(["レイヤ名推測",function(){otomeCall("レイヤ名推測")}]);
//	nas.ToolBox.ItemList.push(["セルをゴニョ…",function(){otomeCall("セルをゴニョ…")}]);
//	nas.ToolBox.ItemList.push(["ねこまたやWeb",function(){uriOpen("http://www.nekomataya.info/")}]);
//	nas.ToolBox.ItemList[nas.ToolBox.ItemList.length-1].btIcon=nas.GUI.systemIcons["web"];
//	nas.ToolBox.ItemList.push(["バージョン",versionView]);
//	nas.ToolBox.ItemList[nas.ToolBox.ItemList.length-1].btIcon=nas.GUI.systemIcons["info"];
//	nas.ToolBox.ItemList.push(["close",windowClose]);//パレットを閉じるボタン

};//以上は設定ファイルに移動　マスターディレクトリのみスクリプト内で指定する仕様に変更
