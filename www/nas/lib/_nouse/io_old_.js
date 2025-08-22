/**
 * @fileoverview りまぴん 入出力関連プロシージャ
 *
 * ウインドウの開閉コントロール
 * jQueryライブラリの使用に置き換えるので
 * ルーチンの見なおし
 * 2013.02.26
 */

/**
 * 起動時に各種パネルの初期化を行う。主にjquery-ui-dialog
 * aboutパネル
 */
function initPanels() {
    $("#optionPanelVer").dialog({
        autoOpen: false,
        modal: true,
        width: 480,
        title: "りまぴんについて"
    });
    $("#optionPanelPref").dialog({
        autoOpen: false,
        modal: true,
        width: 520,
        title: "各種設定"
    });
    $("#optionPanelScn").dialog({
        autoOpen: false,
        modal: true,
        width: 512,
        title: "新規タイムシート/タイムシート内容の編集"
    });

}


/**
 * sWitchPanel(引数)
 * パネル類の表示をコントローする
 * 引数="clear"または　なしの場合は、排他表示のパネル類を表示クリア（hide）して表示を初期化する
 *
 * 引数    JQobject    備考
 *
 * //排他表示
 * memo    #optionPanelMemo    //メモ編集（　排他）
 * Data    #optionPanelData    //Import/Export（　排他）
 * AEKey    #optionPanelAEK    //キー変換（　排他）
 * Scn    #optionPanelScn    //シーン設定(モーダル)
 * Pref    #optionPanelPref    //環境設定（モーダル）
 * Ver    #optionPanelVer    //about(モーダル)
 *
 * Dbg    #optionPanelDbg    //デバッグコンソール（　排他）
 * Prog    #optionPanelProg    //プログレスバー（使ってないけど…排他モーダルにする）
 * File    #optionPanelFile    //ファイルブラウザ（　排他）
 * //フローティングツール
 * Tbx    #optionPanelTbx    //ソフトウェアキーボード
 * //常時パネル（ユーザ指定）
 * menu    #pMenu    //ドロップダウンメニュー(共)
 * ToolBr    div#toolbarHeader    //ツールバー(共)
 * SheetHdr    div#sheetHeaderTable    //シートヘッダー(共)
 * memoArea        //ヘッダメモ欄複合オブジェクト
 * Utl    #optionPanelUtl    //ユーティリティーコマンドバー(共)排他から除外
 *
 * @param status
 */
