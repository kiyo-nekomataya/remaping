/**
 * @fileoverview レンダー乙女ライブラリ
 *
 * 乙女がとりついて色々とオーバーライドしたり働きます。
 * レンダー乙女ライブラリ
 */
/**
 * @namespace nas.otome
 */
nas.otome = {};
/** @contant */
var moduleName = "otomeLib";
/** @contant */
var myFilename = ("$RCSfile: nas_OtomeLib.js,v $").split(":")[1].split(",")[0];
/** @contant */
var myFilerevision = ("$Revision: 1.2 $").split(":")[1].split("$")[0];

if (nas.Version) {
    nas.Version[moduleName] = moduleName + " :" + myFilename + " :" + myFilerevision;
}
/*
 * 識別
 * 作業用プロパティ
 */
//	otome="possessed";//とりついてます

//============================================================ 乙女とりつきプロパティ

/**
 * システムオブジェクトに取り付いてイロイロ拡張プロパティを貼り付けます。
 */
//Folder.nas=(System.osName.match(/Windows/))?
//	new Folder(Folder.startup.fsName+"\\Scripts\\nas"):
//	new Folder(Folder.startup.fsName+"/Scripts/nas");
Folder.nas = nas.baseLocation;

if (appHost.os != 'Mac') {
    Folder.scripts = Folder(Folder.startup.path.toString() + "/" + Folder.startup.name.toString() + "/Scripts");
    File.currentApp = File(Folder.startup.path.toString() + "/AfterFX.exe");//Windows
} else {
    if (app.version.split(".")[0] < 8) {
        Folder.scripts = Folder(Folder.startup.parent.parent.parent.path.toString() + "/Scripts");
    } else {
        Folder.scripts = Folder(Folder.startup.parent.parent.path.toString() + "/Scripts");//AE8
    }
    File.currentApp = File(Folder.startup.path.toString() + "/AfterFX");//MacOSX
}
/**
 *  Adobe CC用　ユーザスクリプトパス設定
 */
/**
 *Folder.userScriptは、AE12.2以上のバージョンで利用可能
 */
	if (appHost.version < 12.2) {
        Folder.userScript=false;
	} else {
        if(appHost.os=="Win") {
            Folder.userScript=new Folder(Folder.userData.fullName+"/Adobe/After Effects/"+appHost.version+"/");
        }else{
            Folder.userScript=new Folder(Folder.userData.parent.fullName+"/Preferences/Adobe/After Effects/"+appHost.version+"/");
        }
    }
//*====================================================乙女とりつきメソッド*//

/**
 * FootgeItem.activate()
 * CompItem.activate()
 * FoldereItem.activate()
 * ちと凶悪だが無理やりアクティベートするメソドッドを実装する
 * 一応アクティブでないことを内部的に確認してから実行するよう作る
 * 一旦プロジェクトウインドウを非表示にして再表示するとフォーカスが入るので
 * それを利用する
 *
 * @returns {_activate}
 * @private
 */
_activate = function () {
    if (app.project.activeItem === this) {
        return this
    }
    for (var idx = 1; idx <= app.project.items.length; idx++) {
        if (app.project.item(idx).selected)app.project.item(idx).selected = false;
    }
    this.selected = true;
    app.project.showWindow(false);
    app.project.showWindow(true);
    return this;
};

FootageItem.prototype.activate = _activate;
FolderItem.prototype.activate = _activate;
CompItem.prototype.activate = _activate;

/**
 * getItemByName(itemName); 名前で指定したアイテムを返す
 * 引数:    アイテム名
 * 例:
 *        myItem=app.project.getItemByName("平面");
 *
 * getItemByName はアイテム名で指定したアイテムの配列を返す。
 * 該当アイテムがなければ nullを返す。
 * 引数が正規表現の場合は正規表現にマッチする全てのオブジェクトを返すように変更(2009.10.23)
 *
 * @param itemName
 * @returns {*}
 */
Project.prototype.getItemByName = function (itemName) {
    if (!itemName) {
        itemName = "";
    }
    var XXs = [];//検索一時配列
    for (var itemIndex = 1; itemIndex <= this.items.length; itemIndex++) {
        if (itemName instanceof RegExp) {
            if (this.item(itemIndex).name.match(itemName)) {
                XXs.push(this.item(itemIndex))
            }
        } else {
            if (this.item(itemIndex).name == itemName) {
                XXs.push(this.item(itemIndex))
            }
        }
        this.item(itemIndex).index = itemIndex;
    }


    if (XXs.length >= 1) {
        /**
         *  該当
         */
        return XXs;
    } else {
        return null;
    }

};

/**
 *  Project.items.getByName(itemName);アイテムコレクションから指定の名前のアイテムを戻す
 *    引数:    itemName
 *        省略可
 *    例:    var myItemFolder=app.project.items.getByName("_footages").items.getByName("_cell");
 *
 *    名前を指定してアイテムを取得　最初にマッチしたアイテムを返す名前は正規表現として解釈する
 *    引数省略時はfalse アンマッチ時はnull を返す
 * げげ日本語がマッチしない　おのれぇぇ
 * 正規表現の動作がどうもヘンなので（==）で解決するので名前は完全マッチのみ　09/09/17
 *
 * @param itemName
 * @returns {*}
 */
ItemCollection.prototype.getByName = function (itemName) {
    if (!itemName) {
        return false;
    }
    //引数なし　実はこのコードでは数値のゼロを与えてもアイテム"0"が検出できないけどあとで直す
//	var myRegex= new RegExp(itemName.toString());
    for (var itemIndex = 1; itemIndex <= this.length; itemIndex++) {
//	alert(this[itemIndex].name+"=?="+itemName.toString()+"=="+this[itemIndex].name.match(myRegex).toString());//ヘンだねどうも
//		if(this[itemIndex].name.match(myRegex) ) {return this[itemIndex];};
        if (this[itemIndex].name == itemName) {
            return this[itemIndex];
        }
    }
    return null;//マッチなし
};

/**
 * Project.pickItems(itemClass); 指定されたクラスのアイテムを返す
 * 引数:    itemClass
 *    省略可 "composition"/"footage"/"folder"のいずれか
 * 例:
 *    myComps=app.project.pickItems("composition");
 *
 * pickItem は 各クラスのアイテムを抽出して配列で返す。
 * 省略時は、全アイテム。
 * 該当アイテムがなければ nullを返す。
 *
 * @param itemClass
 * @returns {*}
 */
Project.prototype.pickItems = function (itemClass) {
    if (!itemClass) {
        return this.items;
    }
    /*
     switch(app.language){
     case Language.JAPANESE:
     switch(itemClass){
     case "composition":	XX="コンポジション";break;
     case "footage":	XX="フッテージ";break;
     case "folder":	XX="フォルダ";break;
     case "solid":	;break;
     default:	return null ;
     };
     break;
     case Language.ENGLISH:
     case Language.GERMAN:
     case Language.FRENCH:
     case Language.ITALIAN:
     case Language.SPANISH:
     default	:
     switch(itemClass){
     case "composition":
     case "footage":
     case "folder":
     case "solid":
     XX=itemClass.toString();break;
     default:
     return null ;
     };

     return false;
     } 
     */
    switch (itemClass) {
        case "composition":
        case "footage":
        case "folder":
        case "solid":
            XX = itemClass.toString();
            break;
        case "CompItem":
            XX = "composition";
            break;
        case "FolderItem":
            XX = "folder";
            break;
        case "FootageItem":
            XX = "footage";
            break;
        case "Solid":
            XX = "solid";
            break;
        default:
            return null;
    }

    var XXs = [];
    for (var itemIndex = 1; itemIndex <= this.items.length; itemIndex++) {

        switch (itemClass) {
            case "composition":
                if (this.item(itemIndex) instanceof CompItem) {
                    XXs.push(this.item(itemIndex))
                }
                break;
            case "footage":
                if (this.item(itemIndex) instanceof FootageItem) {
                    XXs.push(this.item(itemIndex))
                }
                break;
            case "folder":
                if (this.item(itemIndex) instanceof FolderItem) {
                    XXs.push(this.item(itemIndex))
                }
                break;
            case "solid":
                if ((this.item(itemIndex) instanceof FootageItem) && (this.item(itemIndex).mainSource instanceof SolidSource)) {
                    XXs.push(this.item(itemIndex))
                }
                break;
        }
//if(this.item(itemIndex).typeName==XX) {XXs.push(this.item(itemIndex))};
        /**
         * 参照用に取得時点のインデックスを付ける。そのうち別の方法を考えれ
         * @type {number}
         */
        this.item(itemIndex).index = itemIndex;
    }
    return XXs;
};
/*
 if (! myComp)
 {
 if(app.project.activeItem.typeName=="コンポジション")
 {	myComp=app.project.activeItem	
 }else{
 return false;
 }
 }else{
 if (myComp.typeName !="コンポジション")	return false;
 }
 */

/**
 * [Object File].isSequenceElements(option)
 * 引数    :識別option
 * 戻値    :Object/false
 * ファイルがシーケンスの一部か否かを判定する
 * 識別オプションがtrueのときは、シーケンスの親フォルダがシーケンスプレフィクスと一致しているか否かも判定する厳正なシーケンス判断
 * 判定は以下の条件を満たすもの
 * ラベルおよび数値部分を持つファイル名であること
 * ラベルは空文字列でもよろしいが、その場合は所属フォルダ名がラベルとなる。（所属フォルダがルートの場合は空文字列）
 * 指定の拡張子であるもの（nas のプロパティをみる 必須）
 * 同一のフォルダに同ラベルのナンバリングファイルが複数あるか
 * または単独フォルダであっても数値部分を持つファイルは長さ１のシーケンスとして扱う
 *
 * 正規表現見直し。ラベルの範囲をひろく採る　2009/10/19
 * 戻り値は判別オブジェクト。または、false
 * 判別オブジェクトには以下のプロパティがあり以後の操作に使用可能
 * .currentNumber    現在の番号
 * .prefix    ラベル文字列（空文字の場合がある）
 * .startNumber    シーケンス開始（代表）番号
 * .ext    拡張子
 *
 * @param asStrict
 * @returns {*}
 */
File.prototype.isSequenceElements = function (asStrict) {
    if (!asStrict) {
        asStrict = false
    }
    var myResult = {};
    myResult.prefix = null;
    myResult.startNumber = null;
    myResult.currentNumber = null;
    myResult.ext = "null";
    /**
     * インポートフィルタチェック　拡張子取得
     */
    if (this.name.match(nas.importFilter)) {
        myResult.ext = RegExp.$1
    } else {
        return false;
    }
//	if(this.name.match(nas.cellRegex)){myResult.ext=RegExp.$1}else{return false;};
    /**
     * ファイル名は単純連番か?その場合は親フォルダの名称をラベルとして取得する
     */
    if (this.name.match(/^([0-9]+)\..+$/)) {
        var numCurrent = RegExp.$1;
        myResult.prefix = (true) ? this.parent.name : "";
        myResult.currentNumber = numCurrent;
        var files = this.parent.getFiles(numCurrent.replace(/./g, "?") + "." + myResult.ext);
        var ncRegex = new RegExp("\([0-9]{" + myResult.currentNumber.length + "})\\.");
        for (index in files) {
            if (files[index].name.match(ncRegex)) {
                myCounts = RegExp.$1;
                numCurrent = ((numCurrent * 1) < (myCounts * 1)) ? numCurrent : myCounts;
            }
        }
        myResult.startNumber = numCurrent;
    } else {
        /**
         * ラベル付き連番
         */
//		if(this.name.match(/^([^\-_\s]+[^0-9]?)([0-9]+)\..+$/)){}
        if (this.name.match(/^(.*[^0-9]+)([0-9]+)\..+$/)) {
            var myPrefix = RegExp.$1;
            var numCurrent = RegExp.$2;
            myResult.currentNumber = numCurrent;
            var files = this.parent.getFiles(myPrefix + myResult.currentNumber.replace(/./g, "?") + "." + myResult.ext);
//			var ncRegex=new RegExp(myPrefix.replace(/[\_\-\\\.\*\/\?]/g,"\$1")+"([0-9]{"+numCurrent.length+"})\\.");
            var ncRegex = new RegExp(myPrefix + "([0-9]{" + numCurrent.length + "})\\.");
            for (index in files) {
                if (files[index].name.match(ncRegex)) {
                    myCounts = RegExp.$1;
                    numCurrent = ((numCurrent * 1) < (myCounts * 1)) ? numCurrent : myCounts;
                }
            }
            myResult.prefix = myPrefix;
            myResult.startNumber = numCurrent;
        } else {
            return false;
        }
    }
//	alert(decodeURI(this.parent.name)+"/"+myResult.prefix);
    if (asStrict) {
        var myLbRegex = new RegExp(myResult.prefix, "i");
        if (!(decodeURI(this.parent.name).match(myLbRegex))) {
            return false
        }
        //厳密判定
    }
    return myResult;
};

/**
 * ファイルから指定バイト数読み出して、1バイトあたり1要素の数値の配列を返す
 * このメソッドはファイルのopen/close操作を行わない。
 * あらかじめファイルを(r)モードでオープンしておくこと。
 * 開かれていないファイルハンドルに対して操作した場合の戻り値は false
 *
 * @param {Number} readNum
 *        読み出しbite数 省略値 ファイルの残りすべて
 * @returns {Array}
 *        1バイトあたり1要素の配列 / 読み出し幅が1バイトの時のみNumber
 * @example
 *        myFile.open('r');
 *        myContent=myFile.getBin(12);
 *        myFile.close();
 *        console.log(myContent);
 */
File.prototype.getBin = function (readNum) {
    if (this.tell() == -1)return false;//シークアドレスが-1 (オープンしてない)
    var myContent = [];
    var currentAddress = this.tell();//カレントアドレス取得
    var currentEncoding = this.encoding;//カレントアドレス取得
    if (!readNum)    readNum = this.length - currentAddress;//読み出し幅確認
    var startAddress = currentAddress;
    var endAddress = currentAddress + readNum;
    this.encoding = "BINARY";
    if (endAddress > this.length)endAddress = this.length;
    try {
        for (var readAddress = startAddress; readAddress < endAddress;) {
            this.seek(readAddress, 0);
            var biteChar = this.read(1);
            var biteData = biteChar.charCodeAt(0);
//		var biteData=this.read(1).charCodeAt(0);
            var btCount = this.tell() - readAddress;
//		if(btCount>2){alert(btCount+" : "+biteChar);}
            for (var ct = btCount; ct > 0; ct--) {
                myContent.push(Math.floor(biteData / Math.pow(256, ct - 1)) & 255);//上位バイトから順にプッシュ
            }
            readAddress = readAddress + btCount;//
        }
    } catch (er) {
        this.encoding = currentEncoding;
        return false;
    }
    /*
     *  読み出しオーバーの場合があるのでシーク位置を強制的に設定値にあわせる/エンコーディングを戻す
     */
    this.seek(endAddress);
    this.encoding = currentEncoding;
    /*
     *  要求された配列分だけ戻す
     */
    if (readNum == 1) return myContent[0];

    return myContent.slice(0, readNum);
};

if (!app.buildName.match(/^6\.[05]/)) {
    /**
     * バイナリデータの書き込みを行う(ESTK)(AE7.0以降)
     * @example
     *     if(! myFile.putBin(myContent)){alert("Write error !")}

     * 1バイトあたり1要素の配列 / 読み出し幅が1バイトの時のみNumber
     * このメソッドはファイルのopen/close操作を行わない。
     * 負の値は切りあげて 0 ・ 255以上の値は切り捨てて 255
     * オプションがあれば、配列の値が255以上の場合 バイト分割して書き込む。
     * オプションの値が"big"ならばビッグエンディアン それ以外はリトルエンディアン
     * あらかじめファイルを(w)モードでオープンしておくこと。
     * 開かれていないファイルハンドルに対して操作した場合の戻り値は false
     *
     * @param {Array} writeData
     *        書き込みデータ配列 省略時 error
     *        整数値以外のデータはnullを含め 0 として書き込む<br />
     *        データ単独(1要素のみ)の場合は、Numberクラスも可
     * @param {boolean} option
     *        オプション(true)で書き込みモードバイト分割(リトルエンディアン)にする<br />
     *        オプション("big")でビッグエンディアン
     * @returns {boolean}
     *        書き込み成功時にtrue
     */
    File.prototype.putBin = function (writeData, option) {
        if (this.tell() == -1)return false;//シークアドレスが-1 (オープンしてない)
        if ((!writeData) || (!writeData instanceof Array))return false;//データがない


//		var myOpenfile = new File(myFile.fsName);不要
        if (!option) {
            option = false;
        } else {
            var big = (option == "big");
        }
        var currentEncoding = this.encoding;//現在のエンコーディングを控
        this.encoding = "BINARY";//バイナリに設定
//		myOpenfile.lineFeed="unix";
        var writeBuf = 0;//書き込みデータバッファ
        try {
//		myOpenfile.open("w");
            for (var readAddress = 0; readAddress < writeData.length; readAddress++) {
                if (isNaN(writeData[readAddress]) || writeData[readAddress] < 0) {
                    writeBuf = 0;
                } else {
                    if (writeData[readAddress] > 255) {
                        if (option) {
                            /**
                             * 処理するバイトオフセット
                             * @type {number}
                             */
                            var ct = 0;
                            while (Math.floor(writeData[readAddress] / Math.pow(256, ct)) > 0) {
                                if (!big)this.write(String.fromCharCode(Math.floor(writeData[readAddress] / Math.pow(256, ct)) & 255));//上位バイトから順にプッシュ
                                ct++;//1バイト桁をあげる リトルエンディアン
                            }
                            if (big) {
                                for (var ctR = ct; ctR > 0; ctR--)
                                    this.write(String.fromCharCode(Math.floor(writeData[readAddress] / Math.pow(256, ct)) & 255));//下位バイトから順にプッシュ
                            }
                            continue;
                            /**
                             * 書き終わったらループスキップして次のアドレス
                             */
                        }
                        writeBuf = 255;
                    } else {
                        writeBuf = writeData[readAddress];
                    }
                }
                //	alert(writeBuf);
                this.write(String.fromCharCode(writeBuf));
            }
//		myOpenfile.close();
        } catch (er) {
            this.encoding = currentEncoding;
            return false;
        }
        this.encoding = currentEncoding;
        return true;
    }
}


/**
 * FolderItem.getItemSources()
 *
 * 引数    なし
 * 戻値    フォルダ配下のアイテムのうちファイルソースをもつアイテムのソースファイルの配列[File,File,File…]
 *
 * 重複チェック等はしない。再帰検索を行う。
 * 配下のオブジェクトにファイルソースが一つもない場合は要素数0の配列でなくfalseを戻す
 *
 * @returns {*}
 */
FolderItem.prototype.getItemSources = function () {
    var mySources = [];
    for (var itmIdx = 1; itmIdx <= this.items.length; itmIdx++) {
        if (this.items[itmIdx] instanceof FolderItem) {
            mySources = mySources.concat(this.items[itmIdx].getItemSources());
            continue;
        }
        if ((this.items[itmIdx] instanceof FootageItem) && (this.items[itmIdx].mainSource instanceof FileSource)) {
            mySources.push(this.items[itmIdx].mainSource.file)
        }
    }
    if (mySources.length) {
        return mySources
    } else {
        return false
    }
};

/**
 * Comp.getItemSources()
 * 引数    なし
 * 戻値    コンポ配下のレイヤのうちファイルソースをもつレイヤのソースファイルの配列[File,File,File…]
 *
 * 重複チェック等はしない。再帰検索を行う。
 * 配下のオブジェクトにファイルソースが一つもない場合は要素数0の配列でなくfalseを戻す
 *
 * @returns {*}
 */
CompItem.prototype.getItemSources = function () {
    var mySources = [];
    for (var lyIdx = 1; lyIdx <= this.layers.length; lyIdx++) {
        if (this.layers[lyIdx].souce instanceof CompItem) {
            mySources = mySources.concat(this.layers[lyIdx].getItemSources());
            continue;
        }
        if ((this.layers[lyIdx].source instanceof FootageItem) && (this.layers[lyIdx].source.mainSource instanceof FileSource)) {
            mySources.push(this.layers[lyIdx].source.mainSource.file);
        }
    }
    if (mySources.length) {
        return mySources
    } else {
        return false
    }

};

/**
 * CompItem.setFrames()
 * 以下のコードを実行するとコンポアイテムに
 * setFrames() メソッドが増設されます。
 * このメソッドはコンポの継続時間をフレームでセットします。
 *
 *    例: newDuration=app.project.item(1).setFrames(105);
 *
 * 現在のフレームレートでフレーム数をオーバーしない長さの継続時間をセットして
 * コンポにセットされた継続時間を返します。
 * このコードを、AE 7.0以降で実行すると望ましくない副作用が有ります。
 * バージョン分岐して7.0以降の環境でこのコードが実行されないよう注意してください。
 *        Nekomataya/kiyo 2006/07/26
 */
if (app.buildName.match(/^6\.[05]/)) {
    CompItem.prototype.setFrames = function (targetFrames) {
        /**
         * (1/2^n)を合成して近似値を求める
         * @type {number}
         */
        var myTargetDuration = targetFrames / this.frameRate;
        /**
         * 初期係数設定値に誤差がある場合はこの値をフォールダウン
         * @type {number}
         */
        var replayCount = 18;
        /**
         * 再帰処理ループ
         */
        while (true) {
            var myDuration = myTargetDuration;//再初期化
            var coc = [];
            for (cO = 0; cO < replayCount; cO++) {
                coc[cO] = Math.floor(myDuration);
                if (myTargetDuration % (1 / Math.pow(2, cO)) == 0) {
                    /**
                     *  割り切れたので終了
                     */
                    break;
                } else {
                    myDuration = (myDuration % 1) * 2;
                }
            }
            /**
             * 使い終わったので再初期化して流用
             * @type {number}
             */
            myDuration = 0;
            for (c = 0; c < coc.length; c++) {
                myDuration += (1 / Math.pow(2, c)) * coc[c];
            }
            /**
             * コンポに時間を設定する
             * @type {number}
             */
            this.duration = myDuration;
            /**
             * 継続時間が設定値と異なる場合は、設定失敗なので係数を1つ下げて再度トライする
             */
            if (this.duration != myDuration) {
                replayCount--;
                continue;
            } else {
                break;
            }
        }
        return this.duration;
    }
} else {
    /**
     * AE7.0以降用に同機能のメソッド AE7以降では同バグがFIXされている為
     * 上記のコードは副作用があるので注意 7以降は以下の同等のメソッドがロードされます。
     * @param targetFrames
     * @returns {number|*}
     */
    CompItem.prototype.setFrames = function (targetFrames) {
        this.duration = targetFrames / this.frameRate;
        return this.duration;
    }
}
/**
 * クリップボードの内容を取得するメソッド
 * @returns {*}
 */
nas.otome.getClipboardText = function (){
	var cmd;
	if(appHost.os=="Win"){
//windows
		cmd = "cmd /c powershell get-clipboard";
	}else{
		cmd = "pbpaste";
	};
	if(cmd){
		return system.callSystem(nas.otome.clipboardGetter)
	}else{
		return "";
	}
};
/**
 * AERemapEXの付属コマンドを使用してクリップボードの内容を取得するメソッド
 * ScriptUI/AE_Clipboard.exe またはnas/lib/resource/AE_Clipboard.exeを検索して使用
 * 現在はWindowsのみのサービスだがMac版はシステムの/usr/bin/pbpaste コマンドを使用ああMac便利
 *
 * @returns {*}
 
nas.otome.getClipboardText = function () {
    if (!nas.otome.clipboardGetter) {
        nas.otome.clipboardGetter = null;
        if (appHost.os=="Win") {
            //windows
            var myGetters = ["/Scripts/nas/lib/resource/gc.exe", "/Scripts/ScriptUI Panels/AE_Clipboard.exe"];
            for (ix in myGetters) {
                nas.otome.clipboardGetter = new File(Folder.scripts.path.toString() + myGetters[ix]);
                if (nas.otome.clipboardGetter.exists) break;
            }
        } else {
            nas.otome.clipboardGetter = new File("/usr/bin/pbpaste");//たぶん決め打ちでおっけー　後で確認
        }
    }
    if (nas.otome.clipboardGetter.exists == true) {
        return system.callSystem(nas.otome.clipboardGetter.fsName)
    } else {
        return "";
    }
};// */
/**
 * クリップボードにテキストを書き込む
 * @param string
 * @returns {*}
 */
nas.GUI.setClipbordText = function (string) {
	var cmd;

	string = (typeof string == 'string') ? string : string.toString();
	isWindows = $.os.indexOf('Windows') !== -1;
	;
	if (appHost.os == 'Win') {
		cmd = 'cmd.exe /c cmd.exe /c "echo ' + string + '| clip"';
	}else{
		cmd = 'echo "' + string + '"| pbcopy';
	}
	system.callSystem(cmd);
}
/**
 *
 * @param myText
 * @returns {*}
 *
nas.otome.setClipboardText = function (myText) {
    if (!nas.otome.clipboardWriter) {
        nas.otome.clipboardWriter = null;
        if (appHost.os=="Win") {
            var myWriters = ["/Scripts/nas/lib/resource/sc.exe", "/Scripts/nas/lib/resource/AE_Clipboard.exe"];
            for (ix in myWriters) {
                nas.otome.clipboardWriter = new File(Folder.scripts.path.toString() + myWriters[ix]);
                if (nas.otome.clipboardWriter.exists) break;
            };
        } else {
            nas.otome.clipboardWriter = new File("/usr/bin/pbcopy");
        };
    };
    if (nas.otome.clipboardWriter.exists == true) {
        return system.callSystem("echo " + myText + " |" + nas.otome.clipboardWriter.fsName)
    } else {
        return "";
    };
};// */
/**
 * LayerCollection.addNullA()
 * 引数:    なし
 * 戻値:    AVLayer(NullObject)
 *
 * 乙女のサービスとしてヌルオブジェクトのキャッシュを行なう
 * LayerCollection.addNull() の代替メソッド
 * 当該メソッドで作成したキャッシュからヌルオブジェクトを複製でつくる
 *
 * メソッドが呼び出された場合、乙女ポケットにキャッシュがあれば当該オブジェクトが使用可能か否か判定して返す
 * 使用不能な場合は該当するコンポで新たなヌルオブジェクトを作成してこれをキャッシュする
 * 使用不能判定はAVLayerに必ず存在するプロパティをアクセスしてエラーを検知する…で大丈夫かな？
 * 2010.10.18
 */


