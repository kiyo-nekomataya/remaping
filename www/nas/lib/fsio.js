/*                   --------- fsIo.js
	Adobe AIR(AS)|Adobe Extend Script	← .platform
	Node.js	true|false
	WebAPI	true|false

nas.Fileオブジェクト
プラットフォーム間の差異を吸収して統一アクセスを提供するための代表オブジェクト
データエントリをファイル（アドレス=パス）単位でオブジェクト化して保持する
実際のアクセスへの橋渡しを行う

最下層
	データ記録エントリー保持用のオブジェクト(nas.File)
	状況によりコンテンツキャッシュを持てる(アクセス前はカラ)
	
	node.js,AdobeES 等のファイルアクセスを提供可能な環境の場合ファイルエントリーに対する読み書きのアクセスを提供
	HTML FileAPIを使用するケースでは、Blobを提供 上記の機能はBlob互換にして同じアクセスを提供できるようにする
アプリケーション層
	remaping(総合システム),xpsEditor,xMapBrowser,pman,storyboardEditor 等々のアプリケーションレベルのインターフェース
	エントリを指定しての読み書きが出来る対ファイルシステムへのアクセスを提供 リポジトリに対するインターフェースを提供？


	CEP|electron|AdobeES 等のGUI環境下ではファイルチューザーダイアログサービスを提供

	CEPでNode.js有効仕様の時はNode.jsのアクセスを使用する
	
	Adobe AIRは基本的にサポート対象から外す
	
	旧来の機能は後方互換のため残す

このソースでは、nas.Fileオブジェクトを初期化する
グローバルの Folderオブジェクトは  Adobe ES互換
fileBox > 

nas.File
	blobを持てる
	

grobal Folder
	AdobeES互換>なければ作る
	nas.Folderを作ってアタッチする
	
showFiles
ioErrorHandler
list
mkdir

	basic command
	コマンドラインより基礎的なレベルの関数を作って共用する
ディレクトリリスト関数
移動（ディレクトリ変更）
カレントディレクトリ

フォルダ作成
フォルダ削除

ファイル削除

	コマンドラインアプリケーションをのせる
	GUIアプリケーションをさらに上にのせる
	
function Blog (contentArray,props){
	
}
Blog.prototype.size
Blog.prototype.type
Blog.prototype.arrayBuffer = function(){};
Blog.prototype.slice = function(){};
Blog.prototype.text = function(){};
*/
'use strict';
/*=======================================*/
if(typeof nas == 'undefined') var nas = require('./nas_common');
;
if(typeof config == 'undefined')  var require('./nas_config.js')
if(typeof appHost == 'undefined') var require('./appHost.js')
/*
	ローカルファイルシステムへのアクセス可否を最初にチェックしてフラグをたてる
	Node.js|ESTK|AIR環境があればローカルファイルシステムのアクセス可能
*/
//初期化
	var electron = false;
	var remote   = false;
	var fs       = false;
	var path     = false;
	var iconv    = false;
	var dialog   = false;
	console.log("has no electron");

//WEBで擬似的に利用可能な機能を提供・不能な機能にはダミー関数で警告を出す
/**
 * nas.File
 * ファイルハンドルオブジェクト
 * ファイルハンドルはプラットフォーム毎に実装されるファイルオブジェクトのエージェントとして機能する
 * AIR/Adobe 拡張スクリプト/html5 File/Node.js/
 * 今回はファイル名から拡張子切り分け（=最後の'.'で文字列をセパレート）のみの実装で済ませる
 * ファイル名本体に空文字列を認めていない
 * .git 等は　ファイル名　".git"   拡張子　なし　となる
 * 拡張子なしのドットファイルの扱いに注意
 *    これは保留　今回はHTML5のFileオブジェクトを直接扱う　AIRは保留
 */
/** @class 
 *	nas.File
 *	Fileハンドリング用オブジェクト
 *	パスを配列で持つ
 *	標準的にはURI形式で返す
 *	各種形式変換メソッドあり
 *	初期化の際に与えられた引数が相対パスだった場合は、コンストラクタのカレントで補う
 *	
 *	[0-9a-z\-\+]+://
 *	独自スキームとして localStorage:を設定
 * 
 */
