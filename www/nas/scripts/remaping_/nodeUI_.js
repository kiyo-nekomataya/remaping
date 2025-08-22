/*                   --------- nodeUI.js
	node.js/electron 用 入出力プロシジャ
	Adobe AIR/Adobe Extend ScriptもNode.js仕様時はこちらを使用のこと
	
	
	基本的にはnas-htmlで使用する場合nas.File オブジェクトをつくってラップするのがよさそう
	nas-File はラッピングオブジェクトとしてファイルアクセスを提供
AdobeScript/Air(Flash)/CGI上で使用するサーバーーローカルファイル/URL(読み出し専用)

*/
'use strict';
//初期化
if(! appHost.Nodejs){

	var electron = false;
	var remote = false;
	var fs = false;
	var path = false;
	var iconv = false;
	var dialog = false;
	console.log("has no electron");

}else{
	var electron = require('electron');
	var remote = electron.remote;

	var fs   = require('fs');
	var path = require('path');
	var iconv = require("iconv-lite");
//	var { BrowserWindow, dialog } = require('electron').remote;
	var { BrowserWindow, dialog } = remote;
	var { Menu, MenuItem }   = remote;

	console.log('setup for Node.js with electron');

//参照用オブジェクトを作成
	var Folder = {};
//homepath
//	process.env[process.platform == "win32" ? "USERPROFILE" : "HOME"];
Folder.nas=(appHost.os=="Win")?
		new nas.File(process.env["USERPROFILE"]+'/AppData/Roaming/nas'):
		new nas.File(process.env["HOME"]+'/Library/Application%20Support/nas');
Folder.script=(appHost.os=="Win")?
		new nas.File(process.env["USERPROFILE"]+'/AppData/Roaming/nas/scripts'):
		new nas.File(process.env["HOME"]+'/Library/Application%20Support/nas');


/**	ファイルハンドリングオブジェクト
	ローカルファイル機能拡張用  ファイルは暫定的にフルパスのURIフォーム
 */
var fileBox = {};
	fileBox.currentFile = null; // {String} 処理対象プロジェクト｜ファイル　パス
	fileBox.currentFileEncoding	= 'utf8';//{String} データエンコーディング？
	fileBox.stream      = null; // A FileStream object, used to read and write files.
	fileBox.defaultDir  = null; // The default directory location.
	fileBox.chooserMode = null; // Whether the FileChooser.html window is used as an Open or Save As window.
	fileBox.fileQueue   = null;//{Array} 処理待行列
	fileBox.openMode    = null;//ファイルモード  saveAndOpen|saveAndOpenDropFile|saveAndOpenArgFile or ""
	fileBox.contentText = ""  ;//テキストバッファ
	fileBox.recentDocuments = [];//{Array} recentDocumentsStack
// UI初期化
	fileBox.init=function() {
//スクリプトのカレントでなくドキュメントのカレントを追う方が良さそう
		fileBox.defaultDir = __dirname;//アプリの位置でよいか？
		//process.env["HOME"]; node.js環境下では環境変数の参照可能
	}
/**
recentDocumentにファイルを加えるメソッド  同じファイルがあったら追加しない
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
	fileBox.recentDocuments.add = function(myFile){
		for(var file=0;file<this.length;file++){
			if(myFile==this[file]){return true}
		}
		this.push(myFile.toString());//参照をpushすると次に比較できなくなるので新しい文字列オブジェクトでpush
		return true;
	}
/*
 * Displays the FileChooser.html file in a new window, and sets its mode to "Open".
 */
	fileBox.openFileDB=function() {
		var myAction   = xUI.checkStored("saveAndOpen");
		var openTarget = dialog.showOpenDialogSync(
			null,
			{
				filters:[
					{
						name : 'TimeSheetFile'   ,
						extensions:[
							'xps',
							'xpst',
							'xdts',
							'tdts ',
							'tsh',
							'ard',
							'ardj',
							'csv',
							'txt'
						]
					},
					{
						name : 'animation project file',
						extensions:['xmap']
					},
					{
						name : 'All Files',
						extensions: ['*']
					}
				],
			}
		);
console.log(openTarget);
		if((openTarget)&&(openTarget.length))
		fileBox.openFile(openTarget[0]);//ファイル配列で戻る
	}
/**
 * Opens and reads a file.
 *	sync
 */
	fileBox.openFile = function (target) {
		if(target){
			fileBox.currentFile = target;//ファイル設定
			fileBox.readIN();
			fileBox.recentDocuments.add(fileBox.currentFile);//最近のファイルに追加
			sync();//タイトル同期
		}else{console.log("targetErr :"+target)}
	}
/**
 * readContent カレントファイルを読み込み内容を返す 同期
 */
	fileBox.readContent = function(){
//拡張子でテキストエンコーディングを設定
		if(fileBox.currentFile.match(/\.(xmap|xpst?|te?xt|ardj|json|tdts|xdts)$/i)){
			fileBox.currentFileEncoding='utf8';
		}else{
			fileBox.currentFileEncoding='cp932';
		}
//utf8以外はエンコーディング指定なし(バイナリ)で読み込む
		var result = fs.readFileSync(
				fileBox.currentFile,
				(fileBox.currentFileEncoding == 'utf8')?"utf8":"binary"
			);
		if(result){
//デコード
			if(fileBox.currentFileEncoding == 'utf8'){
				fileBox.contentText = result;
			}else{
				fileBox.contentText = iconv.decode(
					result,
					fileBox.currentFileEncoding
				);
			}
			return fileBox.contentText;
		}
		return result;
	}

/**
 * fileBoxの指定データをfsから読み出してxUI.XPSに設定　非同期
 */
	fileBox.readIN = function(){
		var myOpenfile = fileBox.currentFile;

console.log(myOpenfile);
//拡張子でエンコーディングを判別
		if(fileBox.currentFile.match(/\.(xps|te?xt|ardj|json|tdts|xdts)$/i)){
			fileBox.currentFileEncoding='utf8';
		}else{
			fileBox.currentFileEncoding='cp932';
		}
		fs.readFile(
			fileBox.currentFile,
			(fileBox.currentFileEncoding == 'utf8')?"utf8":"binary",
			function(err,data){
console.log(data);
				if(err){
					console.log(err);
				}else{
					if(fileBox.currentFileEncoding == "utf8"){
						fileBox.contentText = data;
					}else{
						fileBox.contentText = iconv.decode(
							data,
							fileBox.currentFileEncoding
						);
					}
//アプリケーション初期化前にはXPSオブジェクトはあるが実質初期化前なので、
//xUI初期化のタイミングだけ認識してそれ以前なら以下のルーチンは実行しない
//開始時点でxUI空オブジェクトで初期化されるのでxUI.initを判定
console.log(fileBox.contentText);
					if(xUI.init){
						var myResult= xUI.XPS.readIN(fileBox.contentText);
console.log(myResult);
					}else{
						var myResult=false;
					}
					if(myResult) xUI.resetSheet();

					console.log(myResult);
				}
			}
		);
	}
/**
 * Displays the "Save As" dialog box.
 * オープン時に未保存だった場合、保存後にオープンコマンドを実行するモードを作成
 */
	fileBox.saveAs=function () {
		var fileChooser="";//
		if(fileBox.currentFile instanceof String){
			fileChooser = encodeURI(fileBox.currentFile);
		}else{
			var fName=encodeURI(xUI.getFileName()+'\.xps');
			fileChooser =(fileBox.defaultDir=="/")? "/"+fName:fileBox.defaultDir+"/"+fName;
		}
		var myEx =	"var myFile =new File('"+fileChooser+"').saveDlg('SaveAs');var myTarget=(myFile)? myFile.fullName:false;myTarget;";
		if(appHost.platform=="CSX"){
//CSX
			var myTarget =_Adobe.JSXInterface.call("eval",myEx);
			if(myTarget){
//セレクタからの戻り値はキャンセルを含むので分岐
				fileBox.saveAsSelectHandler(myTarget);//CSX環境
//				fileChooser.browseForSave("SaveAs");
//				fileChooser.addEventListener(air.Event.SELECT, fileBox.saveAsSelectHandler);
			};
		}else if(appHost.platform=="CEP"){
//CEP
			window.__adobe_cep__.evalScript(myEx,fileBox.saveAsSelectHandler);
		}else{
//
			var target = dialog.showSaveDialogSync(fileChooser);
			console.log(target);
			if(target) fileBox.saveAsSelectHandler(target);
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
			var myOpenfile = new File(encodeURI(fileBox.currentFile));
	//拡張子でエンコーディングを判別
			if(fileBox.currentFile.match(/\.(xps|te?xt|ardj|json|tdts|xdts)$/i)){
				fileBox.currentFileEncoding='utf-8';
			}else{
				fileBox.currentFileEncoding='cp932';
			}
			var outData = fileBox.contentText;
//case utf-8
			if(fileBox.currentFileEncoding=='utf8'){
				fs.writeFile(
					fileBox.currentFile,
					fileBox.cuntentText,
					fileBox.currentFileEncoding,
					function(result){
						console.log(result)
					}
				);
			}else{
//case s-jis
// 空のファイルを書き出す
				fs.writeFileSync( fileBox.currentFile , "" );
// ファイルを「書き込み専用モード」で開く
				var fd = fs.openSync( fileBox.currentFile, "w");
// 書き出すデータをShift_JISに変換して、バッファとして書き出す
				var buf = iconv.encode( fileBox.cuntentText , fileBox.currentFileEncoding );
				fs.write( fd, buf , 0 , buf.length , function(err, written, buffer){
//  バッファをファイルに書き込む
					if(err) throw err;
					console.log("ファイルが正常に書き出しされました");
				});
			}
//			var tempText = decodeURI(encodeURI(outData));
//			myOpenfile.open('w');
//			var res = myOpenfile.write(tempText);
//			myOpenfile.close();
//			console.log(res);

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
		if (fileBox.currentFile == null) {
			fileBox.saveAs();
		} else {
			if(xUI.isStored()){
				if(! confirm("ファイルは保存済みだと思います。上書き保存しますか")){return}
			}
			var myOpenfile = new nas.File(encodeURI(fileBox.currentFile));
	//拡張子でエンコーディングを判別
			if(fileBox.currentFile.match(/\.(xps|te?xt|ardj|json|tdts|xdts)$/i)){
				fileBox.currentFileEncoding='utf8';
			}else{
				fileBox.currentFileEncoding='cp932';
			}
			var outData = xUI.XPS.toString();
			var tempText = decodeURI(encodeURI(outData));
			fileBox.contentText = tempText;
console.log(fileBox);
			if(fileBox.currentFileEncoding=='utf8'){
//case utf8
				fs.writeFile(
					fileBox.currentFile,
					fileBox.contentText,
					fileBox.currentFileEncoding,
					function(result){
						if(result){
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
								fileBox.openMode=null;
								fileBox.fileQueue=null;
							break;
							}
//モードに従ってオープン
						}else{
							console.log(result);
						}
					}
				);
//				myOpenfile.open('w');
//				var res = myOpenfile.write(tempText);
//				myOpenfile.close();
			}else{
//case s-jis or other
				fs.writeFileSync( fileBox.currentFile , "" );
				var fd = fs.openSync( fileBox.currentFile, "w");
				var buf = iconv.encode( fileBox.contentTextO , fileBox.currentFileEncoding );
				fs.write( fd , buf , 0 , buf.length , function(err, written, buffer){
					if(err) throw err;
//正常終了
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
						fileBox.openMode=null;
						fileBox.fileQueue=null;
					break;
					}
//モードに従ってオープン
				});
			}
		}
	}

