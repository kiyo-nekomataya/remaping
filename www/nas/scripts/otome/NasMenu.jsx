//no launch
/*(パレットメニュー)

*/
{
	// This script creates and shows a floating palette.
	// The floating palette contains buttons that launch a variety of
	// demo scripts.
	// このスクリプトは AE6.5 デモスクリプトの置き換えです。
	// …が 相当いじってしまったのでもうなんか 別物。
	// $Id: NasMenu.jsx,v 1.20.4.25 2009/10/27 15:24:47 kiyo Exp $
/*
	ちょっぴり汎用性を上げる改造2006/05/11
	冒頭に"//no launch"を書くとパレットに加えない
	ファイル名の"^nas"を判定対象外に変更

	サブパレット増設 2006/09/03
	フォルダ内に"_subMenu.jsx"を設置すると、サブパレットを作成します。

	AE7環境下で、show()以前にvisible属性がtrueになるバグ(?)に対処 2006/11/14
	設定ファイルの拡張子に.jsを追加(2009/11/16)
*/
//
//オブジェクト識別文字列生成 
var myFilename=("$RCSfile: NasMenu.jsx,v $").split(":")[1].split(",")[0];
var myFilerevision=("$Revision: 1.20.4.25 $").split(":")[1].split("$")[0];
var exFlag=true;
var moduleName="ToolBox";//モジュール名で置き換えてください。
//二重初期化防止トラップ
try{
	if(nas.Version)
	{	nas.Version[moduleName]=moduleName+" :"+myFilename+" :"+myFilerevision;
	
		try{
			if(nas[moduleName])
			{
				nas.ToolBox.CommandPalette[0].show();
				exFlag=false;
			}else{
				nas[moduleName]=new Object();
			}
		}catch(err){
			nas[moduleName]=new Object();
		}
	}
}catch(err){
	alert("nasライブラリが必要です。\nnasStartup.jsx を実行してください。");
	exFlag=false;
}

if(exFlag){
//初期設定
// ================	ボタンパレットのサイズ	================
/*
	新IFはボタンの列数を指定しないで、ウィンドウの幅で指定する。
	ウィンドウ幅がボタン幅の整数倍以上ならば列数が自動で増加する
	ウィンドウ高さがボタンの数を賄い切れない場合は、スクロールバーが現れる
	…で、よろしいかな?
	旧来の指定は、分かりやすいのでそのままキープ
	ウィンドウ幅と高さに置き換えて指定に使うこと。
	これで見た目の互換が上がる OK?
 */
	nas.ToolBox.buttonColumn=1;//ボタン列数
	nas.ToolBox.buttonWidth=2.5;//ボタン幅

//	コマンドパレット初期化
	nas.ToolBox.CommandPalette=new Array();

//	アイテムリスト配列は一次配列です。パレット初期化ごとに再初期化されます。
	nas.ToolBox.ItemList = new Array();

/* ***********		自動登録対象外のファイル・フォルダ名を正規表現で登録します。	********* */
	nas.ToolBox.denyFile	=new RegExp("_subMenu\\.jsx?$","i");
	nas.ToolBox.denyFolder	=new RegExp("^CVS$","i");

/* ***********		ユーザ登録のアイテムは以下のエリアを書き直してください		********* */

//	特定のフォルダをサブパレットのベースフォルダとして登録できます。
//	サブパレットフォルダのファイルは検索されてサブパレットに登録されます。
//	サブパレットにフォルダ外のスクリプトやアイテムを登録する場合は、
//	サブフォルダ内に _subMenu.jsx をコピーして編集してください。
//	引数は["サブパレットフォルダ"]
//	サンプルは、デモスクリプトフォルダです。Folder.scripts は、
//	nasライブラリをインストールすると使用できるプロパティです。
//	ボタンタイトルはプロパティとして設定してください。
//	設定のない場合はフォルダ名が使用されます。

	nas.ToolBox.ItemList.push(Folder(Folder.scripts.path.toString()+"/Scripts/(demos)"));
	nas.ToolBox.ItemList[nas.ToolBox.ItemList.length-1].btTitle="デモスクリプト";

	nas.ToolBox.ItemList.push(Folder("./\(tools\)"));//(tools)フォルダをサブフォルダ登録

	nas.ToolBox.ItemList.push(Folder("../HsScripts"));//任意のフォルダをサブフォルダ登録可能



//nasディレクトリ以外のスクリプトはここに登録できます
//書式	[buttonLabel,scriptDir,scriptName] or [Label,function] or [Folder]
/*
	[ボタンラベル,スクリプトのディレクトリ,スクリプト名]	スクリプトボタンを登録
	[ボタンラベル,ファンクションオブジェクト]	ファンクションボタンを登録
	[フォルダオブジェクト]	サブパレットにするフォルダを登録
*/

	myPath=Folder.current.path;//

//			スクリプトをボタンに登録
//引数は配列 [buttonLabel,スクリプトのディレクトリ,スクリプトファイル名] / [ボタンラベル,関数オブジェクト]
	nas.ToolBox.ItemList.push(["仮設版XPSリンカ",myPath+"/nas/(tools)/autoBuilder/","easyXPSLink.jsx"]);
	nas.ToolBox.ItemList.push(["レイヤ順反転",myPath+"/(demos)/","ReverseLayerOrder.jsx"]);
	nas.ToolBox.ItemList.push(["デモパレット",myPath+"/","DemoPalette.jsx"]);
	nas.ToolBox.ItemList.push(["コマンドパレット2",myPath+"/nas/","NasMenuII.jsx"]);

//関数を直接指定してコマンドボタンを登録
//引数は配列 [buttonLabel,function] / [ボタンラベル,関数オブジェクト]

//	nas.ToolBox.ItemList.push(["セル並び替え",function(){otomeCall("セル並び替え")}]);
//	nas.ToolBox.ItemList.push(["L/Oモード変更",function(){otomeCall("L/Oモード変更")}]);
//	nas.ToolBox.ItemList.push(["レイヤ名推測",function(){otomeCall("レイヤ名推測")}]);
//	nas.ToolBox.ItemList.push(["セルをゴニョ…",function(){otomeCall("セルをゴニョ…")}]);
//	nas.ToolBox.ItemList.push(["ねこまたや",function(){uriOpen("http://homepage2.nifty.com/Nekomata/")}]);
//	nas.ToolBox.ItemList.push(["バージョン",versionView]);
//	nas.ToolBox.ItemList.push(["close",windowClose]);//パレットを閉じるボタン


/* ******************************* この下は自動登録です *********************************** */
//nasディレクトリのツールを自動登録
//自動登録を解除する場合は、この下の判定を false に変更してください。
if(true){
	myfiles=Folder.current.getFiles();
	for (idx=0;idx<myfiles.length;idx++){
		if(myfiles[idx].name.match(/^.+\.jsx$/)){
	var myOpenfile = new File(myfiles[idx].fsName);
	myOpenfile.open("r");
	myContent = myOpenfile.readln(1);//1行目だけ読む
	myOpenfile.close();
if(myContent.match(/^\/\/no\x20launch$/)) continue;
var btTitle=(myContent.match(/^\/\*\((.+)\)$/))?RegExp.$1:myfiles[idx].name.split("\.")[0];
//	var btTitle=(true)?myContent.split("#")[1]:myfiles[idx].name.split("\.")[0];
	nas.ToolBox.ItemList.push([btTitle,myfiles[idx].path,myfiles[idx].name]);	
		}
	}
}
/*
 *	*.jsx;*.js;エイリアス;ショートカット;データファイル;実行ファイル(アプリケーション)を配置できます。
 *	フォルダ またはフォルダのエイリアス(ショートカット)を配置して、
 *	フォルダ内にサブメニュースクリプトを配置するとサブメニューウィンドウを設定します。
 *	サブメニュー設定スクリプトはテンプレートを編集してご使用ください。
 */
nas.ToolBox.getItems =function(myFolder){
	myfiles=myFolder.getFiles();//targetFolderSet

	for (idx=0;idx<myfiles.length;idx++)
	{
if(myfiles[idx].name.match(nas.ToolBox.denyFile)){continue;};//スキップ
if(myfiles[idx].name.match(nas.ToolBox.denyFolder)){continue;};//スキップ
		if(myfiles[idx] instanceof Folder)
		{
/*
	フォルダまたはフォルダのエイリアスだった場合はサブメニュースクリプトを検索
	フォルダの中を調べてサブメニュースクリプトがあれば
	メニューアイテムにサブパレットフォルダとして登録されます。
	サブメニュースクリプトファイルの名前は、"_subMenu.jsx" として予約されています。
*/
var myConfigFile=new File(myfiles[idx].path +"/"+ myfiles[idx].name + "/_subMenu.js");
if(! myConfigFile.exists) {myConfigFile=new File(myfiles[idx].path +"/"+ myfiles[idx].name + "/_subMenu.jsx")}
			if(myConfigFile.exists)
			{

//	フォルダ内のファイルを取得して"_subMenu.jsx"があれば、サブメニューフォルダとしてアイテム登録
//	ない場合は、フォルダ自身をシステム実行ボタンとして登録する
//	ファイルがあって、"no launch"指定のある場合は、処理をスキップ
//				myConfigfile=new File (myfiles[idx].fsName+"_subMenu.jsx");
				myConfigFile.open("r");
				myContent = myConfigFile.readln(1);//1行読み込み
				myConfigFile.close();
				if(myContent.match(/^\/\/no\x20launch$/)) continue;

				var btTitle=(myContent.match(/^\/\*\((.+)\)$/))?RegExp.$1:myfiles[idx].name;//タイトル取得
				
				nas.ToolBox.ItemList.push(myfiles[idx]);//フォルダをアイテムにいれる
				nas.ToolBox.ItemList[nas.ToolBox.ItemList.length-1].btTitle=btTitle;//ラベルをプロパティで設定
				nas.ToolBox.ItemList[nas.ToolBox.ItemList.length-1].status="0";//パレット構築フラグを付ける
			}else{
//			フルパスを引数に無名関数を登録
	var btTitle="["+myfiles[idx].name+"]";//タイトル取得

	eval ("_TEMP=function(){if(! this.parent.moved){this.parent.close();};systemOpen('"+myfiles[idx].fsName.replace(/\\/g,"\\\\")+"')}");

				nas.ToolBox.ItemList.push([btTitle,_TEMP]);	
			}
		}else{
			if(myfiles[idx].name.match(/^.+\.(jsx?)$/))
			{//スクリプトファイル
				var myOpenfile = new File(myfiles[idx].fsName);
				myOpenfile.open("r");
				myContent = myOpenfile.readln(1);//1行目だけ読む
				myOpenfile.close();
				if(myContent.match(/^\/\/no\x20launch$/)) continue;
				var btTitle=(myContent.match(/^\/\*\((.+)\)$/))?RegExp.$1:myfiles[idx].name.split("\.")[0];
//	var btTitle=(true)?myContent.split("#")[1]:myfiles[idx].name.split("\.")[0];
				nas.ToolBox.ItemList.push([btTitle,myfiles[idx].path,myfiles[idx].name]);	
			}else{
//スクリプト以外のファイルは、全て無条件でボタンに登録
				var btTitle=myfiles[idx].name;//ファイル名をボタンラベル
//ファイル
	var btTitle="<"+myfiles[idx].name+">";//タイトル取得

//
//			フルパスを引数に無名関数を登録
	eval ("_TEMP=function(){if(! this.parent.moved){this.parent.close();};systemOpen('"+myfiles[idx].fsName.replace(/\\/g,"\\\\")+"');};");
				nas.ToolBox.ItemList.push([btTitle,_TEMP]);
			}
		}
	}
}
//nsa/(tools)ディレクトリのファイルを自動登録
//	nas.ToolBox.getItems(Folder("./\(tools\)"));//マスターパレットに収集



//		////////////////////////// 登録終り ///////////////////////

//var otomeCall	=	function(order){return nas.otome.otomeCall(order);};//
//var varsionView	=	function(){return nas.otome.vaersionView();};//

	// Called when a button is pressed, to invoke its associated script
	//
	function myHelpButtonClick()
	{
var msg= "ボタンをクリックして以下のスクリプトを実行することができます。:\n\n"
for (idx=0;idx<nas.ToolBox.ItemList.length;idx++){
	msg += nas.ToolBox.ItemList[idx][0] +"\t:";
	msg +=(nas.ToolBox.ItemList[idx].length==3)? nas.ToolBox.ItemList[idx][2]:"" ;
	msg +=	"\n";
}
msg +=	"\n";
	alert(msg);
	}
	// ウィンドウクローズ
//	function windowClose()
//	{this.parent.close();}
	// ウィンドウクローズ

	function windowClose(myWindow)
	{
		alert(this.parent.toString());
//		if(! myWindow) myWindow=nas.CommandPanelx.CommandPalette;
//		myWindow.close();
	}

	// Called when a button is pressed, to invoke its associated script
	// クリックされたら登録されたスクリプトを実行するボタン
	function onScriptButtonClick()
	{
		var prevCurrentFolder = Folder.current;
		Folder.current = this.currentDirectory;
//		alert(Folder.current.name);
		if(! this.parent.moved){this.parent.close();};
		// The scriptFile variable was set during addButton.
		// Run the script by opening it, reading it, and evaluating its contents.
		var scriptFile = new File(this.scriptFileName);
		scriptFile.open();
		result=eval(scriptFile.read());
		scriptFile.close();

		Folder.current = prevCurrentFolder;
		return result;
	}


//		こちらは、サブパレットチェックボックスがクリックされた際の処理
	function onSubPaletteSwicth()
	{
//パレットの作成位置を計算 基本右側 余裕がない場合親パレットの左 とか思ったけれど、スクリーン全体のサイズの取得ができない。
//…しくしく しょうがないので保留 ユーザ設定かな?
//this.parent.bounds[2]>
myLeft	=(true)?this.bounds[2]+this.parent.bounds[0]:this.parent.bounds[0]-(nas.ToolBox.buttonWidth*nas.GUI.colUnit+nas.GUI.leftMargin+nas.GUI.rightMargin);
myTop	=(true)?this.bounds[1]+this.parent.bounds[1]:this.parent.bounds[1];
		if(! this.paletteId){

var myConfigFile=new File(this.targetFolder.path +"/"+ this.targetFolder.name + "/_subMenu.js");
if(! myConfigFile.exists) {myConfigFile=new File(this.targetFolder.path +"/"+ this.targetFolder.name + "/_subMenu.jsx")}
if (myConfigFile.exists){
				myConfigFile.open("r");
				result=eval(myConfigFile.read());//1行読み込み
				myConfigFile.close();
}

			nas.ToolBox.getItems(this.targetFolder);//フォルダのアイテムを取得

			this.paletteId=nas.ToolBox.setPalette(this.text,[myLeft,myTop]);

			nas.ToolBox.CommandPalette[this.paletteId].onMove=function()
			{
				this.moved=true;
				//writeLn("moved : "+this.paletteId);
			};
			nas.ToolBox.CommandPalette[this.paletteId].onClose=function()
			{
				this.hostButton.value=false;
			};
			nas.ToolBox.CommandPalette[this.paletteId].hostButton=this;
			nas.ToolBox.CommandPalette[this.paletteId].moved=false;
		}
		if(nas.ToolBox.CommandPalette[this.paletteId].visible)
		{
			nas.ToolBox.CommandPalette[this.paletteId].hide();
			this.value=false;
		}else{
			//nas.ToolBox.CommandPalette[this.paletteId].bounds.left=myLeft;
			//nas.ToolBox.CommandPalette[this.paletteId].bounds.top=myTop;
			nas.ToolBox.CommandPalette[this.paletteId].show();
			nas.ToolBox.CommandPalette[this.paletteId].moved=false;
			this.value=true;
		}
	}
	// この関数は、パレット配置するスクリプト読み込みボタンを初期化します

	function addScriptButton(Parent, Bounds, buttonLabel, buttonCurrentDirectory, buttonScriptName)
	{
		var newButton = nas.GUI.addButton(Parent,decodeURI(buttonLabel),Bounds[0],Bounds[1],Bounds[2],Bounds[3]);

		newButton.scriptFileName   = buttonScriptName;
		newButton.currentDirectory = buttonCurrentDirectory;

		newButton.onClick = onScriptButtonClick;
		return newButton;
	}

	// この関数は、パレット配置するサブパネル起動コントロールを初期化します。

	function addSubpaletteButton(Parent, Bounds, buttonLabel, subPaletteFolder, moveStatus)
	{
		var newCheckBox = nas.GUI.addCheckBox(Parent,buttonLabel,Bounds[0],Bounds[1],Bounds[2],Bounds[3]);
//		var newButton = Parent.add("button", nas.GUI.Grid(Bounds[0],Bounds[1],Bounds[2],Bounds[3]), buttonLabel);

//		newCheckBox.isMoved   = moveStatus;
		newCheckBox.targetFolder = subPaletteFolder;
		newCheckBox.justify = "center";

		newCheckBox.onClick = onSubPaletteSwicth;
		return newCheckBox;
	}

//		セキュリティ設定チェック
	function isSecurityPrefSet()
	{
		var securitySetting = app.preferences.getPrefAsLong("Main Pref Section",
						"Pref_SCRIPTING_FILE_NETWORK_SECURITY");
		return (securitySetting == 1);
	}

	if (isSecurityPrefSet() == true) {

//設定したリストと、ディレクトリから読み取ったスクリプトをボタンパレットに配置する

	var myLeft=(nas.GUI.winOffset["CommandPalette"])?
		nas.GUI.winOffset["CommandPalette"][0]:nas.GUI.dafaultOffset[0];
	var myTop=(nas.GUI.winOffset["CommandPalette"])?
		nas.GUI.winOffset["CommandPalette"][1]:nas.GUI.dafaultOffset[1];

//	nas.CommandPalette = new Array();初期化済みなので削除

nas.ToolBox.setPalette= function(paletteName,paletteLocation)
{
//引数は、パレット名とパレットの位置配列
//		パレットIDは現在の配列数から抽出(push相当)
	var paletteId=nas.ToolBox.CommandPalette.length;
//		アイテム収集は済んでいるのが前提
//	var paletteName="nasTool-Palette";
	nas.ToolBox.CommandPalette[paletteId] =
		nas.GUI.newWindow(
			"palette",
			paletteName,
			nas.ToolBox.buttonColumn*nas.ToolBox.buttonWidth,
			Math.ceil(nas.ToolBox.ItemList.length/nas.ToolBox.buttonColumn)+1,
			paletteLocation[0],
			paletteLocation[1]
		);
	nas.ToolBox.CommandPalette[paletteId].moved=false;
	nas.ToolBox.CommandPalette[paletteId].Button=new Array();

	nas.ToolBox.CommandPalette[paletteId].name	=paletteName;//パレット名を記録
	nas.ToolBox.CommandPalette[paletteId].paletteId	=paletteId;//パレットIDを記録
	nas.ToolBox.CommandPalette[paletteId].lines	=Math.ceil(nas.ToolBox.ItemList.length/nas.ToolBox.buttonColumn)+1;//パレット高を記録
	nas.ToolBox.CommandPalette[paletteId].columns	=nas.ToolBox.buttonColumn*nas.ToolBox.buttonWidth;//パレット幅を記録



/*
//		パレットID=0(マスターパレット)のとき
	if(paletteId==0)
	{
	}else{
//		それ以外(サブパレット)のとき
//アイテムインデックスから控えておいたラベルと検索ロケーションを取得
//		var paletteName	=nas.ToolBox.ItemList[itemId].btTitle;
//		var myStatus	=nas.ToolBox.ItemList[itemId].status;
//		var myLocation	=nas.ToolBox.ItemList[itemId];
//フォルダのアイテムを取得してウィンドウ描画に必要な情報を取得する

//ウィンドウの位置を取得
//	親ウィンドウの右側・親ボタンの高さを上辺に作成 ただしスクリーン外になる場合は左側・下辺にそれぞれ変更

//
	myLeft	=(true)?nas.ToolBox.CommandPalette[parentId].bounds[3]:nas.ToolBox.CommandPalette[parentId].bounds[0];
	myTop	=nas,ToolBox.CommandPalette[parentId].bounds[2];

	myLines	=Math.ceil(nas.ToolBox.ItemList.length/nas.ToolBox.buttonColumn)+1;
	myColumns	=nas.ToolBox.buttonColumn;
	nas.ToolBox.CommandPalette[paletteId].lines
		nas.GUI.newWindow(
			"palette",
			paletteName,
			myColumns*nas.ToolBox.buttonWidth,
			myLines,
			myLeft,
			myTop
		);
	nas.ToolBox.CommandPalette[paletteId].Button=new Array();
	}
*/
//	for (idx=nas.ToolBox.ItemList.unsetLength;idx<nas.ToolBox.ItemList.length;idx++)
	for (idx=0;idx<nas.ToolBox.ItemList.length;idx++)
	{
		if(nas.ToolBox.ItemList[idx] instanceof Folder){//サブパレット作成ボタンを作る

if(!nas.ToolBox.ItemList[idx].btTitle){	nas.ToolBox.ItemList[idx].btTitle=nas.ToolBox.ItemList[idx].name;};
nas.ToolBox.CommandPalette[paletteId].Button[idx]=
	addSubpaletteButton(
		nas.ToolBox.CommandPalette[paletteId],
		[nas.ToolBox.buttonWidth*(idx%nas.ToolBox.buttonColumn),1+Math.floor(idx/nas.ToolBox.buttonColumn),nas.ToolBox.buttonWidth,1],
		nas.ToolBox.ItemList[idx].btTitle,
		nas.ToolBox.ItemList[idx],
		nas.ToolBox.ItemList[idx].status
	);
//addSunPalette サブパレットスイッチ登録
		}else{
		if(nas.ToolBox.ItemList[idx].length>2){
nas.ToolBox.CommandPalette[paletteId].Button[idx]=
	addScriptButton(
		nas.ToolBox.CommandPalette[paletteId],
		[nas.ToolBox.buttonWidth*(idx%nas.ToolBox.buttonColumn),1+Math.floor(idx/nas.ToolBox.buttonColumn),nas.ToolBox.buttonWidth,1],
		nas.ToolBox.ItemList[idx][0],
		nas.ToolBox.ItemList[idx][1],
		nas.ToolBox.ItemList[idx][2]
	);
//script	スクリプトボタン登録
		}else{


nas.ToolBox.CommandPalette[paletteId].Button[idx]=
	nas.GUI.addButton(
		nas.ToolBox.CommandPalette[paletteId],
		decodeURI(nas.ToolBox.ItemList[idx][0]),
		nas.ToolBox.buttonWidth*(idx%nas.ToolBox.buttonColumn),
		1+Math.floor(idx/nas.ToolBox.buttonColumn),
		nas.ToolBox.buttonWidth,1
	);
nas.ToolBox.CommandPalette[paletteId].Button[idx].onClick=nas.ToolBox.ItemList[idx][1];
//function()
//{
//	if(! this.parent.moved){this.parent.close();};
//}
//function	ファンクションボタン無名関数で登録
		}
	}
	}
//	nas.ToolBox.ItemList.unsetLength=nas.ToolBox.ItemList.length;//ボタン登録済の値を控える
	nas.ToolBox.ItemList.length=0;//クリア
	nas.ToolBox.CommandPalette[paletteId].visible=false;
//	なぜか、AE7でshow()以前にvisibleがtrueになるので、明示的にfalseをセットする
	return paletteId;
}

	nas.ToolBox.setPalette("nas-ToolPalette",[myLeft,myTop]);//マスターパレットを初期化
//マスターパレットの位置情報
//終了のためのウィンドウオフセット記録
//記録用共通オブジェクトへ書き出し
	nas.ToolBox.CommandPalette[0].onMove=function(){
nas.GUI.winOffset["CommandPalette"] =
[ nas.ToolBox.CommandPalette[0].bounds[0],nas.ToolBox.CommandPalette[0].bounds[1]];
	}
//マスターパレットを表示して終了
		nas.ToolBox.CommandPalette[0].show();
		nas.ToolBox.CommandPalette[0].moved=true;

	} else {
		alert ("This demo requires the scripting security preference to be set.\n" +
			"Go to the \"General\" panel of your application preferences,\n" +
			"and make sure that \"Allow Scripts to Write Files and Access Network\" is checked.");
	}
}
//
}
