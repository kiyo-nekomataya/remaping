/**
 *    @fileoverview
 *  AE Remap(http://bryful.yuzu.bz/software/junk/AE_Remap111.zip)の
 *  データを読み書きするためのライブラリ<br />
 *  AE Remapは(02.2019)現在 次バージョンに移行して更新停止
 */
'use strict';
/*=======================================*/
if((typeof window == 'undefined')&&(typeof app == 'undefined')){
    var nas = require('./xpsio');
};

/**
 *  ARDデータをXPS互換テキストにコンバートする
 *  @param {String} ARDStream
 *   改行を含むARDデータ全体
 *  @return {string}
 *   XPS互換サブセットテキスト
 */
function ARD2XPS(ARDStream) {
    /*
     * データ冒頭のみチェックして明確に違うストリームの場合はエラーを返す
     */
    if (!ARDStream.match(/^#TimeSheetGrid\x20SheetData/)) {
        return "";
    }

    /*
     * ARDデータをオブジェクト化する。デフォルトの値は、変換時に書きなおすので決め打ち
     */
    var myARD = {
        "LayerCount": 0,
        "FrameCount": 24,
        "SrcWidth": 1280,
        "SrcHeight": 720,
        "PageFrame": 144,
        "CmpFps": 24,
        "SrcAspect": 1,
        "CmpAspect": 1,
        "EmptyCell": 0,
        "CellNames": [],
        "Cell": [
            [],
            [],
            [],
            [],
            [],
            [],
        ]
    };
    /*
     * ラインで分割して配列に取り込み
     */
    myARD.SrcData = [];
    if (ARDStream.match(/\r/)) {
        ARDStream = ARDStream.replace(/\r\n?/g, ("\n"));
    }

    myARD.SrcData = ARDStream.split("\n");
    /*
     * データ走査・モード切替つつパラメータ取得
     */
    var cellIndex = 0;
    var dataStatus;
    for (var line = 1; line < myARD.SrcData.length; line++) {
        if (myARD.SrcData[line] == "") {
            continue;//空行スキップ
        } else {
            var myLineData = myARD.SrcData[line].split("\t");
            switch (myLineData[0]) {
                case "*CommentStart":
                case "*CommentEnd":
                    dataStatus = "Skip";
                    break;
                case "*ParamStart":
                    dataStatus = "Param";
                    break;
                case "*MapData":
                case "*MapNumber":
                case "*ChildLayer":
                    dataStatus = "Skip";
                    break;
                case "*CellName":
                    dataStatus = "Names";
                    break;
                case "*CellDataStart":
                    dataStatus = "KeyEntry";
                case "*Cell":
                    cellIndex = myLineData[1];
                    continue;
                case "*CellEnd":
                    continue;
                case "*End":
                    dataStatus = "end";
                    break;
            }
        }
        /*
         * モードにしたがってパラメータ取得
         */
        switch (dataStatus) {
            case "Param":
                myARD[myLineData[0]] = myLineData[1];
                break;
            case "Names":
                if (myLineData[0].match(/^[0-9]+$/)) {
                    myARD.CellNames.push(myLineData[1])
                }
                break;
            case "KeyEntry":
                myARD.Cell[cellIndex].push([myLineData[0], myLineData[1]]);
            case "End":
            default :
                break;
        }

    }
//ダイアログトラック 1,コメントトラック 1を追加して初期化
    var myXps = new nas.Xps();
    myXps.init(parseInt(myARD.LayerCount) + 2, parseInt(myARD.FrameCount));
    if (myARD.CmpFps) {
        myXps.framerate.parse(myARD.CmpFps);
    }
    if (myARD.CellNames) {
console.log(myARD.CellNames);
        for (var lid = 0; lid < myARD.CellNames.length; lid++) {
            if (myARD.CellNames[lid]) {
console.log(myXps.xpsTracks[lid+1]);
                myXps.xpsTracks[lid+1].id = myARD.CellNames[lid];
            }
        }
    }

    if (myARD.Cell) {
        for (var L = 0; L < myARD.CellNames.length; L++) {
            for (var K = 0; K < myARD.Cell[L].length; K++) {
//                myXps.xpsBody[L + 1][parseInt(myARD.Cell[L][K][0], 10) - 1] = myARD.Cell[L][K][1];//ダイアログラインをよけてキーを配置
                myXps.xpsTracks[L + 1][parseInt(myARD.Cell[L][K][0], 10) - 1] = myARD.Cell[L][K][1];//ダイアログラインをよけてキーを配置
            }
        }
    }
    myXps.xpsTracks.noteText = "converted from AERemap data";
    return myXps.toString();
}

/**
 *　nas.XpsデータをARDデータにコンバートする
 *  @param {Object nas.Xps or String} sourceXPS
 *  @returns {String} 
 *      ARDテキストデータ
 */
/*<pre>
 * 引数はオブジェクトでも、ストリームでも受け付ける。
 * コンバートするXPSをARD互換形式で戻す。
 * 文字コードのコンバートは特にしていないので、必要したがって書き出しの際にShift-JISに変換すること。
 *</pre>
 */
function XPS2ARD(sourceXPS) {
    /*
     * 引数がソースであっても処理する。XPSでない場合はfalse
     */
    if (sourceXPS instanceof nas.Xps) {
        var sourceXPS = sourceXPS;
    } else {
        if ((sourceXPS instanceof String) && (sourceXPS.match(/^nasTIME-SHEET/))) {
            var sourceXPS = new nas.Xps();
            if (!sourceXPS.parseXps(sourceXPS)) {
                return false;
            }
        } else {
            return false;
        }
    }

    /*
     * sourceXPSからtiming関連タイムラインを抽出
     * プロパティをチェックして必要なタイムラインのIDを抽出する
     */
    var myTarget = [];
    for (var ix = 1; ix < (sourceXPS.xpsTracks.length-1); ix++) {
        if (sourceXPS.xpsTracks[ix].option.match(/(replacement|timing|still)/i)) {
            myTarget.push(ix);
        }
    }

    /*
     * ARD互換のオブジェクトを作成
     * @type {{LayerCount: number, FrameCount, SrcWidth: (string|*), SrcHeight: (*|string), PageFrame: number, CmpFps: *, SrcAspect: number, CmpAspect: (*|string), EmptyCell: number, CellNames: Array, Cell: Array}}
     */
    var myARD = {
        "LayerCount": 0,
        "FrameCount": sourceXPS.duration(),
        "SrcWidth"  : sourceXPS.xpsTracks[myTarget[0]].sizeX,
        "SrcHeight" : sourceXPS.xpsTracks[myTarget[0]].sizeY,
        "PageFrame" : (xUI) ? xUI.PageLength : 6 * sourceXPS.framerate,
        "CmpFps"    : sourceXPS.framerate,
        "SrcAspect" : 1,
        "CmpAspect" : sourceXPS.xpsTracks[myTarget[0]].aspect,
        "EmptyCell" : 0,
        "CellNames" : [],
        "Cell"      : []
    };

    /*
     * レイヤ名を組む
     * option="timing"のものだけpushしてIDを控える
     * @type {Array}
     */
//    var myTargetLayers = [];
    for (var lid = 0; lid < myTarget.length; lid++) {
        myARD.CellNames.push(sourceXPS.xpsTracks[lid].id);
    }
    myARD.LayerCount = myTarget.length;//セルカウントセット

    /**
     * 変換するタイムラインを処理してキー配列を作成
     */
    for (var lid = 0; lid < myARD.LayerCount; lid++) {
        var buffDataArray = sourceXPS.getNormarizedStream(myTarget[lid]-1);
        var keyDataArray = [];
        /**
         * 第一フレームセット
         * @type {number}
         */
        var currentValue = (isNaN(buffDataArray[0])) ? 0 : buffDataArray[0];
        keyDataArray.push([0, currentValue]);
        /**
         * 第二フレーム以降を処理
         */
        for (var fid = 1; fid < myARD.FrameCount; fid++) {
            var nextValue = (isNaN(buffDataArray[fid])) ? 0 : buffDataArray[fid];
            if (currentValue == nextValue) {
                /**
                 * 前と同じデータならskip
                 */

            } else {
                /**
                 * 違っていたらカレント更新してキー追加
                 * @type {number}
                 */
                currentValue = nextValue;
                keyDataArray.push([fid, currentValue]);
            }
        }
        /**
         * 配列長が1で、かつキーの値が0の場合は空配列をセットする
         */
        if ((keyDataArray.length == 1) && (keyDataArray[0][1] == 0)) {
            //alert("oneData :"+[].toString());
            myARD.Cell[lid] = [];
        } else {
            //alert(keyDataArray)
            myARD.Cell[lid] = keyDataArray;
        }
    }

    /**
     * コンバートする
     * @returns {string}
     */
    myARD.toString = function () {
        var resultStream = "#TimeSheetGrid SheetData\n";
        resultStream += "\n";
        resultStream += "*ParamStart\n";
        resultStream += "LayerCount\t" + this.LayerCount + "\n";
        resultStream += "FrameCount\t" + this.FrameCount + "\n";
        resultStream += "SrcWidth\t" + this.SrcWidth + "\n";
        resultStream += "SrcHeight\t" + this.SrcHeight + "\n";
        resultStream += "PageFrame\t" + this.PageFrame + "\n";
        resultStream += "CmpFps\t" + this.CmpFps + "\n";
        resultStream += "SrcAspect\t" + this.SrcAspect + "\n";
        resultStream += "CmpAspect\t" + this.CmpAspect + "\n";
        resultStream += "EmptyCell\t" + this.EmptyCell + "\n";
        resultStream += "\n";
        resultStream += "*CellName\n";
        for (var lid = 0; lid < this.CellNames.length; lid++) {
            resultStream += lid + "\t" + this.CellNames[lid] + "\n";
        }
        resultStream += "*CellDataStart\n";
        for (var lid = 0; lid < this.CellNames.length; lid++) {
            resultStream += "*Cell" + "\t" + lid + "\n";
            for (var kid = 0; kid < this.Cell[lid].length; kid++) {
                resultStream += nas.Zf(this.Cell[lid][kid][0] + 1, 4) + "\t" + this.Cell[lid][kid][1] + "\n";
            }
            resultStream += "*CellEnd" + "\t" + lid + "\n";
            resultStream += "\n";
        }
        resultStream += "*End";
        return resultStream;
    };
    return myARD.toString();
}
/**
 * @note
 *
 * 暫定的にXPSストリーム（ソース）で返しているが、オブジェクトのままのほうが良いかもしれない。一考の余地あり？
 * この形式で各フォーマットのコンバータを作って一元化したいが、どうよ？
 * 逆変換も欲しいね。
 */
 /*=======================================*/
if((typeof window == 'undefined')&&(typeof app == 'undefined')){
    exports.ARD2XPS = ARD2XPS;
    exports.XPS2ARD = XPS2ARD;
}
/*  eg. for import
    const { ARD2XPS , XPS2ARD } = require('./lib_ARD.js');

*/