function sWitchPanel(status) {
    /**
     * 一括クリアするパネルのリスト
     * @type {string[]}
     */
    var myPanels = ["#optionPanelMemo",
        "#optionPanelData",
        "#optionPanelAEK",
        "#optionPanelScn",
        "#optionPanelPref",
        "#optionPanelVer",
        "#optionPanelDbg",
        "#optionPanelProg",
        "#optionPanelFile",
        "#optionPanelSnd"
    ];
    /**
     * オールクリアは可能だが、ウインドウがフロートに移行するので使用範囲は限定される。
     * 一部のフロートパネルは一括消去対象外にする
     * "#optionPanelUtl",
     * "#optionPanelTbx",
     */
    if (status == "clear") {
        for (var idx = 0; idx < myPanels.length; idx++) {
//		if(document.getElementById("tbLock").checked && myPanels[idx]=="#optionPanelUtl"){continue;};
            $(myPanels[idx]).hide();
        }
        xUI.adjustSpacer();
        document.getElementById("iNputbOx").focus();
        return;
    }

    /**
     * jQueryオブジェクトを取得してターゲットにする
     * @type {*|jQuery|HTMLElement}
     */
    var myTarget = $("#optionPanel" + status);//jQ object
//if(! myTarget[0]){alert("noObject : #optionPanel"+status);return flase;};
    /**
     * ターゲットが存在しないことがあるがそれはヨシ？
     */
    switch (status) {
        /**
         * ダイアログ
         */
        case    "Ver":	//バージョンパネル
        case    "Pref":	//環境設定
        case    "Scn":	//ドキュメント設定
            var myStatus = (myTarget.is(':visible')) ? true : false;
            sWitchPanel("clear");
            if (myStatus) {
                myTarget.dialog("close")
            } else {
                myTarget.dialog("open")
            }
            break;
        /**
         * 割り込みパネル
         */
        case    "Data":	//データパネル
        case    "Dbg":	//デバッグパネル
        case    "Prog":	//プログレスパネル
        case    "Snd":	//音声編集パネル
        case    "File":	//ファイルブラウザ(まだデザインのみ)
            var myStatus = (myTarget.is(':visible')) ? true : false;
            sWitchPanel("clear");
            if (myStatus) {
                myTarget.hide()
            } else {
                myTarget.show()
            }
            break;
        case    "Tbx":	//ツールボックス
            if (myTarget.is(':visible')) {
                myTarget.hide()
            } else {
                myTarget.show()
            }
            break;
        case    "Utl":	//ユーティリテーメニューパネル
            if (!myTarget.is(':visible')) {
                myTarget.show();
            } else {
//		if(! document.getElementById("tbLock").checked){		}

                myTarget.hide();
            }
            break;
        case    "memo":	//memo edit start
            myTarget = $("#optionPanelMemo");//置き換え
            if (!myTarget.is(':visible')) {
                sWitchPanel("clear");
                if ((document.getElementById("myWords").innerHTML == "word table") && (myWords)) {
                    document.getElementById("myWords").innerHTML = putMyWords();
                }
                myTarget.show();
                document.getElementById("rEsult").value = XPS.memo;
            } else {
                XPS.memo = document.getElementById("rEsult").value;
                sync("memo");
                myTarget.hide();
            }
            break;
        case    "memoArea": //メモエリア切り替え
            if ($("#memo_header").is(":visible")) {
                $("#memo_header").hide();
                $("#memo").hide()
            } else {
                $("#memo_header").show();
                $("#memo").show()
            }
//		xUI.adjustSpacer();
            break;
        case    "AEKey":	//キー表示
            myTarget = $("#optionPanelAEK");//置き換え
            if (!myTarget.is(':visible')) {
                sWitchPanel("clear");
                //パネル初期化が必要
                //var myIdx=["blmtd","blpos","aeVersion"]//キーメッソド固定に変更されるので不要　,"keyMethod"
                //for (var idx=0;idx<myIdx.length;idx++){document.getElementById(myIdx[idx]).value=xUI[myIdx[idx]];}
                myTarget.show();
            } else {
                myTarget.hide();
            }
            break;
        case    "memu":	//ドロップダウンメニューバー　消す時に操作性が阻害されるケースがあるので警告を入れる
            if ($("#pMenu").is(":visible")) {
                if (appHost.platform != "AIR") {
                    if (confirm("ドロップダウンメニューを非表示にしてよろしいですか？")) {
                        $("#pMenu").hide();
                    } else {
                        break;
                    }
                } else {
                    $("#pMenu").hide();
                }
            } else {
                $("#pMenu").show()
            }
//	xUI.adjustSpacer();
            break;
        case    "ToolBr":	//固定ツールバー
            if ($("#toolbarHeader").is(":visible")) {
                $("#toolbarHeader").hide()
            } else {
                $("#toolbarHeader").show()
            }
//	xUI.adjustSpacer();
            break;
        case    "SheetHdr": //固定UIシートヘッダ
            if ($("#sheetHeaderTable").is(":visible")) {
                $("#sheetHeaderTable").hide()
            } else {
                $("#sheetHeaderTable").show()
            }
//	xUI.adjustSpacer();
            break;

//case	"clear":	break;//表示クリアは、最初に分岐してパラメータを見ない仕様に変更
        default:	//	デフォルトアクションはクリアと同値
            for (var idx = 0; idx < myPanels.length; idx++) {
//		if(document.getElementById("tbLock").checked && myPanels[idx]=="#optionPanelUtl"){continue;};
                $(myPanels[idx]).hide();
            }
    }
    xUI.adjustSpacer();
    document.getElementById("iNputbOx").focus();
}
/**
 * メモ欄用単語セレクタ
 * @returns {string}
 */
function putMyWords() {
    var myResult = "<table>";
    for (var idx = 0; idx < myWords.length; idx++) {
        myResult += "\n<td>";
        for (var idxw = 0; idxw < myWords[idx].length; idxw++) {
            myResult += "<input type=button class=toolTip value=\"" + myWords[idx][idxw] + "\"><br>";
        }
        myResult += "\n</td>";
    }
    myResult += "\n</table>";
    return myResult;
}
/**
 * @param e
 */
editMemo = function (e) {
    var myTarget = e.target;
    document.getElementById("rEsult").insert(myTarget.value);
};
/**
 * @param n
 */
function writeAEKey(n) {
    if (!n) {
        n = xUI.Select[0];
    }
//	previewN=document.getElementById("AEKrEsult").previewN;
    /**
     * リザルトエリアが表示されていない場合表示させる。
     */
    if (!$("#optionPanelAEK").is(':visible')) {
        sWitchPanel("AEKey");
    }
    /*
     if(document.getElementById("optionPanelAEK").style.display!="inline"){
     alert(document.getElementById("optionPanelAEK").style.display);
     sWitchPanel("AEKey");
     };return;
     */
    document.getElementById("AEKrEsult").value = XPS2AEK(XPS, n - 1);
//		document.getElementById("AEKrEsult").value=XPS.mkAEKey(n-1);
//		document.getElementById("AEKrEsult").previewN=n;
    if (!Safari) {
        document.getElementById("AEKrEsult").focus();
    }
    /**
     * AIRだった場合はここでクリップボードへ転送
     */
    if ((isAIR) && (air.Clipboard)) {
        writeClipBoard(XPS2AEK(XPS, n - 1));
    } else {
        //alert("noClipBord");
    }
}


/**
 * @desc リスト展開プロシージャ
 */


