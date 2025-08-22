/**	
 *	@fileOverview
 *	<pre>メニュー関連オブジェクト
 *	nas.MenuItem
 *	nas.MenuItemCollection
 *  nas.menuitems
 *	</pre>
 */
'use strict';
/*=======================================*/
// load order:10
/*=======================================*/
if ((typeof config != 'object')||(config.on_cjs)){
    var config  = require('./nas_common').config;
    var appHost = require('./nas_common').appHost;
    var nas     = require('./nas_locale').nas;
const i18next           = require('i18next');
const jqueryI18next     = require('jquery-i18next');
const iconv             = require('iconv-lite');
const i18nextXHRBackend = require('i18next-xhr-backend');

};

if (typeof nas == "undefined")     var nas = {};
if (typeof i18next == 'undefined') var i18next = null;

/*
        id         :{Number}
            コマンドID 整数 セッションユニーク
            コレクション（親配列）IDをそのまま使用する　読み込みのたびに変化する可能性あり
        type       :{String}
            "window"|"submenu"|"command"|"normal"|"separator"|"checkbox"|"radio"|"selector"|"button"|"text"|"url-"|"URL-"|"file-"|"FILE-"|"url"|"URL"|"file"|"FILE"|"openEx"
            カテゴリプロパティ window|command または後述のtype文字列
            "window"    サブコマンドを持ったウインドウまたはパネルを開く
            "submenu"   ウインドウ内サブメニュー
            "command"   単独で機能を実行する same as "normal"
            "separator" 機能を持たないメニュー類の区切りアイテム ルックプロパティを持つ
            プロパティに従った外観と動作となる 
            default:"normal"
            "separator"を設定すると他のプロパティはすべて無効になる
            selector|button|textはelectronと互換がない
            selectorは、選択する値リストまたはリストを出力する関数が必要
            func プロパティに現在選択している値が引き渡される
            url|file は指定のurlまたはパスを別ウインドウで開く(メインプロセス処理)
            URL|FILE は指定のurlまたはパスを同ウインドウで開く(メインプロセス処理)
            url-|file- は指定のurlまたはパスを別ウインドウで開く(ブラウザプロセス処理)
            URL-|FILE- は指定のurlまたはパスを同ウインドウで開く(ブラウザプロセス処理)

            Url|File に引数を渡す場合は

            openEx は指定のurlまたはパスをシステムで開く
        platform    :{String}   使用環境制限
            ""(all)|"win"|"mac"|"unix"|"WEB"|"NODE"|"Electron"|"CEP"|"ESTK" 論理演算子・否定子をつけることができる eg.!mac && unix
        app         :{String}   適用アプリケーション文字列
            ""(all)|"remaping"|"pman"|"xpsedit"|"sbdeditor"|... 
        key         :{String}
            コマンドアイテムキー文字列
            eg. "edit"
            ASCIIコード範囲内に限定する DB内でユニーク
            特定のウインドウのサブコマンドである場合は
            親となるウィンドウのキーをプレフィックスとして共有する場合がある
            eg. "window-copy"
        label      :{String}
            ラベル（表示するものがない場合は自由）非ユニーク
            多言語化キーとして使用する
        role       :{String}
            役割文字列 値がなくても良い (定形メニューをコールできる)
            定義はコマンドアイテム上の他のエントリを指す
            ラベルを持っている・ファンクションを持っている
            electron互換ライブラリが必要
        checked    :{Boolean|String}
            チェックボックス・ラジオボタンのみに有効なプロパティ初期値を与える
        func       :{Function|String}
            ロール文字列またはファンクション文字列
            ロールがない場合にファンクションを与える ロールを上書きする
            文字列はダブルクオート囲みでHTML内に配置される
            ファンクションは1ライナー限定とする
            コレクション内では文字列のまま保持して必要時に /^function|=>/ を評価する
        hotkey     :{String or keycode}
            //[CmdOrCtrl],[Ctrl],[Cmd],[Option],[AltGr],[Alt],[Shift],[Meta],[Super]
            //[Space],[Enter],[Return],[Insert],[Delete],[Backspace],[Tab],
            //[Esc],[Caps],[Up],[Down],[Left],[Right]...
            //[A],[B]...|[F1],[F2]
            ブラケットで囲んだ文字がそのキーを表す
            キー表記はElectron互換
            eg.[]
            同時押しは",(コンマ)"区切りで併記
            eg[Shift],[Ctrl],[A]
        region     :{String}
            コンテキストメニューの領域指定文字列
            イベント発生エレメントのIDと比較される
            複数指定可能 比較演算子を使用可能
        icon       :{String}
            アイコンイメージ cssClassName
            なくともよい あればimageに優先して使用される
        image      :{String}
            画像を使用する場合のパス
        submenu    :{Arrray of key}
            サブメニュー配列に要素が存在すればそれがサブメニューの内容になる typeに優先する
        description:{String}
            メニューに付随するショートヘルプメッセージ
        note        :{String}
            コメント 解説 翻訳対象外
 */
