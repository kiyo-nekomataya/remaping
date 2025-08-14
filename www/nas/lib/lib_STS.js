﻿/**
 * charset="utf-8"
 * @fileoverview STS2XPS(myOpenFile)
 *
 * STSファイルをXPS互換テキストにコンバートする
 * 引数    STSデータをポイントするファイルオブジェクト
 * 拡張子は sts/STS のみ。
 * ヘッダ検査あり。ファイルの破損は検査なし
 * 要 乙女バイナリ拡張
 * 全ファイルを配列にとらない方が良いかも…
 */
'use strict';
/**
 *
 * @params {Array} dataArray
 * @returns {String}
 *      returns XPS source stream
 */
function STS2XPS(dataArray,idf) {
    if((typeof dataArray == 'undefined')||(! dataArray.slice)) return null;
    if(! idf) idf = "";
    var checkValue = Array.from(
        dataArray.slice(0,18),function(e){return String.fromCharCode(e);}
    ).join('');
    if(checkValue.indexOf("\x11ShiraheiTimeSheet") < 0) return false;
// STSデータをオブジェクト化する
    var mySTS = dataArray.slice(0);
//フレーム継続数
    mySTS.frameDuration = mySTS[19] * 1 + mySTS[20] * 256;
//レイヤ数
    mySTS.layerCount = mySTS[18] * 1;
//1フレームあたりのデータ長2バイト整数
    mySTS.dataLength = 2;
    mySTS.body = function (layerID, frameID) {
        //2bite/1data : offset 23bite : IDは0オリジン アドレスを計算して値を戻すメソッド
        var myAddress = (layerID) * (this.frameDuration * this.dataLength) + (frameID * this.dataLength) + 23;
        return this[myAddress] + this[myAddress + 1] * 256;
    };
//ラベル取得(S-JIS)
    mySTS.layerLabel    = new Array(mySTS.layerCount);//ラベル配列
    var labelDataLength = new Array(mySTS.layerCount);//ラベルデータ長配列
// ラベルの位置と長さを取得
// ラベル0のシーク位置
    var labelOffset = mySTS.layerCount * (mySTS.frameDuration * mySTS.dataLength) + 23;
// ラベル長(バイト数)
    labelDataLength[0] = mySTS[labelOffset];

/*
 * open
 *    myOpenFile.open("r");
 *    myOpenFile.encoding = "CP932";
 */

// 最初のラベルを取得
console.log([labelOffset + 1,labelDataLength[0]]);
    mySTS.layerLabel[0] = mySTS.slice(labelOffset + 1,labelOffset + labelDataLength[0]+1);
console.log(mySTS.layerLabel[0]);

    for (var idx = 1; idx < mySTS.layerCount; idx++) {
        labelOffset = labelOffset + mySTS.layerLabel[idx - 1].length + 1;//新アドレス
        labelDataLength[idx] = mySTS[labelOffset];//ラベル長(バイト数)
console.log([labelOffset + 1,labelDataLength[idx]]);
//        myOpenFile.seek(labelOffset + 1, 0);//シーク
        mySTS.layerLabel[idx] = mySTS.slice(labelOffset + 1,labelOffset + labelDataLength[idx]+1);//取得
console.log(mySTS.layerLabel[idx]);
    }
//SJIS文字列に変換
    for (var idl = 0; idl < mySTS.layerLabel.length; idl++) {
        var lbl ="";
        for (var c = 0 ; c < mySTS.layerLabel[idl].length; c ++){
            lbl += "%" + mySTS.layerLabel[idl][c].toString(16);
        }
console.log(lbl);
console.log(mySTS.layerLabel[idl]);
        mySTS.layerLabel[idl] = UnescapeSJIS(lbl);
    };
    /**
     * XPS互換ストリームに変換
     * @returns {string}
     */
    mySTS.toSrcString = function () {
        var resultStream = "nasTIME-SHEET 0.5";
        resultStream += "\n";
        resultStream += "#ShiraheiTimeSheet";
        resultStream += "\n";
//        resultStream += "##TITLE=" + nas.workTitles.selectedName;
//        resultStream += "\n";
        resultStream += "##CUT=" + idf;
        resultStream += "\n";
        resultStream += "##TIME=" + nas.Frm2FCT(this.frameDuration, 3, 0);
        resultStream += "\n";
        resultStream += "##TRIN=0+00.,\x22\x22";
        resultStream += "\n";
        resultStream += "##TROUT=0+00.,\x22\x22";
        resultStream += "\n";
        /**
         * ラベル配置
         * @type {string}
         */
        resultStream += "[CELL\tN\t";
        for (var idx = 0; idx < this.layerCount; idx++) {
            resultStream += this.layerLabel[idx] + "\t";
        };
        resultStream += "]";
        resultStream += "\n";

        for (var frm = 0; frm < this.frameDuration; frm++) {
            resultStream += "\t\t";
            for (idx = 0; idx < this.layerCount; idx++) {
                if (frm == 0) {
                    var currentValue = this.body(idx, frm);
                } else {
                    var currentValue = (this.body(idx, frm) == this.body(idx, (frm - 1))) ? "" : this.body(idx, frm);
                };
                resultStream += (currentValue === 0) ? "X\t" : currentValue + "\t";
            };
            resultStream += "\n";
        };
        resultStream += "[END]";
        resultStream += "\n";
        resultStream += "converted from STS(ShiraheiTimeSheet)";
        return resultStream;
    };
    return mySTS.toSrcString();
}
/*TEST

*/