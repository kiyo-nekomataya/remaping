
/**
 * @fileoverview nas ユーザ設定ファイル CSX|CEP|ESTK Adobe環境用
 */

/*
 * 新規作成時の標準値
 * 説明を読んでユーザが必要な値に書換することを想定
 * 一部の情報は、クッキーで保存可能
 *  2005/04/06
 *  2005/04/28    デバッグフラグ追加(そのうちなくなるかもね)
 *  2005/08/09    クッキー調整
 *  2005/08/25    cssに合わせて背景色を追加
 *  2005/09/01    クッキー内容追加
 *  2005/09/04    クッキー内容追加/修正
 *  2005/10/17    タイトル装飾追加
 *  2005/12/11    読み込み時データシフトスイッチの動作を変更
 *  2006/01/07レンダー乙女用に別ファイルを作成
 *  HTML依存部分・クッキー関連部分等は削除
 *  2021 0102   ライブラリ整理
 */
'use strict';
/**
 *  設定トレーラー
 */
    var config = {};
/**
 * デバッグモード
 * @type {boolean}
 */
    config.dbg = true;
/** @desc
 *    開始メッセージ
 *    お好きなメッセージに入れ替えできます。
 *    ただし開始メッセージが抑制されている場合は表示されません。
 * @type {string}
 */
    config.welcomeMsg  = "モジュール対応版 -test- 20210209";
    config.windowTitle = "ver. 2.0.0";//WindowTitleとしての役割は終了 統合バージョンです

/**
 * 作業オプション 主にデフォルト値 2.0以降にnas.pmdbと統合
 */
/**
 * タイトル 現行の作品を入れておくとラクです
 * @type {string}
 */
config.myTitle = "タイトル未定";

/**
 * サブタイトル 同上
 * @type {string}
 */
config.mySubTitle = "サブタイトル未定";
/**
 * 制作話数等
 * @type {string}
 */
config.myOpus = "00";
/**
 * 初期フレームレートを置いてください。フレーム毎秒
 * @type {number}
 * eg.  23.98 , 24 , 29.97 , 30
 */
config.myFrameRate = 29.97;
/**
 * カット尺初期値
 * @type {string}
 */
config.Sheet = "6+0";

/**
 * レイヤ数初期値
 * @type {number}
 */
config.SheetLayers = 5;

/**
 * A.Bパート等 空白でも良いでしょう。
 * @type {string}
 */
config.myScene = "";

/**
 * カット番号
 * @type {string}
 */
config.myCut = "C# ";


/**
 * 作業ユーザ名は環境確認で設定切り替え    *cookie[2]
 */
if (typeof app != "undefined") {
    config.myName = "unNameed";
} else {
    config.myName = (function () {
        config.myName = (Folder.desktop.parent.fsName).replace(/[\/\\]/g, ",").split(",");
        myName = myName[myName.length - 1];
        return myName
    })();
}

/**
 * NameCheckを有効にすると起動時に名前を入力するプロンプトがでます。
 * 名前は保存できます。
 * @type {boolean}
 */
config.NameCheck = true;


//////////////////////////////////////////////
/**
 * キー変換オプション    *cookie[3]
 */


/**
 * カラセル方式デフォルト値
 * "file",        カラセルファイル
 * "opacity",    不透明度で処理
 * "wipe",        ワイプで処理
 * "expression1"    エクスプレッションで処理
 * "expression2"    エクスプレッションで処理
 * @type {string}
 */
config.BlankMethod = "opacity";

/**
 * カラセル位置デフォルト値
 *    "build",    自動生成(現在無効)
 *    "first",    最初
 *    "end",        最後
 *    "none"        カラセルなし
 *
 * @type {string}
 */
config.BlankPosition = "end";


/**
 * AEバージョン 4.0 5.0
 * 現在 6.0 / 6.5 は非対応 こっそり対応開始
 * AE に下位互換性があるので5.0をつかってください
 * @type {string}
 */
config.AEVersion = "8.0";

/**
 * AEキータイプ
 *    "min"    キーの数が最少
 * (自分で停止にする必要がある)
 * "opt"    最適化
 * (変化点の前後にキーをつける)
 * "max"    最大
 * (すべてのフレームにキーをつける)
 * @type {string}
 */
config.KEYMethod = "min";

/**
 * AEキー取り込みの際0.5フレームのオフセットを自動でつける
 * true    つける(標準)
 * false    つけない
 * @type {boolean}
 */
config.TimeShift = true;

/**
 * フッテージのフレームレート
 * "auto"    コンポのフレームレートに合わせる
 * 数値    指定の数値にする
 * @type {string}
 */
config.FootageFramerate = "auto";

/**
 * コンポサイズが指定されていない場合の標準値
 * "横,縦,アスペクト"
 * UIオプション(乙女用)
 * @type {string}
 */
config.defaultSIZE = "640,480,1";

/**
 * カウンタタイプ
 * @type {number[]}
 */
config.Counter0 = [4, 0];

config.SheetLength = 6;
//タイムシート1枚の秒数
//	どう転んでも普通６秒シート。でも一応可変。
//	2列シートを使う時は偶数の秒数がおすすめ。

/**
 * 現在は　"en""ja"のみ　有効
 * @type {string}
 */
config.uiLocale = "en";

/*
 * この設定ファイルは、Javascriptのソースです。書き換えるときはご注意を
 * エラーが出た時のためにバックアップをお忘れ無く。
 */