/**
 * 乙女のポケットにイロイロ収納します
 * @type {{}}
 */
nas.otome.pocket = {};
/**
 * 初期判定用にnullで初期化
 * @type {boolean}
 */
nas.otome.pocket.nullCache = false;

LayerCollection.prototype.addNullA = function () {
    var doNewCash = true;
    /**
     * キャッシュにレイヤがある レイヤが有効か否かを判定する
     */
    if (nas.otome.pocket.nullCache instanceof AVLayer) {
        try {
            if (nas.otome.pocket.nullCache.nullLayer) {
                doNewCash = false
            }
        } catch (er) {
            doNewCash = true
        }
    }
    /**
     * すでにキャッシュが有効な場合のみフラグを立てる
     */
    if (doNewCash) {
        nas.otome.pocket.nullCache = this.addNull();
        return nas.otome.pocket.nullCache;
    } else {
        var tempLayer = false;
        if (this.length < 1) {
            tempLayer = this.addNull()
        }
        /**
         *  レイヤコレクションにレイヤが無い場合コンポ特定のためのレイヤを作成する
         */
        var targetComp = this[1].containingComp;//事前処理で最低ひとつのレイヤがあるのでそのプロパティから参照
        if (tempLayer instanceof AVLayer) {
            tempLayer.source.remove()
        }
        //一時レイヤを削除
        if (targetComp.selectedLayers.length) {
            var newIdx = targetComp.layers.length;
            for (lIdx = 0; lIdx < targetComp.selectedLayers.length; lIdx++) {
                if (newIdx > targetComp.selectedLayers[lIdx].index) {
                    newIdx = targetComp.selectedLayers[lIdx].index
                }
            }
        } else {
            var newIdx = 1
        }
        nas.otome.pocket.nullCache.copyToComp(targetComp);
        return targetComp.layers[newIdx];
    }
};

/**
 * LayerCollection.sortByName()
 * 引数:なし
 * 戻り値：なし
 * 　コンポ内のアイテムを名前で並べ替えるメソッド
 * レイヤ名を文字列して比較
 * レイヤラベルの正規化はcommon
 *
 * @param myOpt
 * @returns {boolean}
 */
LayerCollection.prototype.sortByName = function (myOpt) {
    if (this.length < 2) {
        return false;
    }
    /**
     * ソート配列を作成
     * @type {Array}
     */
    var sortArray = [];
    for (var idx = 0; idx < this.length; idx++) {
        sortArray.push(this[idx + 1]);
    }
    switch (myOpt) {
        case "cell"    :
            sortArray = sortArray.sort(
                function (a, b) {
                    var A = nas.labelNormalization(a.name.toString());
                    var B = nas.labelNormalization(b.name.toString());
                    if (A > B) {
                        return 1
                    } else {
                        if (A < B) {
                            return -1
                        } else {
                            return 0
                        }
                    }
                }
            );
            break;
        case "caseIgnore"    :
            sortArray = sortArray.sort(
                function (a, b) {
                    var A = a.name.toString().toLowerCase();
                    var B = b.name.toString().toLowerCase();
                    if (A > B) {
                        return 1
                    } else {
                        if (A < B) {
                            return -1
                        } else {
                            return 0
                        }
                    }
                }
            );
            break;
        default:
            sortArray = sortArray.sort(
                function (a, b) {
                    var A = a.name.toString();
                    var B = b.name.toString();
                    if (A > B) {
                        return 1
                    } else {
                        if (A < B) {
                            return -1
                        } else {
                            return 0
                        }
                    }
                }
            );
    }
    /**
     * レイヤ並び替え
     */
    for (var n = 0; n < sortArray.length; n++) {
        sortArray[n].moveToBeginning();
    }
};

//app.project.activeItem.layers.sortByName();

/**
 * AVLayer.applyPresetA(myFfxFile,skipUndo)
 * 引数    myFfxFile    File    プリセットファイル
 * skipUndo    boolean    undoGrooupの設定をスキップする。省略値は false
 *
 * 例
 * app.project.activeItem.selectedLayers[0].applyPreset(myFfxFile);
 *
 * app.project.item(1).applyPreset(myFfxFile,true);
 *
 * レイヤにアニメーションプリセットを適用する
 * AE7でコンポ内でのプリセット適用バグの回避のためのラッパメソッド
 * オプションが与えられない場合はプリセットにundoGroupを設定してundoの混乱を回避する
 * スクリプト内で複雑なundoが発生する場合はskipUndoをtrueにすることを推奨
 *
 * えーっと　CompItemのapplyPreset()は放置しておく　私は使わないから…
 * 2009/10/24
 */
if (appHost.version >= 7) {
    if (appHost.version < 9) {
        AVLayer.prototype.applyPresetA = function (myFile, skipUndo) {
            var myResult = false;
            if ((myFile instanceof File) && (myFile.exists)) {
                if (!skipUndo) {
                    skipUndo = false
                }
                var mySelection = [];
                if (!skipUndo) {
                    nas.otome.beginUndoGroup('myApplyPreset ' + myFile.name)
                }
                for (var i = 0; i < this.containingComp.layers.length; i++) {
                    mySelection.push(this.containingComp.layers[i + 1].selected);
                    this.containingComp.layers[i + 1].selected = false;
                }
                /**
                 * 選択状態を保存して解除
                 * @type {boolean}
                 */
                this.selected = true;
                myResult = this.applyPreset(myFile);//本体レイヤを選択して適用

                for (var i = 0; i < this.containingComp.layers.length; i++) {
                    this.containingComp.layers[i + 1].selected = mySelection[i];
                }
                /**
                 * 選択状態復帰
                 */
                if (!skipUndo) {
                    nas.otome.endUndoGroup();
                }
//	}else{
//		エラーメッセージが必要ならここをアクティブに 不要ならばブロックごと削除
//	alert("no File "+myFile.name);
            }
            return myResult;
        }
    } else {
        AVLayer.prototype.applyPresetA = function (myFile, skipUndo) {
            if (!skipUndo) {
                skipUndo = false
            }
            if (!skipUndo) nas.otome.beginUndoGroup("myApplyPreset " + myFile.name);
            this.applyPreset(myFile);
            if (!skipUndo) nas.otome.endUndoGroup();
        }
    }
}

/**
 * AVLayer.getLinkRoot()
 * 引数:    なし
 * 戻り値:    AVLayer
 * リンクネットワークの親を再帰的にたどって返すメソッド
 *
 * @returns {AVLayer}
 */
AVLayer.prototype.getLinkRoot = function () {
    var myResult = this;
    if (this.parent) {
        myResult = this.parent.getLinkRoot();
    }
    return myResult;
};

/*=============================オートビルダ関連タイムシート適用メソッド=====================2009/10/22=======*/

/**
 * Xpsオブジェクト用ＡＥ特化拡張
 * リンク先自動判定メソッド
 * Ｘｐｓ.guessLink(Layer)
 * 引数　:AEレイヤオブジェクト
 * 戻り値‘リンクID
 * AEのレイヤを引数で与える
 * 戻り値はオフセット2を加えて返す。ID 0/1 は予約
 * 0    :リンクなし    リンクすべきタイムランがない
 * 1    :特殊タイムライン    タイムラインの記述はシート内にないがスチル素材として静止タイムラインを与えるべきである
 * 2-    :2以降はリンクすべきタイムラインがある。タイムラインIDは戻値から２減じて得ること
 *
 * このメソッドはAEに特化しているので、ＡＥ専用拡張に編入するべき(乙女か …乙女だ)
 *
 * @param myLayer
 * @returns {*}
 */
Xps.prototype.guessLink = function (myLayer) {
    if ((this.layers.length)) {
        /**
         * まずもってレイヤにタイムリマップが効かない場合は捨てる(ＩＤ:0　を返す)
         */
        if (!myLayer.canSetTimeRemapEnabled) {
            return 0
        }
        /**
         * ソースの継続時間が０なので平面またはそれに類するソースである
         */
        if (myLayer.source.duration == 0) {
            return 0
        }
        /**
         * 判定文字列を生成（レイヤソースの所属フォルダ名称とファイル名を連結したものをあらかじめ作成）しておくほうが良いかも　今日はレイヤ名で
         */
        var testName = myLayer.name;
        /**
         * レイヤ名がBG/LO/をスキップ [角カッコ]は振り分けルーチンが背景判定したレイヤ
         * ID=1 BG/book等のスチルフッテージと判定
         */
        if (testName.match(/(^[-_].*|bg|lo|book)|(\[.+\])/i)) {
            /**
             * ソースの継続時間がシート尺をうわまわっている場合はタイムリマップしない
             */
            if (myLayer.source.duration < (this.duration() / this.ftramerate)) {
                return 0
            } else {
                return 1
            }
        }

        /**
         * 検査(完全一致はやめ　冒頭一致で後ろの文字列は主に数値として許容)
         */
        for (Xid = 0; Xid < this.layers.length; Xid++) {
            var Label = new RegExp("^" + this.layers[Xid].name + ".*$", "i");
            if (testName.match(Label)) {
                return (Xid + 2);
            }
        }
        /**
         * 分類フォルダの名称でチェック
         */
        if (myLayer.source.parentFolder.name == "[CELL]") {
            /**
             * ソースの継続時間がシート尺をうわまわっている場合はタイムリマップしない
             */
            if (myLayer.source.duration < (this.duration() / this.ftramerate)) {
                return 0
            } else {
                return 1
            }
        }
        /**
         * 判定を抜けて、セル判定だった
         */
        return 0;
    } else {
        return false;
    }
};

/**
 * XPS.mkStage(stgName,stgLength,stgResolution,stgWidth,stgHeight,myOptions)
 * 引数
 * stgName    ステージコンポ名を文字列で（省略時はXPSデータから作成）
 * stagLength　ステージの継続時間をフレーム数で(省略時はXPSデータから作成)
 * stgResolution    ステージの基準解像度をdpiで(省略時は入力メディア値から取得)
 * stgWidth    ステージ幅をmm数で(省略時はフッテージから最大値を取得)
 * stgHeight    ステージ奥行きをｍｍ数で(省略時はフッテージから最大値を取得)
 * myOptions    オプション文字列
 * map    ＭＡＰ検索を行なう（デフォルト）
 * nomap    ＭＡＰ検索を行なわない
 * select    現在の選択アイテムをメンバーにする(デフォルトでは無視)
 * align[N]    エレメントの強制アライメントを行なう。 [N]は数値
 * align0    左下
 * align1    下
 * align2    右下
 * align3    左
 * align4    中央(デフォルト)
 * align5    右
 * align6    左上
 * align7    上
 * align8    右上
 * つまり
 * 6    7    8
 * 3    4    5
 * 0    1    2
 * こうです
 * アライメントは未実装(2009.10.23)
 * bg[N]    背景の取り込みオプション(BG/BOOK等のタイミングのないフッテージ全て)
 * bg0    BGを取り込まない
 * bg#    #枚のBGを取り込む(1-9) 9個以上はデフォルトにしといてください　数の制限が主な用途だと思うので
 * bgAll    あるだけ全て取り込む(デフォルト)
 *
 * 自動化を進める観点から主体となるオブジェクトのメソッドで組むのが最も適切っぽい
 * ただし、ＡＥに特化したメソッドなのでotomeのライブラリ中で拡張を行なう
 * ここではコンストラクタの拡張ではなくXPSバッファの機能で実装しておく。ピクセル比率は現在"1"固定
 * この関数は現時点で　XpsオブジェクトではなくXPSバッファの拡張である点に注意　オブジェクトのメソッドコールはできない
 *
 * 各引数は基本的に省略が前提なのであった　要ケーステスト(2009/10/23)
 * 入れ替え時に不都合が発生するケースがあるのでクラスメソッドに変更(2010/11)
 *
 * @param stgName
 * @param stgLength
 * @param stgResolution
 * @param stgWidth
 * @param stgHeight
 * @param myOptions
 * @returns {*}
 */
Xps.prototype.mkStage = function (stgName, stgLength, stgResolution, stgWidth, stgHeight, myOptions) {
    var myStgName = [this.scene, this.cut].join("_");//この部分をステージ名を生成する関数で置き換えるべき（2010/10/16）
    if (stgName) {
        myStgName = stgName
    }
    /**
     * 指定があればコンポ名は入れ替え
     * 31バイト制限のためステージ名を前後の余裕を持って
     *（5bitePrefix+myStageName+5bitePostFix "(xxx)NAME tk01"<このくらい）21バイトに制限しておく
     */
    if (nas.biteCount(myStgName) > 21) {
        myStgName = prompt("ステージ名を21バイト以下で指定してください", myStgName);
        if (nas.nas.biteCount(myStgName) > 21) {
            myStgName = nas.biteClip(myStgName, 21)
        }
        /**
         * 暫定版　一回指定しそこねたら強制的にちじめる　後ろを切るのでじつはあまり役に立たない
         */
    }
    var myAlign = 4;
    if ((myOptions) && (myOptions.match(/align(\d)/i))) {
        myAlign = RegExp.$1 * 1
    }
    var getSelection = false;
    if ((myOptions) && (myOptions.match(/select/i))) {
        getSelecton = true
    }
    var getMap = true;
    if ((myOptions) && (myOptions.match(/nomap/i))) {
        getMap = false
    }

    /**
     * 呼び出し時点でプロジェクト内のフッテージが選択されていれば、そのフッテージをメンバーとするコンポを組む
     * オプションがあればユーザ選択を無視して自動判定（ＭＡＰ検索）する
     * メンバーがない場合は処理停止
     * @type {*}
     */
    var myLength = this.duration();
    if ((stgLength) && (!( isNaN(stgLength) ))) {
        myLength = Math.floor(stgLength * 1)
    }
    var myResolution = (nas.inputMedias.selectedRecord[3] * 1);
    if ((stgResolution) && (!( isNaN(stgResolution) ))) {
        myResolution = (stgResolution * 1)
    }
    /**
     * 入力メディアから初期値を作成する幅や高さの指定があれば上書き。引数をフラグにしてあとで自動判定の際に処理をスキップ
     * @type {Object}
     */
    var myFrameAspect = eval(nas.inputMedias.selectedRecord[2]);
    var myWidth = Math.ceil((nas.inputMedias.selectedRecord[1] / 2) * (nas.inputMedias.selectedRecord[3] / 25.4)) * 2;
    var myHeight = Math.ceil(myWidth / (myFrameAspect * 2)) * 2;

    if ((stgWidth) && (!( isNaN(stgWidth) ))) {
        myWidth = Math.ceil(stgWidth * (2 * myResolution / 25.4)) * 2
    }
    if ((stgHeight) && (!( isNaN(stgHeight) ))) {
        myHeight = Math.ceil(stgHeight * (2 * myResolution / 25.4)) * 2
    }
    /**
     * BG取込オプション
     * @type {null}
     */
    var bgOpt = null;
    if ((myOptions) && (myOptions.match(/bg(\d)/i))) {
        bgOpt = RegExp.$1 * 1
    }
    /**
     * ステージのメンバアイテムトレーラ
     * @type {Array}
     */
    var myMembers = [];
    /**
     * 初期化終わり　解析
     */
    if ((getSelection) && (app.project.selection.length)) {
        for (var idx = 0; idx < app.project.selection.length; idx++) {
            /**
             * ユーザ選択アイテムはAVアイテムである限り無条件で取り込み
             */
            if (app.project.selection[idx] instanceof AVItem) {
                myMenbers.push(app.project.selection[idx])
            }
        }
    }
    if (getMap) {
        var myMemberTrailer = app.project.items.getByName(nas.mapFolders.mapBase).items.getByName(nas.mapFolders.cell).items;

        /**
         * MAP処理第一ステージ
         * オプションにしたがって背景を取り込む(暫定処置　そのうちXPS参照でできるようになる…と良いよね)
         * 背景取り込みオプションはひとまず（none/single/all）かな？
         * @type {number}
         */
        var bgCount = myMemberTrailer.length;//最大値で初期化=ALL
        if (bgOpt) {
            bgCount = bgOpt
        }
        if (bgOpt == 0) {
            bgCount = 0
        }
        for (var idx = 0; idx < myMemberTrailer.length; idx++) {
            if (bgCount <= 0) {
                break
            }
            /**
             *  カウントに達したら抜ける
             */
            if (myMemberTrailer[idx + 1].name.match(/\[.+\]/)) {
                myMembers.push(myMemberTrailer[idx + 1]);
                bgCount--;
            }
        }
        /**
         * 取り込んでも取り込まなくても第一ステージ終了
         * 第二ステージは背景以外のフッテージをメンバー追加
         */
        for (var lIdx = 0; lIdx < this.layers.length; lIdx++) {
            var mEmber = myMemberTrailer.getByName(this.layers[lIdx].name);//完全一致で検索
            if (mEmber) {
                myMembers.push(mEmber)
            }
        }
    }
    /**
     * メンバ収集おしまい
     * メンバ数が0なら処理中断
     */
    if (myMembers.length == 0) {
        return false;
    }
    /**
     * 指定名称のコンポがすでにある場合は、名称にテイクNoを追加して作成する
     * @type {*}
     */
    var existsComps = app.project.getItemByName(new RegExp("^\\(" + nas.itmFootStamps.stage[0] + "\\)" + myStgName + "(\\s.*)?$"));//ポストフィックスは空白区切り（AEあわせ）
    /**
     * 初期化
     * @type {string}
     */
    var myPstfix = "";
    if (existsComps) {
//		myStgName=nas.incrStr(existsComps[existsComps.length-1].name);//ラストのファイル名をincr
        var newPstfix = nas.incrStr(RegExp.$2);
        if (newPstfix == myPstfix) {
            myPstfix = " tk2"
        } else {
            myPstfix = newPstfix
        }
        nas.otome.writeConsole("既存コンポが" + existsComps.length + "個あります。" + nas.GUI.LineFeed + " " + myPstfix + "を作成します");
//		if(existsComps.length){myStgName=nas.biteClip(myStgName,31-myPstfix.length)+myPstfix};
    }
    /**
     * 指定がなければメンバーのジオメトリをチェックしてコンポサイズを確定する
     */
    for (var idx = 0; idx < myMembers.length; idx++) {
        if ((!(stgWidth)) && (myMembers[idx].width > myWidth)) {
            myWidth = myMembers[idx].width
        }
        if ((!(stgHeight)) && (myMembers[idx].height > myHeight)) {
            myHeight = myMembers[idx].height
        }
    }
    /**
     * 新コンポ作る
     */
    nas.otome.beginUndoGroup("makeStage " + myStgName);
    /**
     * コンポはルートフォルダに作っちゃうけど良いのかな？　ま暫定でルートだ
     */
    var myStage = app.project.items.addComp(nas.itmFootStamps.stage[0] + myStgName + myPstfix, myWidth, myHeight, 1, 1, nas.inputMedias.selectedRecord[4]);
    if (myStage) {
        /**
         * 失敗はまずないと思いたいけどあるかも知れない
         * 時間セット
         */
        myStage.setFrames(myLength);
        myStage.comment = nas.itmFootStamps.stage[1];//フットスタンプぺたら（ここは初作成なのでOK　書き換えや判別は注意）
        /**
         * メンバーを順に流しこむ（ユーザ指定は下側だが順番になってるはずなので並べ替えは一応不要）
         */
        for (var idx = 0; idx < myMembers.length; idx++) {
            var myLayer = myStage.layers.add(myMembers[idx]);
//		myLayer.name=myMembers[idx].name;
        }
    }
    nas.otome.endUndoGroup();
    /**
     * ここまで作ったらあとはタイミングの適用で、そのままメソッドのコールが可能　どうしましょう？
     * 常道なら？他のアイテムのセレクトを解除してステージコンポをセレクトして返しておしまいだけど…
     * @type {boolean}
     */
    myStage.selected = true;

    /**
     * 定型処理実行
     * @type {Folder}
     */
    var myAction = new Folder(Folder.scripts.path.toString() + "/Scripts/nas/(actions)/systemResources/XPS.mkStage");
    if (myAction.exists) {
        myStage.executeAction(myAction)
    }
    return myStage;
};

//
/**
 * XPSオブジェクトに識別情報を問い合わせる（読み出し専用）
 * XPS.getInfo()
 * 引数    なし
 * XPSの識別情報を返す　ストア内に内容の一致するタイムシートがあればその情報を返し、ない場合はオブジェクト自身の情報を作成して返す
 *
 * @returns {Object}
 */
Xps.prototype.getInfo = function () {
    var storeName = [this.scene, this.cut].join("_");
    var myContent = this.toString();
    if ((nas.XPSStore != false) && (nas.XPSStore.select()) && (nas.XPSStore.toString() == myContent)) {
        /**
         * ストアのコメントから取得
         * @type {string|*|string|string}
         */
        var myProp = nas.XPSStore.selected.comment;
    } else {
        /**
         * バッファ内容から生成
         * @type {string}
         */
        var myProp = "{";
        myProp += "\"name\" :\"" + storeName + "\",";
        myProp += "\"modified\" :\"" + new Date().toNASString() + "\",";
        myProp += "\"length\" :\"==" + myContent.length + "==\",";//"=="でエスケープしてある場合はファイルなし
        myProp += "\"url\" :\"\"";//""ファイルなし
        myProp += "}";
    }
    /**
     * オブジェクトで返す　テキストが良いか？
     */
    return eval("\(" + myProp + "\)");
};
//+++++++++++++++++++++++++++++AEオブジェクト用Ｘｐｓ対応拡張メソッド

/**
 * CompItem.applyXPS(ｍｙＸｐｓ)
 * 引数    XPSオブジェクト
 * 引数が与えられなかった場合はXPSStor.selected/XPSバッファ/XPSStore内の同名シートの順で検索する
 * それでも候補がなかった場合はNOPリターン　だけど判定はいまは書かない　そのうち書く　2009/10/20
 *
 * @param myXps
 * @returns {boolean}
 */
CompItem.prototype.applyXPS = function (myXps) {
    if (!myXps) {
        return false
    }
    /**
     *  現在パス
     */
    nas.otome.beginUndoGroup("applyXPS");
    /**
     * 指定シートのフレームレート・継続時間を確認して適用
     */
    if (this.frameRate != myXps.framerate) {
        this.frameRate = myXps.framerate
    }
    if (myXps.duration() != Math.round(this.duration / this.frameDuration)) {
        this.setFrames(myXps.duration())
    }
    /**
     * XPS内のタイムラインとレイヤの関連付けは以下の手順で解決
     * 1.XPSStore.links配列を参照　(未実装)
     * 2.easyXPS　オブジェクトがあればその内部のレイヤセレクタを参照　(今回はパス)
     * 3.参照データがなければ推測エンジンを使用
     */

    /**
     * 推測エンジンはeasyXPSを踏襲　環境整備が終わった状態で使用すればまず外れることはない。
     * 当座それ以外の連結はeasyXPSを使って手作業で解決
     * リンク用内部配列を初期化
     * @type {Array}
     */
    var links = new Array(this.layers.length);//レイヤ数分の配列
    /**
     * リンク先を判定
     */
    for (var idx = 0; idx < this.layers.length; idx++) {
        links[idx] = myXps.guessLink(this.layers[idx + 1])
    }
    /**
     * リンク先に対して一点ずつ解決
     */
    for (var idx = 0; idx < this.layers.length; idx++) {
        this.layers[idx + 1].applyTimeline(this, myXps, links[idx]);
    }
    /**
     *  レイヤがタイムリマップ不能な場合はスキップ
     */
//		if(this.layers[idx+1].canEnableTimeRemap){}

    /**
     * レイヤの並び順をシートに合わせて修正する(意図的に違えている時は…ゴメンネ)
     * 並び替え自体をアクション化することを検討
     * @type {Array}
     */
//    var stackList = new Array(myXps.layers.length + 2);//ID0/1を処理するために2つ加算
    var stackList = new Array(myXps.xpsTracks.length);//ID0/1を処理するために2つ加算
    for (var idx = 0; idx < stackList.length; idx++) {
        stackList[idx] = []
    }
    /**
     * スタックリストを配列で初期化
     */
    for (var idx = 0; idx < this.layers.length; idx++) {
        stackList[links[idx]].push(this.layers[idx + 1])
    }

    for (var idx in stackList) {
        for (var sIdx in stackList[idx]) {
            if (!(stackList[idx][sIdx].locked)) {
                stackList[idx][sIdx].moveToBeginning();
            }
        }
    }
    /**
     * 上の並べ替えを行なった場合並び替え対象外のレイヤが必ず下側に入るのでカメラレイヤが下になるので好ましくない
     * クリッピングターゲットがすでに存在した場合最も上に移動　このくだりはアクションの方がよいかも…一考
     */
    for (var idx = 1; idx <= this.layers.length; idx++) {
        if (this.layers[idx].comment.indexOf("##nas.otome cameraWorkTarget") != -1) {
            this.layers[idx].moveToBeginning()
        }
        //footPrint が固定コーディングなので注意
    }

    /**
     * フットスタンプにXPS識別情報を加える。シートIDは当てにならない上にキケンなので、シートの比較情報
     */
    if (nas.XPSStore.select()) {
        var myContent = nas.XPSStore.selected.comment
    } else {
        var myContent = ""
    }
    /**
     * 選択されたシートがあれば情報コピー
     *
     * 再適用時にタイムシート識別情報が重複するので元のコメントに
     * シート識別情報が存在する場合は元の情報からシート識別情報を削除する
     * データの判定基準は第一行がステージシグネチャであることを確認して
     * 第一行の前方に挿入？入れ替えか？　どんどん増やすと危険なので入れ替える。
     */
    if (this.comment.match(new RegExp("^" + nas.itmFootStamps.stage[1]))) {
        var oldContents = this.comment.split("\n");
        this.comment = [nas.itmFootStamps.stage[1] + myContent, oldContents.slice(1, oldContents.length)].join("\n");
    } else {
        this.comment = this.comment + myContent;
    }
    /**
     * おしまいさん
     */
    nas.otome.endUndoGroup();
    if (false) {
        /**
         * 定型処理実行
         * @type {Folder}
         */
        var myAction = new Folder(Folder.scripts.path.toString() + "/Scripts/nas/(actions)/systemResources/CompItem.applyXPS");
        if (myAction.exists) {
            this.executeAction(myAction)
        }
    }
};
/**
 * AVLayer.applyTimeline(親コンポ,myXps,リンクID)
 * 引数
 * 親コンポ　AE7以降なら不要なのだがAE65での実行のために与える
 * XPSオブジェクト    必ず必要
 * リンクID 呼び出し側でXPSのどのタイムラインを適用するか決定して与える
 *
 * 引数が与えられなかった場合は動作不定
 * 基本的にはこのメソッドは親コンポからの呼び出し専用である
 *
 * @param parentComp
 * @param myXps
 * @param linkID
 * @returns {*}
 */