/**
 * リスト展開エンジンは汎用性を持たせたいので、無理やりグローバルに置いてある。
 * 要注意
 */
var expd_repFlag = false;
/**
 * グローバルで宣言
 * @type {number}
 */
var expd_skipValue = 0;
/**
 * リスト展開はxUIのメソッドか?
 * @param ListStr
 * @param rcl
 * @returns {Array}
 */
function nas_expdList(ListStr, rcl) {
    if (!rcl) {
        rcl = false
    } else {
        rcl = true
    }
    var leastCount = (xUI.Selection[1]) ? xUI.Selection[1] : XPS.duration() - xUI.Select[1];
    if (!rcl) {
        expd_repFlag = false;
        expd_skipValue = xUI.spinValue - 1;
        //再帰呼び出し以外はスピン値で初期化
    }
    /**
     * (スキップ量はスピン-１)この値はグローバルの値を参照
     * @type {string}
     */
    var SepChar = "\.";
//	var SepChars=["\.","\ ","\,"];

    /**
     * 台詞レイヤの場合のみ、カギ括弧の中をすべてセパレートする
     * ダイアログトラックは固定ではなくなったので判定を変更
     * timulineTrackオブジェクトに置き換えるので　判定は該当トラックのプロパティを確認するのみになる
     */
    if ((xUI.Select[0] == 0) || (XPS.layers[xUI.Select[0] - 1].option == "dialog")) {
//	if (XPS.timelines[xUI.Select[0]].option=="dialog"){}//またはXPS.track().option
        if (ListStr.match(/「([^「]*)」?/)) ;
        if (ListStr.match(/「(.+)」?/)) {
//alert("Hit ："+ListStr.match(/^(.*「)([^」]*)(」?$)/));
            ListStr = d_break(ListStr.match(/^(.*「)([^」]*)(」?$)/));
            ListStr = ListStr.replace(/「/g, SepChar + "「" + SepChar);//開き括弧はセパレーション
        }
        ListStr = ListStr.replace(/\」/g, "---");//閉じ括弧は横棒
        ListStr = ListStr.replace(/\、/g, "・");//読点中黒
        ListStr = ListStr.replace(/\。/g, "");//句点空白(null)
        ListStr = ListStr.replace(/\ー/g, "｜");//音引き縦棒
    }
    /**
     *  r導入リピートならば専用展開プロシージャへ渡してしまう
     */
    if (ListStr.match(/^([\+rR])(.*)$/)) {
        var expdList = TSX_expdList(ListStr);
        expd_repFlag = true;
    } else {

        /**
         * リスト文字列を走査してセパレータを置換
         * @type {void|XML|string}
         */
        ListStr = ListStr.replace(/[\,\x20]/g, SepChar);
        /**
         * スラッシュを一組で括弧と置換(代用括弧)
         * @type {XML|string}
         */
        ListStr = ListStr.replace(/\/(.*)(\/)/g, "\($1\)");//コメント引数注意
//		var PreX="/\(\.([1-9])/g";//括弧の前にセパレータを補う
        ListStr = ListStr.replace(/\(([^\.])/g, "\(\.$1");
//		var PostX="/[0-9](\)[1-9])/";//括弧の後にセパレータを補う
        ListStr = ListStr.replace(/([^\.])(\)[1-9]?)/g, "$1\.$2");

        /**
         * 前処理終わり
         * リストをセパレータで分割して配列に
         * @type {Array}
         */
        var srcList = [];
        srcList = ListStr.toString().split(SepChar);

//	if (xUI.Select[0]==0){
//	} else {}

        /**
         * 生成データ配列を作成
         * @type {Array}
         */
        var expdList = [];

        /**
         * 括弧展開深度/初期値0
         * @type {number}
         */
        var sDepth = 0;
        var StartCt = 0;
        var EndCt = 0;
//rT=0;
        /**
         * 元配列を走査
         * @type {number}
         */
        var ct = 0;//ローカルスコープにするために宣言する
        for (ct = 0; ct < srcList.length; ct++) {
            tcn = srcList[ct];

            /**
             * トークンが開きカギ括弧の場合リザルトに積まないで
             * リザルトのおしまいの要素を横棒にする。
             */
//	if (tcn.match(/^[「」]$/)) {y_bar();continue;}
            if (tcn == "「") {
                y_bar();
                continue;
            }

            /**
             * トークンがコントロールワードならば値はリザルトに積まない
             * 変数に展開してループ再開
             */
            if (tcn.match(/^s([1-9][0-9]*)$/)) {
//		if(RegExp.$1*1>0) {xUI.spin(RegExp.$1*1)}else{xUI.spin(1)};
                expd_skipValue = (RegExp.$1 * 1 > 0) ? (RegExp.$1 * 1 - 1) : 0;
                continue;
            }
//			グローバル
            /**
             * トークンが開き括弧ならばデプスを加算して保留
             */
            if (tcn.match(/^(\(|\/)$/)) {
                sDepth = 1;
                StartCt = ct;
                /**
                 * トークンを積まないで閉じ括弧を走査
                 * @type {number}
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
                        /**
                         * 最初の括弧が閉じたので括弧の繰り返し分を取得/ループ
                         * @type {number}
                         */
                        var rT = RegExp.$2 * 1;
                        if (rT < 1) {
                            rT = 1
                        }
                        if (RegExp.$2 == "") {
                            expd_repFlag = true;
                        }
                        var ct3 = 0;//ローカルスコープにするために宣言する
                        for (ct3 = 1; ct3 <= rT; ct3++) {
                            if ((StartCt + 1) != EndCt) {
//alert("DPS= "+sDepth+" :start= "+StartCt+"  ;end= "+EndCt +"\n"+ srcList.slice(StartCt+1,EndCt).join(SepChar)+"\n\n-- "+rT);
                                expdList = expdList.concat(nas_expdList(srcList.slice(StartCt + 1, EndCt).join(SepChar), "Rcall"));
                                /**
                                 * 括弧の中身を自分自身に渡して展開させる
                                 * 展開配列が規定処理範囲を超過していたら処理終了
                                 */
                                if (expdList.length >= leastCount) {
                                    return expdList
                                }
                            }
                        }
                        ct = EndCt;
                        break;
                    }//if block end
                }//ct2 loop end
                if (rT == 0) {
                    expdList.push(srcList[ct]);
                    s_kip();//ct++;
                }
            } else {
                /**
                 * トークンが展開可能なら展開して生成データに積む
                 */
                if (tcn.match(/^([1-9]{1}[0-9]*)\-([1-9]{1}[0-9]*)$/)) {
                    var stV = Math.round(RegExp.$1 * 1);
                    var edV = Math.round(RegExp.$2 * 1);
                    if (stV <= edV) {
                        for (tcv = stV; tcv <= edV; tcv++) {
                            expdList.push(tcv);
                            s_kip();
                        }
                    } else {
                        for (tcv = stV; tcv >= edV; tcv--) {
                            expdList.push(tcv);
                            s_kip();
                        }
                    }
                } else {
                    expdList.push(tcn);
                    s_kip();
                }

            }
        }
    }
    /**
     * 生成配列にスキップを挿入
     */
    function s_kip() {
//for (x=0;x<(xUI.spinValue-1);x++){expdList.push('');}
        for (x = 0; x < expd_skipValue; x++) {
            expdList.push('');
        }
    }

    /**
     * 配列の末尾を横棒に
     */
    function y_bar() {
        expdList.pop();
        expdList.push('---');
    }

    /**
     * かぎ括弧の中身をセパレーション
     * @param dList
     * @returns {*}
     */
    function d_break(dList) {
        wLists = dList.toString().split(",");
        return wLists[1] + wLists[2].replace(/(.)/g, "$1\.") + wLists[3];
    }

    /**
     * カエス
     */
    if (expdList.length < leastCount && expd_repFlag) {
        blockCount = expdList.length;
//			alert(blockCount + " / " +leastCount);
        for (resultCt = 0; resultCt <= (leastCount - blockCount); resultCt++) {
            expdList.push(expdList[resultCt % blockCount]);
        }
    }
    return expdList;

}
/**
 * XPS オブジェクトから 保存用ファイルに変換
 * メソッドか?それとも関数か?
 * 2005/03/04
 * 本体を    XPS.toString() に書き換えて、元の関数はラッパとして残しました。
 * 2005/12.19
 *
 * @param obj
 * @returns {*}
 */