/*コンストラクタ*/
nas.MenuItem = function(menuDescription){
	this.id         = 0;
	this.type       = "normal";
	this.platform   = "";
	this.app        = "";
	this.key        = "";
	this.label      = "";
	this.role       = "";
	this.checkd     = "";
	this.func       = "";
	this.hotkey     = "";
	this.region     = "";
	this.icon       = "";
	this.image      = "";
	this.submenu    = [];
	this.description= "";
	this.note       = "";

	if(menuDescription) this.parse(menuDescription);
	if(!this.key) this.key = null;
}
/** 
 *    @params {String}    form
 *        出力形式    JSON|dump|text
 *        保存出力   
 */
nas.MenuItem.prototype.toString = function(form){
    if(! form) form = 'text';
    if(form == 'JSON'){
        var result ={
            id    :this.id,
            type  :this.type,
            key   :this.key
        };
        if(this.platform)       result.platform    = this.platform;
        if(this.app)            result.app         = this.app;
        if(this.label)          result.label       = this.label;
        if(this.role)           result.role        = this.role;
        if(this.checked)        result.checked     = this.checked;
        if(this.func)           result.func        = this.func;
        if(this.hotkey)         result.hotkey      = this.hotkey;
        if(this.region)         result.region      = this.region;
        if(this.icon)           result.icon        = this.icon;
        if(this.image)          result.image       = this.image;
        if(this.submenu.length) result.submenu     = this.submenu;
        if(this.description)    result.description = this.description;
        if(this.note)           result.note        = this.note;
        return JSON.stringify(this,false,2);
    }else if (form == 'dump'){
        var result = [
            this.id,
            this.type,
            ((this.platform)?this.platform:""),
            ((this.app)?this.app:""),
            this.key,
            ((this.label)?this.label:""),
            ((this.role)?this.role:""),
            ((this.checked)?this.checked:""),
            ((this.func)?this.func:""),
            ((this.hotkey)?this.hotkey:""),
            ((this.region)?this.region:""),
            ((this.icon)?this.icon:""),
            ((this.image)?this.image:""),
            this.submenu,
            ((this.description)?this.description:""),
            ((this.note)?this.note:"")
        ];
        return JSON.stringify(result,false,2);
    }else{
/*eg
181
	type      :command
	platform  :
	app       :stopWatch
	key       :eraseMark
	label     :stopWatch-eraceMark
	func      :function(){console.log(123)}
	hotkey    :[E]
	region    :
	icon      :eraser
	submanu   :[]
	descripion:マーク消去
	note      :マーク消去
*/
        var result = "";
        result += this.id + "\n";
        result += "\ttype:"        + this.type               + "\n";
        result += "\tkey:"         + this.key                + "\n";
        if(this.platform)
        result += "\tplatform:"    + this.platform           + "\n";
        if(this.app)
        result += "\tapp:"         + this.app                + "\n";
        if(this.label)
        result += "\tlabel:"       + this.label              + "\n";
        if(this.role)
        result += "\trole:"        + this.role               + "\n";
        if(this.checked)
        result += "\tchecked:"     + this.checked            + "\n";
        if(this.func){
            if(this.func instanceof Array){
                result += "\tfunc:"+ JSON.stringify(this.func) + "\n";
            }else{
                result += "\tfunc:"+ this.func                 + "\n";
            };
        };
        if(this.hotkey)
        result += "\thotkey:"      + this.hotkey             + "\n";
        if(this.region)
        result += "\tregion:"      + this.region             + "\n";
        if(this.icon)
        result += "\ticon:"        + this.icon               + "\n";
        if(this.submenu.length)
        result += "\tsubmenu:"     + this.submenu.toString() + "\n";
        if(this.description)
        result += "\tdescription:" + this.description        + "\n";
        if(this.note)
        result += "\tnote:"        + this.note               + "\n";
        return result;
    };
}
/** 
 *    @params {String}    description
 *        形式    JSON|dump|text 自動判別
 */