AVLayer.prototype.applyTimeline = function (parentComp, myXps, linkID) {
    if (this.source.duration == 0) {
        if (!(this.locked)) {
            if (this.inPoint != 0) {
                this.inPoint = 0
            }
            if (this.outPoint < parentComp.duration) {
                this.outPoint = parentComp.duration
            }
        }
        return false
    }
    /**
     *  タイムリマップ不能なレイヤなのでタイムリマップ操作はしないでin/outポイントを調整する
     */
    if (linkID == 0) {
        return 0
    }
    /**
     * 対応するタイムラインがないのでNOP
     * タイムリマップ初期化(ロックされている場合はパス)
     */
    if (!(this.locked)) {
        /**
         * 全消し
         * @type {boolean}
         */
        this.timeRemapEnabled = false;
        /**
         * 再有効化でリセット
         * @type {boolean}
         */
        this.timeRemapEnabled = true;

//	if(this.timeRemapEnabled) {this.timeRemapEnabled=false;};//キーリマップが現在あるなら一端消去
//	this.timeRemapEnabled=true;//その後再度有効化してリセット
        this.timeRemap.removeKey(2);//有効化直後はキーが二つあるので単純に一個消す
        /**
         * in/outポイントを調整する
         */
        if (this.inPoint != 0) {
            this.inPoint = 0
        }
        if (this.outPoint < parentComp.duration) {
            this.outPoint = parentComp.duration
        }
        /**
         * カラセルエフェクトがもしあれば消す
         */
        if (this.effect("blankTimeLine")) {
            this.effect("blankTimeLine").remove()
        }
        /**
         * @desc あったら消す
         */
    }
    if (linkID == 1) {
        return 1
    }
    /**
     * 背景スチルと判断されたレイヤなのでリマップの初期化のみでリターン
     * XPSからタイムラインを抽出してリマップを作成。
     * カラ処理はAE８以降ならラストフレーム処理それ以前の場合は不透明度エクスプレッションで処置
     * offset減じてXPSのタイムラインIDを得る
     * @type {number}
     */
    var myTimelineID = linkID - 1;
    if (myXps.xpsTracks[myTimelineID]) {
        /**
         * 乙女専用AEキー生成プロシジャ
         *
         * 将来、データツリー構造が拡張された場合、機能開始時点でツリーの仮構築必須 現在は、決め打ち
         * 内部処理に必要な環境を作成
         */
        var layerDataArray = myXps.xpsTracks[myTimelineID];
        layerDataArray.label = myXps.xpsTracks[myTimelineID].id;
        var blank_method = myXps.xpsTracks[myTimelineID].blmtd;
        var blank_pos = myXps.xpsTracks[myTimelineID].blpos;
        if ((app.buildName.split(".")[0] * 1) > 7) {
            blank_method = "file";
            blank_pos = "end"
        }
        /**
         * AE8以降は強制的に変更
         * @type {string}
         */
        var key_method = KEYMethod;
        var key_max_lot = (isNaN(myXps.xpsTracks[myTimelineID].lot)) ?
            0 : myXps.xpsTracks[myTimelineID].lot;

        /**
         * ブランク処理フラグ
         * @type {boolean}
         */
        var bflag = (blank_pos) ? false : true;

        var AE_version = appHost.version;
        var compFramerate = myXps.framerate;
        var footageFramerate = FootageFramerate;
        if (isNaN(footageFramerate)) {
            footageFramerate = compFramerate
        }
        var sizeX = myXps.xpsTracks[myTimelineID].sizeX;
        var sizeY = myXps.xpsTracks[myTimelineID].sizeY;
        var aspect = myXps.xpsTracks[myTimelineID].aspect;
//alert("カラセル方式は :"+blank_method+"\n フーテージのフレームレートは :"+footageFramerate);

        /**
         * レイヤロット変数の初期化
         * @type {number}
         */
        var layer_max_lot = 0;

        /**
         * 前処理 シート配列からキー変換前にフルフレーム有効データの配列を作る
         * 全フレーム分のバッファ配列を作る
         * @type {Array}
         */
        var bufDataArray = new Array(layerDataArray.length);
        /**
         * キースタック配列を宣言
         * キースタックは可変長
         * @type {Array}
         */
        var keyStackArray = [];
        keyStackArray["remap"] = [];
        keyStackArray["blank"] = [];

        /**
         * ふたつ リマップキー/ブランクキー 用
         * 第一フレーム評価・エントリが無効な場合空フレームを設定
         * @type {string}
         */
        bufDataArray[0] = (dataCheck(layerDataArray[0], layerDataArray.label, bflag)) ?
            dataCheck(layerDataArray[0], layerDataArray.label, bflag) : "blank";

        /**
         * 2?ラストフレームループ
         */
        for (f = 1; f < layerDataArray.length; f++) {
            /**
             * 有効データを判定して無効データエントリを直前のコピーで埋める
             */
            bufDataArray[f] = (dataCheck(layerDataArray[f], layerDataArray.label, bflag)) ?
                dataCheck(layerDataArray[f], layerDataArray.label, bflag) : bufDataArray[f - 1];

            if (bufDataArray[f] != "blank") {
                layer_max_lot = (layer_max_lot > bufDataArray[f]) ?
                    layer_max_lot : bufDataArray[f];
            }
        }
        max_lot = (layer_max_lot > key_max_lot) ?
            layer_max_lot : key_max_lot;

        /**
         * あらかじめ与えられた最大ロット変数と有効データ中の最大の値を比較して
         * 大きいほうをとる
         * ここで、layer_max_lot が 0 であった場合変換すべきデータが無いので処理中断
         */

        if (layer_max_lot == 0) {
            return "変換すべきデータがありません。\n処理を中断します。";
        }

        /**
         * 前処理第二 (配列には、キーを作成するフレームを積む)
         */

        keyStackArray["remap"].push(0);
        keyStackArray["blank"].push(0);//最初のフレームには無条件でキーを作成

        /**
         * 有効データで埋まった配列を再評価(2?ラスト)
         */
        for (f = 1; f < bufDataArray.length; f++) {
            /**
             * キーオプションにしたがって以下の評価でキー配列にスタック(フレームのみ)
             */
            switch (key_method) {
                case    "opt"    :	//	最適化キー(変化点の前後にキー)
                    //	○前データと同じで、かつ後ろのデータと
                    //	同一のエントリをスキップ
                    if (bufDataArray[f] != bufDataArray[f - 1] || bufDataArray[f] != bufDataArray[f + 1]) {
                        keyStackArray["remap"].push(f)
                    }
                    break;
                case    "min"    :	//	最少キー(変化点の前後にキー)
                    //	○前データと同じエントリをスキップ
                    if (bufDataArray[f] != bufDataArray[f - 1]) {
                        keyStackArray["remap"].push(f)
                    }
                    break;
                case    "max"    :	//	全フレームキー(スキップ無し)
                default:
                    keyStackArray["remap"].push(f);
            }
            /**
             * ブランクメソッドにしたがってブランクキーをスタック(フレームのみ)
             * @type {string}
             */
            var prevalue = (bufDataArray[f - 1] == "blank") ? "blank" : "cell";
            var currentvalue = (bufDataArray[f] == "blank") ? "blank" : "cell";
            var postvalue = (bufDataArray[f + 1] == "blank") ? "blank" : "cell";
            switch (key_method) {
                case    "opt"    :	//	最適化キー(変化点の前後にキー)
                    if (currentvalue != prevalue || currentvalue != postvalue) {
                        keyStackArray["blank"].push(f)
                    }
                    break;
                case    "min"    :	//	最少キー(変化点の前後にキー)
                    if (currentvalue != prevalue) {
                        keyStackArray["blank"].push(f)
                    }
                    break;
                case    "max"    :	//	全フレームキー(スキップ無し)
                default:
                    keyStackArray["blank"].push(f);
            }
        }

        /**
         * レイヤ操作系　undoブロックは、一階層上で処理済としておく
         * キー文字列を作成
         * blankoffsetは、カラセル挿入によるタイミングの遷移量・冒頭挿入以外は基本的に0
         */
        switch (blank_pos) {
            case    "first"    :
                var blankoffset = 1;
                break;
            case    "end"    :
                var blankoffset = 0;
                break;
            case    "none"    :
                var blankoffset = 0;
                break;
            default    :
                var blankoffset = 0;
        }
        var footage_frame_duration = (1 / footageFramerate);
//var this=thisProject.composition(nas.easymyXps.compSelector.selected).layer(COMPLyrID)
        if (!(this.locked)) {
            /**
             * タイムリマップがすでに存在する場合、全消去
             */
            if (this.timeRemapEnabled) {
                this.timeRemapEnabled = false;
            }
            /**
             * リマップキーを作成/適用
             */
            if (blank_method != "expression1") {
                for (n = 0; n < keyStackArray["remap"].length; n++) {
                    if (bufDataArray[keyStackArray["remap"][n]] == "blank") {
                        var seedValue = (blank_pos == "first") ? 1 : max_lot + 1;
                    } else {
                        var seedValue = bufDataArray[keyStackArray["remap"][n]] * 1 + blankoffset;
                    }
                    var Fr = keyStackArray["remap"][n] / myXps.framerate;
                    if (blank_method == "expression2" &&
                        bufDataArray[keyStackArray["remap"][n]] == "blank") {
                        /**
                         * エクスプレッション2のカラ
                         * @type {number}
                         */
                        var Vl = 999999;
                    } else {
                        /**
                         * 通常処理
                         * @type {number}
                         */
                        var Vl = (seedValue - 0.5) * footage_frame_duration;
                    }
                    if (!this.timeRemapEnabled) {
                        this.timeRemapEnabled = true;
                    }
                    var kid = this.property("ADBE Time Remapping").addKey(Fr);
                    if (Vl > this.source.duration) {
                        Vl = this.source.duration;
                    }
                    this.property("ADBE Time Remapping").setValueAtKey(kid, Vl);
                    if (kid == 1 && this.property("ADBE Time Remapping").numKeys > 1) {
                        for (var i = 2; i <= this.property("ADBE Time Remapping").numKeys; i++) {
                            this.property("ADBE Time Remapping").removeKey(i);
                        }
                    }
                    this.property("ADBE Time Remapping").setInterpolationTypeAtKey(kid, KeyframeInterpolationType.HOLD);
                }
            }

            /**
             * エクスプレッション型
             */
//var expBody='スライダ\tスライダ制御\tEffect\ Parameter\ #1\t\n\tFrame\t\t\n';
            if (blank_method == "expression1") {
                var timingTimeLine = this.property("ADBE Effect Parade").addProperty("ADBE Slider Control");
                timingTimeLine.name = "XPS_data";
                timingTimeLine("ADBE Slider Control-0001").expression = "//expression-TEST";

                for (n = 0; n < keyStackArray["remap"].length; n++) {
                    Fr = keyStackArray["remap"][n] / myXps.framerate;
                    if (bufDataArray[keyStackArray["remap"][n]] == "blank") {
                        Vl = 0;
                    } else {
                        Vl = (bufDataArray[keyStackArray["remap"][n]]);
                    }
                    var kid = timingTimeLine("ADBE Slider Control-0001").addKey(Fr);
                    timingTimeLine("ADBE Slider Control-0001").setValueAtKey(kid, Vl);

                    if (kid == 1 && timingTimeLine.numKeys > 1) {
                        for (var i = 2; i <= timingTimeLine("ADBE Slider Control-0001").numKeys; i++) {
                            timingTimeLine("ADBE Slider Control-0001").removeKey(i);
                        }
                    }
                    timingTimeLine("ADBE Slider Control-0001").setInterpolationTypeAtKey(kid, KeyframeInterpolationType.HOLD);
                }
            }

            /**
             * ブランクキーを作成
             * エクスプレッション型/ブランクセル無し の場合は不要
             */
            if (blank_method != "expression1" && blank_pos != "none") {
                switch (blank_method) {
                    case "opacity":
                        /**
                         * 不透明度
                         * @type {string}
                         * @private
                         */
                        var blank_ = '0';
                        var cell_ = '100';
                        /**
                         * やはりこの処理は、ちと無理が
                         */
                        break;
                    case "wipe":
                        /**
                         * ワイプ
                         * @type {string}
                         * @private
                         */
                        var blank_ = '100';
                        var cell_ = '0';
                        /**
                         * ブランクタイムラインがすでにあるか否か確認
                         */
                        if (this.property("ADBE Effect Parade")("blankTimeLine")) {
                            /**
                             * すでにある場合、既存タイムラインを削除。
                             */
                            this.property("ADBE Effect Parade")("blankTimeLine").remove();
                            /**
                             * この処理は、アマアマなので、あとで確定処理に要変更 1/10
                             */
                        }
                        /**
                         * ブランク新作
                         */
                        var blankTimeLine = this.property("ADBE Effect Parade").addProperty("ADBE Linear Wipe");
                        blankTimeLine.name = "blankTimeLine";
                        blankTimeLine("ADBE Linear Wipe-0001").expression = "//--otomeBlankEffecte--\neffect(\"blankTimeLine\")(1);";
                        blankTimeLine("ADBE Linear Wipe-0001").expressionEnabled = false;
                        break;
                }
                for (n = 0; n < keyStackArray["blank"].length; n++) {
                    if (bufDataArray[keyStackArray["blank"][n]] == "blank") {
                        Vl = blank_
                    } else {
                        Vl = cell_
                    }
                    Fr = keyStackArray["blank"][n] / myXps.framerate;
                    switch (blank_method) {
                        case "opacity":
                            var kid = this.property("ADBE Opacity").addKey(Fr);
                            this.property("ADBE Opacity").setValueAtKey(kid, Vl);
                            if (kid == 1 && this.property("ADBE Opacity").numKeys > 1) {
                                for (var i = 2; i <= this.property("ADBE Opacity").numKeys; i++) {
                                    this.property("ADBE Opacity").removeKey(i);
                                }
                            }
                            this.property("ADBE Opacity").setInterpolationTypeAtKey(kid, KeyframeInterpolationType.HOLD);
                            break;
                        case "wipe":
                            var kid = blankTimeLine("ADBE Linear Wipe-0001").addKey(Fr);
                            blankTimeLine("ADBE Linear Wipe-0001").setValueAtKey(kid, Vl);
                            if (kid == 1 && blankTimeLine("ADBE Linear Wipe-0001").numKeys > 1) {
                                for (var i = 2; i <= blankTimeLine("ADBE Linear Wipe-0001").numKeys; i++) {
                                    blankTimeLine("ADBE Linear Wipe-0001").removeKey(i);
                                }
                            }
                            blankTimeLine("ADBE Linear Wipe-0001").setInterpolationTypeAtKey(kid, KeyframeInterpolationType.HOLD);
                    }
                }
            }
            if (false) {
                /**
                 * 出力
                 */
                if (blank_method != "expression1") {
                    if (blank_method == "opacity") {
                        /**
                         * ブランク
                         */
                        Result += blankBody;
                    }
                    /**
                     * リマップ
                     */
                    Result += remapBody;
                    if (blank_method == "wipe") {
                        /**
                         * ブランク
                         */
                        Result += blankBody;
                    }
                } else {
                    /**
                     * エクスプレッション1
                     */
                    Result += expBody;
                }
            }
        }

    }
    /**
     * return Result
     */
    return linkID;
};
/**
 * CompItem.getRootXps()
 * 引数    なし
 * 戻値    発見時はXpsオブジェクト それ以外はチェック用オブジェクト またはfalse
 * nas オートビルド環境下で、親コンポをたぐって元ステージのXpsオブジェクトを返すメソッド
 *
 * @returns {*}
 */
CompItem.prototype.getRootXps = function () {
    if (nas.XPSStore.getLength() === false) {
        return false
    }

    /**
     * コンポ自身がステージならばシートマッチを確認して返す
     * 手作業でプロジェクトの変更が行われたり、シートの読み直し・削除等があった場合は該当のXpsがない場合がある。
     * その場合は、チェック用無名オブジェクトを返すので、必要にしたがって処理
     */
    if (this.name.match(new RegExp("^\\(" + nas.itmFootStamps.stage[0] + "\\)"))) {
        var CheckString = this.comment.split("\n")[0].replace(new RegExp("^" + nas.itmFootStamps.stage[1]), "");
        /**
         * 何らかの事故で識別情報がない場合をチェックして必ず同定に失敗するダミー情報を付ける
         * @type {Object}
         */
        var myRecordCheck = (CheckString.match(/\{[^\}]+\}/)) ? eval("(" + CheckString + ")") : eval({
            "name": "",
            "modified": "",
            "length": "0",
            "url": ""
        });

        /**
         * チェックレコードを現在のシートと総当りで比較マッチしたら返して終了 //urlは補助情報なので比較対象としない
         */
        for (var idx = 0; idx < nas.XPSStore.getLength(); idx++) {
            var xpsRecord = nas.XPSStore.getInfo(idx + 1);
            if (
                (xpsRecord) &&
                (myRecordCheck.name == xpsRecord.name) &&
                (myRecordCheck.modified == xpsRecord.modified) &&
                (myRecordCheck.length == xpsRecord.length)
            ) {
                return nas.XPSStore.get(idx + 1)
            }
        }
        /**
         * 総当りではずれ
         */
        return myRecordCheck;
    } else {
        /**
         * コンポがステージではない場合はレイヤを総当りでさかのぼる
         */
        for (var idx = 0; idx < this.layers.length; idx++) {
            if (this.layers[idx + 1].source instanceof CompItem) {
                //		if(this.layers[idx+1].source.name.match(new RegExp("^\\("+nas.itmFootStamps.stage[0]+"\\)")))	{	}

                var myRoot = this.layers[idx + 1].source.getRootXps();
                if (myRoot instanceof Xps) {
                    return myRoot
                } else {

                }
            } else {
                //そもそもコンポじゃないのでスキップする
            }
        }
        return false;//コンポ内ではステージ未発見
    }
};

/**
 * CompItem.getRootXps()
 * CompItem.executeAction(Folder)
 *
 * コンポアイテムのメソッド
 * フォルダ内のリソースを順次実行する。
 *
 * 実行するリソースは現在の仕様では以下の通り
 *
 * ##*.ffx / ##*.jsx    (##は整数)
 *
 * 数字で開始されるファイル名を持つアニメーションプリセット、またはスクリプトをこのスクリプトのスコープで逐次実行します。
 * 同じ番号を持つスクリプトとプリセットがあった場合はプリセットを先に適用します。
 * 同じ番号のスクリプト・プリセット同士は昇順ソートで実行されます
 *
 * スクリプトが自動でundoGroupを設定しますので、スクリプト内でundoGroupを利用しない用に推奨
 *
 *
 * スクリプト実行時にthisプロパティはコンポ自身を指すので　利用可能
 *
 * プリセットは以下の順で適用される
 * アクティブなレイヤに順次
 * アクティブなレイヤがない場合はコンポと同じサイズのソリッドを新規作成して適用
 * 選択状態に注意
 * スクリプト内でのカレントフォルダは、ファイル位置に設定済み
 * フォルダの内容はエイリアスやショートカットでも良い(未実装)
 *
 * AE7以前ではスクリプトのみ実行
 *
 * @param targetFolder
 * @param skipUndo
 */
CompItem.prototype.executeAction = function (targetFolder, skipUndo) {
    if (!skipUndo) {
        skipUndo = false
    }
    /**
     * skip Undo
     */
    if (skipUndo)(nas.otome.writeConsole("skip Undo : " + targetFolder.name));
    /**
     * メソッド内でスクリプトを実行するので誤動作を減らすための囲い込みオブジェクト
     * @type {{}}
     */
    var exAc = {};
    exAc.myOrders = [];
    exAc.myActionsF = [];//スクリプトスタック
    exAc.myActionsS = [];//アクションスタック

    exAc.myFiles = targetFolder.getFiles();

    for (var idx = 0; idx < exAc.myFiles.length; idx++) {
        if (exAc.myFiles[idx].name.match(/^([\d]+)[^\d].*\.(jsx|ffx)$/i)) {
            exAc.myOrderId = RegExp.$1 * 1;
            exAc.myExt = RegExp.$2;
            exAc.myExt = exAc.myExt.toLowerCase();
            switch (exAc.myExt) {
                case "ffx":
                    exAc.myActionsF.push({"orderId": exAc.myOrderId, "body": exAc.myFiles[idx]});
                    break;
                case "jsx":
                    exAc.myActionsS.push({"orderId": exAc.myOrderId, "body": exAc.myFiles[idx]});
                    break;
            }
            exAc.currentStr = ":" + exAc.myOrders.join(":");
            if (exAc.currentStr.match(new RegExp(":" + exAc.myOrderId))) {
                continue
            } else {
                exAc.myOrders.push(exAc.myOrderId)
            }
        }
    }
    if (exAc.myOrders.length) {
        /**
         * ソートする
         * @type {Array.<*>}
         */
        exAc.doOrders = exAc.myOrders.sort();
        /**
         * ソートした順にプリセット・スクリプトを逐次実行
         */
        for (exAc.idx = 0; exAc.idx < exAc.doOrders.length; exAc.idx++) {
            if (appHost.version >= 7) {
                for (var fIdx = 0; fIdx < exAc.myActionsF.length; fIdx++) {
                    if (exAc.myActionsF[fIdx].orderId == exAc.doOrders[exAc.idx]) {
                        if (this.selectedLayers.length) {
                            for (var lIdx = 0; lIdx < this.selectedLayers.length; lIdx++) {
                                this.selectedLayers[lIdx].applyPresetA(exAc.myActionsF[fIdx].body)
                            }
                        } else {
                            this.applyPreset(exAc.myActionsF[fIdx].body);//プリセット適用(コンポ)
                        }
                    }
                }
            }

            for (exAc.sIdx = 0; exAc.sIdx < exAc.myActionsS.length; exAc.sIdx++) {
                if (exAc.myActionsS[exAc.sIdx].orderId == exAc.doOrders[exAc.idx]) {
                    nas.GUI.prevCurrentFolder = Folder.current;
                    exAc.scriptFile = new File(exAc.myActionsS[exAc.sIdx].body.fsName);
                    Folder.current = exAc.scriptFile.path;
                    if (exAc.scriptFile.exists) {
//					nas.otome.writeConsole("open & exec "+exAc.scriptFile.name);
                        if (!skipUndo) {
                            nas.otome.beginUndoGroup(exAc.scriptFile.name)
                        }
                        exAc.scriptFile.open();
                        eval(exAc.scriptFile.read());
                        exAc.scriptFile.close();
                        if (!skipUndo) {
                            nas.otome.endUndoGroup()
                        }
                    } else {
                        alert(exAc.scriptFile.name + " is not Exists!" + nas.GUI.LineFeed + "current :" + Folder.current.parent.name + "/" + Folder.current.name);
                    }
                    Folder.current = nas.GUI.prevCurrentFolder;
                    /**
                     * @desc ファンクションコールと同内容だがここで実行しないとスコープ変わる
                     */
                }
            }
        }
    }
};

/**
 * CompItem.addClipTarget(camWidth,camAspect)
 * 引数
 * camWidth    フレーム横幅をpixelで
 * camAspect    フレーム縦横比を　(幅÷高さ)の単数で与える
 * 3:4(TV)=1.33333333
 * 16:9(HDTV)=1.7777778
 * 22:16(35mmシネ)=1.375
 * 有効桁7桁程度で指定してください。
 * それ以上精度を高くしてもピクセルで丸めちゃうのであまり意味はないです。
 * camColor　カラー配列　流用オブジェクトがあった場合はそちらを優先するので色指定は意味を持たない…いまのところ
 * アニメーション撮影で使用するクリッピングターゲット（カメラレイヤ）を設定するメソッド
 * コンポのメソッドとして実装するので、コンポ特定部分は不要（それはメソッドの外で行なう）
 * 指定なしの場合はnasライブラリの持つ標準値を使用します。
 * ライブラリの書き換を行なっておくと便利です。
 *
 * @param camWidth
 * @param camAspect
 * @param camColor
 * @returns {*}
 */