function writeXPS(obj) {
    if (!nas.isAdobe) {
        if (true) {
            xUI.setStored("current");
            sync();
        }//書き出すのでフラグリセット(ブラウザのみ)
        _w = window.open("", "xpsFile", "width=480,height=360,scrollbars=yes,menubar=yes");

        _w.document.open("text/plain");
        if (!MSIE && !Firefox)_w.document.write("<html><body><pre>");
        _w.document.write(obj.toString());
        if (!MSIE && !Firefox)_w.document.write("</pre></body></html>");
        _w.document.close();
        _w.window.focus();//書き直したらフォーカス入れておく

        return false;//リンクのアクションを抑制するためにfalseを返す
    } else {
        return obj.toString();
    }
}

/**
 * XPSデータを印刷および閲覧用htmlに変換
 * このファイルは現在のところ読み込み不能なのでご注意
 * @param mode
 * @returns {*}
 */
function printHTML(mode) {
    /**
     * モードあり true時はボディをそのままリザルトするがfalseの際は別ウィンドウを開いて書き出す
     */
    if (mode) {
        mode = true
    }

    /**
     * @type {string}
     */
    var myBody = "";
    myBody += '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd"><html xmlns="http://www.w3.org/1999/xhtml" xml:lang="ja" lang="ja">';
    myBody += '<head><meta http-equiv="Content-Type" content="text/html; charset=UTF-8"><title>';
    myBody += XPS.scene.toString() + XPS.cut.toString();
    myBody += '</title><link REL=stylesheet TYPE="text/css" HREF="http://www.nekomataya.info/test/remaping/template/printout.css">';
//myBody+='</title><link REL=stylesheet TYPE="text/css" HREF="./template/printout.css">';
    myBody += '<style type="text/css"> * { margin: 0; padding: 0;} #fixed {position: fixed;} #sheet_view {  margin:0; }</style></head><body><div id="sheet_body">';

    for (Page = 1; Page <= Math.ceil(XPS.duration() / xUI.PageLength); Page++) {
        myBody += xUI.headerView(Page);
        myBody += ' <span class=pgNm>( p ' + nas.Zf(Page, 3) + ' )</span><br>';
        myBody += xUI.pageView(Page);
    }
//myBody+='<div class="screenSpace"></div>';


    myBody += '</div></body></html>';

    if (mode) {
        return myBody;
    } else {
        _w = window.open("", "xpsFile", "width=480,height=360,scrollbars=yes,menubar=yes");

        _w.document.open("text/html");
        _w.document.write(myBody);
        _w.document.close();

        _w.window.focus();//書き直したらフォーカス入れておく 保存扱いにはしない
        return false;//リンクのアクションを抑制するためにfalseを返す
    }

}
/**
 * @desc File API を使用したデータの読み込み（ブラウザでローカルファイルを読む）
 *
 * File API　は、Chrome Firefoxではローカルファイルの読み出し可能だが、
 * IE,Safari等他の環境では、情報取得のみ可能
 * File.nameは、ブラウザではパスを含まないファイル名（＋拡張子）のみ。
 * ただし、AIR環境ではフルパスのローカルFSパスが戻る。
 * 同じI.FをAIR環境でも使用するために、ケース分岐する。
 */