/**
 *	別の拡張子でファイル保存を行う仕様を拡張  20160126
 *	@params	{String|Array of String} content
 *		contentを配列で与えた場合、保存先に対してコンテンツの数だけ連番を後置して保存する
 *	@params	{String}	extsn
 *		保存データ拡張子
 */
	fileBox.storeOtherExtensionFile=function(content,extsn){
		if(! content){return false};
		if(!(content instanceof Array)){content=[content];}
		if(content.length == 0){return false};
		if(! extsn){extsn="txt"};//拡張子指定が無かったら強制的にtxtに
		var myName=xUI.getFileName();//フルサイズのｘMap識別子
		if(content.length==1){
			var fileChooser = (fileBox.currentFile instanceof String)? encodeURI(fileBox.currentFile) :myName;
			fileChooser = fileChooser.replace(/\.[^.]*$/,extsn);
//カレントファイルの拡張子を入れ替えた初期ファイル名を作成  カレントが存在しない場合は"現在のドキュメントから取得"
			var myFile = dialog.showSaveDialogSync(
				null,
				{defaultPath:fileChooser}
			);
//データが一つならばファイルボックスに本体データをセット
			fileBox.contentText = content[0];
			var myTarget = (myFile)? myFile:false;
			if(myTarget){fileBox.saveAsExtsnSelectHandler(myTarget);}
		}else{
			var fileChooser =(fileBox.currentFile instanceof String)? encodeURI(fileBox.currentFile.replace(/\.[^.]*$/,""))+"_[#]."+extsn : myName.replace(/\.[^.]*$/,'')+"_[#]."+extsn;
//カレントファイルの拡張子を入れ替えた初期ファイル名を作成  カレントが存在しない場合は"現在のドキュメントから取得"
			var myFolder = dialog.showSaveDialogSync(
				null,
				{defaultPath:fileChooser}
			);
		
			var myTarget = (myFolder)? myFolder:false;
			if(myTarget)
 	 		var myTargetFolder=_Adobe.JSXInterface.call("eval",myEx);
//同期保存
			for (var cID=0;cID<content.length;cID++){
				fileBox.contentText=content[cID];
				fileBox.saveAsExtsnSelectHandler(myTargetFolder+"/"+myName+"_"+(cID+1)+"."+extsn);
			}
		}
	}