CompItem.prototype.addClipTarget = function (camWidth, camAspect, camColor) {
    var targetName = "_clippingTarget";
    var footPrint = "##nas.otome cameraWorkTarget";
    /**
     * 処理済なら終了
     */
    if ((this.layers.length) && (this.layers[1].comment == footPrint)) {
        return false;
    }
    if (isNaN(camWidth)) {
        camWidth = 2 * Math.ceil((nas.inputMedias.selectedRecord[1] * 1) * (nas.inputMedias.selectedRecord[3] / 25.4) / 2);
    }
    if (isNaN(camAspect)) {
        camAspect = eval(nas.inputMedias.selectedRecord[2]);
    }
    if (!camColor) {
        camColor = [0, 1, 0]
    }
    /**
     * デフォルトキミドリ
     * とりあえずnasプロパティを読むがそのうちMAP参照にきりかえ
     * @type {number}
     */
    var camHeight = 2 * Math.ceil((camWidth / camAspect) / 2);
    /**
     * カメラサイズは偶数ピクセルにしておく
     * カメラ作成時にソースサイズは2の倍数ピクセルで近似値をとります
     */
    var myCameraSolid = null;
//alert([camWidth,camHeight,camAspect].join(" / "));
    /**
     * プロジェクト内の平面の中からマッチするオブジェクトがあるか否か検索
     * @type {*}
     */
    var mySolids = app.project.pickItems("solid");
    var camRegex = new RegExp(targetName + "|cam(era)?|カメラ|frame", "i");
    for (var iIdx in mySolids) {
        if (mySolids[iIdx].name.match(camRegex)) {
            if (
                (mySolids[iIdx].width == camWidth) &&
                (mySolids[iIdx].height == camHeight)
            ) {
                myCameraSolid = mySolids[iIdx];
                break;//最初に発見したsolidを使う
            }
        }
    }
    /**
     * action
     */
    nas.otome.beginUndoGroup("addClippingTarget(otome)");
    if (!myCameraSolid) {
        var myCameraLayer = this.layers.addSolid(camColor, targetName, camWidth, camHeight, 1, this.duration);
        myCameraSolid = myCameraLayer.source.mainSource;
    } else {
        var myCameraLayer = this.layers.add(myCameraSolid);
    }
    /**
     *  カメラレイヤのプロパティ調整
     */
    if (myCameraLayer.name != targetName) {
        myCameraLayer.name = targetName
    }
    /**
     * ブレンドモードを指定モードに
     */
    myCameraLayer.blendingMode = BlendingMode.MULTIPLY;
    /**
     * ガイドレイヤ属性
     * @type {boolean}
     */
    myCameraLayer.guideLayer = true;
    /**
     * 開始時間が0以外の場合はシフトする
     */
    if (myCameraLayer.startTime != 0) {
        myCameraLayer.startTime = 0
    }
    /**
     * 足跡ぽん
     * @type {string}
     */
    myCameraLayer.comment = footPrint;

    /**
     * タイムシートにカメラワーク指定があればMAP内にキーフレームを検索して配置
     */

    nas.otome.endUndoGroup();
    return myCameraLayer;
};


/**
 * CompItem.mkClipWindow(compName,myScale,myOption)
 * 引数
 * compName    作成するコンポの名前　省略時は 現在のコンポ名+"(clip)"
 * myScale    クリップウインドウのスケールを%で　省略値は　100 (カメラ等倍)
 * myOption    オプション文字列各種
 * margin##    クリップエリアのマージンを％指定マイナス数値で外側をクリップ 省略値　0
 *
 * コンポにクリップターゲットがある場合のみターゲットを参照するクリッピングコンポを作成する。(通称カメラコンポ)
 * コンポ自身の第一レイヤがクリップターゲットでない場合は動作しない
 * 戻り値は作成したコンポまたはfalse
 *
 * @param compName
 * @param myScale
 * @param myOption
 * @returns {*}
 */
CompItem.prototype.mkClipWindow = function (compName, myScale, myOption) {
    var myStgName = this.name.replace(new RegExp("\\(" + nas.itmFootStamps.stage[0] + "\\)"), "");//ステージのテイクナンバを含んでプレフィックスを払った文字列
    if (compName) {
        compName = nas.itmFootStamps.clipWindow[0] + nas.biteClip(compName, 31 - nas.itmFootStamps.clipWindow[0].length);
    } else {
        compName = nas.itmFootStamps.clipWindow[0] + nas.biteClip(myStgName, 31 - nas.itmFootStamps.clipWindow[0].length);
    }
    if ((!myScale) || (isNaN(myScale)) || (myScale == 0)) {
        myScale = 100
    }
    var myMargin = 0;
    if ((myOption) && (isNaN(myOption)) && (myOption.match(/margin(-?\d+)/))) {
        myMargin = (RegExp.$1 * 1);
    }
    var footPrint = "##nas.otome cameraWorkTarget";
    /**
     * 第一レイヤにカメラがなければ終了
     */
    if (this.layer(1).comment == footPrint) {
        var myTarget = this.layer(1);//ターゲット取得
    } else {
        return false
    }
    /**
     * コンポ基準サイズをターゲットから取得
     * @type {number}
     */
    var compWidth = (myTarget.source.width * myScale / 100) * (100 + myMargin) / 100;
    var compHeight = (myTarget.source.height * myScale / 100) * (100 + myMargin) / 100;
    /**
     * undoグループ開く
     */
    nas.otome.beginUndoGroup("カメラコンポ作成");
    /**
     * 作る
     */
    var myComp = app.project.items.addComp(compName, compWidth, compHeight, this.pixelAspect, this.duration, this.frameRate);
    /**
     * レイヤ投げ込み
     */
    if (myComp) {
        myComp.comment = nas.itmFootStamps.clipWindow[1];
        var myLayer = myComp.layers.add(this);
    }
    /**
     * ここでundo閉じる
     */
    nas.otome.endUndoGroup();

    /**
     * 定型処理実行
     * @type {Folder}
     */
    var myAction = new Folder(Folder.scripts.path.toString() + "/Scripts/nas/(actions)/systemResources/CompItem.clipWindow");
    if ((myLayer) && (myAction.exists)) {
        myComp.executeAction(myAction)
    }
    return myComp;
};

/**
 * CompItem.mkOutputMedia(compName,omIndex,myOption)
 * 引数
 * compName    作成するコンポの名前　省略時は 現在のコンポ名+"(output)"
 * OMIndex    使用するアウトプットメディアDBのID　省略時は現在選択されているメディア
 * myOption    オプション文字列各種
 * boardOFF    標準のボールド(スレート)を作成しない.別に作成したボールドをつける際などに指定
 *
 * 指定のコンポをスケーリングして出力メディアののコンポにセットする
 * 縦横比が合わない場合は、
 * 戻り値は作成したコンポまたはfalse
 *
 * @param compName
 * @param omIndex
 * @param myOption
 */
CompItem.prototype.mkOutputMedia = function (compName, omIndex, myOption) {
    var myStgName = this.name.replace(new RegExp("\\(...\\)"), "");//ステージのテイクナンバを含んでプレフィックスを払った文字列
    if (compName) {
        compName = nas.itmFootStamps.outputMedia[0] + nas.biteClip(compName, 31 - nas.itmFootStamps.outputMedia[0].length);
    } else {
        compName = nas.itmFootStamps.outputMedia[0] + nas.biteClip(myStgName, 31 - nas.itmFootStamps.outputMedia[0].length);
    }
    if (!(isNaN(omIndex))) {
        nas.outputMedias.select(omIndex)
    }
    var noBoard = false;
    if ((myOption) && (isNaN(myOption)) && (myOption.match(/boardOFF/))) {
        noBoard = true;
    }

    /**
     * コンポサイズをＤＢから取得
     * 文字列で記録されているので数値化 ケースによって整数化が必要だがソレはパラメータ調整で対応？
     * @type {number}
     */
    var compWidth = 1 * (nas.outputMedias.selectedRecord[1]);
    var compHeight = 1 * (nas.outputMedias.selectedRecord[2]);
    var compAspect = 1 * (nas.outputMedias.selectedRecord[3]);
    var compFrameRate = 1 * (nas.outputMedias.selectedRecord[4]);
    /**
     * undoグループ開く
     */
    nas.otome.beginUndoGroup("出力コンポ作成");
    /**
     * 作る
     */
    var myComp = app.project.items.addComp(compName, compWidth, compHeight, compAspect, this.duration, compFrameRate);//レイヤ投げ込み
    /**
     * 作成成功ならレイヤを投入
     */
    if (myComp) {
        myComp.comment = nas.itmFootStamps.outputMedia[1];
        var myLayer = myComp.layers.add(this);
    }
    /**
     * ここでundo閉じる
     */
    nas.otome.endUndoGroup();
    /**
     * 定型処理実行レイヤマッチング
     * @type {Folder}
     */
    var myAction = new Folder(Folder.scripts.path.toString() + "/Scripts/nas/(actions)/systemResources/CompItem.mkOutputMedia");
    if ((myAction.exists) && (myLayer)) {
        myComp.executeAction(myAction);
    }
    /**
     * ボールド設定
     */
    if ((myComp) && (!noBoard)) {
        var myBoldAction = new Folder(Folder.scripts.path.toString() + "/Scripts/nas/(actions)/mkBoard");
        if ((myBoldAction.exists) && (myLayer)) {
            myComp.executeAction(myBoldAction, true)
        }
        /**
         *  コンポのメソッドで呼んでボールドをつける
         */
    }
};

/*=============================オートビルダ関連タイムシート適用メソッド=====================2009/10/22=======*/

/**
 * nast直下の拡張コマンド
 * 互換のため入れ替え終了までは、同名のユーティリティー関数のラッパであります。
 * 2007/11/07
 */

systemOpen = function (targetFileName) {
    return nas.otome.systemOpen(targetFileName);
};
uriOpen = function (targetURI) {
    return nas.otome.uriOpen(targetURI);
};
otomeCall = function (order) {
    return nas.otome.doComp(order);
};
versionView = function () {
    return nas.otome.versionView();
};

/*+++++++++++++++++++++++++++++++++++++XPSトレーラー関連コード++++++++++++++++++++++++++++++++++++++++++++++*/

/**
 * XPSStore　(シートトレーラ)
 *
 * XPSheetStore オブジェクト
 * プロジェクト内部にタイムシートを複数記録維持して切り換えて使用する仕組み
 * フッテージストア内部にコンポの形で記録する
 * インデックスがあり、選択値を切り換えてバッファとの間にやりとりを行う
 * バッファはXPS(=従来のXPSオブジェクトをそのまま使用)
 * XpsStore.body        実際にシートを格納してあるコンポ
 * コンポの下にはテキストレイヤを置いてXPSテキストを置く改行は"\\r\\n"に置換
 * XpsStore.selected    カレントのタイムシートレイヤをさす。カレントがない場合もあるその場合はnull または　false
 * デフォルトの値ではnull / レイヤが存在する場合はfalseを与える
 *
 * XpsStore.currentIndex    カレントインデックスを記録する内部変数　外部操作禁止
 *
 * XpsStore.getLength()    シート総数を返す
 * ０を返さずにfalseを返す場合は現状でシート操作環境がない事を表している。
 * もし、シート操作環境が必要な場合は　XpsStore.initBody()メソッドで初期化すると環境が構築される。
 * XpsStore.get(index)    indexで指定されたレイヤからXpsオブジェクトを取得
 * XpsStore.set(index,Xps)    indexで指定されたレイヤにXpsオブジェクトを登録する
 * XpsStore.pop(index)    indexで指定されたシートのデータをXPSバッファに転送する。
 * indexが指定されなければカレントのシートに対して実行
 * XpsStore.push(index)    indexで指定されたシートにXPSバッファのデータをセットする。内部でsetInfo()を実行する。
 * indexが指定されなければカレントのシートに対して実行
 * XpsStore.select(index)    カレントインデックスを切り替えバッファ内容を更新する。
 * 戻り値は選択されているシートのインデックス。数値のほかにキーワード"fwd,prv,start,end"を受け付ける
 * XpsStore.getInfo(index)    指定indexのシートのモディファイド情報を取得
 * 戻り値は情報オブジェクト
 * indexが指定されなければカレントのシートに対して実行
 * XpsStore.setInfo(index)    指定indexのシートに現行のXPSバッファのモディファイド情報を設定
 * 戻り値は情報オブジェクト
 * indexが指定されなければカレントのシートに対して実行
 * XpsStore.add(Xps)    Xpsオブジェクトを直接渡して新規にシート(テキストレイヤ)を作成する。
 * XPSバッファを同時更新
 * カラ指定の場合はXPSバッファから作成
 * 既存シートとの重複は関知しないのであらかじめ確認は必要
 * 戻値は追加成功したテキストレイヤ
 * XpsStore.remove(index)    指定indexのシートをプロジェクトから削除する。インデックスは必ず指定すること。
 * インデックス不指定時は失敗させる
 * 成功時の戻り値は新たなバッファ内容(Xps)またはnull(残シートなしの時)
 * XpsStore.duplicate(index,name)    指定indexのシートをnameで複製する。インデックスは必ず指定すること。
 * 名前が指定されなかった場合は元のカット番号に"copy of "を前置する
 * 成功時の戻り値は新たなバッファ内容(Xps)　失敗時はfalse (未実装　2010 12 19)
 * XpsStore.setBody()    内部で使用するメソッド、ライブラリを参照してbodyを自身のオブジェクトとして再設定する
 * 設定済みの場合は何もしない。外部アクセス禁止
 *
 * XpsStore.initBody()    内部で使用する初期化メソッド
 * カラのトレーラを作るので注意
 *
 * @constructor
 */
function XpsStore() {
    this.body = false;//false or CompItem
    this.selected = null;//null or TextLayer
    this.currentIndex = 0;//選択状態なし

    /**
     * AE65用ダミープロパティ
     * 新規プロパティを作る
     * @type {string}
     */
    var myProp = "{";
    myProp += "\"name\" :\"AE65dummyProp\",";
    myProp += "\"modified\" :\"" + new Date().toNASString() + "\",";
    myProp += "\"length\" :\"==000000==\",";//"=="でエスケープしてある場合はファイルなし
    myProp += "\"url\" :\"\"}";//"=="でエスケープしてある場合はファイルなし
    this.AE65Prop = eval("\(" + myProp + "\)");

    this.setBody = function (myIndex) {
        /**
         * myIndexは整数で与えること　初期値はcurrentIndex
         * @type {*}
         */
        var myTarget = app.project.items.getByName(nas.sheetBinder);//あとで変更
//		if(myIndex<0)myIndex=0;
//		if(myIndex>myTarget.layers.length)myIndex=myTarget.layers.length;
        if (
            (myTarget) &&
            (myTarget.parentFolder.name == nas.ftgFolders["etc"][0]) &&
            (myTarget.parentFolder.parentFolder.name == nas.ftgFolders["ftgBase"][0])
        ) {
            this.body = myTarget;
            if ((isNaN(myIndex)) || (myIndex > this.body.layers.length)) {
                myIndex = this.currentIndex
            }
            this.selected = ((myTarget.layers.length) && (myIndex)) ? myTarget.layers[Math.floor(myIndex)] : null;
        } else {
            /**
             * ないときに初期化したほうが良いかも？
             * @type {boolean}
             */
            this.body = false;
            this.selected = null;
            this.currentIndex = 0;
        }
        return myTarget;
    };

    this.initBody = function () {

        /**
         * すでにあれば空コンポに初期化する。　コンポがなければ新規に作る。　初期化用
         * 初期状態のシート保持数は0 選択インデックスは0
         * @type {*}
         */

        var myTarget = app.project.items.getByName(nas.sheetBinder);
        if (
            (myTarget) &&
            (myTarget.parentFolder.name == nas.ftgFolders["etc"][0]) &&
            (myTarget.parentFolder.parentFolder.name == nas.ftgFolders["ftgBase"][0])
        ) {
            this.body = myTarget;
            for (var lIdx = 1; lIdx <= this.body.layers.length; lIdx++) {
                this.body.layers[lIdx].remove();
            }
        } else {
            if (!(app.project.items.getByName(nas.ftgFolders["ftgBase"][0]))) {
                app.project.items.addFolder(nas.ftgFolders["ftgBase"][0]);
            }
            if (!(app.project.items.getByName(nas.ftgFolders.ftgBase[0]).items.getByName(nas.ftgFolders.etc[0]))) {
                app.project.items.getByName(nas.ftgFolders.ftgBase[0]).items.addFolder(nas.ftgFolders.etc[0]);
            }

            this.body = app.project.items.getByName(nas.ftgFolders.ftgBase[0]).items.getByName(nas.ftgFolders.etc[0]).items.addComp(nas.sheetBinder, 640, 480, 1, 1, 1);
        }
        this.select(0);
        return this.body;
    };
    /**
     * 暫定操作メソッド
     */
//getLength of XpSheets
    this.getLength = function () {
        if (this.setBody() == null) {
            return false
        }
        return this.body.layers.length;
    };
//select selectIndex chicetimesheetIndex
    this.select = function (index) {
        if ((!index) && (this.selected instanceof TextLayer)) {
            if (index != 0) {
                return this.selected.index
            }
        }
        if (index < 0) {
            index = 0
        }
        if (index > this.body.layers.length) {
            index = this.body.layers.length
        }
        /**
         * 現状ではキーワードは未サポート
         */
        if (!this.getLength()) {
            if (!this.setBody(index)) {
                return false;
            }
        }
//			nas.otome.writeConsole("start isSame : index= "+this.selected.index);
        if (index == 0) {
            this.currentIndex = 0;
            this.selected = null;
            return 0
        }
        /**
         * 解除（バッファの内容は残る。注意　初期化はしない）;
         */
        if (isNaN(index)) {
            return this.currentIndex;
        }
        if (index > this.getLength()) {
            return this.selected.index;
        }
        this.selected = this.body.layers[index];
        this.currentIndex = index;
//			nas.otome.writeConsole("before isSame : index= "+this.selected.index);
        if (!XPS.isSame(this.get(index))) {
            this.pop(index)
        }
        /**
         * 現行のバッファの内容をアップデートする　（ないほうが良いかも？？）
         */
//			nas.otome.writeConsole("after isSame : index= "+this.selected.index);
        return this.selected.index;
    };
//get Xps from XPSStore
    /**
     * このメソッドは取得のみでバッファは無視
     * @param index
     * @returns {*}
     */
    this.get = function (index) {
        if (!this.getLength()) {
            if (!this.setBody(index)) {
                return false;
            }
        }
        if (!index) {
            index = (this.selected) ? this.selected.index : 0
        }
        if ((isNaN(index)) || (index < 1) || (index > this.getLength())) {
            return false
        }
        var myXps = new Xps();
        myXps.readIN(this.body.layers[index].sourceText.value.text.replace(/\\r\\n/g, "\n"));
        return myXps;
    };
//set XPSStore from Object Xps
    /**
     * このメソッドはセットのみでバッファは無視? セレクトしたほうが重宝かも　一考中
     * @param index
     * @param myXps
     * @returns {*}
     */
    this.set = function (index, myXps) {
        if (!this.getLength()) {
            if (!this.setBody(index)) {
                return false;
            }
        }
        if ((isNaN(index)) || (index < 1) || (index > this.getLength())) {
            return false
        }
        if (!myXps) {
            myXps = XPS;
        }
        if (myXps instanceof Xps) {
            this.body.layers[index].sourceText.setValue(myXps.toString().replace(/\n/g, "\\r\\n"));
            this.pop(index);//バッファセット どうしようかな
            return index;
        }
        return false;
    };
//add XPSStore from Object Xps
    /**
     * 直接addした場合はsetInfo忘れずに
     * 引数なしの場合は新規Xpsを追加する
     * @param myXps
     * @returns {*}
     */
    this.add = function (myXps) {
        if (!this.getLength()) {
            if (!this.setBody()) {
                return false;
            }
        }
        if (!myXps) {
            myXps = new Xps();
            myXps.readIN(XPS.toString());
        }
//		alert((myXps instanceof Xps))
        if (myXps instanceof Xps) {
            var myNewTimeSheet = this.body.layers.addText(new TextDocument(myXps.toString().replace(/\n/g, "\\r\\n")));
            myNewTimeSheet.name = [myXps.scene, myXps.cut].join("_");
//			if(XPS.toString()!=myXps.toString()){XPS.readIN(myXps.toString());};//このルーチンの最後のselect()メソッドで解決するのでこの行不要
            /**
             * プロパティ転記
             */
            //		this.setInfo(myNewTimeSheet.index);
            if (this.select(myNewTimeSheet.index)) {
                return this.selected
            }
            /**
             * 現行シートを新規ストアしたのでカレントを移す
             * 成功時レイヤを戻す
             */
        }

        return false;
    };
    /**
     * remove timesheet
     * @param index
     * @returns {*}
     */
    this.remove = function (index) {
        if (!this.getLength()) {
            if (!this.setBody(index)) {
                return false;
            }
        }

        if (!index) {
            if (this.selected != null) {
                index = this.selected.index;
            } else {
                return false;
            }
        }
        if (index > this.body.layers.length) {
            return false;
        }
        if ((this.selected != null) && (index <= this.selected.index)) {
            /**
             * 削除レイヤがカレントより上ならそのまま削除
             * 削除レイヤがカレント以下ならカレントが移動する
             * （元のインデックスを第一候補にして元のインデックスがなくなる場合は一番下げる。ラストならヌルで選択解除）
             * @type {number}
             */
            var nextIndex = index - 1;//すでに0が除外されているので負にはならない。
//			if(nextIndex==this.body.layers.length) nextIndex--;//
            this.body.layers[index].remove();//削除する
            if (this.body.layers.length) {
                this.select(nextIndex)
            }
            /**
             * カレント移動（0なら解除）
             */
//			if(nextIndex){this.selected=this.body.layers[nextIndex];}else{this.selected=null;}
        } else {
            this.body.layers[index].remove();//レイヤ削除する
        }
        return this.selected;
    };
    /**
     * pop XPSContents from XPSStore currentStack toXPSBuffer
     * @param index
     * @returns {*}
     */
    this.pop = function (index) {
        if (!this.getLength()) {
            if (!this.setBody(index)) {
                return false;
            }
        }

        if (!index) {
            if (this.selected) {
                index = this.selected.index;
            } else {
                return false;
            }
        }
        if (index > this.body.layers.length) {
            return false;
        }
        if (this.body.layers[index]) {
            this.selected = this.body.layers[index];
            this.currentIndex = index;
            var myContents = this.selected.sourceText.value.text.replace(/\\r\\n/g, "\n");
            var myXps = new Xps();
            myXps.readIN(myContents);
            if (!XPS.isSame(myXps)) {
                XPS.readIN(myContents);
            }
            /**
             *  現行のバッファの内容をアップデートする
             */
            return index;
        }
        return false;
    };//
    /**
     * push XPSContents from XPSBuffer to XPSStore currentStack
     * @param index
     * @returns {*}
     */
    this.push = function (index) {
        if (!this.getLength()) {
            if (!this.setBody(index)) {
                return false;
            }
        }

        if (!index) {
            if (this.selected) {
                index = this.selected.index;
            } else {
                return false;
            }
        }
        this.selected = this.body.layers[index];
        this.currentIndex = index;
        if (this.selected.sourceText.value.text.replace(/\\r\\n/g, "\n") != XPS.toString()) {
            this.selected.sourceText.setValue(XPS.toString().replace(/\n/g, "\\r\\n"));
            this.setInfo(index);
            return index;
        }
        return false;
    };
    /**
     * toString resultXPSContent from currentSheet
     * @param index
     * @returns {*}
     */
    this.toString = function (index) {
        if (!this.getLength()) {
            if (!this.setBody(index)) {
                return false;
            }
        }

        if (!index) {
            if (this.selected) {
                index = this.selected.index;
            } else {
                return false;
            }
        }
        if (index > this.body.layers.length) {
            return false;
        }
        if (this.body.layers[index]) {
//			this.selected=index;//切り替えない
            return this.body.layers[index].sourceText.value.text.replace(/\\r\\n/g, "\n") + "\n";
        }
    };
    /**
     * get XPSInfo from currentSheet
     * @param index
     * @returns {*}
     */
    this.getInfo = function (index) {
        if (!this.getLength()) {
            if (!this.setBody(index)) {
                return false;
            }
        }
        if (appHost.version < 7) {
            return this.AE65Prop
        }
        /**
         * AE65の場合はダミープロパティを返す
         */
        if (!index) {
            if (this.selected) {
                index = this.selected.index;
            } else {
                return false;
            }
        }
        if (index > this.body.layers.length) {
            return false;
        }
        if (this.body.layers[index]) {
            var myProps = eval("\(" + this.body.layers[index].comment + "\)");//JSONのはずなんだけど怖いよね
            if (!myProps) {
                var myXps = new Xps();
                myXps.readIN(this.body.layers[index].text.sourceText.value.text);
                myProps = myXps.getInfo();
            }
            return myProps;
        }
        return false;
    };

    /**
     * setXPSInfo to currentSheet from XPSBuffer
     * @param myIndex
     * @param myFile
     * @returns {*}
     */
    this.setInfo = function (myIndex, myFile) {
        if (!myIndex) {
            if (this.selected) {
                index = this.selected.index
            } else {
                return false
            }
        }
        if (!this.getLength()) {
            if (!this.setBody(index)) {
                return false;
            }
        }
        if (appHost.version < 7) {
            var storeName = [XPS.scene, XPS.cut].join("_");//
            this.body.layers[myIndex].name = storeName;
            return this.AE65Prop;
        }
        /**
         * AE65の場合はダミープロパティを返す
         */
        if (myIndex > this.body.layers.length) {
            return false;
        }
        if (this.body.layers[myIndex]) {
            var storeName = [XPS.scene, XPS.cut].join("_");//
            var myContent = XPS.toString();

            /**
             * 新規プロパティを作る
             * ファイルが与えられた場合は、ファイルから　ない場合は現状のデータから
             */
            if (myFile) {
                var newProp = "{";
                newProp += "\"name\" :\"" + myFile.name + "\",";
                newProp += "\"modified\" :\"" + myFile.modified.toNASString() + "\",";
                newProp += "\"length\" :\"" + myFile.length + "\",";
                newProp += "\"url\" :\"" + myFile.absoluteURI;
                newProp += "\"}";
            } else {
                var newProp = XPS.getInfo().toSource();
            }

//				alert(newProp + myFile.toString() );
            this.body.layers[myIndex].comment = newProp;
            /**
             * レイヤ名を識別子で置き換え
             * @type {string}
             */
            this.body.layers[myIndex].name = storeName;


            return eval("\(" + newProp + "\)");
        }
        return false;
    };
    /**
     * 関連付けられているコンポのupdate
     * @param indx
     * @returns {number}
     */
    this.update = function (indx) {
        /**
         * indxはシートindex =シートキャリアのレイヤインデックスと一致　1～
         * @type {string}
         */
        var myIdentifier = this.get(indx).getIdentifier('cut');
        /**
         * チェックするシートの識別を取得
         * アイテム総当り
         * @type {number}
         */
        var myResult = 0;
        for (var idx = 1; idx <= app.project.items.length; idx++) {
            /**
             * CompItem && ステージプレフィックスありコメントシグネチャあり
             * 3条件を自動更新の必要条件にする…かためカモ
             */
            if (
                (app.project.item(idx) instanceof CompItem) &&
                (app.project.item(idx).name.match(new RegExp("^\\(" + nas.itmFootStamps.stage[0] + "\\)"))) &&
                (app.project.item(idx).comment.match(new RegExp("^" + nas.itmFootStamps.stage[1])))
            ) {
                var myXps = app.project.item(idx).getRootXps();//コンポからXPS取得
                if (myXps) {
                    /**
                     * Xpsがあれば識別情報を比較　一致したら適用
                     */
                    if (myIdentifier == myXps.getIdentifier('cut')) {
                        app.project.item(idx).applyXPS(myXps);
                        nas.otome.writeConsole("updated Comp [" + idx + "] " + app.project.item(idx).name);
                        //	myComps.push(app.project.item(idx));
                        myResult++;
                    }
                }
            }
        }
        return myResult;
    };
    /**
     * このアルゴリズムだと、カット識別が重複した（コンポが複数ある）場合複数のコンポが誤認で更新される場合があるが、それは仕様とする。
     * 同一プロジェクト内部での関連付けの重複である。コンフリクトに注意
     */
}
nas.XPSStore = new XpsStore();