nas.MenuItem.prototype.parse = function(itemDescription){
    var form = 'text';
    if(itemDescription.match(/^\s*\{\s*\"id\"/)){
        form = 'JSON';
    }else if(itemDescription.match(/^\s*\[[^\[\]]+\]/)){
        form = 'dump';
    };
//console.log(form);
    if(form == 'JSON'){
        var tempData = JSON.parse(itemDescription);
        this.id         = tempData.id;
        this.type       = tempData.type;
        this.key        = tempData.key;
        if(tempData.platform)    this.platform   = tempData.platform;
        if(tempData.app)         this.app        = tempData.app;
        if(tempData.label)       this.label      = tempData.label;
        if(tempData.role)        this.role       = tempData.role;
        if(tempData.checked)     this.checked    = tempData.checked;
        if(tempData.func)        this.func       = tempData.func;
        if(tempData.hotkey)      this.hotkey     = tempData.hotkey;
        if(tempData.region)      this.region     = tempData.region;
        if(tempData.icon)        this.icon       = tempData.icon;
        if(tempData.image)       this.image      = tempData.image;
        if(tempData.submenu)     this.submenu    = tempData.submenu;
        if(tempData.description) this.description= tempData.description;
        if(tempData.note)        this.note       = tempData.note;
    }else if(form == 'dump'){
        var tempData = JSON.parse(itemDescription);
        this.id         = tempData[0];
        this.type       = tempData[1];
        this.platform   = tempData[2];
        this.app        = tempData[3];
        this.key        = tempData[4];
        this.label      = tempData[5];
        this.role       = tempData[6];
        this.checked    = tempData[7];
        this.func       = tempData[8];
        this.hotkey     = tempData[9];
        this.region     = tempData[10];
        this.icon       = tempData[11];
        this.image      = tempData[12];
        this.submenu    = tempData[13];
        this.description= tempData[14];
        this.note       = tempData[15];
    }else{
        var tempArray = itemDescription.split('\n');
        for(var i = 0; i < tempArray.length; i++){
            if(tempArray[i].match(/^\d/)){
                this.id = parseInt(tempArray[i]);
            }else if(tempArray[i].match(/^\t([^:]+):(.*)\s*$/)){
                var prop    = (RegExp.$1).trim();
                var content = (RegExp.$2).trim();
                if(prop == 'submenu'){
                    content = content.split(',');
                }else if(prop == 'func'){
                    if(content.match(/^\[.*\]$|^\{.*\}$/)){
//console.log(content);
                        content = JSON.parse(content);
                    }else if(content.match(/^menu\,.*/)){
                        content = content.split(',');
                    };
                };
                this[prop] = content;
            };
        };
    };
}

/**
 *	@params	{String}	target electron|WEB|CONTEXT
 *	
 *	ターゲット形式は 
 *	electron|
 *		electron menu item template(Object)
 *	WEB
 *		HTMLプルダウンメニュ＝ソース
 *	CONTEXT
 *		HTMLコンテキストメニューソース
 *	ICON
 *		HTMLアイコンボタンメニューソース
 アイテム側に環境依存コードをのせると良くないのでHTML生成 アイテムテンプレート等のUIメニューアイテムのコンバートは個々のオブジェクト側に移行する

 WEB( pM cM ibM )> xUI.menuItemConvert(menuItems)
 Electron(アプリケーションメニュー) > main.js.menuConvert
 
 この関数は廃棄
 */
nas.MenuItem.prototype.convert = function(target){
console.log(target);
}
/**
 *	@params	{Array}	menuList
 *	@params	{Object nas.MenuItemCollection}	itemCollection
 *
 *	メニューリストとアイテムコレクションを指定して新しいアイテムコレクションを返す
 *		
 */
nas.MenuItem.menuMap = function(menuList,itemCollection){
    if(!(menuList instanceof Array)) menuList = nas.MenuItem.parseMenuMapSource(menuList);
	if((!(menuList instanceof Array))||(menuList.length == 0)) return false;
	var result = new nas.MenuItemCollection();
	var currentItem = null;
	for (var i = 0 ; i < menuList.length;i ++){
		if(menuList[i][0]){
			currentItem = itemCollection.get(menuList[i][0]);
			result.add(currentItem);
		}else{
			var subItem = itemCollection.get(menuList[i][1]);
			if((currentItem)&&(subItem)) result.add(subItem);
		};
	};
	if(result.length == 0) return false;
	return result;
}
/**
 *	@params	{Array}	menuList
 *	@params	{Boolean}	mode
 *	@params	{Object nas.MenuItemCollection}	itemCollection
 *
 *	メニューリストとアイテムコレクションを指定して新しいアイテムコレクションを返す
 *	メニューリストソースの書式は以下

<window|sumbenu key>
    <menucommand-key>
セパレータ文字列として連続する+-=を使用可能

[ブラケット]行・行頭の"#,//"・空行・Cスタイルのブロックコメント
を解釈する

eg
applicationMenu
	about
	========
	services
	========
	hide
	hideothers
	unhide
	--------
	quit
キーワード"openWithExternalTool"を受けた場合、これに連続して現在のアプリケーションDBから
メニューアイテムを作成して直後のソースに派生メニューを追加する
 */
nas.MenuItem.parseMenuMapSource = function(listSource,mode){
    var tempData = listSource.trim().split('\n');
    var result = [];
    var escapeRead = false;
    for (var i = 0; i < tempData.length; i++){
        var lineData = tempData[i];
        if(escapeRead){
            if(lineData.match(/.*\*\/(.*)/)){
                lineData   = RegExp.$1;
                escapeRead = false;
            }else{
                continue;
            };
        }else if(lineData.match(/(\/\*)?.*\*\/(.*)/)){
            lineData   = RegExp.$2;
            escapeRead = false;
        };
        if(lineData.match(/^\/\*/)){
            escapeRead = true;
            continue;
        };
        if(lineData == '[end]'){
            break;
        } else if(lineData.match(/^\s*$|^\#|^\/\/|^\[.+\]\s*$/)){
//空行とコメント行をスキップ
            continue;
        } else if(lineData.match(/^\t(.*)\s*$/)){
            result.push(((mode)?
                lineData.replace(/[\=\-\+]+/ ,'separator').trim():
                ['',lineData.replace(/[\=\-\+]+/ ,'separator').trim()])
            );
        } else {
            result.push(((mode)? 
                lineData.trim():[lineData.trim()])
            );
        };
    };
    return result;
}
/**
 *	@params	{String}	platform
 *	@returns	{Boolean}
 *
 *(all)|win|mac|unix|WEB|CEP|ESTK|NODE|Electron| 論理演算子・否定子をつけることができる eg.!mac && unix
 *		プラットホーム文字列を評価してマッチ状態を返す
 */
nas.MenuItem.chkPlatform = function(platform){
    if(!platform) return true;
    platform = "var mac=(appHost.os=='Mac')?true:false;var win=(appHost.os=='Win')?true:false;var unix=(appHost.os=='Other')?true:false;var WEB=(typeof Navigator =='function')?true:false;var CEP=(appHost.platform=='CEP')?true:false;var ESTK=(appHost.ESTK)?true:false;var NODE=(appHost.Nodejs)?true:false;var Electron=(appHost.platform=='Electron')?true:false;(" +platform +')? true:false;'
    return eval(platform);
}
/*
 *    アイテムコレクションコンストラクタ
 *    メソッド
 *        add         配列の拡張メソッドをそのまま使う
 *        convert     アイテムコレクションからケース別表示データにコンバート（廃止予定）
 *        get         コレクション内をキーワードで検索してアイテムを戻す
 *        getItems    アイテムリストに従って現在のコレクションから新しいコレクション抽出して返す
 *        remove      キーワードで削除
 *        dump        text|JSON|dump 保存データ書出用
 *        parseConfig configration   保存データ読出用
 *        
 */
nas.MenuItemCollection = function MenuItemCollection(){
//    this.valueOf = function(){return this;}
/**
 *	@params	{String}	target electron|WEB|CONTEXT
 *	
 *	メニューデータを画面表示用にコンバートする
 *	ターゲット形式は 
 *	electron|
 *		electron menu item template(Object)
 *	WEB
 *		HTMLプルダウンメニュ＝ソース
 *	CONTEXT
 *		HTMLコンテキストメニューソース
 *	ICON
 *		HTMLアイコンボタンメニューソース
 */
	this.convert = function(target){
//エレクトロン用にオブジェクトで返す
		if(target == 'electron'){
			var result = [];
			var currentGroup = null;
			for(var e = 0 ; e < this.length ; e ++){
				if((this[e].platform)&&(! nas.MenuItem.chkPlatform(this[e].platform))) continue;
				if((this[e].type == 'window')||(this[e].type == 'submenu')){
if(currentGroup) console.log(currentGroup);
					currentGroup = this[e].convert(target);
					if(currentGroup) result.push(currentGroup);
				}else{
					if(currentGroup){
					    currentGroup.submenu.push(this[e].convert(target));
					};
				};
			};
			if(currentGroup) result.push(currentGroup);
console.log(currentGroup);
			return result;
		};
//WEB|CONTEXTの内容はほぼ同一
//メニューに表示するテキストは、優先順に ラベル>ロール>キー 最低でもキー文字列が存在する i18n設定をする
		var result     = "";
		var idPrefix = (target == 'ICON')? 'ibC':((target == 'WEB')? 'pM':'cM');
		var currentGroup = false;
		if(target == 'ICON'){
			result += '<span id="ibCP_" class=ibCP>';
			for(var e = 0 ; e < this.length ; e ++){
				if(! nas.MenuItem.chkPlatform(this[e].platform)) continue;
				if((this[e].type == 'window')||(this[e].type == 'submenu')){
					if(currentGroup) result += '</span>';//グループ処理中は閉じる
					result += this[e].convert(target);
					result += '<span id="ibCP_'+nas.Zf(e,2)+'" class=ibCP>';
					currentGroup = true;//グループ処理開始
				}else{
					this[e].convert(target);
				};
			};
			result += '</span> </span>';
		}else{
			result += '<ul id='+idPrefix+'enu_>';
			for(var e = 0 ; e < this.length ; e ++){
				if(! nas.MenuItem.chkPlatform(this[e].platform)) continue;
				if((this[e].type == 'window')||(this[e].type == 'submenu')){
					if(currentGroup) result += '</ul>';//グループ処理中は閉じる
					result += this[e].convert(target);
					result += '<ul>';
					currentGroup = true;//グループ処理開始
				}else{
					this[e].convert(target);
				};
			};
			result += '</ul> </ul>';
		};
		return result;
	};
/**
 *   @params {String}    kwd
 *   @returns {Object MenuItem}
    キーワードでアイテムを戻す
    id,key,labelの順に比較して一致していれば戻す
    存在しない場合は undefinedが戻る
*/
    this.get = function(kwd){
        return this.find(function(elm){return ((elm.id == kwd)||(elm.key == kwd))});
    }
/**
 *   @params {String}    kwds
 *   @returns {Array}
 *   id|keyの配列を指定して新たなメニューアイテムコレクションを返す
    []
 *   引数が単独の場合はキーワードのアイテムのみを含むコレクションを返す
 *   引数キーワード内にサブメニューアイテムが含まれていても展開はしない（再帰しない）
    引数
 *   指定一致のない場合は空のコレクション配列が戻る
 */
    this.getItems = function(menuList){
		if(! (menuList instanceof Array))
			menuList = nas.MenuItem.parseMenuMapSource(menuList);
//console.log(menuList);
		if((!(menuList instanceof Array))||(menuList.length == 0)) return result;
		var result = new nas.MenuItemCollection();
		var currentItem = null;
		for (var i = 0 ; i < menuList.length;i ++){
			if(menuList[i][0]){
				currentItem = this.get(menuList[i][0]);
				if(currentItem) result.add(currentItem);
			}else{
				var subItem = this.get(menuList[i][1]);
				if((currentItem)&&(subItem)) result.add(subItem);
			};
		};
		return result;
	};
/**
 *   @params {String}    kwd
 *   キーワードを指定してリムーブ
 *   サブメニューであった場合は配下のサブメニューコマンドをすべてリムーブする
 */
    this.remove = function(kwd){
        if(! kwd) return false;
        var itmset  = [];
        for (var i = (this.length-1) ; i >= 0 ; i --){
            if((this[i].key == kwd)||(this[i].key.indexOf(kwd+'-') == 0))
                itmset.push(i);
        };
        if(itmset.length){
            for (var r = 0 ; r < itmset.length ; r ++){
                this.slice()            };
        };
    }

/**
 *  @params {String}    form
 *  出力フォーマット JSON|dump|text
 */
    this.dump = function(form){
        if(! form) form = 'text';
        if(form == 'JSON'){
            var result = [];
            for (var i = 0 ; i < this.length ; i ++){
                result.push(JSON.parse(this[i].toString('JSON')));
            };
            return JSON.stringify(result,arguments[1],arguments[2]);
        }else if(form == 'dump'){
            var result = [];
            for (var i = 0 ; i < this.length ; i ++){
                result.push(JSON.parse(this[i].toString('dump')));
            };
            return JSON.stringify(result,arguments[1],arguments[2]);
        }else{
            var result = '';
            for (var i = 0 ; i < this.length ; i ++){
                result += this[i].toString('text');
            };
            return result;
        };
    };
/**
 *  @params {String}    configration
 *  入力ストリームを解析してコレクションを設定する
 *  呼び出しの際にコレクションをクリアするので注意
 */
    this.parseConfig = function(configration){
        if(! configration) return false
        this.length = 0;
        var form = 'text';
        if(configration.match(/^\s*\[\s*\{\s*\"id\"/)){
            form = 'JSON';
        }else if(configration.match(/^\s*\[\s*[^\[\]]+\]/)){
            form = 'dump';
        };
        if((form == 'JSON')||(form == 'dump')){
            var tempData = JSON.parse(configration);
            for (var i = 0; i < tempData.length; i++){
                var currentItem = new nas.MenuItem(JSON.stringify(tempData[i]));
//console.log(currentItem);
                this.add(
                    currentItem,
                    function(tgt,dst){
                        return (tgt.key == dst.key);
                    }
                );
            };
        }else{
//parse as text
/*
[ブラケット]行・行頭の"#,//"・空行・Cスタイルのブロックコメント
を解釈する
 */
            var tempData = configration.split('\n');
            var currentConfig = [];
            var escapeRead = false;
            for (var i = 0; i < tempData.length; i++){
                var lineData = tempData[i];
                if(escapeRead){
                    if(lineData.match(/\*\/(.*)/)){
                        lineData = RegExp.$1;
                        escapeRead = false;
                    }else{
                        continue;
                    }
                }else if(lineData.match(/(\/\*)?.*\*\/(.*)/)){
                    lineData   = RegExp.$2;
                    escapeRead = false;
                };
                if(lineData.match(/^\/\*/)){
                    escapeRead = true;
                    continue;
                };
                if(lineData.match(/^\s*$|^\#|^\/\//)){
//空行とコメント行をスキップ
                    continue
                } else if(lineData.match(/^\d+\s*$/)){
//整数id開始行
                    if(currentConfig.length){

                        var currentItem = new nas.MenuItem(currentConfig.join('\n'));
                        if(currentItem.key == 'openWithExternalTool'){
console.log(currentItem.key+' : EXTENSION!!')
/*
	外部アプリケーション呼び出しメニューアイテムを作成して追加する
*/
                            for(var ap in config.extApps.members){
                                var extAp = config.extApps.members[ap]
                                var mItem = new nas.MenuItem(currentConfig.join('\n').replace(/\%name\%/g,extAp.name));//.replace(/\%ap\%/,ap)
                                mItem.key         = currentItem.key + ap;//連結キーで上書き
                                if(extAp.label)       mItem.label       = extAp.label;
                                if(extAp.hotkey)      mItem.hotkey      = extAp.hotkey;
                                if(extAp.description) mItem.description = extAp.description;
                                if(extAp.note)        mItem.note        = extAp.note;
                                if(extAp.icon)        mItem.icon        = extAp.icon;
                                this.add(mItem,function(tgt,dst){return (tgt.key == dst.key);});	
                            };
                        }else{

                            var x = this.add(currentItem,function(tgt,dst){return (tgt.key == dst.key);});
                        };
                    };
                    currentConfig = [lineData];//バッファクリア
                }else{
                    currentConfig.push(lineData);
                };
            };
//最終アイテムのみメンバー追加されないので仮にここで追加を行う　終了のための捨てIDを置けば以下のコードは不要となる
            if(currentConfig.length){
//                var currentItem = new nas.MenuItem(currentConfig.join('\n'));
//                this.add(currentItem,function(tgt,dst){return (tgt.key == dst.key);});
            }else{
console.log('======================= end menu configuration items : '+this.length );
            };
        };
        for (var i = 0 ; i < this.length ; i ++) this[i].id = i;
        return this;
    };
}
//Arrayクラスをそのまま使用
nas.MenuItemCollection.prototype = Array.prototype;

//空のベースコレクションを設定
nas.menuItems = new nas.MenuItemCollection();
nas.applicationMenuList = [];
nas.contextMenuList     = [];
nas.iconBarMenuList     = [];
/*=======================================*/
if ((typeof config == 'object')&&(config.on_cjs)){
    exports.nas  = nas;
};