window.addEventListener('DOMContentLoaded', function () {
    /**
     * ファイルが指定されたタイミングで、その内容を表示
     */
    document.getElementById("myCurrentFile").addEventListener('change', function (e) {
        if (isAIR) {
            /**
             * File APIを利用できるかをチェック
             */
            if (window.File) {
                /**
                 * 指定されたファイルを取得
                 * @type {*}
                 */
                var input = document.getElementById('myCurrentFile').files[0];
                fileBox.currentFile = new air.File(input.name);
                xUI.data_well.value = fileBox.readContent();
                /**
                 * フラグを判定してチェックがあれば、そのまま読み込んで入出力パネルを閉じる。
                 */
                if (document.getElementById("loadShortcut").value != "false") {
                    var myAction = document.getElementById("loadShortcut").value;
                    switch (myAction) {
                        case "body":
                            if (XPS.readIN(xUI.data_well.value)) {
                                xUI.init(XPS);
                                nas_Rmp_Init();
                                sWitchPanel("clear");
                            } else {
                                alert("reading-Body : " + xUI.errorMsg[xUI.errorCode])
                            }
                            break;
                        case "ref":
                            var myStream = convertXps(xUI.data_well.value);
                            if (xUI.referenceXPS.readIN(myStream)) {
                                nas_Rmp_Init();
                                sWitchPanel("clear");
                            } else {
                                alert("reading-Ref : " + xUI.errorMsg[xUI.errorCode])
                            }
                            break;
                    }
                    document.getElementById("loadShortcut").value = "false";
                }
            }
        } else {
            /**
             * File APIを利用できるかをチェック
             */
            if (window.File) {
                /**
                 * 指定されたファイルを取得
                 * @type {*}
                 */
                var input = document.getElementById('myCurrentFile').files[0];
                var myEncode = (input.name.match(/\.(ard|csv|tsh)$/)) ? "Shift-JIS" : "UTF-8";
                if (window.FileReader) {
//if(false){}
                    /**
                     * ファイルリーダーオブジェクト初期化(Chrome/Firefoxのみ)
                     */
                    var reader = new FileReader();
                    /**
                     * ファイルの読み込みに成功したら、その内容をxUI.data_wellに反映（2）
                     */
                    reader.addEventListener('load', function (e) {
                        var output = reader.result;
                        xUI.data_well.value = output;
                        /**
                         * フラグを判定してチェックがあれば、そのまま読み込んで入出力パネルを閉じる。
                         */
                        if (document.getElementById("loadShortcut").value != "false") {
                            var myAction = document.getElementById("loadShortcut").value;
                            switch (myAction) {
                                case "body":
                                    if (XPS.readIN(xUI.data_well.value)) {
                                        xUI.init(XPS);
                                        nas_Rmp_Init();
                                        sWitchPanel("clear");
                                    } else {
                                        alert("reading-Body : " + xUI.errorMsg[XPS.errorCode])
                                    }
                                    break;
                                case "ref":
                                    if (xUI.referenceXPS.readIN(convertXps(xUI.data_well.value))) {
                                        nas_Rmp_Init();
                                        sWitchPanel("clear");
                                    } else {
                                        alert("reading-Ref : " + xUI.errorMsg[xUI.errorCode])
                                    }
                                    break;
                            }
                            document.getElementById("loadShortcut").value = "false";
                        }
                    }, true);
                    /**
                     * ファイルの内容をテキストとして取得（3）
                     */
                    reader.readAsText(input, myEncode);
                } else {
                    /**
                     * FileReaderが無いブラウザ(Safari等)では、お詫びしてオシマイ
                     */
                    alert(nas.localize({
                        en: "no FileReader! :\nThis browser does not support the FileReader object. \n Unfortunately, you can't read local files now.",
                        ja: "no FileReader! :\n　このブラウザはFileReaderオブジェクトをサポートしていません。\n残念ですが、この環境ではローカルファイルは読みだし出来ません。"
                    }));
                }
            }
        }
    }, true);//myCrrentFile.addEvent
});//window.addEvent