/**
 * 全文比較をやめる
 * XPS同士の比較関数が必要修正点を求めるのにbody/memo/propを比較してやらないと日付のみ違って内容のおなじファイルの処理スキップができない
 * Ｘｐｓ.isSame(targetXps)が要る
 * Xpsioの拡張
 */

/*++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++*/


/**
 * 乙女ユーティリティ関数群
 * 乙女undo
 * 乙女がundoGroupをメモしてundoの管理をします
 * undoGroupが閉じられずに次が発行されたら閉じてから次を打ちますのでエラー回避に役立つはず
 * app.begin/end UndoGroupのラッパです
 *
 * @type {string}
 */
nas.otome.undoGroup = "";//nullで初期化グループ名バッファ
nas.otome.beginUndoGroup = function (myGroup) {
    if (!myGroup) {
        return false
    }
    if (this.undoGroup != "") {
        nas.otome.writeConsole("undoGroup修正 :" + this.undoGroup);
        app.endUndoGroup();
        this.undoGroup = "";
    }
    app.beginUndoGroup(myGroup);
    this.undoGroup = myGroup;
};
nas.otome.endUndoGroup = function (myGroup) {
    if ((myGroup) || (this.undoGroup == "")) {
        return false
    }
    if (this.undoGroup != "") {
        app.endUndoGroup();
        this.undoGroup = "";
    }
};

/**
 * 乙女コンソール表示
 * コンソールがほしいのでもうしょうがないから書く
 * 暫定的にtestConsoleオブジェクトを使うが、そのうち受け皿をちゃんとつくる
 * @param msg
 */
nas.otome.writeConsole = function (msg) {
    /**
     * そのうちエスケープシーケンス実装する　あれ？テキストエディットオブジェクトがすでにもってるか？　後で調べる
     */
    if (nas.otome.dbgConsole) {
        nas.otome.dbgConsole.resultBox.text += msg + nas.GUI.LineFeed
    } else {
        writeLn(msg)
    }
};
/**
 * コンポジションに対する関数実行
 * @param order
 * @returns {boolean}
 */
nas.otome.doComp = function (order) {
    if (!app.project) return false;
    if ((!app.project.activeItem) || !(app.project.activeItem instanceof CompItem)) {
        alert("コンポアイテムを選択してくらさい");
        return false;
    }
    this.beginUndoGroup(order);
    switch (order) {
        case    "セル並び替え":
            nas.otome.reOrderCell(app.project.activeItem);
            break;
        case    "L/Oモード変更":
            nas.otome.reViewLayout(app.project.activeItem);
            break;
        case    "レイヤ名推測":
            nas.otome.reNameCell(app.project.activeItem);
            break;
        case    "セルをゴニョ…":
            nas.otome.clipCell(app.project.activeItem);
            nas.otome.smoothCell(app.project.activeItem);
            break;
        default    :
    }
    this.endUndoGroup();
    return true;
};

/**
 * ファイル名を与えてシステムで実行
 * @param targetFileName
 * @returns {boolean}
 */
nas.otome.systemOpen = function (targetFileName) {
//	if(!targetFileName.toString()){return false;};
    if (File(targetFileName).exists) {
        try {
            if (File(targetFileName).alias) {
                File(targetFileName).resolve().execute();
            } else {
                File(targetFileName).execute();
            }
            return true;
        } catch (err) {
            alert("OH NO ERROR")
        }
    } else {
        alert("no file exists");
        return false;
    }
};

/**
 * システム実行を使って指定のURLを開く アドレスの存在チェックはしてない
 * @param targetURI
 */
nas.otome.uriOpen = function (targetURI) {
    var TempFile = new File(Folder.temp.fullName + "/__nasTemp.html");
//	if(TempFile.exists){alert("HEAR!")}else{alert(TempFile.name)};

    var myContent = "<html><head><script language=javascript>";
    myContent += "location.href=\"" + targetURI + "\"";
    myContent += "</script></haed><body></body></html>";

    TempFile.open("w");
    TempFile.write(myContent);
    TempFile.close();
//		File(TempFile.fsName).execute();
    TempFile.execute();
    TempFile.remove();
};

/**
 * おまけコマンド バージョン表示
 * @returns {boolean}
 */
nas.otome.versionView = function () {
    var myVersions = "";
    var myVersioncount = 0;
    for (item in nas.Version) {
        myVersions += nas.Version[item] + nas.GUI.LineFeed;
        myVersioncount++;
    }
    var msg = "「レンダー乙女」 Ver." + nas.otomeVersion;
    msg += "\nAdobeAE用 ねこまたや「お道具箱」\n\n";
    msg += "現在オンメモリのモジュール一覧 :\n";
    msg += "=============================\n";
    msg += myVersions.toString();
    msg += "=============================\n";
    alert(msg);
    return true;
};
/**
 *
 * @params {File}    myOpenFile
 * @returns {Sring}
 */
function STS2XPSestk(myOpenFile) {
    /**
     * 識別文字列位置を確認してファイルフォーマット判定
     */
    myOpenFile.open("r");
    var checkVer = myOpenFile.read(18);
    myOpenFile.close();
    if (!checkVer.match(/^\x11ShiraheiTimeSheet$/)) {
        return false;
    };
// オープンして配列にとる
    myOpenFile.open("r");
    mySTS = myOpenFile.getBin();
    myOpenFile.close();
    return STS2XPS(mySTS,(myOpenFile.name).replace(/\.[\.]+$/,""));
}

/**
 * nas.otome.loadXPS(targetFile)
 * 引数:    File ターゲットのファイルオブジェクト
 * 戻値:    読み込み(またはアップデート)成功したXPSオブジェクトのインデックス(=LayerID) または false
 *
 * 与えられたXPSファイルを読み出して、Root/[footages]/_etc/[timeSheetBinder]　コンポへ登録する
 * プロジェクト内では所定のコンポ内へテキストレイヤのソーステキストとして保存する
 * テキストレイヤのコメントデータとして、
 * オリジナルファイルのサイズ
 * オリジナルファイルのパス
 * 最終更新日付
 * を維持して、いずれかが変更されたとき　内容変更の確認が可能なようにしておく
 * ファイルがすでに読み込まれていて、かつ変更されていない場合は読み込みをスキップする
 *
 * 新メソッドでは、ビルドに先立ってXpsオブジェクトが必要なのでMAPビルドに先行して何らかのXPSを初期化する必要がある
 * 読み込んだだけではデフォルトのXPSバッファが初期化されないので、この関数のあとに初期化が必要
 *
 * @param targetFile
 * @returns {*}
 */
nas.otome.loadXPS = function (targetFile) {
    if (nas.XPSStore.getLength() === false) {
        return false;
    }
    /**
     * 環境ができていないときは実行しない
     * ファイル識別して分岐
     */
    var myOpenfile = new File(targetFile.fsName);
    var myFileExt = myOpenfile.name.replace(/^.*\.([^\.]+)$/, "$1");//拡張子を抜き出す
    switch (myFileExt) {
        case "sts":
            myOpenFile.open("r");
            myContent = STS2XPS(
                myOpenfile.getBin(),
                (myOponfile.name).replace(/\.[\.]+$/,"")
            ).replace(/(\r\n?|\n)/g, "\n");
            myOpenFile.close();
            break;
        case "xdts":
            myOpenfile.encoding = "SJIS";
            myOpenFile.open("r");
            myContent = TDTS2XPS(myOpenfile.read()).replace(/(\r\n?|\n)/g, "\n");
            myOpenFile.close();
            break;
        case "ard":
        case "ardj":
            myOpenfile.encoding = "SJIS";
            myOpenFile.open("r");
            myContent = ARD2XPS(myOpenfile.read()).replace(/(\r\n?|\n)/g, "\n");
            myOpenFile.close();
            break;
        case "csv":;//stylos csv
            myOpenfile.encoding = "SJIS";
            myOpenFile.open("r");
            myContent = ARD2XPS(myOpenfile.read()).replace(/(\r\n?|\n)/g, "\n");
            myOpenFile.close();
            break;
        case "tsh":
            myOpenfile.encoding = "SJIS";
            myOpenFile.open("r");
            myContent = TSH2XPS(myOpenfile.read()).replace(/(\r\n?|\n)/g, "\n");
            myOpenFile.close();
            break;
        default:
            myOpenfile.encoding = "UTF8";
            myOpenfile.open("r");
            myContent = myOpenfile.read();
            myOpenfile.close();
    }
    if (myContent) {
        var myXPS = new Xps();
        myXPS.readIN(myContent);//ローカルにXPSオブジェク形成
    } else {
        return false;
    }
    /**
     * シートバインダがすでにあるか検査
     */
    //if(isNaN(nas.XPSStore.getLength())){return false};//環境なければ失敗

//	var myXpsStore=nas.XPSStore.body;//暫定　あとで差し替え
    for (var fIdx = 0; fIdx < nas.XPSStore.getLength(); fIdx++) {
        //現在のシートから情報オブジェクト取得
        var myCheck = nas.XPSStore.getInfo(fIdx + 1);
        //一致するソースファイル名ならアップデートモード
        if (myCheck.name == targetFile.name) {
            if (
                (myCheck.modified == targetFile.modified.toNASString()) &&
                (myCheck.length == targetFile.length)
            ) {
                /**
                 * ファイル一致でかつ変更なしなのでスキップ
                 */
                return false;
            } else {
                this.beginUndoGroup("update XPS [" + (fIdx + 1) + "]");
                /**
                 * ファイル一致で変更ありなのでアップデート
                 * pushメソッドはバッファからのアップデートなのでこれではまずい
                 */
//				nas.XPSStore.set(fIdx+1,myXps);
                nas.XPSStore.set(fIdx + 1, myXPS);
                nas.XPSStore.setInfo(fIdx + 1, targetFile);
                this.endUndoGroup();
                return fIdx;
            }
        }
        /**
         * シートはあるがファイル一致しないのでスキップ
         */
    }
//=============既存シートの検査
    /**
     * 既存のシートが存在しないので、新規にシートを作成して終了
     */
    this.beginUndoGroup("load New XPS [" + (nas.XPSStore.getLength() + 1) + "]");
//	var myNewTimeSheet=myXpsStore.layers.addText(new TextDocument(myXPS.toString().replace(/\n/g,"\\r\\n")));//これは等価のメソッドと置き換え
    var myNewTimeSheet = nas.XPSStore.add(myXPS);
    if (myNewTimeSheet) {
        /**
         * オブジェクトを直接addした場合は情報セットが抜けるので設定必要
         * @type {*}
         */
        var myProp = nas.XPSStore.setInfo(myNewTimeSheet.index, targetFile);
        /**
         * レイヤ名を識別子で置き換え
         */
        if (myProp) {
            nas.otome.writeConsole("NewTimeSheetEntry to sheetBinder" + targetFile.name)
        }
    }
    this.endUndoGroup();
    if (myNewTimeSheet) {
        return myNewTimeSheet.index
    } else {
        return false
    }
};
/**
 * @desc end  loadXPS()
 */

/**
 * nas.otome.getXPSheets(Folder)
 * 引数　:Folder　検索の基点フォルダ
 * 戻値    :読み込んだシートの数
 *
 * 与えられたフォルダを基点として再帰検索を行い発見したタイムシートをプロジェクトに取り込む
 * すでにプロジェクト内にあるシート、現在のシートと異なっている場合のみ上書きで読み込む。
 * @param myFolder
 * @returns {*}
 */
nas.otome.getXPSheets = function (myFolder) {
    if ((!myFolder) || (!(myFolder instanceof Folder))) {
        alert("フォルダを指定してください。");
        return false;//空指定は不可
    }
    if (myFolder.exists) {
        var doCounts = 0;
        var myContentItems = myFolder.getFiles();
        for (var iIdx = 0; iIdx < myContentItems.length; iIdx++) {
            if (
                (myContentItems[iIdx] instanceof File) &&
                (myContentItems[iIdx].name.match(nas.xpSheetRegex))
            ) {
                // alert("loading :"+myContentItems[iIdx].name)
                this.loadXPS(myContentItems[iIdx]);
                doCounts++;
            } else {
                if (myContentItems[iIdx] instanceof Folder) {
                    doCounts += (this.getXPSheets(myContentItems[iIdx]));
                }
            }
        }
    } else {
        return false;
    }
    return doCounts;
};
/**
 * end getXPSheets()
 */


/**
 * nas.otome.reOrderCell(Comp)
 * 引数　:コンポアイテム
 * 戻値    :なし
 * レイヤをセル順に並び替える暫定版
 * レイヤ名がフッテージソース名だったらそれっぽい並べ替え用文字列を作る
 * 現在シート参照部分なし
 * @param myComp
 */
nas.otome.reOrderCell = function (myComp) {
    myOrderList = new Array(myComp.layers.length);
    for (var n = 0; n < myComp.layers.length; n++) {
        myOrderList[n] = String();
        /**
         * ファイル名から並べ替え用の名前をつける
         * セルっぽい名前の場合はラベルっぽい部分を抽出
         * if (myComp.layer(n+1).source.file.fsName.match(/[\-\_\/\\]([^\-\_\/\\]+[\-\_\/\\]?[0-9]+)\.(tga|tiff?|psd|png|gif|jpg|eps|sgi|bmp)$/i)){
         * myOrderList[n]=RegExp.$1;
         * //	myComp.layer(n+1).name=RegExp.$1;//リネームしない
         * }else{
         * if(myComp.layer(n+1).source.file.fsName.match(/^.*[\-\_\/\\]([^\-\_\/\\]+)\.(mov|avi|gif|mpg)$/i)){
         * myOrderList[n]=RegExp.$1;
         * //		myComp.layer(n+1).name=
         * }else{
         * myOrderList[n]=myComp.layer(n+1).name.toString()
         * }
         * }
         */
        myOrderList[n] = myComp.layer(n + 1).source.name.toString();
        /**
         * 元アイテムのidを控える
         * @type {string}
         */
        myOrderList[n] += "\/" + myComp.layer(n + 1).source.id;
    }
    /**
     * sortする
     * @type {Array.<T>}
     */
    myOrderList = myOrderList.sort();
    myBGList = [];
    myMGList = [];
    myFGList = [];
    myLOList = [];
    for (var n = 0; n < myOrderList.length; n++) {
        /**
         * 背景を抜き出し
         */
        if (myOrderList[n].match(nas.bgRegex)) {
            myBGList.push(myOrderList[n]);
        } else {
            /**
             * Bookを抜き出し
             */
            if (myOrderList[n].match(nas.mgRegex)) {
                myFGList.push(myOrderList[n]);
            } else {
                /**
                 * L/Oを抜き出し
                 */
                if (myOrderList[n].match(nas.loRegex)) {
                    myLOList.push(myOrderList[n]);
                } else {
                    /**
                     * それ以外はセル
                     */
                    myMGList.push(myOrderList[n]);
                }
            }
        }
    }
    /**
     * 連結
     * @type {Array.<*>}
     */
    myOrderList = myBGList.concat(myMGList).concat(myFGList).concat(myLOList);

    /**
     * レイヤ並び替え
     * @type {number}
     */
    var searchCount = 1;
    for (var n = 0; n < myOrderList.length; n++) {
        myId = myOrderList[n].split("\/")[1];
        /**
         * id検索して並べ替え
         */
        for (var m = searchCount; m <= myOrderList.length; m++) {
            if (myComp.layer(m).source.id == myId) {
                searchCount++;
                myComp.layer(m).moveToBeginning();
                break;
            } else {

            }
        }
    }
};
/**
 * コンポ内のセルをそれらしいレイヤ名に変更する
 * @param myComp
 */
nas.otome.reNameCell = function (myComp) {
    for (var n = 1; n <= myComp.layers.length; n++) {
        if (myComp.layer(n).name == myComp.layer(n).source.name) {
            /**
             * レイヤソース名からそれっぽい名前をつける
             * セルっぽい名前の場合はセル名っぽい名前
             */
            if ((myComp.layer(n).source.mainSource instanceof FileSource) && myComp.layer(n).source.mainSource.file.name.match(/^\d+\..+$/)) {
                /**
                 * 連番が数値のみの場合はひとつ上のフォルダ名を使う
                 */
                myComp.layer(n).name = Folder(myComp.layer(n).source.mainSource.file.path).name;
            } else {
                if (myComp.layer(n).source.name.match(nas.cellRegex)) {
                    /**
                     * シーケンス リネーム
                     * @type {string}
                     */
                    myComp.layer(n).name = RegExp.$1;
                } else {
                    if (myComp.layer(n).source.name.match(/^(.*)\..+?$/i)) {
                        /**
                         * 拡張子を払う
                         * @type {string}
                         */
                        myComp.layer(n).name = RegExp.$1;
                    }
                }
            }
        }
    }
};
/**
 * @param myTarget
 * @returns {boolean}
 */
nas.otome.clipCell = function (myTarget) {
    if (myTarget instanceof CompItem) {
        for (var lIdx = 1; lIdx <= myTarget.layers.length; lIdx++) {
            if ((myTarget.layers[lIdx].selected) && (myTarget.layers[lIdx].source.mainSource instanceof FileSource)) {
                this.clipCell(myTarget.layers[lIdx]);
            } else {

            }
            /*
             for(n=0;n<myComp.selectedLayers.length;n++)
             {	};//選択レイヤループ
             //	レイヤソースがプリコンポなら無条件処理
             if(!(myLayers.source instanceof CompItem)){	}
             //	平面なら無条件でスキップ
             if(myLayers.source.mainSource instanceof SolidSource){continue;}
             //	ファイルソースの場合、ソースファイルの名前を確認
             if (
             (myComp.selectedLayers[n].source.name.match(nas.loRegex)) ||
             (myComp.selectedLayers[n].source.name.match(nas.mgRegex)) ||
             (myComp.selectedLayers[n].source.name.match(nas.bgRegex))
             ){		continue;	}
             //セルらしいので、処理する(すごく狭い。なんかあとで考える)
             */
        }
        return;
    }
    /**
     * 指定(選択)アイテムのみ処理する仕様に変更 2006/10/17
     * 引数をレイヤに変更　レイヤのメソッドのほうが良いかも　2009・09・30
     */
    if (!(myTarget instanceof AVLayer)) {
        return false
    }
    var myLayer = myTarget;

    /**
     * アルファチャンネルがなければ白透過(カラーキー)
     */
    if (
        (nas.goClip) &&
        (myLayer.source instanceof FootageItem)
    ) {
        if ((myLayer.source.mainSource.hasAlpha) && (nas.killAlpha)) {
            myLayer.source.mainSource.alphaMode = AlphaMode.IGUNORE;
        }
        if (!myLayer.property("ADBE Effect Parade").property("clipWhite")) {
            var clipTimeLine = myLayer.property("ADBE Effect Parade").addProperty("ADBE Linear Color Key2");
            clipTimeLine.name = "clipWhite";
            clipTimeLine("ADBE Linear Color Key2-0003").expression = "//--otome clipWhite--\n[1,1,1,1];";
            clipTimeLine("ADBE Linear Color Key2-0003").expressionEnabled = true;
        }
    }
};

/**
 * ターゲットにスムージングフィルタをかける
 * ターゲットがコンポの場合はスムーズレイヤを作成
 * レイヤの場合は、スムーズエフェクトを適用する。
 * @param myComp
 */
nas.otome.smoothCell = function (myComp) {
    if (!nas.goSmooth) {
        return;
    } else {
        var myClipEffects = {};
        myClipEffects.name = nas.cellOptions.selectedRecord[0];
        myClipEffects.effects = nas.cellOptions.selectedRecord[1];
        myClipEffects.timeline = nas.cellOptions.selectedRecord[2][0];
        myClipEffects.params = nas.cellOptions.selectedRecord[2][1];

        if (false) {
            for (var n = 0; n < myComp.selectedLayers.length; n++) {

                /**
                 * セルのスムージングをかける。すでに処理済みならスキップ。でも決め打ち
                 * 作業パタン上スムージングをかけるタイミングを変更するので別メソッドにしてコールする形に変更 2007/11/07
                 */

                if (
                    (myComp.selectedLayers[n].property("ADBE Effect Parade").property("kp-smooth")) ||
                    (myComp.selectedLayers[n].property("ADBE Effect Parade").property("KP AntiAliasing")) ||
                    (myComp.selectedLayers[n].property("ADBE Effect Parade").property("OLM Smoother"))
                ) {
                    alert(myComp.selectedLayers[n].name + " は、すでに処理済みたい");
                    continue;
                }

                var smoothEffect = myComp.selectedLayers[n].property("ADBE Effect Parade").addProperty(myClipEffects.effects);
                smoothEffect.name = myClipEffects.name;
                smoothEffect(myClipEffects.timeline).expression = myClipEffects.params;

                if ((myClipEffects.effects == "smooth") && (nas.smoothClip)) {
                    smoothEffect("white option").expression = "\/\/\-\-otome\ cellClip\-\-\ntrue;";
                }
//	smoothEffect("range").expressionEnabled=false;
            }
            /**
             * 選択レイヤループEND
             */
        }
        /**
         * 暫定Smoothレイヤ版
         */
        var myLayer = myComp.layers.addSolid([0.5, 0.5, 0.5, 1], "SmoothingLayer", myComp.width, myComp.height, myComp.pixelAspect);
        myLayer.adjustmentLayer = true;
        var smoothEffect = myLayer.property("ADBE Effect Parade").addProperty(myClipEffects.effects);
        if ((myClipEffects.effects == "smooth") && (nas.smoothClip)) {
            smoothEffect("use color key").expression = "\/\/\-\-otome\ cellClip\-\-\ntrue;";
        }

    }
};
/**
 * レイアウトを設定されたモードに変更する
 * @param myComp
 */
nas.otome.reViewLayout = function (myComp) {
    for (var n = 1; n <= myComp.layers.length; n++) {
        /**
         * Book/LOを抜き出し
         */
        if (myComp.layer(n).source.name.match(nas.loRegex)) {
            if (myComp.layer(n).guideLayer != nas.viewLayout.guideLayer) {
                myComp.layer(n).guideLayer = nas.viewLayout.guideLayer;
            }
            if (myComp.layer(n).blendingMode != nas.viewLayout.MODE) {
                myComp.layer(n).blendingMode = nas.viewLayout.MODE;
            }
            if (myComp.layer(n).property("ADBE Opacity").value != nas.viewLayout.RATIO) {
                myComp.layer(n).property("ADBE Opacity").setValue(nas.viewLayout.RATIO);
            }
            if (myComp.layer(n).enabled != nas.viewLayout.visible) {
                myComp.layer(n).enabled = nas.viewLayout.visible;
            }
        }
    }
};

/**
 * nas.otome.isPsdFolder(myFolder,mySource)
 * 引数    myFolder    フォルダアイテム　mySource    チェックするpsdファイル
 * 戻値    フッテージソース　または　false
 * 引数のフォルダが特定のpsdファイルのフッテージフォルダか否かを判定する
 * ソースが省略された場合は最初にあたったファイルソースをあてるので省略可能
 * psd以外の判定はしないでfalseを戻す
 *
 * @param myFolder
 * @param mySource
 * @returns {boolean}
 */
nas.otome.isPsdFolder = function (myFolder, mySource) {
    if ((!myFolder) || (!(myFolder instanceof FolderItem)) || (myFolder.items.length == 0)) {
        return false
    }
    var mySources = myFolder.getItemSources();
    if ((!mySource) && (mySources.length)) {
        mySource = mySources[0]
    }
    /**
     * getItemSources()はfalseを戻すケースがあるので注意
     * @type {boolean}
     */
    var myResult = false;
    if ((mySource) && (mySources.length)) {
        if (mySource.name.match(/.*\.psd/i)) {
            myResult = mySource;
            for (var srcIdx = 0; srcIdx < mySources.length; srcIdx++) {
                if (mySource.fsName != mySources[srcIdx].fsName) {
                    myResult = false;
                    break;
                }
            }
        }
    }
    return myResult;
};
/**
 * 上記関数の拡張版シーケンスフォルダの判定を行なう。ソースの拡張子がpsd以外の場合でも判定を行い、シーケンスファイルの格納フォルダであれば、psdファイルと同等に扱う
 * 戻しのソースはシーケンスの起点ファイルをあてる
 * シーケンスとバラシーケンスの判定を行なうべきなので一応保留　このままでは特殊ケースでヘンな移動が発生しそう
 *
 * @param myFolder
 * @param mySource
 * @returns {boolean}
 */
