/**
 *    @fileoverview
 *  セルシスのRetas!Pro　スタイロスの出力するCSVデータの入出力をサポートするライブラリ
 *  CLIP STUDIP PAINT(以下 CSPと略) CSV ファイルをサポートする
 */
'use strict';
/*=======================================*/
if((typeof window == 'undefined')&&(typeof app == 'undefined')){
    var nas = require('./xpsio');
};
/*    
 *    引き数は、CSVデータのテキストストリーム
 *    書式は限定的で、スタイロスまたはCLIP STUDIO PAINT （以下CSP）の書き出す形式に準じていなくてはならない。
 *    データフィールドは必ず二重引用符でくくる
 *    データフィールド内に改行は含まれていてはならない
 *    全てのレコードのフィールド数は一致していなくてなならない
 *    spcFolderはタイムシートに含まれるどのステージを変換するかのパラメータ （複数可）
 *    dialogFolderはタイムシートに含まれるどのステージをダイアログとして利用するか指定するパラメータ（複数可）
 *
 * CSP　のタイムシート出力は、スタイロスの形式を踏襲しているのでこのライブラリで処理する
 * スタイロスよりも、柔軟性の高い仕様だと思われるので、スタイロス型を包括する広い判定が必要そう…
 * レイヤフォルダ0は、スタイロスの場合は原画シートであるが、CSPの場合はレイヤセット配置に依存する
 * 必ずしも原画シートになるとは限らないため　要注意
 * ダイアログフォルダは存在するとは限らない
 * XPSと異なりセリフを別ステージとして扱う必要あり
 * 引数で明示的に指定された場合は、指定のフォルダを変換対象にする
 * spcFolderが指定されてかつdialogFolderが指定されない場合は、フォルダ名を検索してダイアログトラックを取得する
 * 発見できなかった場合は空白のダイアログトラックを１つ加える
 *
 * 引数が指定されない場合以下の手順で自動判定を行う
 *
 * フォルダ構成を判定する
 * 変換可能なフォルダ数及び各タイムライン数を取得
 * 指定のない場合または指定ファルダが存在しない場合　ドキュメント内にダイアログフォルダが存在するか否かを確認する
 * １個以上のセリフ用フォルダを認識した場合全てのセリフ用フォルダ内のタイムラインを一まとめに扱う
 * セリフ（音声）用のフォルダを認識＝フォルダ名が以下の場合
 * stageLabel.match(/(N\.|セリフ|せりふ|台詞|dialog|sound)/i);//変更可能性あり
 * これらはダイアログタイムライン群として優先解決する
 * セリフ用フォルダに、2つ以上のタイムラインが存在する場合は、本体テーブル冒頭に音声タイムラインとして変換を行う
 *
 * 変換対象フォルダが指定された場合は、指定フォルダ内のタイムラインを全て変換する
 * 指定のない場合または有効な指定がない場合は、構成中最も上のフォルダを変換対象にする
 *
 * 変換すべきタイムラインがない場合は、エラー終了
 * 継続時間は、変換側のcsvから取得
 *
 * フレームレートを取得する方法は提供されていないので、変換後に手作業で設定変更が必要かもしれない
 *
 * フォルダ名称（≒ステージ識別子）での指定も可能 2015 09 13
 * 関数呼び出し書式は
 *
 * StylosCSV2XPS(CSVStream[,spcFolder[,dialogFolder]])
 * 引数    CSVStream    :スタイロスまたはCPSの書き出すタイムシートをテキストストリームで与える
 * spcFolder    :省略可　読み込むフォルダをIDまたはフォルダ名で指定　複数指定の場合は配列で与える　省略時はいちばん上のフォルダ
 * dialogFolder    :省略可　台詞として読み込むフォルダをIDまたはフォルダ名で指定　複数指定の場合は配列で与える　省略時は自動判定
 *
 * 音声トラックを認識した場合　セルラベルで内容を初期化する機能を追加する　RETASとの整合性をチェックすること
 * 1枚画像でセルラベルがトラックラベルと一致した場合に置き換え用途のダミーと置き換える機能が必要
 */