/**
 * @desc テンプレートを利用したeps出力
 * テンプレートは、サーバ側で管理したほうが良いのだけど　一考
 *
 * XPSから出力に必要な本体データを切り出し、1ページづつepsエンコードして返す
 * 引数は整数　ページナンバー 1から開始
 * 引数が0 又は引数なしは全ページリザルト
 * ページが存在しない場合は空データを返す
 *
 * @param myPage
 * @returns {*}
 */
getBodyData = function (myPage) {

    var startCount = 0;
    var endCount = XPS.duration();
    if ((myPage > 0 ) && (myPage <= Math.ceil(XPS.duration() / xUI.PageLength))) {
        startCount = (myPage - 1) * xUI.PageLength;
        endCount = (endCount > (startCount + xUI.PageLength)) ? startCount + xUI.PageLength : endCount;
    } else {
        if (myPage > Math.ceil(XPS.duration() / xUI.PageLength))return "";
    }
    var myBody = [];
    for (var frm = startCount; frm < endCount; frm++) {
        for (var col = 0; col < (XPS.xpsBody.length); col++) {
            myBody.push("\(" + EncodePS2(XPS.xpsBody[col][frm]) + ")");
        }
    }
    return myBody.join(" ");
};
/**
 * @desc リファレンスXpsから出力に必要なデータを切り出し、epsエンコードして返す
 *
 * 横幅はリファレンスデータそのまま（コメント省略）
 * 継続時間が本体データを越えた部分をカットする（返すべきかも？）
 * 引数はページナンバー　1から開始
 * 引数が0　又は無ければ全ページを返す
 * ページが存在しない場合は空データを返す
 *
 * @param myPage
 * @returns {*}
 */
getReferenceData = function (myPage) {
    var startCount = 0;
    var endCount = XPS.duration();
    if ((myPage > 0 ) && (myPage <= Math.ceil(XPS.duration() / xUI.PageLength))) {
        startCount = (myPage - 1) * xUI.PageLength;
        endCount = (endCount > (startCount + xUI.PageLength)) ? startCount + xUI.PageLength : endCount;
    } else {
        if (myPage > Math.ceil(XPS.duration() / xUI.PageLength))return "";
    }
    var myRef = [];
    for (var frm = startCount; frm < endCount; frm++) {
        for (var col = 1; col <= xUI.referenceXPS.layers.length; col++) {
            if (frm < xUI.referenceXPS.duration()) {
                myRef.push("\(" + EncodePS2(xUI.referenceXPS.xpsBody[col][frm]) + ")");
            }
        }
    }
    return myRef.join(" ");
};

/**
 * epsタイムシートに記載するデータを抽出してdata_wellの内容と置き換える
 * エンコード注意
 *
 * 追加プロパティ
 *
 * FrameRate	XPSから転記
 * PageRength	ｘUIから転記
 * PageColumns	xUIから転記
 * "camColumns"	現在固定　ただしカメラワーク指定可能になり次第xUIから転記
 *
 * Columns	XPSの値から計算
 * 各フォーマットごとに規定数あり
 * 規定数以下なら規定数を確保（読みやすいので）
 * 規定数をオーバーした際は段組変更を警告
 * A3 2段組　規定 6/3 最大8/4
 * A3 1段組　規定10/5 最大18/9
 *
 * トランジションの尺と注釈を転記してない！
 * MemoTextの前に挿入する　
 *
 * @todo この部分は epsExporter としてソース分離すべき
 *
 * @param myContent
 * @returns {boolean}
 */