nas.otome.isXPsdFolder = function (myFolder, mySource) {
    if ((!myFolder) || (!(myFolder instanceof FolderItem)) || (myFolder.items.length == 0)) {
        return false
    }
    var mySources = myFolder.getItemSources();
    if ((!mySource) && (mySources.length)) {
        mySource = mySources[0]
    }
    /**
     * getItemSources()はfalseを戻すケースがあるので注意
     * @type {boolean}
     */
    var myResult = false;
    if ((mySource) && (mySources.length)) {
        if (mySource.name.match(/.*\.psd/i)) {
            myResult = mySource;
            for (var srcIdx = 0; srcIdx < mySources.length; srcIdx++) {
                if (mySource.fsName != mySources[srcIdx].fsName) {
                    myResult = false;
                    break;
                }
            }
        } else {
//					myResult=isSequenceElements(mySource);
            myResult = mySource.isSequenceElements(true);//シーケンス識別データを取得、ここでは厳密オプションを付ける
            if (myResult) {
                for (var srcIdx = 0; srcIdx < mySources.length; srcIdx++) {
                    var currentEl = isSequenceElements(mySources[srcIdx]);
                    /**
                     * シーケンスフォルダ判定条件　フォルダ名がシーケンスプレフィックスを「含んでいる」こと　エレメントがすべて同一のシーケンスであること
                     */
                    if (
                        (myFolder.name.toUpperCase().indexOf(myResult.prefix.toUpperCase()) < 0 ) ||
                        (!currentEl) ||
                        (myResult.prefix != currentEl.prefix) ||
                        (myResult.ext != currentEl.ext)
                    ) {
                        return false;
                        break;
                    }
                }
                myResult = mySource;
            } else {
                myResult = false;
            }
        }
    }
    return myResult;
};
/**
 * nas.otome.isPsdComp(myComp,mySource)
 * 引数    myComp    コンポアイテム　mySource    チェックするpsdファイル
 * 戻値    フッテージソースのファイルオブジェクト
 * 内部のプリコンポを遡り引数のコンポが特定のpsdファイルのコンポか否かを判定する
 * ソースが省略された場合は最初にあたったファイルソースをあてるので省略可能
 * 他のフッテージを登録した時点で判定は外れ。 平面やヌルは判定外
 *
 * @param myComp
 * @param mySource
 * @returns {boolean}
 */
nas.otome.isPsdComp = function (myComp, mySource) {
    if ((!myComp) || (!(myComp instanceof CompItem)) || (myComp.layers.length == 0)) {
        return false
    }
    var mySources = myComp.getItemSources();
    if ((!mySource) && (mySources.length)) {
        mySource = mySources[0]
    }
    /**
     * getItemSources()はfalseを戻すケースがあるので注意
     * @type {boolean}
     */
    var myResult = false;
    if ((mySource) && (mySources.length)) {
        if (mySource.name.match(/.*\.psd/i)) {
            myResult = mySource;
            for (var srcIdx = 0; srcIdx < mySources.length; srcIdx++) {
                if (mySource.fsName != mySources[srcIdx].fsName) {
                    myResult = false;
                    break;
                }
            }
        }
    }
    return myResult;
};

/**
 * nas.otome.guessFtgCtg(projectItem)
 * 引数　プロジェクトアイテム(CompItem or FolderItem)
 * 戻値    カテゴリID
 *
 * プロジェクトアイテムのフッテージカテゴリを推測するメソッド
 * 実質のカテゴリはファイルシステム内の位置(パス)で判別される
 * カテゴリには以下のものがある
 * false    一般のフォルダ、コンポ等のフッテージとして扱わないもの
 * コンポやフォルダのうち　ｐｓｄフォルダ・コンポは　フッテージに準ずる戻り値をもつ
 * (セル・背景・レイアウト)等の素材カテゴリ
 * そのときどきの登録次第で種別は変化する
 * nas.ftgFolders に情報を登録する
 * nas.ftgFoldersに登録されたシステムフォルダ（および同名フォルダ）は　ID=-1
 * 判別不明なフッテージに対しては ＩＤ=0 を返す
 *
 * 包括クラスのコンストラクタがないので乙女の関数で実装
 *
 * @param myItem
 * @returns {*}
 */
nas.otome.guessFtgCtg = function (myItem) {
    var checkFile = false;
    if (myItem instanceof FolderItem) {
        if (myItem.name.match(/^\[.+\]$/)) {
            return -1
        }
        /**
         * システム除外
         */
        for (var idx in nas.ftgFolders.names) {
            if (myItem.name == nas.ftgFolders.names[idx]) {
                return -1
            }
        }
        /**
         * システム除外
         * @type {boolean}
         */
        checkFile = nas.otome.isXPsdFolder(myItem);
        /**
         * ｐｓｄフォルダかシーケンスフォルダか判定してそれ以外の場合はfalse
         */
    }
    if (myItem instanceof CompItem) {
        checkFile = nas.otome.isPsdComp(myItem);
        /**
         * ｐｓｄコンポか否か判定してそれ以外の場合はfalse
         */
    }
    if ((myItem instanceof FootageItem) && (myItem.mainSource instanceof FileSource)) {
        checkFile = myItem.mainSource.file;
    }
    if (!checkFile) {
        return false;
    }
    /**
     * カテゴリごとに順次検査して最初にマッチしたリザルトを戻す　最後までマッチしなければ　０
     * @type {Array.<*>}
     */
    var checkStringArray = decodeURI(checkFile.path).split("/").reverse();
    for (var stId = 0; stId < checkStringArray.length; stId++) {
        for (var ctIdx = 0; ctIdx < nas.ftgFolders.length; ctIdx++) {
            if (checkStringArray[stId].match(/^[a-z](go|ue|shita|un|over|\+*|\-*)?$/i)) {
                continue
            }
            if (checkStringArray[stId].match(nas.ftgFolders.cpRx[ctIdx + 1])) {
                nas.otome.writeConsole(checkStringArray[stId] + " ; " + nas.ftgFolders.names[ctIdx + 1] + ":" + nas.ftgFolders.cpRx[ctIdx + 1].toString() + nas.GUI.LineFeed);
                return ctIdx + 1;
            }
        }
    }
    return 0;
};

///////////////////////////////////// nas.otome.guessFtgCtg()

/**
 * nas.otome.getFootage(targetFolder)
 * このインポート関数はもともとスマートインポータだったものですが、もう
 * なんか別物? でもリダクションしたい 2006/01/22 kiyo
 * 
 * @param targetFolder
 * @returns {*}
 */
nas.otome.getFootage = function (targetFolder) {
    if (!targetFolder) {
        return false;
    }
    nas.GUI.currentFolder = targetFolder;
    Folder.current = nas.GUI.prevCurrentFolder;

    var myImportCount = 0;

    /**
     * プロジェクトがなければ、ファイルを登録するプロジェクトを新規作成する。 [23839]
     */
    if (!app.project) {
        app.newProject();
    }
    /**
     * undoブロック開始
     */
    this.beginUndoGroup("フッテージインポート");
    /**
     * ファイル処理
     * 引数のファイルをインポートする(トライでエラートラップをかけて処理が止まらないようにしているみたいだ。)
     * @param theFile
     */
    function processFile(theFile) {
        /**
         * トライだけだと(開発中)危ないので、ここで制限を一度かける
         */
        if (theFile.name.match(nas.importFilter)) {
            try {
                var importOptions = new ImportOptions(theFile);
                /**
                 * ImportOptionsオブジェクト"importOptions"を作る
                 */
                if (theFile.name.match(/\.psd$/i)) {
                    importOptions.importAs = ImportAsType.COMP
                } else {
                    importOptions.importAs = ImportAsType.FOOTAGE
                }
                importSafeWithError(importOptions);
                /**
                 * エラー出力付きでインポート処理
                 */
            } catch (error) {
                /**
                 * 単にエラー捨てて継続
                 */
            }
        } else {

        }
    }

    /**
     * testForSequence(files)
     * 引数　：　ファイルを要素とする配列
     * 戻値　：　先頭ファイルの配列
     * 基準
     * ラベルおよび数値部分を持つファイル名であること
     * ラベルは空文字列でもよろしい
     * 連番桁あわせは行われていること
     * テスト範囲のフォルダはファイルシステム上で同じ位置であること
     * 元のシーケンス判定はあまり良くないので消す
     * PSDファイルのシーケンスをトラップすることにする
     * 
     * @param files
     * @returns {Array}
     */
    function testForSequence(files) {
        var resultArray = [];
        /**
         * カラのフォルダが対象になったときはスキップ
         */
        if (!files.length) {
            return resultArray
        }
        /**
         * フォルダ配置検査
         * @type {String}
         */
        var currentFolderPath = files[0].path;
        for (var fidx = 1; fidx < files.length; fidx++) {
            if (currentFolderPath != files[fidx].path) {
                return resultArray;
            }
        }
        /**
         * アンマッチしたら終了(ファイル数多いときついか？要試験)
         * 全部のファイルを検査
         */
        for (var fidx = 0; fidx < files.length; fidx++) {
//	var isSQ=isSequenceElements(files[fidx]);//チェックルーチンにまわす
            /**
             * チェックルーチンがFileオブジェクトのメソッドになったのでFolderを渡さないように注意
             * @type {boolean}
             */
            var isSQ = (files[fidx] instanceof File) ? files[fidx].isSequenceElements() : false;//チェックルーチンにまわす
            if (isSQ) {
                if (isSQ.prefix.match(nas.bgRegex)) {
                    continue
                }
                /**
                 * 背景ぽいファイルをスキップ
                 */
                if (isSQ.prefix.match(nas.mgRegex)) {
                    continue
                }
                /**
                 * 背景ぽいファイルをスキップ
                 */
                if (isSQ.prefix.match(nas.loRegex)) {
                    continue
                }
                /**
                 * 背景ぽいファイルをスキップ
                 */
                var myPrefix = isSQ.prefix;
                var myCount = isSQ.currentNumber;
                var myStart = isSQ.startNumber;
                var myExt = isSQ.ext;
                if ((myCount * 1) == (myStart * 1)) {
                    resultArray.push(files[fidx])
                }
                /**
                 * カレントナンバとスタートナンバが一致している場合のみエントリ
                 */
            }
        }
        return resultArray;
    }

//end testForSequence()

    /**
     * importSafeWithError
     * 引数　：インポートオプションオブジェクト
     * 戻値　：なし
     * 名前ほど格好よくないね　とほほ
     * 
     * 与えられた オプションでインポートをトライ
     * @param importOptions
     */
    function importSafeWithError(importOptions) {
        /**
         * 追加チェック ファイル名(先頭ファイル名)がセルらしく無い場合は無条件でパス
         */
//	if(importOptions.file.name.match(/^[a-z][0-9a-z\-\_]*[\-\_]?[0-9]+\.(mov|mpg|avi|tiff?|tga|psd|png|jpe?g|gif|sgi|eps)$/i)){	}else{return;}
//
        try {
            app.project.importFile(importOptions);
            myImportCount++;
        } catch (error) {
            alert(error.toString() + importOptions.file.fsName);
        }
    }

    /**
     * isImported(file)
     * 引数　：　ファイルオブジェクト
     * 戻値　：　ヒットしたアイテムインデックス
     * ファイルがプロジェクトにすでにインポートされているか否かテストする
     * ヒットがなければfalse
     * 
     * @param theFile
     * @returns {*}
     */
    function isImported(theFile) {
        if (!app.project) {
            return false
        }
        for (var idx = 1; idx <= app.project.items.length; idx++) {
            if (app.project.item(idx).mainSource instanceof FileSource) {
                if (theFile.fsName == app.project.item(idx).mainSource.file.fsName) {
                    return idx;
                } else {

                }
            }
        }
        return false;
    }

    /**
     * フォルダ処理
     * @param theFolder
     */
    function processFolder(theFolder) {
        /**
         * 対象フォルダのファイル(オブジェクト)を配列にとる
         */
        var files = theFolder.getFiles(); 
        /**
         * フォルダにシーケンスが含まれているか否か検査
         * @type {Array}
         */
        var sequenceStartFiles = testForSequence(files);//全てのファイルをチェックルーチンにわたす　戻り値は先頭ファイルの配列とする
        /**
         * 戻り値があれば未読み込みのエントリはシーケンスとしてインポートする
         */
        for (var fidx = 0; fidx < sequenceStartFiles.length; fidx++) {
            var isExists = isImported(sequenceStartFiles[fidx]);
            if (!isExists) {
                try {
                    var importOptions = new ImportOptions(sequenceStartFiles[fidx]); //create a variable containing ImportOptions
//alert(sequenceStartFiles[fidx].name+":" +sequenceStartFiles[fidx].path);
                    importOptions.sequence = true;
                    if (importOptions.file.name.match(/\.psd$/i)) {
                        importOptions.importAs = ImportAsType.FOOTAGE
                    }

                    //importOptions.forceAlphabetical = true; //un-comment this if you want to force alpha order by default
                    importSafeWithError(importOptions);
                } catch (error) {

                }
            }
        }

        /**
         * それ(シーケンス)以外の場合はファイルとしてインポートまたは再帰処理
         */
        //otherwise, import the files and recurse

        for (index in files) {
            /**
             * Go through the array and set each element to singleFile, then run the following
             */
            if (files[index] instanceof File) {
                var isExists = isImported(files[index]);
                if (isExists) {
                    /**
                     * 同じファイルがすでにインポートされている場合は、単にアクティブにしてインポート処理をスキップ
                     * @type {boolean}
                     */
                    app.project.item(isExists).selected = true;
                    continue;
                }
                /**
                 * ファイルがシーケンスファイルならスキップ
                 * 背景/BOOK/LOファイルファイルとはシーケンスチェックをスキップする
                 */
                if (
                    (
                        (files[index].name.match(nas.bgRegex)) ||
                        (files[index].name.match(nas.mgRegex)) ||
                        (files[index].name.match(nas.loRegex))
                    ) || (
                        (!files[index].isSequenceElements()) &&
                        (files[index].name.match(nas.importFilter))
                    )
                ) {
                    /**
                     * if file is already part of a sequence, don't import it individually
                     * calls the processFile function above
                     */
                    processFile(files[index]); 
                }
            }
            if (files[index] instanceof Folder) {
                processFolder(files[index]); // recursion
            }
        }
    }

    processFolder(targetFolder);
    /**
     * Recursively examine that folder
     * undoブロック終了
     */
    this.endUndoGroup();
    return myImportCount;//カウント返す
};


//============================================素材分類用フォルダアイテム作成


/**
 * nas.otome.mkWorkFolders()
 * 引数	:なし
 * 戻り値	:作成成功したフォルダの配列（一考？
 * プロジェクトにフッテージ格納用のフォルダアイテムを作る
 * オートビルダのための準備関数
 * AE7　以降で動作
 * 乙女の設定を参照して予備的にフォルダアイテムを作成
 * あらかじめフォルダが存在しなくても実際は割り振りプロシージャがフォルダアイテムを作るが、作っておくと何かと便利
 * 
 * @returns {Boolean}
 */
nas.otome.mkWorkFolders = function () {
    /**
     * フッテージフォルダを作成　システム予約名で
     * この行為がＭＡＰの初期化と等しので
     * この場でＭＡＰ（エージェント）オブジェクトを生成しておく？
     * というか、マップ初期化ルーチンから呼んだほうが良いか？
     */
    if (app.version.split(".")[0] * 1 < 7) {
        /**
         * AE6.5の場合は、テンプレートを取り込んで代用する
         */
        this.beginUndoGroup("ワークフォルダ作成");
        var myTemplateFileLocation = Folder.scripts.path.toString() + "/Scripts/nas/(tools)/autoBuilder/resources/footages.aep";
        var myTemplateItem = new ImportOptions();
        myTemplateItem.file = new File(myTemplateFileLocation);
        myTemplateItem.importAs = ImportAsType.PROJECT;

        var myItem = app.project.importFile(myTemplateItem);
        myItem.name = nas.ftgFolders.ftgBase[0];

        this.endUndoGroup();
        nas.XPSStore.initBody();//作成時にストア初期化
        nas.otome.writeConsole("read Template");
        return myItem;
    }

    /**
     * undo group 設定（ワークフォルダ作成）
     */
    this.beginUndoGroup("ワークフォルダ作成");


    var myFootages = app.project.items.getByName(nas.ftgFolders.ftgBase[0]);//設定参照
    if (!myFootages) {
        myFootages = app.project.items.addFolder(nas.ftgFolders.ftgBase[0]);
    }
    /**
     * フッテージサブフォルダ作る
     * @type {string[]}
     */
    var footageFolders = ["bg", "frame", "lo", "paint", "etc", "unknown"];//今回は決めうち ,"_key","_draw","_rough","_sound","_system"はそのうち

    for (var myIndex = 0; myIndex < footageFolders.length; myIndex++) {
        var targetName = nas.ftgFolders[footageFolders[myIndex]][0];//配列[0]データを使用
        /**
         * 現状のプロジェクトに同名のフォルダが存在しない場合のみ作る
         */
        if (!myFootages.items.getByName(targetName)) {
            myFootages.items.addFolder(targetName);
        }
    }
    /**
     * フッテージサブフォルダにタイムシート保管コンポを作る(XPSStoreオブジェクトがあれば初期化する)
     */
    if ((nas.XPSStore) && (nas.XPSStore.getLength() === false)) {
        nas.XPSStore.initBody();
    }
    /**
     * すでにあれば初期化はしない
     * MAP(プレコンポ)フォルダ作る
     * @type {*}
     */
    var myMapDatas = app.project.items.getByName(nas.mapFolders.mapBase);
    if (!myMapDatas) {
        myMapDatas = app.project.items.addFolder(nas.mapFolders.mapBase);
    }
    /**
     * MAP(プレコンポ)サブフォルダ作る
     * @type {string[]}
     */
    var myFolders = ["cameraWork", "cell", "effect", "sound", "system"];
    for (var myIndex = 0; myIndex < myFolders.length; myIndex++) {
        var targetName = nas.mapFolders[myFolders[myIndex]];
        if (!myMapDatas.items.getByName(targetName)) {
            myMapDatas.items.addFolder(targetName);
        }
    }
    /**
     * undo 閉じる
     */
    this.endUndoGroup();
};
//	 nas.otome.mkWorkFolders();
//============================================フッテージ振り分け


/**
 * nas.otome.divideFootageItems()
 * 引数	:なし
 * 戻り値	:移動したアイテムの個数
 * 
 * 選択されたアイテムのうちファイルソースフッテージをプロジェクトフォルダに振り分ける
 * 選択されたアイテムが存在しない場合は、
 * ルートフォルダのすべてのフッテージアイテムおよび背景コンポ背景コンポのソースレイヤフォルダを対象に動作する。
 * 
 * フォルダはソースの所属フォルダの名前をそのまま使用　すでに同名のフォルダが存在する場合はそのフォルダを使用
 * フッテージがシーケンスの場合でかつフッテージプレフィックスがフォルダ名と同一の場合のみさらに上のフォルダ名を使用する
 * 
 * 各フォルダは　/[footages]/ の配下に作成する
 * 
 * 現行きめうちで
 *		[footages]
 *			|- _bg  	背景フォルダ "_bg/(BGフォルダ)" 配下にあれば自動登録
 *			|- _etc 	各種素材フォルダ
 *			|- _frame	フレーム設定フォルダ
 *			|- _lo  	レイアウト格納フォルダ　"_lo/(レイアウトフォルダ)"配下にあれば自動登録
 *			|- _paint	セル格納フォルダ　"_paint/(セルフォルダ)"配下にあれば自動登録
 *			|- _sound	(予約)
 *			|- _system	(予約)
 *			|- _rough	(予約)ラフ原用
 *			|- _key　	(予約)原画用
 *			|- _draw(ing)	(予約)動画用
 *			|- _other	不明フッテージを格納
 * 上記のフォルダを対象とする
 * 
 * 拡張仕様として、分類に失敗したアイテムを_othersに格納するか否かを選択可能にすること (スイッチ付ければ可能)2011.0205
 * セルと思われるアイテムの場合セルフォルダ（_paint）に格納するように調整　2011.0205
 * 
 * @returns {number}
 */
nas.otome.divideFootageItems = function () {
    try {
        var myXPS = XPS
    } catch (err) {
        nas.otome.writeConsole(err.toString());
        return;
    }
    if (app.version.split(".")[0] * 1 < 7) {
        alert("フォルダ振り分けはAE6.5では使用できません。\nこの機能はAE7以降でご使用ください");
        return;
    }
    /**
     * ケース見落としていた。　総アイテム数が０のときは何もする意味がないのでリターン
     */
    if ((!app.project) || (!app.project.items.length)) {
        alert("no items");
        return 0;
    }

    var portCount = 0;
    var myItems = app.project.selection;//初期化
    /**
     * アイテム数0なら対象をデフォルトに変更
     */
    if (myItems.length == 0) {
        var myTargetFolder = app.project.item(1).parentFolder;//裏技でRootを取得
        for (var itmIdx = 1; itmIdx <= myTargetFolder.items.length; itmIdx++) {
            myItems.push(myTargetFolder.items[itmIdx]);//Rootフォルダのアイテムをすべて登録(あとで分類)
        }
    }
//var targetFolderReg=new RegExp("_(bg|etc|frame|lo|paint|sound|system|rough|key|draw(ing)?)$","i");

    /**
     * 移動操作に先立って移動先の親フォルダがなければ作成（undo）
     */
    if (!(app.project.items.getByName(nas.ftgFolders.ftgBase[0]))) {
        nas.otome.mkWorkFolders();//ファンクションコールで全部作る
    }
    /**
     * 移動処理開始
     * @type {Array}
     */
    var tansItems = [];//サブの移動アイテムスタックループセットごとか?

    /**
     * undo group 設定（カテゴリ別フッテージ振り分け）
     */
    this.beginUndoGroup("フッテージ振り分け");

    /**
     * @desc 振分移動ループ処理
     */
    
    for (var itmIdx = 0; itmIdx < myItems.length; itmIdx++) {
        if (nas.otome.isPsdFolder(myItems[itmIdx].parentFolder)) {
            continue
        }
        /**
         * 親フォルダがpsdフォルダなら処理スキップ
         * @type {*}
         */
        var myCatg = nas.otome.guessFtgCtg(myItems[itmIdx]);//推定エンジンに渡す
//		if(myCatg==false){continue};//処理スキップ
        if (myCatg == -1) {
            continue;
        }
        /**
         * 処理スキップ
         * ターゲットが移動先（システムフォルダ）だった場合ｍｙCatgに-1が戻るのでスキップ
         */
        if (!myCatg) {
            if ((myCatg == 0) && (nas.dividerOptionUnknown)) {
                var myDestFoldrItem = app.project.items.getByName(nas.ftgFolders.names[0]).items.getByName(nas.ftgFolders.unknown[0])
            } else {
                continue
            }
        } else {
            var myDestFoldrItem = app.project.items.getByName(nas.ftgFolders.names[0]).items.getByName(nas.ftgFolders.names[myCatg]);
            /**
             * 移動対象フォルダが設定上存在すべきで、
             * かつ実際には存在しない場合myDestFoldrItemがnullになりかつ
             * myCatgに数値が入るので判定してフォルダを作成する
             */
            if ((myCatg) && (myDestFoldrItem == null)) {
                myDestFoldrItem = app.project.items.getByName(nas.ftgFolders.names[0]).items.addFolder(nas.ftgFolders.names[myCatg]);
            }
        }
//		if((myDestFoldrItem)&&(myItems[itmIdx].parentFolder.name!=myDestFoldrItem.name)){myItems[itmIdx].parentFolder=myDestFoldrItem};
//		continue;
        /**
         * フォルダアイテムのケース
         * この条件を満たした場合はPSDコンポのレイヤフォルダ　またはフッテージ格納フォルダであるはずなので移動対象
         * ただし自動インポートの際はフォルダはセレクトされないので自然と移動対象外になるので
         * その場合は親コンポから移動するように設定する
         * 
         * フォルダの移動はアイテム移動スタックで処理
         */
        if (
            (myItems[itmIdx] instanceof FolderItem) &&
            (nas.otome.isXPsdFolder(myItems[itmIdx]))
        ) {
            var targetFolder = myItems[itmIdx];
            tansItems.push([targetFolder, myDestFoldrItem]);//ターゲットと移動先をプッシュ
            continue;
//					break;
        }

        /**
         * コンポアイテムのケース
         * コンポアイテムが移動対象の場合は背景コンポである可能性が高いので以下の検査を行い
         * 合致していたら背景コンポであるとみなし対象のレイヤ格納フォルダをアイテム移動スタックに積み
         * このファンクションの最後に解決する
         */
        if (
            (myItems[itmIdx] instanceof CompItem) &&
            (nas.otome.isPsdComp(myItems[itmIdx]))
        ) {
            var targetFolder = myItems[itmIdx].layer(1).source.parentFolder;
            for (var lid = 0; lid < myItems[itmIdx].layers.length; lid++) {
                if (nas.otome.isPsdFolder(targetFolder)) {
                    tansItems.push([targetFolder, myDestFoldrItem]);//ターゲットと移動先をプッシュ
                    break;
                }
                targetFolder = myItems[itmIdx].layer(lid + 1).source.parentFolder;
            }

        }
        /**
         * 移動操作開始
         */
        if (
            (myDestFoldrItem) &&
            (myItems[itmIdx].parentFolder.name != myDestFoldrItem.name)
        ) {
            myItems[itmIdx].parentFolder = myDestFoldrItem;//移動
            /**
             * 移動時にXPSの情報に合わせてフッテージを調整
             */
            portCount++;
        }
    }

    /**
     * @desc 指定アイテム振分移動ループ処理終了
     * 全てのアイテム処理後に派生移動アイテムがあれば移動
     */

    /**
     * ただしアイテム移動先が存在しない場合は処理をスキップ
     */
    for (var itmIdx = 0; itmIdx < tansItems.length; itmIdx++) {
        if (tansItems[itmIdx][1]) {
            tansItems[itmIdx][0].parentFolder = tansItems[itmIdx][1];
            portCount++;
        }
    }

    /**
     * @desc サブ移動アイテム移動終了
     */
    
    /**
     * undo 閉じる
     */
    this.endUndoGroup();
    return portCount;
};
//	nas.otome.divideFootageItems();

/**
 * @desc グループマップ作成
 */

/**
 * nas.otome.mkMapGroups()
 * 引数	:なし
 * 戻り値	:作成したプリコンポ（タイムライングループ）の数
 * 
 * XPSオブジェクトを参照してセルのプレコンポ(グループマップ)を作成する
 * XPSオブジェクトが読み込まれていることが前提
 * オートビルダのための準備関数
 * セルの実際の配置は行わない
 * この関数は実際のセルを割り振るときに呼び出す機能関数とするか、またはMAPのメソッドにしたほうが良い
 * 
 * @returns {number}
 */
