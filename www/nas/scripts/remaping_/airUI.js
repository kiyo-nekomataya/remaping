/*                   --------- airUI.js
	Adobe AIR/Adobe Extend Script用 入出力プロシジャ
	
	基本的にはnas-htmlで使用する場合nas.File オブジェクトをつくってラップするのがよさそう
	nas-File はラッピングオブジェクトとしてファイルアクセスを提供
AdobeScript/Air(Flash)/CGI上で使用するサーバーーローカルファイル/URL(読み出し専用)

ただしAirオブジェクトの操作に習熟するために今回はこのサンプルをなるべく速攻で組み込むことにする
ドキュメント上のオブジェクトを直たたきしている部分だけを調整すること

AIR環境にバリエーションが増えているので要注意
AIRブラウザは
WIN・Mac・Linux・Andoroid・iOS (一応互換が望まれるが未確認  と言うか完全互換はムリ)
AdobeExtension上の CSX/CEP  (互換なしプラットフォームが異なる)
これらの切り分けが必要  特にりまぴんのような全環境対応が望まれるアプリケーション
*/
	switch (appHost.platform){
case "AIR":
//参照用オブジェクトを作成
var Folder =new Object;
	Folder.nas=(appHost.os=="Win")?
		new air.File(air.File.userDirectory.url+'/AppData/Roaming/nas'):
		new air.File(air.File.userDirectory.url+'/Library/Application%20Support/nas');
	Folder.script=(appHost.os=="Win")?
		new air.File(air.File.userDirectory.url+'/AppData/Roaming/nas/scripts'):
		new air.File(air.File.userDirectory.url+'/Library/Application%20Support/nas');


//終了前イベント受信
	onClosingEvent=function(event){
		if(xUI.isStored()){return}
		var msg="ファイルが保存されていません。\n保存しないで終了しますか？";
		if(!(confirm(msg))){event.preventDefault()};
		return;
	}

	window.nativeWindow.addEventListener(air.Event.CLOSING, onClosingEvent);
//ドラグドロップ初期化
	document.designMode="on";//.contenteditable
	document.addEventListener("dragenter", dragEnterOverHandler);
	document.addEventListener("dragover", dragEnterOverHandler);
	document.addEventListener("drop", dropHandler);

  function dragEnterOverHandler(event){
	event.preventDefault(); 
	return;
	var myFiles=event.dataTransfer.getData("application/x-vnd.adobe.air.file-list");
	if((myFiles)&&(myFiles[0].nativePath.match(/\.(xps|tsh|ard|ardj|csv)$/i))){
		event.dataTransfer.effectAllowed = "copy"; 
	}else{
		event.dataTransfer.effectAllowed = "none";
	}
	}

   function dropHandler(event){
//ファイルを総当たりで最初にあたった読み込み可能なファイルを読み込んで終了
/*
	将来的には多種のドラッグドロップを受け入れるので注意
*/

	var myFiles=event.dataTransfer.getData("application/x-vnd.adobe.air.file-list");
for(var idx=myFiles.length-1;idx>=0;idx--){
	if(myFiles[idx].nativePath.match(/\.(xps|tsh|ard|ardj|csv)$/i)){
		fileBox.fileQueue=myFiles[idx];//現在キュー数は1のみ
		var myAction=xUI.checkStored("saveAndOpenDropFile");
		if(myAction){
			fileBox.currentFile=myFiles[idx];
			fileBox.readIN();
		}
		break;
	}
}
return;



//スクロール初期化 (ASのhtmlloaderがスクロールを行った際に通知？)
	window.addEventListener("scroll", scrollSheetHandler);

    function scrollSheetHandler(){dbgPut("12");document.body.onscroll();}

//この下はサンプルコード
/*

switch(event.dataTransfer.types.toString())
{
case "text/plain":
	alert(event.dataTransfer.getData("text/plain"));
break;
case "application/x-vnd.adobe.air.file-list":
	alert(event.dataTransfer.getData("application/x-vnd.adobe.air.file-list")[0])
	
break;
default:

}
return;

	for(var prop in event){ 
	   air.trace(prop + " = " + event[prop]); 
	} 



	var row = document.createElement('tr'); 
	row.innerHTML = "<td>" + event.dataTransfer.getData("text/plain") + "</td>" + 
		"<td>" + event.dataTransfer.getData("text/html") + "</td>" + 
		"<td>" + event.dataTransfer.getData("text/uri-list") + "</td>" + 
		"<td>" + event.dataTransfer.getData("application/x-vnd.adobe.air.file-list") + 
		"</td>"; 
 
	var imageCell = document.createElement('td'); 
	if((event.dataTransfer.types.toString()).search("image/x-vnd.adobe.air.bitmap") > -1){ 
		imageCell.appendChild(event.dataTransfer.getData("image/x-vnd.adobe.air.bitmap")); 
	} 
	row.appendChild(imageCell); 
	var parent = emptyRow.parentNode; 
	parent.insertBefore(row, emptyRow); 
*/
	}

/*	ファイルハンドリングオブジェクト
	CGIサービスの設計時は同名オブジェクトに同名メソッドを作成して対処するので要注意
 */
//ラップオブジェクト
	var fileBox=new Object();

		fileBox.currentFile=null; // The current file in the editor.
		fileBox.stream=null; // A FileStream object, used to read and write files.
		fileBox.defaultDir=null; // The default directory location.
		fileBox.chooserMode=null; // Whether the FileChooser.html window is used as an Open or Save As window.
		fileBox.fileQueue=null;
		fileBox.openMode=null;//ファイルモード  saveAndOpen/saveAndOpenDropFile/saveAndOpenArgFile or ""
		fileBox.recentDocuments=new Array();//recentDocumentsStack
		fileBox.contentText="";//テキストバッファ
			/**
			 * UI初期化
			 */
			fileBox.init=function() {
				fileBox.defaultDir = air.File.documentsDirectory;
			}
/**
 *recentDocumentにファイルを加えるメソッド  同じファイルがあったら追加しない
 */
	fileBox.recentDocuments.add=function(myFile){
//if(dbg){dbgPut("add file :"+this.length +" : "+ this.toString());}
		for(var file=0;file<this.length;file++){
//		dbgPut(myFile.name +" : " +this[file].name)
			if(myFile==this[file]){return true}
		}
		this.push(new air.File(myFile.url));//参照をpushすると次に比較できなくなるので新しいオブジェクトでpush
		return true;
	}
			/**
			 * Displays the FileChooser.html file in a new window, and sets its mode to "Open".
			 */
			fileBox.openFileDB=function() {
			var myAction=xUI.checkStored("saveAndOpen");


				var fileChooser;
				if(fileBox.currentFile)
				{
					fileChooser = fileBox.currentFile;
				}
				else
				{
					fileChooser = fileBox.defaultDir;
				}
				var txtFilter = new air.FileFilter("TimeSheetFile(*.xps *.xpst *.xdts *.tdts *.tsh *.ard *.ardj *.csv *.txt)", "*.xps;*.xpst;*.xdts;*.tdts;*.tsh;*.ard;*.ardj;*.csv;*.txt");
				fileChooser.browseForOpen("Open",[txtFilter]);
				fileChooser.addEventListener(air.Event.SELECT, fileBox.openFile);
			}

			/**
			 * Opens and reads a file.
			 */
			fileBox.openFile = function (event) {
				fileBox.currentFile = event.target;//ファイル設定
				fileBox.readIN();
				event.target.removeEventListener(air.Event.SELECT, fileBox.openFile); 
				fileBox.recentDocuments.add(fileBox.currentFile);//最近のファイルに追加
				sync();//タイトル同期
			}
			/**
			 * readContent カレントファイルを読み込み内容を返す
			 ファイルが存在しない場合のトラップがいる
			 */
			fileBox.readContent = function(){
				if(! fileBox.currentFile.exists){return false}
				this.stream = new air.FileStream();
				try
				{
					fileBox.contentText="";//データバッファテキストクリア
					var tmpBuff="";//一時バッファ確保
					this.stream.open(fileBox.currentFile, air.FileMode.READ);//ファイルストリーム開く(同期)
				  if(fileBox.currentFile.extension.match(/(xps|te?xt|ardj|json|[tx]dts)/)){
					var str = this.stream.readUTFBytes(this.stream.bytesAvailable);//UTFテキストとして読み込み
				  }else{
					var str = this.stream.readMultiByte(this.stream.bytesAvailable,"shift_jis");//s-JISテキストとして読み込み
				  }
					this.stream.close();
					fileBox.contentText=str;//内容をセット
					return fileBox.contentText;
				}
				catch(error)
				{
					ioErrorHandler(error);
				}
			}

			/**
			 * readIN textSource to XPS buffer
			 */
			fileBox.readIN = function(){
				this.stream = new air.FileStream();
				try
				{
					fileBox.contentText="";//データバッファテキストクリア
					var tmpBuff="";//一時バッファ確保
					this.stream.open(fileBox.currentFile, air.FileMode.READ);//ファイルストリーム開く(同期)
				  if(fileBox.currentFile.extension.match(/(xps|te?xt|ardj|json|[tx]dts)/)){
					var str = this.stream.readUTFBytes(this.stream.bytesAvailable);//UTFテキストとして読み込み
				  }else{
					var str = this.stream.readMultiByte(this.stream.bytesAvailable,"shift_jis");//s-JISテキストとして読み込み
				  }
					this.stream.close();
					fileBox.contentText=str;//内容をセット

//アプリケーション初期化前にはXPSオブジェクトはあるが実質初期化前なので、
//xUI初期化のタイミングだけ認識してそれ以前なら以下のルーチンは実行しない
//開始時点でxUI空オブジェクトで初期化されるのでxUI.initを判定
			if(xUI.init){
				var myResult= xUI.XPS.readIN(fileBox.contentText);
			}else{
				var myResult=false;
			}

//取得したストリームを検査する 空ストリームXPS以外のストリームなら破棄してエラーコードを返す
//alert("open:"+myResult)
//document.getElementById("mainText").value = str;//メインバッファにストリームを流し込む
//document.title = "Text Editor - " + currentFile.name;//ドキュメントラベル更新
					if(myResult){xUI.resetSheet(XPS);//nas_Rmp_Init();
					}
					// ここで取得したストリームをそのまま返す
					document.title=fileBox.currentFile;//ちょと注意  一括変更部分が必要
					return myResult;
				}
				catch(error)
				{
					ioErrorHandler(error);
				}
			}
			/**
			 * Displays the "Save As" dialog box.
			 * オープン時に未保存だった場合、保存後にオープンコマンドを実行するモードを作成
			 */
			fileBox.saveAs=function () {
				var fileChooser;//
				if(fileBox.currentFile)
				{
					fileChooser = fileBox.currentFile;
				}
				else
				{
					var fName=encodeURI(xUI.getFileName()+'\.xps');
					fileChooser = new air.File(fileBox.defaultDir.url+"/"+fName)
				}

				fileChooser.browseForSave("SaveAs");

				fileChooser.addEventListener(air.Event.SELECT, fileBox.saveAsSelectHandler);

			}	
			fileBox.saveAsSelectHandler=function (event) {
				fileBox.currentFile = event.target;
				event.target.removeEventListener(air.Event.SELECT, fileBox.saveAsSelectHandler);
				xUI.setStored("force");//ファイルを切り換えたので強制保存セット
				sync();
				fileBox.saveFile();
			}

/*
 * fileBox.saveContent();
 *	シンプルに内容をカレントファイルに保存する  ダイアログ類は全て省略
 事前にfileBox.contenText .currentFileを設定しておくこと
 */
	fileBox.saveContent=function(){
				if (fileBox.currentFile == null){
					return false
				} else {
					try 
					{
						this.stream = new air.FileStream();
						this.stream.open(fileBox.currentFile, air.FileMode.WRITE);
						//var outData=fileBox.contentText;
//						alert("writeFile :\n"+fileBox.contentText);
						this.stream.writeUTFBytes(fileBox.contentText);
						this.stream.close();
					} catch(error) {
						ioErrorHandler(error);
					}
				}		
	}
			/**
			 * Opens and saves a file with the data in the mainText textArea element. 
			 * Newline (\n) characters in the text are replaced with the 
			 * platform-specific line ending character (File.lineEnding), which is the 
			 * line-feed character on Mac OS and the carriage return character followed by the 
			 * line-feed character on Windows.
			 */
	
			fileBox.saveFile=function () {
				if (fileBox.currentFile == null) 
				{
					fileBox.saveAs();
				} else {
				if(xUI.isStored()){
					if(! confirm("ファイルは保存済みだと思います。上書き保存しますか")){return}}
					try 
					{
						this.stream = new air.FileStream();
						this.stream.open(fileBox.currentFile, air.FileMode.WRITE);

						var outData = xUI.XPS.toString();
//						outData = outData.replace(/\n/g, air.File.lineEnding);
						this.stream.writeUTFBytes(outData);
						this.stream.close();
						fileBox.recentDocuments.add(fileBox.currentFile);//最近のファイルに追加

//						document.title = "Text Editor - " + currentFile.name;
						xUI.setStored("current");//ファイル保存を行ったのでリセットする;
						sync();//タイトル同期
						switch(fileBox.openMode){
						case "saveAndOpen":
							fileBox.openFileDB();
//ここでopenFileDB()がマルチスレッドで実行される
							fileBox.openMode=null;
						break;
						case "saveAndOpenDropFile":
						case "saveAndOpenArgFile":
							fileBox.currentFile=new air.File(fileBox.fileQueue.url);
							fileBox.readIN();
							fileBox.openMode=null;fileBox.fileQueue=null;
						break;
						}
						//モードに従ってオープン
					} 
					catch(error) 
					{
						ioErrorHandler(error);
					}
				}
			}

/*
複数ファイルを同ロケーションに保存可能なように拡張  20160126
contentを配列で与えると連番で保存
*/
fileBox.storeOtherExtensionFile=function(content,extsn){
	if(! content){return false};
	if(!( content instanceof Array)){content=[content]};
	if(! extsn){extsn="txt"};
	var myName=xUI.getFileName();
// alert("data length : " +content.length);
if(content.length==1){
		fileBox.contentText=content[0];
		fName=encodeURI(myName+'.'+extsn);
	var fileChooser = new air.File(fileBox.defaultDir.url+"/"+fName);
	fileChooser.browseForSave("SaveDataAs "+extsn);
	fileChooser.addEventListener(air.Event.SELECT, fileBox.saveAsExtsnSelectHandler);
}else{
		fName=encodeURI(myName+'_[0].'+extsn);
	var fileChooser = new air.File(fileBox.defaultDir.url+"/"+fName);
	fileChooser.browseForDirectory("Export "+extsn+" Datas To ");
//	fileChooser.browseForSave("Export "+extsn+" Datas To ");
	fileChooser.addEventListener(air.Event.SELECT,function(event){
		var myTarget=event.target;
		var storeCount=0;
	  for (var cID=0;cID<content.length;cID++){
		var myFile=new air.File(myTarget.url+"/"+encodeURI(myName+"_"+(cID+1)+"."+extsn));
//		var myFile=new air.File(myTarget.parent.url+"/"+encodeURI(myName+"_"+(cID+1)+"."+extsn));
//		var myFile=myTarget;
if(true){
	try{
		this.stream = new air.FileStream();
		this.stream.open(myFile, air.FileMode.WRITE);
		var outData = content[cID];
		this.stream.writeUTFBytes(outData);
		this.stream.close();
	} catch(error) {
		ioErrorHandler(error);
	}
	storeCount++;
}else{alert("filename : "+myFile.url)}
	  }
	 alert(("exported %count% files").replace(/%count%/,storeCount));
	})
}
}

	fileBox.saveAsExtsnSelectHandler=function (event) {
		var myFile = event.target;
		event.target.removeEventListener(air.Event.SELECT, fileBox.saveAsExtsnSelectHandler);
	try 
	{
		this.stream = new air.FileStream();
		this.stream.open(myFile, air.FileMode.WRITE);
		var outData = fileBox.contentText;
//		outData = outData.replace(/\n/g, air.File.lineEnding);
		this.stream.writeUTFBytes(outData);
		this.stream.close();
	} catch(error) {
		ioErrorHandler(error);
	}

	}
			/**
			 * Error message for file I/O errors. 
			 */
			function ioErrorHandler(error) {
				console.log(error);
				alert("Error reading or writing the file.\n"+error);
			}
/*
アプリケーションがINVOKEイベントの処理が出来るようにする
*/
//		NativeApplication.nativeApplication.addEventListener(InvokeEvent.INVOKE, onInvokeEvent); 
		air.NativeApplication.nativeApplication.addEventListener(air.InvokeEvent.INVOKE, onInvokeEvent);

		var systemArguments;//システム引数を格納するオブジェクト
		var currentDir;

/*	イベントコール時に処理される関数	*/
		function onInvokeEvent(invocation) {
				var arguments = invocation.arguments; 
	 			var currentDir = invocation.currentDirectory;
	if(arguments.length){
if(dbg){dbgPut(arguments.length + " : arguments")};
		for (var idx=arguments.length-1;idx>=0;idx--)
		{
if(dbg){dbgPut(idx+" : "+arguments[idx])};
			var myFilePath=arguments[idx];

			if(myFilePath.match(/\.(xps|tsh|ard|ardj|csv)$/i)){
if(dbg){dbgPut("can read file "+ myFilePath)};
if(true){
			var myFile=new air.File();//新規ファイル作成
			myFile.nativePath=myFilePath;//ローカルパスでオブジェクト指定
				if((myFile.exists)&&(fileBox.currentFile!==myFile)){
					fileBox.fileQueue=myFile;//現在キュー数は1のみ

//xUIは空オブジェクトで初期化される。再初期化が済んでいたらセーブチェックが必要だがそれ以外は無条件で新ファイル読込み
//チェック後にキャンセルリザルトがあった場合は処理自体をスキップしたいが現状は
					if(xUI.init){
					//初期化済
if(xUI.isStored()){
//ファイルは保存済なのでキューをカレントに移行してファイルを読み込む
							fileBox.fileQueue=null;
							fileBox.currentFile=myFile;
							fileBox.readIN();

}else{
//ファイルが保存されていないのでダイアログをだして分岐動作

var msg="現在のファイルが保存されていません。\n現在のファイルを保存してファイルを読み込みますか?\n yes/保存して読込み no/保存しないで読込み cancel/読込みcancel"
var myAction=function(){
	switch(this.status){
	case 0:;//保存を行ってから読み込む
//		if(xUI.init){xUI.setStored("force")};//強制的に保存が行われるようセット
		fileBox.openMode="saveAndOpenArgFile";//モードセット
		fileBox.saveFile();//保存する強制モードで無いのでこのコールでブレークして戻る
	break;
	case 1:;//保存しないで読込み
		fileBox.currentFile=new air.File(fileBox.fileQueue.url);//参照を実体化
		fileBox.readIN();
		fileBox.fileQueue=null;
	break;	
	default:;//cancel キューを破棄して動作停止
		fileBox.fileQueue=null;
	}
}
nas.showModalDialog("confirm2",msg,"","",myAction);

}
					}else{
					//初期化前(起動時のみ)
						fileBox.currentFile=myFile;
						fileBox.readIN();
					}
						break;
				}
}
			}
		}
if(dbg){dbgPut(arguments.length + " : arguments")};
	}
		}
/* ****************************************************************************
ネイティブメニューを作成
メニューを作ることでHTMLモードでのメニューを隠せるので画面を広く使える

 **************************************************************************** */
var application = air.NativeApplication.nativeApplication; 

function setMenu(){ 
	var fileMenu;
	var editMenu;
	var referenceMenu;
	var documentMenu;
	var mapMenu;
	var toolMenu;
// win
	if ( air.NativeWindow.supportsMenu &&
	 nativeWindow.systemChrome != air.NativeWindowSystemChrome.NONE) { 
	nativeWindow.menu = new air.NativeMenu(); 
	nativeWindow.menu.addEventListener(air.Event.SELECT, selectCommandMenu); 

	fileMenu = nativeWindow.menu.addItem(new air.NativeMenuItem("File")); 
	fileMenu.submenu = createFileMenu(); 
	 
	editMenu = nativeWindow.menu.addItem(new air.NativeMenuItem("Edit")); 
	editMenu.submenu = createEditMenu(); 

	refMenu = nativeWindow.menu.addItem(new air.NativeMenuItem("Reference")); 
	refMenu.submenu = createRefMenu(); 

	xpsMenu = nativeWindow.menu.addItem(new air.NativeMenuItem("Xps")); 
	xpsMenu.submenu = createXpsMenu(); 

	mapMenu = nativeWindow.menu.addItem(new air.NativeMenuItem("Map")); 
	mapMenu.submenu = createMapMenu(); 

	toolMenu = nativeWindow.menu.addItem(new air.NativeMenuItem("Tools")); 
	toolMenu.submenu = createToolMenu(); 

	showMenu = nativeWindow.menu.addItem(new air.NativeMenuItem("Show")); 
	showMenu.submenu = createShowMenu(); 
	} 
// mac
	if (air.NativeApplication.supportsMenu) {
	application.menu.addEventListener(air.Event.SELECT, selectCommandMenu);
//元から存在するメニューを削除  または名前を変更して使ってもよい…
if(false){
application.menu.removeItemAt(1);
application.menu.removeItemAt(2);
application.menu.removeItemAt(3);
}
//	fileMenu = application.menu.addItem(new air.NativeMenuItem("File"));
fileMenu = application.menu.items[1];
	fileMenu.submenu = createFileMenu();
//	editMenu = application.menu.addItem(new air.NativeMenuItem("Edit")); 
editMenu = application.menu.items[2]; 
	editMenu.submenu = createEditMenu();
	xpsMenu = application.menu.addItem(new air.NativeMenuItem("Xps")); 
	xpsMenu.submenu = createXpsMenu(); 
	mapMenu = application.menu.addItem(new air.NativeMenuItem("Map")); 
	mapMenu.submenu = createMapMenu(); 
	toolMenu = application.menu.addItem(new air.NativeMenuItem("Tools")); 
	toolMenu.submenu = createToolMenu(); 
	showMenu = application.menu.addItem(new air.NativeMenuItem("Show")); 
	showMenu.submenu = createShowMenu(); 
	} 
} 
	 
function createFileMenu() { 
	var fileMenu = new air.NativeMenu();
	fileMenu.addEventListener(air.Event.SELECT,selectCommandMenu);

	var newCommand = fileMenu.addItem(new air.NativeMenuItem("New"));
		newCommand.addEventListener(air.Event.SELECT, selectCommand);
		newCommand.keyEquivalent = "n";
	var openCommand = fileMenu.addItem(new air.NativeMenuItem("Open"));
		openCommand.addEventListener(air.Event.SELECT, selectCommand);
		openCommand.keyEquivalent = "o";
	var saveCommand = fileMenu.addItem(new air.NativeMenuItem("Save"));
		saveCommand.addEventListener(air.Event.SELECT, selectCommand);
		saveCommand.keyEquivalent = "s";
	var saveasCommand = fileMenu.addItem(new air.NativeMenuItem("SaveAs"));
		saveasCommand.addEventListener(air.Event.SELECT, selectCommand);
		saveasCommand.keyEquivalent = "S";
	var restoreCommand = fileMenu.addItem(new air.NativeMenuItem("Restore"));
		restoreCommand.addEventListener(air.Event.SELECT, selectCommand);
		restoreCommand.keyEquivalent = "R";
	var quitCommand = fileMenu.addItem(new air.NativeMenuItem("Quit"));
		quitCommand.addEventListener(air.Event.SELECT, selectCommand);
		quitCommand.keyEquivalent = "q";

	var openFile = fileMenu.addItem(new air.NativeMenuItem("Open Recent"));
	openFile.submenu = new air.NativeMenu(); 
	openFile.submenu.addEventListener(air.Event.DISPLAYING, updateRecentDocumentMenu); 
	openFile.submenu.addEventListener(air.Event.SELECT, selectCommandMenu); 

	return fileMenu; 
} 

function createEditMenu() { 
	var editMenu = new air.NativeMenu(); 
	editMenu.addEventListener(air.Event.SELECT,selectCommandMenu); 

	var selectAll = editMenu.addItem(new air.NativeMenuItem("selectAll"));
		selectAll.addEventListener(air.Event.SELECT,selectCommand);
		selectAll.keyEquivalent = "a";
	var copyCommand = editMenu.addItem(new air.NativeMenuItem("Copy"));
		copyCommand.addEventListener(air.Event.SELECT,selectCommand);
		copyCommand.keyEquivalent = "c";
	var cutCommand = editMenu.addItem(new air.NativeMenuItem("cut"));
		cutCommand.addEventListener(air.Event.SELECT,selectCommand);
		cutCommand.keyEquivalent = "x";
	var pasteCommand = editMenu.addItem(new air.NativeMenuItem("Paste")); 
		pasteCommand.addEventListener(air.Event.SELECT, selectCommand); 
		pasteCommand.keyEquivalent = "v"; 

	editMenu.addItem(new air.NativeMenuItem("", true));//セパレータ

//ラベル変更
	var edTLCommand = editMenu.addItem(new air.NativeMenuItem("editLabel")); 
		edTLCommand.addEventListener(air.Event.SELECT, selectCommand); 
//		edTLCommand.keyEquivalent = "e"; 
//一列クリア
	var clTLCommand = editMenu.addItem(new air.NativeMenuItem("clearTimeline")); 
		clTLCommand.addEventListener(air.Event.SELECT, selectCommand); 
//		clTLCommand.keyEquivalent = ""; 
//シートクリア
	var clSTCommand = editMenu.addItem(new air.NativeMenuItem("clearSheet")); 
		clSTCommand.addEventListener(air.Event.SELECT, selectCommand); 
//		clSTCommand.keyEquivalent = ""; 
//カラコマ挿入
	var insBLKCommand = editMenu.addItem(new air.NativeMenuItem("insertBlock")); 
		insBLKCommand.addEventListener(air.Event.SELECT, selectCommand); 
//		insBLKCommand.keyEquivalent = ""; 
//ブロック削除
	var delBLKCommand = editMenu.addItem(new air.NativeMenuItem("deleteBlock")); 
		delBLKCommand.addEventListener(air.Event.SELECT, selectCommand); 
//		delBLKCommand.keyEquivalent = ""; 

	editMenu.addItem(new air.NativeMenuItem("", true));//セパレータ

//音声ライン追加
	var addDLGCommand = editMenu.addItem(new air.NativeMenuItem("addSoundTrack")); 
		addDLGCommand.addEventListener(air.Event.SELECT, selectCommand); 
//		addDLGCommand.keyEquivalent = ""; 
//静止画タイムライン追加
	var addSTLCommand = editMenu.addItem(new air.NativeMenuItem("addStillTL"));
		addSTLCommand.addEventListener(air.Event.SELECT, selectCommand); 
//		addSTLCommand.keyEquivalent = ""; 
//タイムライン追加
	var addTMLCommand = editMenu.addItem(new air.NativeMenuItem("addCellTL"));
		addTMLCommand.addEventListener(air.Event.SELECT, selectCommand); 
//		addTMLCommand.keyEquivalent = ""; 
//カメラ追加
	var addCAMCommand = editMenu.addItem(new air.NativeMenuItem("addCameraTL"));
		addCAMCommand.addEventListener(air.Event.SELECT, selectCommand); 
//		addCAMCommand.keyEquivalent = ""; 
//エフェクト追加
	var addEFXCommand = editMenu.addItem(new air.NativeMenuItem("addEfxTL"));
		addEFXCommand.addEventListener(air.Event.SELECT, selectCommand); 
//		addEFXCommand.keyEquivalent = ""; 
//タイムライン挿入
	var insTMLCommand = editMenu.addItem(new air.NativeMenuItem("InsertTL"));
		insTMLCommand.addEventListener(air.Event.SELECT, selectCommand); 
//		insTMLCommand.keyEquivalent = ""; 
//タイムライン削除
	var delTMLCommand = editMenu.addItem(new air.NativeMenuItem("DeleteTL"));
		delTMLCommand.addEventListener(air.Event.SELECT, selectCommand); 
//		delTMLCommand.keyEquivalent = ""; 
//タイムライン整形
	var formTMLCommand = editMenu.addItem(new air.NativeMenuItem("FormatTimeline"));
		formTMLCommand.addEventListener(air.Event.SELECT, selectCommand); 
//		formTMLCommand.keyEquivalent = ""; 
//シート整形
	var formSHTCommand = editMenu.addItem(new air.NativeMenuItem("FormatSheet"));
		formSHTCommand.addEventListener(air.Event.SELECT, selectCommand); 
//		formSHTCommand.keyEquivalent = ""; 

	editMenu.addItem(new air.NativeMenuItem("", true));//セパレータ

//バックアップ
	var bkupCommand = editMenu.addItem(new air.NativeMenuItem("pushBackup"));
		bkupCommand.addEventListener(air.Event.SELECT, selectCommand); 
//		bkupCommand.keyEquivalent = ""; 
//バックアップ復帰
	var bkrstCommand = editMenu.addItem(new air.NativeMenuItem("restoreBackup"));
		bkrstCommand.addEventListener(air.Event.SELECT, selectCommand); 
//		bkrstCommand.keyEquivalent = ""; 
//バックアップクリア
	var bkclsCommand = editMenu.addItem(new air.NativeMenuItem("clearBackup"));
		bkclsCommand.addEventListener(air.Event.SELECT, selectCommand); 
//		bkclsCommand.keyEquivalent = ""; 

	return editMenu; 
} 

function createRefMenu() { 
	var referenceMenu = new air.NativeMenu(); 
	referenceMenu.addEventListener(air.Event.SELECT,selectCommandMenu);

	var imRCommand = referenceMenu.addItem(new air.NativeMenuItem("importReference"));
	imRCommand.addEventListener(air.Event.SELECT,selectCommand);
	imRCommand.keyEquivalent = "i";
	var dtRCommand = referenceMenu.addItem(new air.NativeMenuItem("copyToRef"));
	dtRCommand.addEventListener(air.Event.SELECT,selectCommand);
	dtRCommand.keyEquivalent = "<";
	var dtECommand = referenceMenu.addItem(new air.NativeMenuItem("copyFromRef"));
	dtECommand.addEventListener(air.Event.SELECT,selectCommand);
	dtECommand.keyEquivalent = ">";
	var clRCommand = referenceMenu.addItem(new air.NativeMenuItem("clearReference"));
	clRCommand.addEventListener(air.Event.SELECT,selectCommand);
	clRCommand.keyEquivalent = "C";

	return referenceMenu; 
}

function createXpsMenu() { 
	var xpsMenu = new air.NativeMenu(); 
	xpsMenu.addEventListener(air.Event.SELECT,selectCommandMenu);

	var rwCommand = xpsMenu.addItem(new air.NativeMenuItem("dataPanel"));
	rwCommand.addEventListener(air.Event.SELECT,selectCommand);
	rwCommand.keyEquivalent = "W";
	var dcCommand = xpsMenu.addItem(new air.NativeMenuItem("Document"));
	dcCommand.addEventListener(air.Event.SELECT,selectCommand);
	dcCommand.keyEquivalent = "D";
	var prtCommand = xpsMenu.addItem(new air.NativeMenuItem("exportAsHTML"));
	prtCommand.addEventListener(air.Event.SELECT,selectCommand);
	prtCommand.keyEquivalent = "H";
	var prtCommand = xpsMenu.addItem(new air.NativeMenuItem("exportAsEPS"));
	prtCommand.addEventListener(air.Event.SELECT,selectCommand);
	prtCommand.keyEquivalent = "E";

	return xpsMenu; 
}

function createMapMenu() { 
	var mapMenu = new air.NativeMenu(); 
	mapMenu.addEventListener(air.Event.SELECT,selectCommandMenu);

	var Command = mapMenu.addItem(new air.NativeMenuItem("cmd"));
	Command.addEventListener(air.Event.SELECT,selectCommand);
//	Command.keyEquivalent = "M";

	return mapMenu; 
}

function createToolMenu() { 
	var toolMenu = new air.NativeMenu(); 
	toolMenu.addEventListener(air.Event.SELECT,selectCommandMenu);

	var abtCommand = toolMenu.addItem(new air.NativeMenuItem("about"));
	abtCommand.addEventListener(air.Event.SELECT,selectCommand);
	abtCommand.keyEquivalent = "A";
	toolMenu.addItem(new air.NativeMenuItem("", true));//セパレータ
	var preferencesCommand = toolMenu.addItem(new air.NativeMenuItem("Preferences")); 
	preferencesCommand.addEventListener(air.Event.SELECT,selectCommand);

	return toolMenu; 
}


function createShowMenu() { 
	var showMenu = new air.NativeMenu(); 
	showMenu.addEventListener(air.Event.SELECT,selectCommandMenu);

	var dmbCommand = showMenu.addItem(new air.NativeMenuItem("dropdownMenuBar"));
	dmbCommand.addEventListener(air.Event.SELECT,selectCommand);
	dmbCommand.keyEquivalent = "M";
	var skbCommand = showMenu.addItem(new air.NativeMenuItem("softwareKB"));
	skbCommand.addEventListener(air.Event.SELECT,selectCommand);
	skbCommand.keyEquivalent = "K";
	var utCommand = showMenu.addItem(new air.NativeMenuItem("commandBar"));
	utCommand.addEventListener(air.Event.SELECT,selectCommand);
	utCommand.keyEquivalent = "B";

	var tbrCommand = showMenu.addItem(new air.NativeMenuItem("toolBar"));
	tbrCommand.addEventListener(air.Event.SELECT,selectCommand);
	tbrCommand.keyEquivalent = "t";

	var shdCommand = showMenu.addItem(new air.NativeMenuItem("sheetHeader"));
	shdCommand.addEventListener(air.Event.SELECT,selectCommand);

	var mhdCommand = showMenu.addItem(new air.NativeMenuItem("memo"));
	mhdCommand.addEventListener(air.Event.SELECT,selectCommand);

	return showMenu; 
}


function updateRecentDocumentMenu(event) { 
	air.trace("Updating recent document menu."); 
	var docMenu = air.NativeMenu(event.target); 
	 
	for (var i = docMenu.numItems - 1; i >= 0; i--) { 
	docMenu.removeItemAt(i); 
	} 
	 
	for (var file=0;file<fileBox.recentDocuments.length;file++) { 
	var menuItem =  
		docMenu.addItem(new air.NativeMenuItem(fileBox.recentDocuments[file].name)); 
	menuItem.data = fileBox.recentDocuments[file]; 
	menuItem.addEventListener(air.Event.SELECT, selectRecentDocument); 
	} 
} 
 
function selectRecentDocument(event) {
	if(dbg){dbgPut("Selected recent document: " + event.target.data.name)};
	//open
	fileBox.currentFile=new air.File(event.target.data.url);
	fileBox.readIN();
}

function selectCommand(event) {
	switch (event.target.label)
	{
	case "SaveAs":fileBox.saveAs();
	break;
	case "Save":fileBox.saveFile();
	break;
	case "Open":fileBox.openFileDB();
	break;
	case "Restore":if((! xUI.isStored())&&(confirm("現在の編集を破棄しますか？"))){fileBox.readIN()};//現在の編集を破棄して強制的に読み込み
	break;
	case "New":myScenePref.open();document.getElementById("scnNewSheet").checked=true;
	break;
	case "Copy":chkValue("copy");
	break;
	case "selectAll":chkValue("selall");;
	break;
	case "cut":chkValue("cut");;
	break;
	case "Paste":chkValue("paste");;
	break;
	case "undo":chkValue("undo");;
	break;
	case "redo":chkValue("redo");;
	break;
	case "Preferences":var myPref=new Pref();myPref.open();
	break;
	case "Document":myScenePref.open();
	break;
	case "importReference":;
	break;
	case "copyToRef":putReference();
	break;
	case "copyFromRef":getReference();
	break;
	case "clearReference":xUI.resetSheet(undefined,new Xps(xUI.XPS.xpsTracks.length-2,xUI.XPS.duration()));
	break;
	case "dataPanel":xUI.sWitchPanel("Data");
	break;
	case "exportAsHTML":fileBox.storeOtherExtensionFile(printHTML(true),"html");
	break;
	case "exportAsEPS":exportEps();
	break;
	case "Quit":window.close();
	break;
	case "dropdownMenuBar":xUI.sWitchPanel("memu");
	break;
	case "commandBar":xUI.sWitchPanel("Utl");
	break;
	case "softwareKB":xUI.sWitchPanel("Tbx");
	break;
	case "about":xUI.sWitchPanel("Ver");
	break;
	case "memo":xUI.sWitchPanel("memoArea");
	break;
	case "sheetHeader":xUI.sWitchPanel("SheetHdr");
	break;
	case "toolBar":xUI.sWitchPanel("ToolBr");
	break;
	case "editLabel":reNameLabel(xUI.Select[0]);
	break;
	case "clearTimeline":clearTL();
	break;
	case "clearSheet":clearTL("all");
	break;
	case "insertBlock":insertBlank();
	break;
	case "deleteBlock":deleteBlank();
	break;
	case "addSoundTrack":addTimeline("dialog");
	break;
	case "addStillTL":addTimeline("still");
	break;
	case "addCellTL":addTimeline("timing");
	break;
	case "addCameraTL":addTimeline("camera");
	break;
	case "addEfxTL":addTimeline("effect");
	break;
	case "InsertTL":insertColumns();
	break;
	case "DeleteTL":deleteColumns();
	break;
	case "FormatTimeline":reformatTimeline();
	break;
	case "FormatSheet":reformatTimeline("all");
	break;
	case "pushBackup":xUI.setBackup();
	break;
	case "restoreBackup":xUI.getBackup();
	break;
	case "clearBackup":xUI.clearBackup();
	break;

/*
	case "":;
	break;
*/
	default:
		if(dbg){dbgPut("Selected command: " + event.target.label)}; 
	}

}
 
function selectCommandMenu(event) { 
	if (event.currentTarget.parent != null) { 
	var menuItem = findItemForMenu(event.currentTarget); 
	if(menuItem != null){ 
		air.trace("Select event for \"" + event.target.label +  
		"\" command handled by menu: " + menuItem.label); 
	} 
	} else { 
	air.trace("Select event for \"" + event.target.label +  
		"\" command handled by root menu."); 
	} 
} 
 
function findItemForMenu(menu){ 
	for (var item in menu.parent.items) { 
	if (item != null) { 
		if (item.submenu == menu) { 
		return item; 
		} 
	} 
	} 
	return null; 
} 


/*初期化*/
fileBox.init();

//setupNativeMenu();
if((appHost.platform=="AIR")&&(application.menu.items.length<7)){setMenu();}
//fileBox.openFileDB();
//if(fileBox.contentText){alert(fileBox.contentText)}


/*	システムクリップボードに書き出す
引数はテキストのみで

*/
//var testCLipboard=new Clipboard();

function writeClipBoard(myContent){
	if(! myContent){return false}
	myContent=myContent.replace(/(\r)?\n/g,"\r\n");//for Win
	air.Clipboard.generalClipboard.clear(); //clear Clipboard
	air.Clipboard.generalClipboard.setData(air.ClipboardFormats.TEXT_FORMAT, myContent, false);//write Data
}

	function getClipBoard()
	{
		var myResult=false;
		if(air.Clipboard.generalClipboard.hasFormat(air.ClipboardFormats.TEXT_FORMAT)){ 
			myResult = air.Clipboard.generalClipboard.getData(air.ClipboardFormats.TEXT_FORMAT);
		}
		return myResult;
	};

break;
case	"CEP":
//	window.parent.psHtmlDispatch();//CEP環境の際のみイベントをディスパッチしてパネルの再ロードを抑制する
case	"CSX":
//参照用オブジェクトを作成
	var Folder=new Object;
if(appHost.platform=="CSX"){
				Folder.nas=_Adobe.JSXInterface.call("eval","Folder.userData.fullName")+"/nas";
}else{
			window.__adobe_cep__.evalScript("Folder.userData.fullName",function(myResult){Folder.nas=(myResult)?myResult+"/nas":null;});
}


/*	ファイルハンドリングオブジェクト
	Adobe機能拡張用  ファイルは暫定的にフルパスのURIフォーム
 */
	var fileBox=new Object();

		fileBox.currentFile=null; // The current file in the editor.
		fileBox.stream=null; // A FileStream object, used to read and write files.
		fileBox.defaultDir=null; // The default directory location.
		fileBox.chooserMode=null; // Whether the FileChooser.html window is used as an Open or Save As window.
		fileBox.fileQueue=null;
		fileBox.openMode=null;//ファイルモード  saveAndOpen/saveAndOpenDropFile/saveAndOpenArgFile or ""
		fileBox.recentDocuments=new Array();//recentDocumentsStack
		fileBox.contentText="";//テキストバッファ
			/**
			 * UI初期化
			 */
			fileBox.init=function() {
//スクリプトのカレントでなくドキュメントのカレントを追う方が良さそう
if(appHost.platform=="CSX"){
				fileBox.defaultDir = _Adobe.JSXInterface.call("eval","Folder.current.fullName");
}else{
			window.__adobe_cep__.evalScript("Folder.current.fullName",function(myResult){fileBox.defaultDir=(myResult)?myResult:null;});
}
			}
/*
 *recentDocumentにファイルを加えるメソッド  同じファイルがあったら追加しない
nasで扱うファイルオブジェクトは、読み書きを直接は行わないオブジェクトとして定義する
ファイルハンドルもない  読み書きの実行は外部のエージェントにデータをまるごと受け渡しする
プロパティ
nas.File.body	<本体データ Array パスを分解して配列に格納したもの
初期化入力は将来的には	String 相対パス、絶対パス、またはURI等のファイルの所在を表す文字列データなんでも
現状はとりえずURI形式 estkのFileが返すfullNameと同等品
nas.File.fullName()	URIに整形して返すURIエンコードだよ ようするに元の値を書き出す
nas.File.fsNama()	ローカルのフルパスに整形して返す  fsName互換  win/mac
nas.File.relativePath(currentDir)	カレントディレクトリを与えて相対パスを返す relativeURIと同じ
 */

	fileBox.recentDocuments.add=function(myFile){
//if(dbg){dbgPut("add file :"+this.length +" : "+ this.toString());}
		for(var file=0;file<this.length;file++){
//		dbgPut(myFile.name +" : " +this[file].name)
			if(myFile==this[file]){return true}
		}
//		this.push(new air.File(myFile.url));//参照をpushすると次に比較できなくなるので新しいオブジェクトでpush
		this.push(myFile.toString());//参照をpushすると次に比較できなくなるので新しい文字列オブジェクトでpush
		return true;
	}
			/**
			 * Displays the FileChooser.html file in a new window, and sets its mode to "Open".
			 */
			fileBox.openFileDB=function() {
			var myAction=xUI.checkStored("saveAndOpen");

		var txtFilter = "TimeSheetFile:*.xps *.xpst *.xdts *.tdts *.tsh *.ard *.ardj *.csv *.txt";
		var myEx="";
				var fileChooser;
				if(fileBox.currentFile instanceof String)
				{
					fileChooser = encodeURI(fileBox.currentFile);
if(appHost.os=="Win"){
	myEx+="var myFile = new File('" + fileChooser + "').openDlg('Open','"+txtFilter+"');(myFile)?myFile.fullName:false;";//win
}else{
	myEx+="var myFile = new File('" + fileChooser + "').openDlg('Open');(myFile)?myFile.fullName:false;";//mac or others
}
				} else {
					fileChooser = fileBox.defaultDir;
if(appHost.os=="Win"){
	myEx+="Folder.current='" + fileChooser + "';var myFile =  File.openDialog('Open','"+txtFilter+"');(myFile)?myFile.fullName:false;";//win
}else{
	myEx+="Folder.current='" + fileChooser + "';var myFile =  File.openDialog('Open','"+txtFilter+"');(myFile)?myFile.fullName:false;";//mac or others
}
				}

/*				//ホストのファイルブラウザを開いてターゲットファイルを取得

*/
if(appHost.platform=="CSX"){
	var tmpFileName=_Adobe.JSXInterface.call("eval",myEx);
		if(tmpFileName){
			return  fileBox.openFile(tmpFileName)  ;
		}else{
			return false;
		};
//キャンセル時はundefinedが戻る
}else{
//イテレータ渡し
//alert("openDB :"+myEx);
			window.__adobe_cep__.evalScript(myEx,fileBox.openFile);
}
			}
			/**
			 * Opens and reads a file.
			 */
			fileBox.openFile = function (target) {
//alert("openFile :" +target);
//			 if(_Adobe.JSXInterface.call("eval","new File('"+target+"').exists"))
//これもチェックしといた方が良い?
			 if(target){
				fileBox.currentFile = target;//ファイル設定
//	alert("current set :" +this.currentFile);
				fileBox.readIN();
//				event.target.removeEventListener(air.Event.SELECT, fileBox.openFile); 
				fileBox.recentDocuments.add(fileBox.currentFile);//最近のファイルに追加
				sync();//タイトル同期
			 }else{alert("targetErr :"+target)}
//if(appHost.platform=="CSX"){}else{}
			}
			/**
			 * readContent カレントファイルを読み込み内容を返す
			 */
			fileBox.readContent = function(){

			var myEx =	"";

			myEx +=	"var myOpenfile = new File('"+fileBox.currentFile+"');";
	//拡張子でテキストエンコーディングを設定
		if(fileBox.currentFile.match(/\.(xps|te?xt|ardj|json)$/)){
			myEx +=	"myOpenfile.encoding='UTF8';";
		}else{
			myEx +=	"myOpenfile.encoding='CP932';";
		}
			myEx +=	"myOpenfile.open('r');";
			myEx +=	"myContent = myOpenfile.read();";
			myEx +=	"if(myContent.length==0){alert('Zero Length!');}";
			myEx +=	"myOpenfile.close();";
			myEx +=	"myContent;";
				try
				{
if(appHost.platform=="CSX"){}
		var str =_Adobe.JSXInterface.call("eval",myEx);//内容を取得
			if(str){
					this.contentText=str;//内容をセット
					return this.contentText;
			}
				}
				catch(error)
				{
					ioErrorHandler(error);
				}
			}

			/**
			 * readIN textSource to XPS buffer
			 */
			fileBox.readIN = function(){
//alert("read IN :" +this.currentFile);

			var myEx =	"";
			myEx +=	"var myOpenfile = new File('"+encodeURI(fileBox.currentFile)+"');";
	//拡張子でテキストフォーマットを判別
		if(fileBox.currentFile.match(/\.(xps|te?xt|ardj|json)$/)){
			myEx +=	"myOpenfile.encoding='UTF8';";
		}else{
			myEx +=	"myOpenfile.encoding='CP932';";
		}
			myEx +=	"myOpenfile.open('r');";
			myEx +=	"myContent = myOpenfile.read();";
			myEx +=	"if(myContent.length==0){alert('Zero Length!');}";
			myEx +=	"myOpenfile.close();";
			myEx +=	"myContent;";
if(appHost.platform=="CSX"){
				var str=_Adobe.JSXInterface.call("eval",myEx);//内容を取得
				if(str){
					fileBox.contentText=str;
				}
//				alert(fileBox.contentText);

//アプリケーション初期化前にはXPSオブジェクトはあるが実質初期化前なので、
//xUI初期化のタイミングだけ認識してそれ以前なら以下のルーチンは実行しない
//開始時点でxUI空オブジェクトで初期化されるのでxUI.initを判定
			if(xUI.init){
				var myResult= xUI.XPS.readIN(fileBox.contentText);
			}else{
				var myResult=false;
			}

//取得したストリームを検査する 空ストリームXPS以外のストリームなら破棄してエラーコードを返す

					if(myResult){xUI.resetSheet(XPS);
					//nas_Rmp_Init();
					}

					// ここで取得したストリームをそのまま返す

					document.title=fileBox.currentFile;//ちょと注意  一括変更部分が必要
					return myResult;
}else{
//	try{window.__adobe_cep__.evalScript(myEx,function(er){alert(er)})}catch (eR){alert(eR)}
	
//	return false;
				window.__adobe_cep__.evalScript(myEx,function(myStr){
					if(myStr){fileBox.contentText=myStr;} else {return false;}
//アプリケーション初期化前にはXPSオブジェクトはあるが実質初期化前なので、
//xUI初期化のタイミングだけ認識してそれ以前なら以下のルーチンは実行しない
//開始時点でxUI空オブジェクトで初期化されるのでxUI.initを判定
			if(xUI.init){
				var myResult= xUI.XPS.readIN(fileBox.contentText);
			}else{
				var myResult=false;
			}
//取得したストリームを検査する 空ストリームXPS以外のストリームなら破棄してエラーコードを返す
					if(myResult){xUI.resetSheet(XPS);//nas_Rmp_Init();
					}
					// ここで取得したストリームをそのまま返す
	//				document.title=fileBox.currentFile.name;//ちょと注意  一括変更部分が必要
					return myResult;
				});
}
			}
			/**
			 * Displays the "Save As" dialog box.
			 * オープン時に未保存だった場合、保存後にオープンコマンドを実行するモードを作成
			 */
			fileBox.saveAs=function () {
				var fileChooser="";//
				if(fileBox.currentFile instanceof String)
				{
					fileChooser = encodeURI(fileBox.currentFile);
				}else{
		var fName=encodeURI(xUI.getFileName()+'\.xps');
		fileChooser =(fileBox.defaultDir=="/")? "/"+fName:fileBox.defaultDir+"/"+fName;
				}
	var myEx =	"var myFile =new File('"+fileChooser+"').saveDlg('SaveAs');var myTarget=(myFile)? myFile.fullName:false;myTarget;";
	if(appHost.platform=="CSX"){
		var myTarget =_Adobe.JSXInterface.call("eval",myEx);
		if(myTarget){
//セレクタからの戻り値はキャンセルを含むので分岐
				fileBox.saveAsSelectHandler(myTarget);//CSX環境
//				fileChooser.browseForSave("SaveAs");
//				fileChooser.addEventListener(air.Event.SELECT, fileBox.saveAsSelectHandler);
		};
	}else{
	window.__adobe_cep__.evalScript(myEx,fileBox.saveAsSelectHandler);
	}
			}

			fileBox.saveAsSelectHandler=function (target) {
				if(target){fileBox.currentFile = target;}else{return false;}
				xUI.setStored("force");//ファイルを切り換えたので強制保存セット
				sync();
				fileBox.saveFile();
			}
/*
 * fileBox.saveContent();
 *	シンプルに内容をカレントファイルに保存する  ダイアログ類は全て省略
 事前にfileBox.contenText .currentFileを設定しておくこと
 */
 	fileBox.saveContent=function(){
				if (fileBox.currentFile == null) {
					return false;
				} else {

			var myEx = "";
			myEx +=	"var myOpenfile = new File('"+encodeURI(fileBox.currentFile)+"');";
	//拡張子でテキストフォーマットを判別
		if(fileBox.currentFile.match(/\.(xps|te?xt|ardj|json)$/)){
			myEx +=	"myOpenfile.encoding='UTF8';";
		}else{
			myEx +=	"myOpenfile.encoding='CP932';";
		}
						var outData = fileBox.contentText;

			myEx += "var tempText = decodeURI('"+ encodeURI(outData) +"');";
			myEx +=	"myOpenfile.open('w');";
			myEx +=	"var res = myOpenfile.write(tempText);";
			myEx +=	"myOpenfile.close();";
			myEx +=	"res;";

if(appHost.platform =="CSX"){
			return _Adobe.JSXInterface.call("eval",myEx);
					
					//モードに従ってオープン
}else{
	window.__adobe_cep__.evalScript(myEx,function(res){alert(res)});
}
				}
		
	}


			/**
			 * Opens and saves a file with the data in the mainText textArea element. 
			 * Newline (\n) characters in the text are replaced with the 
			 * platform-specific line ending character (File.lineEnding), which is the 
			 * line-feed character on Mac OS and the carriage return character followed by the 
			 * line-feed character on Windows.
			 */
			fileBox.saveFile=function () {
				if (fileBox.currentFile == null) 
				{
					fileBox.saveAs();
				} else {
				if(xUI.isStored()){
					if(! confirm("ファイルは保存済みだと思います。上書き保存しますか")){return}}

			var myEx = "";
			myEx +=	"var myOpenfile = new File('"+encodeURI(fileBox.currentFile)+"');";
	//拡張子でテキストフォーマットを判別
		if(fileBox.currentFile.match(/\.(xps|te?xt|ardj|json)$/)){
			myEx +=	"myOpenfile.encoding='UTF8';";
		}else{
			myEx +=	"myOpenfile.encoding='CP932';";
		}
						var outData = xUI.XPS.toString();
//						var outData = fileBox.contentText;

			myEx += "var tempText = decodeURI('"+ encodeURI(outData) +"');";
//			myEx +=	"alert(tempText);";

			myEx +=	"myOpenfile.open('w');";
			myEx +=	"var res = myOpenfile.write(tempText);";
			myEx +=	"myOpenfile.close();";
			myEx +=	"res;";

if(appHost.platform =="CSX"){
//		alert("writeFile :"+ myEx);
//		alert(_Adobe.JSXInterface.call("eval",myEx));
			if( _Adobe.JSXInterface.call("eval",myEx)){
					fileBox.recentDocuments.add(fileBox.currentFile);//最近のファイルに追加
					xUI.setStored("current");//ファイル保存を行ったのでリセットする;
					sync();//タイトル同期
					switch(fileBox.openMode){
					case "saveAndOpen":
						if(fileBox.openFileDB()){
//ここでopenFileDB()がマルチスレッドで実行される
							fileBox.openMode=null;
						}
					break;
					case "saveAndOpenDropFile":
					case "saveAndOpenArgFile":
						fileBox.currentFile=fileBox.fileQueue.url;
						fileBox.readIN();
						fileBox.openMode=null;fileBox.fileQueue=null;
					break;
					}
					//モードに従ってオープン
			}
}else{
	window.__adobe_cep__.evalScript(myEx,function(res){
			if(res){
					fileBox.recentDocuments.add(fileBox.currentFile);//最近のファイルに追加
					xUI.setStored("current");//ファイル保存を行ったのでリセットする;
					sync();//タイトル同期
					switch(fileBox.openMode){
					case "saveAndOpen":
						if(fileBox.openFileDB()){
//ここでopenFileDB()がマルチスレッドで実行される
							fileBox.openMode=null;
						}
					break;
					case "saveAndOpenDropFile":
					case "saveAndOpenArgFile":
						fileBox.currentFile=fileBox.fileQueue.url;
						fileBox.readIN();
						fileBox.openMode=null;fileBox.fileQueue=null;
					break;
					}
					//モードに従ってオープン
			}
	})
}
				}
			}

/*
	別の拡張子でファイル保存を行う仕様を拡張  20160126
	contentを配列で与えた場合一つの保存先に対してコンテンツの数だけ連番を後置して保存する
*/

fileBox.storeOtherExtensionFile=function(content,extsn){
	if(! content){return false};
	if(!(content instanceof Array)){content=[content];}

	if(! extsn){extsn="txt"};//指定が無かったら強制的にtxtに
	var myName=xUI.getFileName();
if(content.length==1){
	var fileChooser =(fileBox.currentFile instanceof String)? encodeURI(fileBox.currentFile.replace(/\.[^.]*$/,extsn)) : myName+"."+extsn;
//カレントファイルの拡張子を入れ替えた初期ファイル名を作成  カレントが存在しない場合は"現在のドキュメントから取得"
	var myEx ='var myFile =new File("'+fileChooser+'").saveDlg("'+ "export as "+extsn +'","'+extsn+'");(myFile)? myFile.fullName:false;';
	fileBox.contentText=content[0];//データが一つならばファイルボックスに本体データをセット
  if(appHost.platform=="CSX"){
	var myTarget =_Adobe.JSXInterface.call("eval",myEx);
		if(myTarget){fileBox.saveAsExtsnSelectHandler(myTarget);}
  }else{
	window.__adobe_cep__.evalScript(myEx, fileBox.saveAsExtsnSelectHandler);
  }
}else{
	var fileChooser =(fileBox.currentFile instanceof String)? encodeURI(fileBox.currentFile.replace(/\.[^.]*$/,""))+"_[0]."+extsn : myName+"_[0]."+extsn;
//カレントファイルの拡張子を入れ替えた初期ファイル名を作成  カレントが存在しない場合は"現在のドキュメントから取得"
	var myEx ='var myFolder =new File("'+fileChooser+'").parent.selectDlg("'+ "export as "+extsn +'","'+extsn+'");(myFolder)? myFolder.fullName:false;';
  if(appHost.platform=="CSX"){
  	var myTargetFolder=_Adobe.JSXInterface.call("eval",myEx);
  	//同期保存
  	for (var cID=0;cID<content.length;cID++){
		fileBox.contentText=content[cID];
		fileBox.saveAsExtsnSelectHandler(myTargetFolder+"/"+myName+"_"+(cID+1)+"."+extsn);
	}
  }else{
  	window.__adobe_cep__.evalScript(myEx, function(targetFolder){
  	    for (var cID=0;cID<content.length;cID++){
		fileBox.contentText=content[cID];
		fileBox.saveAsExtsnSelectHandler(myTargetFolder+"/"+myName+"_"+(cID+1)+"."+extsn);
	    }
  	});
  }  
}
}

	fileBox.saveAsExtsnSelectHandler=function (target) {
				if(! target){return target;}
				fileBox.currentFile = target;
			//画面同期もストア管理も省略
			var myEx = "";
			myEx +=	'var myOpenfile = new File("'+encodeURI(fileBox.currentFile)+'");';
	//拡張子でテキストフォーマットを判別
		if(fileBox.currentFile.match(/\.(xps|te?xt|ardj|html|htm|json)$/)){
			myEx +=	'myOpenfile.encoding="UTF8";';
		}else{
			myEx +=	'myOpenfile.encoding="CP932";';
		}
						var outData = encodeURI(fileBox.contentText);
			myEx += 'var tempText = decodeURI("'+ outData +'");';
			myEx +=	'myOpenfile.open("w");';
			myEx +=	'var res = myOpenfile.write(tempText);';
			myEx +=	'myOpenfile.close();';
			myEx +=	'res;';
if(appHost.platform=="CSX"){
//書き込んで結果取得
//dbgPut(myEx);
			var result=_Adobe.JSXInterface.call("eval",myEx);
	if(result){
		return result;//成功時にはそのまま
	}else{
		return false;//失敗したらfalse
	}
}else{
//書き込んで結果取得
			window.__adobe_cep__.evalScript(myEx,function(res){
				if(res){
					return result;
				}else{
					return false;
				}
			});
}
	}
			/**
			 * Error message for file I/O errors. 
			 */
			function ioErrorHandler(error) {
				console.log(error);
				alert("Error reading or writing the file.\n");
			}
fileBox.init();
break;
default	:

/*	fileBox以外の環境でのダミーオブジェクト

 */
	var fileBox=new Object();

		fileBox.currentFile=null; // The current file in the editor.
		fileBox.stream=null; // A FileStream object, used to read and write files.
		fileBox.defaultDir=null; // The default directory location.
		fileBox.chooserMode=null; // Whether the FileChooser.html window is used as an Open or Save As window.
		
		fileBox.contentText="";//テキストバッファ
//判定用に関数と同名でfalseを配置
		fileBox.init =	false;
		fileBox.saveFile =	false;
		fileBox.saveAs =	false;
		fileBox.openFile =	false;
		fileBox.openFileDB =	false;
		fileBox.readIN =	false;
		fileBox.readContent =	false;
		fileBox.saveAsSelectHandler =	false;
		fileBox.saveAsExtsnSelectHandler =	false;
		fileBox.storeOtherExtensionFile =	false;
		
	}