nas.File = function(myURI,baseURI,blob,stat){
    this.scheme      = "file:";
	this.baseURI     = "";
	this.body        = [];
	this.currentDir  = "/";
	this.fullName    = "";//this.currentDir+this.body.join("/");
	this.fsName      = "";//(appHost.os=="Win")? this.fullName.replace(/\//g,"\\"):this.fullName;
	this.name        = "";
//	this.body[this.body.length-1] ;
	this.blob        = (blob)? new Blob(blob,options) : null ;
    this.stat        = (stat)? stat : null ;
    if(arguments.length)
        this.parse(arguments[0],arguments[1],arguments[2],arguments[3]);
};
/*
    File arguments parser
*/
nas.File.prototype.parse = function(uri,baseUri,blob,stat){
    if(typeof baseUri == 'undefined') baseUri = "";
    this.baseURI = baseUri;
	if((! uri)||(typeof uri == 'undefined')) uri="/";
//uri形式のスキーム部分を分離する
    if(uri.match(/^([a-z]+\:)\/\/(.+)$/i)){
        this.scheme = RegExp.$1;
        uri         = RegExp.$2;
    }else{
        this.scheme  = "file:";
    }
	if(uri.match(/\\/)) uri = uri.replace(/\\/g,"/");//windowsパスでも初期化可能に
	this.body        = uri.split("/");
	if(this.body[0]=="") this.body = this.body.slice(1);
	this.fullName    = this.currentDir+this.body.join("/");
	this.fsName      = (appHost.os=="Win")? this.fullName.replace(/\//g,"\\"):this.fullName;
	this.name        = this.body[this.body.length-1] ;
};

nas.File.prototype.isDirectry = function(){
	if(! appHost.fileAccess) return undefined;
	if(appHost.ESTK) {}
}

/** ユーティリティー関数
 * nas.File.divideExtension(filename)
 *  @params {String} filename
 *          文字列 拡張子付きファイル名
 *  @returns {Array}
 *      戻値:配列[拡張子,ファイル名本体]
 *      [file-extension,name-body]
 */
nas.File.divideExtension = function(filename){
    filename=String(filename);
        var nameBody=filename;
        var nameExtension ='';
    if(filename.match(/^(.+)\.([^\.]*)$/)){
        nameExtension   =RegExp.$2;
        nameBody        =RegExp.$1;
    };
    return [nameExtension,nameBody];
};

if(appHost.Nodejs){

	var fs       = require('fs-extra');
	var path     = require('path');
	var iconv    = require("iconv-lite");
	if(typeof navigator != 'undefined'){
		var electron = require('electron');
		var remote   = electron.remote;
		var { BrowserWindow, dialog } = remote;
		var { Menu, MenuItem }   = remote;
console.log('setup for Node.js with electron');
	}else{
console.log('setup for Node.js without electron');
	};
//参照用オブジェクトを作成
	if(typeof Folder == 'undefined') var Folder = {};
	Folder.nas=(appHost.os=="Win")?
		new nas.File(process.env["USERPROFILE"]+'/AppData/Roaming/nas'):
		new nas.File(process.env["HOME"]+'/Library/Application%20Support/nas');
	Folder.script=(appHost.os=="Win")?
		new nas.File(process.env["USERPROFILE"]+'/AppData/Roaming/nas/scripts'):
		new nas.File(process.env["HOME"]+'/Library/Application%20Support/nas');
	Folder.current = new nas.File(process.cwd());//アプリケーションカレントディレクトリ





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
		fileBox.defaultDir = process.cwd();//アプリケーションホーム
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
		var myAction   = (xUI.checkStored)? xUI.checkStored("saveAndOpen"):null;
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
	fileBox.saveAs=function (){
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
	};
/**
 * Opens and saves a file with the data in the mainText textArea element. 
 * Newline (\n) characters in the text are replaced with the 
 * platform-specific line ending character (File.lineEnding), which is the 
 * line-feed character on Mac OS and the carriage return character followed by the 
 * line-feed character on Windows.
 */
	fileBox.saveFile=function (){
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
	fileBox.saveAsExtsnSelectHandler=function (target){
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
	var templateMenu = [{
        label: 'Edit',
        submenu: [
            {
                role: 'undo',
            },
            {
                role: 'redo',
            },
        ]
    },{
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
    }];
//var menu = mne.buildFromTemplate(templateMenu);
//mne.setApplicationMenu(menu);
/*
	テスト・node.js慣熟を兼ねた作業用関数
*/
/**
 *	@params	{String}	target_path
 *	@params	{String}	form
 *		short|long|
 *	@params {String}	mode
 *		fs|pmdb
 *	@params {String}	filter
 *		default|all|(regex)|
 *	@returns	{String}
 */
	var list = function(target_path,mode,form,filter){
		if(! mode) mode = 'fs';
		if(! form) form = 'JSON';
		if(! target_path) target_path = "./";
		var result=[];
		var entries = fs.readdirSync(target_path,{withFileTypes:true});
		for (var ix = 0 ; ix < entries.length ; ix ++){
			if(entries[ix].isDirectory()){
			
				result.push(decodeURIComponent(entries[ix].name) + "\t[dir]");
			}else if (entries[ix].isFile()){
				result.push(decodeURIComponent(entries[ix].name));
			}
		}
		return result.join('\n');
	}
	var cd = function(wd){
		if(wd) process.chdir(wd);
		return process.cwd();
	}
	var chdir = cd;
	var pwd   = cd;
/**
 *	@params	{String}	target_path
 *	@returns	{String}	
 */
	var mkdir = function (target_path){
		if((! target_path)||(fs.existsSync(target_path))) throw target_path;
		fs.mkdir(target_path,function(err){if(err) throw err;});
	}
	console.log('load nodeJs');//with Node.js
}else if(appHost.ESTK){
//nodeの使用できないESTKの環境でも同様の機能を提供する	

//参照用オブジェクトを作成
	Folder.nas=(appHost.os=="Win")?
		new nas.File(process.env["USERPROFILE"]+'/AppData/Roaming/nas'):
		new nas.File(process.env["HOME"]+'/Library/Application%20Support/nas');
	Folder.script=(appHost.os=="Win")?
		new nas.File(process.env["USERPROFILE"]+'/AppData/Roaming/nas/scripts'):
		new nas.File(process.env["HOME"]+'/Library/Application%20Support/nas');
	Folder.current = new nas.File(process.cwd());//アプリケーションカレントディレクトリ


//File
//nas.File.divideExtension

}else{
}
/*
	WEBストレージをチェックする
	これは存在しない環境（AES|AIR|Node-console）の場合、ローカルファイルシステムを使用できるケースなので ローカルファイルシステムで代用を行う-メソッド互換
*/
/*=======================================*/
if((typeof window == 'undefined')&&(typeof app == 'undefined'))
	module.exports = nas;