var pushEps = function (myContent) {
    /**
     * テンプレート取得後に呼び出される。
     * @type {string}
     */
    myContent = decodeURI(myContent);
    /**
     * 置換え用データ生成
     * 置き換えのためのキャリアオブジェクトを作成してevalを避ける　13/06/22
     * @type {Array}
     */
    var sWap = [];
    /**
     * フレームレートのドロップ処理をしていない、ドロップ処置が済むまでは小数点以下のレートは扱わない
     * @type {string}
     */
    sWap.FileName = "";
    sWap.FrameRate = Number(XPS.framerate);
    if (sWap.FrameRate % 1 > 0) {
        return false;
    }
    sWap.PageLength = xUI.SheetLength;//１ページの秒数（フレーム数にあらず）
    sWap.PageColumns = xUI.PageCols;//シートの段組はxUIを複写
    sWap.ActionColumns = (xUI.referenceXPS.layers.length < 8) ? 8 : XPS.layers.length;

    sWap.DialogColumns = xUI.dialogSpan;//xUIのプロパティを作成するのでそれを参照

    sWap.Columns = (XPS.layers.length < SheetLayers) ? SheetLayers : XPS.layers.length;
    sWap.TimingColumns = xUI.timingSpan;//xUIのプロパティを参照
    sWap.camColumns = CompositColumns; //現在固定4を標準にしてオーバー分を追加
    /**
     * sWap.SpanOrder / Cam のビルド
     * @type {{still: string, dialog: string, timing: string, sfx: string, camera: string}}
     */
    spanWord = ({
        still: "StillCellWidth",
        dialog: "DialogCellWidth",
        timing: "CellWidth",
        sfx: "SfxCellWidth",
        camera: "CameraCellWidth"
    });

    var SO = [];
    for (var ix = 0; ix < sWap.Columns; ix++) {
        if (ix < xUI.timingSpan) {
            SO.push(spanWord[XPS.layers[ix + xUI.dialogSpan - 1].option]);
        } else {
            SO.push('CellWidth');
        }
    }
    sWap.SpanOrder = SO.join(" ");

    var SOC = [];
    for (var ix = 0; ix < sWap.camColumns; ix++) {
        if (ix < xUI.cameraSpan) {
            SOC.push(spanWord[XPS.layers[ix + xUI.dialogSpan + xUI.timingSpan - 1].option]);
        } else {
            SOC.push('CameraCellWidth');
        }
    }
    sWap.SpanOrderCam = SOC.join(" ");
    /**
     * トランジションテキストの組立
     * @type {string}
     */
    sWap.transitionText = "";

    if (XPS.trin[0] > 0) {
        sWap.transitionText += "△ " + XPS.trin[1] + '\(' + nas.Frm2FCT(XPS.trin[0], 3) + ')';
    }
    if ((XPS.trin[0] > 0) && (XPS.trout[0] > 0)) {
        sWap.transitionText += ' / ';
    }
    if (XPS.trout[0] > 0) {
        sWap.transitionText += "▼ " + XPS.trout[1] + '\(' + nas.Frm2FCT(XPS.trout[0], 3) + ')';
    }
    sWap.transitionText = EncodePS2(sWap.transitionText);

    sWap.timesheetDuration = XPS.duration();

    var ACL = [];
    for (var id = 0; id < 26; id++) {
        if (id < xUI.referenceXPS.layers.length) {
            ACL.push("\(" + EncodePS2(xUI.referenceXPS.layers[id].name) + ")")
        } else {
            ACL.push("\( )");
        }
    }
    sWap.ActionCellLabels = ACL.join(" ");//
    var CL = [];
    for (var id = 0; id < 26; id++) {
        if (id < xUI.timingSpan) {
            CL.push("\(" + EncodePS2(XPS.layers[id + xUI.dialogSpan - 1].name) + ")");
        } else {
            CL.push("\( )");
        }
    }
    sWap.CellLabels = CL.join(" ");

    var CCL = [];
    for (var id = 0; id < 26; id++) {
        if (id < xUI.cameraSpan) {
            CCL.push("\(" + EncodePS2(XPS.layers[id + xUI.timingSpan + xUI.dialogSpan - 1].name) + ")");
        } else {
            CCL.push("\( )");
        }
    }
    sWap.CameraCellLabels = CCL.join(" ");

    sWap.TitleString = EncodePS2(XPS.title);//
    sWap.Opus = EncodePS2(XPS.opus);//
    sWap.SceneCut = EncodePS2(XPS.scene + " " + XPS.cut);//
    sWap.DurationString = EncodePS2("\(" + nas.Frm2FCT(XPS.time(), 3) + ")");
    sWap.UserName = EncodePS2(XPS.create_user);//
    sWap.xpsRef = "";//getReferenceData();
    sWap.refLayers = xUI.referenceXPS.layers.length;
    sWap.xpsBody = "";//getBodyData();
    sWap.xpsLayers = XPS.xpsBody.length;
    var MT = XPS.memo.split("\n");

    var MTR = [];
    for (var id = 0; id < MT.length; id++) {
        MTR.push("\(" + EncodePS2(MT[id]) + ")")
    }
    sWap.memoText = MTR.join("\n");
    /**
     * @type {string[]}
     */
    var myDatas = ["FileName",
        "FrameRate",
        "PageLength",
        "PageColumns",
        "ActionColumns",
        "DialogColumns",
        "Columns",
        "TimingColumns",
        "camColumns",
        "timesheetDuration",
        "SpanOrder",
        "SpanOrderCam",
        "ActionCellLabels",
        "CellLabels",
        "CameraCellLabels",
        "TitleString",
        "Opus",
        "SceneCut",
        "DurationString",
        "UserName",
        "PageNumber",
        "PageCount",
        "xpsRef",
        "refLayers",
        "xpsBody",
        "xpsLayers",
        "transitionText",
        "memoText"
    ];

//	var myContent=document.getElementById("data_well").value;
    var epsBodys = [];
    var pages = Math.ceil(XPS.duration() / xUI.PageLength);//ページ長で割って切り上げ
    /**
     * １ページづつ変換してストア
     */
    for (var pageCount = 0; pageCount < pages; pageCount++) {

        if (pageCount > 0) {
            sWap.FileName = sWap.SceneCut + "_" + sWap.pageCount;
            sWap.memoText = " ";
            sWap.transitionText = "";
        } else {
            sWap.FileName = sWap.SceneCut;
        }

        sWap.PageNumber = ((pageCount + 1) == pages) ? "end / " + pages : (pageCount + 1) + " / " + pages;
        sWap.PageCount = pageCount + 1;

        sWap.xpsRef = getReferenceData(pageCount + 1);
        sWap.xpsBody = getBodyData(pageCount + 1);

        epsBodys[pageCount] = myContent;

        for (var count = 0; count < myDatas.length; count++) {
            var myRegex = new RegExp("==" + myDatas[count] + "==");
            var swapData = sWap[myDatas[count]];
            epsBodys[pageCount] = epsBodys[pageCount].replace(myRegex, swapData);
        }
    }
    /**
     * 置き換え終了したデータは、データウェルに流しこみ。かつチェックがあればダウンロードCGIに送る
     * @type {string}
     */
    document.getElementById("data_well").value = "";//クリア

    for (var pageCount = 0; pageCount < pages; pageCount++) {
        document.getElementById("data_well").value += epsBodys[pageCount];
        if (document.getElementById("exportCheck").checked) {
            switch (appHost.platform) {
                case "AIR":
                    var myCount = fileBox.storeOtherExtensionFile(epsBodys[pageCount], "epx");
                    /**
                     * このルーチンではページ毎の処理ができないのであまり良くない
                     * @todo SJIS可もできていないのでOUT callEchoPEpsに準じた処理が必要　CEP CSXも同様の処理が必要
                     * さらにローカル保存なのでロケーション指定を一箇所にして連番処理に
                     */
                    break;
                default:
                    var myCount = callEchoEps(epsBodys[pageCount], pageCount + 1);//ページカウントはオリジン0なので加算して送る
//		alert(pageCount+":"+myCount);
            }
        }
    }
};

