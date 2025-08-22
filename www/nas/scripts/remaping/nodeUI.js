/*                   --------- nodeUI.js
	node.js/cordova/electron 用 入出力プロシジャ
	Adobe AIR/Adobe Extend ScriptもNode.js仕様時はこちらを使用のこと
	
	
	基本的にはnas-htmlで使用する場合nas.File オブジェクトをつくってラップするのがよさそう
	nas-File はラッピングオブジェクトとしてファイルアクセスを提供
AdobeScript/Air(Flash)/CGI上で使用するサーバーーローカルファイル/URL(読み出し専用)

*/
'use strict';
//初期化
if(
	(! appHost.Nodejs)&&((appHost.platform != 'Electron')||((typeof electronIpc == 'undefined')||(!(electronIpc))))
){
// no node init as PWA
	var electron      = false;
	var electronIpc   = false;
	var remote        = false;
	var fs            = false;
	var path          = false;
	var child_process = false;
	var iconv         = false;
	var dialog        = false;
	var mime          = false;
	var exec          = false;
	var execSync      = false;
if(typeof TgaLoader == 'undefined')
	var TgaLoader     = false;
if(typeof Tiff == 'undefined')
	var Tiff          = false;
	var sharp         = false;
	var PSD           = (typeof require == 'undefined')? false : require('psd');

	var Folder = null;
	var sysEnv = null;
	console.log("no node and electron");
}else{
  if(appHost.Nodejs){
//for Node.js & Electron main process
	console.log("init nodeUI")
	var electron      = require('electron');
	var remote        = electron.remote;
	var fs            = require('fs-extra');
	var path          = require('path');
	var child_process = require('child_process');
	var iconv         = require("iconv-lite");
	var mime          = require("mime-types");
	var { BrowserWindow , dialog } = remote;
	var { Menu, MenuItem }         = remote;
	var	{ exec, execSync}          = require('child_process');

if(typeof TgaLoader == undefined)
	var	TgaLoader = require('tga-js');
	var sharp     = false ;//require('sharp');//削除予定
if(typeof Tiff == undefined)
	var Tiff      = require('tiff.js');
	var PSD       = require('psd');

	var sysEnv = JSON.parse(JSON.stringify(process.env));
console.log('setup for Node.js for electron main process');
  }else if(appHost.platform == 'Electron'){
//for Electron browser process
	var electron      = false;
	var remote        = false;
	var fs            = false;
	var path          = false;
	var child_process = false;
	var iconv         = false;
	var dialog        = false;
	var mime          = false;
	var exec          = false;
	var execSync      = false;
if(typeof TgaLoader == 'undefined')
	var TgaLoader     = false;
if(typeof Tiff == 'undefined')
	var Tiff          = false;
	var sharp         = false;
	var PSD           = (typeof require == 'undefined')? false : require('psd');

	var sysEnv = JSON.parse(electronIpc.getEnv());
console.log('setup for Electron browser process' );
  };
console.log(sysEnv)
//参照用オブジェクトを作成
	var Folder = {};
//homepath
//	sysEnv[process.platform == "win32" ? "USERPROFILE" : "HOME"];
Folder.nas=(appHost.os=="Win")?
		new nas.File(sysEnv["USERPROFILE"]+'/AppData/Roaming/nas'):
		new nas.File(sysEnv["HOME"]+'/Library/Application%20Support/nas');
console.log(Folder.nas.fullName);
Folder.script=(appHost.os=="Win")?
		new nas.File(sysEnv["USERPROFILE"]+'/AppData/Roaming/nas/scripts'):
		new nas.File(sysEnv["HOME"]+'/Library/Application%20Support/nas/scripts');

Folder.current =(appHost.Nodejs)?
	new nas.File(process.cwd()):
	new nas.File(electronIpc.cd());
//アプリケーションカレントディレクトリ
console.log(Folder);

/**	ファイルハンドリングオブジェクト
	ローカルファイル機能拡張用  ファイルは暫定的にフルパスのURIフォーム
 */
var fileBox = {};
	fileBox.currentFile         = null  ; // {String} 処理対象プロジェクト｜ファイル　パス
	fileBox.currentFileEncoding	= 'utf8';//{String} データエンコーディング？
	fileBox.stream              = null  ; // A FileStream object, used to read and write files.
	fileBox.defaultDir          = null  ; // The default directory location.
	fileBox.chooserMode         = null  ; // Whether the FileChooser.html window is used as an Open or Save As window.
	fileBox.fileQueue           = null  ;//{Array} 処理待行列
	fileBox.openMode            = null  ;//ファイルモード  saveAndOpen|saveAndOpenDropFile|saveAndOpenArgFile or ""
	fileBox.contentText         = ""    ;//テキストバッファ
	fileBox.recentDocuments     = []    ;//{Array} recentDocumentsStack
// UI初期化
	fileBox.init=function() {
//スクリプトのカレントでなくドキュメントのカレントを追う方が良さそう
//		fileBox.defaultDir = __dirname;//アプリの位置でよいか？
			fileBox.defaultDir = Folder.current.fsName;//起動時のカレント（あまり良くない）
		//sysEnv["HOME"]; node.js環境下では環境変数の参照可能
	}
/**
 * recentDocumentにファイルを加えるメソッド  同じファイルがあったら追加しない
 * nasで扱うファイルオブジェクトは、読み書きを直接は行わないオブジェクトとして定義する
 * ファイルハンドルもない  読み書きの実行は外部のエージェントにデータをまるごと受け渡しする
 *    nas.Fileのプロパティ
 * nas.File.body
 * 		<本体データ Array パスを分解して配列に格納したもの
 * 		初期化入力は将来的には	String 相対パス、絶対パス、またはURI等のファイルの所在を表す文字列データなんでも
 * 		現状はとりえずURI形式 estkのFileが返すfullNameと同等品
 * nas.File.fullName()
 * 		URIに整形して返すURIエンコード ようするに元の値を書き出す
 * nas.File.fsNama()
 * 		ローカルのフルパスに整形して返す  fsName互換  win/mac
 * nas.File.relativePath(currentDir)
 * 		カレントディレクトリを与えて相対パスを返す relativeURIと同じ
 */
	fileBox.recentDocuments.add = function(myFile){
		for(var file=0;file<this.length;file++){
			if(myFile == this[file]){return true}
		}
		this.push(myFile.toString());//参照をpushすると次に比較できなくなるので新しい文字列オブジェクトでpush
		return true;
	}
/*
 * Displays the FileChooser.html file in a new window, and sets its mode to "Open".
 */
	fileBox.openFileDB=function(opt) {
		var myAction   = (xUI.checkStored)? xUI.checkStored("saveAndOpen"):null;
		if(typeof opt == 'undefined') opt = {
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
		};
		var openTarget = (dialog)? dialog.showOpenDialogSync(null,opt):electronIpc.showOpenDialogSync(null,opt);
console.log(openTarget);
		if((openTarget)&&(openTarget.length))
		fileBox.openFile(openTarget[0]);//ファイル配列で戻る
	}
/**
 * Opens and reads a file.
 *	sync
 */
	fileBox.openFile = function (target,callback){
		if(target){
			fileBox.currentFile = target;//ファイル設定
			fileBox.readIN(callback);
			fileBox.recentDocuments.add(fileBox.currentFile);//最近のファイルに追加
			sync();//タイトル同期
		}else{console.log("targetErr :"+target)}
	}
/**
 * readContent カレントファイルを読み込み内容を返す 同期
 */
	fileBox.readContent = function(){
//拡張子でテキストエンコーディングを設定
		if(fileBox.currentFile.match(/\.(xmap|xpst?|te?xt|ardj|json|tdts|xdts|stbd|pmdb)$/i)){
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
				fileBox.contentText = (result).trim();
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
 * fileBoxの指定データをfsから読み出してcallbackを実行する
 * callbackが指定されない場合は xUI.XPSに対して設定する(非同期)
 */
	fileBox.readIN = function(callback){
		var myOpenfile = fileBox.currentFile;
//拡張子でエンコーディングを判別
		if(fileBox.currentFile.match(/\.(xps|te?xt|ardj|json|tdts|xdts|stbd|pmdb)$/i)){
			fileBox.currentFileEncoding='utf8';
		}else{
			fileBox.currentFileEncoding='cp932';
		}
		fs.readFile(
			fileBox.currentFile,
			(fileBox.currentFileEncoding == 'utf8')?"utf8":"binary",
			function(err,data){
				if(err){
					console.log(err);
				}else{
					if(fileBox.currentFileEncoding == "utf8"){
						fileBox.contentText = (data).trim();
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
					if(callback instanceof Function){
						callback(fileBox.contentText);
						var myResult=false;
					}else if(xUI.init){
						var myResult= xUI.XPS.readIN(fileBox.contentText);
					}else{
						var myResult=false;
					}
					if(myResult) xUI.resetSheet();
				};
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
			if(fileBox.currentFile.match(/\.(xps|te?xt|ardj|json|tdts|xdts|stbd|pmdb)$/i)){
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
			if(fileBox.currentFile.match(/\.(xps|te?xt|ardj|json|tdts|xdts|stbd|pmdb)$/i)){
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
				var buf = iconv.encode( fileBox.contentText , fileBox.currentFileEncoding );
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
		if(fileBox.currentFile.match(/\.(xps|te?xt|ardj|html|htm|json|stbd|pmdb)$/)){
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

	if(nas.HTML){
/*
	テスト・node.js慣熟を兼ねた作業用関数
*/
/**
 *	@parms	{String}	target_path
 *	データをシステムツールで開く
 *
 */
		var openData = function openData(target_path){
			if(appHost.Nodejs ){
				if(appHost.os=='Mac'){
					child_process.exec('open "'+target_path+'"');
				}else if(appHost.os=='Win'){
					child_process.exec('start "'+target_path+'"');
				};
			}else{
				xUI.openWithSystem(target_path);
			};
		}
/**
 *	@params {String}	target_path
 *	@params {Object}	options
 *
 * ファインダ｜ファイルエクスプローラでファイル・フォルダを開く
 *
 */
		var openPath = function openPath(target_path){


		if(appHost.os=='Mac'){
			child_process.exec('open "'+nas.File.dirname(target_path)+'"');
		}else if(appHost.os=='Win'){
			child_process.exec('start "'+nas.File.dirname(target_path)+'"');
		}else if(appHost.os=='Unix'){
		};
	}
/**
 *	@params	{String}	target_path
 *	@returns	{String}
 */
		var ls = function(target_path,form,mode){
			if(! mode) mode = 'fs';
			if(! form) form = 'JSON';
			if(! target_path) target_path = "./";
			var result=[];
			var entries =(appHost.Nodejs)?
				fs.readdirSync(target_path,{withFileTypes:true}):
				electronIpc.readdirSync(target_path,{withFileTypes:true});
console.log(entries);
			for (var ix = 0 ; ix < entries.length ; ix ++){
				if(entries[ix].isDirectry){
					result.push(decodeURIComponent(entries[ix].name) + "\t[dir]");
				}else{
					result.push(decodeURIComponent(entries[ix].name));
				};
			};
			return result.join('\n');
		}
		ls.description = "ディレクトリスト";
		ls.usage = "ls ENTRY";

		var cd = function(wd){
			if(appHost.Nodejs){
				if(wd) process.chdir(wd);
				return process.cwd();
			}else{
				return electronIpc.cd(wd);
			};
		}
		cd.description = "ディレクトリ変更";
		cd.usage = "cd DIRNAME";



		var chdir = cd;
		var pwd   = cd;
/**
 *	@params	{String}	target_path
 *	@returns	{String}	
 */
		var mkdir = function (target_path){
			if(
				(! target_path)||
				((fs)&&(fs.existsSync(target_path)))||
				((electronIpc)&&(electronIpc.existsSync(target_path)))
			) throw target_path;
			if(appHost.Nodejs){
				fs.mkdir(target_path,function(err){if(err) throw err;});
			}else{
				electronIpc.mkdir(target_path,function(err){if(err) throw err;});
			};
		}
		mkdir.description = "ディレクトリ作成";
		mkdir.usage = "mkdir DIRNAME";

//コマンドラインリストへ登録
		if (nas.HTML.Console){
			(['ls','cd','chdir','pwd','mkdir']).forEach(function(e){
				nas.HTML.Console.prototype.constructor.comlist[e]={
					"command":e,
				};
				if(typeof global != 'undefined'){
					if(global[e].usage)
						nas.HTML.Console.prototype.constructor.comlist[e]["usage"] = global[e].usage
					if(global[e].description)
						nas.HTML.Console.prototype.constructor.comlist[e]["description"] = global[e].description;
				}else{
					if(window[e].usage)
						nas.HTML.Console.prototype.constructor.comlist[e]["usage"] = window[e].usage
					if(window[e].description)
						nas.HTML.Console.prototype.constructor.comlist[e]["description"] = window[e].description;
				};
			});
		}
	}
console.log('load nodeJs');
};//with Node.js