/** 
 *    stylos CSVファイルをXPS互換テキストにコンバートする
 *  
 * @param {String}  CSVStream
 *      CSVソース文字列
 * @param {Array of String}  spcFolder
 *      変換対象　eg.'LO','原画','動画' ...etc<br>
 *      省略可　読み込むフォルダをIDまたはフォルダ名で指定<br>複数指定の場合は配列で与える<br>省略時はいちばん上のフォルダ
 * @param {String}  dialogFolder
 *      省略可　台詞として読み込むフォルダをIDまたはフォルダ名で指定<br>複数指定の場合は配列で与える<br>省略時は自動判定
 * @returns {String}
 *      nas.Xps互換ストリームデータ
 */
function StylosCSV2XPS(CSVStream, spcFolder, dialogFolder) {
    /*
     * データ冒頭のみチェックして明確に違うストリームの場合はエラーを返す
     */
    if (!CSVStream.match(/^\"Frame\",/)) {
        return false;
    }
    /*
     * CSVデータをオブジェクト化する
     */
    var myStylosCSV = {};
    /*
     * ラインで分割して配列に取り込み
     * ここではデータフィールドに改行は含まれないことを前提としているのでデータ形式に注意
     */
    myStylosCSV.SrcData = [];
    if (CSVStream.match(/\r/)) {
        CSVStream = CSVStream.replace(/\r\n?/g, ("\n"));
    }
    var CSVRecords = CSVStream.split("\n");
    /*
     * レコード数が3以下(=<2)の場合は、処理可能なフレームがないので不正データ
     */
    if (CSVRecords.length < 3) {
        return false
    }
    /*
     * 各ラインを更にテキストの配列に分解 空行のみのエントリを廃棄
     * フィールド数が異なるレコードが含まれていた場合は、不正データとみなす
     * 
     ここで簡易的にパースしているが、本式のcsvパーサがほしい
     ただし、スタイロス||クリップスタジオペイントのcsvは
     フィールド中に改行が含まれない
     各フィールドは必ずダブルクォーテーションで囲まれた　"エントリ文字列"型
     の　簡易形式なのでこのままでも可
     
     */
    var fieldCount = CSVRecords[0].split(",").length;
    for (var idx = 0; idx < CSVRecords.length; idx++) {
        if (CSVRecords[idx].length == 0) {
            continue;
        }
        myStylosCSV.SrcData.push(JSON.parse("["+CSVRecords[idx]+"]"));//レコードごとにJSON.parseで配列化する。
        if (myStylosCSV.SrcData[myStylosCSV.SrcData.length - 1].length != fieldCount) {
            return false;
        }
    }
    /*
     * 第一第二レコードをチェックしてフォルダ情報テーブルを作る
     * @type {Array}
     */
/*
    基本的には第一レコードにステージが指定されるものとみなすが、
    第一レコードが全て空文字列（ステージ指定なし）の場合に限り全体が動画ステージであるものとして扱う
    2018.01.14
*/
    myStylosCSV.folders = [];//ドキュメントレベルのフォルダ情報を格納する配列　各々ステージ扱い
    myStylosCSV.folders.push([]);//空配列で初期化　名前はなし
    myStylosCSV.folders[0].name = "";
    var currentStageIdx = 0;//ここの一時インデックスは、上位フォルダからの仮インデックス
    for (var fid = myStylosCSV.SrcData[0].length - 1; fid > 0; fid--) {
        myStylosCSV.folders[currentStageIdx].push(fid);
        if (myStylosCSV.SrcData[0][fid] != "") {
            myStylosCSV.folders[currentStageIdx].name = myStylosCSV.SrcData[0][fid];
            myStylosCSV.folders[currentStageIdx].reverse();
            if (fid > 1) {
                currentStageIdx++;//最後の一回分はエントリ追加不要
                myStylosCSV.folders.push([]);
                myStylosCSV.folders[currentStageIdx].name = "";
            }
        }
    }
    if(currentStageIdx == 0){
// ドキュメントルートにステージが得られなかったので動画ステージとして全体を反転して空のdialogトラックを挿入する
                myStylosCSV.folders[currentStageIdx].reverse();        
    }
    myStylosCSV.folders.reverse();

console.log(myStylosCSV)
    /*
     * ！！タイムシートの左端から（タイムライン下から/ ドキュメント下から）順のテーブルにするために反転！！
     * @type {number}
     */
    myStylosCSV.frameDuration = myStylosCSV.SrcData.length - 2;
    /*
     * フレーム継続数 全ライン数-(ヘッダ行,ラベル行)
     * 引数を処理
     * 変換対象テーブルを構築　フォルダラベルはステージ相当のため転記できないのでタイムラインのIDでスタックする
     * ダイアログタイムラインの数を控える
     */
    myStylosCSV.convertTable = [];
    myStylosCSV.dialogCount = 0;

    var dialogTarget = [];
    var timingTarget = [];

    if (typeof dialogFolder != "undefined") {
        if (!(dialogFolder instanceof Array)) {
            dialogFolder = [dialogFolder];
        }
        dialogLoop:    for (var ix = 0; ix < dialogFolder.length; ix++) {
            for (var fx = 0; fx < myStylosCSV.folders.length; fx++) {
                if (dialogFolder[ix] == myStylosCSV.folders[fx].name) {
                    //引数がラベル(文字列)の場合を優先する。ラベルの場合は完全一致が条件
                    dialogTarget.push(fx);
                    break dialogLoop;//ラベル文字列として一致したので処理を次のエントリへ
                } else {
                    //ラベルとして解決できなかったら、整数にパースしてインデックスで照合
                    if (parseInt(dialogFolder[ix]) == fx) {
                        dialogTarget.push(fx);
                        break dialogLoop;//整数で一致　次のエントリへ
                    }
                }
            }
        }
        /*
         * 最終的にターゲットが存在しなかった場合(エントリ数 0)は自動変換モードへ移行
         */
    }
    if (typeof spcFolder != "undefined") {
        if (!(spcFolder instanceof Array)) {
            spcFolder = [spcFolder];
        }
        timingLoop:    for (var ix = 0; ix < spcFolder.length; ix++) {
            for (var fx = 0; fx < myStylosCSV.folders.length; fx++) {
                if (spcFolder[ix] == myStylosCSV.folders[fx].name) {
                    /*
                     * 引数がラベル(文字列)の場合を優先する。ラベルの場合は完全一致が条件
                     */
                    timingTarget.push(fx);
                    break timingLoop;//ラベル文字列として一致したので処理を次のエントリへ
                } else {
                    /*
                     * ラベルとして解決できなかったら、整数にパースしてインデックスで照合
                     */
                    if (parseInt(spcFolder[ix]) == fx) {
                        timingTarget.push(fx);
                        break timingLoop;//整数で一致　次のエントリへ
                    }
                }
            }
        }
        /*
         * 最終的にターゲットが存在しなかった場合(エントリ数 0)は自動変換モードへ移行
         */
    }


    if (dialogTarget.length == 0) {
        var myDialogRegex = new RegExp("(N\\.?|セリフ|せりふ|台詞|dialog|sound|S\d+)", "i");
        /*
         * 指定がないので自動検索でテーブルを作る
         */
        for (var fidx = 0; fidx < myStylosCSV.folders.length; fidx++) {
            if (myStylosCSV.folders[fidx].name.match(myDialogRegex)) {
console.log(myStylosCSV.folders[fidx].name);
                for (var tidx = 0; tidx < myStylosCSV.folders[fidx].length; tidx++) {
                    myStylosCSV.convertTable.push(myStylosCSV.folders[fidx][tidx]);
                    myStylosCSV.dialogCount++;
                }
            }
        }
    } else {
        /*
         * この時点では引数チェックは処理済みフォルダ名で指定を行った場合はここでなく事前にフォルダID配列(dialogTarget)に変換
         */
        for (var fidx = 0; fidx < dialogTarget.length; fidx++) {
            var targetFolderIndex = dialogTarget[fidx];
            for (var tidx = 0; tidx < myStylosCSV.folders[targetFolderIndex].length; tidx++) {
                myStylosCSV.convertTable.push(myStylosCSV.folders[targetFolderIndex][tidx]);
                myStylosCSV.dialogCount++;
            }
        }
    }

    /*
     * フォルダIDまたはステージ名で指定されたエントリーをピックアップして加える
     */
    if (timingTarget.length == 0) {
        /*
         * 指定がないのでダイアログを除くタイムシート末尾のフォルダのタイムラインを取得
         */
        for (var fidx = myStylosCSV.folders.length - 1; fidx >= 0; fidx--) {
            if (myStylosCSV.folders[fidx].name.match(myDialogRegex)) {
                continue;
            }
            //skip
            for (var tidx = 0; tidx < myStylosCSV.folders[fidx].length; tidx++) {
                myStylosCSV.convertTable.push(myStylosCSV.folders[fidx][tidx]);
            }
            break;
        }
    } else {
        /*
         * 展開時点ではターゲットはフォルダIDの配列に変換済みであること
         */
        for (var fidx = 0; fidx < timingTarget.length; fidx++) {
            var targetFolderIndex = timingTarget[fidx];
            for (var tidx = 0; tidx < myStylosCSV.folders[targetFolderIndex].length; tidx++) {
                myStylosCSV.convertTable.push(myStylosCSV.folders[targetFolderIndex][tidx]);
            }
        }
    }

    /*
     * ラベル取得
     */
    myStylosCSV.layerLabel = [];//ラベル配列
    for (var idx = 0; idx < myStylosCSV.convertTable.length; idx++) {
        if ((myStylosCSV.dialogCount) && (idx == 0)) continue;
        myStylosCSV.layerLabel.push(myStylosCSV.SrcData[1][myStylosCSV.convertTable[idx]]);//ダイアログラベル取得
    }
    /*
     * セルシスcsvオブジェクトXPS互換ストリーム出力
     */
    myStylosCSV.toSrcString = function () {
//	var myLineFeed=nas.GUI.LineFeed;
        var myLineFeed = "\n";
        var resultStream = "nasTIME-SHEET 0.4";
        resultStream += myLineFeed;
        resultStream += "#RETAS!Stylos and CLIP STUDIO PAINT CSV";
        resultStream += myLineFeed;
        resultStream += "##TIME=" + nas.Frm2FCT(this.frameDuration, 3, 0);
        resultStream += myLineFeed;
        resultStream += "##TRIN=0+00.,\x22\x22";
        resultStream += myLineFeed;
        resultStream += "##TROUT=0+00.,\x22\x22";
        resultStream += myLineFeed;

        /*
         * タイムライン種別
         */
        resultStream += "[option\t";
        /*
         * データ状況によってはダイアログ用タイムラインが存在しないので、dialigCount==0の場合は、空のダミータイムラインを作成する
         */
        if (this.dialogCount == 0) {
            resultStream += "dialog\t";
        }
        for (var idx = 0; idx < this.dialogCount; idx++) {
            resultStream += "dialog\t";
        }
        for (var idx = 0; idx < (this.convertTable.length - this.dialogCount); idx++) {
            resultStream += "timing\t";
        }
        resultStream += "]";
        resultStream += myLineFeed;
        /*
         * ラベル配置
         */
        resultStream += "[CELL\tN\t";
        for (var idx = 0; idx < this.layerLabel.length; idx++) {
            resultStream += this.layerLabel[idx] + "\t";
        }
        resultStream += "]";
        resultStream += myLineFeed;

        for (var frm = 0; frm < this.frameDuration; frm++) {
            resultStream += "\t";//行頭のカラデータ

            if (this.dialogCount == 0) {
                resultStream += "\t";
            }
            /*
             * コンバートデータにダイアログが存在しない場合のダミー
             */
            if (false) {
                //タイムラインデータを転記
                for (var tlid = 0; tlid < this.convertTable.length; tlid++) {
                    resultStream += this.SrcData[frm + 2][this.convertTable[tlid]];
                    resultStream += "\t";
                }
            } else {
                //タイムラインデータを転記
                for (var tlid = 0; tlid < this.convertTable.length; tlid++) {

                    if (frm == 0) {
                        var currentValue = this.SrcData[frm + 2][this.convertTable[tlid]];
                    } else {
                        var currentValue = (this.SrcData[frm + 2][this.convertTable[tlid]] == this.SrcData[frm + 1][this.convertTable[tlid]]) ? "" : this.SrcData[frm + 2][this.convertTable[tlid]];
                    }
                    resultStream += (currentValue === 0) ? "X\t" : currentValue + "\t";
                }
            }
            resultStream += myLineFeed;

        }
        resultStream += "[END]";
        resultStream += myLineFeed;
        resultStream += "Converted from celsys CSV";
        return resultStream;
    };

    return myStylosCSV.toSrcString();
}

/**
 *  nas.Xpsからスタイロス形式のCSVストリームへ変換する
 *  @param {Object nas.Xps | String} myXPS
 *      ソースnas.Xpsオブジェクト　または　ストリーム
 *  @param {Object nas.Xps | String}    myReferenceXPS
 *      第二ソースオブジェクト　またはストリーム
 *  @returns {String}
 *      変換済みCsvデータ
 */
/* 引数はオブジェクトでも、ストリームでも受け付ける。
 * コンバートするXPSと必要な場合は参照用XPSを加えてスタイロスの書きだすCSVと同じ形式で書き出すことができる。
 * 文字コードのコンバートは特にしていないので、必要なら何か別のコンバート手段を利用してShift-JISに変換されたし。
 * このデータはスタイロスに書き戻せないので、りまぴんでの編集後に書き出す意味はあまりない。
 * 互換データが欲しい場合のみ有効
 */
function XPS2StylosCSV(myXPS, myReferenceXPS) {
    /*
     * 引数がソースであっても処理する。XPSでない場合はfalse
     */
    if (myXPS instanceof nas.Xps) {
        var sourceXPS = myXPS;
    } else {
        if ((myXPS instanceof String) && (myXPS.match(/^nasTIME-SHEET/))) {
            var sourceXPS = new nas.Xps();
            if (!sourceXPS.parseXps(myXPS)) {
                return false;
            }
        } else {
            return false;
        }
    }
    /*
     * リファレンスXPSがない場合は、カラで親サイズのカラオブジェクトを作る（親XPSのコピーのほうが良いか？）
     */
    if (myReferenceXPS instanceof nas.Xps) {
        var referenceXPS = myReferenceXPS;
    } else {
        if ((myReferenceXPS instanceof String) && (myReferenceXPS.match(/^nasTIME-SHEET/))) {
            var referenceXPS = new nas.Xps();
            if (!referenceXPS.readIN(myReferenceXPS)) {
                return false;
            }
        } else {
            var referenceXPS = new nas.Xps(sourceXPS.xpsTracks.length-2, sourceXPS.duration());//カラオブジェクト
        }
    }
    /*
     * リファレンスXPSのサイズが本体シートに満たない場合はサイズを拡張する
     */
    if (referenceXPS.duration() < sourceXPS.duration()) {
        referenceXPS.reInitBody(referenceXPS.xpsTracks.length, sourceXPS.duration());
    }
    /*
     * コンバートする
     */
    var myStylosCSV = [];
    myStylosCSV.frmCount    = 1;//フレームカウント用トラック
    myStylosCSV.refCount    = 0;//原画トラックカウント
    myStylosCSV.dialogCount = 0;//セリフトラックカウント
    myStylosCSV.bodyCount   = 0;//動画トラックカウント
//コンバート対象のトラックをカウントする リファレンスシートの置き換えトラック数＋対象シートのセリフ及び置き換えトラック数＋フレームカウントトラック
    for (var trks = 0; trks< sourceXPS.xpsTracks.length-1;trks ++){
        if (sourceXPS.xpsTracks[trks].option.match(/dialog|sound/i)){myStylosCSV.dialogCount++}
    }
    for (var trks = 0; trks< sourceXPS.xpsTracks.length-1;trks ++){
        if (sourceXPS.xpsTracks[trks].option.match(/timing|cell/i)){myStylosCSV.bodyCount++}
    }
    for (var trks = 0; trks< referenceXPS.xpsTracks.length-1;trks ++){
        if (referenceXPS.xpsTracks[trks].option.match(/timing|cell/i)){myStylosCSV.refCount++}
    }
//    myStylosCSV.recordCunt = (myXPS.xpsTracks.length - 2) * 2 + 2;//(トラック数×２＋フレームカウント＋セリフ)
    /*　ここは見直しが必要　タイミングトラックをそれぞれのnas.Xpsごとにカウントして処理するルーチンを書くこと　2016 10 23
        変更（2019.0514）
    */
    
    /*
     * 第一レコードを作る
     */
    var currentRecord = [];
    currentRecord.push('"Frame"');
    currentRecord.push('"原画"');
    for (var LC = 1; LC < myStylosCSV.refCount; LC++) {
        currentRecord.push('""');
    }
    currentRecord.push('"台詞"');
    for (var LC = 1; LC < myStylosCSV.dialogCount; LC++) {
        currentRecord.push('""');
    }
    currentRecord.push('"動画"');
    for (var LC = 1; LC < myStylosCSV.bodyCount; LC++) {
        currentRecord.push('""');
    }
    myStylosCSV.push(currentRecord.join(","));
    /*
     * 第二レコードを作る
     * @type {Array}
     */
    currentRecord = [];
    currentRecord.push('""');//フレームカウント
    for (var LC = 1; LC < referenceXPS.xpsTracks.length - 1; LC++) {
        if (referenceXPS.timeline(LC).option.match(/timing|cell/i)) {
            currentRecord.push('"' + referenceXPS.timeline(LC).id + '"');
        }
    }
//    currentRecord.push('""');//セリフトラック分
    for (var LC = 0; LC < sourceXPS.xpsTracks.length - 1; LC++) {
        if (sourceXPS.timeline(LC).option.match(/dialog|sound/i)) {
            currentRecord.push('"' + sourceXPS.timeline(LC).id + '"');
        }
    }
//    currentRecord.push('""');//本体トラック分
    for (var LC = 1; LC < sourceXPS.xpsTracks.length-1; LC++) {
        if (sourceXPS.timeline(LC).option.match(/timing|cell/i)) {
            currentRecord.push('"' + sourceXPS.timeline(LC).id + '"');
        }
    }
    myStylosCSV.push(currentRecord.join(","));

    /*
     *  ボディデータを流し込む
     *  メモ情報はコンバートできないので削除
     */
    for (var myFrame = 0; myFrame < myXPS.duration(); myFrame++) {
        currentRecord = [];
        currentRecord.push('"'+(myFrame + 1).toString(10)+'"');//フレームカウント
        for (var LC = 0; LC < referenceXPS.xpsTracks.length - 1; LC++) {
            if(referenceXPS.timeline(LC).option.match(/timing|cell/i)){
                currentRecord.push('"' + referenceXPS.timeline(LC)[myFrame] + '"');
            }
        }
        for (var LC = 0; LC < sourceXPS.xpsTracks.length - 1 ; LC++) {
            if(sourceXPS.timeline(LC).option.match(/dialog|sound/i)){
                currentRecord.push('"' + sourceXPS.timeline(LC)[myFrame] + '"');
            }
        }
        for (var LC = 0; LC < sourceXPS.xpsTracks.length - 1 ; LC++) {
            if(sourceXPS.timeline(LC).option.match(/timing|cell/i)){
                currentRecord.push('"' + sourceXPS.timeline(LC)[myFrame] + '"');
            }
        }
        myStylosCSV.push(currentRecord.join(","));
    }

    return myStylosCSV.join("\n");
}
/*
 * 暫定的にXPSストリーム（ソース）で返しているが、オブジェクトのままのほうが良いかもしれない。一考の余地あり？
 * この形式で各フォーマットのコンバータを作って一元化したいが、どうよ？
 * 逆変換も欲しいね。
 * CSPに準ずるために拡張が必要
 * りまぴん的にはステージを指定して一括変換を行うのが良さそう
 */
 /*=======================================*/
if((typeof window == 'undefined')&&(typeof app == 'undefined')){
    exports.StylosCSV2XPS = StylosCSV2XPS;
    exports.XPS2StylosCSV = XPS2StylosCSV;
}
/*  eg. for import
    const { StylosCSV2XPS , XPS2StylosCSV } = require('./lib_stylosCVS.js');

*/