nas.otome.mkMapGroups = function () {
    try {
        var myXPS = XPS
    } catch (err) {
        nas.otome.writeConsole(err.toString());
        return;
    }
    if (appHost.version < 7) {
        /**
         * AE6.5の場合は、テンプレートを取り込んで代用する
         */
        this.beginUndoGroup("MAPグループ作成");
        var myTemplateFileLocation = Folder.scripts.path.toString() + "/Scripts/nas/(tools)/autoBuilder/resources/map.aep";
        var myTemplateItem = new ImportOptions();
        myTemplateItem.file = new File(myTemplateFileLocation);
        myTemplateItem.importAs = ImportAsType.PROJECT;

        var myItem = app.project.importFile(myTemplateItem);
        myItem.name = nas.mapFolders.mapBase;

        this.endUndoGroup();
        nas.otome.writeConsole("read Template");
        return;
    }
    /**
     * undo group 設定（）
     */
    this.beginUndoGroup("MAPグループ作成");
    /**
     * XPSオブジェクトがあればまずそれからグループを抽出する
     * 次にXPSStoreから順次作成すべきグループを抽出
     * 
     * @type {Array}
     */
    var myStore = [];
    myStore.push(XPS);//使用するXPSをpush
    if (nas.XPSStore.getLength()) {
        for (var idx = 1; idx <= nas.XPSStore.body.layers.length; idx++) {
            myStore.push(nas.XPSStore.get(idx))
        }
    }
    var myCount = 0;
    if (!(app.project.items.getByName(nas.mapFolders.mapBase))) {
        this.mkWorkFolders();
    }
    /**
     * [CELL]グループにプリコンポを作る
     * @type {*}
     */
    var myCellFolder = app.project.items.getByName(nas.mapFolders.mapBase).items.getByName(nas.mapFolders.cell);
    if (myCellFolder) {
        for (var idx in myStore) {
            var myXPS = myStore[idx];
            for (var idx = 1; idx < myXPS.xpsTracks.length-1; idx++) {
                var targetComp = myCellFolder.items.getByName(myXPS.xpsTracks[idx].id);
                if ((!targetComp) || (!targetComp instanceof CompItem )) {
                    /**
                     * ターゲットのプリコンポはあるか？ないときは作成
                     */
                    targetComp = myCellFolder.items.addComp(
                        myXPS.xpsTracks[idx].id,
                        Math.round(myXPS.xpsTracks[idx].sizeX * 1),
                        Math.round(myXPS.xpsTracks[idx].sizeY * 1),
                        myXPS.xpsTracks[idx].aspect * 1,
                        (isNaN(myXPS.xpsTracks[idx].lot) ) ? 1 : myXPS.xpsTracks[idx].lot / myXPS.framerate,
                        myXPS.framerate * 1
                    );
                    targetComp.duration = 1;
                    myCount++;
                }
            }
        }
    }
    /**
     * どうせあとで調整なのでフレームレート標準値、継続時間1秒でマップコンポを作成しておく
     * undo 閉じる
     */
    this.endUndoGroup();
    return myCount;
};
//	nas.otome.mkMapGroups();

/**
 * nas.otome.buildMAP()
 * 引数	:なし
 * 戻値	:true/false
 * 
 * 
 * 各機能を連続処理してMAPの自動ビルドを行う
 * 処理成功時はrue / 中断を検知した場合はfalse
 * 
 * 現存のフッテージをあさって　マップグループらしきものを作る
 * (1)フッテージフォルダを検索してマッチしたコンポに投げ込む
 * 下セル・上セル・合成セル・ブラシは一応サポート
 * 判別不能なセルは手動でコンポに入れてほしい。
 * サイズと継続時間は調整するけど、最大マッチで投げ込む
 * (2)レイアウトフォルダとフレームフォルダをあさってカメラワークマップを作る
 * 最大マッチで重ねるのみ
 * (3)フッテージフォルダから背景らしきものを探し出して背景プリコンポを作る。
 * (4)背景プリコンポとカメラワークマップを重ねてステージを作る　カメラレイヤも作成
 * (5)ステージにセルを投げ込んでそこでシートマッピングする
 * (6)ステージをカメラコンポでクリップ
 * (7)カメラコンポを出力コンポにボールドつきで設定　書き出し可能な提携処理を行う
 * 
 * それぞれ別の機能部品に仕立てるが吉
 * 
 * ココでは前提として有効なXPSファイルがターゲットフォルダの配下に含まれていることが前提である
 */
nas.otome.buildMAP = function () {
    if (appHost.version < 7) {
        alert("この機能にはAE7以降が必要です");
        return;
    }

    try {
        var myXPS = XPS
    } catch (err) {
        /**
         * ＸＰＳの初期化が済んでいないのでＸＰＳの初期化を促す
         */
        alert("XPSが見当たりません");
        return;
    }
    /**
     * フッテージ振り分け
     */
    nas.otome.divideFootageItems();
    /**
     * 振り分けたフォルダを元にコンポをつくる(複数シート拡張<未>)
     */
    nas.otome.mkMapGroups();
    /**
     * この時点でロードされているＸＰＳを順次選択してMAPをビルドする
     */
    var myXpsCounts = nas.XPSStore.getLength();
    if (!myXpsCounts) {
        myXpsCounts = 0
    }
    for (var idx = 0; idx < nas.XPSStore.getLength(); idx++) {
        nas.XPSStore.select(idx + 1);
        /**
         * 全アイテム選択解除;
         */
        for (var idx = 1; idx <= app.project.items.length; idx++) {
            app.project.items[idx].selected = false;
        }
        /**
         * BGフォルダのフッテージをグループ化(シート参照まだ)
         */
        nas.otome.standbyBGFootages();
        /**
         * セルフォルダのフッテージをグループ登録
         */
        nas.otome.standbyCellFootages();
    }

};

/**
 * @desc 背景をMAPに取り込み
 */


/**	
 * nas.otome.standbyBGFootages()
 * 
 * 引数	:なし
 * 戻り値	:処理成功したアイテムの数
 * 
 * タイムライン外のフッテージをプロジェクト内でMAP配置する
 * 背景BOOK等の暗黙の素材が対象である
 * 
 * インポート済みの背景の想定様態は2種
 * 通常フッテージファイルかまたはフォトショップコンポ
 * 
 * 通常フッテージファイルの場合は[footages]_bg 配下に取り込んで[MAP][CELL]配下にグループプリコンポを置く(一考)
 * PSDコンポの場合は暫定処置で背景用のプリコンポを作成　というか背景のフォトショップファイルをインポート時にコンポで読み込んで
 * フッテージはフォルダをリネームして[footages]_bg　の配下に置き、
 * コンポは[MAP][CELL]フォルダに移動してファイル名でリネームする。
 * 素材配置は元のファイルの情報を維持
 * 継続時間は兼用カット数分のフレーム・オリジナル配置をベースにステージに自動配置してnullでつなぐ？
 * （またはカット継続時間の最長？）
 * 09/21 尺調整未処理
 * 
 * ココでは前提としてインポートおよびプロジェクトフォルダへの配置は済んでいるものとする
 * @returns {number}
 */
nas.otome.standbyBGFootages = function () {
    try {
        var myXPS = XPS
    } catch (err) {
        nas.otome.writeConsole(err.toString());
        return;
    }
    if (app.version.split(".")[0] * 1 < 7) {
        alert("この機能にはAE7以降が必要です");
        return;
    }
    var myXPS = XPS;
    var myCellFolder = app.project.items.getByName(nas.mapFolders.mapBase).items.getByName(nas.mapFolders.cell);//ビルド先
    var myCount = 0;//戻値
    /**
     * [footages]_bgフォルダの素材を処置
     * カラ配列初期化(エントリは通常フッテージまたはPSDコンポ)
     * @type {Array}
     */
    var myTargetFootages = [];
    /**
     * フォルダ内のアイテム総当りで判定
     * @type {*}
     */
    var myStore = app.project.items.getByName(nas.ftgFolders.ftgBase[0]).items.getByName(nas.ftgFolders.bg[0]);
    /**
     * アイテム移動スタック
     * @type {Array}
     */
    var transportItems = [];
    /**
     * undo 開く
     */
    this.beginUndoGroup("BG-MAP作成");
    for (var itmIdx = 1; itmIdx <= myStore.items.length; itmIdx++) {
        /**
         * アイテムが通常ファイルフッテージならば[MAP][CELL]配下にグループプリコンポ置く
         */
        if (myStore.items[itmIdx] instanceof FootageItem) {
            var cpName = "[" + myStore.items[itmIdx].name.replace(/\..+$/, "") + "]";//拡張子あれば取り払い、前後を囲んでセルと区別する
            var cpWdt = myStore.items[itmIdx].width;
            var cpHgt = myStore.items[itmIdx].height;
            var cpApt = myStore.items[itmIdx].pixelAspect;
            /**
             * 静止画のフレームレートと継続時間はともに０なので注意
             * @type {number}
             */
            var cpDrs = (myStore.items[itmIdx].duration) ? myStore.items[itmIdx].duration : 1;//(1/myXPS.framerate;)
            var cpFrs = (myStore.items[itmIdx].duration) ? Math.round(myStore.items[itmIdx].duration / myStore.items[itmIdx].frameDuration) : 1;
            var cpFrt = (myStore.items[itmIdx].frameRate) ? myStore.items[itmIdx].frameRate : myXPS.framerate;
            /**
             * 静止画はひとまずXPSのフレームレートで継続1フレームに
             * 同名のコンポがすでにあれば処理しない
             */
            if (!myCellFolder.items.getByName(cpName)) {
                var myNewComp = myCellFolder.items.addComp(cpName, cpWdt, cpHgt, cpApt, cpDrs, cpFrt);
                /**
                 * 拡張メソッドで尺を割り付け
                 */
                myNewComp.setFrames(cpFrs);
                /**
                 * セレクトする
                 * @type {boolean}
                 */
                myNewComp.selected = true;
                var myNewLayer = myNewComp.layers.add(myStore.items[itmIdx]);//静止画プレコンポに投入
                /**
                 * BGコンポに対して 必要(設定)に従ってコンポに定型処理を施す(外部スクリプトを使う仕様)…多分あまりない
                 * @type {Folder}
                 */
                var myBgAction = new Folder(Folder.scripts.path.toString() + "/Scripts/nas/(actions)/systemResources/nas.otome.standbyBGFootages");
                if (myBgAction.exists) {
                    myNewComp.executeAction(myBgAction)
                }
                /**
                 * カウンタ追加
                 */
                myCount++;
            }
            /**
             * 背景用のタイムラインは現在暗黙の宣言なのでXPS内に存在しないケースが多いので、暫定処置である。注意！
             */
        }
        /**
         * アイテムがPSDコンポならリネームして[MAP][CELL]配下に移動 ただし移動系はインデックスが変わるので
         * ループ終了時に実行するためのターゲット配列を作成して対応
         */
        if (myStore.items[itmIdx] instanceof CompItem) {
            if (myStore.items[itmIdx].name.match(/(.+)\..+$/)) {
                myStore.items[itmIdx].name = RegExp.$1;
            }
            /**
             * 拡張子がついてるときだけリネーム
             */
            transportItems.push(myStore.items[itmIdx]);//スタック
        }
        if (false) {
            /**
             * アイテムがPSDコンポのフッテージフォルダだったらリネーム(これは単純すぐでける)
             */
            if (myStore.items[itmIdx] instanceof FolderItem) {
                if (myStore.items[itmIdx].name.match(/(.+)\sレイヤー/)) {
                    myStore.items[itmIdx].name = RegExp.$1;
                }
                /**
                 * @todo 個人的な趣味なので放置でも可…で、放置
                 */
            }
        }
  
        /**
         * ループ終了したのでPSDコンポの移動を解決
         * 移動完了後にセレクト
         */
        if (transportItems.length) {
            for (var idx = 0; idx < transportItems.length; idx++) {
                transportItems[idx].parentFolder = myCellFolder;
                transportItems[idx].selected = true;
                /**
                 * PSDコンポに対して 必要(設定)に従ってコンポに定型処理を施す(外部スクリプトを使う仕様)…多分あまりない
                 * @type {Folder}
                 */
                var myAction = new Folder(Folder.scripts.path.toString() + "/Scripts/nas/(actions)/systemResources/psdBgGroup");
                if (myAction.exists) {
                    transportItems[idx].executeAction(myAction)
                }
                myCount++;
            }
        }
    }
    this.endUndoGroup();
    return myCount;
};

//	nas.otome.standbyBGFootages();

/**
 * nas.otome.standbyCellFootages()
 * 引数	:なし
 * 戻り値	:作成成功したアイテムカウントオブジェクト
 * 
 * この関数を呼び出す場合はプロジェクト内のアイテムの配置が完了しているものとする
 * @returns {number}
 */
nas.otome.standbyCellFootages = function () {
    if (!(nas.XPSStore.getLength())) {
        return
    } else {
        var myXPS = XPS
    }
//try{var myXPS=XPS}catch(err){nas.otome.writeConsole(err.toString());return;}
//	if(app.version.split(".")[0]*1<7){alert("この機能にはAE7以降が必要です");return;};//6.5でも使えるはず

    /**
     * [CELL]グループのプリコンポにフッテージ登録
     * @type {*}
     */
    var myCellFolder = app.project.items.getByName(nas.mapFolders.mapBase).items.getByName(nas.mapFolders.cell);
    var myPaintStore = app.project.items.getByName(nas.ftgFolders.ftgBase[0]).items.getByName(nas.ftgFolders.paint[0]);
    var myResultCount = 0;

    var tempArray = new Array(myCellFolder.items.length);//分類仮配列初期化
    for (tlIdx = 0; tlIdx < myCellFolder.items.length; tlIdx++) {
        /**
         * 各配列を要素なしであらかじめ初期化 0 to length-1
         * @type {Array}
         */
        tempArray[tlIdx] = [];
    }
    if ((myCellFolder instanceof FolderItem) && (myCellFolder.items.length >= 1)) {
        /**
         * undo group 設定（タイムライングループ設定）
         */
        this.beginUndoGroup("CELL-MAP設定");
        /**
         * セルコンポがすでにある場合のみ動作
         * フッテージループ
         */
        for (var ftgIdx = 1; ftgIdx <= myPaintStore.items.length; ftgIdx++) {
            /**
             * 仮にここでシートとフレームレートの異なるフッテージを洗う
             * @type {*|PresetItem|Item}
             */
            var myFootage = myPaintStore.items[ftgIdx];
            if (
                (myFootage instanceof FootageItem) &&
                (!(myFootage.mainSource.isStill)) &&
                (myFootage.frameRate != myXPS.framerate)
            ) {
                if (true) {
                    myFootage.mainSource.conformFrameRate = myXPS.framerate;
                } else {
                    if (cofirm("フッテージフレームレートがタイムシートと異なります。調整しますか？")) {
                        myFootage.mainSource.conformFrameRate = myXPS.framerate;
                    }
                }
            }
            /**
             * 判定文字列を作成
             * @type {String}
             */
            var myLabel = myPaintStore.items[ftgIdx].name;
            
            /**
             * 連番指示部を削除してソースのフレーム数表示部を除く
             * ラベルが残らなかった場合は、ソースパスの最終トークンをラベルにする
             */
            if (myPaintStore.items[ftgIdx].source instanceof File) {
            }
            /**
             * 基本的にはファイルソースのみが対象なのでココの判定は無用
             * フッテージ名から拡張子を除く
             * @type {string}
             */
            myLabel = myLabel.replace(/\..+$/, "");
            /**
             * 数値指定部を除く
             * @type {string}
             */
            myLabel = myLabel.replace(/[_\s-]?\[\d+\-?\d+\]/, "");

            if (myLabel.length == 0) {
                /**
                 * ラベル長が0になった場合は数字のみのファイル名なので(まれにある)ひとつ上のフォルダ名をラベルにする
                 * @type {*}
                 */
                myLabel = myPaintStore.items[ftgIdx].source.file.path.split("/")[myPaintStore.items[ftgIdx].source.file.path.split("/").length - 1];
            }
            /**
             * フォルダ名が作品タイトルや話数情報を含んでいると思われる場合はその部分を削除する
             */
            if (myLabel.match(/[^_\s\-]+([_\s\-][^_\s\-]+)+/)) {
                myLabel = RegExp.$1.replace(/^[_\s\-]/, "");
            }
            for (tlIdx = 1; tlIdx <= myCellFolder.items.length; tlIdx++) {
                /**
                 * マップグループ総当りで、判定ラベルとコンポ名が一致したらそのグループの仮配列にフッテージを登録してブレイク
                 * 基本的にラベルの完全マッチを狙うか、
                 * またはかなりインテリジェントな推測エンジンを作るか
                 * 以下の判定の前処理で補助情報を形成するか
                 * いずれかの処置が必要
                 * 今回は推測エンジンを作る余裕はないので以下の甘いマッチで手作業修正とする
                 * 以下のマッチではラベルの冒頭文字列が一致している最初のグループにフォルダにすべて取り込まれるので
                 * その点は注意(従来名のカブセは自動判定不能)
                 * 要調整
                 * 
                 * @type {String}
                 */
                var myTargetLabel = myCellFolder.items[tlIdx].name;
//			if(myLabel.match(new RegExp("^"+myTargetLabel,"i"))){};//こちらは仮にしても弊害多いのでやめ
                if (myTargetLabel.match(new RegExp("^" + myLabel, "i"))) {
                    tempArray[tlIdx - 1].push(myPaintStore.items[ftgIdx]);//仮配列は添字が-1
                    break;
                }
            }
        }
        /**
         * 仮配列を元にマップグループを形成
         */
        for (tlIdx = 1; tlIdx <= myCellFolder.items.length; tlIdx++) {
            /**
             * ここで処理対象外のコンポを振り分ける(BG等のグループが混在しているので)
             */
            if (myCellFolder.items[tlIdx].name.match(/\[.+\]/)) {
                continue;
            }

            var currentFrameRate = myCellFolder.items[tlIdx].frameRate;
            var myMaxFrames = 0;
            var myMaxWidth = 0;
            /**
             * 初期化 ココにピクセルアスペクトが参入されてないので注意
             * @type {number}
             */
            var myMaxHeight = 0;
            /**
             * 第一ループ : コンポ情報のみ取得して設定
             */
            for (var myIdx = 0; myIdx < tempArray[tlIdx - 1].length; myIdx++) {
                //tempArray[tlIdx-1][myIdx];//登録アイテム
                currentFrameRate = (tempArray[tlIdx - 1][myIdx].mainSource.isStill) ? myXPS.framerate : tempArray[tlIdx - 1][myIdx].frameRate;
                var currentFrames = (tempArray[tlIdx - 1][myIdx].mainSource.isStill) ? 1 : Math.round(tempArray[tlIdx - 1][myIdx].duration / tempArray[tlIdx - 1][myIdx].frameDuration);
                var currentWidth = tempArray[tlIdx - 1][myIdx].width;
                var currentHeight = tempArray[tlIdx - 1][myIdx].height;

                myMaxFrames = (myMaxFrames > currentFrames) ? myMaxFrames : currentFrames;
                myMaxWidth = (myMaxWidth > currentWidth ) ? myMaxWidth : currentWidth;
                myMaxHeight = (myMaxHeight > currentHeight) ? myMaxHeight : currentHeight;
            }

            /**
             * 第一ループ終了・取得データで先行してコンポを調整する
             * ここに問題あり　スマートインポータはよくフレームレートを間違うので
             * シートにあわせた調整が必要　どのタイミングで行なうか一考
             */
            if (myCellFolder.items[tlIdx].frameRate != currentFrameRate) {
                myCellFolder.items[tlIdx].frameRate = currentFrameRate;
            }
            if ((myCellFolder.items[tlIdx].duration != myMaxFrames / myXPS.framerate) && (myMaxFrames > 0)) {
//			myCellFolder.items[tlIdx].duration=myMaxFrames/myXPS.framerate;
                myCellFolder.items[tlIdx].setFrames(myMaxFrames);
            }
            if ((myCellFolder.items[tlIdx].width != myMaxWidth) && (myMaxWidth > 0)) {
                myCellFolder.items[tlIdx].width = myMaxWidth;
            }
            if ((myCellFolder.items[tlIdx].height != myMaxHeight) && (myMaxHeight > 0)) {
                myCellFolder.items[tlIdx].height = myMaxHeight;
            }
            /**
             * 第二ループ : ジオメトリデフォルト値でフッテージをグループに登録
             */
            for (var myIdx = 0; myIdx < tempArray[tlIdx - 1].length; myIdx++) {
//			tempArray[tlIdx-1][myIdx];//登録アイテム
                if (!(myCellFolder.items[tlIdx].layers.byName(tempArray[tlIdx - 1][myIdx].name))) {
                    /**
                     * 一応重複登録はしない(2度目以降の実行用に回避)
                     * @type {*|Array}
                     */
                    var currentLayer = myCellFolder.items[tlIdx].layers.add(tempArray[tlIdx - 1][myIdx]);
                    /**
                     * 登録時定型処理（基本的にはキー抜きだけだと思うけど別ファンクション推奨　いまは決めうち）
                     */
                    this.clipCell(currentLayer);
                }
            }
            /**
             * コンポ作成後処理 必要(設定)に従ってコンポに定型処理を施す
             * (スムージング等)(外部スクリプトを使う仕様)
             * @type {Folder}
             */
            var myAction = new Folder(Folder.scripts.path.toString() + "/Scripts/nas/(actions)/systemResources/standbyCellFootages");
            if (myAction.exists) {
                myCellFolder.items[tlIdx].executeAction(myAction)
            }
            /**
             * 登録したグループをセレクトしておく
             * @type {boolean}
             */
            myCellFolder.items[tlIdx].selected = true;
        }

        /**
         * ラベルとフッテージ名を比較して上セル下セル合成親程度まで取り込む?
         * (問題ありそう。だけど効率上何とかしたい)
         * undo 閉じる
         */
        this.endUndoGroup();
    }
    return myResultCount;
};
//	nas.otome.standbyCellFootages()

/**
 * @desc オブジェクト（プロパティ）ブラウザ関連
 */

/**
 * オブジェクト（プロパティ）ブラウザ
 * オブジェクトをツリー表示しつつオブジェクトやプロパティをセレクトできる
 * 戻り値はオブジェクト　または　スクリプト　エクスプレッションで使用可能な文字列
 * ダブルカラムで選択ボタンつき　AE8以降ならダブルクリック選択も可能
 * オブジェクトツリーの取得にAE7以降のプロパティを使用しているので　AE6.5では動きません　あしからず
 * 
 * @param myItem
 * @returns {*}
 */
nas.otome.getElementsFrom = function (myItem) {
    if (appHost.version < 7) {
        return false
    }
    var myResult = [];
    /**
     * 0番アイテムとして引数の親アイテムを登録する
     * 1番アイテムとして引数自体を登録する
     * @type {number}
     */
    var itemCounts = 0;
    if (myItem instanceof FolderItem) {
        myResult[0] = myItem.parentFolder;
        myResult[1] = myItem;
        itemCounts = myItem.numItems;
        for (var cnt = 1; cnt <= itemCounts; cnt++) {
            myResult.push(myItem.item(cnt))
        }
    } else {
        if (myItem instanceof CompItem) {
            myResult[0] = myItem.parentFolder;
            myResult[1] = myItem;
            itemCounts = myItem.layers.length;
            for (var cnt = 1; cnt <= itemCounts; cnt++) {
                myResult.push(myItem.layer(cnt))
            }
        } else {
            if ((myItem.property) && (myItem.numProperties)) {
                myResult[0] = (myItem.propertyDepth == 0) ? myItem.containingComp : myItem.parentProperty;
                myResult[1] = myItem;
                itemCounts = myItem.numProperties;
                for (var cnt = 1; cnt <= itemCounts; cnt++) {
                    myResult.push(myItem.property(cnt))
                }
            }
        }
    }
    /**
     * 配下のオブジェクトを配列で返す(全て0オリジン)0,1は予約アイテム
     */
    return myResult;
};

/**
 * nas.otome.selectProperty(アイテム , オプション)
 * 引数:アイテム　フォルダアイテム(コンポ含む)・レイヤ・プロパティ　/ オプション 　"asObj" / "asExp" / "asJss"
 * 戻値:DOMオブジェクト　またはDOMオブジェクトを表すソース文字列
 * 
 * @param myItem
 * @param myOption
 * @returns {*}
 */
