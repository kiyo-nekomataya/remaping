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
	
	今更だけどCS６以降の環境でボタンアイコンにテキストがオーバーレイされる仕様に対応　2014/11/08
*/
if(true){
//
//オブジェクト識別文字列生成 
var myFilename=("$RCSfile: NasMenuII.jsx,v $").split(":")[1].split(",")[0];
var myFilerevision=("$Revision: 1.1.2.39 $").split(":")[1].split("$")[0];
var exFlag=true;
var moduleName="ToolBoxII";//モジュール名はパネルとウィンドウで共用　２重起動は禁止

//
var isDockingPanel	=(this.type=="panel")?true:false;// AE7以前の環境でPanelオブジェクトがないのでinstanceofは使用不能だった
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


// alert("exFlag is "+ exFlag+"\ndoc"+isDockingPanel)
if(appHost.version<8){
	var msg=myFilename+"( ";
	msg+=myFilerevision+" )"+nas.GUI.LineFeed;
	msg+="このバージョンはAE8以降の版専用です。\nAE7以前の方は対応バージョンをご使用ください。"+nas.GUI.LineFeed;
	msg+="設定ファイル類は共通です";
	alert(msg);
	delete nas[moduleName];
	exFlag=false;
}

if(exFlag){
//	動作環境が Panelであった場合にはnas.ToolBoxII.isDockingPanel に　trueを設定
if(this instanceof Panel){
	var isDockingPanel=true;
}else{
	var isDockingPanel=false;
}
/* ***********		アイコンボタンモード	********* */
	nas.ToolBoxII.isIcon	=true;//falseにすると従来モードになる　トップフォルダのみで設定可能　標準はアイコン切り替え時は再起動が必要
	nas.ToolBoxII.stdIconWidth	=48;//デフォルトのアイコンサイズ　正方形推奨
	
//初期設定　これらはフォルダごとにサブ設定ファイルで上書き可能です。
// ================	ボタンパレットのサイズ	================
	nas.ToolBoxII.buttonColumn=1;//ボタン列数は自動処理に変更 この数値は上限数値に変更
	nas.ToolBoxII.buttonWidth=2;//テキストボタン幅　ユニット数
	nas.ToolBoxII.buttonLineMax=20;//ボタン最大行数パネル使用時は無効
	
/* ***********		アイコンボタンモード`のスパン変数	********* */
	nas.ToolBoxII.colUnit	=(this.isIcon)?this.stdIconWidth:nas.GUI.colUnit;;
	nas.ToolBoxII.lineUnit	=(this.isIcon)?this.stdIconWidth:nas.GUI.lineUnit;;

/* ***********		自動登録対象外のファイル・フォルダ名を正規表現で登録します。	********* */
	nas.ToolBoxII.denyFile	=new RegExp("(^\\..*|_subMenu\\.jsx?$|~\\.|.*\.png|Thumbs.db)","i");
	nas.ToolBoxII.denyFolder	=new RegExp("^CVS$","i");

//	アイテムリスト配列は一次配列です。パネルの再初期化ごとにクリアされます。
	nas.ToolBoxII.ItemList = new Array();

	nas.ToolBoxII.btnOffset =1;//画面上のボタンマトリクス上にシステムボタンが占有するボタン数;
	nas.ToolBoxII.scrollMode ="";//　""　,"line"　,"icon"　スクロール単位切り替え
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
	if(myFolder.alias){myFolder=myFolder.resolve()}
	if((! myFolder.exists)||(! myFolder instanceof Folder)){
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
				//設定の再処理でUIサイズを調整
				/* ***********		アイコンボタンモード`のスパン変数	********* */
	if (this.isIcon){nas.ToolBoxII.buttonWidth=1};
	nas.ToolBoxII.colUnit	=(this.isIcon)?this.stdIconWidth:nas.GUI.colUnit;;
	nas.ToolBoxII.lineUnit	=(this.isIcon)?this.stdIconWidth:nas.GUI.lineUnit;;

}else{
//	指定のフォルダに設定ファイルがない場合の処置（アイコン版）
	this.title=myFolder.name+"(*";
	nas.ToolBoxII.buttonColumn=1;//ボタン列数は自動処理に変更 この数値は上限数値に変更
	nas.ToolBoxII.buttonWidth=(nas.ToolBoxII.isIcon)?nas.ToolBoxII.stdIconWidth/nas.GUI.colUnit:2.5;//ボタン幅を標準アイコン幅に
	nas.ToolBoxII.buttonLineMax=5;//ボタン最大行数 パネル使用時は無効

//	alert("configFile not exists in "+myFolder.toString()+ "\n "+Folder.current.toString());
}
//
	myfiles=myFolder.getFiles();//targetFolderSet
//alert(myFolder.exists +" : "+myFolder.name +myfiles.length);
	for (idx=0;idx<myfiles.length;idx++)
	{
	//	var myTarget=myfiles[idx];
if(myfiles[idx].name.match(nas.ToolBoxII.denyFile)){continue;};//スキップ
if(myfiles[idx].name.match(nas.ToolBoxII.denyFolder)){continue;};//スキップ
	if(myfiles[idx].alias){

//	alert("Alias "+myfiles[idx].name)
		var myTarget=myfiles[idx].resolve();
		if(myTarget){myfiles[idx]=myTarget};//入れ替え
	//	alert("alias : "+myfiles[idx].alias.toString())
	}
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

	アクションフォルダ増設　2009/11/30
	アクションフォルダに指定されたフォルダはフォルダ自体が一個のコマンドとして登録されるので階層を下ることができなくなります。
*/
var myConfigFile=new File(myfiles[idx].path +"/"+ myfiles[idx].name + "/_subMenu.js");
if(! myConfigFile.exists) {myConfigFile=new File(myfiles[idx].path +"/"+ myfiles[idx].name + "/_subMenu.jsx")}
			if(myConfigFile.exists)
			{
				myConfigFile.open("r");
				myContent = myConfigFile.readln(1);
//				myContent += "\n";
				myContent += myConfigFile.readln(1);//2行読み込み
				myContent += myConfigFile.readln(1);//3行読み込み
				myConfigFile.close();
				if(myContent.match(/^\/\/no\x20launch/))
				{continue;}else{

					var btTitle=(myContent.match(/\/\*\((.+)\)/))?RegExp.$1:myfiles[idx].name;//タイトル取得
					var isAction=(myContent.match(/\/\/actionFolder/))?true:false;
//アイコン取得　同名ファイル（この場合は_subMenu.png)>設定ファイルの順　はずれたらシステムのフォルダアイコンがつく
			if(myContent.match(/\<(.+)\>/))
			{
				var btIcon=nas.GUI.systemIcons[RegExp.$1];
			}else{
				var btIcon=(isAction)?nas.GUI.systemIcons["action_f"]:nas.GUI.systemIcons["open_f"];
			}
			if(myfiles[idx].getFiles("_subMenu.png").length){btIcon=nas.GUI.getIcon(myfiles[idx].getFiles("_subMenu.png")[0])};//ファイルあれば上書き
//				alert(btTitle+" : "+myfiles[idx].name);
			if(isAction)
			{
				eval("_TEMP=function(){nas.otome.doAction('"+myfiles[idx].fsName.replace(/\\/g,"\\\\")+"')}");
				nas.ToolBoxII.ItemList.push([btTitle,_TEMP]);//フォルダアクション関数ボタンにする
					nas.ToolBoxII.ItemList[nas.ToolBoxII.ItemList.length-1].btIcon=(btIcon)?btIcon:nas.GUI.systemIcons["action_f"];//デフォルトアイコンをつける
		//		alert(nas.ToolBoxII.ItemList[nas.ToolBoxII.ItemList.length-1].toString());
			}else{
				nas.ToolBoxII.ItemList.push(myfiles[idx]);//フォルダオブジェクトをアイテムにいれる
					nas.ToolBoxII.ItemList[nas.ToolBoxII.ItemList.length-1].btTitle=("\( "+btTitle+" \)");//ラベルをプロパティで設定
					nas.ToolBoxII.ItemList[nas.ToolBoxII.ItemList.length-1].btIcon=btIcon;//デフォルトアイコンをつける
			}
//					nas.ToolBoxII.ItemList[nas.ToolBoxII.ItemList.length-1].btIcon=nas.GUI.systemIcons["open_f"];//デフォルトアイコンをつける
					
//					nas.CommandPanelx.ItemList[nas.CommandPanelx.ItemList.length-1].status="0";//パレット構築フラグを付ける
				}
				continue;
			}else{
//	通常フォルダは、フルパスを引数に無名関数を登録 要素数 2
//	[ボタンタイトル,実行関数]
	var btTitle="["+myfiles[idx].name+"]";//タイトル取得

	eval ("_TEMP=function(){systemOpen('"+myfiles[idx].fsName.replace(/\\/g,"\\\\")+"')}");//親パレット消去部分は削除

				nas.ToolBoxII.ItemList.push([btTitle,_TEMP]);	
				nas.ToolBoxII.ItemList[nas.ToolBoxII.ItemList.length-1].btIcon=nas.GUI.systemIcons["os_f"];
			}
		}else{
			if(myfiles[idx].name.match(/^.+\.(jsx?|jsxbin)$/i))
			{
//		.js または .jsx でスクリプトファイルであった場合要素数3でアイテム登録
//		[ボタンタイトル,スクリプトパス,スクリプト名]
//		アイコンはプロパティで

				var myOpenfile = new File(myfiles[idx].fsName);
				myOpenfile.open("r");
				myContent = myOpenfile.readln(1);//1行目
				myContent += myOpenfile.readln(1);//2行目
				myOpenfile.close();
				if(myContent.match(/^\/\/no\x20launch/)) continue;
				var btTitle=(myContent.match(/^\/\*\((.+)\)/))?RegExp.$1:myfiles[idx].name.split("\.")[0];
				var btIcon=(myContent.match(/<([^<].+)>/))?nas.GUI.systemIcons[RegExp.$1]:nas.GUI.getIcon(myfiles[idx]);
//	var btTitle=(true)?myContent.split("#")[1]:myfiles[idx].name.split("\.")[0];
				nas.ToolBoxII.ItemList.push([btTitle,myfiles[idx].path,myfiles[idx].name]);
					nas.ToolBoxII.ItemList[nas.ToolBoxII.ItemList.length-1].btIcon=btIcon;
//アイコン取得に失敗したら勝手に割り付けておく
				if(!(nas.ToolBoxII.ItemList[nas.ToolBoxII.ItemList.length-1].btIcon instanceof ScriptUIImage))
				{
					nas.ToolBoxII.ItemList[nas.ToolBoxII.ItemList.length-1].btIcon=nas.GUI.systemIcons[["ball","triangle","box","star","apple","mikann","banana"][idx%7]]
//					nas.ToolBoxII.ItemList[nas.ToolBoxII.ItemList.length-1].btIcon=nas.GUI.systemIcons["chr_"+RegExp.$1]
//				}else{
				}
			}else{
//FFX
				if(myfiles[idx].name.match(/^.+\.(ffx)$/i)){
					eval("_TEMP=function(){nas.otome.doFFX('"+myfiles[idx].fsName.replace(/\\/g,"\\\\")+"')}");
					nas.ToolBoxII.ItemList.push(["[ffx]"+myfiles[idx].name,_TEMP]);//フォルダアクション関数ボタンにする
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
				if(myfiles[idx] instanceof Folder){
					nas.ToolBoxII.ItemList[nas.ToolBoxII.ItemList.length-1].btIcon=nas.GUI.systemIcons["open_f"];
				}else{
					nas.ToolBoxII.ItemList[nas.ToolBoxII.ItemList.length-1].btIcon=nas.GUI.getIcon(myfiles[idx]);
				}
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
var listIndex=id[1]*this.CommandPalette.columns+id[0]+(this.CommandPalette.displayOffset*1)-this.btnOffset;//横並び

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
/*nas.ToolBox.doAction(Folder)
	現在の選択アイテムがコンポだった場合アクションフォルダの適用を行なう
	フォルダがアクションとして成立しているか否かは感知しない
	複数のアイテムが選択されている場合は、選択された全てのコンポアイテム
	に対してアクションの適用を行なう。
	対象アイテム数が多い場合中断ダイアログを出す

nas.ToolBoxII.doAction=function(myPath)
{
	var borderCount=25;
	var myFolder=new Folder(myPath);
	var myTargets=app.project.selection;
	var doFlag=true;
	if(myTargets.length>borderCount){doFlag=(confirm(myTargets.length +" アイテムの処理が指定されました。"+nas.GUI.LineFeed+"続行しますか？"))?true:false;}
	if(doFlag){
		for (var itmIdx=0;itmIdx<myTargets.length;itmIdx++)
		{
			if((myTargets[itmIdx] instanceof CompItem)&&(myFolder.exists))
			{
				myTargets[itmIdx].executeAction(myFolder);
			}else{
				nas.otome.writeConsole("skip action for "+myTargets[itmIdx].name);
			}
		}
	}
}
*/
//===============================nas.ToolBox.doAction(Folder)
/*nas.ToolBox.doFFX(File)
	現在の選択アイテムがコンポだった場合コンポ内のレイヤにFFXの適用を行なう
	アクティブなレイヤがない場合はコンポのプリセット適用を行なう


nas.ToolBoxII.doFFX=function(myPath)
{ 
	var borderCount=25;
	var myFFX=new File(myPath);
	var myTargets=app.project.selection;
	var doFlag=true;
	if(myTargets.length>borderCount){doFlag=(confirm(myTargets.length +" アイテムの処理が指定されました。"+nas.GUI.LineFeed+"続行しますか？"))?true:false;}
	if(doFlag){
		for (var itmIdx=0;itmIdx<myTargets.length;itmIdx++)
		{
			if((myTargets[itmIdx] instanceof CompItem)&&(myFFX.exists)){
				if(myTargets[itmIdx].selectedLayers.length){
					for(var lIdx=0;lIdx<myTargets[itmIdx].selectedLayers.length;lIdx++)
					{
						myTargets[itmIdx].selectedLayers[lIdx].applyPresetA(myFFX);
					}
				}else{
					if(myTargets[itmIdx].applyPreset){myTargets[itmIdx].applyPreset(myFFX)};
				}
			}else{
				alert("プリセット適用は、コンポをアクティブにして実行してください");
			}
		}
	}
}
*/
//===============================nas.ToolBox.doFFX(FFX)

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
if(false) {
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

	}
/*表示マトリクス上でのバウンス配列を戻す変数
*/

nas.ToolBoxII.getBounds=function(id)
{
/*
	マトリクスIDからボタン位置を算出
	ウインドウの表示行数を参照しているので表示行数が1行のときは表示されないボタンができるのでケースわけして対処が必要
	配置計算を場合分ける
*/
	var myTopOffset	=(this.isDockingPanel)?0:this.lineUnit;
	var myScrollWidth	=12
	var myButtonWidth	=(this.CommandPalette.bounds.width-myScrollWidth)/this.CommandPalette.columns;
	var myButtonHeight	=(this.CommandPalette.bounds.height-myTopOffset)/this.CommandPalette.height;

	var myPaddingLeft=2;
	var myPaddingTop=1;
	var myPaddingRight=4;
	var myPaddingBottom=2;

var myLeft=	(id%this.CommandPalette.columns)*(myButtonWidth)+myPaddingLeft;
var myTop=	myTopOffset + Math.floor(id/this.CommandPalette.columns)*this.lineUnit+myPaddingTop;
var myRight=myLeft+myButtonWidth-myPaddingRight;
var myBottom=myTop+myButtonHeight-myPaddingBottom;

	return [myLeft,myTop,myRight,myBottom];
}

nas.ToolBoxII.setPalette= function()
{
//		アイテム収集は済んでいるのが前提

//alert("setPalette :"+ this.currentFolder.toString())
//引数はなし
//if(false)
//	スクロールバーの幅 モード別のユニットサイズ
var myScrollWidth=12;
nas.ToolBoxII.colUnit=(this.isIcon)?this.stdIconWidth:nas.GUI.colUnit;
nas.ToolBoxII.lineUnit=(this.isIcon)?this.stdIconWidth:nas.GUI.lineUnit;

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
		displayColumns*this.buttonWidth*nas.ToolBoxII.colUnit,
		this.CommandPalette.titleLabel.bounds.bottom
	];

	if(true){
//AE7	以降用
//	ウィンドウサイズ変更
	this.CommandPalette.bounds.width=
		displayColumns*this.buttonWidth*nas.ToolBoxII.colUnit+myScrollWidth;//
	this.CommandPalette.bounds.height=
		(displayLines+2)*nas.ToolBoxII.lineUnit;
	}else{
//AE6.5以前用
//	ウィンドウサイズ変更
	this.CommandPalette.bounds=[
	this.CommandPalette.bounds.left,this.CommandPalette.bounds.top,
	this.CommandPalette.bounds.left +displayColumns*this.buttonWidth*nas.ToolBoxII.colUnit+myScrollWidth,
	this.CommandPalette.bounds.top  +(displayLines+1)*nas.ToolBoxII.lineUnit]
	}
};//パネル動作切り換え

/*++++++++	ウィンドウのサイズからボタンの列数と行数を再取得	++++++++*/
//var withPanel=false;
var myLineMargin=(this.isDockingPanel)?0:1;

	displayColumns=Math.ceil(
		(this.CommandPalette.bounds.width-myScrollWidth-(this.buttonWidth*nas.ToolBoxII.colUnit*0.5))/(this.buttonWidth*nas.ToolBoxII.colUnit)
	);
	displayLines=Math.floor((this.CommandPalette.bounds.height-(nas.ToolBoxII.lineUnit*myLineMargin))/nas.ToolBoxII.lineUnit);
// 現状の表示範囲でボタンが表示できなくなったときにはスクロールバーが有効になる　表示範囲再計算
//状況をチェックしてスクロールモード設定
	if((displayColumns*displayLines)<(this.ItemList.length+this.btnOffset))
	{
		this.btnOffset=(this.isIcon)?3:1;
		var displayLength=(displayColumns*displayLines)-this.btnOffset;
		this.scrollMode=((displayLines==1)||(displayColumns==1))? "icon":"line";//表示が1行または1列ならアイコン単位スクロールに
	}else{
		this.btnOffset=1;
		var displayLength=this.ItemList.length;
		this.scrollMode="";//クリア
	}
//==============================ここの計算にｂｔｎＯｆｆｓｅｔを組み込むべき
//スクロールバーの位置修正 表示範囲外のアイテムがない場合はスクロールバーを使用不可に

	if(false){
//	スクロールバー位置変更(AE7以降)
	this.CommandPalette.scroller.bounds.left=
		this.CommandPalette.bounds.width-myScrollWidth;//
	this.CommandPalette.scroller.bounds.height=
		(displayLines)*nas.ToolBoxII.lineUnit;
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
	this.CommandPalette.length	=displayLength;//-(this.btnOffset-2);//表示長を記録

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
	var myIcon=nas.GUI.systemIcons["default"];
if(nas.ToolBoxII.isIcon)
{
	nas.ToolBoxII.CommandPalette.displayButton[idx]=
	nas.GUI.addIconButton(
		nas.ToolBoxII.CommandPalette,
		"",
		btnLeft,
		2+btnTop,
		nas.ToolBoxII.buttonWidth,1,myIcon
	);
}else{	
		nas.ToolBoxII.CommandPalette.displayButton[idx]=
	nas.GUI.addButton(
		nas.ToolBoxII.CommandPalette,
		btnName,
		btnLeft,
		2+btnTop,
		nas.ToolBoxII.buttonWidth,1
	);
}
		nas.ToolBoxII.CommandPalette.displayButton[idx].index=[btnLeft,btnTop];
		nas.ToolBoxII.CommandPalette.displayButton[idx].onClick=function(){nas.ToolBoxII.doItem(this.index);};
	}}
//超過分のボタンは隠す
//ボタンがまだないときに実行されるのを抑制2009/11/30
//nas.otome.writeConsole(nas.ToolBoxII.CommandPalette.displayButton.length+" : "+this.CommandPalette.length);(this.CommandPalette.length>0)&&
//	nas.otome.writeConsole(this.CommandPalette.length+" cp:dsp "+nas.ToolBoxII.CommandPalette.displayButton.length)
	if((nas.ToolBoxII.CommandPalette.displayButton.length>this.CommandPalette.length))
	{
		for (var idx=(this.CommandPalette.length>0)?this.CommandPalette.length:0;idx<nas.ToolBoxII.CommandPalette.displayButton.length;idx++)
		{	nas.ToolBoxII.CommandPalette.displayButton[idx].hide()}
	}
//全ボタン情報登録/検査
this.CommandPalette.displayOffset=0;//	切り替え時はオフセット初期化

var myButtonWidth	=(this.CommandPalette.bounds.width-myScrollWidth)/displayColumns;
var myButtonHeight	=(this.CommandPalette.bounds.height-(nas.ToolBoxII.lineUnit*myLineMargin))/displayLines;

	for (idx=0;idx<this.CommandPalette.length;idx++)
	{
//		alert(nas.ToolBoxII.ItemList[idx].btIcon.toString())
	var btnIcon=nas.GUI.systemIcons["cat"];
		if(nas.ToolBoxII.ItemList[idx].btIcon)
		{
			btnIcon=nas.ToolBoxII.ItemList[idx].btIcon
		}else{
			if(nas.ToolBoxII.ItemList[idx] instanceof Folder)
			{
				btnIcon=nas.GUI.systemIcons["close_f"]
			}else{
				if(nas.ToolBoxII.ItemList[idx].length>2)
				{
					//nas.otome.writeConsole(nas.ToolBoxII.ItemList[idx][2])
					btnIcon=nas.GUI.getIcon(new File(nas.ToolBoxII.ItemList[idx][1]+nas.ToolBoxII.ItemList[idx][2]))
				}
			}
			nas.ToolBoxII.ItemList[idx].btIcon=btnIcon;
		}
	var btnName=(nas.ToolBoxII.ItemList[idx] instanceof Folder)?
		((nas.ToolBoxII.ItemList[idx].btTitle)?"◇"+nas.ToolBoxII.ItemList[idx].btTitle:"◆"+decodeURI(nas.ToolBoxII.ItemList[idx].name)):
		decodeURI(nas.ToolBoxII.ItemList[idx][0]);
		
/* -- 縦並び 
	var btnLeft=Math.floor((idx+1)/displayLines);
	var btnTop=((idx+1)%displayLines);
--*/
/* -- 横並び --*/
	var btnLeft=((idx+this.btnOffset)%displayColumns);
	var btnTop=Math.floor((idx+this.btnOffset)/displayColumns);

	var btnIndex=[btnLeft,btnTop];
//	ボタンテキストまたはアイコンの更新
if(this.isIcon){
 if(this.CommandPalette.displayButton[idx].helpTip!=btnName)
 {
	this.CommandPalette.displayButton[idx].icon=btnIcon;
	this.CommandPalette.displayButton[idx].helpTip=btnName;//AE8以上か?
 };
    
}else{
if(this.CommandPalette.displayButton[idx].text!=btnName)
{
	this.CommandPalette.displayButton[idx].text=btnName;
//	this.CommandPalette.displayButton[idx].helpTip=btnName;//AE8以上か?
};
}
/*
if(this.CommandPalette.displayButton[idx].text!=btnName)
{
	this.CommandPalette.displayButton[idx].text=(this.isIcon)? "":btnName;
	this.CommandPalette.displayButton[idx].helpTip=btnName;//AE8以上か?
};
if(this.isIcon)
{
//	alert(idx+" "+btnIcon.size.toString())
	this.CommandPalette.displayButton[idx].text="";
	this.CommandPalette.displayButton[idx].icon=btnIcon;
} */
//	ボタンジオメトリを更新
	if(false){
//	ウィンドウのサイズにあわせてボタン位置を更新
if(	(this.CommandPalette.displayButton[idx].bounds.Left!=btnLeft*(this.buttonWidth*nas.ToolBoxII.colUnit))||
	(this.CommandPalette.displayButton[idx].bounds.Top!=(btnTop+2)*nas.ToolBoxII.lineUnit)
)
{
	this.CommandPalette.displayButton[idx].bounds=[
		btnLeft*(this.buttonWidth*nas.ToolBoxII.colUnit),
		(btnTop+2)*nas.ToolBoxII.lineUnit,
		(btnLeft+1)*(this.buttonWidth*nas.ToolBoxII.colUnit),
		(btnTop+3)*nas.ToolBoxII.lineUnit]
}
	}else{

/*
	ボタン位置とサイズを更新(ウィンドウサイズから算出)
	スクロールモード更新
 */
if(false){
	myPaddingLeft=2;
	myPaddingTop=1;
	myPaddingRight=4;
	myPaddingBottom=2;

	this.CommandPalette.displayButton[idx].bounds=[
		btnLeft*myButtonWidth+myPaddingLeft,
		btnTop*myButtonHeight+(nas.ToolBoxII.lineUnit*myLineMargin)+myPaddingTop,
		(btnLeft+1)*myButtonWidth-myPaddingRight,
		(btnTop+1)*myButtonHeight+(nas.ToolBoxII.lineUnit*myLineMargin)-myPaddingBottom]
}else{
	this.CommandPalette.displayButton[idx].bounds=this.getBounds(idx+this.btnOffset);
}
	}
if(this.CommandPalette.displayButton[idx].index!=btnIndex)
{	this.CommandPalette.displayButton[idx].index=btnIndex;};

//	非表示のボタンを表示
if(! this.CommandPalette.displayButton[idx].visible)
{	this.CommandPalette.displayButton[idx].show();};

	}
//	スクロールバーの設定

//スクロールバーの移動体系を複数行表示の場合と単数行で切り替えが必要
/*
	スクロールモード参照して最大値設定
*/
switch(this.scrollMode){
	case "line":
	//ラインスクロール　行数をmaxvalueに設定
		this.CommandPalette.scroller.maxvalue=1+Math.ceil(this.ItemList.length/this.CommandPalette.columns)-this.CommandPalette.height;
		break;
	case "icon":
	//ボタンスクロール　アイテム数と表示数の差分を設定
		this.CommandPalette.scroller.maxvalue=this.ItemList.length-(this.CommandPalette.length-this.btnOffset);
		break;
	default:
	//スクロールなし　maxvalue初期化
	this.CommandPalette.scroller.maxvalue=0;
}
//		Math.ceil(this.ItemList.length/this.CommandPalette.columns)-this.CommandPalette.height;
	this.CommandPalette.scroller.minvalue=0;
	this.CommandPalette.scroller.value=0;

	this.CommandPalette.scroller.enabled=(this.scrollMode=="")?false:true;
// writeLn(this.CommandPalette.length+"/"+this.CommandPalette.columns+"/"+this.CommandPalette.height+"/")
	if(this.isIcon)
	{
		this.CommandPalette.bwdButton.bounds=this.getBounds(1);
		this.CommandPalette.fwdButton.bounds=this.getBounds(2)
	}else{
		var lineMargin=(this.isDockingPanel)?0:1
		this.CommandPalette.bwdButton.bounds=[this.colUnit*0.5,lineMargin*this.lineUnit,this.colUnit*1,lineMargin*this.lineUnit+this.lineUnit-2];
		this.CommandPalette.fwdButton.bounds=[this.colUnit,lineMargin*this.lineUnit,this.colUnit*1.5,lineMargin*this.lineUnit+this.lineUnit-2];
	}
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
//	if(false){nas.ToolBoxII.CommandPalette.visible=false;}
	return
// paletteId;
}
//スクロール処理
nas.ToolBoxII.doScroll=function()
{
	if(this.scrollMode=="line"){
		var myOffset =Math.floor(this.CommandPalette.scroller.value*this.CommandPalette.columns);
	}else{
		var myOffset =Math.floor(this.CommandPalette.scroller.value);
	}
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


//	ボタンテキストまたはアイコンの更新
if(this.isIcon){
 if(this.CommandPalette.displayButton[idx].helpTip!=btnName)
 {
	this.CommandPalette.displayButton[idx].icon=btnIcon;
	this.CommandPalette.displayButton[idx].helpTip=btnName;//AE8以上か?
 };
		var btnIcon=nas.ToolBoxII.ItemList[idx+myOffset].btIcon;
		this.CommandPalette.displayButton[idx].icon=btnIcon;
    }else{
if(this.CommandPalette.displayButton[idx].text!=btnName)
{
	this.CommandPalette.displayButton[idx].text=btnName;
//	this.CommandPalette.displayButton[idx].helpTip=btnName;//AE8以上か?
};
}
/*
	if(this.CommandPalette.displayButton[idx].text!=btnName)
	{
		this.CommandPalette.displayButton[idx].text=(this.isIcon)? "":btnName;
		this.CommandPalette.displayButton[idx].helpTip=btnName;//AE8以上か?
	};
	if(this.isIcon)
	{
		this.CommandPalette.displayButton[idx].text="";
		var btnIcon=nas.ToolBoxII.ItemList[idx+myOffset].btIcon;
//nas.otome.writeConsole(btnIcon.size.toString())
		this.CommandPalette.displayButton[idx].icon=btnIcon;
	};
*/	
			if(! this.CommandPalette.displayButton[idx].visible)
			{	this.CommandPalette.displayButton[idx].show();};

			
		}else{
//		空ボタンなので非表示にする
			if(this.CommandPalette.displayButton[idx].visible)
			{	this.CommandPalette.displayButton[idx].hide();};
		}
	}
	if(this.scrollMode=="line"){
		this.CommandPalette.scroller.value=Math.floor(myOffset/this.CommandPalette.columns);
	}else{
		this.CommandPalette.scroller.value=Math.floor(myOffset);
	}
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
	myButtonSpan=nas.ToolBoxII.lineUnit*1.3;

if(nas.ToolBoxII.isDockingPanel)
{
if(nas.ToolBoxII.isIcon)
{
		nas.ToolBoxII.CommandPalette.backButton=
		nas.GUI.addIconButton(nas.ToolBoxII.CommandPalette,"previewFlolder",0,0,.8,1);
		nas.ToolBoxII.CommandPalette.backButton.icon=nas.GUI.systemIcons["up_f"];
	nas.ToolBoxII.CommandPalette.bwdButton=
		nas.GUI.addIconButton(nas.ToolBoxII.CommandPalette,"scrollup",.5,0,.8,1);
		nas.ToolBoxII.CommandPalette.bwdButton.icon=nas.GUI.systemIcons["back"];
	nas.ToolBoxII.CommandPalette.fwdButton=
		nas.GUI.addIconButton(nas.ToolBoxII.CommandPalette,"scrolldown",1,0,.8,1);
		nas.ToolBoxII.CommandPalette.fwdButton.icon=nas.GUI.systemIcons["fwd"];
}else{
	nas.ToolBoxII.CommandPalette.backButton=
		nas.GUI.addButton(nas.ToolBoxII.CommandPalette,"△",0,0,.8,1);
	nas.ToolBoxII.CommandPalette.bwdButton=
		nas.GUI.addButton(nas.ToolBoxII.CommandPalette,"<<",.5,0,.8,1);
	nas.ToolBoxII.CommandPalette.fwdButton=
		nas.GUI.addButton(nas.ToolBoxII.CommandPalette,">>",1,0,.8,1);
}
	nas.ToolBoxII.CommandPalette.backButton.bounds=[
		myPaddingLeft,
		myPaddingTop,
		(myButtonSpan)-myPaddingRight,
		(nas.ToolBoxII.lineUnit)-myPaddingBottom];
	nas.ToolBoxII.CommandPalette.backButton.helpTip="戻る"

	nas.ToolBoxII.CommandPalette.bwdButton.bounds=[
		myPaddingLeft+myButtonSpan,
		myPaddingTop,
		(myButtonSpan*2)-myPaddingRight,
		(nas.ToolBoxII.lineUnit)-myPaddingBottom];
	nas.ToolBoxII.CommandPalette.bwdButton.helpTip="後へ"

	nas.ToolBoxII.CommandPalette.fwdButton.bounds=[
		myPaddingLeft+myButtonSpan*2,
		myPaddingTop,
		(myButtonSpan*3)-myPaddingRight,
		(nas.ToolBoxII.lineUnit)-myPaddingBottom];
	nas.ToolBoxII.CommandPalette.fwdButton.helpTip="前へ"

}else{
	nas.ToolBoxII.CommandPalette.backButton=
		nas.GUI.addButton(nas.ToolBoxII.CommandPalette,"△",0,1,.8,1);
	nas.ToolBoxII.CommandPalette.bwdButton=
		nas.GUI.addButton(nas.ToolBoxII.CommandPalette,"<<",.5,1,.8,1);
	nas.ToolBoxII.CommandPalette.fwdButton=
		nas.GUI.addButton(nas.ToolBoxII.CommandPalette,">>",1,1,.8,1);

	nas.ToolBoxII.CommandPalette.backButton.bounds=[
		myPaddingLeft,
		(nas.ToolBoxII.lineUnit)+myPaddingTop,
		(myButtonSpan)-myPaddingRight,
		(nas.ToolBoxII.lineUnit*2)-myPaddingBottom];

	nas.ToolBoxII.CommandPalette.bwdButton.bounds=[
		myPaddingLeft+myButtonSpan,
		(nas.ToolBoxII.lineUnit)+myPaddingTop,
		(myButtonSpan*2)-myPaddingRight,
		(nas.ToolBoxII.lineUnit*2)-myPaddingBottom];

	nas.ToolBoxII.CommandPalette.fwdButton.bounds=[
		myPaddingLeft+myButtonSpan*2,
		(nas.ToolBoxII.lineUnit)+myPaddingTop,
		(myButtonSpan*3)-myPaddingRight,
		(nas.ToolBoxII.lineUnit*2)-myPaddingBottom];

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
//	nas.ToolBoxII.getItems(Folder(Folder.scripts.toString()+"/nas"));
	nas.ToolBoxII.getItems(Folder(Folder.nas.toString()+"/scripts/otome/"));
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
