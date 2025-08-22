/**
 *	@fileoverview TSH2XPS(TSHStream)
 *	TSHファイルをXPS互換テキストにコンバートする
 *	引き数は、TSHデータのテキストストリーム,
 * データファイル名でなくblob渡しに変更する必要あり
 */
'use strict';
/*=======================================*/
if((typeof window == 'undefined')&&(typeof app == 'undefined')){
    var nas = require('./xpsio');
};
/**
 * @param TSHStream
 * @returns {*}
 * @constructor
 */
function TSH2XPS(TSHStream) {
    /**
     * @desc データ冒頭のみチェックして明確に違うストリームの場合はエラーを返す
     */
    if (!TSHStream.match(/^\x22([^\x09]*\x09){25}[^\x09]*/)) {
        return false;
    }
    /**
     * CSVデータをオブジェクト化する
     * @type {{}}
     */
    var myTSH = {};

    /**
     * ラインで分割して配列に取り込み
     * @type {Array}
     */
    myTSH.SrcData = [];
    if (TSHStream.match(/\r/)) {
        TSHStream = TSHStream.replace(/\r\n?/g, ("\n"));
    }
    TSHStream = TSHStream.replace(/\"/g, (""));//前後の\"を払う
    TSHStream = TSHStream.replace(/\n+/g, ("\n"));//空行があれば捨てる
    TSHStream = TSHStream.replace(/\n$/, "");//末尾が改行ならそれも捨てる

    myTSH.SrcData = TSHStream.split("\n");//改行で分割

    /**
     * @desc tshは
     * 第一レコードがセルラベル
     * 第二行は、キー変換の為のマーカー行だが、りまぴんには相当するプロパティが無いので無視
     * 第三レコード以降がシートデータ シートデータの最大有効レコードを取得して有効なレイヤ数を出すこと
     */
    myTSH.layerCount = 0;
    for (var lid = 2; lid < myTSH.SrcData.length; lid++) {
        if (myTSH.SrcData[lid].length > 25) {
            var currentCount = 26 - myTSH.SrcData[lid].match(/\t*$/)[0].length;
            //固定長レコードなので、全数から空フィールドの数をひいてCountをとる
            if (currentCount > myTSH.layerCount) {
                myTSH.layerCount = currentCount
            };
        };
    };
    /**
     * 各ラインを更にテキストの配列に分解
     */
    for (var idx = 0; idx < myTSH.SrcData.length; idx++) {
        if (myTSH.SrcData[idx].length > 1) {
            myTSH.SrcData[idx] = myTSH.SrcData[idx].split("\t")
        };
    };
    myTSH.body = function (layerID, frameID) {
        return (this.SrcData[frameID + 2][layerID]);
    };
    /**
     * 前処理を済ませてフレーム継続数を取得 全有効ライン数-(ラベル行,マーク行)
     * @type {number}
     */

    myTSH.frameDuration = myTSH.SrcData.length - 2;
    /**
     * ラベル取得
     * @param layerID
     * @returns {*}
     */
    myTSH.layerLabel = function (layerID) {
        return myTSH.SrcData[0][layerID];
    };


    /**
     * @desc シートから直接ラベルを取得するメソッド
     */

    /**
     * XPS互換ストリームに変換
     * @returns {string}
     */
    myTSH.toSrcString = function () {
//	var myLineFeed=nas.GUI.LineFeed;
        var myLineFeed = "\n";
        var resultStream = "nasTIME-SHEET 0.4";
        resultStream += myLineFeed;
        resultStream += "#T-Sheet";
        resultStream += myLineFeed;
        resultStream += "##TIME=" + nas.Frm2FCT(this.frameDuration, 3, 0);
        resultStream += myLineFeed;
        resultStream += "##TRIN=0+00.,\x22\x22";
        resultStream += myLineFeed;
        resultStream += "##TROUT=0+00.,\x22\x22";
        resultStream += myLineFeed;
        /**
         * ラベル配置
         * @type {string}
         */
        resultStream += "[CELL\tN\t";
        for (var idx = 0; idx < this.layerCount; idx++) {
            resultStream += this.layerLabel(idx) + "\t";
        }
        resultStream += "]";
        resultStream += myLineFeed;

        for (var frm = 0; frm < this.frameDuration; frm++) {
            resultStream += "\t";
            //T-Sheetはダイアログデータをサポートしないので1フィールドスキップ
            resultStream += "\t";
            for (var idx = 0; idx < this.layerCount; idx++) {
                if (frm == 0) {
                    var currentValue = this.body(idx, frm);
                } else {
                    var currentValue = (this.body(idx, frm) == this.body(idx, (frm - 1))) ? "" : this.body(idx, frm);
                }
                resultStream += (currentValue === 0) ? "X\t" : currentValue + "\t";
            }
            resultStream += myLineFeed;
        }
        resultStream += "[END]";
        resultStream += myLineFeed;
        resultStream += "converted from T-Sheet";
        return resultStream;
    };
    //alert( myTSH.toSrcString());
    return myTSH.toSrcString();
}

/**
 * 書式　XPS2TSH(myXPS)
 * 引数はオブジェクトでも、ストリームでも受け付ける。
 * コンバートするXPSをTSheet互換形式で書き出すことができる。
 * 文字コードのコンバートは特にしていないので、
 * 必要なら何か別のコンバート手段を利用してShift-JISに変換されたし。
 *
 * @param myXPS
 * @returns {*}
 * @constructor
 */
function XPS2TSH(myXPS) {
    /**
     * 引数がソースであっても処理する。XPSでない場合はfalse
     */
    if (myXPS instanceof nas.Xps) {
        var sourceXPS = myXPS;
    } else {
        if ((myXPS instanceof String) && (myXPS.match(/^nasTIME-SHEET/))) {
            var sourceXPS = new nas.Xps();
            if (!sourceXPS.readIN(myXPS)) {
                return false;
            }
        } else {
            return false;
        }
    }

    /**
     * XPSフォーマット拡張に従ってタイミング以外のデータが発生するので、種別判定して選択する機能が必要
     * プロパティをチェックして必要なタイムラインのIDを抽出する
     * @type {Array}
     */
    var myTarget = [];
    for (var ix = 1; ix < myXPS.xpsTracks.length; ix++) {
        if (myXPS.timeline(ix).option.match(/(replacement|timing|still)/i)) {
            myTarget.push(ix);
        }
    }

    /**
     * コンバートする
     * @type {Array}
     */
    var myTSH = [];
    myTSH.recordCount = 26;//TSHはレコード長固定
    /**
     * 第一レコードを作る
     * @type {string}
     */
    var currentRecord = "";
    var defaultNames = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    for (var ct = 0; ct < myTSH.recordCount; ct++) {
        if (ct < myTarget.length) {
            currentRecord += myXPS.timeline([myTarget[ct]]).id;
        } else {
            currentRecord += defaultNames.charAt(ct);
        }
        if (ct < (myTSH.recordCount - 1)) {
            currentRecord += "\t";
        }
    }
    myTSH.push(currentRecord);
    /**
     * 空レコードを挿入
     */
    myTSH.push(new Array(26).join("\t"));

    /**
     * 第二レコード以降ボディデータを流し込む(桁揃えで固定長レコードにする)
     */
    for (var myFrame = 0; myFrame < myXPS.duration(); myFrame++) {
        currentRecord = "";
        for (var LC = 0; LC <= myTSH.recordCount; LC++) {
//            if (LC < myXPS.layers.length) {            }
            if (LC < myTarget.length) {
                var currentValue = dataCheck( myXPS.xpsTracks[myTarget[LC]][myFrame], myXPS.timeline(myTarget[LC]).id);
                if (currentValue == "blank") {
                    currentValue = "0";
                }
                if (currentValue == null) {
                    currentValue = "";
                }
                currentRecord += currentValue + "\t";
            } else {
                if (LC < (myTSH.recordCount - 1)) {
                    currentRecord += "\t";
                }
                //空フィールド
            }
        }
        myTSH.push(currentRecord);
    }

    return '"' + myTSH.join("\r") + '"\r\n';
}

/**
 *
 * 現在Tsheetのコンバートに対しては、timingタイムラインに限定する処理が未処理(処理済2013.04.29)
 * シート上のレコードとして数値以外は認められないようなので、これを変換する処理のみ
 *
 * おっと、改行が\rのみだったようだ。
 * まだ1バイトファイルサイズが違う…なんかファイル終端だけに\nが付いてる。
 *
 * 暫定的にXPSストリーム（ソース）で返しているが、オブジェクトのままのほうが良いかもしれない。一考の余地あり？
 * この形式で各フォーマットのコンバータを作って一元化したいが、どうよ？
 * 逆変換も欲しいね。
 */
/*=======================================*/
if((typeof window == 'undefined')&&(typeof app == 'undefined')){
    exports.TSH2XPS = TSH2XPS;
    exports.XPS2TSH = XPS2TSH;
}
/*  eg. for import
    const { TSH2XPS , XPS2TSH } = require('./lib_TSH.js');

*/