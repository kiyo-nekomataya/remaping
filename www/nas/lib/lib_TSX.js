/**
 * @fileOverview
 *  江面氏の(http://log.ezura.asia/)管理していた TSXformat テキスト(非公開)の読み書きのためのライブラリ
 * <p>
 * 同フォーマットは、シンプルなテキストファイルで
 * 1ファイル（データ）あたり1レイヤー（トラック）分のタイミングを
 * 整数値とカラセル記号のみで記述するフォーマット</p>
 *　<p>詳細は別紙</p)
 * /(^[0-9\*]?--[^\-]*$|[eE])/
 */
'use strict';
/**
 * @function
 * TSX機能用UI画面再描画
 */
function init_TSXEx() {
    var _body = "<a	href='javascript:void(0);'";
    _body += "	onclick=\"if(document.cgiSample.TSXall.checked){writeTSX(XPS)}else{writeTSX(XPS ,xUI.Select[0]-1 )};return false;\"";
    _body += "	title=\"TSXを書き出し\"";
    _body += ">ＴＳＸ書出</a> ";
    _body += "<input type=checkbox name=TSXall id=TSXall title='全シート同時書出' checked>";
    _body += "<a href='javascript:void(0);' onclick='chg(\"TSXall\");'>all</a>";
    _body += "<!--TSX 拡張-->";

//	parent.info.document.getElementById("TSXUi").innerHTML=_body;
    document.getElementById("TSXUi").innerHTML = _body;
}

/**
 * 
 * TSX 繰り返しリスト展開プロシージャ
 * @type {number}
 */
var TSXEx_skipValue = 0;//グローバルで初期化

/**
 * TSX形式の繰り返し処理を配列に展開して返す
 * @function
 * @param {String} ListStr
 *  TSX形式繰り返し記述
 * @param rcl
 *  再帰呼出しフラグ
 * @returns {Array}
 *  セル番号の配列
 */