/**
 *	外部（任意）形式で書き出しを行うイベントハンドラ
 *	@params	{String}	target
 *		保存先パス
 *	あらかじめ fileBox.contentTextに書き出し用のデータが配置されていること
 */
	fileBox.saveAsExtsnSelectHandler=function (target) {
		if(! target){return target;}
		fileBox.currentFile = target;
//画面同期もストア管理も省略
		var myOpenfile = fileBox.currentFile;
	//拡張子でエンコーディングを判別
		if(fileBox.currentFile.match(/\.(xps|te?xt|ardj|html|htm|json)$/)){
			fileBox.currentFileEncoding="utf8";
		}else{
			fileBox.currentFileEncoding="cp932";
		}
		var outData = encodeURI(fileBox.contentText);
		var tempText = decodeURI("'+ outData +'");

		var res = fs.writeFile(
			fileBox.currentFile,
			fileBox.contentText,
			fileBox.currentFileEncoding,
			function(reult){
				console.log(result)
			}
		);
//		myOpenfile.open("w");
//		var res = myOpenfile.write(tempText);
//		myOpenfile.close();
	}
/*
	ディレクトリ内のファイル内容リストを取得
	lsに相当
	@params  {String} dirpath
	@params  {Function}	callback
		エントリーリストを取得するパス文字列
		単独ファイルの場合はファイルの	
*/
	fileBox.getDirEnt = function(dirpath, callback){
		if(! dirpath) dirpath = this.defaultDir
		fs.readdir(dirpath, {withFileTypes:true}, function(err, dirents){
			if (err) {
				console.error(err);
				return;
			}
			for (var dirent of dirents) {
			var fp = path.join(dirpath, dirent.name);
				if (dirent.isDirectory()) {
					fileBox.getDirEnt(fp, callback);
				} else {
					callback(fp);
				}
			}
		});
	}