//------------------------------CEP環境の際のみイベントをディスパッチしてパネルの再ロードを抑制する
if(appHost.platform=="CEP"){
// 永続性を設定する
var event = new CSEvent();
event.type = "com.adobe.PhotoshopPersistent";
event.scope = "APPLICATION";
event.extensionId = window.__adobe_cep__.getExtensionId();
new CSInterface().dispatchEvent(event);
};
//
/**
 fileBox を利用してWebStorageの代用オブジェクトを実装

 *	localStorage,sessionStarge
 *代用オブジェクト
 *HTML5のlocalStorage,sessionStorageとある程度の互換性あり
 *AIRまたはCSX CEP環境のファイルオブジェクトを利用して可能ならローカルディスク上に保存を行う
 *
 *現在のコードでは、Web Storageで許可されている直接プロパティの追加は禁止
 *操作メソッドのみ互換
 *setItem/getItemメソッド経由のみで正常な動作となる
 *
 *値の保存は内容変更の都度、可能ならばローカルファイルへの保存で行なわれる
 *ファイルシステムの利用ができない場合は、セッションストレージの動作を行う。
 *重いので多用は控えるべき
 *
 *既にローカルストレージが実装されている環境では実行されない。
 *
 *eventProp
 *.key		
 *.length		
 *.oldValue
 *.url		
 *.storageArea	
 *
 *	properties
 *.length …… 保存されているデータの数を返す
 *.key(n) …… 保存されているn番目のkeyを返す
 *.getItem(key) …… keyに対応するvalueを取得する
 *.setItem(key, value) …… keyとvalueのペアでデータを保存する
 *.removeItem(key) …… keyに対応するvalueを削除する
 *.clear() …… データをすべてクリアする
 *
 *
 */