/**
 * @param myTemplate
 */
function exportEps(myTemplate) {
    var url = "./template/blank.txt";
    switch (myTemplate) {
        case    "A3":
            url = "./template/timeSheet_epsA3.txt";
            break;
        default:
            url = "./template/timeSheet_eps.txt";
    }
    myAjax = jQuery.ajax({
        type: "GET",
        url: url,
        dataType: "text",
        success: pushEps
    });
}
//htmlUIなのでここじゃないんだけどパネル関連ということで暫定的にこちら

/**
 * 試験的にjQueryでフローティングウインドウ
 */
jQuery(function () {
    jQuery("a.openTbx").click(function () {
        jQuery("#optionPanelTbx").show();
        return false;
    });

    jQuery("#optionPanelTbx a.close").click(function () {
        jQuery("#optionPanelTbx").hide();
        return false;
    });
    jQuery("#optionPanelTbx a.minimize").click(function () {
        if (jQuery("#optionPanelTbx").height() > 100) {
            jQuery("#formTbx").hide();
            jQuery("#optionPanelTbx").height(24);
        } else {
            jQuery("#formTbx").show();
            jQuery("#optionPanelTbx").height(165);
        }
        return false;
    });
    jQuery("#optionPanelTbx dl dt").mousedown(function (e) {

        jQuery("#optionPanelTbx")
            .data("clickPointX", e.pageX - jQuery("#optionPanelTbx").offset().left)
            .data("clickPointY", e.pageY - jQuery("#optionPanelTbx").offset().top);

        jQuery(document).mousemove(function (e) {
            var myOffset = document.body.getBoundingClientRect();
            jQuery("#optionPanelTbx").css({
//                top:e.pageY  - jQuery("#optionPanelTbx").data("clickPointY")-document.getElementById("fixedHeader").clientHeight+myOffset.top+"px",
                top: e.pageY - jQuery("#optionPanelTbx").data("clickPointY") + myOffset.top + "px",
                left: e.pageX - jQuery("#optionPanelTbx").data("clickPointX") + myOffset.left + "px"
            })
        })

    }).mouseup(function () {
        jQuery(document).unbind("mousemove")

    })
});

/**
 * IE用コードとのこと　今回はもうIEは動作対象外なので勘弁
 * jQuery("#optionPanelTbx dl dt").mousedown(function(e){
 * jQuery("body").bind('selectstart', function(){
 * return false;
 * })
 * }).mouseup(function(){
 * jQuery("body").unbind('selectstart');
 * })
 */