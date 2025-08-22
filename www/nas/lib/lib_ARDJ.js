/**
 *    @fileoverview
 *  AERemap exseed | cellRemap(http://bryful.yuzu.bz//ae.html)の
 *  ARDJデータを読み書きするためのライブラリ<br />
 */
'use strict';
/*=======================================*/
if((typeof window == 'undefined')&&(typeof app == 'undefined')){
    var nas = require('./xpsio');
};
/**
 *    ARDJファイルをXPS互換テキストにコンバートする<br />
 * @function
 * @param {Object ARDJ | String JSON of ARDJ} myARDJ
 *    ARDJオブジェクト　または　ARDLデータのテキストストリーム(JSON)
 * @returns {String nas.Xps}
 *    nas.Xps互換テキスト
 */
function ARDJ2XPS(myARDJ) {
    /*
     * 引数のプロパティを見てJSONデータならオブジェクト化
     */
    if (!myARDJ.cells) {
        if (JSON) {
            try {
                myARDJ = JSON.parse(myARDJ);
            } catch (err) {
                myARDJ = false;
            }
        }
        if (!myARDJ) {
            try {
                myARDJ = eval(myARDJ);
            } catch (err) {
                myARDJ = false;
            }
        }
        /*
         * JSONオブジェクトあればトライ　失敗したらEvalで更にトライ
         */
    }

    if (!myARDJ) {
        return false;
    }

    var myFrames = 144;
    var myLayers = 4;
    if (myARDJ.frameCount) {
        myFrames = myARDJ.frameCount;
    }

    if (myARDJ.cellCount) {
        myLayers = myARDJ.cellCount;
    }

    var myXps = new nas.Xps();
    myXps.init(parseInt(myLayers) + 2, parseInt(myFrames));

    //alert(myXps.toString());
    if (myARDJ.sheetName) {
        myXps.cut = myARDJ.sheetName;
    }//暫定的にカット番号にする

    if (myARDJ.frameRate) {
        myXps.framerate = myARDJ.frameRate;
    }

    if (myARDJ.caption) {
        for (var lid = 0; lid < myLayers; lid++) {
            if (myARDJ.caption[lid]) {
//                myXps.layers[lid].name = myARDJ.caption[lid];
                myXps.timeline(lid+1).id = myARDJ.caption[lid];
            }
        }
    }

    if (myARDJ.cells) {
        for (var L = 0; L < myLayers; L++) {
            for (var K = 0; K < myARDJ.cells[L].length; K++) {
                //	alert(K+" : "+myARDJ.cells[L][K]);
                myXps.timeline(L + 1)[myARDJ.cells[L][K][0]] = myARDJ.cells[L][K][1].toString();//ダイアログラインをよけてキーを配置
            }
        }
    }
    myXps.xpsTracks.noteText = "converted from ARDJ data";
    return myXps.toString();
}

/**
 * @function
 * nas.XpsオブジェクトからARDJテキストテキスト（JSON）へ変換
 * コンバートするXPSをARDJ互換形式で書き出すことができる。
 * ARDJはJSONテキストなので保存時はUTF8に
 *　
 * @param {Object nas.Xps|String nas.Xps} myXps
 *  引数はオブジェクトでも、ストリームでも受け付ける。
 * @returns {String ARDJ} (JSON)
 */
function XPS2ARDJ(myXps) {
    /**
     * 引数がソースであっても処理する。XPSでない場合はfalse
     */
    if (myXps instanceof nas.Xps) {
        var sourceXPS = myXps;
    } else {
        if ((myXps instanceof String) && (myXps.match(/^nasTIME-SHEET/))) {
            var sourceXPS = new nas.Xps();
            if (!sourceXPS.parseXps(myXps)) {
                return false;
            }
        } else {
            return false;
        }
    }

    /*
     * コンバートする
     *
     * nas.Xps暫定フォーマットのままなので、決め打ちでtimingタイムラインになってるけど
     * これは本来判定が必要　2013.03.24
     */

    /*
     * ARDJを空オブジェクトで初期化
     * @type {{sheetName: string, frameRate: number, frameCount: number, cellCount: number, caption: Array, cells: Array}}
     */
    var myARDJ = {
        "sheetName": "timesheet",
        "frameRate": 24,
        "frameCount": 24,
        "cellCount": 4,
        "caption": [],
        "cells": []
    };

    /*
     * 元データからプロパティ転記
     */
    myARDJ.sheetName = [sourceXPS.title, sourceXPS.opus, sourceXPS.scene, sourceXPS.cut].join("_");
    myARDJ.frameRate = parseInt(sourceXPS.framerate, 10);
    myARDJ.frameCount = sourceXPS.duration();

    /*
     * レイヤ名を組む
     * option="timing"のトラックのみpushしてIDを控える
     */
    var myTarget = [];
    for (var lid = 1; lid < sourceXPS.xpsTracks.length-1; lid++) {
        if (sourceXPS.timeline(lid).option.match(/(replacement|timing|still)/i)) {
            myTarget.push(lid);
            myARDJ.caption.push(sourceXPS.timeline(lid).id);
        }
    }
    myARDJ.cellCount = myTarget.length;//セルカウントセット

    /*
     * 変換するタイムラインを処理してキー配列を作成
     */
    for (var lid = 0; lid < myARDJ.cellCount; lid++) {
        var buffDataArray = sourceXPS.getNormarizedStream(myTarget[lid]-1);
        var keyDataArray = [];
        /*
         * 第一フレームセット
         */
        var currentValue = (isNaN(buffDataArray[0])) ? 0 : buffDataArray[0];
        keyDataArray.push([0, currentValue]);
        /*
         * 第二フレーム以降を処理
         */
        for (var fid = 1; fid < myARDJ.frameCount; fid++) {
            var nextValue = (isNaN(buffDataArray[fid])) ? 0 : buffDataArray[fid];
            if (currentValue == nextValue) {
                //前と同じデータならskip
                continue;
            } else {
                /*
                 * 違っていたらカレント更新してキー追加
                 */
                currentValue = nextValue;
                keyDataArray.push([fid, currentValue]);
            }
        }
        /*
         * 配列長が1で、かつキーの値が0の場合は空配列をセットする
         */
        if ((keyDataArray.length == 1) && (keyDataArray[0][1] == 0)) {
            //alert("oneData :"+[].toString());
            myARDJ.cells[lid] = [];
        } else {
            //alert(keyDataArray)
            myARDJ.cells[lid] = keyDataArray;
        }

    }

    return (JSON instanceof Object) ? JSON.stringify(myARDJ) : myARDJ.toSource();
}
//ARDJ2XPS(XPS2ARDJ(XPS));
 /*=======================================*/
if((typeof window == 'undefined')&&(typeof app == 'undefined')){
    exports.ARDJ2XPS = ARDJ2XPS;
    exports.XPS2ARDJ = XPS2ARDJ;
}
/*  eg. for import
    const { ARD2XPS , XPS2ARD } = require('./lib_ARD.js');

*/