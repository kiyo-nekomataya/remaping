//no launch
/*(パネルメニューII)
	// This script creates and shows a floating palette.
	// The floating palette contains buttons that launch a variety of
	// demo scripts.
	// このスクリプトは AE6.5 デモスクリプトの置き換えです。
	// …が 相当いじってしまったのでもうなんか 別物。
	// $Id: NasMenuII.jsx,v 1.1.2.39 2009/11/15 14:21:01 kiyo Exp $
/*
	ちょっぴり汎用性を上げる改造2006/05/11
	冒頭に"//no launch"を書くとパレットに加えない
	ファイル名の"^nas"を判定対象外に変更

	サブパレット増設 2006/09/03
	フォルダ内に"_subMenu.jsx"を設置すると、サブパレットを作成します。

	AE7環境下で、show()以前にvisible属性がtrueになるバグ(?)に対処 2006/11/14

	パネルメニューに変更開始	2007/07/23
	ドッキングパネルなんとか対応済み　2009/10/22 　あれ？わはは
		ドッキングパネルはshow()メソッドがない　判定は最初に一回にしておく
		モジュール名は変える。オブジェクトの兼用はやめ
	モジュール名の扱い変更
	変数moduleNameがメソッド内部に残ってしまうので、初期化後に変数名が変わると障害が発生する
	ローカル変数のスコープとしては機能していないので注意　2009/10/27
	
*/
if(true){
//
//オブジェクト識別文字列生成 
var myFilename=("$RCSfile: NasMenuII.jsx,v $").split(":")[1].split(",")[0];
var myFilerevision=("$Revision: 1.1.2.39 $").split(":")[1].split("$")[0];
var exFlag=true;
var moduleName="ToolBoxII";//モジュール名はパネルとウィンドウで共用　２重起動は禁止

//	動作環境が Panelであった場合にはnas.ToolBoxII.isDockingPanel に　trueを設定
if(this instanceof Panel){
	var isDockingPanel=true;
}else{
	var isDockingPanel=false;
}
/*

*/
//二重初期化防止トラップ
try{
//
	if(nas.Version)
	{	nas.Version[moduleName]=moduleName+" :"+myFilename+" :"+myFilerevision;
	
		try{
			if(nas[moduleName])
			{
				if(nas[moduleName].isDockingPanel)
				{
					if(isDockingPanel){
						exFlag=true
					}else{
				//２回目以降の起動でかつ１回目はドッキングパネルなので今回がドッキングパネルならフラグ立てて実行　ウィンドウなら全停止
						var msg="ドッキングパネルで起動されています。";
						msg+=nas.GUI.LineFeed;
						msg+="ウインドウ起動はできません";
						msg+=nas.GUI.LineFeed;
						msg+="パネルを閉じてから起動してください";
						alert(msg);
						exFlag=false;
					};
				}else{
					//１回目がウインドウなので今回ドッキングなら終了
					if(isDockingPanel){
						var msg="ウインドウモードで起動されています。";
						msg+=nas.GUI.LineFeed;
						msg+="パネル起動はできません";
						msg+=nas.GUI.LineFeed;
						msg+="ウィンドウとパネルを閉じてからもう一度起動してください";
						alert(msg);
						exFlag=false;
					}else{
						if(nas.ToolBoxII.CommandPalette.show){nas.ToolBoxII.CommandPalette.show();};//これは復帰時に注意
						exFlag=false;//１回目がウインドウだったので２回目は初期化しない
					}
				}
			}else{
				nas[moduleName]=new Object();
				nas[moduleName].isDockingPanel=isDockingPanel;
			}
		}catch(err){
			nas[moduleName]=new Object();
			nas[moduleName].isDockingPanel=isDockingPanel;
		}
	}
}catch(err){
	alert("nasライブラリが必要です。\nnasStartup.jsx を実行してください。");
	exFlag=false;
}


//alert("exFlag is "+ exFlag)
if(exFlag){
//初期設定　これらはフォルダごとにサブ設定ファイルで上書き可能です。
// ================	ボタンパレットのサイズ	================
	nas.ToolBoxII.buttonColumn=1;//ボタン列数は自動処理に変更 この数値は上限数値に変更
	nas.ToolBoxII.buttonWidth=2;//ボタン幅
	nas.ToolBoxII.buttonLineMax=20;//ボタン最大行数パネル使用時は無効

/* ***********		自動登録対象外のファイル・フォルダ名を正規表現で登録します。	********* */
	nas.ToolBoxII.denyFile	=new RegExp("(^\\..*|_subMenu\\.jsx?$|~\\.)","i");
	nas.ToolBoxII.denyFolder	=new RegExp("^CVS$","i");

//	アイテムリスト配列は一次配列です。パネルの再初期化ごとにクリアされます。
	nas.ToolBoxII.ItemList = new Array();

/*	======== メニュー階層プロパティ =======	*/
	nas.ToolBoxII.menuPath	=new Array();//メニュー階層履歴配列
	nas.ToolBoxII.currentFolder=new Folder(Folder.scripts.toString()+"/nas");//カレントフォルダ

/* ====	nas の記憶域からウィンドウの過去位置またはデフォルトを取得 ==== */
;
if(isDockingPanel)
{
	var myLeft=0;
	var myTop=0;
}else{
	var myLeft=(nas.GUI.winOffset["CommandPalette"])?
		nas.GUI.winOffset["CommandPalette"][0]:nas.GUI.dafaultOffset[0];
	var myTop=(nas.GUI.winOffset["CommandPalette"])?
		nas.GUI.winOffset["CommandPalette"][1]:nas.GUI.dafaultOffset[1];
}
//	nas.CommandPalette = new Array();初期化済みなので削除

/*
	フォルダを指定してアイテムを収集するメソッド


*/
nas.ToolBoxII.getItems =function(myFolder){
	if(! myFolder.exists){
//		alert("myFolder no exists");
		return false;
	}
//	ここでターゲットフォルダの設定ファイルを読み込み
var myConfigFile=new File(myFolder.path +"/"+ myFolder.name + "/_subMenu.js");
if(! myConfigFile.exists) {myConfigFile=new File(myFolder.path +"/"+ myFolder.name + "/_subMenu.jsx")}
if (myConfigFile.exists){
				myConfigFile.open("r");
				var myContent=myConfigFile.readln(1);
				if(myContent.match(/^\/\/no\x20launch$/))
				{
					myContent=myConfigFile.readln(1);
				}
				this.title=(myContent.match(/^\/\*\((.+)\)$/))?RegExp.$1:myFolder.name;//タイトル取得
				myConfigFile.seek(0);
				var previewFolder=Folder.current;Folder.current=myFolder;
				result=eval(myConfigFile.read().replace(/\.ToolBox\./g,"\.ToolBoxII\."));//読み込み実行
				Folder.current=previewFolder;delete previreFolder;
				myConfigFile.close();
}else{
//	指定のフォルダに設定ファイルがない場合の処置
	this.title=myFolder.name+"(*";
	nas.ToolBoxII.buttonColumn=1;//ボタン列数は自動処理に変更 この数値は上限数値に変更
	nas.ToolBoxII.buttonWidth=2.5;//ボタン幅
	nas.ToolBoxII.buttonLineMax=5;//ボタン最大行数 パネル使用時は無効
	
//	alert("configFile not exists in "+myFolder.toString()+ "\n "+Folder.current.toString());
}
//
	myfiles=myFolder.getFiles();//targetFolderSet

	for (idx=0;idx<myfiles.length;idx++)
	{
if(myfiles[idx].name.match(nas.ToolBoxII.denyFile)){continue;};//スキップ
if(myfiles[idx].name.match(nas.ToolBoxII.denyFolder)){continue;};//スキップ
		if(myfiles[idx] instanceof Folder)
		{
/*
	フォルダまたはフォルダのエイリアスだった場合はサブメニュー設定スクリプトを検索
	フォルダの中を調べてサブメニュー設定スクリプトがあれば
	メニューアイテムにサブパレットフォルダとして登録されます。
	サブメニュースクリプトファイルの名前は、"_subMenu.js" として予約されています。
	フォルダ内のファイルを取得して"_subMenu.jsx?"があれば、サブメニューフォルダとしてアイテム登録
	設定ファイルのないフォルダは、システム実行ボタンとして登録する。
	サブメニュー設定ファイルに"no launch"指定のある場合フォルダ自体を無視

	サブメニューアイテムの形式は フォルダオブジェクトそのもので、ボタンタイトルはプロパティで与える
*/
var myConfigFile=new File(myfiles[idx].path +"/"+ myfiles[idx].name + "/_subMenu.js");
if(! myConfigFile.exists) {myConfigFile=new File(myfiles[idx].path +"/"+ myfiles[idx].name + "/_subMenu.jsx")}
			if(myConfigFile.exists)
			{
				myConfigFile.open("r");
				myContent = myConfigFile.readln(1);//1行読み込み
				myConfigFile.close();
				if(myContent.match(/^\/\/no\x20launch$/))
				{continue;}else{

					var btTitle=(myContent.match(/^\/\*\((.+)\)$/))?RegExp.$1:myfiles[idx].name;//タイトル取得

//				alert(btTitle+" : "+myfiles[idx].name);
					nas.ToolBoxII.ItemList.push(myfiles[idx]);//フォルダオブジェクトをアイテムにいれる
					nas.ToolBoxII.ItemList[nas.ToolBoxII.ItemList.length-1].btTitle=("\( "+btTitle+" \)");//ラベルをプロパティで設定
//					nas.CommandPanelx.ItemList[nas.CommandPanelx.ItemList.length-1].status="0";//パレット構築フラグを付ける
				}
				continue;
			}else{
//	通常フォルダは、フルパスを引数に無名関数を登録 要素数 2
//	[ボタンタイトル,実行関数]
	var btTitle="["+myfiles[idx].name+"]";//タイトル取得

	eval ("_TEMP=function(){systemOpen('"+myfiles[idx].fsName.replace(/\\/g,"\\\\")+"')}");//親パレット消去部分は削除

				nas.ToolBoxII.ItemList.push([btTitle,_TEMP]);	
			}
		}else{
			if(myfiles[idx].name.match(/^.+\.(jsx?)$/))
			{
//		.js または .jsx でスクリプトファイルであった場合要素数3でアイテム登録
//		[ボタンタイトル,スクリプトパス,スクリプト名]
				var myOpenfile = new File(myfiles[idx].fsName);
				myOpenfile.open("r");
				myContent = myOpenfile.readln(1);//1行目だけ読む
				myOpenfile.close();
				if(myContent.match(/^\/\/no\x20launch$/)) continue;
				var btTitle=(myContent.match(/^\/\*\((.+)\)$/))?RegExp.$1:myfiles[idx].name.split("\.")[0];
//	var btTitle=(true)?myContent.split("#")[1]:myfiles[idx].name.split("\.")[0];
				nas.ToolBoxII.ItemList.push([btTitle,myfiles[idx].path,myfiles[idx].name]);
			}else{
//スクリプト以外のファイルは、全て無条件でシステム実行アイテムに登録 要素数は 2 
				var btTitle=myfiles[idx].name;//ファイル名をボタンラベルに
//ファイル
	var btTitle="<"+myfiles[idx].name+">";//タイトル取得

//			フルパスを引数に無名関数を登録
//			[ボタンタイトル,実行関数]
	eval ("_TEMP=function(){systemOpen('"+myfiles[idx].fsName.replace(/\\/g,"\\\\")+"');};");
				nas.ToolBoxII.ItemList.push([btTitle,_TEMP]);
			}
		}
	}
};//END getItems()


//		////////////////////////// 登録終り ///////////////////////
//	コマンドパネル用サービスメソッド nas_commonに送った方が良さそう

	// Called when a button is pressed, to invoke its associated script
	//
	function myHelpButtonClick()
	{
var msg= "ボタンをクリックして以下のスクリプトを実行することができます。:\n\n"
for (idx=0;idx<nas.ToolBoxII.ItemList.length;idx++){
	msg += nas.ToolBoxII.ItemList[idx][0] +"\t:";
	msg +=(nas.ToolBoxII.ItemList[idx].length==3)? nas.ToolBoxII.ItemList[idx][2]:"" ;
	msg +=	"\n";
}
msg +=	"\n";
	alert(msg);
	}
	// ウィンドウクローズ
	windowClose=function(myWindow)
	{
		if(! myWindow) myWindow=nas.ToolBoxII.CommandPalette;
		if(!myWindow instanceof Panel){myWindow.close()};
	}

	//	コマンドボタンがクリックされたらアイテムリストからコマンドを選んで実行
	//	引数のidは配列で、[ボタン列,ボタン行]
	//	引数のidは配列で、[ボタン行,ボタン列](横並び試験中)
nas.ToolBoxII.doItem=function(id)
	{

//var listIndex=id
//var listIndex=id[0]*this.CommandPalette.height+id[1]+(this.CommandPalette.displayOffset*1);//縦並び
var listIndex=id[1]*this.CommandPalette.columns+id[0]+(this.CommandPalette.displayOffset*1)-1;//横並び

		var prevCurrentFolder=Folder.current;

if(this.ItemList[listIndex] instanceof Folder)
{
//		サブフォルダである
//alert("open "+this.ItemList[listIndex].toString());
		this.openFolder(this.ItemList[listIndex]);
		result=true;
		//設定を変更してパネルを書きなおすこと
}else{
if(this.ItemList[listIndex].length==3){
//		コマンドアイテムだった場合(アイテムの配列要素が3つ)
		Folder.current = new Folder(this.ItemList[listIndex][1]);
		var scriptFile = new File(this.ItemList[listIndex][1]+"/"+this.ItemList[listIndex][2]);
		scriptFile.open();
		result=eval(scriptFile.read());
		scriptFile.close();

		Folder.current = prevCurrentFolder;
}else{
//それ以外の場合は、第二要素に登録された関数を実行
		if(this.ItemList[listIndex][1] instanceof Function){
			result=this.ItemList[listIndex][1]()
		}else{
		//	result=
		}
}
}
		return result;
	}
nas.ToolBoxII.menuBack=	function(){
		this.openFolder("back");
}

//		指定のフォルダをメニューに開く
nas.ToolBoxII.openFolder=	function(myFolder)
	{
		if(!myFolder){return;};
		if(this.currentFolder.toString()==myFolder.toString())
		{
			return;//同じフォルダなので処理不要
		}
//フォルダ以外の引数が渡されたら階層を上がる
		if(!(myFolder instanceof Folder))
		{	if(this.menuPath.length<1){return;};
			myFolder=this.menuPath[this.menuPath.length-1];
//alert("openFolder make: "+ nas.CommandPanelx.currentFolder.toString() +" to "+ myFolder.toString())
			this.menuPath.pop();//一個捨てる
		}else{
			nas.ToolBoxII.menuPath.push(nas.ToolBoxII.currentFolder);
		}

if(! myFolder.exists){alert("error nofolder "+myFolder.toString())}
//カレントを戻りアドレスとして記録
		nas.ToolBoxII.currentFolder=myFolder;
		if(true){
//				先にItemListを初期化する
			nas.ToolBoxII.ItemList=new Array();

/*				設定ファイルを読み込む
var myConfigFile=new File(myFolder.path +"/"+ myFolder.name + "/_subMenu.jsx");
if (myConfigFile.exists){
				myConfigFile.open("r");
				result=eval(myConfigFile.read().replace(/\.ToolBox\./g,"\.CommandPanelx\."));//1行読み込み
				myConfigFile.close();
}
*/
//				フォルダ内のアイテムを取得
			nas.ToolBoxII.getItems(myFolder);

			nas.ToolBoxII.setPalette();

		}

		if(nas.ToolBoxII.CommandPalette.visible)
		{
			if(nas.ToolBoxII.CommandPalette.hide){nas.ToolBoxII.CommandPalette.hide();};
			this.value=false;
		}else{
			//nas.CommandPanelx.CommandPalette.bounds.left=myLeft;
			//nas.CommandPanelx.CommandPalette.bounds.top=myTop;
if(! this.isDockingPanel)
{
	if(nas.ToolBoxII.CommandPalette.show){nas.ToolBoxII.CommandPalette.show();};
}
			//nas.CommandPanelx.CommandPalette.moved=false;
			this.value=true;
		}
	}
if(false){
/*============================================================================*/
	// この関数は、パレット配置するスクリプト読み込みボタンを初期化します(これ なしっぽい)

	function addScriptButton(Parent, Bounds, buttonLabel, buttonCurrentDirectory, buttonScriptName)
	{
		var newButton = nas.GUI.addButton(Parent,buttonLabel,Bounds[0],Bounds[1],Bounds[2],Bounds[3]);

		newButton.scriptFileName   = buttonScriptName;
		newButton.currentDirectory = buttonCurrentDirectory;

		newButton.onClick =function(){nas.ToolBoxII.doItem(this.index);};
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
/*============================================================================*/
}

if(true) {	}


nas.ToolBoxII.setPalette= function()
{
//		アイテム収集は済んでいるのが前提

//alert("setPalette :"+ this.currentFolder.toString())
//引数はなし
//if(false)
//	スクロールバーの幅
var myScrollWidth=12;

//if(nas.CommandPanelx.CommandPalette.type=="panel")
if(this.isDockingPanel)
{
//ドッキングパネルだった場合はラベル相当のオブジェクトの値と位置も変更する!(未処理)
//maxカラムは計算で修正
//現在のアイテム数と制限値を比較してウィンドウのサイズを設定
//	var displayColumns=this.buttonColumn;
//	var displayLines=(Math.ceil(this.ItemList.length/displayColumns)<this.buttonLineMax)?
//		Math.ceil(this.ItemList.length/displayColumns):this.buttonLineMax;//実は現行のルーチンだと何もしなくて良い?
}else{
//現在のアイテム数と制限値を比較してウィンドウのサイズを設定
	var displayColumns=this.buttonColumn;
	var displayLines=(Math.ceil((this.ItemList.length+1)/displayColumns)<this.buttonLineMax)?
		Math.ceil((this.ItemList.length+1)/displayColumns):this.buttonLineMax;
//alert("make :"+displayLines+"\n"+this.ItemList.length+"/"+displayColumns+"//"+this.buttonLineMax)
//	var displayLength=((displayColumns*displayLines)<this.ItemList.length)?(displayColumns*displayLines):this.ItemList.length;


//スクロールバー付きのサイズに変更

//	タイトルテキストの位置変更?
	if(this.CommandPalette.titleLabel)
	this.CommandPalette.titleLabel.bounds=[
		this.CommandPalette.titleLabel.bounds.left,
		this.CommandPalette.titleLabel.bounds.top,
		displayColumns*this.buttonWidth*nas.GUI.colUnit,
		this.CommandPalette.titleLabel.bounds.bottom
	];

	if(false){
//AE7	以降用
//	ウィンドウサイズ変更
	this.CommandPalette.bounds.width=
		displayColumns*this.buttonWidth*nas.GUI.colUnit+myScrollWidth;//
	this.CommandPalette.bounds.height=
		(displayLines+2)*nas.GUI.lineUnit;
	}else{
//AE6.5以前用
//	ウィンドウサイズ変更
	this.CommandPalette.bounds=[
	this.CommandPalette.bounds.left,this.CommandPalette.bounds.top,
	this.CommandPalette.bounds.left +displayColumns*this.buttonWidth*nas.GUI.colUnit+myScrollWidth,
	this.CommandPalette.bounds.top  +(displayLines+1)*nas.GUI.lineUnit]
	}
};//パネル動作切り換え

/*++++++++	ウィンドウのサイズからボタンの列数と行数を再取得	++++++++*/
//var withPanel=false;
var myLineMargin=(this.isDockingPanel)?0:1;

	displayColumns=Math.ceil(
		(this.CommandPalette.bounds.width-myScrollWidth-(this.buttonWidth*nas.GUI.colUnit*0.5))/(this.buttonWidth*nas.GUI.colUnit)
	);
	displayLines=Math.floor((this.CommandPalette.bounds.height-(nas.GUI.lineUnit*myLineMargin))/nas.GUI.lineUnit);
	var displayLength=((displayColumns*displayLines)<this.ItemList.length)?(displayColumns*displayLines):this.ItemList.length;

//スクロールバーの位置修正 表示範囲外のアイテムがない場合はスクロールバーを使用不可に

	if(false){
//	スクロールバー位置変更(AE7以降)
	this.CommandPalette.scroller.bounds.left=
		this.CommandPalette.bounds.width-myScrollWidth;//
	this.CommandPalette.scroller.bounds.height=
		(displayLines)*nas.GUI.lineUnit;
	}else{
//	スクロールバー位置変更(AE6.5 older)
	this.CommandPalette.scroller.bounds=[
	this.CommandPalette.bounds.width-myScrollWidth,
	this.CommandPalette.scroller.bounds.top,
	this.CommandPalette.bounds.width,
	this.CommandPalette.bounds.height]
	}

	this.CommandPalette.moved=false;
	this.CommandPalette.height	=displayLines//表示段数を記録
	this.CommandPalette.length	=displayLength;//表示長を記録

	this.CommandPalette.columns	=displayColumns;//パレット幅を記録

	this.CommandPalette.text	=		this.title;//パレット名を変更

	if(this.CommandPalette.titleLabel)
	{	this.CommandPalette.titleLabel.text=this.title};

//現在のボタン数が新規アイテム数に満たない場合は新規に生成
//オーバーした分は消す(hide) 同数ならNOP
	if(nas.ToolBoxII.CommandPalette.displayButton.length< this.CommandPalette.length){
	for (idx=nas.ToolBoxII.CommandPalette.displayButton.length;idx<this.CommandPalette.length;idx++)
	{
//ここで新規ボタン作る。既存のボタンの調整は後

	var btnName=idx;
	var btnLeft=Math.floor((idx+1)/displayLines);
	var btnTop=((idx+1)%displayLines);
	
		nas.ToolBoxII.CommandPalette.displayButton[idx]=
	nas.GUI.addButton(
		nas.ToolBoxII.CommandPalette,
		btnName,
		btnLeft,
		2+btnTop,
		nas.ToolBoxII.buttonWidth,1
	);

		nas.ToolBoxII.CommandPalette.displayButton[idx].index=[btnLeft,btnTop];
		nas.ToolBoxII.CommandPalette.displayButton[idx].onClick=function(){nas.ToolBoxII.doItem(this.index);};
	}}
//超過分のボタンは隠す
	if(nas.ToolBoxII.CommandPalette.displayButton.length>this.CommandPalette.length)
	for (idx=this.CommandPalette.length;idx<nas.ToolBoxII.CommandPalette.displayButton.length;idx++)
	{
		nas.ToolBoxII.CommandPalette.displayButton[idx].hide();
	}

//全ボタン情報登録/検査
this.CommandPalette.displayOffset=0;//	切り替え時はオフセット初期化

var myButtonWidth	=(this.CommandPalette.bounds.width-myScrollWidth)/displayColumns;
var myButtonHeight	=(this.CommandPalette.bounds.height-(nas.GUI.lineUnit*myLineMargin))/displayLines;

	for (idx=0;idx<this.CommandPalette.length;idx++)
	{
	var btnName=(nas.ToolBoxII.ItemList[idx] instanceof Folder)?
		((nas.ToolBoxII.ItemList[idx].btTitle)?"◇"+nas.ToolBoxII.ItemList[idx].btTitle:"◆"+decodeURI(nas.ToolBoxII.ItemList[idx].name)):
		decodeURI(nas.ToolBoxII.ItemList[idx][0]);
/* -- 縦並び 
	var btnLeft=Math.floor((idx+1)/displayLines);
	var btnTop=((idx+1)%displayLines);
--*/
/* -- 横並び --*/
	var btnLeft=((idx+1)%displayColumns);
	var btnTop=Math.floor((idx+1)/displayColumns);

	var btnIndex=[btnLeft,btnTop];
//	ボタンテキストの更新
if(this.CommandPalette.displayButton[idx].text!=btnName)
{
	this.CommandPalette.displayButton[idx].text=btnName;
	this.CommandPalette.displayButton[idx].helpTip=btnName;//AE8以上か?
};
//	ボタンジオメトリを更新
	if(false){
//	ウィンドウのサイズにあわせてボタン位置を更新
if(	(this.CommandPalette.displayButton[idx].bounds.Left!=btnLeft*(this.buttonWidth*nas.GUI.colUnit))||
	(this.CommandPalette.displayButton[idx].bounds.Top!=(btnTop+2)*nas.GUI.lineUnit)
)
{
	this.CommandPalette.displayButton[idx].bounds=[
		btnLeft*(this.buttonWidth*nas.GUI.colUnit),
		(btnTop+2)*nas.GUI.lineUnit,
		(btnLeft+1)*(this.buttonWidth*nas.GUI.colUnit),
		(btnTop+3)*nas.GUI.lineUnit]
}
	}else{

/*
	ボタン位置とサイズを更新(ウィンドウサイズから算出)
*/
	myPaddingLeft=2;
	myPaddingTop=1;
	myPaddingRight=4;
	myPaddingBottom=2;
{
	this.CommandPalette.displayButton[idx].bounds=[
		btnLeft*myButtonWidth+myPaddingLeft,
		btnTop*myButtonHeight+(nas.GUI.lineUnit*myLineMargin)+myPaddingTop,
		(btnLeft+1)*myButtonWidth-myPaddingRight,
		(btnTop+1)*myButtonHeight+(nas.GUI.lineUnit*myLineMargin)-myPaddingBottom]
}
	}
if(this.CommandPalette.displayButton[idx].index!=btnIndex)
{	this.CommandPalette.displayButton[idx].index=btnIndex;};

//	非表示のボタンを表示
if(! this.CommandPalette.displayButton[idx].visible)
{	this.CommandPalette.displayButton[idx].show();};

	}
//	スクロールバーの設定

	this.CommandPalette.scroller.maxvalue=(this.ItemList.length<=this.CommandPalette.length)?
		0:1+Math.ceil(this.ItemList.length/this.CommandPalette.columns)-this.CommandPalette.height;

//		Math.ceil(this.ItemList.length/this.CommandPalette.columns)-this.CommandPalette.height;
	this.CommandPalette.scroller.minvalue=0;
	this.CommandPalette.scroller.value=0;

	this.CommandPalette.scroller.enabled=(this.CommandPalette.scroller.maxvalue==0)?false:true;
// writeLn(this.CommandPalette.length+"/"+this.CommandPalette.columns+"/"+this.CommandPalette.height+"/")
	if(this.CommandPalette.scroller.maxvalue==0)
	{
		this.CommandPalette.scroller.hide();
		this.CommandPalette.fwdButton.hide();
		this.CommandPalette.bwdButton.hide();

	}else{
		this.CommandPalette.scroller.show();
		this.CommandPalette.fwdButton.show();
		this.CommandPalette.bwdButton.show();

	}
//	戻りボタンを調整
	if(this.menuPath.length>1)
	{
		if(! this.CommandPalette.backButton.enabled){
			this.CommandPalette.backButton.enabled=true;
		};
	}else{
		if(this.CommandPalette.backButton.enabled){
			this.CommandPalette.backButton.enabled=false;
		};
	}

//	AE6.5 以前ならばいったんウインドウを非表示/表示
//	this.CommandPalette.hide();this.CommandPalette.show();

//	なぜか、AE7でshow()以前にvisibleがtrueになるので、明示的にfalseをセットする
//		alert(nas.ToolBoxII.CommandPalette.visible)
	if(true){nas.ToolBoxII.CommandPalette.visible=false;}
	return
// paletteId;
}
//スクロール処理
nas.ToolBoxII.doScroll=function()
{
	var myOffset =Math.floor(this.CommandPalette.scroller.value*this.CommandPalette.columns);
//	var myOffset =Math.round(this.CommandPalette.scroller.value*this.CommandPalette.columns);
	if(this.CommandPalette.displayOffset==myOffset){return;};
// writeLn(myOffset+":myOffset")
/*	
//displaydOffsetを次の行に設定
//現在の表示オフセットと比較
// writeLn(this.CommandPalette.displayOffset+":"+this.CommandPalette.scroller.value)
	if(this.CommandPalette.displayOffset<myOffset){
//オフセット上向
	this.CommandPalette.displayOffset=(this.CommandPalette.Columns<(myOffset-this.CommandPalette.displayOffset))?
		this.CommandPalette.displayOffset+this.CommandPalette.columns:myOffset;
	var myOffset=(Math.floor((this.CommandPalette.displayOffset)/this.CommandPalette.columns))*this.CommandPalette.columns;
	}else{
//オフセット下向
	this.CommandPalette.displayOffset=(this.CommandPalette.Columns>(this.CommandPalette.displayOffset-this.CommandPalette.scroller.value))?
		this.CommandPalette.displayOffset-this.CommandPalette.columns-1:this.CommandPalette.scroller.value;
	var myOffset=(Math.floor((this.CommandPalette.displayOffset)/this.CommandPalette.columns))*this.CommandPalette.columns;
}
*/
//		

	for (idx=0;idx<this.CommandPalette.length;idx++)
	{
//alert(this.CommandPalette.displayOffset)
		if((idx+myOffset)<this.ItemList.length)
		{
//		ボタンラベルを書き換える 非表示状態なら表示
		var btnName=(nas.ToolBoxII.ItemList[idx+myOffset] instanceof Folder)?
		(
			(nas.ToolBoxII.ItemList[idx+myOffset].btTitle)?
				"◇"+nas.ToolBoxII.ItemList[idx+myOffset].btTitle:
				"◆"+decodeURI(nas.ToolBoxII.ItemList[idx+myOffset].name)
		):
			decodeURI(nas.ToolBoxII.ItemList[idx+myOffset][0]);

	if(this.CommandPalette.displayButton[idx].text!=btnName)
	{
		this.CommandPalette.displayButton[idx].text=btnName;
		this.CommandPalette.displayButton[idx].helpTip=btnName;//AE8以上か?
	};

			if(! this.CommandPalette.displayButton[idx].visible)
			{	this.CommandPalette.displayButton[idx].show();};

			
		}else{
//		空ボタンなので非表示にする
			if(this.CommandPalette.displayButton[idx].visible)
			{	this.CommandPalette.displayButton[idx].hide();};
		}
	}

	this.CommandPalette.scroller.value=Math.floor(myOffset/this.CommandPalette.columns);
//	this.CommandPalette.scroller.value=Math.round(myOffset/this.CommandPalette.columns);

//(this.CommandPalette.scroller.maxvalue<myOffset)?this.CommandPalette.scroller.maxvalue:myOffset;
	this.CommandPalette.displayOffset=myOffset;
//this.CommandPalette.scroller.value;
// writeLn(myOffset+"|"+this.CommandPalette.scroller.value+":"+this.CommandPalette.scroller.minvalue+"/"+this.CommandPalette.scroller.maxvalue);
}
/*
	コマンドパレットGUI初期化
	初期ウィンドウのみを設定して調整は初期化ルーチンへ渡す
if((this)&&(this.type=="panel"))
*/
if(isDockingPanel)
{
//パネル動作中なのでウインドウの初期化は省略して参照をセット
	nas.ToolBoxII.CommandPalette=this;
	nas.ToolBoxII.CommandPalette.onResize=function(){nas.ToolBoxII.setPalette();};
//	nas.CommandPanelx.CommandPalette.onResize=function(){alert("Resized")}
}else{
//ベースとなるウィンドウを作成　パネルでは省略
	nas.ToolBoxII.CommandPalette=
		nas.GUI.newWindow(
			"palette",
			"nas-ToolPalette",
			nas.ToolBoxII.buttonColumn*nas.ToolBoxII.buttonWidth,
			Math.ceil((nas.ToolBoxII.ItemList.length+1)/nas.ToolBoxII.buttonColumn)+1,
			myLeft,myTop
		);
//	nas.CommandPanelx.CommandPalette.parent=nas.CommandPanelx;//オーバーライト不能
}

	nas.ToolBoxII.CommandPalette.scroller=
		nas.GUI.addScrollBar(
			nas.ToolBoxII.CommandPalette,
			0,0,0,
			nas.ToolBoxII.buttonColumn*nas.ToolBoxII.buttonWidth,
			(isDockingPanel)?0:1,
			Math.ceil(nas.ToolBoxII.ItemList.length/nas.ToolBoxII.buttonColumn)+1,
			"left"
		);	
	nas.ToolBoxII.CommandPalette.scroller.onChange=function(){nas.ToolBoxII.doScroll()};
if(false){
	nas.ToolBoxII.CommandPalette.configButton=
	nas.GUI.addButton(
		nas.ToolBoxII.CommandPalette,
		"[[C]]",
		1,
		1,
		nas.ToolBoxII.buttonWidth/2,1
	);
	nas.ToolBoxII.CommandPalette.configButton.onClick=function(){alert("config")}
}

/*
	コントロールボタンを配置

*/
	myPaddingLeft=2;
	myPaddingTop=1;
	myPaddingRight=4;
	myPaddingBottom=2;
	myButtonSpan=nas.GUI.lineUnit*1.3;

if(nas.ToolBoxII.isDockingPanel)
{
	nas.ToolBoxII.CommandPalette.backButton=
		nas.GUI.addButton(nas.ToolBoxII.CommandPalette,"△",0,0,.8,1);
	nas.ToolBoxII.CommandPalette.bwdButton=
		nas.GUI.addButton(nas.ToolBoxII.CommandPalette,"▲",.5,0,.8,1);
	nas.ToolBoxII.CommandPalette.fwdButton=
		nas.GUI.addButton(nas.ToolBoxII.CommandPalette,"▼",1,0,.8,1);

	nas.ToolBoxII.CommandPalette.backButton.bounds=[
		myPaddingLeft,
		myPaddingTop,
		(myButtonSpan)-myPaddingRight,
		(nas.GUI.lineUnit)-myPaddingBottom];
	nas.ToolBoxII.CommandPalette.backButton.helpTip="戻る"

	nas.ToolBoxII.CommandPalette.bwdButton.bounds=[
		myPaddingLeft+myButtonSpan,
		myPaddingTop,
		(myButtonSpan*2)-myPaddingRight,
		(nas.GUI.lineUnit)-myPaddingBottom];
	nas.ToolBoxII.CommandPalette.bwdButton.helpTip="後へ"

	nas.ToolBoxII.CommandPalette.fwdButton.bounds=[
		myPaddingLeft+myButtonSpan*2,
		myPaddingTop,
		(myButtonSpan*3)-myPaddingRight,
		(nas.GUI.lineUnit)-myPaddingBottom];
	nas.ToolBoxII.CommandPalette.fwdButton.helpTip="前へ"

}else{
	nas.ToolBoxII.CommandPalette.backButton=
		nas.GUI.addButton(nas.ToolBoxII.CommandPalette,"△",0,1,.8,1);
	nas.ToolBoxII.CommandPalette.bwdButton=
		nas.GUI.addButton(nas.ToolBoxII.CommandPalette,"▲",.5,1,.8,1);
	nas.ToolBoxII.CommandPalette.fwdButton=
		nas.GUI.addButton(nas.ToolBoxII.CommandPalette,"▼",1,1,.8,1);

	nas.ToolBoxII.CommandPalette.backButton.bounds=[
		myPaddingLeft,
		(nas.GUI.lineUnit)+myPaddingTop,
		(myButtonSpan)-myPaddingRight,
		(nas.GUI.lineUnit*2)-myPaddingBottom];

	nas.ToolBoxII.CommandPalette.bwdButton.bounds=[
		myPaddingLeft+myButtonSpan,
		(nas.GUI.lineUnit)+myPaddingTop,
		(myButtonSpan*2)-myPaddingRight,
		(nas.GUI.lineUnit*2)-myPaddingBottom];

	nas.ToolBoxII.CommandPalette.fwdButton.bounds=[
		myPaddingLeft+myButtonSpan*2,
		(nas.GUI.lineUnit)+myPaddingTop,
		(myButtonSpan*3)-myPaddingRight,
		(nas.GUI.lineUnit*2)-myPaddingBottom];

}
	nas.ToolBoxII.CommandPalette.backButton.onClick=function(){nas.ToolBoxII.openFolder("back");}
	nas.ToolBoxII.CommandPalette.bwdButton.onClick=function(){nas.ToolBoxII.CommandPalette.scroller.value--;nas.ToolBoxII.doScroll();}
	nas.ToolBoxII.CommandPalette.fwdButton.onClick=function(){nas.ToolBoxII.CommandPalette.scroller.value++;nas.ToolBoxII.doScroll();}

	nas.ToolBoxII.CommandPalette.displayButton=new Array();


//
/*
	main() プログラム開始
*/
//	alert("start " +Folder.current.toString());


//マスターパレットを初期化
//	nas.CommandPanelx.getItems(Folder.current);
	nas.ToolBoxII.getItems(Folder(Folder.scripts.toString()+"/nas"));
//	alert(Folder.scripts.toString()+"/nas");
//	nas.CommandPanelx.menuPath.push(Folder.current);
	nas.ToolBoxII.menuPath.push(nas.ToolBoxII.currentFolder);
	nas.ToolBoxII.setPalette();

//マスターパレットの位置情報
//終了のためのウィンドウオフセット記録
//記録用共通オブジェクトへ書き出し
	nas.ToolBoxII.CommandPalette.onMove=function(){
//alert("onMove!!");
nas.GUI.winOffset["CommandPalette"] =
[ nas.ToolBoxII.CommandPalette.bounds[0],nas.ToolBoxII.CommandPalette.bounds[1]];
return true;
	}
//ウィンドウ閉じたときにプロシジャ実行可能か
nas.ToolBoxII.CommandPalette.onClose=function(){
//	alert("erace Object");
	delete nas.ToolBoxII;
}

//マスターパレットを表示して終了
if(! isDockingPanel){nas.ToolBoxII.CommandPalette.show()};
}
//
}