function TSX_expdList(ListStr, rcl) {
    if (!rcl) {
        rcl = false
    } else {
        rcl = true
    }
    if (!rcl) {
        TSXEx_skipValue = 0;
        //初回呼び出しのみ再度初期化
    }
    /*
     * (スキップ量は0固定)
     */
    var SepChar = "\,";//カンマのみ？

    /*
     * 冒頭の[rR+]を削除
     */
    ListStr = ListStr.replace(/^([\+rR])(.*)$/, "$2");
    /*
     * リスト文字列を走査してカラセル表記を置換
     */
    ListStr = ListStr.replace(/[X\* ]/g, "x");
    /*
     * 角括弧を一組で括弧と置換
     */
    ListStr = ListStr.replace(/\[(.*)\]/g, "\($1\)");
    /*
     * "="を展開
     */
    ListStr = ListStr.replace(/(\,?)(\(.+\))\=([1-9][0-9]*)/g, "$1s$3\,$2\,s1");//括弧あり
    ListStr = ListStr.replace(/([\,^]+)([1-9][0-9]*)\=([1-9][0-9]*)/g, "$1s$3\,$2\,s1");//括弧なし
//		var PreX="/\(\.([1-9])/g";//括弧の前にセパレータを補う
    ListStr = ListStr.replace(/\(([^\.])/g, "\(" + SepChar + "$1");
//		var PostX="/[0-9](\)[1-9])/";//括弧の後にセパレータを補う
    ListStr = ListStr.replace(/([^\.])(\)[1-9]?)/g, "$1" + SepChar + "$2");

    /*
     * 前処理終わり
     * リストをセパレータで分割して配列に
     */
    var srcList = [];
    srcList = ListStr.toString().split(SepChar);

    if (xUI.Select[0] == 0) {
    } else {
    }

    var expdList = [];//生成データ配列を作成
    var sDepth = 0;//括弧展開深度/初期値0
    var StartCt = 0;
    var EndCt = 0;
//rT=0;
    /*
     * 元配列を走査
     */
    for (var ct = 0; ct < srcList.length; ct++) {
        tcn = srcList[ct];

        /*
         * トークンがコントロールワードならば値はリザルトに積まない
         * 変数に展開してループ再開
         */
        if (tcn.match(/^s([1-9][0-9]*)$/)) {
//		if(RegExp.$1*1>0) {xUI.spin(RegExp.$1*1)}else{xUI.spin(1)};
            TSXEx_skipValue = (RegExp.$1 * 1 > 0) ? (RegExp.$1 * 1 - 1) : 0;
            continue;
        }

        /*
         * グローバル
         * トークンが開き括弧ならばデプスを加算して保留
         */
        if (tcn.match(/^(\(|\/)$/)) {
            sDepth = 1;
            StartCt = ct;
            /*
             * トークンを積まないで閉じ括弧を走査
             */
            var ct2 = 0;//ローカルスコープにするために宣言する
            for (ct2 = ct + 1; ct2 < srcList.length; ct2++) {
                if (srcList[ct2].match(/^\($/)) {
                    sDepth++
                }
                if (srcList[ct2].match(/^(\)|\/)[\*x]?([0-9]*)$/)) {
                    sDepth--
                }
                if (sDepth == 0) {
                    EndCt = ct2;
                    /*
                     * 最初の括弧が閉じたので括弧の繰り返し分を取得/ループ
                     */
                    var rT = RegExp.$2 * 1;
                    if (rT < 1) {
                        rT = 1
                    }
                    var ct3 = 0;//ローカルスコープにするために宣言する
                    for (ct3 = 1; ct3 <= rT; ct3++) {
                        if ((StartCt + 1) != EndCt) {
//alert("DPS= "+sDepth+" :start= "+StartCt+"  ;end= "+EndCt +"\r\n"+ srcList.slice(StartCt+1,EndCt).join(SepChar)+"\r\n\r\n-- "+rT);
                            expdList = expdList.concat(TSX_expdList(srcList.slice(StartCt + 1, EndCt).join(SepChar), "Rcall"));
                            /*
                             * 括弧の中身を自分自身に渡して展開させる
                             */
                        }
                    }
                    ct = EndCt;
                    break;
                }//if block end
            }//ct2 loop end
            if (rT == 0) {
                expdList.push(srcList[ct]);
                tss_kip();//ct++;
            }
        } else {
            /*
             * トークンが展開可能なら展開して生成データに積む
             */
            if (tcn.match(/^([1-9]{1}[0-9]*)\-([1-9]{1}[0-9]*)$/)) {
                var stV = Math.round(RegExp.$1 * 1);
                var edV = Math.round(RegExp.$2 * 1);
                if (stV <= edV) {
                    for (tcv = stV; tcv <= edV; tcv++) {
                        expdList.push(tcv);
                        tss_kip()
                    }
                } else {
                    for (tcv = stV; tcv >= edV; tcv--) {
                        expdList.push(tcv);
                        tss_kip()
                    }
                }
            } else {
                expdList.push(tcn);
                tss_kip();
            }

        }
    }
    /*
     * 生成配列にスキップを挿入
     */
    function tss_kip() {
        for (x = 0; x < TSXEx_skipValue; x++) {
            expdList.push('');
        }
    }
    /*
     * カエス
     */
    return expdList;
}

/**　XpsからTSXテキストへの変換と書き出し
 * @param {Object Xps} obj
 *  変換対象のXps
 * @param layerID
 *  書き出し対象のレイヤID(トラックID+1)
 */
function writeTSX(obj, layerID) {
    if (!isNaN(layerID)) {
        var stID = layerID;
        var edID = layerID + 1;
    } else {
        var stID = 1;
        var edID = obj.xpsTracks.length-1;
    }
    /*
     * objはXPSオブジェクトを与えること
     */
//対象タイムラインがtiming系でない場合は、処理をスキップ
    for (column = stID; column < edID; column++) {
        if (!obj.xpsTracks[column].option.match(/(replacement|timing|still)/i)) {
            continue
        }
//for (LID=stID;LID<edID;LID++){}
        result = "";//リザルト初期化
//	column=LID

        /**
         * シートボディ
         */
        for (line = 0; line < obj.duration(); line++) {
            dCk = dataCheck(obj.xpsTracks[column][line], obj.xpsTracks[column].id, true);
            switch (dCk) {
                case    null    :
                    result += "";
                    break;
                case    "blank":
                    result += "*";
                    break;
                default:
                    result += dCk;
            }
//		if((column+1)!=obj.layers.length){result+='\t'};//セパレータ
            result += '--' + (line + 1).toString();//行番号
            if (line == 0) {
                result += "\t\[ " + obj.xpsTracks[column].id + " \]"
            }
            //レイヤ名
            result += '\r\n';//改行
        }
        /**
         * ENDマーク
         * @type {string}
         */
        result += 'E';

// // // // //返す(とりあえず)
//return result;
        wiOpt = "screenX=";
        wiOpt += (column * 32).toString();
        wiOpt += ",screenY=";
        wiOpt += column * 24;
        wiOpt += ",left=";
        wiOpt += column * 32;
        wiOpt += ",top=";
        wiOpt += column * 24;
        wiOpt += ",width=480,height=360,scrollbars=yes,menubar=yes";

        _w = window.open("", obj.xpsTracks[column].id, wiOpt);

        _w.document.open("text/plain");
        if (!MSIE && !Firefox)_w.document.write("<html><body><pre>");
        _w.document.write(result);
        if (!MSIE && !Firefox)_w.document.write("</pre></body></html>");
        _w.document.close();
        _w.window.document.title = obj.xpsTracks[column].id.toString();
    }
//	return false;//リンクのアクションを抑制するためにfalseを返す
}


/**
 * TSXストリームをXPS互換データストリームに変換する
 * ストリームが、複数のレイヤを含んでいても良い
 * 
 * @function
 * @param {String} TSX datastream
 * @returns {String XpsStream}
 *
 */
function TSX2XPS(datastream) {
    /*
     * データ冒頭の空白文字を削除
     */
    datastream = datastream.replace(/^\s*/, "");
    if ((!datastream.toString().length ) ||
        ( false )
    ) {
        alert("error : " + datastream);
        return false
    }
    /*
     * 不正データ時処理
     * ラインで分割して配列に取り込み
     */
    if (datastream.match(/\r/)) {
        datastream = datastream.replace(/\r\n?/g, ("\n"));
    }
    var SrcData = [];
    SrcData = datastream.split("\n");

    /*
     * データストリームを判定する
     */
    SrcData.startLine = 0;//データ開始行
    /*
     * ソースデータのプロパティ
     */
    SrcData.layerCount = 0;//レイヤ数
    SrcData.layers     = [];//レイヤ情報トレーラー
    SrcData.frameCount = 0;//読み取りフレーム数
    SrcData.time       = 0;//初期化
    var LayerDuration  = 0;
    var LayerCount     = 0;

    /*
     * TSXデータ走査第一パス(プロパティ取得)
     */
    for (var line = 0; line < SrcData.length; line++) {
        /*
         * 本体情報の確認
         * レイヤカウント・各レイヤの継続時間カウント
         * タイムシートの長さは最長のレイヤを使用
         * シートの継続はサポート=(直後のレイヤと連結)
         * 空白行はすべてフレームカウント
         * 開始行および読み込み停止行の直後の行のみ情報行として使用
         *    第二フィールドを
         * 継続時間に加算されないデータ    /^[\/eE].*$/
         */
        if (SrcData[line].match(/^[\/eE].*$/)) {
            if (LayerCount != SrcData.layerCount) {
                SrcData.layers[LayerCount].duration = LayerDuration;
                LayerDuration = 0;
                LayerCount++;
            }
            /*
             * 記述終了・継続時間加算リセット・レイヤ加算
             */
        } else {
            if (LayerCount == SrcData.layerCount) {
                SrcData.layerCount++;
                SrcData.layers[LayerCount] = {};
                SrcData.layers[LayerCount].blmtd = "file";
                SrcData.layers[LayerCount].blpos = "first";
                SrcData.layers[LayerCount].lot = "=AUTO=";
            }
            LayerDuration++;
            if (SrcData.time < LayerDuration) {
                SrcData.time = LayerDuration;
            }
        }
        //有効な動画番号データ(単独)	/^[1-9][0-9]*\s?.*$/
        //有効な動画番号データ(繰返)	/^[+rR]?\[?[1-9][\,]\]?
    }
    /**
     * プロパティの設定
     * @type {string}
     */
    SrcData.mapfile = "(no file)";
    SrcData.title = myTitle;
    SrcData.subtitle = mySubTitle;
    SrcData.opus = myOpus;
    SrcData.scene = "";
    SrcData.cut = "";
    SrcData.create_user = myName;
    SrcData.update_user = myName;
    SrcData.create_time = "";
    SrcData.update_time = "";

    SrcData.memo = "converted from TSX data";

    SrcData.framerate = "";

    SrcData.trin = [0, "trin"];
    SrcData.trout = [0, "trout"];

    /*
     * 第一パス終了・読み取った情報でXPSオブジェクトを初期化
     */
    SrcData.duration = SrcData.time;//TSXはトランジションを扱わない
    /*
     * 仮オブジェクトにマッピングしてストリームで返す
     */
    var myXps = new Xps(SrcData.layerCount, SrcData.time);


    /*
     * 第一パスで読み取ったプロパティをXPSに転記
     */
    myXps.mapfile = SrcData.mapfile;
    myXps.title = SrcData.title;
    myXps.subtitle = SrcData.subtitle;
    myXps.opus = SrcData.opus;
    myXps.scene = SrcData.scene;
    myXps.cut = SrcData.cut;
    myXps.create_user = SrcData.create_user;
    myXps.update_user = SrcData.update_user;
    myXps.create_time = SrcData.create_time;
    myXps.update_time = SrcData.update_time;

//    myXps.memo = SrcData.memo;
    myXps.xpsTracks.noteText = SrcData.memo;

    myXps.framerate = SrcData.framerate;

    myXps.trin = SrcData.trin;
    myXps.trout = SrcData.trout;

    /*
     * 読み取りデータを調べて得たキーメソッドとブランク位置を転記
     */
    for (var lyr = 0; lyr < SrcData.layers.length; lyr++) {
        var trackID=lyr+1;
        myXps.xpsTracks[trackID].blmtd = SrcData.layers[lyr].blmtd;
        myXps.xpsTracks[trackID].blpos = SrcData.layers[lyr].blpos;
        myXps.xpsTracks[trackID].lot = SrcData.layers[lyr].lot;
    }

    /*
     * TSXデータ走査第二パス(タイムライン取得)
     */

    /*
     * カウンタ初期化
     */
    SrcData.time = 0;//初期化
    var LayerTime = 0;
    SrcData.layerCount = 0;//初期化
    LayerCount = 0;
    var RepeatBuf = [];
    var repIdx = 0;
    /*
     * 本体データ読み取り
     */
    for (var line = 0; line < SrcData.length; line++) {

        if (SrcData[line].match(/^[\/eE].*$/)) {
            if (LayerCount != SrcData.layerCount) {
                LayerTime = 0;
                LayerCount++;
            }
            /*
             * 記述終了・継続時間加算リセット・レイヤ加算
             */
        } else {
            if (LayerCount == SrcData.layerCount) {
                if (RepeatBuf.length) {
                    RepeatBuf.length = 0;
                    repIdx = 0;
                }
                SrcData.layerCount++;
            }
            body_data = SrcData[line].replace(/^([^\#]*)(\-\-|\#).*$/, "$1");
            if (body_data.match(/^[1-9][0-9]*$/)) {
                if (RepeatBuf.length) {
                    RepeatBuf.length = 0;
                    repIdx = 0;
                }
                myXps.xpsTrcks[LayerCount + 1][LayerTime] = body_data;
            } else {
                if (body_data == "") {
                    if (RepeatBuf.length) {
                        myXps.xpsTrcks[LayerCount + 1][LayerTime] = RepeatBuf[repIdx % RepeatBuf.length];
                        repIdx++;
                    } else {
                        myXps.xpsTrcks[LayerCount + 1][LayerTime] = body_data;
                    }
                } else {
                    RepeatBuf = TSX_expdList(body_data);
                    repIdx = 0;
                    myXps.xpsTrcks[LayerCount + 1][LayerTime] = RepeatBuf[repIdx];
                    repIdx++;
                }

            }
            LayerTime++;
            if (SrcData.time < LayerDuration) {
                SrcData.time = LayerDuration;
            }
        }

    }
    return myXps.toString();
}
//