nas.otome.selectProperty = function (myItem, myOption) {
    if (appHost.version < 7) {
        alert("申し訳ありませんがAE７以上の環境でご使用ください。");
        return null;
    }
    if (!myOption) {
        myOption = "asObj"
    }
    /**
     * デフォルトはオブジェクト直戻し？　エクスプレッションが良いかも？
     */
    if ((!app.project) || (app.project.items.length == 0)) {
        return null
    }
    if (!myItem) {
        myItem = (app.project.numItems) ? app.project.item(1).parentFolder : false;//指定がなければルート
    }

    /**
     * 戻り値の初期値はスタートアイテム
     */
    var myResult = myItem;
    /**
     * アイテムがフォルダか否かでプロパティのとりかたが違うので注意
     * パスバッファ
     * @type {Array}
     */
    var myItemPath = [];
    /**
     * パスバッファにアイテムを入れる
     */
    myItemPath.push(myItem);
    /**
     * 初期値のアイテムの配下リストを作成
     * @type {*}
     */
    var myCurrentItms = nas.otome.getElementsFrom(myItem);
    /**
     * 存在するならば親のアイテムリストを作成
     * @type {null[]}
     */
    var myParentItms = (myCurrentItms[0] == null) ? [null, null] : nas.otome.getElementsFrom(myCurrentItms[0]);
    /**
     * 初期値未設定だった場合のみルートを隠蔽するためにひとステップ下に
     */
    if ((myParentItms[0] == null) && (myParentItms[1] == null)) {
        myParentItms = myCurrentItms;
        myCurrentItms = [null, null]
    }
    
    /**
     * アイテムが第一階層だった場合ひとステップ上に
     * @type {Array}
     */
//if((myCurrentItms[0]==null)&&(myParentItms[1]==null)){myParentItms=myCurrentItms;myCurrentItms=[null,null]};
    var prpNames = [];

    function getNames(Itmlst) {
        if (Itmlst.length > 2) {
            var myResult = ["( .. )"];
            for (var cnt = 2; cnt < Itmlst.length; cnt++) {

                if (Itmlst[cnt] instanceof FolderItem) {
                    myResult.push("-folder->" + Itmlst[cnt].name);
                } else {
                    if (Itmlst[cnt].propertyDepth == 1) {
                        myResult.push(Itmlst[cnt].name)
                    } else {
                        myResult.push(Itmlst[cnt].name)
                    }
                }
            }
        } else {
            var myResult = ["( .. )", ""];
        }
        return myResult;
    }

    /**
     * length個のブール配列指定インデックスだけtrue
     * @param index
     * @param length
     * @returns {Array}
     */
    function getChecks(index, length) {
        var myResult = [];
//	for(var id=0;id<length;id++){myResult[id]=(id==index)?true:false};
        for (var id = 0; id < length; id++) {
            if (id == index) {
                myResult.push(true);
                break;
            } else {
                myResult.push(false);
            }
        }
        return myResult;
    }

    function getIndex(myObj) {
        if (!myObj) {
            return 0;
        }
        if (myObj.propertyIndex) {
            return myObj.propertyIndex
        }
        if (myObj.index) {
            return myObj.index
        }
        if (myObj.id) {
            for (var idx = 1; idx <= app.project.numItems; idx++) {
                if (app.project.item(idx) === myObj) {
                    return idx;
                }
            }
        }
        return 0;
    }

    /**
     * UI
     * @type {number}
     */
    var colWidth = 3;
    var colHeight = 12;

    var w = nas.GUI.newWindow("dialog", myResult.name, colWidth * 2, colHeight + 1);
    w.up = nas.GUI.addListBox(w, getNames(myParentItms), getIndex(myCurrentItms[1]), 0, -0.3, colWidth, colHeight);
    w.lo = nas.GUI.addListBox(w, getNames(myCurrentItms), null, colWidth, -0.3, colWidth, colHeight);
    w.btn = nas.GUI.addButton(w, "select", 0, colHeight + 0.3, colWidth * 2, 1);

    w.up.onChange = function () {
        if (this.selected != null) {
            myResult = myParentItms[this.selected + 1];
            this.parent.text = myResult.name;
        }
        if (this.selected == 0) {
            /**
             * 上のカラムさらに上へ行くときは下のカラムを破棄して入れ替え　その後上のアイテムを取得
             * 上がルートフォルダだった場合は何もしない
             * @type {null}
             */
            var upperItem = myParentItms[0];
            var currentItem = myParentItms[1];
            if (upperItem) {
                /**
                 * 入れ替え
                 * @type {null[]}
                 */
                myCurrentItms = myParentItms;
                /**
                 * 取得
                 * @type {*}
                 */
                myParentItms = nas.otome.getElementsFrom(upperItem);
                var myIndex = getIndex(currentItem);
                var newupperItems = getNames(myParentItms);
                var newlowerItems = getNames(myCurrentItms);
                if (dbg) {
                    nas.otome.writeConsole(newupperItems.length + " : " + newupperItems.toString());
                    nas.otome.writeConsole(getChecks(myIndex, newupperItems.length).toString())
                }
                this.parent.lo.setOptions(newlowerItems, [false]);
                this.setOptions(newupperItems, getChecks(myIndex, newupperItems.length));
            } else {
                /**
                 * ツリー上端なので下カラムの選択をクリア
                 */
                this.parent.lo.setOptions([], []);
            }
        } else {
            /**
             * 切り替えなので下のアイテムを新規取得してクリア
             * 配下アイテムがない場合は選択のみでスキップ
             * @type {*}
             */
            var selectedItems = nas.otome.getElementsFrom(myParentItms[this.selected + 1]);
            if (selectedItems.length > 2) {
                myCurrentItms = selectedItems;
                this.parent.lo.setOptions(getNames(myCurrentItms), []);
            } else {
                this.parent.lo.setOptions([], []);

            }
        }
    };

    w.lo.onChange = function () {
        if (this.selected != null) {
            myResult = myCurrentItms[this.selected + 1];
            this.parent.text = myResult.name;
        }
        if (this.selected == 0) {
            /**
             * 下のカラム　上へ行くときはnop?
             */
            //this.parent.up.setOptions(getNames(myParentItms),[]);
            //this.parent.lo.setOptions(getNames(myCurrentItms),[]);
        } else {
            /**
             * 切り替え 現状のアイテムを上へ移動して下のアイテムを取得して表示
             * 下位アイテムがなければ選択のみで動作スキップ
             * @type {*}
             */
            var selectedItems = nas.otome.getElementsFrom(myCurrentItms[this.selected + 1]);
            if (selectedItems.length > 2) {
                myParentItms = myCurrentItms;
                var newupperLists = getNames(myParentItms);//なぜいったん変数にとると安定？
                if (dbg)                nas.otome.writeConsole(newupperLists.toString());
                this.parent.up.setOptions(newupperLists, getChecks(this.selected, newupperLists.length));
                if (dbg)                nas.otome.writeConsole(getNames(myParentItms).toString());
                myCurrentItms = selectedItems;
                this.setOptions(getNames(myCurrentItms), [false]);
            } else {
            }
        }
    };
    w.btn.onClick = function () {
        this.parent.close();
    };
    /**
     * 新UIのときのみダブルクリック認識
     */
    if (w.up.listBox) {
        w.up.listBox.onDoubleClick = function () {
            this.parent.parent.close();
        };
        w.lo.listBox.onDoubleClick = function () {
            this.parent.parent.close();
        }
    }
    /**
     * 終了時処理
     */
    w.onClose = function () {
    };
    /**
     * ダイアログが閉じたらリザルトを戻して終了
     */
    w.show();

    var myResultText = "";
    /**
     * エクスプレッションモードの際は戻せないオブジェクトがあるので、その場合クロースをキャンセルして再帰する
     */
    switch (myOption) {
        case    "asJss":
            myResultText = nas.otome.asSourceString(myResult, myItem, "scripts");
            break;
        case    "asExp":
            myResultText = nas.otome.asSourceString(myResult, myItem, "expression");
            break;
        case    "asObj":
        default :
            return myResult;
    }
    if (!myResultText) {
        myResultText = nas.otome.selectProperty(myResult, myOption);
    }
    return myResultText;

//return myResult;
};

/**
 * オブジェクトを文字列化する
 * nas.otome.asSourceString(オブジェクト,基点オブジェクト,出力形式)
 * 引数: AE-DOMオブジェクト（プロパティ含む）,基点オブジェクト,戻り値の形式
 * 戻り値:エクスプレッションまたはスクリプトのソーステキスト　または　false
 * 例:
 * myText=nas.otome.asSourceString(app.project.activeItem.layer(1));
 * >> comp("コンポ １").layer("ホワイト平面　１") …等々
 *
 * 引数のAE DOMオブジェクトをエクスプレッション内で利用可能な文字列にして返す関数
 * エクスプレッションモードとスクリプトモードをもつ。デフォルトはエクスプレッション
 * 文字列に変換失敗の場合は、falseを返すので各自判定のこと
 * 基点オブジェクトが指定された場合はそのオブジェクトを検知した場合そこでパス構築を打ち切る
 * デフォルトは"ルート"
 *
 * @param myItem
 * @param myBase
 * @param myForm
 * @returns {*}
 */
nas.otome.asSourceString = function (myItem, myBase, myForm) {
    if (appHost.version < 7) {
        alert("申し訳ありませんがAE７以上の環境でご使用ください。");
        return null;
    }
    if (!myForm) {
        myForm = "expression"
    }
    if (!myBase) {
        myBase = (app.project.items.length) ? app.project.items.item(1).parent : null
    }

    /**
     * 基点は”ルート”またはnull
     * 内部ファンクション　オブジェクトのインデックス（相当ID）を返す
     * @param myObj
     * @returns {*}
     */
    function getIndex(myObj) {
        if (!myObj) {
            return 0
        }
        /**
         * オブジェクト無ければ０
         */
        if (myObj.propertyIndex) {
            return myObj.propertyIndex
        }
        /**
         * プロパティ
         */
        if (myObj.index) {
            return myObj.index
        }
        /**
         * インデックスプロパティをもっている=Layer
         */
        if (myObj.id) {
            for (var idx = 1; idx <= app.project.numItems; idx++) {
                if (app.project.item(idx) === myObj) {
                    return idx
                }
            }
        }
        /**
         * FoldeItem/CompItem/FootageItem等
         */
        return 0;//不明（例外）オブジェクト
    }

    /**
     * 統一環境のためアイテムフォルダの親子関係は見ないでソース化する…ツリーをとったほうがよいかなぁ
     * @type {number}
     */
    var myDepth = 0;
    if (
        (myItem instanceof FolderItem) ||
        (myItem instanceof CompItem) ||
        (myItem instanceof FootageItem)
    ) {
        myDepth = 1;
    } else {
        if (myItem instanceof Property) {
            myDepth = myItem.propertyDepth + 2;
        } else {
            myDepth = 2;
        }
    }
    /**
     * オブジェクトパスを作る
     * @type {Array}
     */
    var myObPath = [];
    myObPath.push(myItem);
    var currentObj = myItem;
    for (var did = myDepth; did > 0; did--) {
        if (currentObj === myBase) {
            break
        }
        /**
         * 基点と一致したら構築打ち切り
         */
        if ((currentObj instanceof FolderItem) || (currentObj instanceof CompItem) || (currentObj instanceof FootageItem)) {
            break;
        } else {
            if (currentObj.parentProperty) {
                myObPath.push(currentObj.parentProperty);
                currentObj = currentObj.parentProperty;
            } else {
                myObPath.push(currentObj.containingComp);
                currentObj = currentObj.containingComp;
            }
        }
        /**
         * ループ共通処理
         */

    }
    /**
     * 引数オブジェクトをソースで使用可能な文字列に変換する　乙女のメソッドにする　AE専用バージョン縛りアリ
     */
    if (myForm == "scripts") {
        /**
         * スクリプトでは全て参照可能
         * "app.project.item("+ItemIndex+")" ;//ここからスタート
         * @type {Array}
         */
        var myObPthName = [];
        for (var idx = 0; idx < myObPath.length; idx++) {
            var myObj = myObPath[idx];
            if (
                (myObj instanceof FolderItem) ||
                (myObj instanceof FootageItem) ||
                (myObj instanceof CompItem)
            ) {
                myObPthName.push("items[" + getIndex(myObj) + "]");
            } else {
                if (myObj.parentProperty) {
                    myObPthName.push("property(" + myObj.propertyIndex + ")");
                } else {
                    myObPthName.push("layer(" + myObj.index + ")");
                }
            }
        }
        if (myObPthName.length) {
            return "app.project." + myObPthName.reverse().join(".")
        } else {
            return false;
        }

    } else {
        /**
         * エクスプレッションソースを作成する場合は同じスコープレベルの判定が必要
         * 基点オブジェクトから親レイヤと親コンポを特定
         * 同じコンポ内ならコンポは省略　同じレイヤ内なら親レイヤまで省略可能　というステップでゆくべき
         * 前段の基点オブジェクト遭遇での探索打ち切りは、計算アイテムの削減に有効なのでそのまま保持
         *
         * @type {null}
         */
        var myParentComp = null;
        var myParentLayer = null;
        if ((myBase.propertyDepth) || (myBase.propertyDepth == 0)) {
            var currentObj = (myBase.propertyDepth == 0) ? myBase.containingComp : myBase.parentProperty;
            for (var idx = 0; idx <= myBase.propertyDepth; idx++) {
                if (currentObj instanceof CompItem) {
                    myParentComp = currentObj;
                    break;
                }
                if (currentObj.propertyDepth == 0) {
                    myParentLayer = currentObj;
                    currentObj = currentObj.containingComp;
                    continue;
                }
                currentObj = currentObj.parentProperty;
            }
        }
        /**
         * この下はマッチネームとエクスプレッション用プレフィックスの対比テーブルAEバージョン変更時に再検査必要
         * @type {string[]}
         */
        var myPrefixes = [
            "marker",
            "timeRemap",
            "motionTracker",
            "mask",
            "effect",
            "transform",
            "layerStyle",
            "materialOption",
            "audio"
        ];
        /**
         * @type {string[]}
         */
        var matchNames = [
            "ADBE Marker",
            "ADBE Time Remapping",
            "ADBE MTrackers",
            "ADBE Mask Parade",
            "ADBE Effect Parade",
            "ADBE Transform Group",
            "ADBE Layer Styles",
            "ADBE Material Options Group",
            "ADBE Audio Group"
        ];
        var myPRFX = {};
        for (var idx = 0; idx < myPrefixes.length; idx++) {
            myPRFX[matchNames[idx]] = myPrefixes[idx]
        }

        var myObPthName = [];
        for (var idx = 0; idx < myObPath.length; idx++) {
            var myObj = myObPath[idx];
            /**
             * FolderとFootage‘はスキップする必要アリ
             */
            if ((myObj == myParentComp) || (myObj == myParentLayer)) {
                break
            }
            if ((myObj instanceof FolderItem) || (myObj instanceof FootageItem)) {
                continue;
            }
            if (myObj instanceof CompItem) {
                myObPthName.push("comp(\"" + myObj.name + "\").");
            } else {
                if (myObj.parentProperty) {
                    if (myObj.propertyDepth == 1) {
                        myObPthName.push(myPRFX[myObj.matchName]);
                    } else {
                        myObPthName.push("(\"" + myObj.name + "\")");
                    }
                } else {
                    myObPthName.push("layer(\"" + myObj.name + "\").");
                }
            }
        }
        if (myObPthName.length) {
            return myObPthName.reverse().join("").replace(/\.$/, "")
        } else {
            return false;
        }
    }
};

/**
 * オブジェクト（プロパティ）ブラウザ関連
 * 乙女プリファレンスの読み込みと保存
 * 保存するオブジェクトをそれぞれ１ファイルで設定フォルダへjsonテキストで保存する
 * 拡張子は.pref
 * ファイル名はオブジェクト（プロパティ）名をそのまま
 * 例: nas.inputMedias.body.pref 等
 * プリファレンスとして保存するオブジェクトはこのファイルの設定として固定
 * 読み込みは記録フォルダの内部を検索してオブジェクトの存在するもの全て
 * 新規のオブジェクトは作成しない
 */

//nas.otome.preferenceFolder=new Folder(Folder.nas.path+"/nas/lib/etc");//保存場所固定
nas.otome.preferenceFolder = new Folder(Folder.userData.path + "/" + Folder.userData.name + "/nas/lib/etc");//保存場所固定
if (!nas.otome.preferenceFolder.exists) {
    nas.otome.preferenceFolder.create();
}
/**
 * nas.otome.readPreference(myPropName)
 * 設定の保存・復帰用関数
 * 引数:プロパティ名
 * 戻値:なし
 * 引数が指定されない場合は保存されている全てのプロパティを読み込む
 * 読み込まれた同名のプロパティは上書き
 *
 * @param myPropName
 */
nas.otome.readPreference = function (myPropName) {
alert('old mathod nas.otome.readPreference');
return;
    if (!myPropName) {
        myPropName = "*"
    }
    var myPrefFiles = this.preferenceFolder.getFiles(myPropName + ".pref");
    for (var idx = 0; idx < myPrefFiles.length; idx++) {
        var myPropName = myPrefFiles[idx].name.replace(/\.pref$/, "");
        if (eval(myPropName)) {
            var myOpenFile = new File(myPrefFiles[idx].fsName);
            var canRead = myOpenFile.open("r");
            if (canRead) {
                myOpenFile.encoding = "UTF-8";
                var myContent = myOpenFile.read();
                myOpenFile.close();
                nas.otome.writeConsole(myContent);
                if (myContent.match(/\(new\sNumber\(([0-9\.]+)\)\)/)) {
                    myContent = myContent.replace(/\(new\sNumber(\([0-9\.]+\))\)/g, RegExp.$1);
                    if ((myPropName.match(/(.*[^\.])\.selected/)) && (eval(RegExp.$1 + "  instanceof nTable"))) {
                        eval(RegExp.$1 + ".select\(" + myContent + "\)");
//	alert(myContent);
                    } else {
                        eval(myPropName + " =(" + myContent + ")");
                    }
                } else {
                    if (myContent.match(/\(new\sString\((.+)\)\)/)) {
                        myContent = myContent.replace(/\(new\sString(\(.+)\)\)/g, RegExp.$1);
                        eval(myPropName + " =" + myContent);
                    } else {
                        nas.otome.writeConsole(myPropName + " = eval(" + myContent + ")");
                        eval(myPropName + " =eval(" + myContent + ")");
                    }
                }

            }
        } else {
            nas.otome.writeConsole("cannot Replace prop " + myPropName);
        }
    }
};

/**
 * nas.otome.writePreference(myPrefs)
 * 設定の保存・復帰用関数
 * 引数:オブジェクト
 * 戻値:なし
 * 引数のオブジェクトをjsonで規定のフォルダに保存する
 * １オブジェクトにつき1ファイルを書き出す
 * jsonで保存に適さないオブジェクトを指定しないように注意すること
 * 引数が指定されない場合はシステム指定のオブジェクトを保存する
 *
 * @param myPrefs
 */
nas.otome.writePreference = function (myPrefs) {
alert('old mathod nas.otome.writePreference');
return;
    if (!myPrefs) {
        myPrefs = []
    }
    if (!(myPrefs instanceof Array)) {
        myPrefs = [myPrefs]
    }
    /**
     * 配列に
     */
    if (myPrefs.length == 0) {
        /**
         * 試験用あとで調整
         * @type {string[]}
         */
        myPrefs = [
            "nas.inputMedias.bodys",
            "nas.inputMedias.selected",
            "nas.outputMedias.bodys",
            "nas.outputMedias.selected",
            "nas.workTitles.bodys",
            "nas.workTitles.selected",
            "nas.CURRENTUSER",
            "nas.RESOLUTION",
            "nas.FRATE",
            "nas.SheetLength",
            "nas.importFilter",
            "nas.cellRegex",
            "nas.bgRegex",
            "nas.mgRegex",
            "nas.loRegex",
            "nas.expressions",
            "nas.ftgFolders.lo",
            "nas.ftgFolders.frame",
            "nas.ftgFolders.bg",
            "nas.ftgFolders.paint",
            "nas.ftgFolders.etc",
            "nas.ftgFolders.key",
            "nas.ftgFolders.drawing",
            "nas.ftgFolders.sound",
            "nas.ftgFolders.unknown"
        ];
    }
    /**
     * ,"nas.ftgFolders";//
     */
    if ((this.preferenceFolder.exists) && (!(this.preferenceFolder.readonly))) {
        for (var idx = 0; idx < myPrefs.length; idx++) {
            if (eval(myPrefs[idx])) {
                if ((eval(myPrefs[idx])) instanceof RegExp) {
                    var myContent = eval(myPrefs[idx] + ".toString()");
                    if (myContent.match(/\/([ig]+)$/)) {
                        var myRegOpt = RegExp.$1;
                    } else {
                        var myRegOpt = "";
                    }
                    var myContentBody = myContent.slice(1, myContent.length - myRegOpt.length - 1).replace(/\\/g, "\\\\");
                    myContent = "\(new RegExp\(\"" + myContentBody + "\",\"" + myRegOpt + "\"\)\)";
                } else {
                    var myContent = eval(myPrefs[idx] + ".toSource()")
                }
                var myFileName = myPrefs[idx] + ".pref";
                nas.otome.writeConsole(myContent);
                var myOpenFile = new File(this.preferenceFolder.path + "/" + this.preferenceFolder.name + "/" + myFileName);
                var canWrite = myOpenFile.open("w");
                if (canWrite) {
                    nas.otome.writeConsole(myOpenFile.fsName);
                    myOpenFile.encoding = "UTF-8";
                    myOpenFile.write(myContent);
                    myOpenFile.close();
                } else {
                    nas.otome.writeConsole(myOpenFile.fsName + ": これなんか書けないカンジ")
                }
                /**
                 * ファイルが既存かとか調べない　うほほ
                 */
            } else {
                nas.otome.writeConsole("object :" + myPrefs[idx] + "は存在しないようです。保存できません。")
            }
        }
    }
    //else{alert("GOGO")}
};

/**
 * nas.otome.readPreference();
 * スクリプト他のファイル類の実行サービスを乙女のライブラリに移動する
 * 振り分けルーチンは使用してもしなくてもかまわない
 * doFFX / doAction / doScript / throwSystem
 */

/**
 * nas.otome.doFiles(Files)
 * 指定のファイルを振り分けて実行する
 * スクリプトファイルは乙女のスコープで実行
 * データファイル / システム実行ファイルはシステムで実行
 * アクションフォルダはアクションとして実行
 * ｆｆｘは選択されたコンポに対して適用
 * それぞれのサービスのラッパです
 * @param myFiles
 */
nas.otome.doFiles = function (myFiles) {
    /**
     * 指定ファイルは複数（配列）　配列でない場合は配列化する
     */
    if (!(myFiles instanceof Array)) {
        myFiles = [myFiles]
    }
    for (ix in myFiles) {
        /**
         * 順次処理
         */
        var myTarget = myFiles[ix];
        if (myTarget instanceof File) {
            if (myTarget.exists) {
                if (myTarget.name.match(/\.jsx?$/i)) {
                    this.doScript([myTarget.path, myTarget.name].join("/"));
                    break;
                }
                if (myTarget.name.match(/\.ffx$/i)) {
                    this.doFFX([myTarget.path, myTarget.name].join("/"));
                    break;
                }
                this.systemOpen([myTarget.path, myTarget.name].join("/"));
            }
            break;
        } else {
            if (myTarget instanceof Folder) {
                /**
                 * フォルダ内の設定ファイルの有無を調べてアクション指定が存在する場合のみアクションとして振分
                 */
                var myConfigFile = new File([myTarget.path, myTarget.name, "_subMenu.js"].join("/"));
                var isAction = false;
                if (!myConfigFile.exists) {
                    myConfigFile = new File([myTarget.path, myTarget.name, "_subMenu.jsx"].join("/"))
                }
                if (myConfigFile.exists) {
                    myConfigFile.open("r");
                    myContent = myConfigFile.readln(1);
//						myContent += "\n";
                    /**
                     * 2行読み込み
                     */
                    myContent += myConfigFile.readln(1);
                    /**
                     * 3行読み込み
                     */
                    myContent += myConfigFile.readln(1);
                    myConfigFile.close();
                    if (myContent.match(/^\/\/no\x20launch/)) {
                        break
                    }
                    if (myContent.match(/\/\/actionFolder/)) {
                        isAction = true
                    }

                    if (isAction) {
                        this.doAction([myTarget.path, myTarget.name].join("/"));
                        break;
                    }
                }
                this.systemOpen([myTarget.path, myTarget.name].join("/"));
            }
            // if File Folder
            break;
        }
        //for
    }
    //if
};
/**
 * nas.otome.doScript(myPath)
 * スクリプトファイルのパスを与えて実行する
 * スクリプトファイルの実行ファイル存在の確認等は行なわないのであらかじめチェックすること
 * @param myPath
 */
nas.otome.doScript = function (myPath) {
    //
    var myFile = new File(myPath);
    var result = null;
    var prevCurrentFolder = Folder.current;
    Folder.current = new Folder(myFile.path);
    try {
        var scriptFile = myFile;
        scriptFile.open();
        result = eval(scriptFile.read());
        scriptFile.close();
    } catch (err) {
        result = err;
    }
    if (result) {
        this.writeConsole(result);
    }
    Folder.current = prevCurrentFolder;
};
/**
 * nas.otome.doAction(myPath)
 * 現在の選択アイテムがコンポだった場合アクションフォルダの適用を行なう
 * フォルダがアクションとして成立しているか否かは感知しない
 * 複数のアイテムが選択されている場合は、選択された全てのコンポアイテム
 * に対してアクションの適用を行なう。
 * 対象アイテム数が多い場合中断ダイアログを出す
 *
 * @param myPath
 */
nas.otome.doAction = function (myPath) {
    var borderCount = 25;
    var myFolder = new Folder(myPath);
    var myTargets = (app.project.activeItem) ? [app.project.activeItem] : app.project.selection;//アクティブアイテムがあればターゲットになければ選択されたアイテム全て
    var doFlag = true;
    if (myTargets.length > borderCount) {
        doFlag = (confirm(myTargets.length + " アイテムの処理が指定されました。" + nas.GUI.LineFeed + "続行しますか？")) ? true : false;
    }
    if (doFlag) {
        for (var itmIdx = 0; itmIdx < myTargets.length; itmIdx++) {
            if ((myTargets[itmIdx] instanceof CompItem) && (myFolder.exists)) {
                myTargets[itmIdx].executeAction(myFolder);
            } else {
                nas.otome.writeConsole("skip action for " + myTargets[itmIdx].name);
            }
        }
    }
};
/**
 * nas.ToolBox.doAction(FolderPath)
 * nas.otome.doFFX(myPath)
 * 現在の選択アイテムがコンポだった場合コンポ内のレイヤにFFXの適用を行なう
 * コンポにアクティブなレイヤがない場合はコンポのプリセット適用を行なう
 * @param myPath
 */
nas.otome.doFFX = function (myPath) {
    var borderCount = 25;
    var myFFX = new File(myPath);
    var myTargets = (app.project.activeItem) ? [app.project.activeItem] : app.project.selection;//アクティブアイテムがあればターゲットになければ選択されたアイテム全て
    var doFlag = true;
    if (myTargets.length > borderCount) {
        doFlag = (confirm(myTargets.length + " アイテムの処理が指定されました。" + nas.GUI.LineFeed + "続行しますか？")) ? true : false;
    }
    if (doFlag) {
        for (var itmIdx = 0; itmIdx < myTargets.length; itmIdx++) {
            if ((myTargets[itmIdx] instanceof CompItem) && (myFFX.exists)) {
                if (myTargets[itmIdx].selectedLayers.length) {
                    for (var lIdx = 0; lIdx < myTargets[itmIdx].selectedLayers.length; lIdx++) {
                        myTargets[itmIdx].selectedLayers[lIdx].applyPresetA(myFFX);
                    }
                } else {
                    if (myTargets[itmIdx].applyPreset) {
                        myTargets[itmIdx].applyPreset(myFFX)
                    }
                }
            } else {
                alert("プリセット適用は、コンポをアクティブにして実行してください");
            }
        }
    }
};
//===============================nas.ToolBox.doFFX(FilePath)