/*	TEST
	fileBox.getDirEnt(process.argv[2], console.log);		
*/
var showFiles = (dirpath, callback) => {
  fs.readdir(dirpath, {withFileTypes: true}, (err, dirents) => {
    if (err) {
      console.error(err);
      return;
    }

    for (const dirent of dirents) {
      const fp = path.join(dirpath, dirent.name);
      if (dirent.isDirectory()) {
        showFiles(fp, callback);
      } else {
        callback(fp);
      }
    }
  });
}

// showFiles(process.argv[2], console.log);
/*
 * Error message for file I/O errors. 
 */
	function ioErrorHandler(error) {
		console.log(error);
		alert("Error reading or writing the file.\n");
	}
//fileBox初期化
fileBox.init();

//アプリケーションメニュー初期化

var mne = new Menu();

// ElectronのMenuの設定
var templateMenu = [
    {
        label: 'Edit',
        submenu: [
            {
                role: 'undo',
            },
            {
                role: 'redo',
            },
        ]
    },
    {
        label: 'View',
        submenu: [
            {
                label: 'Reload',
                accelerator: 'CmdOrCtrl+R',
                click(item, focusedWindow){
                    if(focusedWindow) focusedWindow.reload()
                },
            },
            {
                type: 'separator',
            },
            {
                role: 'resetzoom',
            },
            {
                role: 'zoomin',
            },
            {
                role: 'zoomout',
            },
            {
                type: 'separator',
            },
            {
                role: 'togglefullscreen',
            }
        ]
    }
];

//var menu = mne.buildFromTemplate(templateMenu);
//mne.setApplicationMenu(menu);

};//with Node.js