//	--------- grobalにlocalStorageオブジェクトがある場合はコード全体をスキップ
if(typeof localStorage=="undefined"){
//	alert("loading alt localStorage");
 function nasWebStorage(){
	this.length=0;
	this.isLocalStorage=false;
	this.keys=new Array;
	this.keys.set=function(myKey){
		for (var ix=0;ix<this.length;ix++){if(this[ix]==myKey){return ix;}}
		this.push(myKey);return this.length;
	}
	this.key=function(myIndex){return this.keys[myIndex]}
	this.setItem=function(myKey,myValue){
		var ix=this.keys.set(myKey);
		this[myKey]=myValue;		
		this.length=this.keys.length;
		//値のセットに成功したらディスクに保存 戻り値は不明
		if(this.isLocalStorage){
			this.isLocalStorage=false;
 			this.autoSave();
 			this.isLocalStorage=true;
 		}
 		return true;
	}
	this.removeItem=function(myKey){
		for(var ix=0;ix<this.keys.length;ix++){
			if(this.keys[ix]==myKey){
				this.keys.splice(ix,1);
				this.length=this.keys.length;
				delete this[myKey];
		//値の削除に成功したらディスクに上書き保存
		if(this.isLocalStorage){
			this.isLocalStorage=false;
 			this.autoSave();
 			this.isLocalStorage=true;
 		}
				return true;
			}
		}
		return false;
	};
	this.getItem=function(myIndex){return this[myIndex]};
	this.clear=function(){
		for(var ix=0;ix<this.keys.length;ix++){
			delete(this[this.keys[ix]]);
		}
		this.keys.splice(0,this.length);this.length=0;
		//値の削除に成功したら上のデータクリア
		if(this.isLocalStorage){
		 this.isLocalStorage=false;
		 this.autoSave();
		 this.isLocalStorage=true;
		 }
		return true;
	}
	/** localStorageの場合に呼び出される自動保存  fileBox環境のない場合は何もしない
		短時間に連続して非同期／同期IOを呼び出す可能性があるのでこのメソッドを呼ぶ前にisLocalStorageプロパティを一時的にfalseにすること
	*/
	this.autoSave =function(){
		if(fileBox){
			var myContent=[];
			for (var ix=0;ix<this.keys.length;ix++){myContent.push('"'+this.keys[ix]+'":"'+encodeURI(this.getItem(this.keys[ix]))+'"');};
			myContent="{"+myContent.join(",")+"}";
			var contentBackup=fileBox.contentText;var fileBackup=fileBox.currentFile;
if(appHost.platform=="AIR"){
//AIRの場合はair.Fileオブジェクト
			fileBox.currentFile=new air.File(Folder.nas.url+"/lib/etc/"+appHost.platform+"/info.nas.rempiang.localStorage.json");
}else{
//CSX,CEP環境の場合はフルパス(url)を文字列で与える
			fileBox.currentFile=Folder.nas+"/lib/etc/"+appHost.platform+"/info.nas.rempiang.localStorage.json";
}
			fileBox.contentText=myContent;
			var myResult=fileBox.saveContent();
			fileBox.contentText=contentBackup;fileBox.currentFile=fileBackup;
			return myResult;
		}
			return false;
	}
	/** ローカルディスク上からデータを読みだす。
		localStorageフラグがない場合は、全体をスキップ
	*/
	this.restore=function(){
		if((fileBox)&&(this.isLocalStorage)){
			var contentBackup=fileBox.contentText;var fileBackup=fileBox.currentFile;
			//fileBox.contentText="";
if(appHost.platform=="AIR"){
			fileBox.currentFile=new air.File(Folder.nas.url+"/lib/etc/"+appHost.platform+"/info.nas.rempiang.localStorage.json");
}else{
			fileBox.currentFile=Folder.nas+"/lib/etc/"+appHost.platform+"/info.nas.rempiang.localStorage.json";
}
			var myContent=fileBox.readContent();
			fileBox.contentText=contentBackup;fileBox.currentFile=fileBackup;
			if(myContent){
//現在の内容をクリア
				if(this.length){for(var ix=0;ix<this.keys.length;ix++){delete(this[this.keys[ix]])}};
				var myObj=JSON.parse(myContent);
				this.isLocalStorage=false;
				for(prp in myObj){
					this.setItem(prp,decodeURI(myObj[prp]))
				};
		 		this.isLocalStorage=true;
			}
			return true;
		}else{
			return false;
		}
	}
 }
sessionStorage=new nasWebStorage();
localStorage=new nasWebStorage();
localStorage.isLocalStorage=true;
localStorage.restore();
}
/*test
Ax=new webStorage();
set Ax(){alert(123)}'
Ax.length;
Ax["V"]="1234";
*/
/*
 *書き込みの手順
 *
 *FileBoxのコンテンツを書き込み内容にする
 *ファイルを設定する
 *fileBox.contentText/fileBox.currentFileの内容をバックアップ
 *fileBox.contentText/fileBox.currentFileに内容とターゲットファイルをセット
 *	fileBox.saveContent()を呼ぶ
 *fileBox.contentText/fileBox.currentFileの内容をバックアップで復帰
 *
 *読み出しは同様の手順で
 *	fileBox.readContent();の戻り値を取得する
 *	
 *現在の問題点
 *	remaping-AIRで複数のウインドウを開いた場合はlocalStorage保存ファイルがバッティングするので注意
 *	複数ドキュメントの同時編集をサポートの際には解決しておくこと
 *	というか  AIRでローカルストレージをサポートしてほしい
 */
